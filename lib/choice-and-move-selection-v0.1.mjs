import { createHash } from "node:crypto";

export const moveSelectionPolicyVersion = "yawn.move-selection.v0.1";

export const moveSelectionWeights = Object.freeze({
  orientationFit: 0.16,
  goalValueFit: 0.14,
  relationshipFit: 0.1,
  sufficiency: 0.12,
  informationGain: 0.1,
  proofability: 0.14,
  optionPreservation: 0.1,
  reversibility: 0.08,
  riskPenalty: 0.04,
  costPenalty: 0.02,
});

export const moveSelectionTieBreakOrder = Object.freeze([
  "clearer-hard-gates",
  "higher-proofability",
  "greater-option-preservation",
  "greater-reversibility",
  "lower-risk",
  "lower-cost",
  "lexicographic-candidate-id",
]);

const hardGateKeys = Object.freeze([
  "immediateSafetyOrStability",
  "authorityOrConsent",
  "privacyVisibilityOrEgress",
  "sourceOrProvenance",
  "proofOrFalsifierIntegrity",
]);

export function scoreMoveCandidate(candidate) {
  const scores = candidate?.scoreInputs;
  if (!scores || typeof scores !== "object") {
    throw new Error("move_candidate_score_inputs_required");
  }

  const positive =
    bounded(scores.orientationFit, "orientationFit") * moveSelectionWeights.orientationFit
    + bounded(scores.goalValueFit, "goalValueFit") * moveSelectionWeights.goalValueFit
    + bounded(scores.relationshipFit, "relationshipFit") * moveSelectionWeights.relationshipFit
    + bounded(scores.sufficiency, "sufficiency") * moveSelectionWeights.sufficiency
    + bounded(scores.informationGain, "informationGain") * moveSelectionWeights.informationGain
    + bounded(scores.proofability, "proofability") * moveSelectionWeights.proofability
    + bounded(scores.optionPreservation, "optionPreservation") * moveSelectionWeights.optionPreservation
    + reversibilityScore(candidate.reversibility) * moveSelectionWeights.reversibility;
  const penalty =
    bounded(scores.risk, "risk") * moveSelectionWeights.riskPenalty
    + bounded(scores.cost, "cost") * moveSelectionWeights.costPenalty;

  return round(clamp(positive - penalty));
}

export function selectMoveProposal(input) {
  requireText(input?.receiptId, "receipt_id_required");
  requirePositiveInteger(input?.revision, "revision_required");
  requireRecordRef(input?.orientationMapRef, "view", "orientation_map_ref_required");
  requireRecordRef(input?.principalRef, "principal", "principal_ref_required");
  requireIsoTimestamp(input?.createdAt, "created_at_required");
  if (!Array.isArray(input?.sourceRefs) || input.sourceRefs.length === 0) {
    throw new Error("source_refs_required");
  }
  if (!Array.isArray(input?.candidates) || input.candidates.length === 0) {
    throw new Error("move_candidates_required");
  }

  const gateAssessments = normalizeGateAssessments(input.gateAssessments);
  const candidates = input.candidates.map((candidate) => ({
    ...candidate,
    computedScore: scoreMoveCandidate(candidate),
  }));
  const unresolvedGate = hardGateKeys.find((key) => gateAssessments[key].status !== "clear");

  let outcome;
  if (unresolvedGate) {
    outcome = {
      kind: "hold",
      selectedCandidateId: null,
      hold: {
        reason: "live_or_unknown_hard_gate",
        reopenCondition: `Resolve ${unresolvedGate} with attributed evidence or keep the move held.`,
      },
      whySelected: `Selection held because ${unresolvedGate} is ${gateAssessments[unresolvedGate].status}.`,
      bestAlternativeCandidateId: null,
    };
  } else {
    const eligible = candidates
      .filter((candidate) => candidate.gateStatus === "clear")
      .filter((candidate) => candidate.authorityStatus === "available" || candidate.authorityStatus === "required")
      .sort(compareCandidates);

    if (eligible.length === 0) {
      outcome = {
        kind: "hold",
        selectedCandidateId: null,
        hold: {
          reason: "no_eligible_candidate",
          reopenCondition: "Add a bounded candidate whose gates are clear and whose authority is available or explicitly required.",
        },
        whySelected: "Selection held because every candidate is blocked, unknown, or outside an inspectable authority path.",
        bestAlternativeCandidateId: null,
      };
    } else {
      outcome = {
        kind: "proposal",
        selectedCandidateId: eligible[0].candidateId,
        hold: null,
        whySelected: explainSelection(eligible[0], eligible[1]),
        bestAlternativeCandidateId: eligible[1]?.candidateId ?? null,
      };
    }
  }

  return {
    schemaVersion: "yawn.move-selection-receipt.v0.1",
    receiptId: input.receiptId,
    revision: input.revision,
    orientationMapRef: input.orientationMapRef,
    principalRef: input.principalRef,
    relationshipRef: input.relationshipRef ?? null,
    arenaRef: input.arenaRef ?? null,
    sourceRefs: input.sourceRefs,
    gateAssessments,
    candidates,
    rankingPolicy: {
      policyVersion: moveSelectionPolicyVersion,
      rule: "hard-gates-then-attributed-weighted-comparison",
      weights: moveSelectionWeights,
      tieBreakOrder: moveSelectionTieBreakOrder,
    },
    outcome,
    epistemicStatus: "inferred",
    confidence: outcome.kind === "proposal"
      ? candidates.find((candidate) => candidate.candidateId === outcome.selectedCandidateId)?.computedScore ?? 0
      : 0,
    choiceRequired: true,
    authorizationRequired: true,
    canonicalState: false,
    createdAt: input.createdAt,
  };
}

export function createChoiceEvent(input) {
  const receipt = input?.moveSelectionReceipt;
  if (!receipt || receipt.schemaVersion !== "yawn.move-selection-receipt.v0.1") {
    throw new Error("move_selection_receipt_required");
  }
  requireText(input?.choiceEventId, "choice_event_id_required");
  requirePositiveInteger(input?.revision, "choice_revision_required");
  requireRecordRef(input?.principalRef, "principal", "choice_principal_ref_required");
  requireIsoTimestamp(input?.createdAt, "choice_created_at_required");
  if (!Array.isArray(input?.sourceRefs) || input.sourceRefs.length === 0) {
    throw new Error("choice_source_refs_required");
  }

  const kind = input.decision?.kind;
  if (!new Set(["selected", "held", "rejected_all"]).has(kind)) {
    throw new Error("choice_kind_invalid");
  }
  let selectedCandidateId = input.decision.selectedCandidateId ?? null;
  if (kind === "selected") {
    requireText(selectedCandidateId, "selected_candidate_required");
    if (!receipt.candidates.some((candidate) => candidate.candidateId === selectedCandidateId)) {
      throw new Error("selected_candidate_not_in_receipt");
    }
  } else if (selectedCandidateId !== null) {
    throw new Error("non_selected_choice_must_not_name_candidate");
  }

  return {
    schemaVersion: "yawn.choice-event.v0.1",
    choiceEventId: input.choiceEventId,
    revision: input.revision,
    principalRef: input.principalRef,
    orientationMapRef: receipt.orientationMapRef,
    moveSelectionReceiptRef: {
      kind: "move_selection_receipt",
      id: receipt.receiptId,
      revision: receipt.revision,
      stateSha256: hashMoveSelectionReceipt(receipt),
    },
    decision: {
      kind,
      selectedCandidateId,
      selectedByRef: input.principalRef,
      rationale: requireText(input.decision.rationale, "choice_rationale_required"),
      epistemicStatus: "reported",
    },
    authorization: {
      grantedByThisEvent: false,
      resolutionStatus: "not_resolved",
      authorityRef: null,
      effectAuthorized: false,
    },
    sourceRefs: input.sourceRefs,
    canonicalState: Boolean(input.canonicalState),
    createdAt: input.createdAt,
  };
}

export function hashMoveSelectionReceipt(receipt) {
  return createHash("sha256").update(stableStringify(receipt), "utf8").digest("hex");
}

function compareCandidates(left, right) {
  return right.computedScore - left.computedScore
    || right.scoreInputs.proofability - left.scoreInputs.proofability
    || right.scoreInputs.optionPreservation - left.scoreInputs.optionPreservation
    || reversibilityScore(right.reversibility) - reversibilityScore(left.reversibility)
    || left.scoreInputs.risk - right.scoreInputs.risk
    || left.scoreInputs.cost - right.scoreInputs.cost
    || left.candidateId.localeCompare(right.candidateId);
}

function explainSelection(selected, alternative) {
  const base = `${selected.label} ranked first after hard gates because its attributed score was ${selected.computedScore.toFixed(3)}.`;
  if (!alternative) {
    return `${base} No second eligible candidate remained. This is a recommendation, not a choice or authorization.`;
  }
  return `${base} The next eligible candidate was ${alternative.label} at ${alternative.computedScore.toFixed(3)}. This is a recommendation, not a choice or authorization.`;
}

function normalizeGateAssessments(value) {
  if (!value || typeof value !== "object") throw new Error("gate_assessments_required");
  return Object.fromEntries(hardGateKeys.map((key) => {
    const assessment = value[key];
    if (!assessment || !new Set(["active", "clear", "unknown"]).has(assessment.status)) {
      throw new Error(`gate_assessment_invalid:${key}`);
    }
    return [key, assessment];
  }));
}

function reversibilityScore(value) {
  if (value === "reversible") return 1;
  if (value === "partially_reversible") return 0.5;
  if (value === "irreversible") return 0;
  throw new Error("reversibility_invalid");
}

function bounded(value, name) {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0 || value > 1) {
    throw new Error(`score_out_of_bounds:${name}`);
  }
  return value;
}

function requireRecordRef(value, kind, code) {
  if (!value || typeof value !== "object" || value.kind !== kind || typeof value.id !== "string" || !value.id.trim()) {
    throw new Error(code);
  }
  return value;
}

function requireText(value, code) {
  if (typeof value !== "string" || !value.trim()) throw new Error(code);
  return value.trim();
}

function requirePositiveInteger(value, code) {
  if (!Number.isInteger(value) || value < 1) throw new Error(code);
  return value;
}

function requireIsoTimestamp(value, code) {
  requireText(value, code);
  if (Number.isNaN(Date.parse(value))) throw new Error(code);
  return value;
}

function clamp(value) {
  return Math.max(0, Math.min(1, value));
}

function round(value) {
  return Math.round(value * 1_000_000) / 1_000_000;
}

function stableStringify(value) {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}
