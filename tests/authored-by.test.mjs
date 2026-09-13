import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

// The protocol is about attribution, and the tree could not attribute itself.
// Measured 2026-09-12: 100 of 194 .yawn files were last written by the git
// identity `yawn.ai <hi@yawn.ai>`, 93 by `Dave <hi@yawn.ai>`, 1 by `yawn.bot`.
// yawn.ai shares Dave's email, so it may be Dave under a project identity or
// an agent on his behalf, and nothing in the repository distinguishes them.
// 292 of 502 file-anchored STATED judgments in JUDGMENTS.md sit on files whose
// last writer is not Dave. "Written in this repository" therefore does not mean
// "written by Dave", and the difference matters most for exactly the records a
// reader would most want to attribute.
//
// `authored_by:` closes that gap going forward, one folder at a time. The enum
// names WHO IS ANSWERABLE for the content, not who typed it:
//   dave-human       Dave, as himself. Attributable to him.
//   agent-on-behalf  an AI agent or automation acting for Dave, under any
//                    identity (yawn.ai, a coding session, a bot module). Dave has
//                    not separately ratified the content. Name the agent in
//                    `authored_via:`.
//   yawn.bot         the runtime, speaking as itself.
//   unattributed     unknown. A valid value, so a record never has to guess.
// An `authored_by:` line does not make a record true; it says who answers for it.

const ENUM = new Set(["dave-human", "agent-on-behalf", "yawn.bot", "unattributed"]);

// Where the field is REQUIRED, not merely validated when present: proposals
// for Dave to ratify, Dave's mental models, and the bot's own state. Everything
// else is validated only if it carries the field, so history is not rewritten.
const REQUIRED_UNDER = ["decisions/", "dave/"];
const REQUIRED_FILES = new Set(["records/yawn.bot-state.yawn"]);

const SKIP_DIRS = new Set(["node_modules", "build", "output", "backup", ".git"]);
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

async function walkYawnFiles(dir) {
  const found = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) found.push(...(await walkYawnFiles(path.join(dir, entry.name))));
    } else if (entry.name.endsWith(".yawn")) {
      found.push(path.join(dir, entry.name));
    }
  }
  return found;
}

function scalar(text, key) {
  const m = text.match(new RegExp(`^${key}:\\s*(.*)$`, "m"));
  if (!m) return undefined;
  let v = m[1].trim();
  if (v.startsWith('"') || v.startsWith("'")) v = v.slice(1, v.lastIndexOf(v[0]));
  else v = v.replace(/\s+#.*$/, "").trim();
  return v;
}

test("authored_by: values stay inside the attribution enum wherever the field appears", async () => {
  const violations = [];
  for (const file of await walkYawnFiles(ROOT)) {
    const rel = path.relative(ROOT, file).split(path.sep).join("/");
    const text = await readFile(file, "utf8");
    if (text.trimStart().startsWith("{")) continue;
    const v = scalar(text, "authored_by");
    if (v !== undefined && !ENUM.has(v)) violations.push(`${rel}: "${v}"`);
    if (v === "agent-on-behalf" && !scalar(text, "authored_via")) violations.push(`${rel}: agent-on-behalf requires authored_via: naming the agent`);
  }
  assert.deepEqual(violations, [], `authored_by outside ${[...ENUM].join(" | ")}:\n${violations.join("\n")}`);
});

test("records that speak for Dave or as the bot must carry authored_by", async () => {
  const missing = [];
  for (const file of await walkYawnFiles(ROOT)) {
    const rel = path.relative(ROOT, file).split(path.sep).join("/");
    const required = REQUIRED_FILES.has(rel) || REQUIRED_UNDER.some((d) => rel.startsWith(d));
    if (!required) continue;
    const text = await readFile(file, "utf8");
    if (text.trimStart().startsWith("{")) continue;
    if (scalar(text, "authored_by") === undefined) missing.push(rel);
  }
  assert.deepEqual(missing, [], `authored_by: is required under ${REQUIRED_UNDER.join(", ")} and on ${[...REQUIRED_FILES].join(", ")}:\n${missing.join("\n")}`);
});

test("the templates teach the field", async () => {
  for (const t of ["templates/basic.yawn", "templates/node.yawn", "templates/decision.yawn", "templates/mental-model.yawn"]) {
    const text = await readFile(path.join(ROOT, t), "utf8");
    assert.match(text, /^authored_by:/m, `${t} must carry an authored_by: line`);
  }
});
