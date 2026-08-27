import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";
import Ajv2020 from "ajv/dist/2020.js";
import {
  selectNextOrientationQuestion,
  validateInquirySelectionReceiptReplay,
  validateInquirySelectionReceiptSemantics,
} from "../lib/inquiry-selection-receipt-v0.1.mjs";
import { hashCanonical } from "../lib/state-substrate-v1.mjs";
import {
  orientationQuestionOrderPreferenceFromResolved,
  resolveProjectionPreferences,
} from "../lib/projection-preference-v1.mjs";

const readJson = async (path) => JSON.parse(await readFile(new URL(`../${path}`, import.meta.url), "utf8"));
const clone = (value) => structuredClone(value);
const fixture = await readJson("fixtures/inquiry-selection-receipt.v0.1.json");
const orientationMap = await readJson("fixtures/orientation-map.v0.1.json");

const utcDateTime = /^([0-9]{4})-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])T([01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9](?:\.[0-9]{1,3})?Z$/;
const strictDateTime = (value) => {
  const match = typeof value === "string" ? utcDateTime.exec(value) : null;
  if (match === null || !Number.isFinite(Date.parse(value))) return false;
  return Number(match[3]) <= new Date(Date.UTC(Number(match[1]), Number(match[2]), 0)).getUTCDate();
};

const ajv = new Ajv2020({
  allErrors: true,
  strict: true,
  formats: { "date-time": strictDateTime },
});
ajv.addSchema(await readJson("schemas/record-ref.v1.schema.json"));
const validate = ajv.compile(await readJson("schemas/inquiry-selection-receipt.v0.1.schema.json"));
const shapeErrors = () => ajv.errorsText(validate.errors, { separator: "\n" });

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

const receiptOptions = (receiptId = "receipt:fixture:test-selection") => ({
  receiptId,
  createdAt: "2026-08-27T12:00:01Z",
  createdBy: { kind: "actor", id: "system:orientation-selector" },
  representationMedium: "accessible-text",
  answerInputAdapter: "typed-text",
});

const acceptedOrder = (questionKeys, activeScopeRefs = [
  { kind: "principal", id: "principal:fixture-owner" },
]) => orientationQuestionOrderPreferenceFromResolved(
  resolveProjectionPreferences([{ preferences: [{
    schemaVersion: "yawn.projection-preference.v1",
    preferenceId: "projection-preference:fixture-order",
    principalRef: "principal:fixture-owner",
    scopeRef: { kind: "principal", id: "principal:fixture-owner" },
    viewKind: "orientation_inquiry",
    fieldPath: "/question/defaultAxisOrder",
    operation: "set",
    value: questionKeys,
    status: "accepted",
    revision: 2,
    sourceEventRef: "event:fixture-accepted-order",
    createdAt: "2026-08-27T12:00:00Z",
    updatedAt: "2026-08-27T12:00:00Z",
  }] }], {
    viewKind: "orientation_inquiry",
    principalRef: "principal:fixture-owner",
    activeScopeRefs,
  }),
);

function setAllGateAssessments(signals, status = "clear", epistemicStatus = "inferred", confidence = 1) {
  for (const assessment of Object.values(signals.hardGateAssessments)) {
    assessment.status = status;
    if (status === "clear") {
      assessment.assertedBy = "principal:fixture-owner";
      assessment.epistemicStatus = "reported";
      assessment.sourceRefs = [{ kind: "principal", id: "principal:fixture-owner" }];
    } else {
      assessment.epistemicStatus = epistemicStatus;
    }
    assessment.confidence = confidence;
  }
}

function holdReceipt() {
  const receipt = clone(fixture);
  for (const gateResult of receipt.hardGateResults) {
    const boundaryEvidence = gateResult.evidence
      .find(({ questionKey, assessmentStatus }) => questionKey === "boundary" && assessmentStatus !== "clear");
    if (boundaryEvidence) {
      gateResult.status = "required_hold";
      boundaryEvidence.foregroundability = "blocked_by_answer_state";
    }
  }
  const boundaryStatus = receipt.interactionFitInputs.recentAnswerStatuses
    .find(({ questionKey }) => questionKey === "boundary");
  boundaryStatus.coverageStatus = "missing";
  boundaryStatus.answerStatus = "deferred";
  boundaryStatus.mappingStatus = "accepted";
  const boundaryEvaluation = receipt.interactionFitInputs.evaluations
    .find(({ questionKey }) => questionKey === "boundary");
  boundaryEvaluation.answerable = false;
  boundaryEvaluation.recentDeferralOrRepetition = true;
  const boundarySemanticInput = receipt.semanticPriorityInputs
    .find(({ questionKey }) => questionKey === "boundary");
  boundarySemanticInput.answerConfidence = null;
  boundarySemanticInput.consequenceConfidenceGap = boundarySemanticInput.consequence * 100;
  receipt.selectionStatus = "hold";
  receipt.selectedQuestion = null;
  receipt.interactionFitInputs.presentationChoiceEvidence = null;
  receipt.hold = {
    reasonCode: "unforegroundable_live_hard_gate",
    detail: "The principal's authority context must be resolved before another question is asked.",
    assertedBy: { kind: "actor", id: "agent:fixture-cartographer" },
    sourceRefs: [{ kind: "relationship", id: "relationship:fixture-participation-choice", revision: 1 }],
    reopenCondition: "The principal confirms who may continue the orientation inquiry.",
  };
  receipt.deterministicTieBreak.appliedThrough = "not_needed";
  receipt.deterministicTieBreak.finalistQuestionKeys = [];
  receipt.renderInputSha256 = hashCanonical({
    schemaVersion: "yawn.inquiry-render-input.v0.1",
    rankingInputSha256: receipt.rankingInputSha256,
    rankingResultLimit: receipt.rankingResultLimit,
    promptVariant: null,
    exactRenderedPrompt: null,
    foregroundGateKeys: [],
    presentationChoiceEvidence: null,
    representationMedium: null,
    answerInputAdapter: null,
    sequencePosition: null,
    accessibilityRequirementRefs: receipt.interactionFitInputs.accessibilityRequirementRefs,
  }).replace(/^sha256:/, "");
  return receipt;
}

test("the fixture is a closed, prompt-pinned selected-question receipt", async () => {
  assert.equal(validate(fixture), true, shapeErrors());
  assert.deepEqual(validateInquirySelectionReceiptSemantics(fixture), []);

  const promptSetBytes = await readFile(new URL("../question-packets/orientation-nine.yawn", import.meta.url));
  const promptSetSha256 = createHash("sha256").update(promptSetBytes).digest("hex");
  assert.equal(fixture.promptSetSha256, promptSetSha256);
  assert.equal(fixture.canonicalState, false);
  assert.equal(fixture.notAuthority, true);
});

test("the executable selector emits one closed receipt from the orientation map", () => {
  const receipt = selectNextOrientationQuestion(
    orientationMap,
    { limit: 3 },
    receiptOptions("receipt:fixture:executable-selection"),
  );

  assert.equal(validate(receipt), true, shapeErrors());
  assert.deepEqual(validateInquirySelectionReceiptSemantics(receipt), []);
  assert.equal(receipt.selectionStatus, "selected_question");
  assert.equal(receipt.selectedQuestion.questionKey, "boundary");
  assert.deepEqual(receipt.selectedQuestion.foregroundGateKeys, [
    "immediate_safety_or_stability",
    "authority_or_consent",
  ]);
  assert.equal(
    receipt.selectedQuestion.exactRenderedPrompt,
    "Before answering, address these live or unresolved gates: immediate safety or stability; authority or consent. Then answer: What must be protected, and who may decide or act?",
  );
  assert.equal(receipt.candidateQuestionKeys.length, 9);
  assert.equal(receipt.notAuthority, true);
  assert.deepEqual(validateInquirySelectionReceiptReplay(
    receipt,
    orientationMap,
    { limit: 3 },
    receiptOptions("receipt:fixture:executable-selection"),
  ), []);

  const altered = clone(receipt);
  altered.hold = { fabricated: true };
  assert.deepEqual(validateInquirySelectionReceiptReplay(
    altered,
    orientationMap,
    { limit: 3 },
    receiptOptions("receipt:fixture:executable-selection"),
  ), ["inquiry_selection_receipt_replay_mismatch"]);
});

test("receipt composition preserves stale coverage and rejected proposed mappings", () => {
  const staleMap = clone(orientationMap);
  staleMap.axes.scope.coverageStatus = "stale";
  staleMap.axes.scope.currentAnswer.freshness = "stale";
  staleMap.axes.scope.rankingSignals.staleness = 1;
  const staleReceipt = selectNextOrientationQuestion(
    staleMap,
    { limit: 1 },
    receiptOptions("receipt:fixture:stale-control-state"),
  );
  assert.equal(validate(staleReceipt), true, shapeErrors());
  assert.deepEqual(validateInquirySelectionReceiptSemantics(staleReceipt), []);
  assert.equal(
    staleReceipt.interactionFitInputs.recentAnswerStatuses
      .find(({ questionKey }) => questionKey === "scope").coverageStatus,
    "stale",
  );

  const rejectedMap = clone(orientationMap);
  rejectedMap.axes.placement.mappingStatus = "rejected";
  const rejectedReceipt = selectNextOrientationQuestion(
    rejectedMap,
    { limit: 1 },
    receiptOptions("receipt:fixture:rejected-control-state"),
  );
  assert.equal(validate(rejectedReceipt), true, shapeErrors());
  assert.deepEqual(validateInquirySelectionReceiptSemantics(rejectedReceipt), []);
  assert.equal(
    rejectedReceipt.interactionFitInputs.recentAnswerStatuses
      .find(({ questionKey }) => questionKey === "placement").mappingStatus,
    "rejected",
  );
});

test("accepted and explicit-current order evidence is derived and replay-pinned", () => {
  const preference = acceptedOrder(["perspective", "placement"]);
  const currentTurnQuestionOrder = {
    questionKeys: ["placement", "perspective"],
    assertedBy: "principal:fixture-owner",
    sourceRefs: [{ kind: "source", id: "current-turn:fixture-order" }],
    recordedAt: "2026-08-27T12:00:30Z",
  };
  const receipt = selectNextOrientationQuestion(orientationMap, {
    limit: 3,
    acceptedQuestionOrderPreference: preference,
    currentTurnQuestionOrder,
  }, {
    ...receiptOptions("receipt:fixture:closed-order-evidence"),
    createdAt: "2026-08-27T12:01:00Z",
  });

  assert.equal(validate(receipt), true, shapeErrors());
  assert.deepEqual(validateInquirySelectionReceiptSemantics(receipt), []);
  assert.equal(receipt.interactionFitInputs.presentationOrderSource, "explicit_current_turn");
  assert.deepEqual(receipt.interactionFitInputs.acceptedPreferenceRefs, preference.preferenceRefs);
  assert.deepEqual(receipt.interactionFitInputs.acceptedQuestionOrder, preference.questionKeys);
  assert.deepEqual(receipt.interactionFitInputs.currentTurnChoice.questionKeys, currentTurnQuestionOrder.questionKeys);
  assert.equal(receipt.interactionFitInputs.currentTurnChoice.recordedAt, currentTurnQuestionOrder.recordedAt);
  const placementEvaluation = receipt.interactionFitInputs.evaluations
    .find(({ questionKey }) => questionKey === "placement");
  const perspectiveEvaluation = receipt.interactionFitInputs.evaluations
    .find(({ questionKey }) => questionKey === "perspective");
  assert.equal(placementEvaluation.explicitCurrentTurnOrderIndex, 0);
  assert.equal(placementEvaluation.acceptedQuestionOrderIndex, 1);
  assert.equal(perspectiveEvaluation.explicitCurrentTurnOrderIndex, 1);
  assert.equal(perspectiveEvaluation.acceptedQuestionOrderIndex, 0);

  const missingAcceptedOrder = clone(receipt);
  missingAcceptedOrder.interactionFitInputs.acceptedQuestionOrder = [];
  assert.match(
    validateInquirySelectionReceiptSemantics(missingAcceptedOrder).join("\n"),
    /accepted_preference_refs_require_question_order/,
  );

  const relabeledAcceptedSource = clone(receipt);
  relabeledAcceptedSource.interactionFitInputs.currentTurnChoice = null;
  relabeledAcceptedSource.interactionFitInputs.presentationOrderSource = "canonical";
  for (const evaluation of relabeledAcceptedSource.interactionFitInputs.evaluations) {
    evaluation.presentationOrderIndex = null;
  }
  assert.match(
    validateInquirySelectionReceiptSemantics(relabeledAcceptedSource).join("\n"),
    /accepted_preference_evidence_requires_accepted_source/,
  );
});

test("default-View preference evidence remains bound to the exact map context", () => {
  const scopedPreference = acceptedOrder(["perspective", "placement"], [
    { kind: "view", id: "view:default" },
    { kind: "principal", id: "principal:fixture-owner" },
    orientationMap.arenaRef,
    orientationMap.scopeRef,
  ]);
  const receipt = selectNextOrientationQuestion(
    orientationMap,
    { limit: 1, acceptedQuestionOrderPreference: scopedPreference },
    receiptOptions("receipt:fixture:default-view-order"),
  );
  assert.equal(validate(receipt), true, shapeErrors());
  assert.deepEqual(validateInquirySelectionReceiptSemantics(receipt), []);
  assert.deepEqual(receipt.interactionFitInputs.acceptedPreferenceScopeRefs, scopedPreference.activeScopeRefs);
});

test("receipt options fail before a schema-invalid receipt can be composed", () => {
  const invalidOptions = [
    { ...receiptOptions(), receiptId: "not-a-receipt-id" },
    { ...receiptOptions(), createdAt: "2026-02-31T00:00:00Z" },
    { ...receiptOptions(), createdBy: {} },
    { ...receiptOptions(), createdBy: { kind: "proof", id: "proof:not-an-actor" } },
    { ...receiptOptions(), representationMedium: "bad token" },
    { ...receiptOptions(), answerInputAdapter: "Typed Text" },
    { ...receiptOptions(), sourceRefs: [{ kind: "not-a-kind", id: "source:x" }] },
    { ...receiptOptions(), acceptedPreferenceRefs: [] },
    { ...receiptOptions(), unexpected: true },
  ];
  for (const options of invalidOptions) {
    assert.throws(() => selectNextOrientationQuestion(orientationMap, {}, options));
  }
});

test("the receipt copies the ranker's actual lower-burden tie-break trace", () => {
  const map = clone(orientationMap);
  const acceptedAnswer = clone(map.axes.scope.currentAnswer);
  for (const [questionKey, axis] of Object.entries(map.axes)) {
    setAllGateAssessments(axis.rankingSignals);
    axis.coverageStatus = "covered";
    axis.answerStatus = "answered";
    axis.mappingStatus = "accepted";
    axis.currentAnswer = clone(acceptedAnswer);
    axis.currentAnswer.selectionReceiptRef = selectionReceiptRef(questionKey, "receipt-tie");
    axis.questionEventRefs = [questionEventRef(questionKey, "receipt-tie")];
  }
  for (const questionKey of ["placement", "perspective"]) {
    const axis = map.axes[questionKey];
    axis.coverageStatus = "missing";
    axis.answerStatus = "unasked";
    axis.mappingStatus = "unmapped";
    axis.currentAnswer = null;
    axis.questionEventRefs = [];
    axis.rankingSignals = clone(map.axes.scope.rankingSignals);
    for (const field of [
      "movementCriticalMissingInformation",
      "affectedRelationshipOrUnresolvedRole",
      "contradictionOrDispute",
      "proofOrCloseConditionGap",
    ]) axis.rankingSignals[field] = false;
    axis.rankingSignals.consequence = 0;
    axis.rankingSignals.staleness = 0;
    axis.rankingSignals.informationValue = 0;
    axis.rankingSignals.orientationGain = 0;
  }
  map.axes.placement.rankingSignals.effort = 0;
  map.axes.perspective.rankingSignals.effort = 3;

  const receipt = selectNextOrientationQuestion(map, {
    limit: 1,
    acceptedQuestionOrderPreference: acceptedOrder(["perspective", "placement"]),
  }, receiptOptions("receipt:fixture:burden-trace"));
  assert.equal(receipt.selectedQuestion.questionKey, "placement");
  assert.equal(receipt.deterministicTieBreak.appliedThrough, "lower_answer_burden");
  assert.deepEqual(receipt.deterministicTieBreak.finalistQuestionKeys, ["placement"]);
  assert.deepEqual(validateInquirySelectionReceiptSemantics(receipt), []);
});

test("unknown hard-gate evidence is foregrounded and never rewritten as clear", () => {
  const map = clone(orientationMap);
  for (const axis of Object.values(map.axes)) {
    setAllGateAssessments(axis.rankingSignals);
    const assessment = axis.rankingSignals.hardGateAssessments.privacyVisibilityOrEgress;
    assessment.status = "unknown";
    assessment.epistemicStatus = "unknown";
    assessment.confidence = 0;
  }
  const receipt = selectNextOrientationQuestion(
    map,
    { limit: 1 },
    receiptOptions("receipt:fixture:unknown-gates"),
  );
  assert.equal(validate(receipt), true, shapeErrors());
  assert.deepEqual(receipt.hardGateResults.map(({ status }) => status), [
    "clear", "clear", "unknown", "clear", "clear",
  ]);
  assert.deepEqual(
    receipt.semanticPriorityInputs
      .find(({ questionKey }) => questionKey === receipt.selectedQuestion.questionKey)
      .hardGates,
    [
      "privacy_visibility_or_egress",
    ],
  );
  assert.deepEqual(validateInquirySelectionReceiptSemantics(receipt), []);
});

test("zero-confidence inferred gate negatives cannot claim clear", () => {
  const map = clone(orientationMap);
  const assessment = map.axes.scope.rankingSignals.hardGateAssessments.immediateSafetyOrStability;
  assessment.status = "clear";
  assessment.epistemicStatus = "inferred";
  assessment.confidence = 0;
  assert.throws(
    () => selectNextOrientationQuestion(
      map,
      { limit: 1 },
      receiptOptions("receipt:fixture:zero-confidence-gates"),
    ),
    /clear_confidence_too_low/,
  );
});

test("the executable selector preserves an all-deferred hold as distinct from completion", () => {
  const heldMap = clone(orientationMap);
  const acceptedAnswer = clone(heldMap.axes.scope.currentAnswer);
  for (const [questionKey, axis] of Object.entries(heldMap.axes)) {
    setAllGateAssessments(axis.rankingSignals);
    axis.coverageStatus = "covered";
    axis.answerStatus = "answered";
    axis.mappingStatus = "accepted";
    axis.currentAnswer = clone(acceptedAnswer);
    axis.currentAnswer.selectionReceiptRef = selectionReceiptRef(questionKey, "receipt-hold");
    axis.questionEventRefs = [questionEventRef(questionKey, "receipt-hold")];
  }
  heldMap.axes.proof.coverageStatus = "missing";
  heldMap.axes.proof.answerStatus = "deferred";
  heldMap.axes.proof.mappingStatus = "accepted";
  heldMap.axes.proof.currentAnswer = null;

  const receipt = selectNextOrientationQuestion(heldMap, {}, {
    receiptId: "receipt:fixture:deferred-hold",
    createdAt: "2026-08-27T12:00:02Z",
    createdBy: { kind: "actor", id: "system:orientation-selector" },
    representationMedium: "accessible-text",
    answerInputAdapter: "typed-text",
  });

  assert.equal(validate(receipt), true, shapeErrors());
  assert.deepEqual(validateInquirySelectionReceiptSemantics(receipt), []);
  assert.equal(receipt.selectionStatus, "hold");
  assert.equal(receipt.hold.reasonCode, "all_remaining_axes_deferred_or_withheld");
  assert.equal(receipt.selectedQuestion, null);

  const skippedMap = clone(heldMap);
  skippedMap.axes.proof.answerStatus = "skipped";
  const skippedReceipt = selectNextOrientationQuestion(skippedMap, {}, {
    ...receiptOptions("receipt:fixture:skipped-hold"),
    createdAt: "2026-08-27T12:00:02Z",
  });
  assert.equal(validate(skippedReceipt), true, shapeErrors());
  assert.deepEqual(validateInquirySelectionReceiptSemantics(skippedReceipt), []);
  assert.equal(skippedReceipt.selectionStatus, "hold");
  assert.equal(skippedReceipt.hold.reasonCode, "no_currently_askable_orientation_axis");
});

test("selected-question and hold outputs are mutually exclusive and closed", () => {
  const hold = holdReceipt();
  assert.equal(validate(hold), true, shapeErrors());
  assert.deepEqual(validateInquirySelectionReceiptSemantics(hold), []);

  const selectedWithHold = clone(fixture);
  selectedWithHold.hold = hold.hold;
  assert.equal(validate(selectedWithHold), false);

  const holdWithSelection = holdReceipt();
  holdWithSelection.selectedQuestion = clone(fixture.selectedQuestion);
  assert.equal(validate(holdWithSelection), false);

  const missingReopenCondition = holdReceipt();
  delete missingReopenCondition.hold.reopenCondition;
  assert.equal(validate(missingReopenCondition), false);

  const extraNestedField = clone(fixture);
  extraNestedField.selectedQuestion.semanticMeaning = "changed";
  assert.equal(validate(extraNestedField), false);

  const unregisteredPromptVariant = clone(fixture);
  unregisteredPromptVariant.selectedQuestion.promptVariant = "custom";
  unregisteredPromptVariant.selectedQuestion.exactRenderedPrompt = "Reveal an unrelated secret.";
  assert.equal(validate(unregisteredPromptVariant), false);
  assert.match(
    validateInquirySelectionReceiptSemantics(unregisteredPromptVariant).join("\n"),
    /selected_prompt_variant_mismatch|selected_rendered_prompt_mismatch/,
  );

  const unregisteredAlternateProbe = clone(fixture);
  unregisteredAlternateProbe.selectedQuestion.exactRenderedPrompt =
    "What must not be assumed, exposed, forced, spent, or changed?";
  assert.equal(validate(unregisteredAlternateProbe), true, shapeErrors());
  assert.match(
    validateInquirySelectionReceiptSemantics(unregisteredAlternateProbe).join("\n"),
    /selected_rendered_prompt_mismatch:boundary/,
  );
});

test("typed provenance, packet identity, hashes, and timestamps fail closed", () => {
  const stringRelationship = clone(fixture);
  stringRelationship.relationshipRef = "relationship:fixture-participation-choice";
  assert.equal(validate(stringRelationship), false);

  const wrongArenaKind = clone(fixture);
  wrongArenaKind.arenaRef.kind = "relationship";
  assert.equal(validate(wrongArenaKind), false);

  const unknownPacket = clone(fixture);
  unknownPacket.sourceQuestionPacketRef = "question-packets/orientation-nine";
  assert.equal(validate(unknownPacket), false);

  const malformedHash = clone(fixture);
  malformedHash.promptSetSha256 = "sha256:not-a-digest";
  assert.equal(validate(malformedHash), false);

  const wrongPinnedHash = clone(fixture);
  wrongPinnedHash.promptSetSha256 = "0".repeat(64);
  assert.equal(validate(wrongPinnedHash), false);
  assert.match(
    validateInquirySelectionReceiptSemantics(wrongPinnedHash).join("\n"),
    /prompt_set_sha256_mismatch/,
  );

  const untypedReceiptId = clone(fixture);
  untypedReceiptId.receiptId = "not-a-receipt-id";
  assert.equal(validate(untypedReceiptId), false);
  assert.match(
    validateInquirySelectionReceiptSemantics(untypedReceiptId).join("\n"),
    /receipt_id_must_be_typed/,
  );

  const offsetTimestamp = clone(fixture);
  offsetTimestamp.createdAt = "2026-08-27T12:00:01+01:00";
  assert.equal(validate(offsetTimestamp), false);

  const excessiveFraction = clone(fixture);
  excessiveFraction.createdAt = "2026-08-27T12:00:01.0009Z";
  assert.equal(validate(excessiveFraction), false);

  const impossibleTimestamp = clone(fixture);
  impossibleTimestamp.createdAt = "2026-02-31T00:00:00Z";
  assert.equal(validate(impossibleTimestamp), false);

  const extraRootField = clone(fixture);
  extraRootField.authorized = true;
  assert.equal(validate(extraRootField), false);

  const nonActorCreator = clone(fixture);
  nonActorCreator.createdBy = { kind: "proof", id: "proof:not-an-actor" };
  assert.equal(validate(nonActorCreator), false);

  const blankSource = clone(fixture);
  blankSource.sourceRefs = [{ kind: "source", id: "   " }];
  assert.equal(validate(blankSource), false);

  const relabeledGateDerivation = clone(fixture);
  relabeledGateDerivation.hardGateResults[0].derivedBy = {
    kind: "principal",
    id: relabeledGateDerivation.principalRef,
  };
  assert.match(
    validateInquirySelectionReceiptSemantics(relabeledGateDerivation).join("\n"),
    /hard_gate_derived_by_mismatch:immediate_safety_or_stability/,
  );

  const relabeledEvaluationDerivation = clone(fixture);
  relabeledEvaluationDerivation.interactionFitInputs.evaluations[0].derivedBy = {
    kind: "principal",
    id: relabeledEvaluationDerivation.principalRef,
  };
  assert.match(
    validateInquirySelectionReceiptSemantics(relabeledEvaluationDerivation).join("\n"),
    /interaction_evaluation_derived_by_mismatch:/,
  );
});

test("semantic validation closes candidate, exclusion, and evaluation references", () => {
  const mismatchedDefaultPrompt = clone(fixture);
  mismatchedDefaultPrompt.selectedQuestion.exactRenderedPrompt = "What has your attention?";
  assert.match(
    validateInquirySelectionReceiptSemantics(mismatchedDefaultPrompt).join("\n"),
    /selected_rendered_prompt_mismatch:boundary/,
  );

  const selfDeclaredWinner = clone(fixture);
  selfDeclaredWinner.selectedQuestion.questionKey = "placement";
  selfDeclaredWinner.selectedQuestion.exactRenderedPrompt =
    "Before answering, address these live or unresolved gates: immediate safety or stability; authority or consent. Then answer: Where and when is this happening, and which relationship or Arena is active?";
  selfDeclaredWinner.deterministicTieBreak.finalistQuestionKeys = ["placement"];
  selfDeclaredWinner.renderInputSha256 = hashCanonical({
    schemaVersion: "yawn.inquiry-render-input.v0.1",
    rankingInputSha256: selfDeclaredWinner.rankingInputSha256,
    rankingResultLimit: selfDeclaredWinner.rankingResultLimit,
    promptVariant: selfDeclaredWinner.selectedQuestion.promptVariant,
    exactRenderedPrompt: selfDeclaredWinner.selectedQuestion.exactRenderedPrompt,
    foregroundGateKeys: selfDeclaredWinner.selectedQuestion.foregroundGateKeys,
    presentationChoiceEvidence: selfDeclaredWinner.interactionFitInputs.presentationChoiceEvidence,
    representationMedium: selfDeclaredWinner.selectedQuestion.representationMedium,
    answerInputAdapter: selfDeclaredWinner.selectedQuestion.answerInputAdapter,
    sequencePosition: selfDeclaredWinner.selectedQuestion.sequencePosition,
    accessibilityRequirementRefs: selfDeclaredWinner.interactionFitInputs.accessibilityRequirementRefs,
  }).replace(/^sha256:/, "");
  assert.match(
    validateInquirySelectionReceiptSemantics(selfDeclaredWinner).join("\n"),
    /selected_question_not_evidence_ranked_winner:placement/,
  );

  const missingEvaluation = clone(fixture);
  missingEvaluation.interactionFitInputs.evaluations.splice(1, 1);
  assert.match(
    validateInquirySelectionReceiptSemantics(missingEvaluation).join("\n"),
    /receipt_requires_interaction_input_for_each_nonexcluded_candidate/,
  );

  const reorderedCandidates = clone(fixture);
  reorderedCandidates.candidateQuestionKeys = ["proof", "boundary", "movement"];
  assert.match(
    validateInquirySelectionReceiptSemantics(reorderedCandidates).join("\n"),
    /candidate_question_keys_must_cover_canonical_universe/,
  );

  const excludedSelected = clone(fixture);
  excludedSelected.exclusions.push({
    questionKey: "boundary",
    reasonCode: "excessive_burden",
    gate: null,
    detail: "The current interaction cannot safely carry another high-burden question.",
    assertedBy: { kind: "actor", id: "agent:fixture-cartographer" },
    sourceRefs: [{ kind: "observation", id: "observation:fixture-orientation", revision: 1 }],
  });
  assert.match(
    validateInquirySelectionReceiptSemantics(excludedSelected).join("\n"),
    /selected_question_was_excluded:boundary/,
  );

  const unsupportedExclusion = clone(fixture);
  unsupportedExclusion.exclusions.push({
    ...clone(unsupportedExclusion.exclusions[0]),
    questionKey: "perspective",
  });
  unsupportedExclusion.semanticPriorityInputs = unsupportedExclusion.semanticPriorityInputs
    .filter(({ questionKey }) => questionKey !== "perspective");
  unsupportedExclusion.interactionFitInputs.evaluations = unsupportedExclusion.interactionFitInputs.evaluations
    .filter(({ questionKey }) => questionKey !== "perspective");
  assert.match(
    validateInquirySelectionReceiptSemantics(unsupportedExclusion).join("\n"),
    /exclusion_reason_does_not_match_answer_status:perspective/,
  );

  const partialAnswerExclusion = clone(fixture);
  partialAnswerExclusion.exclusions.push({
    ...clone(partialAnswerExclusion.exclusions[0]),
    questionKey: "boundary",
  });
  partialAnswerExclusion.semanticPriorityInputs = partialAnswerExclusion.semanticPriorityInputs
    .filter(({ questionKey }) => questionKey !== "boundary");
  partialAnswerExclusion.interactionFitInputs.evaluations = partialAnswerExclusion.interactionFitInputs.evaluations
    .filter(({ questionKey }) => questionKey !== "boundary");
  assert.match(
    validateInquirySelectionReceiptSemantics(partialAnswerExclusion).join("\n"),
    /exclusion_reason_does_not_match_answer_status:boundary/,
  );

  const invalidControlState = clone(fixture);
  Object.assign(
    invalidControlState.interactionFitInputs.recentAnswerStatuses
      .find(({ questionKey }) => questionKey === "boundary"),
    { coverageStatus: "covered", answerStatus: "proposed", mappingStatus: "unmapped" },
  );
  assert.match(
    validateInquirySelectionReceiptSemantics(invalidControlState).join("\n"),
    /recent_control_state_invalid:boundary/,
  );
});

test("required holds and accepted presentation preferences cannot be bypassed", () => {
  const answerStateBypass = clone(fixture);
  const boundaryStatus = answerStateBypass.interactionFitInputs.recentAnswerStatuses
    .find(({ questionKey }) => questionKey === "boundary");
  boundaryStatus.answerStatus = "deferred";
  const boundaryEvaluation = answerStateBypass.interactionFitInputs.evaluations
    .find(({ questionKey }) => questionKey === "boundary");
  boundaryEvaluation.answerable = false;
  boundaryEvaluation.recentDeferralOrRepetition = true;
  const answerStateErrors = validateInquirySelectionReceiptSemantics(answerStateBypass).join("\n");
  assert.match(answerStateErrors, /gate_evidence_foregroundability_mismatch:immediate_safety_or_stability:boundary/);
  assert.match(answerStateErrors, /selected_question_not_answerable:boundary/);

  const bypassedHold = clone(fixture);
  const bypassedAuthority = bypassedHold.hardGateResults
    .find((result) => result.gate === "authority_or_consent");
  bypassedAuthority.status = "required_hold";
  bypassedAuthority.evidence
    .find(({ assessmentStatus }) => assessmentStatus !== "clear")
    .foregroundability = "blocked_by_answer_state";
  assert.match(
    validateInquirySelectionReceiptSemantics(bypassedHold).join("\n"),
    /selected_question_bypasses_required_hold_gate/,
  );

  const unresolvedSafetyGate = clone(fixture);
  const unresolvedSafetyEvidence = unresolvedSafetyGate.hardGateResults[0].evidence
    .find(({ assessmentStatus }) => assessmentStatus !== "clear");
  unresolvedSafetyEvidence.assessmentStatus = "unknown";
  unresolvedSafetyEvidence.epistemicStatus = "unknown";
  unresolvedSafetyEvidence.confidence = 0;
  unresolvedSafetyGate.hardGateResults[0].status = "unknown";
  unresolvedSafetyGate.selectedQuestion.foregroundGateKeys = ["authority_or_consent"];
  assert.match(
    validateInquirySelectionReceiptSemantics(unresolvedSafetyGate).join("\n"),
    /selected_question_foreground_gate_keys_mismatch/,
  );

  const selfCertifiedPrivacyClear = clone(fixture);
  const privacyEvidence = selfCertifiedPrivacyClear.hardGateResults
    .find(({ gate }) => gate === "privacy_visibility_or_egress")
    .evidence[0];
  privacyEvidence.assertedBy = { kind: "actor", id: "system:self-certified" };
  privacyEvidence.epistemicStatus = "inferred";
  privacyEvidence.confidence = 1;
  privacyEvidence.sourceRefs = [{ kind: "source", id: "source:self-certified" }];
  assert.equal(validate(selfCertifiedPrivacyClear), false);
  assert.match(
    validateInquirySelectionReceiptSemantics(selfCertifiedPrivacyClear).join("\n"),
    /clear_gate_evidence_requires_current_principal_report/,
  );

  const unreachableHold = holdReceipt();
  unreachableHold.hold.reasonCode = "other_coded_hold";
  assert.equal(validate(unreachableHold), false);

  const unacceptedOrder = clone(fixture);
  unacceptedOrder.interactionFitInputs.acceptedQuestionOrder = ["proof", "movement"];
  assert.match(
    validateInquirySelectionReceiptSemantics(unacceptedOrder).join("\n"),
    /accepted_question_order_requires_accepted_preference_ref/,
  );

  const emptyTurnChoice = clone(fixture);
  emptyTurnChoice.interactionFitInputs.currentTurnChoice = {
    questionKey: null,
    promptVariant: null,
    representationMedium: null,
    answerInputAdapter: null,
    assertedBy: { kind: "principal", id: "principal:fixture-owner" },
    sourceRefs: [{ kind: "observation", id: "observation:fixture-orientation", revision: 1 }],
  };
  assert.match(
    validateInquirySelectionReceiptSemantics(emptyTurnChoice).join("\n"),
    /current_turn_choice_has_no_choice/,
  );
});

test("holds retain complete nonexcluded ranking and interaction evidence", () => {
  const incomplete = holdReceipt();
  incomplete.semanticPriorityInputs = [];
  incomplete.interactionFitInputs.evaluations = [];
  const errors = validateInquirySelectionReceiptSemantics(incomplete).join("\n");
  assert.match(errors, /receipt_requires_semantic_input_for_each_nonexcluded_candidate/);
  assert.match(errors, /receipt_requires_interaction_input_for_each_nonexcluded_candidate/);

  const fabricatedCompletion = clone(fixture);
  fabricatedCompletion.selectionStatus = "hold";
  fabricatedCompletion.selectedQuestion = null;
  fabricatedCompletion.interactionFitInputs.presentationChoiceEvidence = null;
  fabricatedCompletion.hold = {
    reasonCode: "no_unresolved_orientation_axis",
    detail: "No orientation axis remains unresolved.",
    assertedBy: { kind: "actor", id: "system:orientation-selector" },
    sourceRefs: clone(fabricatedCompletion.sourceRefs),
    reopenCondition: "The map changes.",
  };
  fabricatedCompletion.deterministicTieBreak.appliedThrough = "not_needed";
  fabricatedCompletion.deterministicTieBreak.finalistQuestionKeys = [];
  fabricatedCompletion.renderInputSha256 = hashCanonical({
    schemaVersion: "yawn.inquiry-render-input.v0.1",
    rankingInputSha256: fabricatedCompletion.rankingInputSha256,
    rankingResultLimit: fabricatedCompletion.rankingResultLimit,
    promptVariant: null,
    exactRenderedPrompt: null,
    foregroundGateKeys: [],
    presentationChoiceEvidence: null,
    representationMedium: null,
    answerInputAdapter: null,
    sequencePosition: null,
    accessibilityRequirementRefs: fabricatedCompletion.interactionFitInputs.accessibilityRequirementRefs,
  }).replace(/^sha256:/, "");
  assert.equal(validate(fabricatedCompletion), true, shapeErrors());
  assert.match(
    validateInquirySelectionReceiptSemantics(fabricatedCompletion).join("\n"),
    /no_unresolved_hold_requires_zero_nonexcluded_axes/,
  );
});

test("the CLI replay-validates its default fixture with either implicit or explicit path", () => {
  for (const args of [[], ["fixtures/inquiry-selection-receipt.v0.1.json"]]) {
    const result = spawnSync(process.execPath, ["scripts/validate-inquiry-selection-receipt-v0.1.mjs", ...args], {
      cwd: new URL("..", import.meta.url),
      encoding: "utf8",
    });
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /Replay-validated Inquiry Selection Receipt V0\.1/);
  }
});
