import { createHash } from "node:crypto";

export const INTERACTION_OPERATOR_RECEIPT_SCHEMA_VERSION =
  "yawn.interaction.operator-receipt.v0.1";

export const INTERACTION_OPERATOR_RECEIPT_VALIDATION_SCOPE = "document_local_only";

export const INTERACTION_OPERATOR_RECEIPT_APPLICATION_REQUIREMENTS = Object.freeze([
  "authenticate_actor_and_principal",
  "resolve_source_evidence_through_stable_source_adapter",
  "resolve_exact_reviewed_subject",
  "resolve_question_selection_receipt_and_prompt_hash",
  "prove_from_status_matches_append_only_current_state",
  "enforce_receipt_id_idempotency_and_conflict_detection",
  "prevent_response_visibility_widening",
]);

export const INTERACTION_OPERATOR_QUESTION_KEYS = Object.freeze([
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

export const INTERACTION_OPERATOR_MAPPING_ALLOWED_FROM = Object.freeze({
  confirm: Object.freeze(["proposed", "corrected", "rejected"]),
  reject: Object.freeze(["proposed", "corrected", "accepted"]),
  correct: Object.freeze(["proposed", "accepted", "rejected"]),
});

export const INTERACTION_OPERATOR_QUESTION_ALLOWED_FROM = Object.freeze({
  answer: Object.freeze([
    "unasked",
    "proposed",
    "skipped",
    "deferred",
    "withheld",
    "unknown",
    "disputed",
    "not_applicable",
  ]),
  correct: Object.freeze(["answered", "corrected"]),
  mark_unknown: Object.freeze([
    "unasked", "proposed", "skipped", "deferred", "withheld", "disputed", "not_applicable",
  ]),
  mark_disputed: Object.freeze([
    "unasked", "proposed", "skipped", "deferred", "withheld", "unknown", "not_applicable",
  ]),
  mark_not_applicable: Object.freeze([
    "unasked", "proposed", "skipped", "deferred", "withheld", "unknown", "disputed",
  ]),
  skip: Object.freeze(["unasked", "proposed", "deferred", "withheld"]),
  defer: Object.freeze(["unasked", "proposed", "skipped", "withheld"]),
  withhold: Object.freeze(["unasked", "proposed", "skipped", "deferred"]),
});

const reviewScopeBySubjectKind = Object.freeze({
  source: "source_record",
  question_event: "question_response",
  detection: "detection_mapping",
  proposal: "proposal_review",
});

const allowedOperatorsBySubjectKind = Object.freeze({
  source: new Set(["correct", "add_more", "split", "link", "hold"]),
  question_event: new Set([
    "answer",
    "mark_unknown",
    "mark_disputed",
    "correct",
    "skip",
    "defer",
    "withhold",
    "mark_not_applicable",
  ]),
  detection: new Set(["confirm", "reject", "correct", "add_more", "split", "link", "hold"]),
  proposal: new Set(["confirm", "reject", "correct", "add_more", "split", "link", "hold"]),
});

const dispositionByOperator = Object.freeze({
  confirm: "representation_confirmed",
  reject: "representation_rejected",
  correct: "correction_recorded",
  add_more: "evidence_added",
  split: "split_proposed",
  link: "link_proposed",
  hold: "held",
  answer: "response_recorded",
  mark_unknown: "marked_unknown",
  mark_disputed: "marked_disputed",
  skip: "skipped",
  defer: "deferred",
  withhold: "withheld",
  mark_not_applicable: "marked_not_applicable",
});

const answerTransitionByOperator = Object.freeze({
  mark_unknown: { toStatus: "unknown", basis: "explicit_unknown" },
  mark_disputed: { toStatus: "disputed", basis: "explicit_dispute" },
  skip: { toStatus: "skipped", basis: "explicit_skip" },
  defer: { toStatus: "deferred", basis: "explicit_defer" },
  withhold: { toStatus: "withheld", basis: "explicit_withhold" },
  mark_not_applicable: {
    toStatus: "not_applicable",
    basis: "explicit_not_applicable",
  },
});

const responseEpistemicStatusByOperator = Object.freeze({
  answer: "reported",
  correct: "reported",
  mark_unknown: "unknown",
  mark_disputed: "disputed",
  mark_not_applicable: "reported",
});

const nonAuthorityEffectKeys = Object.freeze([
  "canonicalMutationAuthorized",
  "truthEstablished",
  "objectiveRatified",
  "botActivated",
  "authorityGranted",
  "effectAuthorityGranted",
  "externalEffectsAuthorized",
]);

function list(value) {
  return Array.isArray(value) ? value : [];
}

function exactRefKey(ref) {
  if (ref?.kind === "source") {
    return [ref.kind, ref.id, ref.sourceSha256].join("\u0000");
  }
  return [ref?.kind, ref?.id, ref?.revision, ref?.stateSha256].join("\u0000");
}

function exactRefsEqual(left, right) {
  const leftKeys = list(left).map(exactRefKey).sort();
  const rightKeys = list(right).map(exactRefKey).sort();
  return leftKeys.length === rightKeys.length
    && leftKeys.every((key, index) => key === rightKeys[index]);
}

function exactRefsContain(superset, subset) {
  const available = new Set(list(superset).map(exactRefKey));
  return list(subset).every((ref) => available.has(exactRefKey(ref)));
}

function exactRefEqual(left, right) {
  return exactRefKey(left) === exactRefKey(right);
}

function sameLogicalRef(left, right) {
  return left?.kind === right?.kind && left?.id === right?.id;
}

export function hashExactRenderedPrompt(prompt) {
  return createHash("sha256").update(prompt, "utf8").digest("hex");
}

/**
 * Validate cross-field meaning after JSON Schema shape validation.
 *
 * This deliberately validates document-local shape, exact-reference binding,
 * attribution, and the transition the receipt claims. It does not authenticate
 * actor/principal identity or resolve referenced records. Before applying any
 * non-canonical View transition, a consumer must resolve SourceEvidenceRef
 * values through the stable Source contract, resolve the exact mutable subject,
 * selection receipt, and prompt hash, then prove that `fromStatus` equals the
 * current append-only state of the exact subject revision. The append-only
 * receipt store must treat an exact same-ID/same-bytes replay as idempotent and
 * reject a same-ID/different-bytes conflict. It must also fail closed when a
 * Response visibility would widen the resolved Source privacy/egress boundary.
 */
export function validateInteractionOperatorReceiptSemantics(receipt) {
  const errors = [];
  const subjectKind = receipt?.subject?.kind;
  const operator = receipt?.operator;
  const result = receipt?.result ?? {};

  if (receipt?.schemaVersion !== INTERACTION_OPERATOR_RECEIPT_SCHEMA_VERSION) {
    errors.push("interaction_operator_receipt_schema_version_invalid");
  }

  const expectedReviewScope = reviewScopeBySubjectKind[subjectKind];
  if (expectedReviewScope === undefined) {
    errors.push("interaction_operator_receipt_subject_kind_invalid");
  } else if (receipt?.reviewScope !== expectedReviewScope) {
    errors.push("interaction_operator_receipt_review_scope_mismatch");
  }

  if (!allowedOperatorsBySubjectKind[subjectKind]?.has(operator)) {
    errors.push(`interaction_operator_not_allowed_for_subject:${operator}:${subjectKind}`);
  }

  if (result.subjectDisposition !== dispositionByOperator[operator]) {
    errors.push("interaction_operator_disposition_mismatch");
  }

  for (const effectKey of nonAuthorityEffectKeys) {
    if (receipt?.effects?.[effectKey] !== false) {
      errors.push(`interaction_operator_effect_must_be_false:${effectKey}`);
    }
  }
  if (receipt?.canonicalState !== false) {
    errors.push("interaction_operator_receipt_cannot_be_canonical_state");
  }
  if (receipt?.notAuthority !== true) {
    errors.push("interaction_operator_receipt_must_be_not_authority");
  }

  const interactionSourceRefs = list(receipt?.interactionSourceRefs);
  if (interactionSourceRefs.length !== 1) {
    errors.push("interaction_receipt_requires_exactly_one_interaction_source");
  }
  for (const sourceRef of interactionSourceRefs) {
    if (sourceRef?.kind !== "source") {
      errors.push("interaction_source_ref_kind_invalid");
    }
    if (typeof sourceRef?.sourceSha256 !== "string") {
      errors.push("interaction_source_sha256_missing");
    }
    if (sameLogicalRef(sourceRef, receipt?.subject)) {
      errors.push("interaction_source_cannot_equal_reviewed_subject");
    }
  }

  const mappingTransition = result.mappingTransition;
  if (["confirm", "reject", "correct"].includes(operator)
    && ["detection", "proposal"].includes(subjectKind)) {
    const expectedToStatus = {
      confirm: "accepted",
      reject: "rejected",
      correct: "corrected",
    }[operator];
    if (mappingTransition === null || mappingTransition === undefined) {
      errors.push("interaction_mapping_operator_requires_transition");
    } else if (mappingTransition.toStatus !== expectedToStatus) {
      errors.push("interaction_mapping_transition_target_mismatch");
    }
    if (mappingTransition && !INTERACTION_OPERATOR_MAPPING_ALLOWED_FROM[operator]?.includes(
      mappingTransition.fromStatus,
    )) {
      errors.push(`interaction_mapping_transition_source_invalid:${operator}:${mappingTransition.fromStatus}`);
    }
  } else if (mappingTransition !== null) {
    errors.push("interaction_nonmapping_operator_cannot_transition_mapping");
  }

  const correctionRequired = operator === "correct";
  if (correctionRequired && receipt?.correction === null) {
    errors.push("interaction_correct_requires_correction");
  }
  if (!correctionRequired && receipt?.correction !== null) {
    errors.push("interaction_noncorrect_operator_cannot_supply_correction");
  }
  if (receipt?.correction && !exactRefsContain(
    receipt.interactionSourceRefs,
    receipt.correction.replacementSourceRefs,
  )) {
    errors.push("interaction_correction_sources_not_bound_to_interaction");
  }

  if (operator === "add_more") {
    if (list(receipt?.additionalEvidenceRefs).length === 0) {
      errors.push("interaction_add_more_requires_evidence");
    } else if (!exactRefsContain(
      receipt.interactionSourceRefs,
      receipt.additionalEvidenceRefs,
    )) {
      errors.push("interaction_add_more_evidence_not_bound_to_interaction");
    }
  } else if (list(receipt?.additionalEvidenceRefs).length > 0) {
    errors.push("interaction_non_add_more_operator_cannot_add_evidence");
  }

  const minimumRelatedRefs = operator === "split" ? 2 : operator === "link" ? 1 : 0;
  if (list(receipt?.relatedSubjectRefs).length < minimumRelatedRefs) {
    errors.push(`interaction_${operator}_requires_related_subject_refs`);
  }
  if (minimumRelatedRefs === 0 && list(receipt?.relatedSubjectRefs).length > 0) {
    errors.push("interaction_operator_cannot_supply_related_subject_refs");
  }
  if (list(receipt?.relatedSubjectRefs).some((ref) => exactRefEqual(ref, receipt?.subject))) {
    errors.push("interaction_related_subject_cannot_equal_subject");
  }

  const answerTransition = result.answerTransition;
  const questionOperator = subjectKind === "question_event"
    && allowedOperatorsBySubjectKind.question_event.has(operator);

  if (!questionOperator) {
    if (answerTransition !== null) {
      errors.push("interaction_nonquestion_operator_cannot_transition_answer");
    }
    if (receipt?.response !== null) {
      errors.push("interaction_nonquestion_operator_cannot_supply_response");
    }
    return errors;
  }

  if (answerTransition === null || answerTransition === undefined) {
    errors.push("interaction_question_operator_requires_answer_transition");
    return errors;
  }

  if (!exactRefEqual(answerTransition.questionEventRef, receipt.subject)) {
    errors.push("interaction_answer_transition_question_ref_mismatch");
  }
  if (!exactRefsEqual(answerTransition.responseSourceRefs, receipt.interactionSourceRefs)) {
    errors.push("interaction_answer_sources_not_bound_to_interaction");
  }
  if (!INTERACTION_OPERATOR_QUESTION_ALLOWED_FROM[operator]?.includes(
    answerTransition.fromStatus,
  )) {
    errors.push(`interaction_question_transition_source_invalid:${operator}:${answerTransition.fromStatus}`);
  }

  if (Object.hasOwn(responseEpistemicStatusByOperator, operator)) {
    if (receipt?.response === null) {
      errors.push(`interaction_${operator}_requires_response`);
    } else {
      if (!exactRefsEqual(receipt.response.sourceRefs, receipt.interactionSourceRefs)) {
        errors.push("interaction_response_sources_not_bound_to_interaction");
      }
      if (receipt.response.assertedBy !== receipt.actorRef) {
        errors.push("interaction_response_asserted_by_actor_mismatch");
      }
      if (receipt.response.rawResponseSha256 !== interactionSourceRefs[0]?.sourceSha256) {
        errors.push("interaction_response_raw_sha256_mismatch");
      }
      if (receipt.response.epistemicStatus !== responseEpistemicStatusByOperator[operator]) {
        errors.push("interaction_response_epistemic_status_mismatch");
      }
    }

    if (operator === "answer" || operator === "correct") {
      if (answerTransition.basis !== "explicit_response") {
        errors.push("interaction_response_transition_basis_mismatch");
      }
      if (operator === "answer" && answerTransition.toStatus !== "answered") {
        errors.push("interaction_answer_transition_target_invalid");
      }
      if (operator === "correct") {
        if (answerTransition.toStatus !== "corrected") {
          errors.push("interaction_correction_transition_target_invalid");
        }
      }
    } else {
      const expectedTransition = answerTransitionByOperator[operator];
      if (
        answerTransition.toStatus !== expectedTransition?.toStatus
        || answerTransition.basis !== expectedTransition?.basis
      ) {
        errors.push("interaction_explicit_question_transition_mismatch");
      }
    }
  } else {
    if (receipt?.response !== null) {
      errors.push("interaction_nonresponse_operator_cannot_supply_response");
    }
    const expectedTransition = answerTransitionByOperator[operator];
    if (
      answerTransition.toStatus !== expectedTransition?.toStatus
      || answerTransition.basis !== expectedTransition?.basis
    ) {
      errors.push("interaction_explicit_question_transition_mismatch");
    }
  }

  if (subjectKind === "question_event") {
    const expectedPromptSha256 = hashExactRenderedPrompt(receipt.subject.exactRenderedPrompt ?? "");
    if (receipt.subject.exactRenderedPromptSha256 !== expectedPromptSha256) {
      errors.push("interaction_question_exact_prompt_sha256_mismatch");
    }
  }

  return errors;
}
