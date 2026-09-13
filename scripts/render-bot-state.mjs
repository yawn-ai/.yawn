// Render records/yawn.bot-state.yawn from the tree. Dependency-free on purpose.
//
// The bot's state must be something the records can show, not something the
// contracts promise. On 2026-09-12 every automation contract said "daily" while
// the newest ledger entry was 2026-07-04, and a header dropdown said "sleeping"
// with nothing behind it. This script derives the state from three sources it
// can actually read — the ledgers, the decision records, and the settled role —
// and writes them into one record with the source of each line named.
//
//   node scripts/render-bot-state.mjs          rewrite the record
//   node scripts/render-bot-state.mjs --check  fail if the committed record is stale
import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { seal } from "../lib/articulation-floor-v0.1.mjs";

// YAWN_ROOT lets a test point the renderer at a fixture tree; production runs read the repository.
const ROOT = process.env.YAWN_ROOT ? path.resolve(process.env.YAWN_ROOT) : path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "records", "yawn.bot-state.yawn");
const CHECK = process.argv.includes("--check");
const TODAY = process.env.YAWN_TODAY || new Date().toISOString().slice(0, 10);

const scalar = (text, key) => {
  const m = text.match(new RegExp(`^${key}:\\s*(.*)$`, "m"));
  if (!m) return undefined;
  let v = m[1].trim();
  if (v.startsWith('"') || v.startsWith("'")) v = v.slice(1, v.lastIndexOf(v[0]));
  else v = v.replace(/\s+#.*$/, "").trim();
  return v;
};
const folded = (text, key) => {
  // `key: >` followed by an indented paragraph
  const m = text.match(new RegExp(`^${key}:\\s*>-?\\s*\\n((?:[ \\t]+.*\\n?)+)`, "m"));
  return m ? m[1].split("\n").map((l) => l.trim()).filter(Boolean).join(" ") : scalar(text, key);
};
const q = (s) => `"${String(s ?? "").replace(/\s+/g, " ").trim().replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
const fold = (s, indent) => {
  const words = String(s ?? "").replace(/\s+/g, " ").trim().split(" ");
  const lines = []; let cur = "";
  for (const w of words) { if ((cur + " " + w).trim().length > 76) { lines.push(cur.trim()); cur = w; } else cur += " " + w; }
  if (cur.trim()) lines.push(cur.trim());
  return lines.map((l) => indent + l).join("\n");
};

// options and recommendation of a decision record: the candidates a surface offers
// beside the question. Names and descriptions only; cost, risk and proof stay in the record.
const optionsOf = (t) => {
  const m = t.match(/^options:\n([\s\S]*?)(?=^\S)/m);
  if (!m) return [];
  return m[1].split(/^  - name:\s*/m).slice(1).map((chunk) => {
    const name = chunk.split("\n")[0].trim();
    const foldedDesc = chunk.match(/^    description:\s*>-?\s*\n((?:\s{6}.*\n?)+)/m);
    const description = foldedDesc
      ? foldedDesc[1].split("\n").map((l) => l.trim()).filter(Boolean).join(" ")
      : (chunk.match(/^    description:\s*(.*)$/m)?.[1] ?? "").trim().replace(/^["']|["']$/g, "");
    return { name, description };
  });
};
const recommendationOf = (t) => {
  const block = (t.match(/^recommendation:\n([\s\S]*?)(?=^\S)/m)?.[1] ?? "").replace(/^\s{2}/gm, "");
  const confidence = Number(scalar(block, "confidence"));
  return { option_ref: scalar(block, "option_ref") ?? "", confidence: Number.isFinite(confidence) ? confidence : 0, reasoning: folded(block, "reasoning") ?? "" };
};
// The seal: the bot's prediction of Dave's answer, written before any surface renders the question.
// For a decision it is the record's attributed recommendation and its reasoning, hashed with
// lib/articulation-floor-v0.1.mjs so it cannot change after he answers (core/articulation-floor.yawn).
// blind is false: the question-first contract shows the recommendation beside the candidates.
const sealOf = (d) => d.recommended && d.options.some((o) => o.name === d.recommended)
  ? seal({ question: d.file, axis: d.axis ?? "unlabelled", predicted_answer: d.recommended, predicted_reason: d.reasoning || d.why, confidence: d.confidence,
      model: `${d.file} recommendation, attributed agent-on-behalf, authority none; no provider call`, t_sealed: `${d.updated}T00:00:00Z`, blind: false, source_refs: [d.file] })
  : null;
const sealYaml = (d, indent) => {
  const s = sealOf(d);
  if (!s) return `${indent.slice(0, -2)}null`;
  return [`${indent}question: ${s.question}`, `${indent}axis: ${s.axis}`, `${indent}predicted_answer: ${q(s.predicted_answer)}`, `${indent}predicted_reason: ${q(s.predicted_reason)}`,
    `${indent}confidence: ${s.confidence}`, `${indent}model: ${q(s.model)}`, `${indent}t_sealed: ${q(s.t_sealed)}`, `${indent}blind: false`, `${indent}source_refs: [${s.source_refs.join(", ")}]`, `${indent}hash: ${s.hash}`].join("\n");
};
const candidatesYaml = (d, indent) => d.options.length
  ? d.options.slice(0, 3).map((o) => `${indent}- name: ${o.name}\n${indent}  description: ${q(o.description)}\n${indent}  recommended: ${o.name === d.recommended ? "true" : "false"}`).join("\n")
  : `${indent.slice(0, -2)}[]`;

// 1. last observed run: newest timestamp in the bot ledgers
const LEDGERS = ["records/automation-log.yawn", "records/yawn.bot-log.yawn", "records/yawn.bot-verification-2026-07-01.yawn",
  "records/yawn.bot-pattern-ledger.yawn", "records/yawn.bot-private-pr-ledger.yawn", "records/yawn.bot-pr-notification-ledger.yawn"];
let lastRun = null, lastRunSource = null;
for (const rel of LEDGERS) {
  let t; try { t = await readFile(path.join(ROOT, rel), "utf8"); } catch { continue; }
  for (const m of t.matchAll(/^\s*-?\s*(?:timestamp|date|ran_at|when):\s*"?(\d{4}-\d{2}-\d{2})/gm)) {
    if (!lastRun || m[1] > lastRun) { lastRun = m[1]; lastRunSource = rel; }
  }
}

// 2. settled role from core/entity-and-coupling.yawn
const ec = await readFile(path.join(ROOT, "core", "entity-and-coupling.yawn"), "utf8");
const roleBlock = ec.match(/role_settled:\n([\s\S]*?)\n  runtime:/)?.[1] ?? "";
const roleWhat = scalar(roleBlock.replace(/^\s{6}/gm, ""), "what_am_i_to_be");
const roleWhy = folded(roleBlock.replace(/^\s{6}/gm, ""), "why");
const roleOn = scalar(roleBlock.replace(/^\s{6}/gm, ""), "settled_on");

// 3. decisions, ranked by the leverage stated in each record
const decDir = path.join(ROOT, "decisions");
const decs = [];
for (const f of (await readdir(decDir)).filter((f) => /^\d{3}-.*\.yawn$/.test(f)).sort()) {
  const t = await readFile(path.join(decDir, f), "utf8");
  const lev = scalar(t, "leverage");
  if (lev !== "held" && !Number.isFinite(Number(lev))) throw new Error(`decisions/${f}: leverage must be a number or "held", got ${JSON.stringify(lev)}`);
  decs.push({
    file: `decisions/${f}`, id: scalar(t, "id"), title: scalar(t, "title"),
    question: folded(t, "question"), why: folded(t, "why_it_matters"), leverage: lev === "held" ? null : Number(lev),
    split: scalar(t, "split"), axis: scalar(t, "axis"),
    status: scalar(t, "status") ?? "",
    options: optionsOf(t), recommended: recommendationOf(t).option_ref, confidence: recommendationOf(t).confidence, reasoning: recommendationOf(t).reasoning,
    updated: scalar(t, "updated") ?? TODAY,
    ratification: (t.match(/ratification_status:\s*(\S+)/) ?? [])[1] ?? "proposed",
    selected: scalar(t, "  selected_by") ?? "",
  });
}
// Open means: still proposed, nobody has filled choice.selected_by, and the record is
// not superseded, archived, or deleted. Ratifying a decision (fill choice:, mark it
// superseded) therefore drops it from the queue on the next render and --check.
const RETIRED = new Set(["superseded", "archived", "deleted"]);
const isOpen = (d) => d.ratification === "proposed" && d.selected === "" && !RETIRED.has(d.status);
const open = decs.filter((d) => isOpen(d) && d.leverage !== null).sort((a, b) => b.leverage - a.leverage);
const held = decs.filter((d) => d.leverage === null && isOpen(d));
const next = open[0];

const rec = `id: records/yawn.bot-state
title: "yawn.bot state"
kind: runtime-state
record_shape: header
status: active
authored_by: agent-on-behalf
authored_via: "scripts/render-bot-state.mjs, from the ledgers, decisions/, and core/entity-and-coupling.yawn; regenerate rather than edit"
updated: ${TODAY}
generated_by: scripts/render-bot-state.mjs

purpose: >
  One record a surface can read to show the bot's state truthfully. Every line
  names where it came from. The runtime repository (agents/yawn.bot.yawn
  identity.repository) vendors this record and pins its blob in its protocol
  lock; yawn.bot/dave and its chat view read that pinned copy to lead with
  next_question and to recall principal_role_settled; since yawn-ai/yawn.bot
  pull request 160 the header's State control reads loop_status, its reason,
  and observed_activity from this record and projects the next steps from the
  runtime's own loop transitions, and since pull request 161 each open
  decision opens in place with the candidates listed here, and each queued
  question carries the bot's sealed prediction of Dave's answer so the runtime
  can reveal it after he answers and measure the floor. A stale pin is the
  runtime's to bump by a reviewed change, not this record's to push.

runtime_ref: agents/yawn.bot.yawn
relationship: "yawn.bot/dave"
relationship_ref: core/entity-and-coupling.yawn

loop_status: awaiting_choice
loop_status_vocabulary: schemas/statuses.v1.schema.json#loopStatus
loop_status_reason: >
  ${open.length} decision records in decisions/ are proposed and none has a
  selected_by. The loop is at the choice step and the choice is Dave's. This is
  the protocol position; it says nothing about whether any scheduled automation
  is running.

observed_activity:
  last_observed_run: ${lastRun ?? "unknown"}
  observed_from: ${lastRunSource ?? "none"}
  as_of: ${TODAY}
  epistemic_status: observed
  note: >
    The newest timestamp in any bot ledger in this repository. The automation
    contracts under automation/ describe daily and hourly schedules; nothing in
    this tree shows a run after this date. Do not display "sleeping" or "active"
    from the contracts; display the last observed run and its age.

principal_role_settled:
  question_key: role
  answer: ${q(roleWhat)}
  why: >
${fold(roleWhy, "    ")}
  settled_on: ${roleOn}
  source: core/entity-and-coupling.yawn
  recall_rule: >
    When the role question resurfaces, answer from this record first — "last
    time we checked, what you are to be is ${roleWhat}, so that…" — and do not
    reopen it unless Dave corrects the answer. It has dropped from the top slot.

next_question:
  decision_ref: ${next?.file ?? "none"}
  title: ${q(next?.title)}
  question: >
${fold(next?.question, "    ")}
  why: >
${fold(next?.why, "    ")}
  leverage: ${next?.leverage ?? "n/a"}
  candidates:
${next ? candidatesYaml(next, "    ") : "    []"}
  candidates_rule: >
    The decision record's options, names and descriptions only, with the
    attributed recommendation marked; choosing one here is Dave's proposal
    until he fills choice: in the record. Cost, risk, and proof_needed stay in
    the record.
  seal:
${next ? sealYaml(next, "    ") : "    null"}
  seal_rule: >
    The bot's prediction of Dave's answer, sealed before this record renders:
    the decision's attributed recommendation and its reasoning, hashed with
    lib/articulation-floor-v0.1.mjs (core/articulation-floor.yawn) so it cannot
    change after he answers. blind is false because the question-first contract
    shows the recommendation beside the candidates; a hit here measures
    agreement with a visible recommendation, not a blind prediction. A surface
    reveals the seal after the answer and asks whether the sealed reason was the
    reason; no record closes without that check.
  leverage_formula: "judgments_resolved x split_weight(genuinely-split 1.0 | leaning 0.7 | lone-exception 0.4) x authored_conflict_bonus(both sides authored 1.5 | one side 1.2 | neither 1.0)"
  rule: >
    The highest-leverage proposed decision whose choice is still empty. A
    surface that opens on a new entry shows this one question. Rank is not
    importance, truth, obligation, or permission (core/inquiry-selection.yawn).

question_queue:
${open.slice(0, 12).map((d, i) => `  - rank: ${i + 1}\n    decision_ref: ${d.file}\n    leverage: ${d.leverage}\n    split: ${d.split}\n    question: ${q(d.question)}\n    why: ${q(d.why)}\n    candidates:\n${candidatesYaml(d, "      ")}\n    seal:\n${sealYaml(d, "      ")}`).join("\n")}

held:
${held.map((d) => `  - decision_ref: ${d.file}\n    reason: "held by core/canonical-extension.yawn creation_gate.on_ambiguity; not ranked"`).join("\n") || "  []"}

backlog:
  proposed: ${open.length}
  held: ${held.length}
  ratified: ${decs.filter((d) => !isOpen(d)).length}
  inventory_ref: JUDGMENTS.md

boundary:
  - "this record describes the bot; it is never a diagnosis of the person on the other side of the slash"
  - "a state shown from the contracts instead of the ledgers is a claim without proof"
  - "the bot cannot move this record past awaiting_choice; only a filled choice: in decisions/ can"

proof:
  covers:
    - observed_activity
    - next_question
    - question_queue
    - backlog
  condition: >
    node scripts/render-bot-state.mjs --check exits 0: the committed record
    equals what the ledgers, decisions/, and the settled role produce today;
    scripts/validate-articulation-floor-v0.1.mjs recomputes every seal hash
    and fails if a queued question has none.
  falsifier: >
    A surface shows a bot status this record does not carry, or next_question
    names a decision whose choice is already filled.
  status: contract-defined
`;

if (CHECK) {
  let cur = ""; try { cur = await readFile(OUT, "utf8"); } catch {}
  const norm = (s) => s.replace(/^updated: .*$/m, "").replace(/as_of: .*$/m, "");
  if (norm(cur) !== norm(rec)) { console.error("[bot-state] records/yawn.bot-state.yawn is stale; run: node scripts/render-bot-state.mjs"); process.exitCode = 1; }
  else console.log(`[bot-state] current: awaiting_choice, next ${next?.file ?? "none"}, last observed run ${lastRun}`);
} else {
  await writeFile(OUT, rec);
  console.log(`[bot-state] wrote ${path.relative(ROOT, OUT)}: ${open.length} open, ${held.length} held, next ${next?.file ?? "none"} (leverage ${next?.leverage}), last observed run ${lastRun} from ${lastRunSource}`);
}
