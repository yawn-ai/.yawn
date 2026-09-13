import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

// decisions/ is a ranked list of proposals. These checks make its stated rules real:
// leverage equals the printed formula inputs, numbering follows leverage, nothing is
// chosen until Dave fills choice:, a recommendation never carries authority, and every
// judgment id a record cites exists in the merge record (TAXONOMY.md) that owns the ids.
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const SPLIT_W = { "genuinely-split": 1, leaning: 0.7, "lone-exception": 0.4 };
const scalar = (t, k) => t.match(new RegExp(`^${k}:\\s*(.*)$`, "m"))?.[1]?.trim().replace(/\s+#.*$/, "").replace(/^["']|["']$/g, "");

async function records() {
  const dir = path.join(ROOT, "decisions");
  const files = (await readdir(dir)).filter((f) => /^\d{3}-.*\.yawn$/.test(f)).sort();
  return Promise.all(files.map(async (f) => ({ file: `decisions/${f}`, n: Number(f.slice(0, 3)), text: await readFile(path.join(dir, f), "utf8") })));
}

test("leverage equals its printed formula inputs and numbering follows leverage", async () => {
  const problems = [];
  let previous = Infinity;
  for (const { file, text } of await records()) {
    const lev = scalar(text, "leverage");
    const split = scalar(text, "split");
    if (lev === "held") { if (split !== "held") problems.push(`${file}: leverage held but split ${split}`); continue; }
    const m = scalar(text, "leverage_formula")?.match(/judgments_resolved\((\d+)\) x split_weight\(([\d.]+)\) x authored_conflict_bonus\(([\d.]+)\)/);
    if (!m) { problems.push(`${file}: leverage_formula does not print its inputs`); continue; }
    const [n, w, b] = [Number(m[1]), Number(m[2]), Number(m[3])];
    const expected = Math.round(n * w * b * 10) / 10;
    if (Number(lev) !== expected) problems.push(`${file}: leverage ${lev} but ${n} x ${w} x ${b} = ${expected}`);
    if (SPLIT_W[split] !== w) problems.push(`${file}: split ${split} but split_weight ${w}`);
    if (Number(lev) > previous) problems.push(`${file}: leverage ${lev} exceeds the record numbered before it (${previous})`);
    previous = Number(lev);
    const sample = (text.match(/^evidence_sample:\n((?:  - .*\n)*)/m)?.[1] ?? "").split("\n").filter(Boolean).length;
    if (sample > n) problems.push(`${file}: evidence_sample lists ${sample} ids but judgments_resolved is ${n}`);
  }
  assert.deepEqual(problems, [], problems.join("\n"));
});

test("nothing is chosen, and no recommendation carries authority", async () => {
  const problems = [];
  for (const { file, text } of await records()) {
    const status = scalar(text, "status");
    const ratification = text.match(/ratification_status:\s*(\S+)/)?.[1];
    const choice = text.match(/^choice:\n  selected_by: (.*)\n  option_ref: (.*)\n  authority_ref: (.*)$/m);
    if (!choice) { problems.push(`${file}: no choice block`); continue; }
    const filled = choice.slice(1).some((v) => v.trim() !== '""' && v.trim() !== "");
    if (status === "superseded") { if (!filled) problems.push(`${file}: superseded without a filled choice`); }
    else {
      if (ratification !== "proposed") problems.push(`${file}: ratification_status ${ratification} while status ${status}`);
      if (filled) problems.push(`${file}: choice filled while status ${status}; ratifying marks the record superseded`);
    }
    if (text.match(/^  authority:\s*(\S+)/m)?.[1] !== "none") problems.push(`${file}: recommendation.authority must be none`);
  }
  assert.deepEqual(problems, [], problems.join("\n"));
});

test("every judgment id a decision cites resolves in TAXONOMY.md", async () => {
  const taxonomy = await readFile(path.join(ROOT, "TAXONOMY.md"), "utf8");
  const known = new Set([...taxonomy.matchAll(/`(J\d{4})`/g)].map((m) => m[1]));
  assert.ok(known.size > 1000, `TAXONOMY.md should index the judgment ids, found ${known.size}`);
  const missing = [];
  for (const { file, text } of await records()) {
    for (const id of new Set([...text.matchAll(/\bJ\d{4}\b/g)].map((m) => m[0]))) if (!known.has(id)) missing.push(`${file}: ${id}`);
  }
  assert.deepEqual(missing, [], `ids cited under decisions/ that TAXONOMY.md does not index:\n${missing.join("\n")}`);
});
