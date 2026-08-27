import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import test from "node:test";
import Ajv2020 from "ajv/dist/2020.js";
import {
  ORIENTATION_GATE_ORDER,
  ORIENTATION_GATE_PROMPT_CLAUSES,
  ORIENTATION_PROMPTS,
  ORIENTATION_PROMPT_SET_SHA256,
  ORIENTATION_PROMPT_SET_VERSION,
  ORIENTATION_QUESTION_KEYS,
  ORIENTATION_QUESTION_PACKET,
  ORIENTATION_RANKING_POLICY_VERSION,
  normalizeOrientationMap,
  orientationMapMaterializationSha256,
  orientationMapPresentationProfileSha256,
  orientationMapRankingInputSha256,
  orientationMapSemanticSha256,
  rankNextOrientationQuestions,
  renderOrientationPrompt,
} from "../lib/orientation-map-v0.1.mjs";
import {
  orientationQuestionOrderPreferenceFromResolved,
  resolveProjectionPreferences,
} from "../lib/projection-preference-v1.mjs";

const clone = (value) => structuredClone(value);
const readJson = async (path) => JSON.parse(await readFile(new URL(`../${path}`, import.meta.url), "utf8"));
const root = fileURLToPath(new URL("../", import.meta.url));
const fixture = await readJson("fixtures/orientation-map.v0.1.json");
const schema = await readJson("schemas/orientation-map.v0.1.schema.json");

const rfc3339 = /^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])T([01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9](\.[0-9]{1,3})?Z$/;
const strictDateTime = (value) => {
  if (typeof value !== "string" || !rfc3339.test(value)) return false;
  const [year, month, day] = value.slice(0, 10).split("-").map(Number);
  return day <= new Date(Date.UTC(year, month, 0)).getUTCDate() && Number.isFinite(Date.parse(value));
};

const ajv = new Ajv2020({ allErrors: true, strict: true, formats: { "date-time": strictDateTime } });
ajv.addSchema(await readJson("schemas/record-ref.v1.schema.json"));
const validate = ajv.compile(schema);
const validateSelectionOptions = ajv.compile({ $ref: `${schema.$id}#/$defs/SelectionOptions` });
const schemaErrors = (validator = validate) => ajv.errorsText(validator.errors, { separator: "\n" });

const selectionReceiptRef = (questionKey, label) => ({
  kind: "inquiry_selection_receipt",
  id: `receipt:test:${questionKey}:${label}`,
  revision: 1,
  stateSha256: "f".repeat(64),
});

const questionEventRef = (questionKey, label, assertedBy = "principal:fixture-owner") => ({
  kind: "question_event",
  id: `question-event:${questionKey}:${label}`,
  revision: 1,
  stateSha256: "e".repeat(64),
  assertedBy,
  selectionReceiptRef: selectionReceiptRef(questionKey, label),
});

function clearHardGates(signals) {
  for (const assessment of Object.values(signals.hardGateAssessments)) {
    assessment.status = "clear";
    assessment.assertedBy = "principal:fixture-owner";
    assessment.epistemicStatus = "reported";
    assessment.sourceRefs = [{ kind: "principal", id: "principal:fixture-owner" }];
    assessment.confidence = 1;
  }
}

const gateAssessmentKey = {
  immediateSafetyOrStabilityBlocker: "immediateSafetyOrStability",
  authorityOrConsentBlocker: "authorityOrConsent",
  privacyVisibilityOrEgressBlocker: "privacyVisibilityOrEgress",
  sourceOrProvenanceLossBlocker: "sourceOrProvenance",
  proofOrFalsifierIntegrityBlocker: "proofOrFalsifierIntegrity",
};

function activateHardGate(signals, legacyField) {
  const assessment = signals.hardGateAssessments[gateAssessmentKey[legacyField]];
  assessment.status = "active";
  assessment.epistemicStatus = "inferred";
  assessment.confidence = 1;
}

function setAnswered(map, questionKey) {
  const axis = map.axes[questionKey];
  axis.coverageStatus = "covered";
  axis.answerStatus = "answered";
  axis.mappingStatus = "accepted";
  axis.currentAnswer = clone(fixture.axes.scope.currentAnswer);
  axis.currentAnswer.summary = `Accepted answer for ${questionKey}.`;
  axis.currentAnswer.selectionReceiptRef = selectionReceiptRef(questionKey, "answered");
  axis.currentAnswer.freshness = "current";
  axis.currentAnswer.disputeStatus = "undisputed";
  axis.questionEventRefs = [questionEventRef(questionKey, "answered")];
  clearHardGates(axis.rankingSignals);
  axis.rankingSignals.movementCriticalMissingInformation = false;
  axis.rankingSignals.affectedRelationshipOrUnresolvedRole = false;
  axis.rankingSignals.contradictionOrDispute = false;
  axis.rankingSignals.staleness = 0;
  axis.rankingSignals.proofOrCloseConditionGap = false;
}

function setUnasked(map, questionKey) {
  const axis = map.axes[questionKey];
  axis.coverageStatus = "missing";
  axis.answerStatus = "unasked";
  axis.mappingStatus = "unmapped";
  axis.currentAnswer = null;
  axis.questionEventRefs = [];
  clearHardGates(axis.rankingSignals);
  axis.rankingSignals.movementCriticalMissingInformation = false;
  axis.rankingSignals.affectedRelationshipOrUnresolvedRole = false;
  axis.rankingSignals.contradictionOrDispute = false;
  axis.rankingSignals.staleness = 0;
  axis.rankingSignals.proofOrCloseConditionGap = false;
}

function setSuppressed(map, questionKey, answerStatus) {
  const axis = map.axes[questionKey];
  axis.coverageStatus = "missing";
  axis.answerStatus = answerStatus;
  axis.mappingStatus = "accepted";
  axis.currentAnswer = null;
  axis.questionEventRefs = [questionEventRef(questionKey, answerStatus)];
  clearHardGates(axis.rankingSignals);
  axis.rankingSignals.movementCriticalMissingInformation = false;
  axis.rankingSignals.affectedRelationshipOrUnresolvedRole = false;
  axis.rankingSignals.contradictionOrDispute = false;
  axis.rankingSignals.staleness = 0;
  axis.rankingSignals.proofOrCloseConditionGap = false;
}

function resolvedMap() {
  const map = clone(fixture);
  for (const questionKey of ORIENTATION_QUESTION_KEYS) setAnswered(map, questionKey);
  return map;
}

function assertSchemaAndRuntimeReject(map, runtimePattern) {
  assert.equal(validate(map), false, "schema unexpectedly accepted invalid map");
  assert.throws(() => normalizeOrientationMap(map), runtimePattern);
}

const acceptedOrder = (questionKeys) => orientationQuestionOrderPreferenceFromResolved(
  resolveProjectionPreferences([{ preferences: [{
    schemaVersion: "yawn.projection-preference.v1",
    preferenceId: "projection-preference:accepted-order",
    principalRef: "principal:fixture-owner",
    scopeRef: { kind: "principal", id: "principal:fixture-owner" },
    viewKind: "orientation_inquiry",
    fieldPath: "/question/defaultAxisOrder",
    operation: "set",
    value: questionKeys,
    status: "accepted",
    revision: 1,
    sourceEventRef: "event:accepted-orientation-order",
    createdAt: "2026-08-27T12:00:00Z",
    updatedAt: "2026-08-27T12:00:00Z",
  }] }], {
    viewKind: "orientation_inquiry",
    principalRef: "principal:fixture-owner",
    activeScopeRefs: [{ kind: "principal", id: "principal:fixture-owner" }],
  }),
);

const currentTurnOrder = (questionKeys) => ({
  questionKeys,
  assertedBy: "principal:fixture-owner",
  sourceRefs: [{ kind: "source", id: "current-turn:orientation-order" }],
  recordedAt: "2026-08-27T12:01:00Z",
});

test("fixture is schema-valid and uses the exact nine orientation axes", () => {
  assert.equal(validate(fixture), true, schemaErrors());
  const normalized = normalizeOrientationMap(fixture);
  assert.deepEqual(Object.keys(normalized.axes), ORIENTATION_QUESTION_KEYS);
  assert.equal(normalized.canonicalState, false);
  assert.equal(normalized.projectionStatus, "proposed");
  assert.equal(normalized.rankingPolicy.policyVersion, ORIENTATION_RANKING_POLICY_VERSION);
  assert.equal(JSON.stringify(normalized).includes("functionKey"), false);
});

test("presentation-profile items remain attributed hypotheses and proposals", () => {
  const acceptedMedium = clone(fixture);
  acceptedMedium.presentationProfileHypotheses.preferredMedia[0].proposalStatus = "accepted";
  assertSchemaAndRuntimeReject(acceptedMedium, /orientation_medium_must_remain_proposed/);

  const assertedOrder = clone(fixture);
  assertedOrder.presentationProfileHypotheses.preferredQuestionOrder.epistemicStatus = "reported";
  assertSchemaAndRuntimeReject(assertedOrder, /orientation_order_must_remain_hypothesized/);
});

test("question packet bytes, version, and all exact default prompts are pinned", async () => {
  const packetBytes = await readFile(new URL("../question-packets/orientation-nine.yawn", import.meta.url));
  const packetText = packetBytes.toString("utf8");
  const byteSha256 = createHash("sha256").update(packetBytes).digest("hex");
  assert.equal(byteSha256, "8c1faa75c7dffaad21d559a9ffafeab4ac4c771c4151c322cfd53cd0f4d83cab");
  assert.equal(ORIENTATION_PROMPT_SET_SHA256, byteSha256);
  assert.equal(ORIENTATION_QUESTION_PACKET.sha256, byteSha256);
  assert.equal(packetText.match(/^version:\s+(\S+)$/m)?.[1], ORIENTATION_PROMPT_SET_VERSION);
  assert.equal(ORIENTATION_QUESTION_PACKET.version, ORIENTATION_PROMPT_SET_VERSION);

  const packetPrompts = Object.fromEntries(
    [...packetText.matchAll(/  - question_key: ([^\n]+)[\s\S]*?    default_prompt: "([^"]+)"/g)]
      .map((match) => [match[1], match[2]]),
  );
  assert.deepEqual(Object.keys(packetPrompts), ORIENTATION_QUESTION_KEYS);
  assert.deepEqual(packetPrompts, ORIENTATION_PROMPTS);
  const ranked = rankNextOrientationQuestions(fixture);
  for (const candidate of ranked.candidates) {
    assert.deepEqual(
      {
        promptVariant: candidate.promptVariant,
        exactRenderedPrompt: candidate.exactRenderedPrompt,
      },
      renderOrientationPrompt(candidate.questionKey, candidate.foregroundGateKeys),
    );
  }
});

test("semantic identity ignores proposed presentation hypotheses but ranking inputs do not ignore control state", () => {
  const presentationOnly = clone(fixture);
  presentationOnly.presentationProfileHypotheses.preferredMedia.reverse();
  presentationOnly.presentationProfileHypotheses.preferredQuestionOrder.questionKeys.reverse();
  presentationOnly.presentationProfileHypotheses.preferredQuestionOrder.confidence = 0.99;
  assert.equal(orientationMapSemanticSha256(presentationOnly), orientationMapSemanticSha256(fixture));
  assert.equal(orientationMapRankingInputSha256(presentationOnly), orientationMapRankingInputSha256(fixture));
  assert.notEqual(orientationMapPresentationProfileSha256(presentationOnly), orientationMapPresentationProfileSha256(fixture));
  assert.notEqual(orientationMapMaterializationSha256(presentationOnly), orientationMapMaterializationSha256(fixture));

  const rankingSignalChange = clone(fixture);
  rankingSignalChange.axes.proof.rankingSignals.informationValue = 0;
  assert.equal(orientationMapSemanticSha256(rankingSignalChange), orientationMapSemanticSha256(fixture));
  assert.notEqual(orientationMapRankingInputSha256(rankingSignalChange), orientationMapRankingInputSha256(fixture));

  const gateAssessmentChange = clone(fixture);
  gateAssessmentChange.axes.boundary.rankingSignals.hardGateAssessments.immediateSafetyOrStability.status = "unknown";
  gateAssessmentChange.axes.boundary.rankingSignals.hardGateAssessments.immediateSafetyOrStability.epistemicStatus = "unknown";
  gateAssessmentChange.axes.boundary.rankingSignals.hardGateAssessments.immediateSafetyOrStability.confidence = 0;
  assert.notEqual(orientationMapSemanticSha256(gateAssessmentChange), orientationMapSemanticSha256(fixture));

  const revisionChange = clone(fixture);
  revisionChange.revision += 1;
  assert.notEqual(orientationMapRankingInputSha256(revisionChange), orientationMapRankingInputSha256(fixture));

  const eventChange = clone(fixture);
  eventChange.axes.scope.questionEventRefs.push(questionEventRef("scope", "confirmation"));
  assert.notEqual(orientationMapSemanticSha256(eventChange), orientationMapSemanticSha256(fixture));
});

test("proposed presentation order is ignored; accepted order applies and current-turn order wins", () => {
  const map = resolvedMap();
  setUnasked(map, "placement");
  setUnasked(map, "perspective");
  map.axes.perspective.rankingSignals = clone(map.axes.placement.rankingSignals);
  map.presentationProfileHypotheses.preferredQuestionOrder.questionKeys = ["perspective", "placement"];

  assert.deepEqual(
    rankNextOrientationQuestions(map, { limit: 2 }).candidates.map(({ questionKey }) => questionKey),
    ["placement", "perspective"],
  );

  const accepted = rankNextOrientationQuestions(map, {
    limit: 2,
    acceptedQuestionOrderPreference: acceptedOrder(["perspective", "placement"]),
  });
  assert.deepEqual(accepted.candidates.map(({ questionKey }) => questionKey), ["perspective", "placement"]);
  assert.equal(accepted.questionOrderSource, "accepted_preference");
  assert.equal(accepted.acceptedPreferenceHash, acceptedOrder(["perspective", "placement"]).preferenceHash);

  const explicit = rankNextOrientationQuestions(map, {
    limit: 2,
    acceptedQuestionOrderPreference: acceptedOrder(["perspective", "placement"]),
    currentTurnQuestionOrder: currentTurnOrder(["placement", "perspective"]),
  });
  assert.deepEqual(explicit.candidates.map(({ questionKey }) => questionKey), ["placement", "perspective"]);
  assert.equal(explicit.questionOrderSource, "explicit_current_turn");
  assert.notEqual(explicit.rankingInputSha256, accepted.rankingInputSha256);

  const partialExplicit = rankNextOrientationQuestions(map, {
    limit: 2,
    acceptedQuestionOrderPreference: acceptedOrder(["perspective", "placement"]),
    currentTurnQuestionOrder: currentTurnOrder(["scope"]),
  });
  assert.deepEqual(
    partialExplicit.candidates.map(({ questionKey }) => questionKey),
    ["perspective", "placement"],
  );
  assert.equal(partialExplicit.deterministicTieBreak.appliedThrough, "accepted_question_order_preference");

  assert.throws(() => rankNextOrientationQuestions(map, {
    currentTurnQuestionOrder: {
      ...currentTurnOrder(["placement"]),
      assertedBy: "principal:different-owner",
    },
  }), /wrong_principal/);
  assert.throws(() => rankNextOrientationQuestions(map, {
    currentTurnQuestionOrder: {
      ...currentTurnOrder(["placement"]),
      recordedAt: "2026-08-26T00:00:00Z",
    },
  }), /current_turn_order_predates_map/);
  assert.throws(() => rankNextOrientationQuestions(map, {
    acceptedQuestionOrderPreference: {
      ...acceptedOrder(["placement"]),
      principalRef: "principal:different-owner",
    },
  }), /principal_scope_required|preference_wrong_principal/);

  assert.throws(() => rankNextOrientationQuestions(map, {
    acceptedQuestionOrderPreference: { ...acceptedOrder(["perspective"]), status: "proposed" },
  }), /must_be_accepted/);
  const multipleWinningRefs = acceptedOrder(["perspective"]);
  multipleWinningRefs.preferenceRefs.push({
    preferenceId: "projection-preference:unrelated",
    revision: 1,
    stateSha256: "d".repeat(64),
    scopeRef: { kind: "principal", id: "principal:fixture-owner" },
  });
  assert.equal(validateSelectionOptions({ acceptedQuestionOrderPreference: multipleWinningRefs }), false);
  assert.throws(() => rankNextOrientationQuestions(map, {
    acceptedQuestionOrderPreference: multipleWinningRefs,
  }), /requires_one_winning_ref/);
  assert.throws(() => rankNextOrientationQuestions(map, {
    acceptedQuestionOrderPreference: {
      ...acceptedOrder(["perspective"]),
      preferenceHash: ["b".repeat(64)],
    },
  }), /preference_hash_invalid/);
  assert.throws(() => rankNextOrientationQuestions(map, {
    acceptedQuestionOrderPreference: {
      ...acceptedOrder(["perspective"]),
      questionKeys: ["placement"],
    },
  }), /preference_hash_mismatch/);

  const foreignArenaPreference = orientationQuestionOrderPreferenceFromResolved(
    resolveProjectionPreferences([{ preferences: [{
      schemaVersion: "yawn.projection-preference.v1",
      preferenceId: "projection-preference:foreign-arena-order",
      principalRef: "principal:fixture-owner",
      scopeRef: { kind: "principal", id: "principal:fixture-owner" },
      viewKind: "orientation_inquiry",
      fieldPath: "/question/defaultAxisOrder",
      operation: "set",
      value: ["perspective", "placement"],
      status: "accepted",
      revision: 1,
      sourceEventRef: "event:foreign-arena-order",
      createdAt: "2026-08-27T12:00:00Z",
      updatedAt: "2026-08-27T12:00:00Z",
    }] }], {
      viewKind: "orientation_inquiry",
      principalRef: "principal:fixture-owner",
      activeScopeRefs: [
        { kind: "principal", id: "principal:fixture-owner" },
        { kind: "arena", id: "arena:foreign" },
      ],
    }),
  );
  assert.throws(() => rankNextOrientationQuestions(map, {
    acceptedQuestionOrderPreference: foreignArenaPreference,
  }), /active_scope_outside_map_context/);
});

test("hard gates precede status exclusions and presentation order", () => {
  const coveredGate = resolvedMap();
  activateHardGate(coveredGate.axes.boundary.rankingSignals, "immediateSafetyOrStabilityBlocker");
  const coveredResult = rankNextOrientationQuestions(coveredGate, {
    acceptedQuestionOrderPreference: acceptedOrder(["proof", "movement", "scope"]),
  });
  assert.deepEqual(coveredResult.candidates.map(({ questionKey }) => questionKey), ["boundary"]);
  assert.equal(coveredResult.candidateDispositions.find(({ questionKey }) => questionKey === "boundary").disposition, "ranked");

  const priority = resolvedMap();
  const keysAndGates = [
    ["scope", "immediateSafetyOrStabilityBlocker"],
    ["placement", "authorityOrConsentBlocker"],
    ["perspective", "privacyVisibilityOrEgressBlocker"],
    ["current-state", "sourceOrProvenanceLossBlocker"],
    ["intent", "proofOrFalsifierIntegrityBlocker"],
  ];
  for (const [questionKey, gate] of keysAndGates) {
    setUnasked(priority, questionKey);
    priority.axes[questionKey].rankingSignals = clone(priority.axes.scope.rankingSignals);
    clearHardGates(priority.axes[questionKey].rankingSignals);
    activateHardGate(priority.axes[questionKey].rankingSignals, gate);
  }
  const result = rankNextOrientationQuestions(priority, {
    acceptedQuestionOrderPreference: acceptedOrder(keysAndGates.map(([key]) => key).reverse()),
  });
  assert.deepEqual(result.candidates.map(({ questionKey }) => questionKey), ["scope", "placement", "perspective"]);
  assert.ok(result.candidates.length <= 3);
  assert.deepEqual(result.foregroundGateKeys, ORIENTATION_GATE_ORDER);
  assert.equal(result.candidates[0].promptVariant, "gated");
  assert.equal(
    result.candidates[0].exactRenderedPrompt,
    `Before answering, address these live or unresolved gates: ${ORIENTATION_GATE_ORDER
      .map((gateKey) => ORIENTATION_GATE_PROMPT_CLAUSES[gateKey])
      .join("; ")}. Then answer: ${ORIENTATION_PROMPTS.scope}`,
  );
});

test("a safety gate remains visible when the proof axis is selected", () => {
  const map = resolvedMap();
  setUnasked(map, "proof");
  activateHardGate(map.axes.proof.rankingSignals, "immediateSafetyOrStabilityBlocker");
  const result = rankNextOrientationQuestions(map, { limit: 1 });
  assert.deepEqual(result.foregroundGateKeys, ["immediate_safety_or_stability"]);
  assert.equal(result.candidates[0].questionKey, "proof");
  assert.equal(result.candidates[0].promptVariant, "gated");
  assert.equal(
    result.candidates[0].exactRenderedPrompt,
    `Before answering, address these live or unresolved gates: immediate safety or stability. Then answer: ${ORIENTATION_PROMPTS.proof}`,
  );
});

test("machine inference cannot clear any hard gate", () => {
  for (const gateKey of [
    "immediateSafetyOrStability",
    "authorityOrConsent",
    "privacyVisibilityOrEgress",
    "sourceOrProvenance",
    "proofOrFalsifierIntegrity",
  ]) {
    const map = clone(fixture);
    const assessment = map.axes.scope.rankingSignals.hardGateAssessments[gateKey];
    assessment.assertedBy = "assistant:fixture-cartographer";
    assessment.epistemicStatus = "inferred";
    assessment.confidence = 1;
    assessment.sourceRefs = [{ kind: "source", id: "source:self-certified-clear" }];
    assertSchemaAndRuntimeReject(map, /clear_requires_principal_report/);
  }

  const wrongPrincipal = clone(fixture);
  const authority = wrongPrincipal.axes.scope.rankingSignals.hardGateAssessments.authorityOrConsent;
  authority.assertedBy = "principal:other";
  authority.sourceRefs = [{ kind: "principal", id: "principal:other" }];
  assert.equal(validate(wrongPrincipal), true, schemaErrors());
  assert.throws(() => normalizeOrientationMap(wrongPrincipal), /clear_wrong_principal/);
});

test("a suppressed live gate holds without rendering the question, and deferred/withheld exhaustion is distinct", () => {
  const liveGate = resolvedMap();
  setSuppressed(liveGate, "boundary", "withheld");
  activateHardGate(liveGate.axes.boundary.rankingSignals, "immediateSafetyOrStabilityBlocker");
  const blocked = rankNextOrientationQuestions(liveGate);
  assert.equal(blocked.selectionStatus, "hold");
  assert.equal(blocked.hold.reasonCode, "no_candidate_survives_hard_gates");
  assert.deepEqual(blocked.hardGateBlockedQuestionKeys, ["boundary"]);
  assert.deepEqual(blocked.candidates, []);
  const boundaryDisposition = blocked.candidateDispositions.find(({ questionKey }) => questionKey === "boundary");
  assert.equal(boundaryDisposition.disposition, "held");
  assert.ok(boundaryDisposition.exclusionReasons.some((reason) => reason.startsWith("blocked_hard_gate:")));

  const mixedGates = resolvedMap();
  setSuppressed(mixedGates, "boundary", "withheld");
  activateHardGate(mixedGates.axes.boundary.rankingSignals, "authorityOrConsentBlocker");
  setUnasked(mixedGates, "scope");
  activateHardGate(mixedGates.axes.scope.rankingSignals, "immediateSafetyOrStabilityBlocker");
  const mixedResult = rankNextOrientationQuestions(mixedGates);
  assert.equal(mixedResult.selectionStatus, "hold");
  assert.equal(mixedResult.hold.reasonCode, "unforegroundable_live_hard_gate");
  assert.deepEqual(mixedResult.foregroundHardGateQuestionKeys, ["scope"]);
  assert.deepEqual(mixedResult.hardGateBlockedQuestionKeys, ["boundary"]);
  assert.deepEqual(mixedResult.candidates, []);

  const paused = resolvedMap();
  setSuppressed(paused, "movement", "deferred");
  setSuppressed(paused, "proof", "withheld");
  const pausedResult = rankNextOrientationQuestions(paused);
  assert.equal(pausedResult.selectionStatus, "hold");
  assert.equal(pausedResult.hold.reasonCode, "all_remaining_axes_deferred_or_withheld");
  assert.deepEqual(pausedResult.candidates, []);

  const complete = rankNextOrientationQuestions(resolvedMap());
  assert.equal(complete.hold.reasonCode, "no_unresolved_orientation_axis");

  const skipped = resolvedMap();
  setSuppressed(skipped, "lacuna", "skipped");
  assert.equal(rankNextOrientationQuestions(skipped).hold.reasonCode, "no_currently_askable_orientation_axis");
});

test("typed holds and selector options fail closed", () => {
  const validHold = {
    reasonCode: "explicit_principal_pause",
    description: "Pause this inquiry for the current turn.",
    assertedBy: "principal:fixture-owner",
    sourceRefs: [{ kind: "source", id: "current-turn:pause" }],
    reopenCondition: "The principal asks to resume.",
  };
  assert.equal(validateSelectionOptions({ limit: 1, hold: validHold }), true, schemaErrors(validateSelectionOptions));
  const result = rankNextOrientationQuestions(fixture, { limit: 1, hold: validHold });
  assert.equal(result.selectionStatus, "hold");
  assert.deepEqual(result.hold, normalizeOrientationMap(fixture) && validHold);
  assert.deepEqual(result.candidates, []);
  assert.throws(() => rankNextOrientationQuestions(fixture, { holdReason: "pause" }), /fields_invalid/);
  assert.throws(() => rankNextOrientationQuestions(fixture, {
    hold: { ...validHold, assertedBy: "assistant:selector" },
  }), /requires_principal/);
  assert.throws(() => rankNextOrientationQuestions(fixture, {
    hold: { ...validHold, assertedBy: "principal:different-owner" },
  }), /wrong_principal/);
  assert.equal(validateSelectionOptions({
    hold: { ...validHold, assertedBy: "assistant:selector" },
  }), false);
  assert.throws(() => rankNextOrientationQuestions(fixture, { limit: 4 }), /limit_invalid/);
  assert.throws(() => rankNextOrientationQuestions(fixture, { limit: null }), /limit_invalid/);
  const falseAutomaticHold = {
    ...validHold,
    reasonCode: "no_unresolved_orientation_axis",
    assertedBy: "system:untrusted-selector",
  };
  assert.equal(validateSelectionOptions({ hold: falseAutomaticHold }), false);
  assert.throws(() => rankNextOrientationQuestions(fixture, { hold: falseAutomaticHold }), /reason_code_invalid/);
  assert.throws(() => rankNextOrientationQuestions(fixture, {
    hold: {
      reasonCode: "unbounded_or_unnecessary_burden",
      description: "Do not ask another question.",
      assertedBy: "assistant:selector",
      sourceRefs: [{ kind: "source", id: "selector:burden-estimate" }],
      reopenCondition: "The burden estimate changes.",
    },
  }), /cannot_bypass_live_hard_gate/);
});

test("coverage, answer, mapping, and event statuses remain separate and schema/runtime aligned", () => {
  const unaskedWithEvent = clone(fixture);
  unaskedWithEvent.axes.perspective.questionEventRefs.push(questionEventRef("perspective", "unexpected"));
  assertSchemaAndRuntimeReject(unaskedWithEvent, /unasked_event_forbidden/);

  const answerWithoutEvent = clone(fixture);
  answerWithoutEvent.axes.scope.questionEventRefs = [];
  assertSchemaAndRuntimeReject(answerWithoutEvent, /question_event_required/);

  const acceptedMachineProposal = clone(fixture);
  acceptedMachineProposal.axes.placement.coverageStatus = "covered";
  acceptedMachineProposal.axes.placement.answerStatus = "answered";
  acceptedMachineProposal.axes.placement.mappingStatus = "accepted";
  assertSchemaAndRuntimeReject(acceptedMachineProposal, /machine_answer_must_remain_proposed/);

  const reportedMachineAnswer = clone(fixture);
  reportedMachineAnswer.axes.placement.currentAnswer.epistemicStatus = "reported";
  assertSchemaAndRuntimeReject(reportedMachineAnswer, /machine_answer_must_remain_inference/);

  const reportedMachineRanking = clone(fixture);
  reportedMachineRanking.axes.proof.rankingSignals.epistemicStatus = "reported";
  assertSchemaAndRuntimeReject(reportedMachineRanking, /machine_ranking_signal_must_remain_inference/);

  const malformedMachineActor = clone(fixture);
  malformedMachineActor.axes.placement.currentAnswer.assertedBy = "assistant";
  assertSchemaAndRuntimeReject(malformedMachineActor, /orientation_answer_asserted_by_invalid/);

  for (const status of ["skipped", "deferred", "withheld"]) {
    const map = clone(fixture);
    setSuppressed(map, "perspective", status);
    assert.equal(validate(map), true, `${status}: ${schemaErrors()}`);
    assert.equal(normalizeOrientationMap(map).axes.perspective.answerStatus, status);
  }
});

test("bounds, RFC3339 timestamps, duplicates, and code-unit source ordering fail closed", () => {
  const longId = clone(fixture);
  longId.orientationMapId = "x".repeat(501);
  assertSchemaAndRuntimeReject(longId, /orientation_map_id_too_long/);

  const unsafeRevision = clone(fixture);
  unsafeRevision.revision = Number.MAX_SAFE_INTEGER + 1;
  assertSchemaAndRuntimeReject(unsafeRevision, /orientation_map_revision_invalid/);

  const longSummary = clone(fixture);
  longSummary.axes.scope.currentAnswer.summary = "🙂".repeat(64001);
  assertSchemaAndRuntimeReject(longSummary, /orientation_answer_summary_too_long/);

  const dateOnly = clone(fixture);
  dateOnly.updatedAt = "2026-08-27";
  assertSchemaAndRuntimeReject(dateOnly, /updated_at_invalid/);

  const offsetTimestamp = clone(fixture);
  offsetTimestamp.updatedAt = "2026-08-27T05:00:00-07:00";
  assertSchemaAndRuntimeReject(offsetTimestamp, /updated_at_invalid/);

  const excessiveFraction = clone(fixture);
  excessiveFraction.updatedAt = "2026-08-27T12:00:00.0009Z";
  assertSchemaAndRuntimeReject(excessiveFraction, /updated_at_invalid/);

  const impossibleDate = clone(fixture);
  impossibleDate.updatedAt = "2026-02-31T00:00:00Z";
  assertSchemaAndRuntimeReject(impossibleDate, /updated_at_invalid/);

  const reversedChronology = clone(fixture);
  reversedChronology.createdAt = "2026-08-27T12:01:00Z";
  assert.equal(validate(reversedChronology), true, schemaErrors());
  assert.throws(() => normalizeOrientationMap(reversedChronology), /timestamp_order_invalid/);

  const futureAnswer = clone(fixture);
  futureAnswer.axes.scope.currentAnswer.updatedAt = "2099-01-01T00:00:00Z";
  assert.throws(() => normalizeOrientationMap(futureAnswer), /orientation_axis_scope_answer_newer_than_map/);

  const futureMediumHypothesis = clone(fixture);
  futureMediumHypothesis.presentationProfileHypotheses.preferredMedia[0].updatedAt = "2099-01-01T00:00:00Z";
  assert.throws(() => normalizeOrientationMap(futureMediumHypothesis), /orientation_medium_hypothesis_newer_than_map/);

  const futureOrderHypothesis = clone(fixture);
  futureOrderHypothesis.presentationProfileHypotheses.preferredQuestionOrder.updatedAt = "2099-01-01T00:00:00Z";
  assert.throws(() => normalizeOrientationMap(futureOrderHypothesis), /orientation_order_hypothesis_newer_than_map/);

  const wrongPrincipalScope = clone(fixture);
  wrongPrincipalScope.scopeRef = { kind: "principal", id: "principal:different-owner" };
  assert.equal(validate(wrongPrincipalScope), true, schemaErrors());
  assert.throws(() => normalizeOrientationMap(wrongPrincipalScope), /scope_principal_mismatch/);

  const blankSourceId = clone(fixture);
  blankSourceId.axes.proof.rankingSignals.sourceRefs = [{ kind: "source", id: "   " }];
  assertSchemaAndRuntimeReject(blankSourceId, /record_ref_id_required/);

  const coercedSourceHash = clone(fixture);
  coercedSourceHash.axes.proof.rankingSignals.sourceRefs = [{
    kind: "source",
    id: "source:coerced-hash",
    stateSha256: ["c".repeat(64)],
  }];
  assertSchemaAndRuntimeReject(coercedSourceHash, /record_ref_hash_invalid/);

  const duplicateMedium = clone(fixture);
  duplicateMedium.presentationProfileHypotheses.preferredMedia.push(
    clone(duplicateMedium.presentationProfileHypotheses.preferredMedia[0]),
  );
  assertSchemaAndRuntimeReject(duplicateMedium, /preferred_media_invalid|preferred_medium_duplicate/);

  const sources = clone(fixture);
  sources.axes.proof.rankingSignals.sourceRefs = [
    { kind: "source", id: "source:ä" },
    { kind: "source", id: "source:z" },
    { kind: "source", id: "source:Å" },
  ];
  assert.deepEqual(
    normalizeOrientationMap(sources).axes.proof.rankingSignals.sourceRefs.map(({ id }) => id),
    ["source:z", "source:Å", "source:ä"],
  );
});

test("lower effort precedes accepted presentation order when semantic priority is tied", () => {
  const map = resolvedMap();
  setUnasked(map, "placement");
  setUnasked(map, "perspective");
  map.axes.perspective.rankingSignals = clone(map.axes.placement.rankingSignals);
  map.axes.placement.rankingSignals.orientationGain = 1;
  map.axes.perspective.rankingSignals.orientationGain = 2;
  map.axes.placement.rankingSignals.effort = 0;
  map.axes.perspective.rankingSignals.effort = 1;
  const result = rankNextOrientationQuestions(map, {
    limit: 2,
    acceptedQuestionOrderPreference: acceptedOrder(["perspective", "placement"]),
  });
  assert.deepEqual(result.candidates.map(({ questionKey }) => questionKey), ["placement", "perspective"]);
  assert.ok(result.candidates[0].rationaleCodes.includes("lower_effort"));
});

test("semantic ranking follows movement, affected relationship or role, and proof-gap policy order", () => {
  const map = resolvedMap();
  for (const questionKey of ["movement", "placement", "proof"]) {
    setUnasked(map, questionKey);
    map.axes[questionKey].rankingSignals = clone(map.axes.scope.rankingSignals);
    map.axes[questionKey].rankingSignals.consequence = 0;
    map.axes[questionKey].rankingSignals.informationValue = 0;
    map.axes[questionKey].rankingSignals.orientationGain = 0;
    map.axes[questionKey].rankingSignals.effort = 1;
  }
  map.axes.movement.rankingSignals.movementCriticalMissingInformation = true;
  map.axes.placement.rankingSignals.affectedRelationshipOrUnresolvedRole = true;
  map.axes.proof.rankingSignals.proofOrCloseConditionGap = true;
  const result = rankNextOrientationQuestions(map, {
    acceptedQuestionOrderPreference: acceptedOrder(["proof", "placement", "movement"]),
  });
  assert.deepEqual(result.candidates.map(({ questionKey }) => questionKey), ["movement", "placement", "proof"]);
  assert.equal(
    result.candidateDispositions.find(({ questionKey }) => questionKey === "placement")
      .semanticPriorityInputs.affectedRelationshipOrUnresolvedRole,
    true,
  );
  assert.equal(
    result.candidateDispositions.find(({ questionKey }) => questionKey === "proof")
      .semanticPriorityInputs.proofOrCloseConditionGap,
    true,
  );
});

test("ranking is deterministic, closed for receipt adaptation, and invariant to axis insertion order", () => {
  const first = rankNextOrientationQuestions(fixture);
  const second = rankNextOrientationQuestions(fixture);
  assert.deepEqual(second, first);
  assert.deepEqual(first.candidates.map(({ questionKey }) => questionKey), ["boundary", "movement", "perspective"]);
  assert.equal(first.policyVersion, "yawn.inquiry-selection.v0.1");
  assert.equal(first.promptSetVersion, ORIENTATION_PROMPT_SET_VERSION);
  assert.equal(first.promptSetSha256, ORIENTATION_PROMPT_SET_SHA256);
  assert.equal(first.candidateDispositions.length, 9);
  assert.ok(first.candidateDispositions.every((item) => (
    item.hardGateResults && item.semanticPriorityInputs && item.rankingSignals
  )));
  const policyRationaleCodes = new Set([
    ...fixture.rankingPolicy.semanticPriorityOrder,
    "immediate_safety_or_stability",
    "authority_or_consent_blocker",
    "privacy_visibility_or_egress_blocker",
    "source_or_provenance_loss",
    "proof_or_falsifier_integrity",
    "unresolved_orientation_axis",
  ]);
  assert.ok(first.candidates.every((candidate) => (
    candidate.rationaleCodes.every((code) => policyRationaleCodes.has(code))
  )));
  for (const field of [
    "orientationMapId", "orientationMapRevision", "principalRef", "scopeRef",
    "relationshipRef", "arenaRef", "sourceQuestionPacket", "orientationSemanticSha256",
    "rankingInputSha256", "questionOrderSource", "acceptedPreferenceHash",
  ]) assert.ok(Object.hasOwn(first, field), field);

  const reversedAxes = clone(fixture);
  reversedAxes.axes = Object.fromEntries(Object.entries(reversedAxes.axes).reverse());
  assert.deepEqual(rankNextOrientationQuestions(reversedAxes), first);
});

test("the dedicated validator executes successfully", () => {
  const run = spawnSync(process.execPath, ["scripts/validate-orientation-map-v0.1.mjs"], {
    cwd: root,
    encoding: "utf8",
  });
  assert.equal(run.status, 0, `${run.stdout}\n${run.stderr}`);
  assert.match(run.stdout, /Validated Orientation Map V0\.1 and ranked 3 proposed questions\./);
});
