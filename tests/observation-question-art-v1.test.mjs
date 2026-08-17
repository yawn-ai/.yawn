import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import Ajv2020 from "ajv/dist/2020.js";
import { hashCanonical } from "../lib/state-substrate-v1.mjs";
import {
  artBriefSha256,
  assertQuestionProposalSource,
  createQuestionProposal,
  isLocalArtCandidateReviewable,
  normalizeArtBrief,
  normalizeLocalArtCandidate,
  normalizeViewFeedback,
  viewFeedbackSha256,
  questionProposalSha256,
  serializeObservationQuestionArtView,
} from "../lib/observation-question-art-v1.mjs";

const readJson = async (path) => JSON.parse(await readFile(new URL(`../${path}`, import.meta.url), "utf8"));
const QUESTION_SHA256 = "101a7b91713d1acb45183c7994fb1cb633791496c1c89ade494e24f1ad2db88d";
const BRIEF_SHA256 = "a357446f24da08f890a8163f07e4d92fa89876858cf487737f02e6fad33298f2";

async function records() {
  return {
    observation: await readJson("fixtures/observation.v1.json"),
    chain: await readJson("fixtures/observation-question-art.v1.json"),
  };
}

function verifiedCandidateExample(chain) {
  return {
    schemaVersion: "yawn.local-art-candidate.v1",
    candidateId: "art-candidate:test-verified-output",
    revision: 1,
    briefRef: { kind: "art_brief", id: chain.artBrief.briefId, revision: chain.artBrief.revision, stateSha256: BRIEF_SHA256 },
    questionProposalRef: { kind: "question_proposal", id: chain.questionProposal.questionProposalId, revision: chain.questionProposal.revision, stateSha256: QUESTION_SHA256 },
    producedBy: { kind: "actor", id: "tool:comfyui-local-test" },
    renderer: {
      provider: "comfyui_local",
      grantId: "grant:test-verified-output",
      workflowProfileSha256: "1".repeat(64),
      workflowSha256: "2".repeat(64),
      modelOrCheckpointSha256: null,
      promptId: "prompt:test-verified-output",
      seed: chain.artBrief.render.seed,
    },
    output: {
      sha256: "3".repeat(64),
      mediaType: "image/png",
      width: chain.artBrief.render.width,
      height: chain.artBrief.render.height,
      proxyPath: "/api/local-art/test-verified-output/image/0",
    },
    accessibleDescription: chain.artBrief.accessibleDescription,
    validation: {
      descriptorValidated: true,
      bytesValidated: true,
      dimensionsValidated: true,
      sha256Validated: true,
    },
    textInspection: { status: "passed", detectedText: [] },
    evidenceStatus: "verified_local_output",
    boundary: { canonicalMutationAuthorized: false, publicationAuthorized: false, promotionAuthorized: false },
    status: "candidate",
    createdAt: "2026-08-16T16:02:00Z",
  };
}

async function standaloneValidators() {
  const ajv = new Ajv2020({ allErrors: true, strict: false, formats: { "date-time": true } });
  ajv.addSchema(await readJson("schemas/record-ref.v1.schema.json"));
  const names = {
    questionProposal: "question-proposal.v1.schema.json",
    artBrief: "art-brief.v1.schema.json",
    localArtCandidate: "local-art-candidate.v1.schema.json",
    viewFeedback: "view-feedback.v1.schema.json",
  };
  return Object.fromEntries(await Promise.all(Object.entries(names).map(async ([key, name]) => [
    key, ajv.compile(await readJson(`schemas/${name}`)),
  ])));
}

test("standalone and stable aggregate schemas accept their closed proposal records", async () => {
  const { chain } = await records();
  const standalone = await standaloneValidators();
  const aggregate = await readJson("contracts/schemas/yawn-contracts-v1.schema.json");
  const aggregateAjv = new Ajv2020({ allErrors: true, strict: false, formats: { "date-time": true, uuid: true, uri: true } });
  const aggregateNames = {
    questionProposal: "QuestionProposalV1",
    artBrief: "ArtBriefV1",
    viewFeedback: "ViewFeedbackV1",
  };
  const values = { ...chain, localArtCandidate: verifiedCandidateExample(chain) };

  for (const [key, name] of Object.entries(aggregateNames)) {
    assert.equal(standalone[key](values[key]), true, `${key}: ${JSON.stringify(standalone[key].errors)}`);
    assert.equal(standalone[key]({ ...values[key], canonicalAcceptance: true }), false);
    const validateAggregate = aggregateAjv.compile({ $ref: `#/$defs/${name}`, $defs: aggregate.$defs });
    assert.equal(validateAggregate(values[key]), true, `${name}: ${JSON.stringify(validateAggregate.errors)}`);
  }
  assert.equal(standalone.localArtCandidate(values.localArtCandidate), true, JSON.stringify(standalone.localArtCandidate.errors));
  assert.equal(standalone.localArtCandidate({ ...values.localArtCandidate, canonicalAcceptance: true }), false);
  assert.equal("LocalArtCandidateV1" in aggregate.$defs, false, "provider-specific local candidate leaked into stable aggregate");

  const wrongObservationKind = {
    ...chain.questionProposal,
    observationRef: { ...chain.questionProposal.observationRef, kind: "yawn" },
  };
  const validateQuestion = aggregateAjv.compile({ $ref: "#/$defs/QuestionProposalV1", $defs: aggregate.$defs });
  assert.equal(validateQuestion(wrongObservationKind), false);
});

test("standalone and aggregate schemas reject whitespace-only Question and Intention text", async () => {
  const { chain } = await records();
  const standalone = await standaloneValidators();
  const aggregate = await readJson("contracts/schemas/yawn-contracts-v1.schema.json");
  const ajv = new Ajv2020({ allErrors: true, strict: false, formats: { "date-time": true, uuid: true, uri: true } });
  const aggregateQuestion = ajv.compile({ $ref: "#/$defs/QuestionProposalV1", $defs: aggregate.$defs });
  const aggregateBrief = ajv.compile({ $ref: "#/$defs/ArtBriefV1", $defs: aggregate.$defs });
  const whitespaceQuestion = { ...chain.questionProposal, text: "   " };
  const whitespaceBrief = { ...chain.artBrief, visualIntention: "\t" };
  assert.equal(standalone.questionProposal(whitespaceQuestion), false);
  assert.equal(aggregateQuestion(whitespaceQuestion), false);
  assert.equal(standalone.artBrief(whitespaceBrief), false);
  assert.equal(aggregateBrief(whitespaceBrief), false);
});

test("the executable .yawn templates validate against their advertised contracts", async () => {
  const standalone = await standaloneValidators();
  const question = await readJson("templates/question-proposal.v1.yawn");
  const brief = await readJson("templates/art-brief.v1.yawn");
  assert.equal(standalone.questionProposal(question), true, JSON.stringify(standalone.questionProposal.errors));
  assert.equal(standalone.artBrief(brief), true, JSON.stringify(standalone.artBrief.errors));
  assert.deepEqual(question.source.sourceSpanIndexes, []);
  assert.equal(question.observationRef.id, brief.observationRef.id);
  assert.equal(question.questionProposalId, brief.questionProposalRef.id);
});

test("the organized question preserves exact source wording and hash", async () => {
  const { observation, chain } = await records();
  const question = assertQuestionProposalSource(observation, chain.questionProposal);
  assert.equal(question.source.verbatimText, observation.remainsOpen[0]);
  assert.deepEqual(question.source.sourceSpanIndexes, [], "remainsOpen has no substantiated raw source range");
  assert.equal(questionProposalSha256(question), QUESTION_SHA256);
  assert.equal("target" in question || "move" in question || "yawnId" in question, false);
  assert.deepEqual(createQuestionProposal({
    observation,
    questionProposalId: question.questionProposalId,
    revision: question.revision,
    sourceFieldPath: question.source.fieldPath,
    sourceSpanIndexes: question.source.sourceSpanIndexes,
    text: question.text,
    transformation: question.transformation,
    proposedBy: question.proposedBy,
    createdAt: question.createdAt,
  }), question);
  assert.throws(() => assertQuestionProposalSource(observation, {
    ...question,
    source: { ...question.source, verbatimText: "Synthetic replacement?" },
  }), /source_text_mismatch/);
  const falseRangeAttribution = {
    ...question,
    source: { ...question.source, sourceSpanIndexes: [0] },
  };
  assert.equal((await standaloneValidators()).questionProposal(falseRangeAttribution), false);
  assert.throws(() => assertQuestionProposalSource(observation, falseRangeAttribution), /source_ranges_unsubstantiated/);
});

test("the brief pins the iconic face while the Question remains live text", async () => {
  const { chain } = await records();
  const brief = chain.artBrief;
  assert.equal(artBriefSha256(brief), BRIEF_SHA256);
  assert.equal(brief.questionProposalRef.stateSha256, QUESTION_SHA256);
  assert.deepEqual(brief.textPolicy, { questionRenderedAsPixels: false, liveTextRequired: true });
  assert.equal(brief.identityAsset.crop, "face_only");
  assert.deepEqual(brief.proposedBy, { kind: "actor", id: "assistant:codex" });
  assert.equal(brief.identityAsset.sha256, "836d1f2c0661391a7aa2d9696ac6881c858e435b34a6cc0e46625fb64b32a5b5");
  assert.equal(brief.boundary.maximumPaidCostMicrousd, 0);
  assert.equal(brief.boundary.effectGrantRequired, true);
  assert.throws(() => normalizeArtBrief({
    ...brief,
    textPolicy: { ...brief.textPolicy, questionRenderedAsPixels: true },
  }), /question_pixels_forbidden/);
  assert.throws(() => normalizeArtBrief({
    ...brief,
    boundary: { ...brief.boundary, paidProviderCallAuthorized: true },
  }), /paidProviderCallAuthorized_must_be_false/);
  assert.throws(() => normalizeArtBrief({
    ...brief,
    semanticColorRoles: { ...brief.semanticColorRoles, authority: "#ffffff" },
  }), /color_role_invalid/);
  const missingProposer = { ...brief };
  delete missingProposer.proposedBy;
  assert.equal((await standaloneValidators()).artBrief(missingProposer), false);
});

test("no candidate exists before verified output, and proof still cannot self-promote", async () => {
  const { chain } = await records();
  assert.equal(chain.localArtCandidate, null);
  const candidate = verifiedCandidateExample(chain);
  assert.deepEqual(candidate.producedBy, { kind: "actor", id: "tool:comfyui-local-test" });
  assert.equal(candidate.briefRef.stateSha256, BRIEF_SHA256);
  assert.equal(isLocalArtCandidateReviewable(candidate), true);
  assert.deepEqual(candidate.boundary, {
    canonicalMutationAuthorized: false,
    publicationAuthorized: false,
    promotionAuthorized: false,
  });
  const failedTextInspection = {
    ...candidate,
    textInspection: { status: "failed", detectedText: ["unwanted pixels"] },
  };
  assert.equal(isLocalArtCandidateReviewable(failedTextInspection), false);
  assert.equal(isLocalArtCandidateReviewable({
    ...candidate,
    textInspection: { status: "pending", detectedText: [] },
  }), false);
  assert.throws(() => normalizeLocalArtCandidate({ ...candidate, evidenceStatus: "unverified_fixture" }), /evidence_status_invalid/);
  assert.throws(() => normalizeLocalArtCandidate({ ...candidate, status: "accepted" }), /status_invalid/);
  const missingProducer = { ...candidate };
  delete missingProducer.producedBy;
  assert.equal((await standaloneValidators()).localArtCandidate(missingProducer), false);
});

test("View feedback remains subjective, attributed, actionable, and sanitized", async () => {
  const { chain } = await records();
  const feedback = normalizeViewFeedback(chain.viewFeedback);
  assert.equal(feedback.assertedBy.id, "principal:fixture-reporter");
  assert.notEqual(feedback.assertedBy.id, "principal:dave", "the View reporter must not inherit the Observation observer");
  assert.equal(feedback.source.coordinate, "fixture://synthetic/view-feedback#reported-gap");
  assert.equal(feedback.source.coordinateKind, "synthetic_fixture");
  assert.equal(feedback.source.platformMessageIdVerified, false);
  assert.match(feedback.source.exactQuote, /^This synthetic fixture/);
  assert.equal(feedback.universality, "subjective_attributed_evaluation");
  assert.ok(feedback.divergenceDimensions.includes("ontology_to_interface_fidelity"));
  assert.ok(feedback.preferenceUpdateProposals.every((proposal) => proposal.status === "proposed"));
  assert.ok(feedback.proofObligations.every((proof) => proof.status === "waiting"));
  assert.match(viewFeedbackSha256(feedback), /^[a-f0-9]{64}$/);
  assert.equal(JSON.stringify(chain).includes("conversation://current/"), false);
  assert.throws(() => normalizeViewFeedback({ ...feedback, universality: "universal_fact" }), /universality_invalid/);
  assert.throws(() => normalizeViewFeedback({
    ...feedback,
    boundary: { ...feedback.boundary, automaticPreferenceApplicationAuthorized: true },
  }), /automaticPreferenceApplicationAuthorized_must_be_false/);
});

test("browser feedback is captured honestly without claiming a platform message ID", async () => {
  const { chain } = await records();
  const browserFeedback = {
    ...chain.viewFeedback,
    source: {
      ...chain.viewFeedback.source,
      coordinate: "browser://local/observation#view-feedback",
      coordinateKind: "browser_capture",
      platformMessageIdVerified: false,
    },
  };
  const normalized = normalizeViewFeedback(browserFeedback);
  assert.equal(normalized.source.coordinateKind, "browser_capture");
  const validate = (await standaloneValidators()).viewFeedback;
  assert.equal(validate(normalized), true, JSON.stringify(validate.errors));
});

test("serialization is a deterministic View materialization, not canonical state", async () => {
  const { observation, chain } = await records();
  const input = {
    observation,
    questionProposal: chain.questionProposal,
    artBrief: chain.artBrief,
    localArtCandidate: chain.localArtCandidate,
    viewFeedback: chain.viewFeedback,
  };
  const first = serializeObservationQuestionArtView(input);
  assert.equal(first, serializeObservationQuestionArtView(input));
  const parsed = JSON.parse(first);
  assert.equal(parsed.ontologyBoundary, "view_materialization_not_canonical_state");
  assert.equal(parsed.localArtCandidate, null);
  assert.equal(parsed.canonicalObservation.stateSha256, chain.canonicalObservationFixture.stateSha256);
  const { materializationSha256, ...materialization } = parsed;
  assert.equal(materializationSha256, hashCanonical(materialization).replace(/^sha256:/, ""));
  assert.throws(() => serializeObservationQuestionArtView({
    ...input,
    questionProposal: { ...chain.questionProposal, text: "A different organized question?" },
  }), /question_hash_mismatch/);
});

test("matching hashes cannot hide mismatched lineage IDs or revisions", async () => {
  const { observation, chain } = await records();
  const candidate = verifiedCandidateExample(chain);
  const input = {
    observation,
    questionProposal: chain.questionProposal,
    artBrief: chain.artBrief,
    localArtCandidate: candidate,
    viewFeedback: chain.viewFeedback,
  };
  assert.doesNotThrow(() => serializeObservationQuestionArtView(input));

  const briefRefMutation = (patch) => ({
    ...chain.artBrief,
    observationRef: { ...chain.artBrief.observationRef, ...patch },
  });
  assert.throws(() => serializeObservationQuestionArtView({
    ...input,
    artBrief: briefRefMutation({ id: "observation:same-hash-wrong-id" }),
  }), /observation_id_mismatch/);
  assert.throws(() => serializeObservationQuestionArtView({
    ...input,
    artBrief: briefRefMutation({ revision: observation.revision + 1 }),
  }), /observation_revision_mismatch/);
  assert.throws(() => normalizeArtBrief(briefRefMutation({ revision: 0 })), /observation_revision_required/);

  assert.throws(() => serializeObservationQuestionArtView({
    ...input,
    artBrief: {
      ...chain.artBrief,
      questionProposalRef: { ...chain.artBrief.questionProposalRef, id: "question-proposal:same-hash-wrong-id" },
    },
  }), /brief_question_id_mismatch/);
  assert.throws(() => serializeObservationQuestionArtView({
    ...input,
    artBrief: {
      ...chain.artBrief,
      questionProposalRef: { ...chain.artBrief.questionProposalRef, revision: chain.questionProposal.revision + 1 },
    },
  }), /brief_question_revision_mismatch/);

  assert.throws(() => serializeObservationQuestionArtView({
    ...input,
    localArtCandidate: {
      ...candidate,
      briefRef: { ...candidate.briefRef, id: "art-brief:same-hash-wrong-id" },
    },
  }), /candidate_brief_id_mismatch/);
  assert.throws(() => serializeObservationQuestionArtView({
    ...input,
    localArtCandidate: {
      ...candidate,
      briefRef: { ...candidate.briefRef, revision: chain.artBrief.revision + 1 },
    },
  }), /candidate_brief_revision_mismatch/);
  assert.throws(() => serializeObservationQuestionArtView({
    ...input,
    localArtCandidate: {
      ...candidate,
      questionProposalRef: { ...candidate.questionProposalRef, id: "question-proposal:same-hash-wrong-id" },
    },
  }), /candidate_question_id_mismatch/);
  assert.throws(() => serializeObservationQuestionArtView({
    ...input,
    localArtCandidate: {
      ...candidate,
      questionProposalRef: { ...candidate.questionProposalRef, revision: chain.questionProposal.revision + 1 },
    },
  }), /candidate_question_revision_mismatch/);
});
