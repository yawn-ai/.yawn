import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import Ajv2020 from "ajv/dist/2020.js";
import { validateSourceBoundYawnbotSemantics } from "../lib/source-bound-yawnbot-v0.1.mjs";

const readJson = async (relativePath) => JSON.parse(await readFile(new URL(relativePath, import.meta.url), "utf8"));
const evaluationSchema = await readJson("../schemas/evaluation-record.v0.1.schema.json");
const cognitionSchema = await readJson("../schemas/source-bound-yawnbot-cognition.v0.1.schema.json");
const passageSchema = await readJson("../schemas/source-bound-yawnbot-passage.v0.1.schema.json");
const governanceSchema = await readJson("../schemas/source-bound-yawnbot-governance.v0.1.schema.json");
const aggregateSchema = await readJson("../schemas/source-bound-yawnbot.v0.1.schema.json");
const fixture = await readJson("../fixtures/dave-kickstarter-nestheads.source-bound-yawnbot.v0.1.json");
const clone = (value) => structuredClone(value);

const ajv = new Ajv2020({ allErrors: true, strict: true, validateFormats: false });
for (const schema of [evaluationSchema, cognitionSchema, passageSchema, governanceSchema]) ajv.addSchema(schema);
const validateShape = ajv.compile(aggregateSchema);
const shapeErrors = () => ajv.errorsText(validateShape.errors, { separator: "\n" });
const semanticText = (document) => validateSourceBoundYawnbotSemantics(document).join("\n");
const assertShapeValid = (document) => assert.equal(validateShape(document), true, shapeErrors());

test("sanitized Dave/Kickstarter/Nestheads package validates without claiming send, Consequence, Proof, Update, or publication", () => {
  assertShapeValid(fixture);
  assert.deepEqual(validateSourceBoundYawnbotSemantics(fixture), []);
  assert.equal(fixture.coordinate, "dave/kickstarter/nestheads");
  assert.equal(fixture.projections[0].status, "draft");
  assert.equal(fixture.moves[0].status, "proposed");
  assert.deepEqual(fixture.consequences, []);
  assert.deepEqual(fixture.proofAdjudications, []);
  assert.deepEqual(fixture.updates, []);
  assert.equal(fixture.audiencePolicies[1].publicationStatus, "not_authorized");
});

test("the straight passage is a noncanonical recursive View rather than the ontology", () => {
  assert.deepEqual(fixture.traversalView.stageOrder, [
    "question",
    "position",
    "expression_provision",
    "projection",
    "move",
    "consequence",
    "evaluation",
    "proof_adjudication",
    "update",
    "question",
  ]);
  assert.equal(fixture.traversalView.canonicalState, false);
  assert.equal(fixture.boundary.defaultTraversalIsOntology, false);

  const invalid = clone(fixture);
  invalid.boundary.defaultTraversalIsOntology = true;
  assert.equal(validateShape(invalid), false);
  assert.match(shapeErrors(), /defaultTraversalIsOntology/);
});

test("exact private source text cannot be claimed without content integrity", () => {
  const invalid = clone(fixture);
  invalid.sourceRecords[0].exactTextAvailable = true;
  assertShapeValid(invalid);
  assert.match(semanticText(invalid), /exact source content requires a content hash/);
});

test("an expected outcome cannot materialize as a Consequence before execution", () => {
  const invalid = clone(fixture);
  invalid.consequences.push({
    consequenceId: "consequence:invented",
    revision: 1,
    moveRef: "move:review-reconstruct-then-send",
    observerRef: "agent:openai:gpt-5.6-pro",
    description: "Backers received the message.",
    epistemicStatus: "reported",
    confidence: 0.5,
    sourceRefs: ["source:conversation:2026-09-01-kickstarter"],
    status: "reported",
    observedAt: "2026-09-02T00:31:00Z",
    createdAt: "2026-09-02T00:31:00Z"
  });
  assertShapeValid(invalid);
  assert.match(semanticText(invalid), /not executed/);
});

test("a generated cognitive facet cannot ratify itself", () => {
  const invalid = clone(fixture);
  invalid.modelFacets[1].status = "ratified";
  invalid.modelFacets[1].ratificationEventRef = null;
  assertShapeValid(invalid);
  assert.match(semanticText(invalid), /ratified facet requires a ratification event/);
});

test("a compiler proposal cannot become accepted without a disposition event", () => {
  const invalid = clone(fixture);
  invalid.compilerProposals[0].status = "accepted";
  invalid.compilerProposals[0].dispositionEventRef = null;
  assertShapeValid(invalid);
  assert.match(semanticText(invalid), /accepted proposal requires an attributed disposition event/);
});

test("a proposed Move cannot smuggle in selection, choice, authority, or execution", () => {
  const invalid = clone(fixture);
  invalid.moves[0].authorityGrantRefs = ["grant:self-issued"];
  assertShapeValid(invalid);
  assert.match(semanticText(invalid), /proposed Move cannot claim selection, choice, authority, or execution/);
});

test("publication intent cannot make a public View authorized or published", () => {
  const invalid = clone(fixture);
  const policy = invalid.audiencePolicies[1];
  policy.visibility = "public";
  policy.disclosureIntent = "publish";
  policy.publicationStatus = "not_authorized";
  assertShapeValid(invalid);
  assert.match(semanticText(invalid), /public visibility requires published status/);
});

test("recursive inquiry can branch but Question parentage cannot cycle", () => {
  const invalid = clone(fixture);
  invalid.questions[0].parentQuestionRef = invalid.questions[1].questionId;
  invalid.questions[1].parentQuestionRef = invalid.questions[0].questionId;
  assertShapeValid(invalid);
  assert.match(semanticText(invalid), /cycle detected/);
});

test("a character representation cannot be reified as an Agent by the package", () => {
  const invalid = clone(fixture);
  invalid.characterViews[0].agentRef = "agent:nestheads:context-character";
  assert.equal(validateShape(invalid), false);
  assert.match(shapeErrors(), /agentRef/);
});

test("an Evaluation cannot grant its own Proof or authority", () => {
  const invalid = clone(fixture);
  invalid.evaluations[0].boundary.proofGrantedByThisRecord = true;
  assert.equal(validateShape(invalid), false);
  assert.match(shapeErrors(), /proofGrantedByThisRecord/);
});

test("a draft Projection cannot become expressed without an expression event", () => {
  const invalid = clone(fixture);
  invalid.projections[0].status = "expressed";
  invalid.projections[0].expressionEventRef = null;
  assertShapeValid(invalid);
  assert.match(semanticText(invalid), /expressed Projection requires an expression event/);
});

test("a Projection cannot exceed the kinds, Arena, or audience provisioned for it", () => {
  const invalidKind = clone(fixture);
  invalidKind.projections[0].projectionKind = "image";
  assertShapeValid(invalidKind);
  assert.match(semanticText(invalidKind), /is not allowed by/);

  const invalidArena = clone(fixture);
  invalidArena.projections[0].targetArenaRef = "arena:somewhere-else";
  assertShapeValid(invalidArena);
  assert.match(semanticText(invalidArena), /Projection Arena must match/);
});

test("an active runtime binding requires an Agent, grant, activation receipt, and matching lifecycle", () => {
  const invalid = clone(fixture);
  invalid.lifecycleState = "active";
  invalid.runtimeBinding.status = "active";
  invalid.runtimeBinding.agentRef = "agent:dave:kickstarter:nestheads";
  assertShapeValid(invalid);
  assert.match(semanticText(invalid), /active runtime requires Agent, authority grant, and activation receipt/);
});

test("an accepted Position requires a distinct acceptance event", () => {
  const invalid = clone(fixture);
  invalid.positions[0].status = "accepted";
  invalid.positions[0].acceptanceEventRef = null;
  assertShapeValid(invalid);
  assert.match(semanticText(invalid), /accepted Position requires an acceptance event/);
});

test("Proof may support an Update but cannot authorize that Update", () => {
  const invalid = clone(fixture);
  invalid.proofAdjudications.push({
    proofAdjudicationId: "proof-adjudication:test",
    revision: 1,
    contractRef: "proof-contract:test",
    targetRefs: ["projection:founder-update:draft"],
    evidenceRefs: ["source:conversation:2026-09-01-kickstarter"],
    adjudicatedBy: "agent:openai:gpt-5.6-pro",
    result: "insufficient",
    rationale: "The draft exists, but no send or delivery evidence exists.",
    sourceRefs: ["source:conversation:2026-09-01-kickstarter"],
    canonicalUpdateAuthorizedByThisRecord: false,
    createdAt: "2026-09-02T00:32:00Z"
  });
  invalid.updates.push({
    updateId: "update:test",
    revision: 1,
    targetRef: "position:dave:kickstarter:context-not-absolution",
    supersedesRevisionRef: null,
    patchSummary: "Pretend the Position is now canonical.",
    proofAdjudicationRefs: ["proof-adjudication:test"],
    authorizationEventRef: null,
    sourceRefs: ["source:conversation:2026-09-01-kickstarter"],
    status: "authorized",
    createdAt: "2026-09-02T00:32:00Z"
  });
  assertShapeValid(invalid);
  assert.match(semanticText(invalid), /authorized Update requires separate authorization/);
});

test("a relation may connect outward, but cannot float entirely outside its package", () => {
  const valid = clone(fixture);
  valid.relations.push({
    relationId: "relation:model:external-yawnbot",
    fromRef: "model:dave:kickstarter:nestheads",
    toRef: "model:external:backer-perspective",
    relationType: "related_to",
    assertedBy: "principal:dave",
    epistemicStatus: "reported",
    confidence: 0.7,
    sourceRefs: ["source:conversation:2026-09-01-kickstarter"],
    status: "proposed",
    createdAt: "2026-09-02T00:33:00Z"
  });
  assertShapeValid(valid);
  assert.deepEqual(validateSourceBoundYawnbotSemantics(valid), []);

  const invalid = clone(fixture);
  invalid.relations.push({
    relationId: "relation:external:external",
    fromRef: "model:external:a",
    toRef: "model:external:b",
    relationType: "related_to",
    assertedBy: "principal:dave",
    epistemicStatus: "reported",
    confidence: 0.5,
    sourceRefs: ["source:conversation:2026-09-01-kickstarter"],
    status: "proposed",
    createdAt: "2026-09-02T00:33:00Z"
  });
  assertShapeValid(invalid);
  assert.match(semanticText(invalid), /at least one relation endpoint must belong to this package/);
});

test("conflicting attributed Evaluations can coexist without either becoming truth", () => {
  const valid = clone(fixture);
  const dissent = clone(valid.evaluations[0]);
  dissent.evaluationId = "evaluation:founder-update:dissent";
  dissent.evaluatorRef = "principal:synthetic-reviewer";
  dissent.overallAssessment = "unfavorable";
  dissent.confidence = 0.6;
  dissent.dissentingEvaluationRefs = ["evaluation:founder-update:draft-readiness"];
  dissent.criteria = dissent.criteria.map((criterion) => ({
    ...criterion,
    criterionId: `${criterion.criterionId}:dissent`
  }));
  dissent.judgments = dissent.judgments.map((judgment) => ({
    ...judgment,
    criterionRef: `${judgment.criterionRef}:dissent`,
    assessment: "mixed",
    confidence: 0.55
  }));
  valid.evaluations.push(dissent);
  assertShapeValid(valid);
  assert.deepEqual(validateSourceBoundYawnbotSemantics(valid), []);
});
