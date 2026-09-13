// Every `proof:` block in a .yawn record must point at something that exists.
// Dependency-free on purpose. Fails closed on drift.
//
// Why this exists. A judgment inventory over the repository (JUDGMENTS.md,
// 2026-09-12) found 128 of 194 records carrying a proof: block, 75 of them
// sourced only to other .yawn files, and 14 whose proof covered a DIFFERENT
// claim than the one it sat under. The sharpest case: core/canonical-extension.yawn
// names a validator, a normalizer and tests under proof:, yet its canonical block
// also claims media_role: "human-readable protocol record" — and the validator
// only greps for .ion/.yon/.ywn. A proof that does not cover its own claim is
// worse than no proof: it launders an assertion into a fact.
//
// Two checks:
//   1. Every repository path named inside a proof: block resolves to a real file.
//      External paths (http, C:/) are unverifiable from this tree; they are
//      grandfathered BY FILE below so the ledger can only shrink, and are
//      reported, never silently passed.
//   2. Where a proof: block carries `covers:`, every key it names must exist as a
//      top-level key of the same record. `covers:` is the honest scope statement:
//      "this proof tests THESE claims, not the whole record."
import { readFile, readdir, access } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SKIP_DIRS = new Set(["node_modules", "build", "output", "backup", ".git"]);

// Files whose proof: blocks cite paths outside this repository (a private
// Windows filesystem). Snapshot 2026-09-12. Remove an entry when the record
// vendors its source into the tree or marks the claim unverified; add nothing.
const EXTERNAL_SOURCE_GRANDFATHER = new Set([
  "references/july-01-lock.yawn",
  "references/scientific-frame.yawn",
]);
const EXTERNAL_CEILING = 2;

const PATH_LIKE = /(?:^|[\s"'\[,(])((?:\.\.?\/)?(?:[A-Za-z0-9_.\-]+\/)+[A-Za-z0-9_.\-]+\.(?:yawn|json|mjs|js|ts|md|py|ps1|css|html|txt|cff))(?=$|[\s"'\],)])/g;
const EXTERNAL = /^(?:https?:\/\/|[A-Za-z]:[\\/]|file:)/;

async function walk(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    if (e.isDirectory()) { if (!SKIP_DIRS.has(e.name)) out.push(...(await walk(path.join(dir, e.name)))); }
    else if (e.name.endsWith(".yawn")) out.push(path.join(dir, e.name));
  }
  return out;
}

function proofBlock(text) {
  // top-level `proof:` through the next column-0 key (YAML-ish, no parser)
  const lines = text.split(/\r?\n/);
  const start = lines.findIndex((l) => /^proof:\s*$/.test(l) || /^proof:\s*\S/.test(l));
  if (start < 0) return null;
  const body = [lines[start]];
  for (let i = start + 1; i < lines.length; i++) {
    if (/^\S/.test(lines[i]) && !/^\s*#/.test(lines[i])) break;
    body.push(lines[i]);
  }
  return body.join("\n");
}

function topLevelKeys(text) {
  return new Set([...text.matchAll(/^([A-Za-z_][A-Za-z0-9_]*):/gm)].map((m) => m[1]));
}

function coversList(block) {
  const m = block.match(/^\s+covers:\s*(.*)$/m);
  if (!m) return null;
  const inline = m[1].trim();
  if (inline.startsWith("[")) return inline.slice(1, -1).split(",").map((s) => s.trim().replace(/^["']|["']$/g, "")).filter(Boolean);
  // block list under covers:
  const after = block.slice(block.indexOf(m[0]) + m[0].length);
  const items = [];
  for (const line of after.split("\n")) {
    const li = line.match(/^\s+-\s+["']?([A-Za-z_][A-Za-z0-9_.]*)["']?\s*$/);
    if (li) items.push(li[1]); else if (line.trim() && !/^\s+-/.test(line)) break;
  }
  return items;
}

const errors = [];
const externals = [];
let checked = 0, withCovers = 0;

for (const file of await walk(ROOT)) {
  const rel = path.relative(ROOT, file).split(path.sep).join("/");
  const text = await readFile(file, "utf8");
  if (text.trimStart().startsWith("{")) continue; // JSON-format record: schema-validated elsewhere
  const block = proofBlock(text);
  if (!block) continue;
  checked++;

  for (const m of block.matchAll(PATH_LIKE)) {
    const p = m[1];
    if (EXTERNAL.test(p)) continue;
    const abs = path.resolve(path.dirname(file), p.startsWith("./") || p.startsWith("../") ? p : path.join(ROOT, p));
    try { await access(abs); }
    catch { errors.push(`${rel}: proof cites missing path ${p}`); }
  }
  // external (unverifiable) sources
  for (const line of block.split("\n")) {
    const v = line.replace(/^\s*-\s*/, "").trim().replace(/^["']|["']$/g, "");
    if (/^[A-Za-z]:[\\/]/.test(v) || /^file:/.test(v)) {
      if (!EXTERNAL_SOURCE_GRANDFATHER.has(rel)) errors.push(`${rel}: proof cites a path outside the repository (${v.slice(0, 60)}…); vendor it, or mark the claim unverified`);
      else externals.push(`${rel}: ${v.slice(0, 70)}`);
    }
  }

  const covers = coversList(block);
  if (covers) {
    withCovers++;
    const keys = topLevelKeys(text);
    for (const k of covers) {
      const top = k.split(".")[0];
      if (!keys.has(top)) errors.push(`${rel}: proof.covers names "${k}" but the record has no top-level key "${top}"`);
    }
  }
}

if (EXTERNAL_SOURCE_GRANDFATHER.size > EXTERNAL_CEILING) errors.push(`external-source grandfather ledger may not grow beyond ${EXTERNAL_CEILING}`);
for (const g of EXTERNAL_SOURCE_GRANDFATHER) {
  const hit = externals.some((e) => e.startsWith(g + ":"));
  if (!hit) errors.push(`${g}: grandfathered for an external source it no longer cites — remove the entry`);
}

if (errors.length) { console.error(errors.join("\n")); process.exitCode = 1; }
else {
  console.log(`[proof-refs] ${checked} proof blocks resolve; ${withCovers} declare covers:; ${externals.length} grandfathered external source(s) reported, not passed:`);
  for (const e of externals) console.log(`  unverifiable: ${e}`);
}
