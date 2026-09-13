// Articulation Floor 0.1 — seal, answer, floor.
//
// The loop in one line: the bot seals a prediction of what the principal will
// answer (and why) BEFORE the question renders; the principal answers; the seal
// is revealed and scored (hit / partial / miss); the principal scores the sealed
// REASON (yes / partly / no). The rolling reason accuracy per axis is the floor:
// how much of what the principal knows the record could say in advance. The
// shape of that curve is the finding (core/articulation-floor.yawn).
//
// Everything here is deterministic and dependency-free. A seal is content-
// addressed (sha256 over canonical JSON of its sealed fields) so it cannot be
// edited after the answer without the hash failing. Nothing here is authority:
// a seal is a prediction, an answer is the principal's, a floor is a measurement.
import { createHash } from "node:crypto";
import { canonicalJson } from "./state-substrate-v1.mjs";

export const ARTICULATION_FLOOR_SCHEMA_VERSION = "yawn.articulation-floor.v0.1";
export const SEAL_HASH_FIELDS = Object.freeze(["question", "axis", "predicted_answer", "predicted_reason", "confidence", "model", "t_sealed"]);
export const ANSWER_MODES = Object.freeze(["pick", "freeform"]);
export const ANSWER_MATCHES = Object.freeze(["hit", "partial", "miss"]);
export const ANSWER_MATCH_SCORED_BY = Object.freeze(["comparison", "principal"]);
export const REASON_MATCHES = Object.freeze(["yes", "partly", "no"]);
export const ANSWER_MATCH_SCORE = Object.freeze({ hit: 1, partial: 0.5, miss: 0 });
export const REASON_MATCH_SCORE = Object.freeze({ yes: 1, partly: 0.5, no: 0 });
export const FLOOR_VERDICTS = Object.freeze([
  "no-data",
  "insufficient",
  "floor-measured",
  "refuted-for-domain",
  "extension-after-break",
  "correlation-not-articulation",
]);
/** Re-ask gap, in days, after which an answered question is eligible again. Tunable; 21 by default. */
export const REASK_GAP_DAYS_DEFAULT = 21;
/** At most one in five questions per pulse may be a re-ask. */
export const REASK_CAP_PER_PULSE = 0.2;
/** Below this many closed records a floor is reported, never read as a verdict. */
export const FLOOR_MIN_N = 10;
/** A plateau this high reads as "refuted for this domain": the record could say nearly everything. */
export const FLOOR_REFUTED_LEVEL = 0.9;
/** answer_accuracy this far above reason_accuracy is correlation, not articulation. */
export const CORRELATION_GAP = 0.3;

const ISO_UTC = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/;
const isIsoUtc = (value) => typeof value === "string" && ISO_UTC.test(value) && Number.isFinite(Date.parse(value));
const isText = (value) => typeof value === "string" && value.trim().length > 0;

function sealedFields(seal) {
  const out = {};
  for (const key of SEAL_HASH_FIELDS) out[key] = seal[key];
  return out;
}

/** sha256 over canonical JSON (sorted keys) of the seven sealed fields. Prefixed like hashCanonical. */
export function sealHash(seal) {
  return `sha256:${createHash("sha256").update(canonicalJson(sealedFields(seal))).digest("hex")}`;
}

/** Build a seal record. The hash binds the prediction to the moment it was written. */
export function seal({ question, axis, predicted_answer, predicted_reason, confidence, model, t_sealed, blind = true, source_refs = [] }) {
  const record = {
    schemaVersion: ARTICULATION_FLOOR_SCHEMA_VERSION,
    kind: "seal",
    question, axis, predicted_answer, predicted_reason, confidence, model, t_sealed,
    blind,
    source_refs: [...source_refs],
    canonicalState: false,
    notAuthority: true,
  };
  record.hash = sealHash(record);
  return record;
}

/** Errors (snake_case tokens) that make a seal unusable. Empty array means the seal holds. */
export function verifySeal(record) {
  const errors = [];
  if (!record || typeof record !== "object") return ["seal_not_an_object"];
  if (record.kind !== "seal") errors.push("seal_kind_mismatch");
  for (const key of ["question", "axis", "predicted_answer", "predicted_reason", "model"]) if (!isText(record[key])) errors.push(`seal_${key}_missing`);
  if (typeof record.confidence !== "number" || !(record.confidence >= 0 && record.confidence <= 1)) errors.push("seal_confidence_out_of_range");
  if (!isIsoUtc(record.t_sealed)) errors.push("seal_t_sealed_not_iso_utc");
  if (typeof record.blind !== "boolean") errors.push("seal_blind_not_boolean");
  if (!isText(record.hash)) errors.push("seal_hash_missing");
  else if (errors.length === 0 && record.hash !== sealHash(record)) errors.push("seal_hash_mismatch");
  return errors;
}

/** For a pick, the answer is a hit when it names the sealed candidate; otherwise a miss. No partial for picks. */
export function scorePick(answerText, sealRecord) {
  const norm = (value) => String(value ?? "").trim().toLowerCase();
  return norm(answerText) === norm(sealRecord.predicted_answer) ? "hit" : "miss";
}

/** A one-line delta between a prior answer and this one, or null when nothing moved. */
export function drift(priorAnswerText, answerText) {
  const a = String(priorAnswerText ?? "").trim(), b = String(answerText ?? "").trim();
  if (!a || a.toLowerCase() === b.toLowerCase()) return null;
  return `was "${a}", now "${b}"`;
}

/**
 * Build an answer record against a seal. mode "pick" scores itself by comparison; "freeform" must be
 * scored by the principal. reason_match is beat 4 and is REQUIRED: a record without it is not closed.
 */
export function answer(sealRecord, { answer: text, mode, answer_match, answer_match_scored_by, reason_match, t_answered, actor, prior_answer = null, prior_answer_text = null }) {
  const scoredBy = answer_match_scored_by ?? (mode === "pick" ? "comparison" : "principal");
  const match = answer_match ?? (mode === "pick" ? scorePick(text, sealRecord) : undefined);
  return {
    schemaVersion: ARTICULATION_FLOOR_SCHEMA_VERSION,
    kind: "answer",
    question: sealRecord.question,
    axis: sealRecord.axis,
    seal: sealRecord.hash,
    answer: text,
    mode,
    answer_match: match,
    answer_match_scored_by: scoredBy,
    reason_match,
    t_answered,
    actor,
    prior_answer,
    drift: prior_answer ? drift(prior_answer_text, text) : null,
    canonicalState: false,
    notAuthority: true,
  };
}

/** Errors that keep an answer from closing against its seal. The seal must be the one it names. */
export function verifyAnswer(record, sealRecord) {
  const errors = [];
  if (!record || typeof record !== "object") return ["answer_not_an_object"];
  if (record.kind !== "answer") errors.push("answer_kind_mismatch");
  if (!isText(record.answer)) errors.push("answer_text_missing");
  if (!ANSWER_MODES.includes(record.mode)) errors.push("answer_mode_unknown");
  if (!ANSWER_MATCHES.includes(record.answer_match)) errors.push("answer_match_unknown");
  if (!ANSWER_MATCH_SCORED_BY.includes(record.answer_match_scored_by)) errors.push("answer_match_scored_by_unknown");
  if (record.mode === "pick" && record.answer_match === "partial") errors.push("pick_cannot_be_partial");
  if (!REASON_MATCHES.includes(record.reason_match)) errors.push("reason_match_missing_record_not_closed");
  if (!isIsoUtc(record.t_answered)) errors.push("answer_t_answered_not_iso_utc");
  if (!isText(record.actor)) errors.push("answer_actor_missing");
  if (!sealRecord) errors.push("answer_seal_not_found");
  else {
    if (record.seal !== sealRecord.hash) errors.push("answer_seal_hash_mismatch");
    if (record.question !== sealRecord.question) errors.push("answer_question_differs_from_seal");
    if (record.axis !== sealRecord.axis) errors.push("answer_axis_differs_from_seal");
    if (isIsoUtc(record.t_answered) && isIsoUtc(sealRecord.t_sealed) && !(Date.parse(sealRecord.t_sealed) < Date.parse(record.t_answered))) errors.push("answered_before_sealed");
    if (record.mode === "pick" && ANSWER_MATCHES.includes(record.answer_match) && record.answer_match !== scorePick(record.answer, sealRecord)) errors.push("pick_answer_match_not_by_comparison");
  }
  if (record.prior_answer && record.drift !== null && !isText(record.drift)) errors.push("answer_drift_not_text");
  if (!record.prior_answer && record.drift) errors.push("answer_drift_without_prior");
  return errors;
}

const mean = (values) => (values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0);
const round = (value) => Math.round(value * 1000) / 1000;

/**
 * Aggregate closed answers into a floor for one axis ("all" for the global floor). Answers are taken in
 * t_answered order; the curve is the cumulative reason accuracy after each record, so its shape can be read.
 * Only closed records (a reason_match present and a seal that verifies) count.
 */
export function computeFloor(answers, seals, { axis = "all", last_break = null, t_computed } = {}) {
  const sealByHash = new Map((seals ?? []).filter((item) => verifySeal(item).length === 0).map((item) => [item.hash, item]));
  const closed = (answers ?? [])
    .filter((item) => (axis === "all" || item.axis === axis) && verifyAnswer(item, sealByHash.get(item.seal)).length === 0)
    .sort((a, b) => Date.parse(a.t_answered) - Date.parse(b.t_answered));
  const answerScores = [], reasonScores = [], curve = [];
  let blind_n = 0, anchored_n = 0;
  for (const item of closed) {
    answerScores.push(ANSWER_MATCH_SCORE[item.answer_match]);
    reasonScores.push(REASON_MATCH_SCORE[item.reason_match]);
    curve.push([reasonScores.length, round(mean(reasonScores))]);
    if (sealByHash.get(item.seal).blind) blind_n += 1; else anchored_n += 1;
  }
  return {
    schemaVersion: ARTICULATION_FLOOR_SCHEMA_VERSION,
    kind: "floor",
    axis,
    n: closed.length,
    blind_n,
    anchored_n,
    answer_accuracy: round(mean(answerScores)),
    reason_accuracy: round(mean(reasonScores)),
    curve,
    last_break,
    t_computed: t_computed ?? null,
    canonicalState: false,
    notAuthority: true,
  };
}

/**
 * Read a floor. The verdicts follow core/articulation-floor.yawn readout: a plateau above zero is the
 * floor measured; a curve toward 1.0 refutes the floor for the domain; a plateau that breaks upward after
 * a recorded ontology change is the extension; answer accuracy far above reason accuracy is correlation.
 * Below FLOOR_MIN_N the floor is reported, not read.
 */
export function readFloor(floor) {
  if (!floor || floor.n === 0) return { verdict: "no-data", note: "No closed record yet. The floor cannot be backfilled; it starts when the first sealed question is answered and its reason checked." };
  if (floor.n < FLOOR_MIN_N) return { verdict: "insufficient", note: `${floor.n} closed record(s); ${FLOOR_MIN_N} are needed before the curve is read as a verdict.` };
  const gap = floor.answer_accuracy - floor.reason_accuracy;
  if (gap >= CORRELATION_GAP) return { verdict: "correlation-not-articulation", note: "The record predicts the answer far better than the reason. Polanyi keeps the point; check for confabulation before claiming anything." };
  const level = floor.reason_accuracy;
  if (floor.last_break) {
    const breakIndex = floor.curve.findIndex(([n]) => n >= (floor.last_break.after_n ?? 0));
    const before = breakIndex > 0 ? floor.curve[breakIndex - 1][1] : null;
    if (before !== null && level > before + 0.05) return { verdict: "extension-after-break", note: "The plateau moved upward after an ontology change. The floor is a property of the representation, not of knowledge." };
  }
  if (level >= FLOOR_REFUTED_LEVEL) return { verdict: "refuted-for-domain", note: "Reason accuracy sits near 1.0: for this domain what is known can be said." };
  return { verdict: "floor-measured", note: `Reason accuracy plateaus at ${level}: the floor, measured.` };
}

/** True once the re-ask gap has passed since the answer closed. Never a reason to interrupt. */
export function reaskEligible(answerRecord, now, gapDays = REASK_GAP_DAYS_DEFAULT) {
  const at = Date.parse(answerRecord?.t_answered ?? "");
  const at_now = typeof now === "string" ? Date.parse(now) : Number(now);
  if (!Number.isFinite(at) || !Number.isFinite(at_now)) return false;
  return at_now - at >= gapDays * 86_400_000;
}

/** Semantic validation of a whole ledger {seals, answers, floors}. Returns snake_case error tokens. */
export function validateArticulationFloorSemantics(ledger) {
  const errors = [];
  if (!ledger || typeof ledger !== "object") return ["ledger_not_an_object"];
  if (ledger.schemaVersion !== ARTICULATION_FLOOR_SCHEMA_VERSION) errors.push("ledger_schema_version_mismatch");
  if (ledger.canonicalState !== false) errors.push("ledger_canonical_state_must_be_false");
  if (ledger.notAuthority !== true) errors.push("ledger_not_authority_must_be_true");
  const seals = Array.isArray(ledger.seals) ? ledger.seals : [];
  const answers = Array.isArray(ledger.answers) ? ledger.answers : [];
  const floors = Array.isArray(ledger.floors) ? ledger.floors : [];
  const sealByHash = new Map();
  for (const [index, item] of seals.entries()) {
    for (const error of verifySeal(item)) errors.push(`seals[${index}]:${error}`);
    if (sealByHash.has(item?.hash)) errors.push(`seals[${index}]:duplicate_seal_hash`);
    sealByHash.set(item?.hash, item);
  }
  for (const [index, item] of answers.entries()) for (const error of verifyAnswer(item, sealByHash.get(item?.seal))) errors.push(`answers[${index}]:${error}`);
  for (const [index, item] of floors.entries()) {
    const expected = computeFloor(answers, seals, { axis: item?.axis ?? "all", last_break: item?.last_break ?? null, t_computed: item?.t_computed ?? null });
    if (canonicalJson(expected) !== canonicalJson(item)) errors.push(`floors[${index}]:floor_does_not_replay_from_ledger`);
  }
  return errors;
}

// --- .yawn record extraction --------------------------------------------------------------
// A seal written into a human-readable record (a question packet, the bot-state record) is a
// `seal:` mapping whose values are single-line scalars. This reads them back without a YAML
// parser so the validator stays dependency-free, and recomputes each hash.
const unquote = (raw) => {
  const value = raw.trim();
  if (value.startsWith('"')) { try { return JSON.parse(value); } catch { return value.slice(1, -1); } }
  if (value.startsWith("'")) return value.slice(1, -1);
  return value.replace(/\s+#.*$/, "").trim();
};
const coerce = (key, value) => {
  if (key === "confidence") return Number(value);
  if (key === "blind") return value === "true";
  if (key === "source_refs") return value.startsWith("[") ? value.slice(1, -1).split(",").map((s) => s.trim()).filter(Boolean) : [value];
  return value;
};

/** Every `seal:` block in a .yawn record, with the line it starts on. Values are coerced like the schema. */
export function extractSealsFromYawn(text) {
  const lines = String(text).split(/\r?\n/);
  const found = [];
  for (let index = 0; index < lines.length; index += 1) {
    const head = lines[index].match(/^(\s*)seal:\s*$/);
    if (!head) continue;
    const indent = head[1].length;
    const record = { kind: "seal", schemaVersion: ARTICULATION_FLOOR_SCHEMA_VERSION, canonicalState: false, notAuthority: true, source_refs: [] };
    let cursor = index + 1;
    for (; cursor < lines.length; cursor += 1) {
      const line = lines[cursor];
      if (!line.trim()) continue;
      const own = line.match(/^(\s*)(?=\S)/)[1].length;
      if (own <= indent) break;
      const pair = line.match(/^\s*([a-z_]+):\s*(.*)$/);
      if (pair) record[pair[1]] = coerce(pair[1], unquote(pair[2]));
    }
    // `seal:` followed by nothing of its own (a bare null, an empty block) is no seal at all.
    if (Object.keys(record).some((key) => SEAL_HASH_FIELDS.includes(key) || key === "hash")) found.push({ line: index + 1, seal: record });
    index = cursor - 1;
  }
  return found;
}

/** Errors for every seal found in a .yawn record's text; empty means every seal in the record holds. */
export function verifySealsInYawn(text, label = "record") {
  const errors = [];
  for (const { line, seal: record } of extractSealsFromYawn(text)) {
    for (const error of verifySeal(record)) errors.push(`${label}:${line}:${error}`);
  }
  return errors;
}
