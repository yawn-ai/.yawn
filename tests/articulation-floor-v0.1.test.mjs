import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import test from "node:test";
import Ajv2020 from "ajv/dist/2020.js";
import {
  ANSWER_MATCH_SCORE,
  FLOOR_MIN_N,
  REASK_GAP_DAYS_DEFAULT,
  REASON_MATCH_SCORE,
  answer,
  computeFloor,
  drift,
  extractSealsFromYawn,
  readFloor,
  reaskEligible,
  scorePick,
  seal,
  sealHash,
  validateArticulationFloorSemantics,
  verifyAnswer,
  verifySeal,
  verifySealsInYawn,
} from "../lib/articulation-floor-v0.1.mjs";
import { buildArticulationFloorFixture } from "../scripts/generate-articulation-floor-v0.1.mjs";

// Articulation Floor 0.1 (core/articulation-floor.yawn): a seal is written before the question
// renders and cannot change after the answer; an answer closes only with the reason check; the
// floor is the rolling reason accuracy and its curve is the finding. These tests hold the four
// beats in that order and refuse the shortcuts: an answer before its seal, an edited seal, a
// record without beat 4, a pick that scores itself partial, a floor that does not replay.

const readJson = async (path) => JSON.parse(await readFile(new URL(`../${path}`, import.meta.url), "utf8"));
const readText = async (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");
const clone = (value) => structuredClone(value);
const fixture = await readJson("fixtures/articulation-floor.v0.1.json");

const utcDateTime = /^([0-9]{4})-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])T([01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9](?:\.[0-9]{1,3})?Z$/;
const strictDateTime = (value) => {
  const match = typeof value === "string" ? utcDateTime.exec(value) : null;
  if (match === null || !Number.isFinite(Date.parse(value))) return false;
  return Number(match[3]) <= new Date(Date.UTC(Number(match[1]), Number(match[2]), 0)).getUTCDate();
};
const ajv = new Ajv2020({ allErrors: true, strict: true, formats: { "date-time": strictDateTime } });
const validate = ajv.compile(await readJson("schemas/articulation-floor.v0.1.schema.json"));
const shapeErrors = () => ajv.errorsText(validate.errors, { separator: "\n" });

const aSeal = () => seal({ question: "question-packets/polanyi.yawn#levels", axis: "levels", predicted_answer: "no", predicted_reason: "the whole harnesses its parts", confidence: 0.75, model: "test", t_sealed: "2026-09-13T00:00:00Z", blind: true, source_refs: ["core/holarchy.yawn"] });
const closed = (s, overrides = {}) => answer(s, { answer: "no", mode: "pick", reason_match: "yes", t_answered: "2026-09-13T09:00:00Z", actor: "principal:test", ...overrides });

test("the fixture ledger validates by shape, by semantics, and by replay from its generator", () => {
  assert.equal(validate(fixture), true, shapeErrors());
  assert.deepEqual(validateArticulationFloorSemantics(fixture), []);
  assert.deepEqual(buildArticulationFloorFixture(), fixture, "fixture must be what the generator writes; run node scripts/generate-articulation-floor-v0.1.mjs");
  assert.equal(fixture.canonicalState, false);
  assert.equal(fixture.notAuthority, true);
  assert.equal(fixture.seals.length, 3);
  assert.equal(fixture.answers.length, 3);
  assert.equal(fixture.floors.find((floor) => floor.axis === "all").n, 3);
});

test("a seal is content-addressed: its hash binds the seven sealed fields and nothing else", () => {
  const s = aSeal();
  assert.deepEqual(verifySeal(s), []);
  assert.match(s.hash, /^sha256:[a-f0-9]{64}$/);
  // blind and source_refs are outside the hash: they describe how the seal was used, not what it predicted
  assert.equal(sealHash({ ...s, blind: false, source_refs: [] }), s.hash);
  const edited = { ...s, predicted_answer: "yes" };
  assert.deepEqual(verifySeal(edited), ["seal_hash_mismatch"]);
  const backdated = { ...s, t_sealed: "2026-09-12T00:00:00Z" };
  assert.deepEqual(verifySeal(backdated), ["seal_hash_mismatch"]);
  assert.ok(verifySeal({ ...s, t_sealed: "2026-09-13 00:00", hash: sealHash({ ...s, t_sealed: "2026-09-13 00:00" }) }).includes("seal_t_sealed_not_iso_utc"));
  assert.ok(verifySeal({ ...s, confidence: 1.5, hash: sealHash({ ...s, confidence: 1.5 }) }).includes("seal_confidence_out_of_range"));
});

test("seal precedes render: an answer timestamped before its seal never closes", () => {
  const s = aSeal();
  const early = closed(s, { t_answered: "2026-09-12T23:59:59Z" });
  assert.ok(verifyAnswer(early, s).includes("answered_before_sealed"));
  const same = closed(s, { t_answered: s.t_sealed });
  assert.ok(verifyAnswer(same, s).includes("answered_before_sealed"));
  assert.deepEqual(verifyAnswer(closed(s), s), []);
});

test("an answer belongs to exactly the seal it names", () => {
  const s = aSeal();
  const other = seal({ ...s, predicted_answer: "yes" });
  const record = closed(s);
  assert.ok(verifyAnswer({ ...record, seal: other.hash }, s).includes("answer_seal_hash_mismatch"));
  assert.ok(verifyAnswer(record, undefined).includes("answer_seal_not_found"));
  assert.ok(verifyAnswer({ ...record, question: "elsewhere" }, s).includes("answer_question_differs_from_seal"));
  assert.ok(verifyAnswer({ ...record, axis: "floor" }, s).includes("answer_axis_differs_from_seal"));
});

test("beat 4 is mandatory: a record without reason_match is not closed and does not count", () => {
  const s = aSeal();
  const open = closed(s, { reason_match: undefined });
  assert.ok(verifyAnswer(open, s).includes("reason_match_missing_record_not_closed"));
  assert.equal(computeFloor([open, closed(s)], [s]).n, 1);
  const bad = { ...closed(s), reason_match: "maybe" };
  assert.ok(verifyAnswer(bad, s).includes("reason_match_missing_record_not_closed"));
});

test("a pick scores itself by comparison and can only hit or miss; freeform is scored by the principal", () => {
  const s = aSeal();
  assert.equal(scorePick("No", s), "hit");
  assert.equal(scorePick("partly", s), "miss");
  assert.equal(closed(s).answer_match, "hit");
  assert.equal(closed(s).answer_match_scored_by, "comparison");
  const lied = { ...closed(s, { answer: "partly" }), answer_match: "hit" };
  assert.ok(verifyAnswer(lied, s).includes("pick_answer_match_not_by_comparison"));
  const partialPick = { ...closed(s), answer_match: "partial" };
  assert.ok(verifyAnswer(partialPick, s).includes("pick_cannot_be_partial"));
  const free = closed(s, { answer: "no, unless the parts carry the boundary too", mode: "freeform", answer_match: "partial", reason_match: "partly" });
  assert.equal(free.answer_match_scored_by, "principal");
  assert.deepEqual(verifyAnswer(free, s), []);
  const freeUnscored = closed(s, { answer: "no, mostly", mode: "freeform", reason_match: "partly" });
  assert.ok(verifyAnswer(freeUnscored, s).includes("answer_match_unknown"));
});

test("a re-ask is an answer with prior_answer set; drift lives on it, not in its own record", () => {
  const s = aSeal();
  const first = closed(s);
  const again = closed(s, { answer: "partly", t_answered: "2026-10-05T09:00:00Z", prior_answer: first.seal, prior_answer_text: first.answer });
  assert.equal(again.prior_answer, first.seal);
  assert.equal(again.drift, 'was "no", now "partly"');
  assert.equal(again.answer_match, "miss");
  assert.deepEqual(verifyAnswer(again, s), []);
  assert.equal(drift("no", "No"), null);
  assert.ok(verifyAnswer({ ...first, drift: "moved" }, s).includes("answer_drift_without_prior"));
  assert.equal(reaskEligible(first, "2026-10-03T09:00:00Z"), false);
  assert.equal(reaskEligible(first, "2026-10-04T09:00:00Z"), true);
  assert.equal(REASK_GAP_DAYS_DEFAULT, 21);
  assert.equal(reaskEligible(first, "2026-09-20T09:00:00Z", 7), true);
});

test("the floor is the rolling reason accuracy per axis; its curve is cumulative and the shape is the finding", () => {
  const all = fixture.floors.find((floor) => floor.axis === "all");
  assert.deepEqual(all.curve, [[1, 0.5], [2, 0.75], [3, 0.5]]);
  assert.equal(all.reason_accuracy, 0.5);
  assert.equal(all.answer_accuracy, 0.5);
  assert.equal(all.blind_n, 2);
  assert.equal(all.anchored_n, 1);
  const fidelity = fixture.floors.find((floor) => floor.axis === "fidelity");
  assert.equal(fidelity.n, 1);
  assert.deepEqual(fidelity.curve, [[1, 0.5]]);
  assert.deepEqual(ANSWER_MATCH_SCORE, { hit: 1, partial: 0.5, miss: 0 });
  assert.deepEqual(REASON_MATCH_SCORE, { yes: 1, partly: 0.5, no: 0 });
  // an unverifiable seal or an unclosed answer never enters the floor
  const s = aSeal();
  const broken = { ...s, hash: "sha256:" + "0".repeat(64) };
  assert.equal(computeFloor([closed(s)], [broken]).n, 0);
});

test("a floor that does not replay from its ledger fails semantic validation", () => {
  const tampered = clone(fixture);
  tampered.floors[0].reason_accuracy = 0.9;
  assert.match(validateArticulationFloorSemantics(tampered).join("\n"), /floors\[0\]:floor_does_not_replay_from_ledger/);
  const forged = clone(fixture);
  forged.seals[0].predicted_answer = forged.answers[0].answer;
  assert.match(validateArticulationFloorSemantics(forged).join("\n"), /seals\[0\]:seal_hash_mismatch/);
  const skipped = clone(fixture);
  delete skipped.answers[1].reason_match;
  assert.equal(validate(skipped), false);
  assert.match(validateArticulationFloorSemantics(skipped).join("\n"), /answers\[1\]:reason_match_missing_record_not_closed/);
});

test("the readout follows the contract's table and refuses to read a floor with too few records", () => {
  const s = aSeal();
  const at = (n) => `2026-09-${String(13 + Math.floor(n / 24)).padStart(2, "0")}T${String(n % 24).padStart(2, "0")}:00:00Z`;
  const series = (reasons, answers = reasons.map(() => "hit")) => computeFloor(reasons.map((reason_match, index) => closed(s, { reason_match, t_answered: at(index + 1), answer: answers[index] === "hit" ? "no" : "yes" })), [s]);
  assert.equal(readFloor(computeFloor([], [s])).verdict, "no-data");
  assert.equal(readFloor(series(["yes", "no"])).verdict, "insufficient");
  assert.equal(FLOOR_MIN_N, 10);
  const alternating = Array.from({ length: 12 }, (_, index) => (index % 2 ? "hit" : "miss"));
  assert.equal(readFloor(series(Array(12).fill("partly"), alternating)).verdict, "floor-measured");
  assert.equal(readFloor(series(Array(12).fill("yes"))).verdict, "refuted-for-domain");
  assert.equal(readFloor(series(Array(12).fill("no"), Array(12).fill("hit"))).verdict, "correlation-not-articulation");
  const broken = series([...Array(6).fill("partly"), ...Array(6).fill("yes")]);
  broken.last_break = { ref: "migrations/example.yawn", after_n: 6 };
  assert.equal(readFloor(broken).verdict, "extension-after-break");
});

test("seals written into .yawn records extract without a YAML parser and recompute to their hashes", async () => {
  const packet = await readText("question-packets/polanyi.yawn");
  const found = extractSealsFromYawn(packet);
  assert.equal(found.length, 7, "one seal per Polanyi axis");
  assert.deepEqual(verifySealsInYawn(packet, "packet"), []);
  for (const { seal: record } of found) {
    assert.equal(record.blind, true, "the packet's seals are blind: not shown before the mark");
    assert.match(record.question, /^question-packets\/polanyi\.yawn#[a-z]+$/);
    assert.equal(record.question.split("#")[1], record.axis);
  }
  const state = await readText("records/yawn.bot-state.yawn");
  const stateSeals = extractSealsFromYawn(state);
  assert.ok(stateSeals.length >= 2, "next_question and every queued decision carry a seal");
  assert.deepEqual(verifySealsInYawn(state, "state"), []);
  for (const { seal: record } of stateSeals) assert.equal(record.blind, false, "a decision's recommendation is shown, so its seal is anchored");
  const tampered = packet.replace(/predicted_answer: "partly"/, 'predicted_answer: "yes"');
  assert.match(verifySealsInYawn(tampered, "packet").join("\n"), /seal_hash_mismatch/);
  const snippet = "questions:\n  - question_key: x\n    seal:\n      question: \"a#x\"\n      axis: x\n      predicted_answer: \"1\"\n      predicted_reason: \"r\"\n      confidence: 0.5\n      model: \"m\"\n      t_sealed: \"2026-09-13T00:00:00Z\"\n      blind: true\n      source_refs: [a, b]\n      hash: sha256:x\n  - question_key: y\n";
  const [{ seal: parsed }] = extractSealsFromYawn(snippet);
  assert.deepEqual(parsed.source_refs, ["a", "b"]);
  assert.equal(parsed.confidence, 0.5);
  assert.equal(verifySeal(parsed)[0], "seal_hash_mismatch");
});

test("the CLI validates the default fixture, the packet's seals, and the queued decisions' seals", () => {
  for (const args of [[], ["fixtures/articulation-floor.v0.1.json"]]) {
    const result = spawnSync(process.execPath, ["scripts/validate-articulation-floor-v0.1.mjs", ...args], { cwd: new URL("..", import.meta.url), encoding: "utf8" });
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /Validated Articulation Floor V0\.1: ledger:fixture:articulation-floor .* 7 packet seals over 7 axes; \d+ queued decisions sealed\./);
  }
});
