import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

// templates/ carries four incompatible record shapes and no file said which
// was canonical (JUDGMENTS.md, GROUND_TRUTH FACT 12, 2026-09-12):
//   header        id/title/kind/status/updated-led (the majority)
//   spec-version  spec_version/kind/id-led (arena, turn, routing-proposal, structural-change-receipt)
//   coordinate    id/coordinate/attribution-led (the six q-space templates)
//   fragment      a partial record meant to be embedded (observation, collaboration-message, conversation-import-draft)
//   json-contract JSON with camelCase keys (art-brief.v1, question-proposal.v1)
// For an agent that is four parsers. This test does not migrate anything — a
// shape migration needs its own receipt — it makes the situation legible:
// every template declares its shape, templates/node.yawn ranks them and names
// the canonical one, and a new template cannot be added without saying what
// shape it is.

const SHAPES = new Set(["header", "spec-version", "coordinate", "fragment", "json-contract"]);
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const TPL = path.join(ROOT, "templates");

function registry(nodeText) {
  // record_shapes:
  //   canonical: header
  //   files:
  //     basic.yawn: header
  const block = nodeText.match(/^record_shapes:\s*\n([\s\S]*?)(?=^\S|\Z)/m)?.[1] ?? "";
  const canonical = block.match(/^\s+canonical:\s*(\S+)/m)?.[1];
  const files = new Map();
  for (const m of block.matchAll(/^\s{4}([A-Za-z0-9_.\-]+\.yawn):\s*(\S+)/gm)) files.set(m[1], m[2]);
  return { canonical, files };
}

test("templates/node.yawn ranks the record shapes and names one canonical", async () => {
  const { canonical, files } = registry(await readFile(path.join(TPL, "node.yawn"), "utf8"));
  assert.ok(SHAPES.has(canonical), `record_shapes.canonical must be one of ${[...SHAPES].join("|")}, got ${canonical}`);
  assert.ok(files.size > 0, "record_shapes.files must list every template");
  for (const [f, s] of files) assert.ok(SHAPES.has(s), `${f}: unknown shape ${s}`);
});

test("every template is registered and declares a matching record_shape", async () => {
  const { files } = registry(await readFile(path.join(TPL, "node.yawn"), "utf8"));
  const onDisk = (await readdir(TPL)).filter((f) => f.endsWith(".yawn") && f !== "node.yawn");
  const problems = [];
  for (const f of onDisk) {
    if (!files.has(f)) { problems.push(`${f}: not in templates/node.yawn record_shapes.files`); continue; }
    const text = await readFile(path.join(TPL, f), "utf8");
    const isJson = text.trimStart().startsWith("{");
    if (isJson) { if (files.get(f) !== "json-contract") problems.push(`${f}: is JSON but registered as ${files.get(f)}`); continue; }
    const declared = text.match(/^record_shape:\s*(\S+)/m)?.[1];
    if (!declared) problems.push(`${f}: missing record_shape:`);
    else if (declared !== files.get(f)) problems.push(`${f}: declares ${declared}, registry says ${files.get(f)}`);
  }
  for (const f of files.keys()) if (!onDisk.includes(f)) problems.push(`registry lists ${f} but it does not exist`);
  assert.deepEqual(problems, [], problems.join("\n"));
});
