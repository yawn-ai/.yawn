import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtemp, mkdir, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

// The bot-state renderer decides what "open" means. A decision Dave has chosen (choice.selected_by
// filled, status superseded) must leave next_question and the queue; a held one is listed as held.
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const SCRIPT = path.join(ROOT, "scripts", "render-bot-state.mjs");

function decision(n, slug, { leverage, split = "leaning", status = "draft", selected = '""' }) {
  return `id: decisions/${n}-${slug}
title: "${slug}"
kind: decision-frame
status: ${status}
updated: 2026-09-13
split: ${split}
leverage: ${leverage}
leverage_formula: "fixture"

question: >
  Question ${slug}?

why_it_matters: >
  Because ${slug}.

target_condition:
  ratification_status: proposed

choice:
  selected_by: ${selected}
  option_ref: ""
  authority_ref: ""
`;
}

async function fixture(extra = {}) {
  const root = await mkdtemp(path.join(os.tmpdir(), "yawn-bot-state-"));
  await mkdir(path.join(root, "decisions"), { recursive: true });
  await mkdir(path.join(root, "core"), { recursive: true });
  await mkdir(path.join(root, "records"), { recursive: true });
  await writeFile(path.join(root, "decisions", "001-lower.yawn"), decision("001", "lower", { leverage: 10 }));
  await writeFile(path.join(root, "decisions", "002-chosen.yawn"), decision("002", "chosen", { leverage: 20, status: "superseded", selected: "Dave" }));
  await writeFile(path.join(root, "decisions", "003-higher.yawn"), decision("003", "higher", { leverage: 15 }));
  await writeFile(path.join(root, "decisions", "004-held.yawn"), decision("004", "held", { leverage: "held", split: "held" }));
  for (const [name, text] of Object.entries(extra)) await writeFile(path.join(root, "decisions", name), text);
  await writeFile(path.join(root, "core", "entity-and-coupling.yawn"), `entities:
  dave:
    role_settled:
      what_am_i_to_be: "steward of yawn.bot"
      why: >
        so that the fixture has a why.
      settled_on: 2026-09-12
  runtime:
    id: yawn.bot
`);
  await writeFile(path.join(root, "records", "automation-log.yawn"), "entries:\n  - timestamp: 2026-07-04\n");
  return root;
}

function render(root) {
  return spawnSync(process.execPath, [SCRIPT], { env: { ...process.env, YAWN_ROOT: root, YAWN_TODAY: "2026-09-13" }, encoding: "utf8" });
}

test("a chosen decision leaves the queue; the highest open one is next; held is listed", async () => {
  const root = await fixture();
  const run = render(root);
  assert.equal(run.status, 0, run.stderr);
  const out = await readFile(path.join(root, "records", "yawn.bot-state.yawn"), "utf8");
  assert.match(out, /^next_question:\n  decision_ref: decisions\/003-higher\.yawn$/m);
  assert.ok(!out.includes("decisions/002-chosen.yawn"), "the chosen decision must not appear in the queue");
  assert.match(out, /^  - decision_ref: decisions\/004-held\.yawn$/m);
  assert.match(out, /^  proposed: 2$/m);
  assert.match(out, /^  held: 1$/m);
  assert.match(out, /^  ratified: 1$/m);
  assert.match(out, /^  last_observed_run: 2026-07-04$/m);
  assert.match(out, /answer: "steward of yawn.bot"/);
  assert.equal(render(root).status, 0);
  assert.equal(spawnSync(process.execPath, [SCRIPT, "--check"], { env: { ...process.env, YAWN_ROOT: root }, encoding: "utf8" }).status, 0);
});

test("a decision whose leverage is neither a number nor held stops the render", async () => {
  const root = await fixture({ "005-broken.yawn": decision("005", "broken", { leverage: "abc" }) });
  const run = render(root);
  assert.notEqual(run.status, 0);
  assert.match(run.stderr, /005-broken\.yawn: leverage must be a number or "held"/);
});
