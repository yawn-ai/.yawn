import {
  ORIENTATION_GATE_ORDER,
  ORIENTATION_PROMPT_SET_SHA256,
  ORIENTATION_TIE_BREAK_ORDER,
  rankNextOrientationQuestions,
  renderOrientationPrompt,
} from "./orientation-map-v0.1.mjs";
import { canonicalJson, hashCanonical } from "./state-substrate-v1.mjs";

export const INQUIRY_SELECTION_RECEIPT_SCHEMA_VERSION = "yawn.inquiry-selection-receipt.v0.1";
export const INQUIRY_SELECTION_POLICY_VERSION = "yawn.inquiry-selection.v0.1";
export const INQUIRY_QUESTION_PACKET_REF = "question-packets/orientation-nine@0.4.0-draft";
export const INQUIRY_PROMPT_SET_VERSION = "0.4.0-draft";
export const INQUIRY_PROMPT_SET_SHA256 = ORIENTATION_PROMPT_SET_SHA256;

export const INQUIRY_QUESTION_KEYS = Object.freeze([
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

export const INQUIRY_HARD_GATE_ORDER = Object.freeze([...ORIENTATION_GATE_ORDER]);

export const INQUIRY_TIE_BREAK_ORDER = ORIENTATION_TIE_BREAK_ORDER;

const receiptRecordKinds = new Set([
  "actor", "principal", "agent_space", "arena", "observation", "yawn", "source",
  "proof", "view", "git_commit", "question_proposal", "art_brief", "art_candidate",
  "view_feedback", "relationship", "action_policy", "reconciliation_batch",
  "action_request", "action_receipt",
]);
const receiptScopeKinds = new Set(["principal", "agent_space", "arena", "yawn", "observation", "view"]);
const receiptAnswerStatuses = new Set([
  "answered", "proposed", "corrected", "skipped", "unknown", "disputed",
  "deferred", "withheld", "not_applicable",
]);
const sha256Pattern = /^[a-f0-9]{64}$/;
const tokenPattern = /^[a-z][a-z0-9_-]*$/;
const utcTimestampPattern = /^([0-9]{4})-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])T([01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9](?:\.[0-9]{1,3})?Z$/;

const triggeredGateStatuses = new Set(["foreground", "required_hold", "unknown"]);
const receiptGateByRankingGate = new Map([
  ["immediate_safety_or_stability", "immediate_safety_or_stability"],
  ["authority_or_consent_blocker", "authority_or_consent"],
  ["privacy_visibility_or_egress_blocker", "privacy_visibility_or_egress"],
  ["source_or_provenance_loss", "source_or_provenance"],
  ["proof_or_falsifier_integrity", "proof_or_falsifier_integrity"],
]);

const receiptHoldReasonByRankingReason = new Map([
  ["referent_ambiguous", "ambiguous_referent"],
  ["required_source_or_authority_context_missing", "missing_source_or_authority_context"],
  ["explicit_principal_pause", "principal_requested_pause"],
]);

function assertInput(condition, code) {
  if (!condition) throw new Error(code);
}

function exactOptionKeys(input, allowed, code) {
  assertInput(
    Object.keys(input).every((key) => allowed.includes(key)),
    code,
  );
}

function identifier(value, code) {
  assertInput(typeof value === "string" && value.length >= 1 && value.length <= 500 && /\S/.test(value), code);
  return value;
}

function token(value, code) {
  assertInput(typeof value === "string" && value.length <= 100 && tokenPattern.test(value), code);
  return value;
}

function utcTimestamp(value, code) {
  const match = typeof value === "string" ? utcTimestampPattern.exec(value) : null;
  assertInput(match !== null && Number.isFinite(Date.parse(value)), code);
  const maximumDay = new Date(Date.UTC(Number(match[1]), Number(match[2]), 0)).getUTCDate();
  assertInput(Number(match[3]) <= maximumDay, code);
  return value;
}

function normalizeReceiptRecordRef(input, code) {
  assertInput(input && typeof input === "object" && !Array.isArray(input), code);
  exactOptionKeys(input, ["kind", "id", "revision", "stateSha256"], code);
  assertInput(receiptRecordKinds.has(input.kind), code);
  identifier(input.id, code);
  assertInput(
    input.revision === undefined
      || input.revision === null
      || (Number.isSafeInteger(input.revision) && input.revision >= 0),
    code,
  );
  assertInput(
    input.stateSha256 === undefined
      || input.stateSha256 === null
      || (typeof input.stateSha256 === "string" && sha256Pattern.test(input.stateSha256)),
    code,
  );
  return {
    kind: input.kind,
    id: input.id,
    ...(input.revision === undefined ? {} : { revision: input.revision }),
    ...(input.stateSha256 === undefined ? {} : { stateSha256: input.stateSha256 }),
  };
}

function normalizeReceiptActorRef(input, code) {
  const ref = normalizeReceiptRecordRef(input, code);
  assertInput(ref.kind === "actor" || ref.kind === "principal", code);
  if (ref.kind === "principal") {
    assertInput(/^principal:[^\s]+$/.test(ref.id), code);
  }
  return ref;
}

function normalizeReceiptRecordRefs(input, code, minimum = 0) {
  assertInput(Array.isArray(input) && input.length >= minimum, code);
  const refs = input.map((ref) => normalizeReceiptRecordRef(ref, code));
  assertInput(new Set(refs.map(canonicalRefKey)).size === refs.length, `${code}_duplicate`);
  return refs;
}

function normalizePreferenceRefs(input) {
  assertInput(Array.isArray(input) && input.length === 1, "inquiry_selection_accepted_preference_requires_one_winning_ref");
  const refs = input.map((ref) => {
    const code = "inquiry_selection_accepted_preference_ref_invalid";
    assertInput(ref && typeof ref === "object" && !Array.isArray(ref), code);
    exactOptionKeys(ref, ["preferenceId", "revision", "stateSha256", "scopeRef"], code);
    identifier(ref.preferenceId, code);
    assertInput(Number.isSafeInteger(ref.revision) && ref.revision >= 1, code);
    assertInput(typeof ref.stateSha256 === "string" && sha256Pattern.test(ref.stateSha256), code);
    const scopeRef = normalizeReceiptRecordRef(ref.scopeRef, code);
    assertInput(receiptScopeKinds.has(scopeRef.kind), code);
    return {
      preferenceId: ref.preferenceId,
      revision: ref.revision,
      stateSha256: ref.stateSha256,
      scopeRef,
    };
  });
  refs.sort((left, right) => left.preferenceId < right.preferenceId ? -1 : left.preferenceId > right.preferenceId ? 1 : 0);
  assertInput(new Set(refs.map(({ preferenceId }) => preferenceId)).size === refs.length, "inquiry_selection_accepted_preference_ref_duplicate");
  return refs;
}

function normalizeReceiptQuestionKeys(input, code) {
  assertInput(Array.isArray(input) && input.length <= INQUIRY_QUESTION_KEYS.length, code);
  assertInput(new Set(input).size === input.length, `${code}_duplicate`);
  assertInput(input.every((questionKey) => INQUIRY_QUESTION_KEYS.includes(questionKey)), code);
  return [...input];
}

function normalizeRecentAnswerStatuses(input) {
  assertInput(Array.isArray(input) && input.length <= INQUIRY_QUESTION_KEYS.length, "inquiry_selection_recent_answer_statuses_invalid");
  const statuses = input.map((entry) => {
    const code = "inquiry_selection_recent_answer_status_invalid";
    assertInput(entry && typeof entry === "object" && !Array.isArray(entry), code);
    exactOptionKeys(entry, ["questionKey", "coverageStatus", "answerStatus", "mappingStatus"], code);
    assertInput(INQUIRY_QUESTION_KEYS.includes(entry.questionKey) && receiptAnswerStatuses.has(entry.answerStatus), code);
    assertInput(["missing", "partial", "covered", "stale"].includes(entry.coverageStatus), code);
    assertInput([
      "unmapped", "proposed", "accepted", "corrected", "rejected",
    ].includes(entry.mappingStatus), code);
    return {
      questionKey: entry.questionKey,
      coverageStatus: entry.coverageStatus,
      answerStatus: entry.answerStatus,
      mappingStatus: entry.mappingStatus,
    };
  });
  assertInput(new Set(statuses.map(({ questionKey }) => questionKey)).size === statuses.length, "inquiry_selection_recent_answer_status_duplicate");
  return statuses;
}

function actorRecordRef(actorId) {
  assertInput(typeof actorId === "string" && actorId.trim().length > 0, "inquiry_selection_actor_required");
  return {
    kind: actorId.startsWith("principal:") ? "principal" : "actor",
    id: actorId,
  };
}

function canonicalRefKey(ref) {
  return JSON.stringify({
    kind: ref.kind,
    id: ref.id,
    ...(ref.revision === undefined ? {} : { revision: ref.revision }),
    ...(ref.stateSha256 === undefined ? {} : { stateSha256: ref.stateSha256 }),
  });
}

function uniqueSortedRefs(refs) {
  const byKey = new Map(list(refs).map((ref) => [canonicalRefKey(ref), ref]));
  return [...byKey.entries()]
    .sort(([left], [right]) => left < right ? -1 : left > right ? 1 : 0)
    .map(([, ref]) => ref);
}

function dispositionExclusion(disposition) {
  const reason = disposition.exclusionReasons[0] ?? "candidate_not_available";
  let reasonCode = "candidate_not_available";
  if (reason === "accepted_complete_answer") reasonCode = "already_covered";
  else if (reason === "withheld_for_current_revision") reasonCode = "withheld";
  else if (reason === "accepted_not_applicable") reasonCode = "not_applicable";
  else if (reason === "deferred_for_current_revision") reasonCode = "deferred_current_revision";
  else if (reason === "skipped_for_current_revision") reasonCode = "skipped_current_revision";
  return {
    questionKey: disposition.questionKey,
    reasonCode,
    gate: null,
    detail: `The candidate was excluded by the versioned ranking disposition: ${reason}.`,
    assertedBy: actorRecordRef(disposition.rankingSignals.assertedBy),
    sourceRefs: disposition.rankingSignals.sourceRefs,
  };
}

function receiptGateResults(ranking, createdBy) {
  return INQUIRY_HARD_GATE_ORDER.map((gate) => {
    const rankingGate = [...receiptGateByRankingGate.entries()]
      .find(([, receiptGate]) => receiptGate === gate)?.[0];
    const evidence = ranking.candidateDispositions.map((disposition) => {
      const assessment = disposition.hardGateResults[rankingGate];
      const foregroundability = assessment.assessmentStatus === "clear"
        ? "not_required"
        : ranking.hardGateBlockedQuestionKeys.includes(disposition.questionKey)
          ? "blocked_by_answer_state"
          : "foregroundable";
      return {
        questionKey: disposition.questionKey,
        assessmentStatus: assessment.assessmentStatus,
        foregroundability,
        assertedBy: actorRecordRef(assessment.assertedBy),
        epistemicStatus: assessment.epistemicStatus,
        confidence: assessment.confidence,
        sourceRefs: assessment.sourceRefs,
      };
    });
    const nonClearEvidence = evidence.filter(({ assessmentStatus }) => assessmentStatus !== "clear");
    const blocked = nonClearEvidence.some(({ foregroundability }) => foregroundability === "blocked_by_answer_state");
    const confirmedActive = nonClearEvidence.some(({ assessmentStatus }) => assessmentStatus === "active");
    const status = blocked
      ? "required_hold"
      : confirmedActive ? "foreground" : nonClearEvidence.length > 0 ? "unknown" : "clear";
    return {
      gate,
      status,
      reasonCode: status === "clear" ? null : rankingGate,
      detail: status === "clear"
        ? null
        : blocked
          ? `A live ${gate} gate cannot safely be foregrounded in the current answer state.`
          : status === "unknown"
            ? `The selected inquiry must foreground unresolved ${gate} gate evidence.`
            : `The selected inquiry must foreground the live ${gate} gate.`,
      derivedBy: createdBy,
      sourceRefs: uniqueSortedRefs(evidence.flatMap(({ sourceRefs }) => sourceRefs)),
      evidence,
    };
  });
}

function semanticInput(disposition) {
  const signals = disposition.semanticPriorityInputs;
  const hardGates = Object.entries(disposition.hardGateResults)
    .filter(([, result]) => result.active)
    .map(([gate]) => receiptGateByRankingGate.get(gate));
  return {
    questionKey: disposition.questionKey,
    hardGates,
    movementCriticalLacuna: signals.movementCriticalMissingInformation,
    affectedRelationshipOrUnresolvedRole: signals.affectedRelationshipOrUnresolvedRole,
    consequence: signals.consequence,
    consequenceConfidenceGap: signals.consequenceConfidenceGap,
    answerConfidence: signals.answerConfidence,
    rankingSignalConfidence: signals.rankingSignalConfidence,
    contradictionOrDispute: signals.contradictionOrDispute,
    staleness: signals.staleness,
    staleHighImpact: signals.staleHighImpact,
    expectedInformationValue: signals.informationValue,
    proofOrCloseConditionGap: signals.proofOrCloseConditionGap,
    orientationGain: signals.orientationGain,
    assertedBy: actorRecordRef(signals.assertedBy),
    epistemicStatus: signals.epistemicStatus,
    sourceRefs: signals.sourceRefs,
  };
}

function interactionEvaluation(disposition, ranking, derivedBy) {
  const gates = disposition.hardGateResults;
  const permissionAndPrivacyRisk = gates.privacy_visibility_or_egress_blocker.active
    ? 3
    : gates.authority_or_consent_blocker.active ? 2 : 0;
  const presentationOrderIndex = ranking.questionOrderSource === "canonical"
    || disposition.questionOrderIndex >= INQUIRY_QUESTION_KEYS.length
    ? null
    : disposition.questionOrderIndex;
  return {
    questionKey: disposition.questionKey,
    permissionAndPrivacyRisk,
    answerable: !["skipped", "deferred", "withheld"].includes(disposition.answerStatus),
    answerBurden: disposition.rankingSignals.effort,
    explicitCurrentTurnOrderIndex: disposition.explicitCurrentTurnOrderIndex < INQUIRY_QUESTION_KEYS.length
      ? disposition.explicitCurrentTurnOrderIndex
      : null,
    acceptedQuestionOrderIndex: disposition.acceptedQuestionOrderIndex < INQUIRY_QUESTION_KEYS.length
      ? disposition.acceptedQuestionOrderIndex
      : null,
    presentationOrderIndex,
    recentDeferralOrRepetition: ["skipped", "deferred"].includes(disposition.answerStatus),
    derivedBy,
    sourceRefs: disposition.rankingSignals.sourceRefs,
  };
}

function receiptHoldFromRankingHold(hold) {
  if (hold === null) return null;
  return {
    reasonCode: receiptHoldReasonByRankingReason.get(hold.reasonCode) ?? hold.reasonCode,
    detail: hold.description,
    assertedBy: actorRecordRef(hold.assertedBy),
    sourceRefs: hold.sourceRefs,
    reopenCondition: hold.reopenCondition,
  };
}

/**
 * Compose the deterministic ranker with the closed replay-receipt contract.
 * The result proposes one question or records a hold; it never accepts an
 * answer, mutates canonical state, or grants authority.
 */
export function selectNextOrientationQuestion(orientationMap, rankingOptions, receiptOptions) {
  assertInput(receiptOptions && typeof receiptOptions === "object" && !Array.isArray(receiptOptions), "inquiry_selection_receipt_options_required");
  exactOptionKeys(receiptOptions, [
    "receiptId",
    "createdAt",
    "createdBy",
    "representationMedium",
    "answerInputAdapter",
    "sequencePosition",
    "sourceRefs",
    "accessibilityRequirementRefs",
  ], "inquiry_selection_receipt_option_fields_invalid");
  const {
    receiptId,
    createdAt,
    createdBy,
    representationMedium,
    answerInputAdapter,
    sequencePosition = 1,
    sourceRefs = null,
    accessibilityRequirementRefs = [],
  } = receiptOptions;
  const normalizedReceiptId = identifier(receiptId, "inquiry_selection_receipt_id_invalid");
  assertInput(/^receipt:[^\s]+$/.test(normalizedReceiptId), "inquiry_selection_receipt_id_invalid");
  const normalizedCreatedAt = utcTimestamp(createdAt, "inquiry_selection_created_at_invalid");
  const normalizedCreatedBy = normalizeReceiptActorRef(createdBy, "inquiry_selection_created_by_invalid");
  const normalizedRepresentationMedium = token(representationMedium, "inquiry_selection_representation_medium_invalid");
  const normalizedAnswerInputAdapter = token(answerInputAdapter, "inquiry_selection_answer_input_adapter_invalid");
  assertInput(Number.isSafeInteger(sequencePosition) && sequencePosition >= 1, "inquiry_selection_sequence_position_invalid");
  const normalizedAccessibilityRefs = uniqueSortedRefs(normalizeReceiptRecordRefs(
    accessibilityRequirementRefs,
    "inquiry_selection_accessibility_requirement_refs_invalid",
  ));

  const ranking = rankNextOrientationQuestions(orientationMap, rankingOptions);
  assertInput(
    Date.parse(ranking.orientationMapUpdatedAt) <= Date.parse(normalizedCreatedAt),
    "inquiry_selection_receipt_precedes_orientation_map",
  );
  if (ranking.questionOrderSource === "explicit_current_turn") {
    const recordedAt = ranking.questionOrderEvidence.recordedAt;
    assertInput(
      Date.parse(ranking.orientationMapUpdatedAt) <= Date.parse(recordedAt)
      && Date.parse(recordedAt) <= Date.parse(normalizedCreatedAt),
      "inquiry_selection_current_turn_choice_timestamp_outside_replay_window",
    );
  }
  const receiptSourceRefs = uniqueSortedRefs(normalizeReceiptRecordRefs(
    sourceRefs ?? [ranking.scopeRef],
    "inquiry_selection_source_refs_invalid",
    1,
  ));
  const acceptedEvidence = ranking.acceptedQuestionOrderPreferenceEvidence;
  let normalizedPreferenceRefs = [];
  let normalizedPreferenceScopeRefs = [];
  let receiptAcceptedOrder = [];
  if (acceptedEvidence !== null) {
    normalizedPreferenceRefs = normalizePreferenceRefs(acceptedEvidence.preferenceRefs);
    normalizedPreferenceScopeRefs = normalizeReceiptRecordRefs(
      acceptedEvidence.activeScopeRefs,
      "inquiry_selection_accepted_preference_scope_refs_invalid",
      1,
    );
    receiptAcceptedOrder = [...acceptedEvidence.questionKeys];
  }

  const exclusions = ranking.candidateDispositions
    .filter((disposition) => disposition.disposition === "excluded")
    .map(dispositionExclusion);
  const excludedKeys = new Set(exclusions.map((exclusion) => exclusion.questionKey));
  const evaluated = ranking.candidateDispositions.filter(
    (disposition) => !excludedKeys.has(disposition.questionKey),
  );
  const selectedCandidate = ranking.candidates[0] ?? null;
  const presentationChoiceEvidence = selectedCandidate === null ? null : {
    source: "caller_supplied",
    providedBy: normalizedCreatedBy,
    sourceRefs: receiptSourceRefs,
    representationMedium: normalizedRepresentationMedium,
    answerInputAdapter: normalizedAnswerInputAdapter,
  };
  const derivedRecentStatuses = ranking.candidateDispositions
    .filter((disposition) => receiptAnswerStatuses.has(disposition.answerStatus))
    .map((disposition) => ({
      questionKey: disposition.questionKey,
      coverageStatus: disposition.coverageStatus,
      answerStatus: disposition.answerStatus,
      mappingStatus: disposition.mappingStatus,
    }));
  const currentTurnChoice = ranking.questionOrderSource === "explicit_current_turn"
    ? {
      questionKey: ranking.questionOrderEvidence.questionKeys[0] ?? null,
      questionKeys: [...ranking.questionOrderEvidence.questionKeys],
      promptVariant: null,
      representationMedium: null,
      answerInputAdapter: null,
      assertedBy: actorRecordRef(ranking.questionOrderEvidence.assertedBy),
      sourceRefs: ranking.questionOrderEvidence.sourceRefs,
      recordedAt: ranking.questionOrderEvidence.recordedAt,
    }
    : null;
  const renderInputSha256 = hashCanonical({
    schemaVersion: "yawn.inquiry-render-input.v0.1",
    rankingInputSha256: ranking.rankingInputSha256,
    rankingResultLimit: ranking.resultLimit,
    promptVariant: selectedCandidate?.promptVariant ?? null,
    exactRenderedPrompt: selectedCandidate?.exactRenderedPrompt ?? null,
    foregroundGateKeys: selectedCandidate?.foregroundGateKeys ?? [],
    presentationChoiceEvidence,
    representationMedium: selectedCandidate === null ? null : normalizedRepresentationMedium,
    answerInputAdapter: selectedCandidate === null ? null : normalizedAnswerInputAdapter,
    sequencePosition: selectedCandidate === null ? null : sequencePosition,
    accessibilityRequirementRefs: normalizedAccessibilityRefs,
  }).replace(/^sha256:/, "");

  return {
    schemaVersion: INQUIRY_SELECTION_RECEIPT_SCHEMA_VERSION,
    receiptId: normalizedReceiptId,
    policyVersion: ranking.policyVersion,
    sourceQuestionPacketRef: INQUIRY_QUESTION_PACKET_REF,
    promptSetVersion: ranking.promptSetVersion,
    promptSetSha256: ranking.sourceQuestionPacket.sha256,
    orientationMapId: ranking.orientationMapId,
    orientationMapRevision: ranking.orientationMapRevision,
    orientationMapUpdatedAt: ranking.orientationMapUpdatedAt,
    orientationSemanticSha256: ranking.orientationSemanticSha256,
    rankingInputSha256: ranking.rankingInputSha256,
    rankingResultLimit: ranking.resultLimit,
    renderInputSha256,
    principalRef: ranking.principalRef,
    scopeRef: ranking.scopeRef,
    relationshipRef: ranking.relationshipRef,
    arenaRef: ranking.arenaRef,
    candidateQuestionKeys: [...INQUIRY_QUESTION_KEYS],
    hardGateResults: receiptGateResults(ranking, normalizedCreatedBy),
    exclusions,
    semanticPriorityInputs: evaluated.map(semanticInput),
    interactionFitInputs: {
      currentTurnChoice,
      presentationOrderSource: ranking.questionOrderSource,
      accessibilityRequirementRefs: normalizedAccessibilityRefs,
      acceptedPreferenceRefs: normalizedPreferenceRefs,
      acceptedPreferenceScopeRefs: normalizedPreferenceScopeRefs,
      acceptedPreferenceSha256: ranking.acceptedPreferenceHash,
      acceptedQuestionOrder: receiptAcceptedOrder,
      presentationChoiceEvidence,
      recentAnswerStatuses: derivedRecentStatuses,
      evaluations: evaluated.map((disposition) => interactionEvaluation(disposition, ranking, normalizedCreatedBy)),
    },
    selectionStatus: ranking.selectionStatus === "hold" ? "hold" : "selected_question",
    selectedQuestion: selectedCandidate === null ? null : {
      questionKey: selectedCandidate.questionKey,
      promptVariant: selectedCandidate.promptVariant,
      exactRenderedPrompt: selectedCandidate.exactRenderedPrompt,
      foregroundGateKeys: [...selectedCandidate.foregroundGateKeys],
      representationMedium: normalizedRepresentationMedium,
      answerInputAdapter: normalizedAnswerInputAdapter,
      sequencePosition,
    },
    hold: receiptHoldFromRankingHold(ranking.hold),
    requestedHold: receiptHoldFromRankingHold(ranking.requestedHold),
    deterministicTieBreak: ranking.deterministicTieBreak,
    createdBy: normalizedCreatedBy,
    sourceRefs: receiptSourceRefs,
    canonicalState: false,
    notAuthority: true,
    createdAt: normalizedCreatedAt,
  };
}

/**
 * Replay validation checks equivalence against the effective normalized
 * ranking and render inputs committed by rankingInputSha256/renderInputSha256.
 * Inputs that cannot affect the outcome may normalize away. Shape,
 * internal-evidence validation, and replay do not authenticate historical
 * input-object identity or origin.
 */
export function validateInquirySelectionReceiptReplay(
  receipt,
  orientationMap,
  rankingOptions,
  receiptOptions,
) {
  try {
    const expected = selectNextOrientationQuestion(orientationMap, rankingOptions, receiptOptions);
    return canonicalJson(receipt) === canonicalJson(expected)
      ? []
      : ["inquiry_selection_receipt_replay_mismatch"];
  } catch (error) {
    return [`inquiry_selection_receipt_replay_failed:${error.message}`];
  }
}

function list(value) {
  return Array.isArray(value) ? value : [];
}

function duplicateValues(values) {
  const seen = new Set();
  const duplicates = new Set();
  for (const value of values) {
    if (seen.has(value)) duplicates.add(value);
    seen.add(value);
  }
  return [...duplicates];
}

function sameList(left, right) {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

function canonicalQuestionOrder(values) {
  const selected = new Set(values);
  return INQUIRY_QUESTION_KEYS.filter((key) => selected.has(key));
}

function keyedValues(records, key = "questionKey") {
  return list(records).map((record) => record?.[key]).filter((value) => typeof value === "string");
}

function requireUniqueKnownSubset(errors, values, allowed, label) {
  for (const duplicate of duplicateValues(values)) errors.push(`${label}_duplicate:${duplicate}`);
  for (const value of values) {
    if (!allowed.has(value)) errors.push(`${label}_outside_candidates:${value}`);
  }
}

function receiptEvidenceNumber(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function receiptControlStateValid(state) {
  const { coverageStatus, answerStatus, mappingStatus } = state ?? {};
  if (mappingStatus === "unmapped") return false;
  if (["skipped", "deferred", "withheld"].includes(answerStatus)) {
    return coverageStatus === "missing" && ["accepted", "corrected"].includes(mappingStatus);
  }
  if (answerStatus === "answered" && mappingStatus !== "accepted") return false;
  if (answerStatus === "corrected" && mappingStatus !== "corrected") return false;
  if (answerStatus === "proposed") {
    return ["missing", "partial"].includes(coverageStatus)
      && ["proposed", "rejected"].includes(mappingStatus);
  }
  if (["unknown", "disputed"].includes(answerStatus)) {
    return coverageStatus === "partial" && ["accepted", "corrected"].includes(mappingStatus);
  }
  if (answerStatus === "not_applicable") {
    return coverageStatus === "covered" && ["accepted", "corrected"].includes(mappingStatus);
  }
  if (
    coverageStatus === "covered"
    && !["answered", "corrected", "not_applicable"].includes(answerStatus)
  ) return false;
  if (coverageStatus === "stale" && !["answered", "corrected"].includes(answerStatus)) return false;
  return true;
}

function receiptEvidenceCandidate(questionKey, semanticByKey, interactionByKey, gateByKey) {
  const semantic = semanticByKey.get(questionKey) ?? {};
  const interaction = interactionByKey.get(questionKey) ?? {};
  const gatePriorities = INQUIRY_HARD_GATE_ORDER.map((gate) => {
    const assessment = list(gateByKey.get(gate)?.evidence)
      .find((item) => item?.questionKey === questionKey);
    return assessment?.assessmentStatus === "active"
      ? 2
      : assessment?.assessmentStatus === "unknown" ? 1 : 0;
  });
  return {
    questionKey,
    gatePriorities,
    movementCriticalLacuna: Number(Boolean(semantic.movementCriticalLacuna)),
    affectedRelationshipOrUnresolvedRole: Number(Boolean(semantic.affectedRelationshipOrUnresolvedRole)),
    consequenceConfidenceGap: receiptEvidenceNumber(semantic.consequenceConfidenceGap),
    contradictionOrDispute: Number(Boolean(semantic.contradictionOrDispute)),
    staleHighImpact: receiptEvidenceNumber(semantic.staleHighImpact),
    expectedInformationValue: receiptEvidenceNumber(semantic.expectedInformationValue),
    proofOrCloseConditionGap: Number(Boolean(semantic.proofOrCloseConditionGap)),
    orientationGain: receiptEvidenceNumber(semantic.orientationGain),
    effortDenominator: receiptEvidenceNumber(interaction.answerBurden) + 1,
    explicitCurrentTurnOrderIndex: interaction.explicitCurrentTurnOrderIndex ?? INQUIRY_QUESTION_KEYS.length,
    acceptedQuestionOrderIndex: interaction.acceptedQuestionOrderIndex ?? INQUIRY_QUESTION_KEYS.length,
    canonicalOrderIndex: INQUIRY_QUESTION_KEYS.indexOf(questionKey),
  };
}

function compareReceiptEvidenceCandidates(left, right) {
  for (let index = 0; index < INQUIRY_HARD_GATE_ORDER.length; index += 1) {
    if (left.gatePriorities[index] !== right.gatePriorities[index]) {
      return right.gatePriorities[index] - left.gatePriorities[index];
    }
  }
  for (const field of [
    "movementCriticalLacuna",
    "affectedRelationshipOrUnresolvedRole",
    "consequenceConfidenceGap",
    "contradictionOrDispute",
    "staleHighImpact",
    "expectedInformationValue",
    "proofOrCloseConditionGap",
  ]) {
    if (left[field] !== right[field]) return right[field] - left[field];
  }
  const leftGain = left.orientationGain * right.effortDenominator;
  const rightGain = right.orientationGain * left.effortDenominator;
  if (leftGain !== rightGain) return rightGain - leftGain;
  if (left.effortDenominator !== right.effortDenominator) {
    return left.effortDenominator - right.effortDenominator;
  }
  if (left.explicitCurrentTurnOrderIndex !== right.explicitCurrentTurnOrderIndex) {
    return left.explicitCurrentTurnOrderIndex - right.explicitCurrentTurnOrderIndex;
  }
  if (left.acceptedQuestionOrderIndex !== right.acceptedQuestionOrderIndex) {
    return left.acceptedQuestionOrderIndex - right.acceptedQuestionOrderIndex;
  }
  return left.canonicalOrderIndex - right.canonicalOrderIndex;
}

function receiptEvidenceTieBreakStage(left, right) {
  if (left.gatePriorities.some((value, index) => value !== right.gatePriorities[index])) {
    return "hard_gate_priority";
  }
  for (const field of [
    "movementCriticalLacuna",
    "affectedRelationshipOrUnresolvedRole",
    "consequenceConfidenceGap",
    "contradictionOrDispute",
    "staleHighImpact",
    "expectedInformationValue",
    "proofOrCloseConditionGap",
  ]) {
    if (left[field] !== right[field]) return "greater_semantic_priority";
  }
  const leftGain = left.orientationGain * right.effortDenominator;
  const rightGain = right.orientationGain * left.effortDenominator;
  if (leftGain !== rightGain) return "greater_semantic_priority";
  if (left.effortDenominator !== right.effortDenominator) return "lower_answer_burden";
  if (left.explicitCurrentTurnOrderIndex !== right.explicitCurrentTurnOrderIndex) {
    return "explicit_current_turn_choice";
  }
  if (left.acceptedQuestionOrderIndex !== right.acceptedQuestionOrderIndex) {
    return "accepted_question_order_preference";
  }
  return "canonical_question_order";
}

function receiptEvidenceTieBreakTrace(sortedCandidates) {
  if (sortedCandidates.length === 0) {
    return { appliedThrough: "not_needed", finalistQuestionKeys: [] };
  }
  if (sortedCandidates.length === 1) {
    return { appliedThrough: "not_needed", finalistQuestionKeys: [sortedCandidates[0].questionKey] };
  }
  const winner = sortedCandidates[0];
  const stageIndex = Math.max(...sortedCandidates.slice(1).map((candidate) => (
    INQUIRY_TIE_BREAK_ORDER.indexOf(receiptEvidenceTieBreakStage(winner, candidate))
  )));
  return {
    appliedThrough: INQUIRY_TIE_BREAK_ORDER[stageIndex],
    finalistQuestionKeys: [winner.questionKey],
  };
}

export function validateInquirySelectionReceiptSemantics(receipt) {
  const errors = [];
  if (!receipt || typeof receipt !== "object" || Array.isArray(receipt)) {
    return ["inquiry_selection_receipt_required"];
  }
  if (!/^receipt:[^\s]+$/.test(receipt.receiptId ?? "")) {
    errors.push("receipt_id_must_be_typed");
  }
  if (receipt.policyVersion !== INQUIRY_SELECTION_POLICY_VERSION) {
    errors.push("policy_version_mismatch");
  }
  if (receipt.sourceQuestionPacketRef !== INQUIRY_QUESTION_PACKET_REF) {
    errors.push("source_question_packet_ref_mismatch");
  }
  if (receipt.promptSetVersion !== INQUIRY_PROMPT_SET_VERSION) {
    errors.push("prompt_set_version_mismatch");
  }
  if (receipt.promptSetSha256 !== INQUIRY_PROMPT_SET_SHA256) {
    errors.push("prompt_set_sha256_mismatch");
  }
  if (Date.parse(receipt.orientationMapUpdatedAt) > Date.parse(receipt.createdAt)) {
    errors.push("receipt_precedes_orientation_map");
  }

  const candidateKeys = list(receipt.candidateQuestionKeys);
  const candidateSet = new Set(candidateKeys);
  const controlStateByKey = new Map(list(receipt.interactionFitInputs?.recentAnswerStatuses)
    .map((status) => [status?.questionKey, status]));
  const recentStatusByKey = new Map([...controlStateByKey]
    .map(([questionKey, status]) => [questionKey, status?.answerStatus]));
  for (const [questionKey, state] of controlStateByKey) {
    if (!receiptControlStateValid(state)) {
      errors.push(`recent_control_state_invalid:${questionKey}`);
    }
  }
  if (!sameList(candidateKeys, INQUIRY_QUESTION_KEYS)) {
    errors.push("candidate_question_keys_must_cover_canonical_universe");
  }

  const gateResults = list(receipt.hardGateResults);
  const gateKeys = gateResults.map((result) => result?.gate).filter((value) => typeof value === "string");
  if (!sameList(gateKeys, INQUIRY_HARD_GATE_ORDER)) {
    errors.push("hard_gate_results_must_cover_policy_order_once");
  }
  for (const gateResult of gateResults) {
    if (canonicalRefKey(gateResult?.derivedBy) !== canonicalRefKey(receipt.createdBy)) {
      errors.push(`hard_gate_derived_by_mismatch:${gateResult?.gate}`);
    }
    const evidence = list(gateResult?.evidence);
    const evidenceKeys = keyedValues(evidence);
    if (!sameList(evidenceKeys, INQUIRY_QUESTION_KEYS)) {
      errors.push(`hard_gate_evidence_must_cover_canonical_universe:${gateResult?.gate}`);
    }
    for (const assessment of evidence) {
      const clear = assessment?.assessmentStatus === "clear";
      const answerStatus = recentStatusByKey.get(assessment?.questionKey) ?? "unasked";
      const expectedForegroundability = clear
        ? "not_required"
        : ["skipped", "deferred", "withheld"].includes(answerStatus)
          ? "blocked_by_answer_state"
          : "foregroundable";
      if (clear && assessment?.foregroundability !== "not_required") {
        errors.push(`clear_gate_evidence_cannot_require_foregrounding:${gateResult?.gate}:${assessment?.questionKey}`);
      }
      if (!clear && !["foregroundable", "blocked_by_answer_state"].includes(assessment?.foregroundability)) {
        errors.push(`nonclear_gate_evidence_requires_foregroundability:${gateResult?.gate}:${assessment?.questionKey}`);
      }
      if (assessment?.foregroundability !== expectedForegroundability) {
        errors.push(`gate_evidence_foregroundability_mismatch:${gateResult?.gate}:${assessment?.questionKey}`);
      }
      if (
        /^(assistant|agent|system):/.test(assessment?.assertedBy?.id ?? "")
        && assessment?.epistemicStatus === "reported"
      ) {
        errors.push(`machine_gate_evidence_cannot_be_reported:${gateResult?.gate}:${assessment?.questionKey}`);
      }
      if (clear) {
        if (
          assessment?.assertedBy?.kind !== "principal"
          || assessment?.assertedBy?.id !== receipt.principalRef
          || assessment?.epistemicStatus !== "reported"
        ) {
          errors.push(`clear_gate_evidence_requires_current_principal_report:${gateResult?.gate}:${assessment?.questionKey}`);
        }
        if (!list(assessment?.sourceRefs).some(
          (ref) => ref?.kind === "principal" && ref?.id === receipt.principalRef,
        )) {
          errors.push(`clear_gate_evidence_requires_principal_source:${gateResult?.gate}:${assessment?.questionKey}`);
        }
      }
    }
    const nonClearEvidence = evidence.filter(({ assessmentStatus } = {}) => assessmentStatus !== "clear");
    const expectedStatus = nonClearEvidence.some(
      ({ foregroundability }) => foregroundability === "blocked_by_answer_state",
    )
      ? "required_hold"
      : nonClearEvidence.some(({ assessmentStatus }) => assessmentStatus === "active")
        ? "foreground"
        : nonClearEvidence.length > 0 ? "unknown" : "clear";
    if (gateResult?.status !== expectedStatus) {
      errors.push(`hard_gate_aggregate_status_mismatch:${gateResult?.gate}`);
    }
    const expectedReasonCode = expectedStatus === "clear"
      ? null
      : [...receiptGateByRankingGate.entries()]
        .find(([, receiptGate]) => receiptGate === gateResult?.gate)?.[0] ?? null;
    if (gateResult?.reasonCode !== expectedReasonCode) {
      errors.push(`hard_gate_reason_code_mismatch:${gateResult?.gate}`);
    }
    const evidenceSourceKeys = [...new Set(evidence
      .flatMap((assessment) => list(assessment?.sourceRefs))
      .filter((ref) => ref && typeof ref === "object" && !Array.isArray(ref))
      .map(canonicalRefKey))].sort();
    const resultSourceKeys = [...new Set(list(gateResult?.sourceRefs)
      .filter((ref) => ref && typeof ref === "object" && !Array.isArray(ref))
      .map(canonicalRefKey))].sort();
    if (!sameList(resultSourceKeys, evidenceSourceKeys)) {
      errors.push(`hard_gate_aggregate_source_refs_mismatch:${gateResult?.gate}`);
    }
  }

  const gateByKey = new Map(gateResults.map((result) => [result?.gate, result]));
  const exclusionKeys = keyedValues(receipt.exclusions);
  requireUniqueKnownSubset(errors, exclusionKeys, candidateSet, "exclusion_question_key");
  const exclusionSet = new Set(exclusionKeys);
  for (const exclusion of list(receipt.exclusions)) {
    const controlState = controlStateByKey.get(exclusion?.questionKey);
    const answerStatus = controlState?.answerStatus ?? "unasked";
    const acceptedComplete = controlState?.coverageStatus === "covered"
      && ["accepted", "corrected"].includes(controlState?.mappingStatus)
      && ["answered", "corrected"].includes(answerStatus);
    const expectedReasonCode = acceptedComplete
      ? "already_covered"
      : answerStatus === "withheld"
        ? "withheld"
        : answerStatus === "not_applicable"
          ? "not_applicable"
          : answerStatus === "skipped"
            ? "skipped_current_revision"
            : answerStatus === "deferred"
              ? "deferred_current_revision"
              : null;
    if (exclusion?.reasonCode !== expectedReasonCode) {
      errors.push(`exclusion_reason_does_not_match_answer_status:${exclusion?.questionKey}`);
    }
    if (exclusion?.gate !== null) {
      const gate = gateByKey.get(exclusion.gate);
      if (!gate || !triggeredGateStatuses.has(gate.status)) {
        errors.push(`exclusion_gate_not_triggered:${exclusion.questionKey}:${exclusion.gate}`);
      }
    }
  }

  const eligibleKeys = candidateKeys.filter((key) => !exclusionSet.has(key));
  const eligibleSet = new Set(eligibleKeys);
  const semanticKeys = keyedValues(receipt.semanticPriorityInputs);
  const interactionKeys = keyedValues(receipt.interactionFitInputs?.evaluations);
  requireUniqueKnownSubset(errors, semanticKeys, candidateSet, "semantic_priority_question_key");
  requireUniqueKnownSubset(errors, interactionKeys, candidateSet, "interaction_evaluation_question_key");
  for (const key of semanticKeys) {
    if (exclusionSet.has(key)) errors.push(`excluded_question_has_semantic_input:${key}`);
  }
  for (const key of interactionKeys) {
    if (exclusionSet.has(key)) errors.push(`excluded_question_has_interaction_input:${key}`);
  }
  if (!sameList(semanticKeys, canonicalQuestionOrder(semanticKeys))) {
    errors.push("semantic_priority_inputs_not_in_canonical_order");
  }
  if (!sameList(interactionKeys, canonicalQuestionOrder(interactionKeys))) {
    errors.push("interaction_evaluations_not_in_canonical_order");
  }
  if (!sameList(semanticKeys, eligibleKeys)) {
    errors.push("receipt_requires_semantic_input_for_each_nonexcluded_candidate");
  }
  if (!sameList(interactionKeys, eligibleKeys)) {
    errors.push("receipt_requires_interaction_input_for_each_nonexcluded_candidate");
  }

  const triggeredGates = new Set(
    gateResults
      .filter((result) => triggeredGateStatuses.has(result?.status))
      .map((result) => result.gate),
  );
  for (const input of list(receipt.semanticPriorityInputs)) {
    const hardGates = list(input?.hardGates);
    for (const gate of hardGates) {
      if (!triggeredGates.has(gate)) errors.push(`semantic_input_references_untriggered_gate:${input.questionKey}:${gate}`);
    }
    const expectedQuestionGates = INQUIRY_HARD_GATE_ORDER.filter((gate) => list(gateByKey.get(gate)?.evidence)
      .some((assessment) => (
        assessment?.questionKey === input?.questionKey
        && assessment?.assessmentStatus !== "clear"
      )));
    if (!sameList(hardGates, expectedQuestionGates)) {
      errors.push(`semantic_input_hard_gates_mismatch:${input?.questionKey}`);
    }
    const answerConfidenceGap = input?.answerConfidence === null
      ? 100
      : 100 - Math.round(receiptEvidenceNumber(input?.answerConfidence) * 100);
    if (input?.consequenceConfidenceGap !== receiptEvidenceNumber(input?.consequence) * answerConfidenceGap) {
      errors.push(`semantic_consequence_confidence_gap_mismatch:${input?.questionKey}`);
    }
    if (input?.staleHighImpact !== receiptEvidenceNumber(input?.staleness) * receiptEvidenceNumber(input?.consequence)) {
      errors.push(`semantic_stale_high_impact_mismatch:${input?.questionKey}`);
    }
    const answerStatus = recentStatusByKey.get(input?.questionKey) ?? "unasked";
    const answerMustBeAbsent = ["unasked", "skipped", "deferred", "withheld"].includes(answerStatus);
    if ((input?.answerConfidence === null) !== answerMustBeAbsent) {
      errors.push(`semantic_answer_confidence_status_mismatch:${input?.questionKey}`);
    }
  }

  const interaction = receipt.interactionFitInputs ?? {};
  const preferenceRefs = list(interaction.acceptedPreferenceRefs);
  const preferenceScopeRefs = list(interaction.acceptedPreferenceScopeRefs);
  const preferenceHash = interaction.acceptedPreferenceSha256;
  const acceptedOrder = list(interaction.acceptedQuestionOrder);
  if (preferenceRefs.length > 1) {
    errors.push("accepted_preference_requires_one_winning_ref");
  }
  if (preferenceRefs.length === 0 && preferenceHash !== null) {
    errors.push("accepted_preference_hash_without_refs");
  }
  if (preferenceRefs.length === 0 && preferenceScopeRefs.length > 0) {
    errors.push("accepted_preference_scope_refs_without_preference_refs");
  }
  if (preferenceRefs.length > 0 && typeof preferenceHash !== "string") {
    errors.push("accepted_preference_refs_require_hash");
  }
  if (preferenceRefs.length > 0 && preferenceScopeRefs.length === 0) {
    errors.push("accepted_preference_refs_require_scope_refs");
  }
  if (acceptedOrder.length > 0 && preferenceRefs.length === 0) {
    errors.push("accepted_question_order_requires_accepted_preference_ref");
  }
  if (preferenceRefs.length > 0 && acceptedOrder.length === 0) {
    errors.push("accepted_preference_refs_require_question_order");
  }
  if (preferenceRefs.length > 0 && acceptedOrder.length > 0) {
    const expectedPreferenceHash = hashCanonical({
      schemaVersion: "yawn.orientation-question-order-preference-evidence.v1",
      viewKind: "orientation_inquiry",
      principalRef: receipt.principalRef,
      activeScopeRefs: preferenceScopeRefs,
      fieldPath: "/question/defaultAxisOrder",
      questionKeys: acceptedOrder,
      preferenceRefs,
    }).replace(/^sha256:/, "");
    if (preferenceHash !== expectedPreferenceHash) {
      errors.push("accepted_preference_sha256_mismatch");
    }
    if (!preferenceScopeRefs.some((ref) => ref?.kind === "principal" && ref?.id === receipt.principalRef)) {
      errors.push("accepted_preference_scope_refs_missing_principal");
    }
    if (preferenceScopeRefs.some(
      (ref) => ref?.kind === "principal" && ref?.id !== receipt.principalRef,
    )) {
      errors.push("accepted_preference_scope_refs_wrong_principal");
    }
    const allowedScopeKeys = new Set([
      { kind: "principal", id: receipt.principalRef },
      { kind: "view", id: "view:default" },
      receipt.scopeRef,
      receipt.arenaRef,
    ].filter(Boolean).map(canonicalRefKey));
    for (const scopeRef of preferenceScopeRefs) {
      if (!allowedScopeKeys.has(canonicalRefKey(scopeRef))) {
        errors.push(`accepted_preference_scope_ref_outside_receipt_context:${scopeRef?.kind}:${scopeRef?.id}`);
      }
    }
    const activeScopeKeys = new Set(preferenceScopeRefs.map(canonicalRefKey));
    for (const preferenceRef of preferenceRefs) {
      if (!activeScopeKeys.has(canonicalRefKey(preferenceRef?.scopeRef))) {
        errors.push(`accepted_preference_ref_scope_not_active:${preferenceRef?.preferenceId}`);
      }
    }
  }

  const currentTurnChoice = interaction.currentTurnChoice;
  if (currentTurnChoice && [
    currentTurnChoice.questionKey,
    currentTurnChoice.promptVariant,
    currentTurnChoice.representationMedium,
    currentTurnChoice.answerInputAdapter,
  ].every((value) => value === null)) {
    errors.push("current_turn_choice_has_no_choice");
  }
  if (currentTurnChoice) {
    const orderedKeys = list(currentTurnChoice.questionKeys);
    if (orderedKeys[0] !== currentTurnChoice.questionKey) {
      errors.push("current_turn_choice_first_key_mismatch");
    }
    if (
      currentTurnChoice.assertedBy?.kind !== "principal"
      || currentTurnChoice.assertedBy?.id !== receipt.principalRef
    ) {
      errors.push("current_turn_choice_wrong_principal");
    }
    if (
      Date.parse(currentTurnChoice.recordedAt) < Date.parse(receipt.orientationMapUpdatedAt)
      || Date.parse(currentTurnChoice.recordedAt) > Date.parse(receipt.createdAt)
    ) {
      errors.push("current_turn_choice_timestamp_outside_replay_window");
    }
  }
  if (interaction.presentationOrderSource === "explicit_current_turn" && currentTurnChoice === null) {
    errors.push("explicit_current_turn_source_requires_choice_evidence");
  }
  if (interaction.presentationOrderSource !== "explicit_current_turn" && currentTurnChoice !== null) {
    errors.push("current_turn_choice_requires_explicit_source");
  }
  if (
    interaction.presentationOrderSource === "accepted_preference"
    && (preferenceRefs.length === 0 || acceptedOrder.length === 0)
  ) {
    errors.push("accepted_preference_source_requires_closed_evidence");
  }
  if (
    currentTurnChoice === null
    && preferenceRefs.length > 0
    && interaction.presentationOrderSource !== "accepted_preference"
  ) {
    errors.push("accepted_preference_evidence_requires_accepted_source");
  }
  const presentationChoiceEvidence = interaction.presentationChoiceEvidence;
  if (receipt.selectionStatus === "selected_question") {
    if (presentationChoiceEvidence === null || presentationChoiceEvidence === undefined) {
      errors.push("selected_question_requires_presentation_choice_evidence");
    } else {
      if (presentationChoiceEvidence.source !== "caller_supplied") {
        errors.push("presentation_choice_source_invalid");
      }
      if (
        presentationChoiceEvidence.representationMedium !== receipt.selectedQuestion?.representationMedium
        || presentationChoiceEvidence.answerInputAdapter !== receipt.selectedQuestion?.answerInputAdapter
      ) {
        errors.push("presentation_choice_evidence_value_mismatch");
      }
      if (canonicalRefKey(presentationChoiceEvidence.providedBy) !== canonicalRefKey(receipt.createdBy)) {
        errors.push("presentation_choice_provider_must_match_receipt_creator");
      }
      const presentationSourceKeys = list(presentationChoiceEvidence.sourceRefs).map(canonicalRefKey).sort();
      const receiptSourceKeys = list(receipt.sourceRefs).map(canonicalRefKey).sort();
      if (!sameList(presentationSourceKeys, receiptSourceKeys)) {
        errors.push("presentation_choice_source_refs_must_match_receipt_sources");
      }
    }
  } else if (presentationChoiceEvidence !== null) {
    errors.push("hold_cannot_have_presentation_choice_evidence");
  }
  for (const evaluation of list(interaction.evaluations)) {
    if (canonicalRefKey(evaluation?.derivedBy) !== canonicalRefKey(receipt.createdBy)) {
      errors.push(`interaction_evaluation_derived_by_mismatch:${evaluation?.questionKey}`);
    }
    const explicitIndex = list(currentTurnChoice?.questionKeys).indexOf(evaluation?.questionKey);
    const acceptedIndex = acceptedOrder.indexOf(evaluation?.questionKey);
    if (evaluation?.explicitCurrentTurnOrderIndex !== (explicitIndex === -1 ? null : explicitIndex)) {
      errors.push(`explicit_current_turn_order_index_mismatch:${evaluation?.questionKey}`);
    }
    if (evaluation?.acceptedQuestionOrderIndex !== (acceptedIndex === -1 ? null : acceptedIndex)) {
      errors.push(`accepted_question_order_index_mismatch:${evaluation?.questionKey}`);
    }
    const privacyNonClear = list(gateByKey.get("privacy_visibility_or_egress")?.evidence)
      .some((assessment) => (
        assessment?.questionKey === evaluation?.questionKey
        && assessment?.assessmentStatus !== "clear"
      ));
    const authorityNonClear = list(gateByKey.get("authority_or_consent")?.evidence)
      .some((assessment) => (
        assessment?.questionKey === evaluation?.questionKey
        && assessment?.assessmentStatus !== "clear"
      ));
    const expectedPermissionRisk = privacyNonClear ? 3 : authorityNonClear ? 2 : 0;
    if (evaluation?.permissionAndPrivacyRisk !== expectedPermissionRisk) {
      errors.push(`permission_and_privacy_risk_mismatch:${evaluation?.questionKey}`);
    }
    const expectedPresentationOrderIndex = interaction.presentationOrderSource === "explicit_current_turn"
      ? (explicitIndex === -1 ? null : explicitIndex)
      : interaction.presentationOrderSource === "accepted_preference"
        ? (acceptedIndex === -1 ? null : acceptedIndex)
        : null;
    if (evaluation?.presentationOrderIndex !== expectedPresentationOrderIndex) {
      errors.push(`presentation_order_index_mismatch:${evaluation?.questionKey}`);
    }
  }

  for (const evaluation of list(interaction.evaluations)) {
    const answerStatus = recentStatusByKey.get(evaluation?.questionKey) ?? "unasked";
    const expectedAnswerable = !["skipped", "deferred", "withheld"].includes(answerStatus);
    const expectedRecentDeferral = ["skipped", "deferred"].includes(answerStatus);
    if (evaluation?.answerable !== expectedAnswerable) {
      errors.push(`interaction_answerable_mismatch:${evaluation?.questionKey}`);
    }
    if (evaluation?.recentDeferralOrRepetition !== expectedRecentDeferral) {
      errors.push(`interaction_recent_deferral_mismatch:${evaluation?.questionKey}`);
    }
  }

  const expectedRenderInputSha256 = hashCanonical({
    schemaVersion: "yawn.inquiry-render-input.v0.1",
    rankingInputSha256: receipt.rankingInputSha256,
    rankingResultLimit: receipt.rankingResultLimit,
    promptVariant: receipt.selectedQuestion?.promptVariant ?? null,
    exactRenderedPrompt: receipt.selectedQuestion?.exactRenderedPrompt ?? null,
    foregroundGateKeys: list(receipt.selectedQuestion?.foregroundGateKeys),
    presentationChoiceEvidence: presentationChoiceEvidence ?? null,
    representationMedium: receipt.selectedQuestion?.representationMedium ?? null,
    answerInputAdapter: receipt.selectedQuestion?.answerInputAdapter ?? null,
    sequencePosition: receipt.selectedQuestion?.sequencePosition ?? null,
    accessibilityRequirementRefs: list(interaction.accessibilityRequirementRefs),
  }).replace(/^sha256:/, "");
  if (receipt.renderInputSha256 !== expectedRenderInputSha256) {
    errors.push("render_input_sha256_mismatch");
  }

  const recentStatusKeys = keyedValues(interaction.recentAnswerStatuses);
  for (const duplicate of duplicateValues(recentStatusKeys)) {
    errors.push(`recent_answer_status_duplicate:${duplicate}`);
  }

  const requiredHoldGates = gateResults.filter((result) => result?.status === "required_hold");
  const foregroundGates = gateResults.filter((result) => result?.status === "foreground");
  const unresolvedGateResults = gateResults.filter((result) => result?.status === "unknown");
  const finalistKeys = list(receipt.deterministicTieBreak?.finalistQuestionKeys);
  requireUniqueKnownSubset(errors, finalistKeys, eligibleSet, "tie_break_finalist_question_key");

  if (receipt.selectionStatus === "selected_question") {
    if (requiredHoldGates.length > 0) errors.push("selected_question_bypasses_required_hold_gate");

    const selectedKey = receipt.selectedQuestion?.questionKey;
    if (!candidateSet.has(selectedKey)) errors.push(`selected_question_not_a_candidate:${selectedKey}`);
    if (exclusionSet.has(selectedKey)) errors.push(`selected_question_was_excluded:${selectedKey}`);
    const selectedEvaluation = list(interaction.evaluations)
      .find((evaluation) => evaluation?.questionKey === selectedKey);
    if (selectedEvaluation?.answerable !== true) {
      errors.push(`selected_question_not_answerable:${selectedKey}`);
    }
    if (!finalistKeys.includes(selectedKey)) errors.push(`selected_question_not_a_finalist:${selectedKey}`);

    const semanticByKey = new Map(list(receipt.semanticPriorityInputs)
      .map((input) => [input?.questionKey, input]));
    const interactionByKey = new Map(list(interaction.evaluations)
      .map((input) => [input?.questionKey, input]));
    const rankedEvidence = eligibleKeys
      .map((questionKey) => receiptEvidenceCandidate(questionKey, semanticByKey, interactionByKey, gateByKey))
      .sort(compareReceiptEvidenceCandidates);
    const expectedTieBreak = receiptEvidenceTieBreakTrace(rankedEvidence);
    if (rankedEvidence[0]?.questionKey !== selectedKey) {
      errors.push(`selected_question_not_evidence_ranked_winner:${selectedKey}`);
    }
    if (receipt.deterministicTieBreak?.appliedThrough !== expectedTieBreak.appliedThrough) {
      errors.push("deterministic_tie_break_applied_through_mismatch");
    }
    if (!sameList(finalistKeys, expectedTieBreak.finalistQuestionKeys)) {
      errors.push("deterministic_tie_break_finalists_mismatch");
    }

    const gatesThatMustBeForegrounded = [...foregroundGates, ...unresolvedGateResults]
      .sort((left, right) => INQUIRY_HARD_GATE_ORDER.indexOf(left.gate) - INQUIRY_HARD_GATE_ORDER.indexOf(right.gate));
    const foregroundGateKeys = gatesThatMustBeForegrounded.map(({ gate }) => gate);
    if (!sameList(list(receipt.selectedQuestion?.foregroundGateKeys), foregroundGateKeys)) {
      errors.push("selected_question_foreground_gate_keys_mismatch");
    }
    try {
      const expectedPrompt = renderOrientationPrompt(selectedKey, foregroundGateKeys);
      if (receipt.selectedQuestion?.promptVariant !== expectedPrompt.promptVariant) {
        errors.push(`selected_prompt_variant_mismatch:${selectedKey}`);
      }
      if (receipt.selectedQuestion?.exactRenderedPrompt !== expectedPrompt.exactRenderedPrompt) {
        errors.push(`selected_rendered_prompt_mismatch:${selectedKey}`);
      }
    } catch {
      errors.push(`selected_rendered_prompt_not_replayable:${selectedKey}`);
    }
  }

  if (receipt.selectionStatus === "hold") {
    if (finalistKeys.length > 0) errors.push("hold_cannot_have_tie_break_finalists");
    if (requiredHoldGates.length > 0) {
      const allowedReasons = new Set([
        "no_candidate_survives_hard_gates",
        "unforegroundable_live_hard_gate",
      ]);
      if (!allowedReasons.has(receipt.hold?.reasonCode)) {
        errors.push("hold_reason_does_not_name_required_gate");
      }
    }
    if (
      receipt.hold?.reasonCode === "principal_requested_pause"
      && (
        receipt.hold?.assertedBy?.kind !== "principal"
        || receipt.hold?.assertedBy?.id !== receipt.principalRef
      )
    ) {
      errors.push("principal_pause_wrong_principal");
    }
    const nonexcludedStatuses = eligibleKeys.map((key) => recentStatusByKey.get(key) ?? "unasked");
    if (
      receipt.hold?.reasonCode === "no_unresolved_orientation_axis"
      && eligibleKeys.length !== 0
    ) {
      errors.push("no_unresolved_hold_requires_zero_nonexcluded_axes");
    }
    if (
      receipt.hold?.reasonCode === "all_remaining_axes_deferred_or_withheld"
      && (
        eligibleKeys.length === 0
        || nonexcludedStatuses.some((status) => !["deferred", "withheld"].includes(status))
      )
    ) {
      errors.push("all_remaining_deferred_hold_status_mismatch");
    }
    if (
      receipt.hold?.reasonCode === "no_currently_askable_orientation_axis"
      && (
        eligibleKeys.length !== 0
        || ![...recentStatusByKey.values()].includes("skipped")
      )
    ) {
      errors.push("no_currently_askable_hold_status_mismatch");
    }
    const answerableEvaluations = list(interaction.evaluations)
      .filter(({ answerable }) => answerable === true);
    if (
      receipt.hold?.reasonCode === "no_candidate_survives_hard_gates"
      && (requiredHoldGates.length === 0 || answerableEvaluations.length !== 0)
    ) {
      errors.push("no_candidate_survives_hard_gates_hold_mismatch");
    }
    if (
      receipt.hold?.reasonCode === "unforegroundable_live_hard_gate"
      && (requiredHoldGates.length === 0 || answerableEvaluations.length === 0)
    ) {
      errors.push("unforegroundable_live_hard_gate_hold_mismatch");
    }
  }

  if (receipt.requestedHold !== null && receipt.hold === null) {
    errors.push("requested_hold_requires_actual_hold");
  }
  if (
    receipt.requestedHold !== null
    && ![
      "ambiguous_referent",
      "missing_source_or_authority_context",
      "unbounded_or_unnecessary_burden",
      "principal_requested_pause",
    ].includes(receipt.requestedHold?.reasonCode)
  ) {
    errors.push("requested_hold_reason_not_requestable");
  }
  if (
    receipt.requestedHold !== null
    && requiredHoldGates.length === 0
    && canonicalJson(receipt.requestedHold) !== canonicalJson(receipt.hold)
  ) {
    errors.push("requested_hold_must_match_actual_hold_without_gate_override");
  }
  if (
    receipt.requestedHold === null
    && [
      "ambiguous_referent",
      "missing_source_or_authority_context",
      "unbounded_or_unnecessary_burden",
      "principal_requested_pause",
    ].includes(receipt.hold?.reasonCode)
  ) {
    errors.push("manual_hold_requires_requested_hold_evidence");
  }
  if (
    receipt.requestedHold?.reasonCode === "principal_requested_pause"
    && (
      receipt.requestedHold?.assertedBy?.kind !== "principal"
      || receipt.requestedHold?.assertedBy?.id !== receipt.principalRef
    )
  ) {
    errors.push("requested_principal_pause_wrong_principal");
  }

  return errors;
}
