import { canonicalJson, hashCanonical } from "./state-substrate-v1.mjs";
import { normalizeObservationState, observationStateSha256 } from "./observation-state-v1.mjs";

export const QUESTION_PROPOSAL_SCHEMA_VERSION = "yawn.question-proposal.v1";
export const ART_BRIEF_SCHEMA_VERSION = "yawn.art-brief.v1";
export const LOCAL_ART_CANDIDATE_SCHEMA_VERSION = "yawn.local-art-candidate.v1";
export const PROJECTION_FEEDBACK_SCHEMA_VERSION = "yawn.projection-feedback.v1";
export const OBSERVATION_QUESTION_ART_VIEW_VERSION = "yawn.observation-question-art-view.v1";

const sha256Pattern = /^[a-f0-9]{64}$/;
const questionPathPattern = /^\/remainsOpen\/(0|[1-9][0-9]*)$/;
const recordKinds = new Set([
  "actor", "principal", "agent_space", "arena", "observation", "yawn",
  "source", "proof", "view", "git_commit", "question_proposal", "art_brief",
  "art_candidate", "projection_feedback",
]);
const divergenceDimensions = new Set([
  "testing_fidelity", "ontology_to_interface_fidelity",
  "source_to_projection_traceability", "accessible_question_fidelity",
  "visual_identity_fidelity", "iteration_memory",
]);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function hash(value) {
  return hashCanonical(value).replace(/^sha256:/, "");
}

function nonEmpty(value, message) {
  assert(typeof value === "string" && value.trim().length > 0, message);
  return value;
}

function stringArray(values, name, { unique = false, sort = false } = {}) {
  assert(Array.isArray(values), `${name}_required`);
  for (const value of values) nonEmpty(value, `${name}_invalid`);
  if (unique) assert(new Set(values).size === values.length, `${name}_duplicate`);
  return sort ? [...values].sort() : [...values];
}

function falseBoundary(input, fields, name) {
  assert(input && typeof input === "object" && !Array.isArray(input), `${name}_required`);
  for (const field of fields) assert(input[field] === false, `${name}_${field}_must_be_false`);
  return Object.fromEntries(fields.map((field) => [field, false]));
}

export function normalizeRecordRef(input, { kind = null, exactHash = false } = {}) {
  assert(input && typeof input === "object" && !Array.isArray(input), "record_ref_required");
  assert(recordKinds.has(input.kind), "record_ref_kind_invalid");
  if (kind) assert(input.kind === kind, `record_ref_kind_must_be_${kind}`);
  nonEmpty(input.id, "record_ref_id_required");
  if (input.revision !== undefined && input.revision !== null) {
    assert(Number.isInteger(input.revision) && input.revision >= 0, "record_ref_revision_invalid");
  }
  if (input.stateSha256 !== undefined && input.stateSha256 !== null) {
    assert(sha256Pattern.test(input.stateSha256), "record_ref_hash_invalid");
  }
  if (exactHash) assert(sha256Pattern.test(input.stateSha256), "record_ref_exact_hash_required");
  const ref = { kind: input.kind, id: input.id };
  if (input.revision !== undefined) ref.revision = input.revision;
  if (input.stateSha256 !== undefined) ref.stateSha256 = input.stateSha256;
  return ref;
}

export function normalizeQuestionProposal(input) {
  assert(input?.schemaVersion === QUESTION_PROPOSAL_SCHEMA_VERSION, "question_schema_invalid");
  nonEmpty(input.questionProposalId, "question_id_required");
  assert(Number.isInteger(input.revision) && input.revision >= 1, "question_revision_invalid");
  const observationRef = normalizeRecordRef(input.observationRef, { kind: "observation", exactHash: true });
  assert(Number.isInteger(observationRef.revision) && observationRef.revision >= 1, "question_observation_revision_required");
  assert(input.source && typeof input.source === "object", "question_source_required");
  assert(questionPathPattern.test(input.source.fieldPath), "question_source_path_invalid");
  nonEmpty(input.source.verbatimText, "question_source_text_required");
  assert(Array.isArray(input.source.sourceSpanIndexes), "question_source_indexes_required");
  assert(input.source.sourceSpanIndexes.length === 0, "question_source_ranges_unsubstantiated");
  nonEmpty(input.text, "question_text_required");
  assert(["verbatim", "organized"].includes(input.transformation), "question_transformation_invalid");
  if (input.transformation === "verbatim") assert(input.text === input.source.verbatimText, "question_verbatim_changed");
  assert(input.questionStatus === "open", "question_status_must_be_open");
  assert(input.proposalStatus === "proposed", "question_must_remain_proposed");
  const proposedBy = normalizeRecordRef(input.proposedBy);
  assert(["actor", "principal"].includes(proposedBy.kind), "question_proposer_kind_invalid");
  assert(input.organization && typeof input.organization === "object", "question_organization_required");
  const agentSpaceRef = normalizeRecordRef(input.organization.agentSpaceRef, { kind: "agent_space" });
  const arenaRef = input.organization.arenaRef === null
    ? null
    : normalizeRecordRef(input.organization.arenaRef, { kind: "arena" });
  assert(Array.isArray(input.organization.aboutYawnRefs), "question_yawn_refs_required");
  const aboutYawnRefs = input.organization.aboutYawnRefs
    .map((ref) => normalizeRecordRef(ref, { kind: "yawn" }))
    .sort((left, right) => left.id.localeCompare(right.id));
  assert(new Set(aboutYawnRefs.map((ref) => ref.id)).size === aboutYawnRefs.length, "question_yawn_refs_duplicate");
  nonEmpty(input.createdAt, "question_created_at_required");
  return {
    schemaVersion: QUESTION_PROPOSAL_SCHEMA_VERSION,
    questionProposalId: input.questionProposalId,
    revision: input.revision,
    observationRef,
    source: {
      fieldPath: input.source.fieldPath,
      verbatimText: input.source.verbatimText,
      sourceSpanIndexes: [...input.source.sourceSpanIndexes].sort((left, right) => left - right),
    },
    text: input.text,
    transformation: input.transformation,
    proposedBy,
    organization: { agentSpaceRef, arenaRef, aboutYawnRefs },
    questionStatus: "open",
    proposalStatus: "proposed",
    createdAt: input.createdAt,
  };
}

export function questionProposalSha256(proposal) {
  return hash(normalizeQuestionProposal(proposal));
}

export function assertQuestionProposalSource(observationInput, proposalInput) {
  const observation = normalizeObservationState(observationInput);
  const proposal = normalizeQuestionProposal(proposalInput);
  assert(proposal.observationRef.id === observation.observationId, "question_observation_id_mismatch");
  assert(proposal.observationRef.revision === observation.revision, "question_observation_revision_mismatch");
  assert(proposal.observationRef.stateSha256 === observationStateSha256(observation), "question_observation_hash_mismatch");
  const index = Number(questionPathPattern.exec(proposal.source.fieldPath)[1]);
  assert(observation.remainsOpen[index] === proposal.source.verbatimText, "question_source_text_mismatch");
  for (const sourceIndex of proposal.source.sourceSpanIndexes) {
    assert(sourceIndex < observation.sourceSpans.length, "question_source_index_out_of_range");
  }
  return proposal;
}

export function createQuestionProposal({
  observation: observationInput, questionProposalId, sourceFieldPath,
  revision = 1, sourceSpanIndexes = [], text, transformation = "verbatim", proposedBy, createdAt,
}) {
  const observation = normalizeObservationState(observationInput);
  assert(questionPathPattern.test(sourceFieldPath), "question_source_path_invalid");
  const index = Number(questionPathPattern.exec(sourceFieldPath)[1]);
  const verbatimText = observation.remainsOpen[index];
  nonEmpty(verbatimText, "question_source_not_found");
  const proposal = normalizeQuestionProposal({
    schemaVersion: QUESTION_PROPOSAL_SCHEMA_VERSION,
    questionProposalId,
    revision,
    observationRef: {
      kind: "observation", id: observation.observationId, revision: observation.revision,
      stateSha256: observationStateSha256(observation),
    },
    source: { fieldPath: sourceFieldPath, verbatimText, sourceSpanIndexes },
    text: text ?? verbatimText,
    transformation,
    proposedBy,
    organization: {
      agentSpaceRef: { kind: "agent_space", id: observation.agentSpaceRef },
      arenaRef: observation.arenaRef ? { kind: "arena", id: observation.arenaRef } : null,
      aboutYawnRefs: observation.observedYawnRefs.map((id) => ({ kind: "yawn", id })),
    },
    questionStatus: "open",
    proposalStatus: "proposed",
    createdAt,
  });
  return assertQuestionProposalSource(observation, proposal);
}

export function normalizeArtBrief(input) {
  assert(input?.schemaVersion === ART_BRIEF_SCHEMA_VERSION, "art_brief_schema_invalid");
  nonEmpty(input.briefId, "art_brief_id_required");
  assert(Number.isInteger(input.revision) && input.revision >= 1, "art_brief_revision_invalid");
  const observationRef = normalizeRecordRef(input.observationRef, { kind: "observation", exactHash: true });
  assert(Number.isInteger(observationRef.revision) && observationRef.revision >= 1, "art_brief_observation_revision_required");
  const questionProposalRef = normalizeRecordRef(input.questionProposalRef, { kind: "question_proposal", exactHash: true });
  assert(Number.isInteger(questionProposalRef.revision) && questionProposalRef.revision >= 1, "art_brief_question_revision_required");
  const proposedBy = normalizeRecordRef(input.proposedBy);
  assert(["actor", "principal"].includes(proposedBy.kind), "art_brief_proposer_kind_invalid");
  nonEmpty(input.visualIntention, "art_brief_intention_required");
  assert(input.identityAsset && typeof input.identityAsset === "object", "art_brief_identity_required");
  const identityAsset = {
    recordRef: normalizeRecordRef(input.identityAsset.recordRef, { kind: "source" }),
    sha256: input.identityAsset.sha256,
    crop: input.identityAsset.crop,
    role: input.identityAsset.role,
  };
  assert(sha256Pattern.test(identityAsset.sha256), "art_brief_identity_hash_invalid");
  assert(["face_only", "full_body", "none"].includes(identityAsset.crop), "art_brief_identity_crop_invalid");
  assert(identityAsset.role === "reflective_agent_not_authority", "art_brief_identity_role_invalid");
  assert(input.textPolicy?.questionRenderedAsPixels === false, "art_brief_question_pixels_forbidden");
  assert(input.textPolicy?.liveTextRequired === true, "art_brief_live_text_required");
  nonEmpty(input.accessibleDescription, "art_brief_accessible_description_required");
  assert(input.semanticColorRoles && typeof input.semanticColorRoles === "object", "art_brief_colors_required");
  for (const role of ["observation", "question", "agent"]) nonEmpty(input.semanticColorRoles[role], `art_brief_color_${role}_required`);
  assert(Object.keys(input.semanticColorRoles).every((role) => ["observation", "question", "agent"].includes(role)), "art_brief_color_role_invalid");
  const semanticColorRoles = {
    observation: input.semanticColorRoles.observation,
    question: input.semanticColorRoles.question,
    agent: input.semanticColorRoles.agent,
  };
  const compositionRequirements = stringArray(input.compositionRequirements, "art_brief_composition", { unique: true });
  const negativeConstraints = stringArray(input.negativeConstraints, "art_brief_negative", { unique: true });
  assert(Number.isInteger(input.render?.width) && input.render.width >= 64 && input.render.width <= 4096, "art_brief_width_invalid");
  assert(Number.isInteger(input.render?.height) && input.render.height >= 64 && input.render.height <= 4096, "art_brief_height_invalid");
  assert(Number.isInteger(input.render?.seed) && input.render.seed >= 0, "art_brief_seed_invalid");
  assert(input.render?.maxCandidates === 1, "art_brief_max_candidates_invalid");
  assert(input.boundary?.effectGrantRequired === true, "art_brief_effect_grant_required");
  assert(input.boundary?.maximumPaidCostMicrousd === 0, "art_brief_paid_cost_must_be_zero");
  const denied = falseBoundary(input.boundary, [
    "externalNetworkEgressAuthorized", "paidProviderCallAuthorized",
    "canonicalMutationAuthorized", "publicationAuthorized", "promotionAuthorized",
  ], "art_brief_boundary");
  assert(input.proposalStatus === "proposed", "art_brief_must_remain_proposed");
  nonEmpty(input.createdAt, "art_brief_created_at_required");
  return {
    schemaVersion: ART_BRIEF_SCHEMA_VERSION,
    briefId: input.briefId,
    revision: input.revision,
    observationRef,
    questionProposalRef,
    proposedBy,
    visualIntention: input.visualIntention,
    identityAsset,
    textPolicy: { questionRenderedAsPixels: false, liveTextRequired: true },
    accessibleDescription: input.accessibleDescription,
    semanticColorRoles,
    compositionRequirements,
    negativeConstraints,
    render: { width: input.render.width, height: input.render.height, seed: input.render.seed, maxCandidates: 1 },
    boundary: { effectGrantRequired: true, ...denied, maximumPaidCostMicrousd: 0 },
    proposalStatus: "proposed",
    createdAt: input.createdAt,
  };
}

export function artBriefSha256(brief) {
  return hash(normalizeArtBrief(brief));
}

export function createArtBrief({ observation, questionProposal, briefId, revision = 1, proposedBy, visualIntention, identityAsset,
  accessibleDescription, semanticColorRoles, compositionRequirements, negativeConstraints, render, createdAt }) {
  const question = assertQuestionProposalSource(observation, questionProposal);
  return normalizeArtBrief({
    schemaVersion: ART_BRIEF_SCHEMA_VERSION,
    briefId,
    revision,
    observationRef: question.observationRef,
    questionProposalRef: {
      kind: "question_proposal", id: question.questionProposalId,
      revision: question.revision,
      stateSha256: questionProposalSha256(question),
    },
    proposedBy,
    visualIntention,
    identityAsset,
    textPolicy: { questionRenderedAsPixels: false, liveTextRequired: true },
    accessibleDescription,
    semanticColorRoles,
    compositionRequirements,
    negativeConstraints,
    render,
    boundary: {
      effectGrantRequired: true,
      externalNetworkEgressAuthorized: false,
      paidProviderCallAuthorized: false,
      maximumPaidCostMicrousd: 0,
      canonicalMutationAuthorized: false,
      publicationAuthorized: false,
      promotionAuthorized: false,
    },
    proposalStatus: "proposed",
    createdAt,
  });
}

export function normalizeLocalArtCandidate(input) {
  assert(input?.schemaVersion === LOCAL_ART_CANDIDATE_SCHEMA_VERSION, "art_candidate_schema_invalid");
  nonEmpty(input.candidateId, "art_candidate_id_required");
  assert(Number.isInteger(input.revision) && input.revision >= 1, "art_candidate_revision_invalid");
  const briefRef = normalizeRecordRef(input.briefRef, { kind: "art_brief", exactHash: true });
  assert(Number.isInteger(briefRef.revision) && briefRef.revision >= 1, "art_candidate_brief_revision_required");
  const questionProposalRef = normalizeRecordRef(input.questionProposalRef, { kind: "question_proposal", exactHash: true });
  assert(Number.isInteger(questionProposalRef.revision) && questionProposalRef.revision >= 1, "art_candidate_question_revision_required");
  const producedBy = normalizeRecordRef(input.producedBy);
  assert(["actor", "principal"].includes(producedBy.kind), "art_candidate_producer_kind_invalid");
  assert(input.renderer?.provider === "comfyui_local", "art_candidate_provider_invalid");
  for (const key of ["grantId", "promptId"]) nonEmpty(input.renderer[key], `art_candidate_${key}_required`);
  for (const key of ["workflowProfileSha256", "workflowSha256"]) assert(sha256Pattern.test(input.renderer[key]), `art_candidate_${key}_invalid`);
  assert(input.renderer.modelOrCheckpointSha256 === null || sha256Pattern.test(input.renderer.modelOrCheckpointSha256), "art_candidate_model_hash_invalid");
  assert(Number.isInteger(input.renderer.seed) && input.renderer.seed >= 0, "art_candidate_seed_invalid");
  assert(input.output && sha256Pattern.test(input.output.sha256), "art_candidate_output_hash_invalid");
  assert(["image/png", "image/jpeg", "image/webp"].includes(input.output.mediaType), "art_candidate_media_type_invalid");
  assert(Number.isInteger(input.output.width) && input.output.width > 0 && input.output.width <= 4096, "art_candidate_width_invalid");
  assert(Number.isInteger(input.output.height) && input.output.height > 0 && input.output.height <= 4096, "art_candidate_height_invalid");
  assert(typeof input.output.proxyPath === "string" && input.output.proxyPath.startsWith("/api/local-art/"), "art_candidate_proxy_path_invalid");
  nonEmpty(input.accessibleDescription, "art_candidate_accessible_description_required");
  const validation = {};
  for (const key of ["descriptorValidated", "bytesValidated", "dimensionsValidated", "sha256Validated"]) {
    assert(input.validation?.[key] === true, `art_candidate_validation_${key}_must_be_true`);
    validation[key] = true;
  }
  assert(["pending", "passed", "failed"].includes(input.textInspection?.status), "art_candidate_text_inspection_invalid");
  const detectedText = stringArray(input.textInspection.detectedText, "art_candidate_detected_text");
  assert(input.evidenceStatus === "verified_local_output", "art_candidate_evidence_status_invalid");
  const boundary = falseBoundary(input.boundary, ["canonicalMutationAuthorized", "publicationAuthorized", "promotionAuthorized"], "art_candidate_boundary");
  assert(input.status === "candidate", "art_candidate_status_invalid");
  nonEmpty(input.createdAt, "art_candidate_created_at_required");
  return {
    schemaVersion: LOCAL_ART_CANDIDATE_SCHEMA_VERSION,
    candidateId: input.candidateId,
    revision: input.revision,
    briefRef,
    questionProposalRef,
    producedBy,
    renderer: {
      provider: "comfyui_local",
      grantId: input.renderer.grantId,
      workflowProfileSha256: input.renderer.workflowProfileSha256,
      workflowSha256: input.renderer.workflowSha256,
      modelOrCheckpointSha256: input.renderer.modelOrCheckpointSha256,
      promptId: input.renderer.promptId,
      seed: input.renderer.seed,
    },
    output: { ...input.output },
    accessibleDescription: input.accessibleDescription,
    validation,
    textInspection: { status: input.textInspection.status, detectedText },
    evidenceStatus: input.evidenceStatus,
    boundary,
    status: "candidate",
    createdAt: input.createdAt,
  };
}

export function localArtCandidateSha256(candidate) {
  return hash(normalizeLocalArtCandidate(candidate));
}

export function createLocalArtCandidate({ artBrief, questionProposal, ...input }) {
  const brief = normalizeArtBrief(artBrief);
  const question = normalizeQuestionProposal(questionProposal);
  assert(brief.questionProposalRef.id === question.questionProposalId, "art_candidate_question_id_mismatch");
  assert(brief.questionProposalRef.revision === question.revision, "art_candidate_question_revision_mismatch");
  assert(brief.questionProposalRef.stateSha256 === questionProposalSha256(question), "art_candidate_question_hash_mismatch");
  assert(input.renderer?.seed === brief.render.seed, "art_candidate_seed_mismatch");
  assert(input.output?.width <= brief.render.width && input.output?.height <= brief.render.height, "art_candidate_dimensions_exceed_brief");
  return normalizeLocalArtCandidate({
    ...input,
    schemaVersion: LOCAL_ART_CANDIDATE_SCHEMA_VERSION,
    revision: input.revision ?? 1,
    briefRef: { kind: "art_brief", id: brief.briefId, revision: brief.revision, stateSha256: artBriefSha256(brief) },
    questionProposalRef: brief.questionProposalRef,
    boundary: { canonicalMutationAuthorized: false, publicationAuthorized: false, promotionAuthorized: false },
    status: "candidate",
  });
}

export function isLocalArtCandidateReviewable(candidateInput) {
  const candidate = normalizeLocalArtCandidate(candidateInput);
  return candidate.evidenceStatus === "verified_local_output"
    && Object.values(candidate.validation).every(Boolean)
    && candidate.textInspection.status === "passed"
    && candidate.textInspection.detectedText.length === 0;
}

export function normalizeProjectionFeedback(input) {
  assert(input?.schemaVersion === PROJECTION_FEEDBACK_SCHEMA_VERSION, "projection_feedback_schema_invalid");
  nonEmpty(input.feedbackId, "projection_feedback_id_required");
  assert(input.ontologyRole === "proposal_facet", "projection_feedback_ontology_role_invalid");
  const assertedBy = normalizeRecordRef(input.assertedBy);
  assert(["actor", "principal"].includes(assertedBy.kind), "projection_feedback_actor_invalid");
  assert(["local_handoff", "browser_capture", "synthetic_fixture"].includes(input.source?.coordinateKind), "projection_feedback_source_kind_invalid");
  assert(input.source?.platformMessageIdVerified === false, "projection_feedback_message_id_must_be_unverified");
  nonEmpty(input.source.coordinate, "projection_feedback_coordinate_required");
  nonEmpty(input.source.exactQuote, "projection_feedback_quote_required");
  nonEmpty(input.source.capturedAt, "projection_feedback_captured_at_required");
  const subjectRef = normalizeRecordRef(input.subjectRef, { kind: "view" });
  assert(Array.isArray(input.expectedExperience) && input.expectedExperience.length > 0, "projection_feedback_expectations_required");
  const expectedExperience = input.expectedExperience.map((item) => {
    nonEmpty(item.text, "projection_feedback_expectation_text_required");
    nonEmpty(item.assertedBy, "projection_feedback_expectation_actor_required");
    assert(item.epistemicStatus === "reported", "projection_feedback_expectation_status_invalid");
    return { text: item.text, assertedBy: item.assertedBy, epistemicStatus: "reported" };
  });
  assert(Array.isArray(input.actualProjectionEvidence) && input.actualProjectionEvidence.length > 0, "projection_feedback_evidence_required");
  const actualProjectionEvidence = input.actualProjectionEvidence.map((item) => {
    nonEmpty(item.description, "projection_feedback_evidence_description_required");
    assert(item.verificationStatus === "reported_not_independently_verified", "projection_feedback_evidence_status_invalid");
    return {
      description: item.description,
      evidenceRef: normalizeRecordRef(item.evidenceRef),
      verificationStatus: "reported_not_independently_verified",
    };
  });
  assert(Array.isArray(input.divergenceDimensions) && input.divergenceDimensions.length > 0, "projection_feedback_dimensions_required");
  assert(new Set(input.divergenceDimensions).size === input.divergenceDimensions.length, "projection_feedback_dimensions_duplicate");
  for (const dimension of input.divergenceDimensions) assert(divergenceDimensions.has(dimension), "projection_feedback_dimension_invalid");
  assert(Array.isArray(input.preferenceUpdateProposals) && input.preferenceUpdateProposals.length > 0, "projection_feedback_preferences_required");
  const preferenceUpdateProposals = input.preferenceUpdateProposals.map((proposal) => {
    nonEmpty(proposal.preferenceProposalId, "projection_feedback_preference_id_required");
    nonEmpty(proposal.viewKind, "projection_feedback_preference_view_required");
    assert(/^\/[A-Za-z0-9_.~/-]+$/.test(proposal.fieldPath), "projection_feedback_preference_path_invalid");
    assert(["set", "reset"].includes(proposal.operation), "projection_feedback_preference_operation_invalid");
    if (proposal.operation === "reset") assert(proposal.value === null, "projection_feedback_reset_value_must_be_null");
    assert(proposal.status === "proposed", "projection_feedback_preference_must_remain_proposed");
    assert(proposal.sourceFeedbackId === input.feedbackId, "projection_feedback_preference_source_mismatch");
    nonEmpty(proposal.rationale, "projection_feedback_preference_rationale_required");
    return { ...proposal, scopeRef: normalizeRecordRef(proposal.scopeRef), status: "proposed" };
  });
  assert(Array.isArray(input.proofObligations) && input.proofObligations.length > 0, "projection_feedback_proof_required");
  const proofObligations = input.proofObligations.map((proof) => {
    nonEmpty(proof.obligationId, "projection_feedback_proof_id_required");
    const preconditions = stringArray(proof.preconditions, "projection_feedback_preconditions");
    nonEmpty(proof.prediction, "projection_feedback_prediction_required");
    const postconditions = stringArray(proof.postconditions, "projection_feedback_postconditions");
    nonEmpty(proof.verifier, "projection_feedback_verifier_required");
    nonEmpty(proof.falsifier, "projection_feedback_falsifier_required");
    assert(proof.status === "waiting", "projection_feedback_proof_must_wait");
    return { ...proof, preconditions, postconditions, status: "waiting" };
  });
  assert(input.epistemicStatus === "reported", "projection_feedback_epistemic_status_invalid");
  assert(input.universality === "subjective_attributed_evaluation", "projection_feedback_universality_invalid");
  assert(input.proposalStatus === "proposed", "projection_feedback_must_remain_proposed");
  const boundary = falseBoundary(input.boundary, [
    "canonicalMutationAuthorized", "automaticPreferenceApplicationAuthorized",
    "publicationAuthorized", "promotionAuthorized",
  ], "projection_feedback_boundary");
  nonEmpty(input.createdAt, "projection_feedback_created_at_required");
  return {
    schemaVersion: PROJECTION_FEEDBACK_SCHEMA_VERSION,
    feedbackId: input.feedbackId,
    ontologyRole: "proposal_facet",
    assertedBy,
    source: { ...input.source },
    subjectRef,
    expectedExperience,
    actualProjectionEvidence,
    divergenceDimensions: [...input.divergenceDimensions].sort(),
    preferenceUpdateProposals,
    proofObligations,
    epistemicStatus: "reported",
    universality: "subjective_attributed_evaluation",
    proposalStatus: "proposed",
    boundary,
    createdAt: input.createdAt,
  };
}

export function projectionFeedbackSha256(feedback) {
  return hash(normalizeProjectionFeedback(feedback));
}

export function serializeObservationQuestionArtView({
  observation: observationInput, questionProposal: questionInput, artBrief: briefInput,
  localArtCandidate: candidateInput = null, projectionFeedback: feedbackInput = null,
}) {
  const observation = normalizeObservationState(observationInput);
  const questionProposal = assertQuestionProposalSource(observation, questionInput);
  const artBrief = normalizeArtBrief(briefInput);
  assert(artBrief.observationRef.id === observation.observationId, "view_brief_observation_id_mismatch");
  assert(artBrief.observationRef.revision === observation.revision, "view_brief_observation_revision_mismatch");
  assert(artBrief.observationRef.stateSha256 === observationStateSha256(observation), "view_brief_observation_hash_mismatch");
  assert(artBrief.questionProposalRef.id === questionProposal.questionProposalId, "view_brief_question_id_mismatch");
  assert(artBrief.questionProposalRef.revision === questionProposal.revision, "view_brief_question_revision_mismatch");
  assert(artBrief.questionProposalRef.stateSha256 === questionProposalSha256(questionProposal), "view_brief_question_hash_mismatch");
  const localArtCandidate = candidateInput === null ? null : normalizeLocalArtCandidate(candidateInput);
  if (localArtCandidate) {
    assert(localArtCandidate.briefRef.id === artBrief.briefId, "view_candidate_brief_id_mismatch");
    assert(localArtCandidate.briefRef.revision === artBrief.revision, "view_candidate_brief_revision_mismatch");
    assert(localArtCandidate.briefRef.stateSha256 === artBriefSha256(artBrief), "view_candidate_brief_hash_mismatch");
    assert(localArtCandidate.questionProposalRef.id === questionProposal.questionProposalId, "view_candidate_question_id_mismatch");
    assert(localArtCandidate.questionProposalRef.revision === questionProposal.revision, "view_candidate_question_revision_mismatch");
    assert(localArtCandidate.questionProposalRef.stateSha256 === questionProposalSha256(questionProposal), "view_candidate_question_hash_mismatch");
  }
  const projectionFeedback = feedbackInput === null ? null : normalizeProjectionFeedback(feedbackInput);
  const materialization = {
    kind: "observation-question-art-view",
    schemaVersion: OBSERVATION_QUESTION_ART_VIEW_VERSION,
    ontologyBoundary: "view_materialization_not_canonical_state",
    canonicalObservation: {
      stateSha256: observationStateSha256(observation),
      state: observation,
    },
    questionProposal,
    artBrief,
    localArtCandidate,
    projectionFeedback,
  };
  return `${canonicalJson({ ...materialization, materializationSha256: hash(materialization) })}\n`;
}
