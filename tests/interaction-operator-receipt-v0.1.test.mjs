import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";
import Ajv2020 from "ajv/dist/2020.js";
import {
  hashExactRenderedPrompt,
  INTERACTION_OPERATOR_RECEIPT_APPLICATION_REQUIREMENTS,
  INTERACTION_OPERATOR_MAPPING_ALLOWED_FROM,
  INTERACTION_OPERATOR_QUESTION_ALLOWED_FROM,
  INTERACTION_OPERATOR_RECEIPT_VALIDATION_SCOPE,
  validateInteractionOperatorReceiptSemantics,
} from "../lib/interaction-operator-receipt-v0.1.mjs";

const readJson = async (path) => JSON.parse(
  await readFile(new URL(`../${path}`, import.meta.url), "utf8"),
);
const clone = (value) => structuredClone(value);
const fixture = await readJson("fixtures/interaction-operator-receipt.v0.1.json");
const objectiveCompilerContract = await readFile(
  new URL("../interface/objective-compiler.yawn", import.meta.url),
  "utf8",
);
const newYawnContract = await readFile(
  new URL("../interface/new-yawn-v0.1.yawn", import.meta.url),
  "utf8",
);

const utcDateTime = /^([0-9]{4})-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])T([01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9](?:\.[0-9]{1,3})?Z$/;
const strictDateTime = (value) => {
  const match = typeof value === "string" ? utcDateTime.exec(value) : null;
  if (match === null || !Number.isFinite(Date.parse(value))) return false;
  return Number(match[3]) <= new Date(Date.UTC(Number(match[1]), Number(match[2]), 0)).getUTCDate();
};
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const ajv = new Ajv2020({
  allErrors: true,
  strict: true,
  formats: { "date-time": strictDateTime, uuid },
});
const validate = ajv.compile(
  await readJson("schemas/interaction-operator-receipt.v0.1.schema.json"),
);
const shapeErrors = () => ajv.errorsText(validate.errors, { separator: "\n" });

const sha = (character) => character.repeat(64);
const exactRef = (kind, id, character) => ({
  kind,
  id,
  revision: 1,
  stateSha256: sha(character),
});
const uuidFor = (value) => {
  const hex = createHash("sha256").update(value, "utf8").digest("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-8${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
};
const sourceEvidenceRef = (id, character) => ({
  kind: "source",
  id: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(id)
    ? id
    : uuidFor(id),
  sourceSha256: sha(character),
});

function questionReceipt(operator = "answer") {
  const receipt = clone(fixture);
  const exactRenderedPrompt = "What change are you trying to cause?";
  const responseSource = sourceEvidenceRef(
    `source:dave:intent-${operator}`,
    operator === "answer" ? "1" : operator === "correct" ? "2" : "3",
  );
  const subject = {
    kind: "question_event",
    id: "question-event:dave:intent:1",
    revision: 1,
    stateSha256: sha("4"),
    questionKey: "intent",
    questionPacketRef: "question-packets/orientation-nine@0.4.0-draft",
    questionPacketSha256: sha("5"),
    exactRenderedPrompt,
    exactRenderedPromptSha256: hashExactRenderedPrompt(exactRenderedPrompt),
    selectionReceiptRef: exactRef(
      "inquiry_selection_receipt",
      "receipt:selection:dave:intent:1",
      "6",
    ),
    orientationMapId: "orientation-map:dave:new",
    orientationMapRevision: 1,
  };
  const questionEventRef = exactRef(
    subject.kind,
    subject.id,
    "4",
  );

  receipt.receiptId = `receipt:interaction:dave:intent-${operator}`;
  receipt.operator = operator;
  receipt.reviewScope = "question_response";
  receipt.subject = subject;
  receipt.interactionSourceRefs = [responseSource];
  receipt.additionalEvidenceRefs = [];
  receipt.relatedSubjectRefs = [];
  receipt.result.mappingTransition = null;
  receipt.result.followupRequired = false;

  if (operator === "answer") {
    receipt.response = {
      rawResponseSha256: responseSource.sourceSha256,
      sourceRefs: [responseSource],
      assertedBy: receipt.actorRef,
      epistemicStatus: "reported",
      visibility: "private",
    };
    receipt.correction = null;
    receipt.result.subjectDisposition = "response_recorded";
    receipt.result.answerTransition = {
      questionEventRef,
      fromStatus: "unasked",
      toStatus: "answered",
      basis: "explicit_response",
      responseSourceRefs: [responseSource],
    };
    return receipt;
  }

  if (operator === "correct") {
    receipt.response = {
      rawResponseSha256: responseSource.sourceSha256,
      sourceRefs: [responseSource],
      assertedBy: receipt.actorRef,
      epistemicStatus: "reported",
      visibility: "private",
    };
    receipt.correction = {
      originalPreserved: true,
      replacementSourceRefs: [responseSource],
      changedFields: ["/axes/intent/currentAnswer"],
    };
    receipt.result.subjectDisposition = "correction_recorded";
    receipt.result.answerTransition = {
      questionEventRef,
      fromStatus: "answered",
      toStatus: "corrected",
      basis: "explicit_response",
      responseSourceRefs: [responseSource],
    };
    return receipt;
  }

  const explicitTransitionByOperator = {
    mark_unknown: ["unknown", "explicit_unknown"],
    mark_disputed: ["disputed", "explicit_dispute"],
    skip: ["skipped", "explicit_skip"],
    defer: ["deferred", "explicit_defer"],
    withhold: ["withheld", "explicit_withhold"],
    mark_not_applicable: ["not_applicable", "explicit_not_applicable"],
  };
  const dispositionByOperator = {
    mark_unknown: "marked_unknown",
    mark_disputed: "marked_disputed",
    skip: "skipped",
    defer: "deferred",
    withhold: "withheld",
    mark_not_applicable: "marked_not_applicable",
  };
  const [toStatus, basis] = explicitTransitionByOperator[operator];
  const epistemicStatusByOperator = {
    mark_unknown: "unknown",
    mark_disputed: "disputed",
    mark_not_applicable: "reported",
  };
  receipt.response = Object.hasOwn(epistemicStatusByOperator, operator)
    ? {
        rawResponseSha256: responseSource.sourceSha256,
        sourceRefs: [responseSource],
        assertedBy: receipt.actorRef,
        epistemicStatus: epistemicStatusByOperator[operator],
        visibility: "private",
      }
    : null;
  receipt.correction = null;
  receipt.result.subjectDisposition = dispositionByOperator[operator];
  receipt.result.answerTransition = {
    questionEventRef,
    fromStatus: "unasked",
    toStatus,
    basis,
    responseSourceRefs: [responseSource],
  };
  return receipt;
}

function objectiveProposalReceipt() {
  const receipt = clone(fixture);
  receipt.receiptId = "receipt:interaction:dave:good-dad-objective-proposal-confirm";
  receipt.reviewScope = "proposal_review";
  receipt.subject = {
    kind: "proposal",
    id: "proposal:objective-candidate:dave-good-dad",
    revision: 1,
    stateSha256: sha("8"),
    proposalType: "objective_candidate",
    contextRef: exactRef("observation", "observation:dave:good-dad-signal", "9"),
    basisRefs: [sourceEvidenceRef("source:dave:good-dad-signal", "a")],
  };
  return receipt;
}

function sourceHoldReceipt() {
  const receipt = clone(fixture);
  receipt.receiptId = "receipt:interaction:dave:source-hold";
  receipt.operator = "hold";
  receipt.reviewScope = "source_record";
  receipt.subject = sourceEvidenceRef("source:dave:unrouted-observation", "b");
  receipt.result = {
    subjectDisposition: "held",
    mappingTransition: null,
    answerTransition: null,
    followupRequired: false,
  };
  return receipt;
}

function sourceCorrectionReceipt() {
  const receipt = sourceHoldReceipt();
  receipt.receiptId = "receipt:interaction:dave:source-correction";
  receipt.operator = "correct";
  receipt.correction = {
    originalPreserved: true,
    replacementSourceRefs: clone(receipt.interactionSourceRefs),
    changedFields: ["/sourceSha256"],
  };
  receipt.result.subjectDisposition = "correction_recorded";
  return receipt;
}

test("the fixture is an exact non-authoritative detection confirmation receipt", () => {
  assert.equal(validate(fixture), true, shapeErrors());
  assert.deepEqual(validateInteractionOperatorReceiptSemantics(fixture), []);
  assert.equal(fixture.result.mappingTransition.toStatus, "accepted");
  assert.equal(fixture.effects.truthEstablished, false);
  assert.equal(fixture.effects.objectiveRatified, false);
  assert.equal(fixture.effects.botActivated, false);
  assert.equal(fixture.effects.authorityGranted, false);
});

test("interface contracts keep observation, review, answers, and authority distinct", () => {
  assert.match(
    newYawnContract,
    /capture: automatic-observation-on-first-nonempty-signal/,
  );
  assert.match(
    newYawnContract,
    /receipt_schema_ref: schemas\/agency-holarchy\.v0\.2\.schema\.json#\/\$defs\/StructuralChangeReceipt/,
  );
  assert.match(newYawnContract, /operation: create_yawn/);
  assert.match(newYawnContract, /interaction_operator_receipt_satisfies: false/);
  assert.match(
    newYawnContract,
    /objective_linked_end_to_end_conformance: unavailable-until-aggregate-cross-document-resolver/,
  );
  assert.match(newYawnContract, /status: working-draft-0\.1/);
  assert.doesNotMatch(newYawnContract, /creation: automatic-on-first-nonempty-signal/);
  assert.match(
    newYawnContract,
    /an Observation remains valid without promotion or Yawn materialization/,
  );
  assert.match(
    newYawnContract,
    /those records remain distinct\. An Observation remains valid\s+without promotion, and no Yawn exists until an explicit, receipted\s+materialization operation/,
  );
  assert.match(
    objectiveCompilerContract,
    /confirm_reject_review_scopes: \[detection_mapping, proposal_review\]/,
  );
  assert.match(
    objectiveCompilerContract,
    /Yes or no offered as an answer emits answer, not confirm or reject/,
  );
  assert.match(
    objectiveCompilerContract,
    /Confirmation is\s+not truth, objective ratification, bot activation, authority, canonical\s+mutation, or permission for an external effect/,
  );
});

test("confirming an objective-candidate proposal does not ratify or activate it", () => {
  const receipt = objectiveProposalReceipt();
  assert.equal(validate(receipt), true, shapeErrors());
  assert.deepEqual(validateInteractionOperatorReceiptSemantics(receipt), []);

  for (const effect of [
    "objectiveRatified",
    "botActivated",
    "authorityGranted",
    "externalEffectsAuthorized",
  ]) {
    const unsafe = clone(receipt);
    unsafe.effects[effect] = true;
    assert.equal(validate(unsafe), false, `${effect} must be schema-forbidden`);
    assert.match(
      validateInteractionOperatorReceiptSemantics(unsafe).join("\n"),
      new RegExp(`effect_must_be_false:${effect}`),
    );
  }
});

test("an answer is bound to the exact question event, prompt, and response source", () => {
  const receipt = questionReceipt("answer");
  assert.equal(validate(receipt), true, shapeErrors());
  assert.deepEqual(validateInteractionOperatorReceiptSemantics(receipt), []);

  const wrongQuestionRevision = clone(receipt);
  wrongQuestionRevision.result.answerTransition.questionEventRef.revision = 2;
  assert.match(
    validateInteractionOperatorReceiptSemantics(wrongQuestionRevision).join("\n"),
    /answer_transition_question_ref_mismatch/,
  );

  const wrongResponseSource = clone(receipt);
  wrongResponseSource.result.answerTransition.responseSourceRefs = [
    {
      ...wrongResponseSource.result.answerTransition.responseSourceRefs[0],
      sourceSha256: sha("d"),
    },
  ];
  assert.match(
    validateInteractionOperatorReceiptSemantics(wrongResponseSource).join("\n"),
    /answer_sources_not_bound_to_interaction/,
  );
});

test("answer cannot overload explicit unknown or disputed question states", () => {
  for (const toStatus of ["unknown", "disputed"]) {
    const receipt = questionReceipt("answer");
    receipt.result.answerTransition.toStatus = toStatus;
    assert.equal(validate(receipt), true, `${toStatus}: ${shapeErrors()}`);
    assert.match(
      validateInteractionOperatorReceiptSemantics(receipt).join("\n"),
      /answer_transition_target_invalid/,
    );

    const epistemicOverload = questionReceipt("answer");
    epistemicOverload.response.epistemicStatus = toStatus;
    assert.match(
      validateInteractionOperatorReceiptSemantics(epistemicOverload).join("\n"),
      /response_epistemic_status_mismatch/,
    );
  }
});

test("question correction requires an existing answered or corrected response", () => {
  for (const fromStatus of ["answered", "corrected"]) {
    const receipt = questionReceipt("correct");
    receipt.result.answerTransition.fromStatus = fromStatus;
    assert.equal(validate(receipt), true, `${fromStatus}: ${shapeErrors()}`);
    assert.deepEqual(validateInteractionOperatorReceiptSemantics(receipt), [], fromStatus);
  }

  for (const fromStatus of ["unasked", "unknown", "disputed"]) {
    const receipt = questionReceipt("correct");
    receipt.result.answerTransition.fromStatus = fromStatus;
    assert.equal(validate(receipt), true, `${fromStatus}: ${shapeErrors()}`);
    assert.match(
      validateInteractionOperatorReceiptSemantics(receipt).join("\n"),
      /question_transition_source_invalid:correct/,
    );
  }
});

test("question transitions use a closed allowed-from table", () => {
  for (const [operator, allowedFromStatuses] of Object.entries(
    INTERACTION_OPERATOR_QUESTION_ALLOWED_FROM,
  )) {
    for (const fromStatus of allowedFromStatuses) {
      const receipt = questionReceipt(operator);
      receipt.result.answerTransition.fromStatus = fromStatus;
      assert.deepEqual(
        validateInteractionOperatorReceiptSemantics(receipt),
        [],
        `${operator} from ${fromStatus}`,
      );
    }
  }

  for (const [operator, disallowedFromStatuses] of Object.entries({
    answer: ["answered", "corrected"],
    mark_unknown: ["answered", "corrected", "unknown"],
    mark_disputed: ["answered", "corrected", "disputed"],
    mark_not_applicable: ["answered", "corrected", "not_applicable"],
    skip: ["answered", "unknown", "skipped"],
    defer: ["answered", "disputed", "deferred"],
    withhold: ["answered", "not_applicable", "withheld"],
  })) {
    for (const fromStatus of disallowedFromStatuses) {
      const receipt = questionReceipt(operator);
      receipt.result.answerTransition.fromStatus = fromStatus;
      assert.match(
        validateInteractionOperatorReceiptSemantics(receipt).join("\n"),
        new RegExp(`question_transition_source_invalid:${operator}:${fromStatus}`),
      );
    }
  }
});

test("mapping transitions use a closed allowed-from table", () => {
  const build = (operator, fromStatus) => {
    const receipt = clone(fixture);
    receipt.operator = operator;
    receipt.result.subjectDisposition = {
      confirm: "representation_confirmed",
      reject: "representation_rejected",
      correct: "correction_recorded",
    }[operator];
    receipt.result.mappingTransition = {
      fromStatus,
      toStatus: { confirm: "accepted", reject: "rejected", correct: "corrected" }[operator],
    };
    receipt.correction = operator === "correct"
      ? {
          originalPreserved: true,
          replacementSourceRefs: clone(receipt.interactionSourceRefs),
          changedFields: ["/detections/0/value"],
        }
      : null;
    return receipt;
  };

  for (const [operator, allowedFromStatuses] of Object.entries(
    INTERACTION_OPERATOR_MAPPING_ALLOWED_FROM,
  )) {
    for (const fromStatus of allowedFromStatuses) {
      assert.deepEqual(
        validateInteractionOperatorReceiptSemantics(build(operator, fromStatus)),
        [],
        `${operator} from ${fromStatus}`,
      );
    }
  }

  for (const [operator, fromStatus] of [
    ["confirm", "accepted"],
    ["reject", "rejected"],
    ["correct", "corrected"],
    ["confirm", "unmapped"],
  ]) {
    assert.match(
      validateInteractionOperatorReceiptSemantics(build(operator, fromStatus)).join("\n"),
      new RegExp(`mapping_transition_source_invalid:${operator}:${fromStatus}`),
    );
  }
});

test("unknown, disputed, and not-applicable require typed source-bound responses", () => {
  for (const operator of ["mark_unknown", "mark_disputed", "mark_not_applicable"]) {
    const receipt = questionReceipt(operator);
    assert.equal(validate(receipt), true, `${operator}: ${shapeErrors()}`);
    assert.deepEqual(validateInteractionOperatorReceiptSemantics(receipt), [], operator);
    assert.notEqual(receipt.response, null);
  }

  const swappedBasis = questionReceipt("mark_unknown");
  swappedBasis.result.answerTransition.basis = "explicit_dispute";
  assert.match(
    validateInteractionOperatorReceiptSemantics(swappedBasis).join("\n"),
    /explicit_question_transition_mismatch/,
  );

  const swappedStatus = questionReceipt("mark_disputed");
  swappedStatus.result.answerTransition.toStatus = "unknown";
  assert.match(
    validateInteractionOperatorReceiptSemantics(swappedStatus).join("\n"),
    /explicit_question_transition_mismatch/,
  );

  const missingResponse = questionReceipt("mark_unknown");
  missingResponse.response = null;
  assert.match(
    validateInteractionOperatorReceiptSemantics(missingResponse).join("\n"),
    /mark_unknown_requires_response/,
  );

  const wrongEpistemicStatus = questionReceipt("mark_disputed");
  wrongEpistemicStatus.response.epistemicStatus = "unknown";
  assert.match(
    validateInteractionOperatorReceiptSemantics(wrongEpistemicStatus).join("\n"),
    /response_epistemic_status_mismatch/,
  );
});

test("a later source or detection confirmation cannot silently answer a question", () => {
  const receipt = clone(fixture);
  receipt.result.answerTransition = {
    questionEventRef: exactRef(
      "question_event",
      "question-event:dave:intent:1",
      "4",
    ),
    fromStatus: "unasked",
    toStatus: "answered",
    basis: "explicit_response",
    responseSourceRefs: clone(receipt.interactionSourceRefs),
  };
  assert.equal(validate(receipt), true, shapeErrors());
  assert.match(
    validateInteractionOperatorReceiptSemantics(receipt).join("\n"),
    /nonquestion_operator_cannot_transition_answer/,
  );
});

test("skip, defer, and withhold remain response-free explicit question operators", () => {
  for (const operator of ["skip", "defer", "withhold"]) {
    const receipt = questionReceipt(operator);
    assert.equal(validate(receipt), true, `${operator}: ${shapeErrors()}`);
    assert.deepEqual(validateInteractionOperatorReceiptSemantics(receipt), [], operator);
    assert.equal(receipt.response, null);

    receipt.response = {
      ...questionReceipt("answer").response,
      sourceRefs: clone(receipt.interactionSourceRefs),
    };
    assert.match(
      validateInteractionOperatorReceiptSemantics(receipt).join("\n"),
      /nonresponse_operator_cannot_supply_response/,
    );
  }
});

test("question correction preserves the original and binds its replacement source", () => {
  const receipt = questionReceipt("correct");
  assert.equal(validate(receipt), true, shapeErrors());
  assert.deepEqual(validateInteractionOperatorReceiptSemantics(receipt), []);

  const unbound = clone(receipt);
  unbound.correction.replacementSourceRefs = [
    {
      ...unbound.correction.replacementSourceRefs[0],
      sourceSha256: sha("e"),
    },
  ];
  assert.match(
    validateInteractionOperatorReceiptSemantics(unbound).join("\n"),
    /correction_sources_not_bound_to_interaction/,
  );

  const destructive = clone(receipt);
  destructive.correction.originalPreserved = false;
  assert.equal(validate(destructive), false);
});

test("add-more requires newly bound evidence and does not close a question", () => {
  const receipt = clone(fixture);
  receipt.receiptId = "receipt:interaction:dave:add-more-detection-evidence";
  receipt.operator = "add_more";
  receipt.additionalEvidenceRefs = clone(receipt.interactionSourceRefs);
  receipt.result = {
    subjectDisposition: "evidence_added",
    mappingTransition: null,
    answerTransition: null,
    followupRequired: true,
  };
  assert.equal(validate(receipt), true, shapeErrors());
  assert.deepEqual(validateInteractionOperatorReceiptSemantics(receipt), []);

  receipt.additionalEvidenceRefs = [];
  assert.match(
    validateInteractionOperatorReceiptSemantics(receipt).join("\n"),
    /add_more_requires_evidence/,
  );
});

test("a source can be held without a Yawn, objective, or bot reference", () => {
  const receipt = sourceHoldReceipt();
  assert.equal(validate(receipt), true, shapeErrors());
  assert.deepEqual(validateInteractionOperatorReceiptSemantics(receipt), []);
  assert.deepEqual(Object.keys(receipt.subject).sort(), [
    "id",
    "kind",
    "sourceSha256",
  ]);
});

test("interaction evidence is always a Source and never the reviewed subject", () => {
  const nonSource = clone(fixture);
  nonSource.interactionSourceRefs[0].kind = "detection";
  assert.equal(validate(nonSource), false);
  assert.match(
    validateInteractionOperatorReceiptSemantics(nonSource).join("\n"),
    /interaction_source_ref_kind_invalid/,
  );

  for (const makeReceipt of [sourceHoldReceipt, sourceCorrectionReceipt]) {
    const valid = makeReceipt();
    assert.equal(validate(valid), true, shapeErrors());
    assert.deepEqual(validateInteractionOperatorReceiptSemantics(valid), []);

    const selfBound = makeReceipt();
    const subjectAsSource = sourceEvidenceRef(
      selfBound.subject.id,
      selfBound.subject.sourceSha256[0],
    );
    selfBound.interactionSourceRefs = [subjectAsSource];
    if (selfBound.correction) {
      selfBound.correction.replacementSourceRefs = [clone(subjectAsSource)];
    }
    assert.equal(validate(selfBound), true, shapeErrors());
    assert.match(
      validateInteractionOperatorReceiptSemantics(selfBound).join("\n"),
      /interaction_source_cannot_equal_reviewed_subject/,
    );

    const hashSubstitution = makeReceipt();
    const sameLogicalSource = sourceEvidenceRef(hashSubstitution.subject.id, "e");
    hashSubstitution.interactionSourceRefs = [sameLogicalSource];
    if (hashSubstitution.correction) {
      hashSubstitution.correction.replacementSourceRefs = [clone(sameLogicalSource)];
    }
    assert.equal(validate(hashSubstitution), true, shapeErrors());
    assert.match(
      validateInteractionOperatorReceiptSemantics(hashSubstitution).join("\n"),
      /interaction_source_cannot_equal_reviewed_subject/,
    );
    assert.equal(
      hashSubstitution.subject.sourceSha256,
      makeReceipt().subject.sourceSha256,
    );
  }
});

test("SourceEvidenceRef uses the constitutional UUID identity without narrowing version or case", () => {
  const uuidV7Uppercase = clone(fixture);
  uuidV7Uppercase.interactionSourceRefs[0].id =
    "01890F4E-7B2A-7CC2-98C4-DC0C0C07398F";
  assert.equal(validate(uuidV7Uppercase), true, shapeErrors());

  const sourceKeyIsNotAnId = clone(fixture);
  sourceKeyIsNotAnId.interactionSourceRefs[0].id = "source:dave:confirm";
  assert.equal(validate(sourceKeyIsNotAnId), false);
});

test("generic confirm is not a valid response to an open question", () => {
  const receipt = questionReceipt("answer");
  receipt.operator = "confirm";
  receipt.response = null;
  receipt.correction = null;
  receipt.result = {
    subjectDisposition: "representation_confirmed",
    mappingTransition: null,
    answerTransition: null,
    followupRequired: false,
  };
  assert.equal(validate(receipt), true, shapeErrors());
  assert.match(
    validateInteractionOperatorReceiptSemantics(receipt).join("\n"),
    /operator_not_allowed_for_subject:confirm:question_event/,
  );
});

test("the exact rendered prompt hash is semantically pinned", () => {
  const receipt = questionReceipt("answer");
  receipt.subject.exactRenderedPrompt = "A different prompt";
  assert.equal(validate(receipt), true, shapeErrors());
  assert.match(
    validateInteractionOperatorReceiptSemantics(receipt).join("\n"),
    /question_exact_prompt_sha256_mismatch/,
  );
});

test("the receipt schema is closed", () => {
  const receipt = clone(fixture);
  receipt.impliedAuthority = true;
  assert.equal(validate(receipt), false);
});

test("local validation never claims that a self-consistent bundle is safe to apply", () => {
  const selfConsistentButUnresolved = questionReceipt("answer");
  assert.equal(validate(selfConsistentButUnresolved), true, shapeErrors());
  assert.deepEqual(
    validateInteractionOperatorReceiptSemantics(selfConsistentButUnresolved),
    [],
  );
  assert.equal(INTERACTION_OPERATOR_RECEIPT_VALIDATION_SCOPE, "document_local_only");
  assert.deepEqual(INTERACTION_OPERATOR_RECEIPT_APPLICATION_REQUIREMENTS, [
    "authenticate_actor_and_principal",
    "resolve_source_evidence_through_stable_source_adapter",
    "resolve_exact_reviewed_subject",
    "resolve_question_selection_receipt_and_prompt_hash",
    "prove_from_status_matches_append_only_current_state",
    "enforce_receipt_id_idempotency_and_conflict_detection",
    "prevent_response_visibility_widening",
  ]);
});
