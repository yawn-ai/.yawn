import { canonicalJson, hashCanonical } from "./state-substrate-v1.mjs";

export const ORIENTATION_MAP_SCHEMA_VERSION = "yawn.orientation-map.v0.1";
export const ORIENTATION_RANKING_POLICY_VERSION = "yawn.inquiry-selection.v0.1";
export const ORIENTATION_PROMPT_SET_VERSION = "0.4.0-draft";
export const ORIENTATION_PROMPT_SET_SHA256 = "8c1faa75c7dffaad21d559a9ffafeab4ac4c771c4151c322cfd53cd0f4d83cab";
export const ORIENTATION_QUESTION_PACKET = Object.freeze({
  id: "question-packets/orientation-nine",
  version: "0.4.0-draft",
  sha256: ORIENTATION_PROMPT_SET_SHA256,
});

export const ORIENTATION_QUESTION_KEYS = Object.freeze([
  "scope",
  "placement",
  "perspective",
  "current-state",
  "intent",
  "lacuna",
  "boundary",
  "movement",
  "proof",
]);

export const ORIENTATION_PROMPTS = Object.freeze({
  scope: "What has your attention, and what episode are we orienting?",
  placement: "Where and when is this happening, and which relationship or Arena is active?",
  perspective: "Who are you here, in what role, and who participates or is affected?",
  "current-state": "What appears to be happening now?",
  intent: "What matters, is needed, or is being protected—and why?",
  lacuna: "What is unknown, disputed, constrained, dependent, or in tension?",
  boundary: "What must be protected, and who may decide or act?",
  movement: "What is possible next?",
  proof: "What would reality have to show for this map to update?",
});

export const ORIENTATION_GATE_ORDER = Object.freeze([
  "immediate_safety_or_stability",
  "authority_or_consent",
  "privacy_visibility_or_egress",
  "source_or_provenance",
  "proof_or_falsifier_integrity",
]);

export const ORIENTATION_GATE_PROMPT_CLAUSES = Object.freeze({
  immediate_safety_or_stability: "immediate safety or stability",
  authority_or_consent: "authority or consent",
  privacy_visibility_or_egress: "privacy, visibility, or egress",
  source_or_provenance: "source or provenance integrity",
  proof_or_falsifier_integrity: "proof or falsifier integrity",
});

export const ORIENTATION_GATE_PROMPT_TEMPLATE =
  "Before answering, address these live or unresolved gates: {ordered_gate_clauses}. Then answer: {default_prompt}";

export function renderOrientationPrompt(questionKey, foregroundGateKeys = []) {
  assert(Object.hasOwn(ORIENTATION_PROMPTS, questionKey), "orientation_prompt_question_key_invalid");
  assert(Array.isArray(foregroundGateKeys), "orientation_foreground_gate_keys_invalid");
  assert(new Set(foregroundGateKeys).size === foregroundGateKeys.length, "orientation_foreground_gate_keys_duplicate");
  assert(
    foregroundGateKeys.every((gateKey, index) => (
      Object.hasOwn(ORIENTATION_GATE_PROMPT_CLAUSES, gateKey)
      && (index === 0 || ORIENTATION_GATE_ORDER.indexOf(foregroundGateKeys[index - 1]) < ORIENTATION_GATE_ORDER.indexOf(gateKey))
    )),
    "orientation_foreground_gate_keys_invalid",
  );
  if (foregroundGateKeys.length === 0) {
    return { promptVariant: "default", exactRenderedPrompt: ORIENTATION_PROMPTS[questionKey] };
  }
  const orderedGateClauses = foregroundGateKeys
    .map((gateKey) => ORIENTATION_GATE_PROMPT_CLAUSES[gateKey])
    .join("; ");
  return {
    promptVariant: "gated",
    exactRenderedPrompt: ORIENTATION_GATE_PROMPT_TEMPLATE
      .replace("{ordered_gate_clauses}", orderedGateClauses)
      .replace("{default_prompt}", ORIENTATION_PROMPTS[questionKey]),
  };
}

export const ORIENTATION_SEMANTIC_PRIORITY_ORDER = Object.freeze([
  "movement_critical_missing_information",
  "affected_relationship_or_unresolved_role",
  "high_consequence_low_confidence",
  "contradiction_or_dispute",
  "stale_high_impact_information",
  "expected_information_value",
  "proof_or_close_condition_gap",
  "orientation_gain_per_effort",
  "lower_effort",
]);

export const ORIENTATION_TIE_BREAK_ORDER = Object.freeze([
  "hard_gate_priority",
  "greater_semantic_priority",
  "lower_answer_burden",
  "explicit_current_turn_choice",
  "accepted_question_order_preference",
  "canonical_question_order",
]);

export const ORIENTATION_GATE_CLEAR_CONFIDENCE_MINIMUM = 0.75;

export const ORIENTATION_RANKING_POLICY = Object.freeze({
  policyVersion: ORIENTATION_RANKING_POLICY_VERSION,
  promptSetVersion: ORIENTATION_PROMPT_SET_VERSION,
  promptSetSha256: ORIENTATION_PROMPT_SET_SHA256,
  maximumResults: 3,
  gateClearConfidenceMinimum: ORIENTATION_GATE_CLEAR_CONFIDENCE_MINIMUM,
  presentationOrderRole: "accepted-or-explicit-substantive-tie-break-only",
  semanticPriorityOrder: ORIENTATION_SEMANTIC_PRIORITY_ORDER,
  tieBreakOrder: ORIENTATION_TIE_BREAK_ORDER,
  canonicalOrder: ORIENTATION_QUESTION_KEYS,
});

const recordKinds = new Set([
  "actor", "principal", "agent_space", "arena", "observation", "yawn", "source",
  "proof", "view", "git_commit", "question_proposal", "art_brief", "art_candidate",
  "view_feedback", "relationship", "action_policy", "reconciliation_batch",
  "action_request", "action_receipt",
]);
const scopeKinds = new Set(["principal", "agent_space", "arena", "yawn", "observation", "view"]);
const coverageStatuses = new Set(["missing", "partial", "covered", "stale"]);
const answerStatuses = new Set([
  "unasked", "answered", "proposed", "corrected", "skipped", "unknown",
  "disputed", "deferred", "withheld", "not_applicable",
]);
const mappingStatuses = new Set(["unmapped", "proposed", "accepted", "corrected", "rejected"]);
const epistemicStatuses = new Set(["observed", "reported", "inferred", "assumed", "predicted", "disputed", "unknown"]);
const machineEpistemicStatuses = new Set(["inferred", "assumed", "predicted", "disputed", "unknown"]);
const rankingEpistemicStatuses = new Set(["reported", "inferred", "disputed", "unknown"]);
const freshnessStatuses = new Set(["current", "stale", "unknown"]);
const visibilityStatuses = new Set(["private", "shared", "public"]);
const disputeStatuses = new Set(["undisputed", "disputed", "unknown"]);
const media = new Set(["voice", "free_text", "structured_choice", "visual_map", "mixed"]);
const selectionOptionHoldReasonCodes = new Set([
  "referent_ambiguous",
  "required_source_or_authority_context_missing",
  "unbounded_or_unnecessary_burden",
  "explicit_principal_pause",
]);
const noAnswerStatuses = new Set(["unasked", "skipped", "deferred", "withheld"]);
const gateSuppressedAnswerStatuses = new Set(["skipped", "deferred", "withheld"]);
const attributionActorPattern = /^(principal|actor|assistant|agent|system):[^\s]+$/;
const machineActorPattern = /^(assistant|agent|system):/;
const principalActorPattern = /^principal:[^\s]+$/;
const questionEventPattern = /^question-event:[^\s]+$/;
const selectionReceiptPattern = /^receipt:[^\s]+$/;
const sha256Pattern = /^[a-f0-9]{64}$/;
const rfc3339Pattern = /^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])T([01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9](\.[0-9]{1,3})?Z$/;

const hardGateFields = Object.freeze([
  ["immediateSafetyOrStability", "immediate_safety_or_stability", "immediateSafetyOrStabilityBlocker", "immediate_safety_or_stability"],
  ["authorityOrConsent", "authority_or_consent_blocker", "authorityOrConsentBlocker", "authority_or_consent"],
  ["privacyVisibilityOrEgress", "privacy_visibility_or_egress_blocker", "privacyVisibilityOrEgressBlocker", "privacy_visibility_or_egress"],
  ["sourceOrProvenance", "source_or_provenance_loss", "sourceOrProvenanceLossBlocker", "source_or_provenance"],
  ["proofOrFalsifierIntegrity", "proof_or_falsifier_integrity", "proofOrFalsifierIntegrityBlocker", "proof_or_falsifier_integrity"],
]);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function codeUnitCompare(left, right) {
  return left < right ? -1 : left > right ? 1 : 0;
}

function exactKeys(input, expected, name) {
  assert(input && typeof input === "object" && !Array.isArray(input), `${name}_required`);
  const actual = Object.keys(input).sort(codeUnitCompare);
  const wanted = [...expected].sort(codeUnitCompare);
  assert(canonicalJson(actual) === canonicalJson(wanted), `${name}_fields_invalid`);
}

function allowedKeys(input, allowed, name) {
  assert(input && typeof input === "object" && !Array.isArray(input), `${name}_required`);
  assert(Object.keys(input).every((key) => allowed.includes(key)), `${name}_fields_invalid`);
}

function boundedString(value, name, maximum, { pattern = null } = {}) {
  assert(typeof value === "string" && value.trim().length > 0, `${name}_required`);
  assert([...value].length <= maximum, `${name}_too_long`);
  if (pattern) assert(pattern.test(value), `${name}_invalid`);
  return value;
}

function timestamp(value, name) {
  boundedString(value, name, 100, { pattern: rfc3339Pattern });
  const [year, month, day] = value.slice(0, 10).split("-").map(Number);
  const maximumDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  assert(day <= maximumDay && Number.isFinite(Date.parse(value)), `${name}_invalid`);
  return value;
}

function integerScale(value, name) {
  assert(Number.isInteger(value) && value >= 0 && value <= 3, `${name}_invalid`);
  return value;
}

function confidence(value, name) {
  assert(typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 1, `${name}_invalid`);
  return value;
}

function normalizeRecordRef(input, { kind = null, scope = false } = {}) {
  const allowed = ["kind", "id", "revision", "stateSha256"];
  allowedKeys(input, allowed, "record_ref");
  assert(recordKinds.has(input.kind), "record_ref_kind_invalid");
  if (kind) assert(input.kind === kind, `record_ref_kind_must_be_${kind}`);
  if (scope) assert(scopeKinds.has(input.kind), "orientation_scope_kind_invalid");
  boundedString(input.id, "record_ref_id", 500);
  if (input.revision !== undefined && input.revision !== null) {
    assert(Number.isSafeInteger(input.revision) && input.revision >= 0, "record_ref_revision_invalid");
  }
  if (input.stateSha256 !== undefined && input.stateSha256 !== null) {
    assert(typeof input.stateSha256 === "string" && sha256Pattern.test(input.stateSha256), "record_ref_hash_invalid");
  }
  const normalized = { kind: input.kind, id: input.id };
  if (input.revision !== undefined) normalized.revision = input.revision;
  if (input.stateSha256 !== undefined) normalized.stateSha256 = input.stateSha256;
  return normalized;
}

function normalizeSourceRefs(input, name) {
  assert(Array.isArray(input) && input.length > 0 && input.length <= 100, `${name}_required`);
  const refs = input.map((ref) => normalizeRecordRef(ref));
  const keyed = refs.map((ref) => [canonicalJson(ref), ref]).sort(([left], [right]) => codeUnitCompare(left, right));
  assert(new Set(keyed.map(([key]) => key)).size === keyed.length, `${name}_duplicate`);
  return keyed.map(([, ref]) => ref);
}

function normalizeSelectionReceiptRef(input) {
  exactKeys(input, ["kind", "id", "revision", "stateSha256"], "orientation_selection_receipt_ref");
  assert(input.kind === "inquiry_selection_receipt", "orientation_selection_receipt_ref_kind_invalid");
  boundedString(input.id, "orientation_selection_receipt_ref_id", 500, { pattern: selectionReceiptPattern });
  assert(Number.isSafeInteger(input.revision) && input.revision >= 1, "orientation_selection_receipt_ref_revision_invalid");
  assert(typeof input.stateSha256 === "string" && sha256Pattern.test(input.stateSha256), "orientation_selection_receipt_ref_hash_invalid");
  return {
    kind: "inquiry_selection_receipt",
    id: input.id,
    revision: input.revision,
    stateSha256: input.stateSha256,
  };
}

function normalizeQuestionEventRefs(input) {
  assert(Array.isArray(input) && input.length <= 100, "orientation_question_event_refs_required");
  const refs = input.map((ref) => {
    exactKeys(
      ref,
      ["kind", "id", "revision", "stateSha256", "assertedBy", "selectionReceiptRef"],
      "orientation_question_event_ref",
    );
    assert(ref.kind === "question_event", "orientation_question_event_ref_kind_invalid");
    boundedString(ref.id, "orientation_question_event_ref_id", 500, { pattern: questionEventPattern });
    assert(Number.isSafeInteger(ref.revision) && ref.revision >= 1, "orientation_question_event_ref_revision_invalid");
    assert(typeof ref.stateSha256 === "string" && sha256Pattern.test(ref.stateSha256), "orientation_question_event_ref_hash_invalid");
    boundedString(ref.assertedBy, "orientation_question_event_ref_asserted_by", 500, { pattern: attributionActorPattern });
    return {
      kind: "question_event",
      id: ref.id,
      revision: ref.revision,
      stateSha256: ref.stateSha256,
      assertedBy: ref.assertedBy,
      selectionReceiptRef: normalizeSelectionReceiptRef(ref.selectionReceiptRef),
    };
  });
  assert(new Set(refs.map(({ id }) => id)).size === refs.length, "orientation_question_event_ref_duplicate");
  return refs.sort((left, right) => codeUnitCompare(canonicalJson(left), canonicalJson(right)));
}

function normalizeQuestionKeys(input, name) {
  assert(Array.isArray(input) && input.length > 0 && input.length <= ORIENTATION_QUESTION_KEYS.length, `${name}_invalid`);
  assert(input.every((key) => ORIENTATION_QUESTION_KEYS.includes(key)), `${name}_unknown`);
  assert(new Set(input).size === input.length, `${name}_duplicate`);
  return [...input];
}

function normalizeAnswer(input) {
  exactKeys(input, [
    "summary", "assertedBy", "epistemicStatus", "confidence", "freshness",
    "visibility", "disputeStatus", "sourceRefs", "selectionReceiptRef", "updatedAt",
  ], "orientation_answer");
  boundedString(input.summary, "orientation_answer_summary", 64000);
  boundedString(input.assertedBy, "orientation_answer_asserted_by", 500, { pattern: attributionActorPattern });
  assert(epistemicStatuses.has(input.epistemicStatus), "orientation_answer_epistemic_status_invalid");
  if (machineActorPattern.test(input.assertedBy)) {
    assert(machineEpistemicStatuses.has(input.epistemicStatus), "machine_answer_must_remain_inference");
  }
  assert(freshnessStatuses.has(input.freshness), "orientation_answer_freshness_invalid");
  assert(visibilityStatuses.has(input.visibility), "orientation_answer_visibility_invalid");
  assert(disputeStatuses.has(input.disputeStatus), "orientation_answer_dispute_status_invalid");
  return {
    summary: input.summary,
    assertedBy: input.assertedBy,
    epistemicStatus: input.epistemicStatus,
    confidence: confidence(input.confidence, "orientation_answer_confidence"),
    freshness: input.freshness,
    visibility: input.visibility,
    disputeStatus: input.disputeStatus,
    sourceRefs: normalizeSourceRefs(input.sourceRefs, "orientation_answer_source_refs"),
    selectionReceiptRef: normalizeSelectionReceiptRef(input.selectionReceiptRef),
    updatedAt: timestamp(input.updatedAt, "orientation_answer_updated_at"),
  };
}

function normalizeHardGateAssessment(input, gateKey) {
  exactKeys(input, ["status", "assertedBy", "epistemicStatus", "confidence", "sourceRefs"], `orientation_gate_${gateKey}`);
  assert(["active", "clear", "unknown"].includes(input.status), `orientation_gate_${gateKey}_status_invalid`);
  boundedString(input.assertedBy, `orientation_gate_${gateKey}_asserted_by`, 500, { pattern: attributionActorPattern });
  assert(rankingEpistemicStatuses.has(input.epistemicStatus), `orientation_gate_${gateKey}_epistemic_status_invalid`);
  if (machineActorPattern.test(input.assertedBy)) {
    assert(input.epistemicStatus !== "reported", `machine_gate_${gateKey}_must_remain_inference`);
  }
  const normalizedConfidence = confidence(input.confidence, `orientation_gate_${gateKey}_confidence`);
  if (input.status === "clear") {
    assert(!["unknown", "disputed"].includes(input.epistemicStatus), `orientation_gate_${gateKey}_clear_epistemic_status_invalid`);
    assert(normalizedConfidence >= ORIENTATION_GATE_CLEAR_CONFIDENCE_MINIMUM, `orientation_gate_${gateKey}_clear_confidence_too_low`);
    assert(
      principalActorPattern.test(input.assertedBy) && input.epistemicStatus === "reported",
      `orientation_gate_${gateKey}_clear_requires_principal_report`,
    );
    assert(
      input.sourceRefs.some((ref) => ref.kind === "principal" && ref.id === input.assertedBy),
      `orientation_gate_${gateKey}_clear_requires_principal_source`,
    );
  }
  if (input.status === "unknown") {
    assert(input.epistemicStatus !== "reported", `orientation_gate_${gateKey}_unknown_cannot_be_reported`);
  }
  return {
    status: input.status,
    assertedBy: input.assertedBy,
    epistemicStatus: input.epistemicStatus,
    confidence: normalizedConfidence,
    sourceRefs: normalizeSourceRefs(input.sourceRefs, `orientation_gate_${gateKey}_source_refs`),
  };
}

function normalizeRankingSignals(input) {
  const fields = [
    "hardGateAssessments",
    "movementCriticalMissingInformation", "affectedRelationshipOrUnresolvedRole",
    "consequence", "contradictionOrDispute", "staleness", "informationValue",
    "proofOrCloseConditionGap", "orientationGain", "effort", "assertedBy",
    "epistemicStatus", "confidence", "sourceRefs",
  ];
  exactKeys(input, fields, "orientation_ranking_signals");
  exactKeys(input.hardGateAssessments, hardGateFields.map(([gateKey]) => gateKey), "orientation_hard_gate_assessments");
  const hardGateAssessments = Object.fromEntries(hardGateFields.map(([gateKey]) => [
    gateKey,
    normalizeHardGateAssessment(input.hardGateAssessments[gateKey], gateKey),
  ]));
  for (const key of [
    "movementCriticalMissingInformation",
    "affectedRelationshipOrUnresolvedRole",
    "contradictionOrDispute",
    "proofOrCloseConditionGap",
  ]) {
    assert(typeof input[key] === "boolean", `orientation_ranking_${key}_invalid`);
  }
  boundedString(input.assertedBy, "orientation_ranking_asserted_by", 500, { pattern: attributionActorPattern });
  assert(rankingEpistemicStatuses.has(input.epistemicStatus), "orientation_ranking_epistemic_status_invalid");
  if (machineActorPattern.test(input.assertedBy)) {
    assert(input.epistemicStatus !== "reported", "machine_ranking_signal_must_remain_inference");
  }
  return {
    hardGateAssessments,
    movementCriticalMissingInformation: input.movementCriticalMissingInformation,
    affectedRelationshipOrUnresolvedRole: input.affectedRelationshipOrUnresolvedRole,
    consequence: integerScale(input.consequence, "orientation_ranking_consequence"),
    contradictionOrDispute: input.contradictionOrDispute,
    staleness: integerScale(input.staleness, "orientation_ranking_staleness"),
    informationValue: integerScale(input.informationValue, "orientation_ranking_information_value"),
    proofOrCloseConditionGap: input.proofOrCloseConditionGap,
    orientationGain: integerScale(input.orientationGain, "orientation_ranking_orientation_gain"),
    effort: integerScale(input.effort, "orientation_ranking_effort"),
    assertedBy: input.assertedBy,
    epistemicStatus: input.epistemicStatus,
    confidence: confidence(input.confidence, "orientation_ranking_confidence"),
    sourceRefs: normalizeSourceRefs(input.sourceRefs, "orientation_ranking_source_refs"),
  };
}

function normalizeAxisState(input, questionKey) {
  exactKeys(input, [
    "coverageStatus", "answerStatus", "mappingStatus", "currentAnswer",
    "questionEventRefs", "rankingSignals",
  ], `orientation_axis_${questionKey}`);
  assert(coverageStatuses.has(input.coverageStatus), `orientation_axis_${questionKey}_coverage_invalid`);
  assert(answerStatuses.has(input.answerStatus), `orientation_axis_${questionKey}_answer_status_invalid`);
  assert(mappingStatuses.has(input.mappingStatus), `orientation_axis_${questionKey}_mapping_status_invalid`);
  const questionEventRefs = normalizeQuestionEventRefs(input.questionEventRefs);
  if (input.answerStatus === "unasked") {
    assert(input.coverageStatus === "missing", `orientation_axis_${questionKey}_unasked_coverage_invalid`);
    assert(input.mappingStatus === "unmapped", `orientation_axis_${questionKey}_unasked_mapping_invalid`);
    assert(questionEventRefs.length === 0, `orientation_axis_${questionKey}_unasked_event_forbidden`);
  } else {
    assert(questionEventRefs.length > 0, `orientation_axis_${questionKey}_question_event_required`);
  }
  if (noAnswerStatuses.has(input.answerStatus)) {
    assert(input.currentAnswer === null, `orientation_axis_${questionKey}_${input.answerStatus}_answer_must_be_null`);
  } else {
    assert(input.currentAnswer !== null, `orientation_axis_${questionKey}_answer_required`);
  }
  if (["skipped", "deferred", "withheld"].includes(input.answerStatus)) {
    assert(input.coverageStatus === "missing", `orientation_axis_${questionKey}_${input.answerStatus}_coverage_invalid`);
    assert(["accepted", "corrected"].includes(input.mappingStatus), `orientation_axis_${questionKey}_${input.answerStatus}_mapping_invalid`);
  }
  if (input.answerStatus === "answered") assert(input.mappingStatus === "accepted", `orientation_axis_${questionKey}_answered_mapping_invalid`);
  if (input.answerStatus === "corrected") assert(input.mappingStatus === "corrected", `orientation_axis_${questionKey}_corrected_mapping_invalid`);
  if (input.answerStatus === "proposed") {
    assert(["missing", "partial"].includes(input.coverageStatus), `orientation_axis_${questionKey}_proposed_coverage_invalid`);
    assert(["proposed", "rejected"].includes(input.mappingStatus), `orientation_axis_${questionKey}_proposed_mapping_invalid`);
  }
  if (["unknown", "disputed"].includes(input.answerStatus)) {
    assert(input.coverageStatus === "partial", `orientation_axis_${questionKey}_${input.answerStatus}_coverage_invalid`);
    assert(["accepted", "corrected"].includes(input.mappingStatus), `orientation_axis_${questionKey}_${input.answerStatus}_mapping_invalid`);
  }
  if (input.answerStatus === "not_applicable") {
    assert(input.coverageStatus === "covered", `orientation_axis_${questionKey}_not_applicable_coverage_invalid`);
    assert(["accepted", "corrected"].includes(input.mappingStatus), `orientation_axis_${questionKey}_not_applicable_mapping_invalid`);
  }
  if (input.coverageStatus === "covered") {
    assert(["answered", "corrected", "not_applicable"].includes(input.answerStatus), `orientation_axis_${questionKey}_covered_answer_status_invalid`);
    assert(["accepted", "corrected"].includes(input.mappingStatus), `orientation_axis_${questionKey}_covered_mapping_status_invalid`);
  }
  if (input.mappingStatus === "unmapped") assert(input.answerStatus === "unasked", `orientation_axis_${questionKey}_unmapped_answer_status_invalid`);

  const currentAnswer = input.currentAnswer === null ? null : normalizeAnswer(input.currentAnswer);
  if (currentAnswer) {
    assert(
      questionEventRefs.some((eventRef) => (
        canonicalJson(eventRef.selectionReceiptRef) === canonicalJson(currentAnswer.selectionReceiptRef)
      )),
      `orientation_axis_${questionKey}_answer_receipt_not_in_question_events`,
    );
  }
  const rankingSignals = normalizeRankingSignals(input.rankingSignals);
  if (currentAnswer && machineActorPattern.test(currentAnswer.assertedBy)) {
    assert(input.answerStatus === "proposed", `orientation_axis_${questionKey}_machine_answer_must_remain_proposed`);
    assert(["proposed", "rejected"].includes(input.mappingStatus), `orientation_axis_${questionKey}_machine_mapping_must_remain_proposed`);
  }
  if (input.answerStatus === "disputed") {
    assert(currentAnswer.disputeStatus === "disputed", `orientation_axis_${questionKey}_dispute_status_required`);
    assert(rankingSignals.contradictionOrDispute, `orientation_axis_${questionKey}_dispute_signal_required`);
  }
  if (input.coverageStatus === "stale") {
    assert(["answered", "corrected"].includes(input.answerStatus), `orientation_axis_${questionKey}_stale_answer_status_invalid`);
    assert(currentAnswer.freshness === "stale", `orientation_axis_${questionKey}_stale_freshness_required`);
    assert(rankingSignals.staleness > 0, `orientation_axis_${questionKey}_staleness_signal_required`);
  }
  return {
    coverageStatus: input.coverageStatus,
    answerStatus: input.answerStatus,
    mappingStatus: input.mappingStatus,
    currentAnswer,
    questionEventRefs,
    rankingSignals,
  };
}

function normalizeMediumHypothesis(input) {
  exactKeys(input, ["medium", "epistemicStatus", "proposalStatus", "confidence", "sourceRefs", "updatedAt"], "orientation_medium_hypothesis");
  assert(media.has(input.medium), "orientation_medium_invalid");
  assert(input.epistemicStatus === "hypothesized", "orientation_medium_must_remain_hypothesized");
  assert(input.proposalStatus === "proposed", "orientation_medium_must_remain_proposed");
  return {
    medium: input.medium,
    epistemicStatus: "hypothesized",
    proposalStatus: "proposed",
    confidence: confidence(input.confidence, "orientation_medium_confidence"),
    sourceRefs: normalizeSourceRefs(input.sourceRefs, "orientation_medium_source_refs"),
    updatedAt: timestamp(input.updatedAt, "orientation_medium_updated_at"),
  };
}

function normalizeQuestionOrderHypothesis(input) {
  exactKeys(input, ["questionKeys", "epistemicStatus", "proposalStatus", "confidence", "sourceRefs", "updatedAt"], "orientation_order_hypothesis");
  assert(input.epistemicStatus === "hypothesized", "orientation_order_must_remain_hypothesized");
  assert(input.proposalStatus === "proposed", "orientation_order_must_remain_proposed");
  return {
    questionKeys: normalizeQuestionKeys(input.questionKeys, "orientation_order_question_keys"),
    epistemicStatus: "hypothesized",
    proposalStatus: "proposed",
    confidence: confidence(input.confidence, "orientation_order_confidence"),
    sourceRefs: normalizeSourceRefs(input.sourceRefs, "orientation_order_source_refs"),
    updatedAt: timestamp(input.updatedAt, "orientation_order_updated_at"),
  };
}

function normalizePresentationProfileHypotheses(input) {
  exactKeys(input, ["preferredMedia", "preferredQuestionOrder"], "orientation_presentation_profile_hypotheses");
  assert(Array.isArray(input.preferredMedia) && input.preferredMedia.length <= media.size, "orientation_preferred_media_invalid");
  const preferredMedia = input.preferredMedia.map(normalizeMediumHypothesis);
  assert(new Set(preferredMedia.map((item) => item.medium)).size === preferredMedia.length, "orientation_preferred_medium_duplicate");
  const preferredQuestionOrder = input.preferredQuestionOrder === null
    ? null
    : normalizeQuestionOrderHypothesis(input.preferredQuestionOrder);
  return { preferredMedia, preferredQuestionOrder };
}

function normalizeSourceQuestionPacket(input) {
  assert(canonicalJson(input) === canonicalJson(ORIENTATION_QUESTION_PACKET), "orientation_question_packet_invalid");
  return { ...ORIENTATION_QUESTION_PACKET };
}

function normalizeRankingPolicy(input) {
  assert(canonicalJson(input) === canonicalJson(ORIENTATION_RANKING_POLICY), "orientation_ranking_policy_invalid");
  return {
    policyVersion: ORIENTATION_RANKING_POLICY.policyVersion,
    promptSetVersion: ORIENTATION_RANKING_POLICY.promptSetVersion,
    promptSetSha256: ORIENTATION_RANKING_POLICY.promptSetSha256,
    maximumResults: ORIENTATION_RANKING_POLICY.maximumResults,
    gateClearConfidenceMinimum: ORIENTATION_RANKING_POLICY.gateClearConfidenceMinimum,
    presentationOrderRole: ORIENTATION_RANKING_POLICY.presentationOrderRole,
    semanticPriorityOrder: [...ORIENTATION_RANKING_POLICY.semanticPriorityOrder],
    tieBreakOrder: [...ORIENTATION_RANKING_POLICY.tieBreakOrder],
    canonicalOrder: [...ORIENTATION_QUESTION_KEYS],
  };
}

export function normalizeOrientationMap(input) {
  exactKeys(input, [
    "schemaVersion", "orientationMapId", "revision", "principalRef", "scopeRef",
    "relationshipRef", "arenaRef", "sourceQuestionPacket", "axes",
    "presentationProfileHypotheses", "rankingPolicy", "canonicalState",
    "projectionStatus", "createdAt", "updatedAt",
  ], "orientation_map");
  assert(input.schemaVersion === ORIENTATION_MAP_SCHEMA_VERSION, "orientation_map_schema_invalid");
  assert(input.canonicalState === false, "orientation_map_canonical_state_must_be_false");
  assert(input.projectionStatus === "proposed", "orientation_map_projection_must_remain_proposed");
  boundedString(input.orientationMapId, "orientation_map_id", 500);
  assert(Number.isSafeInteger(input.revision) && input.revision >= 1, "orientation_map_revision_invalid");
  boundedString(input.principalRef, "orientation_map_principal_ref", 500, { pattern: principalActorPattern });
  exactKeys(input.axes, ORIENTATION_QUESTION_KEYS, "orientation_axes");
  const axes = Object.fromEntries(
    ORIENTATION_QUESTION_KEYS.map((questionKey) => [questionKey, normalizeAxisState(input.axes[questionKey], questionKey)]),
  );
  for (const axis of Object.values(axes)) {
    for (const [gateKey] of hardGateFields) {
      const assessment = axis.rankingSignals.hardGateAssessments[gateKey];
      if (assessment.status === "clear") {
        assert(
          assessment.assertedBy === input.principalRef,
          `orientation_gate_${gateKey}_clear_wrong_principal`,
        );
      }
    }
  }
  const scopeRef = normalizeRecordRef(input.scopeRef, { scope: true });
  if (scopeRef.kind === "principal") {
    assert(scopeRef.id === input.principalRef, "orientation_scope_principal_mismatch");
  }
  const createdAt = timestamp(input.createdAt, "orientation_map_created_at");
  const updatedAt = timestamp(input.updatedAt, "orientation_map_updated_at");
  const presentationProfileHypotheses = normalizePresentationProfileHypotheses(input.presentationProfileHypotheses);
  assert(Date.parse(createdAt) <= Date.parse(updatedAt), "orientation_map_timestamp_order_invalid");
  for (const [questionKey, axis] of Object.entries(axes)) {
    if (axis.currentAnswer !== null) {
      assert(
        Date.parse(axis.currentAnswer.updatedAt) <= Date.parse(updatedAt),
        `orientation_axis_${questionKey}_answer_newer_than_map`,
      );
    }
  }
  for (const hypothesis of presentationProfileHypotheses.preferredMedia) {
    assert(
      Date.parse(hypothesis.updatedAt) <= Date.parse(updatedAt),
      "orientation_medium_hypothesis_newer_than_map",
    );
  }
  if (presentationProfileHypotheses.preferredQuestionOrder !== null) {
    assert(
      Date.parse(presentationProfileHypotheses.preferredQuestionOrder.updatedAt) <= Date.parse(updatedAt),
      "orientation_order_hypothesis_newer_than_map",
    );
  }
  return {
    schemaVersion: ORIENTATION_MAP_SCHEMA_VERSION,
    orientationMapId: input.orientationMapId,
    revision: input.revision,
    principalRef: input.principalRef,
    scopeRef,
    relationshipRef: input.relationshipRef === null ? null : normalizeRecordRef(input.relationshipRef, { kind: "relationship" }),
    arenaRef: input.arenaRef === null ? null : normalizeRecordRef(input.arenaRef, { kind: "arena" }),
    sourceQuestionPacket: normalizeSourceQuestionPacket(input.sourceQuestionPacket),
    axes,
    presentationProfileHypotheses,
    rankingPolicy: normalizeRankingPolicy(input.rankingPolicy),
    canonicalState: false,
    projectionStatus: "proposed",
    createdAt,
    updatedAt,
  };
}

export function orientationMapSemanticState(input) {
  const normalized = normalizeOrientationMap(input);
  return {
    schemaVersion: normalized.schemaVersion,
    orientationMapId: normalized.orientationMapId,
    principalRef: normalized.principalRef,
    scopeRef: normalized.scopeRef,
    relationshipRef: normalized.relationshipRef,
    arenaRef: normalized.arenaRef,
    sourceQuestionPacket: normalized.sourceQuestionPacket,
    axes: Object.fromEntries(ORIENTATION_QUESTION_KEYS.map((questionKey) => [questionKey, {
      coverageStatus: normalized.axes[questionKey].coverageStatus,
      answerStatus: normalized.axes[questionKey].answerStatus,
      mappingStatus: normalized.axes[questionKey].mappingStatus,
      currentAnswer: normalized.axes[questionKey].currentAnswer,
      questionEventRefs: normalized.axes[questionKey].questionEventRefs,
      hardGateAssessments: normalized.axes[questionKey].rankingSignals.hardGateAssessments,
    }])),
  };
}

function digest(value) {
  return hashCanonical(value).replace(/^sha256:/, "");
}

export function orientationMapSemanticSha256(input) {
  return digest(orientationMapSemanticState(input));
}

export function orientationMapPresentationProfileSha256(input) {
  return digest(normalizeOrientationMap(input).presentationProfileHypotheses);
}

export function orientationMapMaterializationSha256(input) {
  return digest(normalizeOrientationMap(input));
}

function normalizeCurrentTurnQuestionOrder(input) {
  exactKeys(input, ["questionKeys", "assertedBy", "sourceRefs", "recordedAt"], "orientation_current_turn_order");
  boundedString(input.assertedBy, "orientation_current_turn_order_asserted_by", 500, { pattern: principalActorPattern });
  return {
    questionKeys: normalizeQuestionKeys(input.questionKeys, "orientation_current_turn_question_keys"),
    assertedBy: input.assertedBy,
    sourceRefs: normalizeSourceRefs(input.sourceRefs, "orientation_current_turn_order_source_refs"),
    recordedAt: timestamp(input.recordedAt, "orientation_current_turn_order_recorded_at"),
  };
}

function normalizeAcceptedQuestionOrderPreference(input) {
  exactKeys(input, [
    "evidenceSchemaVersion", "viewKind", "fieldPath", "activeScopeRefs",
    "questionKeys", "status", "preferenceHash", "preferenceRefs", "principalRef",
  ], "orientation_accepted_order_preference");
  assert(
    input.evidenceSchemaVersion === "yawn.orientation-question-order-preference-evidence.v1",
    "orientation_order_preference_evidence_schema_invalid",
  );
  assert(input.viewKind === "orientation_inquiry", "orientation_order_preference_view_kind_invalid");
  assert(input.fieldPath === "/question/defaultAxisOrder", "orientation_order_preference_field_path_invalid");
  assert(input.status === "accepted", "orientation_order_preference_must_be_accepted");
  assert(typeof input.preferenceHash === "string" && sha256Pattern.test(input.preferenceHash), "orientation_order_preference_hash_invalid");
  boundedString(input.principalRef, "orientation_order_preference_principal_ref", 500, { pattern: principalActorPattern });
  assert(Array.isArray(input.activeScopeRefs) && input.activeScopeRefs.length > 0 && input.activeScopeRefs.length <= 100, "orientation_order_preference_active_scope_refs_required");
  const activeScopeRefs = input.activeScopeRefs.map((ref) => normalizeRecordRef(ref, { scope: true }));
  assert(
    new Set(activeScopeRefs.map((ref) => canonicalJson(ref))).size === activeScopeRefs.length,
    "orientation_order_preference_active_scope_ref_duplicate",
  );
  assert(
    activeScopeRefs.some((ref) => ref.kind === "principal" && ref.id === input.principalRef),
    "orientation_order_preference_principal_scope_required",
  );
  assert(
    activeScopeRefs.every((ref) => ref.kind !== "principal" || ref.id === input.principalRef),
    "orientation_order_preference_principal_scope_mismatch",
  );
  assert(Array.isArray(input.preferenceRefs) && input.preferenceRefs.length === 1, "orientation_order_preference_requires_one_winning_ref");
  const preferenceRefs = input.preferenceRefs.map((ref) => {
    exactKeys(ref, ["preferenceId", "revision", "stateSha256", "scopeRef"], "orientation_order_preference_ref");
    boundedString(ref.preferenceId, "orientation_order_preference_id", 500);
    assert(Number.isSafeInteger(ref.revision) && ref.revision >= 1, "orientation_order_preference_revision_invalid");
    assert(typeof ref.stateSha256 === "string" && sha256Pattern.test(ref.stateSha256), "orientation_order_preference_state_sha_invalid");
    return {
      preferenceId: ref.preferenceId,
      revision: ref.revision,
      stateSha256: ref.stateSha256,
      scopeRef: normalizeRecordRef(ref.scopeRef, { scope: true }),
    };
  }).sort((left, right) => codeUnitCompare(left.preferenceId, right.preferenceId));
  assert(new Set(preferenceRefs.map(({ preferenceId }) => preferenceId)).size === preferenceRefs.length, "orientation_order_preference_id_duplicate");
  const questionKeys = normalizeQuestionKeys(input.questionKeys, "orientation_accepted_order_question_keys");
  const evidenceState = {
    schemaVersion: input.evidenceSchemaVersion,
    viewKind: input.viewKind,
    principalRef: input.principalRef,
    activeScopeRefs,
    fieldPath: input.fieldPath,
    questionKeys,
    preferenceRefs,
  };
  assert(digest(evidenceState) === input.preferenceHash, "orientation_order_preference_hash_mismatch");
  return {
    evidenceSchemaVersion: input.evidenceSchemaVersion,
    viewKind: input.viewKind,
    fieldPath: input.fieldPath,
    activeScopeRefs,
    questionKeys,
    status: "accepted",
    preferenceHash: input.preferenceHash,
    preferenceRefs,
    principalRef: input.principalRef,
  };
}

function normalizeSelectionHold(input) {
  exactKeys(input, ["reasonCode", "description", "assertedBy", "sourceRefs", "reopenCondition"], "orientation_selection_hold");
  assert(selectionOptionHoldReasonCodes.has(input.reasonCode), "orientation_hold_reason_code_invalid");
  boundedString(input.assertedBy, "orientation_hold_asserted_by", 500, { pattern: attributionActorPattern });
  if (input.reasonCode === "explicit_principal_pause") {
    assert(principalActorPattern.test(input.assertedBy), "orientation_principal_pause_requires_principal");
  }
  return {
    reasonCode: input.reasonCode,
    description: boundedString(input.description, "orientation_hold_description", 2000),
    assertedBy: input.assertedBy,
    sourceRefs: normalizeSourceRefs(input.sourceRefs, "orientation_hold_source_refs"),
    reopenCondition: boundedString(input.reopenCondition, "orientation_hold_reopen_condition", 2000),
  };
}

function normalizeSelectionOptions(options = {}) {
  allowedKeys(options, ["limit", "currentTurnQuestionOrder", "acceptedQuestionOrderPreference", "hold"], "orientation_selection_options");
  const limit = options.limit === undefined ? 3 : options.limit;
  assert(Number.isInteger(limit) && limit >= 1 && limit <= ORIENTATION_RANKING_POLICY.maximumResults, "orientation_ranking_limit_invalid");
  return {
    limit,
    currentTurnQuestionOrder: options.currentTurnQuestionOrder == null ? null : normalizeCurrentTurnQuestionOrder(options.currentTurnQuestionOrder),
    acceptedQuestionOrderPreference: options.acceptedQuestionOrderPreference == null ? null : normalizeAcceptedQuestionOrderPreference(options.acceptedQuestionOrderPreference),
    hold: options.hold == null ? null : normalizeSelectionHold(options.hold),
  };
}

function exclusionReasons(axis) {
  if (axis.answerStatus === "withheld") return ["withheld_for_current_revision"];
  if (axis.answerStatus === "skipped") return ["skipped_for_current_revision"];
  if (axis.answerStatus === "deferred") return ["deferred_for_current_revision"];
  if (axis.answerStatus === "not_applicable") return ["accepted_not_applicable"];
  if (
    axis.coverageStatus === "covered" &&
    ["accepted", "corrected"].includes(axis.mappingStatus) &&
    ["answered", "corrected"].includes(axis.answerStatus)
  ) return ["accepted_complete_answer"];
  return [];
}

function activeHardGateCodes(axis) {
  return hardGateFields
    .filter(([gateKey]) => axis.rankingSignals.hardGateAssessments[gateKey].status !== "clear")
    .map(([, code]) => code);
}

function hardGatePriority(axis, gateKey) {
  const status = axis.rankingSignals.hardGateAssessments[gateKey].status;
  return status === "active" ? 2 : status === "unknown" ? 1 : 0;
}

function assessCandidate(axis) {
  const hardGateCodes = activeHardGateCodes(axis);
  const ordinaryExclusions = exclusionReasons(axis);
  if (hardGateCodes.length > 0 && gateSuppressedAnswerStatuses.has(axis.answerStatus)) {
    return {
      eligible: false,
      requiresHold: true,
      hardGateCodes,
      exclusionReasons: ordinaryExclusions,
    };
  }
  if (hardGateCodes.length > 0) {
    return {
      eligible: true,
      requiresHold: false,
      hardGateCodes,
      exclusionReasons: [],
    };
  }
  return {
    eligible: ordinaryExclusions.length === 0,
    requiresHold: false,
    hardGateCodes,
    exclusionReasons: ordinaryExclusions,
  };
}

function selectionContext(options) {
  const explicitQuestionOrder = options.currentTurnQuestionOrder?.questionKeys ?? [];
  const acceptedQuestionOrder = options.acceptedQuestionOrderPreference?.questionKeys ?? [];
  if (options.currentTurnQuestionOrder) {
    return {
      explicitQuestionOrder,
      acceptedQuestionOrder,
      questionOrderSource: "explicit_current_turn",
      questionOrderEvidence: options.currentTurnQuestionOrder,
      acceptedPreferenceHash: options.acceptedQuestionOrderPreference?.preferenceHash ?? null,
    };
  }
  if (options.acceptedQuestionOrderPreference) {
    return {
      explicitQuestionOrder,
      acceptedQuestionOrder,
      questionOrderSource: "accepted_preference",
      questionOrderEvidence: options.acceptedQuestionOrderPreference,
      acceptedPreferenceHash: options.acceptedQuestionOrderPreference.preferenceHash,
    };
  }
  return {
    explicitQuestionOrder,
    acceptedQuestionOrder,
    questionOrderSource: "canonical",
    questionOrderEvidence: null,
    acceptedPreferenceHash: null,
  };
}

function rankKeyFor(questionKey, axis, context) {
  const canonicalOrderIndex = ORIENTATION_QUESTION_KEYS.indexOf(questionKey);
  const explicitPosition = context.explicitQuestionOrder.indexOf(questionKey);
  const acceptedPosition = context.acceptedQuestionOrder.indexOf(questionKey);
  const selectedPresentationOrder = context.questionOrderSource === "explicit_current_turn"
    ? context.explicitQuestionOrder
    : context.acceptedQuestionOrder;
  const preferredPosition = selectedPresentationOrder.indexOf(questionKey);
  const questionOrderIndex = preferredPosition === -1
    ? ORIENTATION_QUESTION_KEYS.length + canonicalOrderIndex
    : preferredPosition;
  const answerConfidenceGap = axis.currentAnswer === null
    ? 100
    : 100 - Math.round(axis.currentAnswer.confidence * 100);
  const signals = axis.rankingSignals;
  return {
    immediateSafetyOrStabilityBlocker: hardGatePriority(axis, "immediateSafetyOrStability"),
    authorityOrConsentBlocker: hardGatePriority(axis, "authorityOrConsent"),
    privacyVisibilityOrEgressBlocker: hardGatePriority(axis, "privacyVisibilityOrEgress"),
    sourceOrProvenanceLossBlocker: hardGatePriority(axis, "sourceOrProvenance"),
    proofOrFalsifierIntegrityBlocker: hardGatePriority(axis, "proofOrFalsifierIntegrity"),
    movementCriticalMissingInformation: Number(signals.movementCriticalMissingInformation),
    affectedRelationshipOrUnresolvedRole: Number(signals.affectedRelationshipOrUnresolvedRole),
    consequenceConfidenceGap: signals.consequence * answerConfidenceGap,
    contradictionOrDispute: Number(signals.contradictionOrDispute || axis.answerStatus === "disputed"),
    staleHighImpact: signals.staleness * signals.consequence,
    informationValue: signals.informationValue,
    proofOrCloseConditionGap: Number(signals.proofOrCloseConditionGap),
    orientationGain: signals.orientationGain,
    effortDenominator: signals.effort + 1,
    explicitCurrentTurnOrderIndex: explicitPosition === -1 ? ORIENTATION_QUESTION_KEYS.length : explicitPosition,
    acceptedQuestionOrderIndex: acceptedPosition === -1 ? ORIENTATION_QUESTION_KEYS.length : acceptedPosition,
    questionOrderIndex,
    canonicalOrderIndex,
  };
}

function compareCandidates(left, right) {
  for (const field of [
    ...hardGateFields.map(([, , rankField]) => rankField),
    "movementCriticalMissingInformation",
    "affectedRelationshipOrUnresolvedRole",
    "consequenceConfidenceGap",
    "contradictionOrDispute",
    "staleHighImpact",
    "informationValue",
    "proofOrCloseConditionGap",
  ]) {
    if (left.rankKey[field] !== right.rankKey[field]) return right.rankKey[field] - left.rankKey[field];
  }
  const leftGain = left.rankKey.orientationGain * right.rankKey.effortDenominator;
  const rightGain = right.rankKey.orientationGain * left.rankKey.effortDenominator;
  if (leftGain !== rightGain) return rightGain - leftGain;
  if (left.rankKey.effortDenominator !== right.rankKey.effortDenominator) {
    return left.rankKey.effortDenominator - right.rankKey.effortDenominator;
  }
  if (left.rankKey.explicitCurrentTurnOrderIndex !== right.rankKey.explicitCurrentTurnOrderIndex) {
    return left.rankKey.explicitCurrentTurnOrderIndex - right.rankKey.explicitCurrentTurnOrderIndex;
  }
  if (left.rankKey.acceptedQuestionOrderIndex !== right.rankKey.acceptedQuestionOrderIndex) {
    return left.rankKey.acceptedQuestionOrderIndex - right.rankKey.acceptedQuestionOrderIndex;
  }
  return left.rankKey.canonicalOrderIndex - right.rankKey.canonicalOrderIndex;
}

function decisiveTieBreakStage(left, right) {
  for (const [, , rankField] of hardGateFields) {
    if (left.rankKey[rankField] !== right.rankKey[rankField]) return "hard_gate_priority";
  }
  for (const field of [
    "movementCriticalMissingInformation",
    "affectedRelationshipOrUnresolvedRole",
    "consequenceConfidenceGap",
    "contradictionOrDispute",
    "staleHighImpact",
    "informationValue",
    "proofOrCloseConditionGap",
  ]) {
    if (left.rankKey[field] !== right.rankKey[field]) return "greater_semantic_priority";
  }
  const leftGain = left.rankKey.orientationGain * right.rankKey.effortDenominator;
  const rightGain = right.rankKey.orientationGain * left.rankKey.effortDenominator;
  if (leftGain !== rightGain) return "greater_semantic_priority";
  if (left.rankKey.effortDenominator !== right.rankKey.effortDenominator) {
    return "lower_answer_burden";
  }
  if (left.rankKey.explicitCurrentTurnOrderIndex !== right.rankKey.explicitCurrentTurnOrderIndex) {
    return "explicit_current_turn_choice";
  }
  if (left.rankKey.acceptedQuestionOrderIndex !== right.rankKey.acceptedQuestionOrderIndex) {
    return "accepted_question_order_preference";
  }
  return "canonical_question_order";
}

function deterministicTieBreakTrace(sortedCandidates) {
  if (sortedCandidates.length === 0) {
    return {
      ruleOrder: [...ORIENTATION_TIE_BREAK_ORDER],
      appliedThrough: "not_needed",
      finalistQuestionKeys: [],
    };
  }
  if (sortedCandidates.length === 1) {
    return {
      ruleOrder: [...ORIENTATION_TIE_BREAK_ORDER],
      appliedThrough: "not_needed",
      finalistQuestionKeys: [sortedCandidates[0].questionKey],
    };
  }
  const winner = sortedCandidates[0];
  const stageIndex = Math.max(...sortedCandidates.slice(1).map((candidate) => (
    ORIENTATION_TIE_BREAK_ORDER.indexOf(decisiveTieBreakStage(winner, candidate))
  )));
  return {
    ruleOrder: [...ORIENTATION_TIE_BREAK_ORDER],
    appliedThrough: ORIENTATION_TIE_BREAK_ORDER[stageIndex],
    finalistQuestionKeys: [winner.questionKey],
  };
}

function rationaleCodes(axis, rankKey) {
  const reasons = [];
  for (const [gateKey, code] of hardGateFields) if (hardGatePriority(axis, gateKey) > 0) reasons.push(code);
  if (axis.rankingSignals.movementCriticalMissingInformation) reasons.push("movement_critical_missing_information");
  if (axis.rankingSignals.affectedRelationshipOrUnresolvedRole) reasons.push("affected_relationship_or_unresolved_role");
  if (rankKey.consequenceConfidenceGap > 0) reasons.push("high_consequence_low_confidence");
  if (rankKey.contradictionOrDispute) reasons.push("contradiction_or_dispute");
  if (rankKey.staleHighImpact > 0) reasons.push("stale_high_impact_information");
  if (rankKey.informationValue > 0) reasons.push("expected_information_value");
  if (axis.rankingSignals.proofOrCloseConditionGap) reasons.push("proof_or_close_condition_gap");
  if (rankKey.orientationGain > 0) reasons.push("orientation_gain_per_effort");
  if (axis.rankingSignals.effort === 0) reasons.push("lower_effort");
  return reasons.length > 0 ? reasons : ["unresolved_orientation_axis"];
}

function hardGateResults(axis) {
  return Object.fromEntries(hardGateFields.map(([gateKey, code]) => {
    const assessment = axis.rankingSignals.hardGateAssessments[gateKey];
    return [code, {
      active: assessment.status !== "clear",
      assessmentStatus: assessment.status,
      assertedBy: assessment.assertedBy,
      epistemicStatus: assessment.epistemicStatus,
      confidence: assessment.confidence,
      sourceRefs: assessment.sourceRefs,
    }];
  }));
}

function semanticPriorityInputs(axis, rankKey) {
  return {
    movementCriticalMissingInformation: axis.rankingSignals.movementCriticalMissingInformation,
    affectedRelationshipOrUnresolvedRole: axis.rankingSignals.affectedRelationshipOrUnresolvedRole,
    consequence: axis.rankingSignals.consequence,
    consequenceConfidenceGap: rankKey.consequenceConfidenceGap,
    answerConfidence: axis.currentAnswer?.confidence ?? null,
    contradictionOrDispute: Boolean(rankKey.contradictionOrDispute),
    staleness: axis.rankingSignals.staleness,
    staleHighImpact: rankKey.staleHighImpact,
    informationValue: axis.rankingSignals.informationValue,
    proofOrCloseConditionGap: axis.rankingSignals.proofOrCloseConditionGap,
    orientationGain: axis.rankingSignals.orientationGain,
    effort: axis.rankingSignals.effort,
    assertedBy: axis.rankingSignals.assertedBy,
    epistemicStatus: axis.rankingSignals.epistemicStatus,
    rankingSignalConfidence: axis.rankingSignals.confidence,
    sourceRefs: axis.rankingSignals.sourceRefs,
  };
}

function sourceRefsForQuestionKeys(map, questionKeys) {
  const refs = questionKeys.flatMap((questionKey) => {
    const signals = map.axes[questionKey].rankingSignals;
    return [
      ...signals.sourceRefs,
      ...Object.values(signals.hardGateAssessments)
        .filter(({ status }) => status !== "clear")
        .flatMap(({ sourceRefs }) => sourceRefs),
    ];
  });
  if (refs.length === 0) return [map.scopeRef];
  const byCanonicalRef = new Map(refs.map((ref) => [canonicalJson(ref), ref]));
  return [...byCanonicalRef.entries()]
    .sort(([left], [right]) => codeUnitCompare(left, right))
    .map(([, ref]) => ref);
}

function hardGateHold(map, blockedQuestionKeys, eligibleQuestionKeys) {
  const gateCodes = [...new Set(blockedQuestionKeys.flatMap((questionKey) => activeHardGateCodes(map.axes[questionKey])))];
  const reasonCode = eligibleQuestionKeys.length === 0
    ? "no_candidate_survives_hard_gates"
    : "unforegroundable_live_hard_gate";
  return {
    reasonCode,
    description: `Selection is held because a live hard gate on ${blockedQuestionKeys.join(", ")} cannot be foregrounded while that axis is skipped, deferred, or withheld (${gateCodes.join(", ")}).`,
    assertedBy: "system:orientation-selector",
    sourceRefs: sourceRefsForQuestionKeys(map, blockedQuestionKeys),
    reopenCondition: "The principal reopens the affected axis, or attributed evidence clears the live hard gate.",
  };
}

function automaticHold(map, reasonCode) {
  if (reasonCode === "all_remaining_axes_deferred_or_withheld") {
    return {
      reasonCode,
      description: "Every unresolved orientation axis is currently deferred or withheld.",
      assertedBy: "system:orientation-selector",
      sourceRefs: sourceRefsForQuestionKeys(
        map,
        ORIENTATION_QUESTION_KEYS.filter((questionKey) => ["deferred", "withheld"].includes(map.axes[questionKey].answerStatus)),
      ),
      reopenCondition: "The principal reopens a deferred or withheld orientation axis.",
    };
  }
  if (reasonCode === "no_currently_askable_orientation_axis") {
    return {
      reasonCode,
      description: "Every unresolved orientation axis is skipped, deferred, or withheld for the current revision.",
      assertedBy: "system:orientation-selector",
      sourceRefs: sourceRefsForQuestionKeys(
        map,
        ORIENTATION_QUESTION_KEYS.filter((questionKey) => gateSuppressedAnswerStatuses.has(map.axes[questionKey].answerStatus)),
      ),
      reopenCondition: "The principal reopens a skipped, deferred, or withheld orientation axis, or the map advances to a new revision.",
    };
  }
  return {
    reasonCode: "no_unresolved_orientation_axis",
    description: "No orientation axis is currently eligible for another question.",
    assertedBy: "system:orientation-selector",
    sourceRefs: [map.scopeRef],
    reopenCondition: "An answer, mapping, source, relationship, Arena, or proof state changes.",
  };
}

function prepareSelection(input, rawOptions = {}) {
  const map = normalizeOrientationMap(input);
  const options = normalizeSelectionOptions(rawOptions);
  if (options.currentTurnQuestionOrder) {
    assert(
      options.currentTurnQuestionOrder.assertedBy === map.principalRef,
      "orientation_current_turn_order_wrong_principal",
    );
    assert(
      Date.parse(options.currentTurnQuestionOrder.recordedAt) >= Date.parse(map.updatedAt),
      "orientation_current_turn_order_predates_map",
    );
  }
  if (options.acceptedQuestionOrderPreference) {
    assert(
      options.acceptedQuestionOrderPreference.principalRef === map.principalRef,
      "orientation_order_preference_wrong_principal",
    );
    const allowedScopeRefs = [
      { kind: "principal", id: map.principalRef },
      { kind: "view", id: "view:default" },
      map.scopeRef,
      map.arenaRef,
    ].filter(Boolean);
    const allowedScopeKeys = new Set(allowedScopeRefs.map((ref) => canonicalJson(ref)));
    assert(
      options.acceptedQuestionOrderPreference.activeScopeRefs.every(
        (ref) => allowedScopeKeys.has(canonicalJson(ref)),
      ),
      "orientation_order_preference_active_scope_outside_map_context",
    );
    const activeScopeKeys = new Set(
      options.acceptedQuestionOrderPreference.activeScopeRefs.map((ref) => canonicalJson(ref)),
    );
    assert(
      options.acceptedQuestionOrderPreference.preferenceRefs.every(
        (ref) => activeScopeKeys.has(canonicalJson(ref.scopeRef)),
      ),
      "orientation_order_preference_ref_scope_not_active",
    );
  }
  if (options.hold?.reasonCode === "explicit_principal_pause") {
    assert(options.hold.assertedBy === map.principalRef, "orientation_principal_pause_wrong_principal");
  }
  const context = selectionContext(options);
  const candidateAssessments = Object.fromEntries(
    ORIENTATION_QUESTION_KEYS.map((questionKey) => [questionKey, assessCandidate(map.axes[questionKey])]),
  );
  const hardGateBlockedQuestionKeys = ORIENTATION_QUESTION_KEYS.filter(
    (questionKey) => candidateAssessments[questionKey].requiresHold,
  );
  const eligibleQuestionKeys = ORIENTATION_QUESTION_KEYS.filter(
    (questionKey) => candidateAssessments[questionKey].eligible,
  );
  const foregroundHardGateQuestionKeys = eligibleQuestionKeys.filter(
    (questionKey) => candidateAssessments[questionKey].hardGateCodes.length > 0,
  );
  const foregroundGateKeys = hardGateFields
    .filter(([assessmentKey]) => ORIENTATION_QUESTION_KEYS.some(
      (questionKey) => (
        candidateAssessments[questionKey].eligible
        && map.axes[questionKey].rankingSignals.hardGateAssessments[assessmentKey].status !== "clear"
      ),
    ))
    .map(([, , , receiptGateKey]) => receiptGateKey);
  if (
    options.hold
    && options.hold.reasonCode !== "explicit_principal_pause"
    && foregroundHardGateQuestionKeys.length > 0
  ) {
    throw new Error("orientation_hold_cannot_bypass_live_hard_gate");
  }
  const suppressedQuestionKeys = ORIENTATION_QUESTION_KEYS.filter(
    (questionKey) => gateSuppressedAnswerStatuses.has(map.axes[questionKey].answerStatus),
  );
  let hold = null;
  if (hardGateBlockedQuestionKeys.length > 0) {
    hold = hardGateHold(map, hardGateBlockedQuestionKeys, eligibleQuestionKeys);
  } else if (options.hold) {
    hold = options.hold;
  } else if (eligibleQuestionKeys.length === 0) {
    hold = automaticHold(
      map,
      suppressedQuestionKeys.length === 0
        ? "no_unresolved_orientation_axis"
        : suppressedQuestionKeys.every((questionKey) => ["deferred", "withheld"].includes(map.axes[questionKey].answerStatus))
          ? "all_remaining_axes_deferred_or_withheld"
          : "no_currently_askable_orientation_axis",
    );
  }
  return {
    map,
    options,
    context,
    candidateAssessments,
    hardGateBlockedQuestionKeys,
    foregroundHardGateQuestionKeys,
    foregroundGateKeys,
    eligibleQuestionKeys,
    hold,
  };
}

function rankingInputState(prepared) {
  const {
    map,
    options,
    context,
    candidateAssessments,
    hardGateBlockedQuestionKeys,
    foregroundHardGateQuestionKeys,
    foregroundGateKeys,
    eligibleQuestionKeys,
    hold,
  } = prepared;
  return {
    schemaVersion: "yawn.inquiry-selection-input.v0.1",
    orientationMapRef: { id: map.orientationMapId, revision: map.revision },
    orientationMapUpdatedAt: map.updatedAt,
    principalRef: map.principalRef,
    scopeRef: map.scopeRef,
    relationshipRef: map.relationshipRef,
    arenaRef: map.arenaRef,
    orientationSemanticSha256: orientationMapSemanticSha256(map),
    sourceQuestionPacket: map.sourceQuestionPacket,
    promptSetVersion: ORIENTATION_PROMPT_SET_VERSION,
    promptSetSha256: ORIENTATION_PROMPT_SET_SHA256,
    prompts: ORIENTATION_PROMPTS,
    gatePromptOverlay: {
      promptVariant: "gated",
      orderedGateClauses: ORIENTATION_GATE_PROMPT_CLAUSES,
      exactTemplate: ORIENTATION_GATE_PROMPT_TEMPLATE,
    },
    policyVersion: ORIENTATION_RANKING_POLICY_VERSION,
    rankingPolicy: map.rankingPolicy,
    candidateQuestionKeys: eligibleQuestionKeys,
    candidateAssessments,
    hardGateBlockedQuestionKeys,
    foregroundHardGateQuestionKeys,
    foregroundGateKeys,
    axisControlInputs: Object.fromEntries(ORIENTATION_QUESTION_KEYS.map((questionKey) => [questionKey, {
      coverageStatus: map.axes[questionKey].coverageStatus,
      answerStatus: map.axes[questionKey].answerStatus,
      mappingStatus: map.axes[questionKey].mappingStatus,
      rankingSignals: map.axes[questionKey].rankingSignals,
    }])),
    currentTurnQuestionOrder: options.currentTurnQuestionOrder,
    acceptedQuestionOrderPreference: options.acceptedQuestionOrderPreference,
    requestedHold: options.hold,
    questionOrderSource: context.questionOrderSource,
    limit: options.limit,
    hold,
  };
}

export function orientationMapRankingInputSha256(input, options = {}) {
  return digest(rankingInputState(prepareSelection(input, options)));
}

export function rankNextOrientationQuestions(input, rawOptions = {}) {
  const prepared = prepareSelection(input, rawOptions);
  const {
    map,
    options,
    context,
    candidateAssessments,
    hardGateBlockedQuestionKeys,
    foregroundHardGateQuestionKeys,
    foregroundGateKeys,
    eligibleQuestionKeys,
    hold,
  } = prepared;
  const allEligible = eligibleQuestionKeys
    .map((questionKey) => {
      const axis = map.axes[questionKey];
      const rankKey = rankKeyFor(questionKey, axis, context);
      const renderedPrompt = renderOrientationPrompt(questionKey, foregroundGateKeys);
      return {
        questionKey,
        ...renderedPrompt,
        foregroundGateKeys: [...foregroundGateKeys],
        rankKey,
        rationaleCodes: rationaleCodes(axis, rankKey),
      };
    })
    .sort(compareCandidates);
  const selected = hold === null ? allEligible.slice(0, options.limit) : [];
  const deterministicTieBreak = hold === null
    ? deterministicTieBreakTrace(allEligible)
    : {
      ruleOrder: [...ORIENTATION_TIE_BREAK_ORDER],
      appliedThrough: "not_needed",
      finalistQuestionKeys: [],
    };
  const selectedRanks = new Map(selected.map((candidate, index) => [candidate.questionKey, index + 1]));
  const selectedKeys = new Set(selectedRanks.keys());
  const eligibleKeys = new Set(eligibleQuestionKeys);

  const candidateDispositions = ORIENTATION_QUESTION_KEYS.map((questionKey) => {
    const axis = map.axes[questionKey];
    const rankKey = rankKeyFor(questionKey, axis, context);
    const assessment = candidateAssessments[questionKey];
    let disposition;
    let exclusionReasonsForReceipt = assessment.exclusionReasons;
    if (assessment.requiresHold) {
      disposition = "held";
      exclusionReasonsForReceipt = [
        ...assessment.exclusionReasons,
        ...assessment.hardGateCodes.map((code) => `blocked_hard_gate:${code}`),
        `hold:${hold.reasonCode}`,
      ];
    } else if (
      hold?.reasonCode === "all_remaining_axes_deferred_or_withheld" &&
      ["deferred", "withheld"].includes(axis.answerStatus)
    ) {
      disposition = "held";
      exclusionReasonsForReceipt = [
        ...assessment.exclusionReasons,
        `hold:${hold.reasonCode}`,
      ];
    } else if (assessment.exclusionReasons.length > 0) {
      disposition = "excluded";
    } else if (hold !== null) {
      disposition = "held";
      exclusionReasonsForReceipt = [`hold:${hold.reasonCode}`];
    } else if (selectedKeys.has(questionKey)) {
      disposition = "ranked";
    } else if (eligibleKeys.has(questionKey)) {
      disposition = "eligible_not_foregrounded";
      exclusionReasonsForReceipt = ["foreground_limit"];
    } else {
      disposition = "excluded";
    }
    return {
      questionKey,
      coverageStatus: axis.coverageStatus,
      answerStatus: axis.answerStatus,
      mappingStatus: axis.mappingStatus,
      disposition,
      exclusionReasons: exclusionReasonsForReceipt,
      rank: selectedRanks.get(questionKey) ?? null,
      hardGateResults: hardGateResults(axis),
      semanticPriorityInputs: semanticPriorityInputs(axis, rankKey),
      rankingSignals: axis.rankingSignals,
      explicitCurrentTurnOrderIndex: rankKey.explicitCurrentTurnOrderIndex,
      acceptedQuestionOrderIndex: rankKey.acceptedQuestionOrderIndex,
      questionOrderIndex: rankKey.questionOrderIndex,
      canonicalOrderIndex: rankKey.canonicalOrderIndex,
    };
  });

  const candidates = selected.map((candidate, index) => ({
    ...candidate,
    rank: index + 1,
    proposalStatus: "proposed",
    notAuthority: true,
  }));

  return {
    schemaVersion: "yawn.inquiry-selection-result.v0.1",
    orientationMapRef: { id: map.orientationMapId, revision: map.revision },
    orientationMapId: map.orientationMapId,
    orientationMapRevision: map.revision,
    orientationMapUpdatedAt: map.updatedAt,
    principalRef: map.principalRef,
    scopeRef: map.scopeRef,
    relationshipRef: map.relationshipRef,
    arenaRef: map.arenaRef,
    orientationSemanticSha256: orientationMapSemanticSha256(map),
    sourceQuestionPacket: map.sourceQuestionPacket,
    promptSetVersion: ORIENTATION_PROMPT_SET_VERSION,
    promptSetSha256: ORIENTATION_PROMPT_SET_SHA256,
    policyVersion: ORIENTATION_RANKING_POLICY_VERSION,
    rankingInputSha256: digest(rankingInputState(prepared)),
    presentationProfileSha256: orientationMapPresentationProfileSha256(map),
    candidateQuestionKeys: eligibleQuestionKeys,
    hardGateBlockedQuestionKeys,
    foregroundHardGateQuestionKeys,
    foregroundGateKeys,
    candidateDispositions,
    questionOrderSource: context.questionOrderSource,
    questionOrderEvidence: context.questionOrderEvidence,
    acceptedPreferenceHash: context.acceptedPreferenceHash,
    acceptedQuestionOrderPreferenceEvidence: options.acceptedQuestionOrderPreference,
    deterministicTieBreak,
    maximumResults: ORIENTATION_RANKING_POLICY.maximumResults,
    resultLimit: options.limit,
    candidates,
    selectionStatus: hold === null ? "proposed_questions" : "hold",
    hold,
    requestedHold: options.hold,
    proposalStatus: "proposed",
    notAuthority: true,
  };
}
