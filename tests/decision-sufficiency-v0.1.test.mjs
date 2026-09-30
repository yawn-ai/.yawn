import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { isDeepStrictEqual } from "node:util";
import test from "node:test";
import Ajv2020 from "ajv/dist/2020.js";
import { canonicalSha256, evaluateActionGate } from "../lib/delegated-execution-v1.mjs";
import {
  analyzeProjection, inspectReceiptApplicability, projectState, receiptSha256,
} from "../lib/decision-sufficiency-v0.1.mjs";
import {
  buildDecisionSufficiencyExperiment, gateInputForState,
} from "../scripts/generate-decision-sufficiency-v0.1.mjs";

const readJson = async (path) => JSON.parse(await readFile(new URL(`../${path}`, import.meta.url), "utf8"));

async function receiptValidator() {
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  ajv.addSchema(await readJson("schemas/action-signature.v1.schema.json"));
  const validate = ajv.compile(await readJson("schemas/decision-sufficiency-receipt.v0.1.schema.json"));
  return { validate, errors: () => ajv.errorsText(validate.errors, { separator: "\n" }) };
}

const row = (id, attributes) => ({ id, attributes });
const sameView = (left, right, fields) => fields.every((field) =>
  isDeepStrictEqual(left.attributes[field], right.attributes[field]));
const homogeneous = (states, fields, decide) => states.every((left) =>
  states.every((right) => !sameView(left, right, fields) || decide(left) === decide(right)));
const normalizedSets = (sets) => sets.map((fields) => [...fields].sort()).sort((a, b) =>
  JSON.stringify(a).localeCompare(JSON.stringify(b), "en"));
const subsets = (fields) => Array.from({ length: 2 ** fields.length }, (_, mask) =>
  fields.filter((_, index) => (mask & (1 << index)) !== 0));

// This oracle checks every pair directly. It does not call the implementation's
// projection, grouping, witness, or subset-search helpers.
function verifyAnalysis(result, states, visibleFields, candidateFields, decide) {
  const byId = new Map(states.map((state) => [state.id, state]));
  const seen = new Set();
  const fiberIndexByState = new Map();
  result.fibers.forEach((fiber, fiberIndex) => {
    assert.ok(fiber.stateRefs.length > 0, "an emitted fiber must be inhabited");
    const members = fiber.stateRefs.map((id) => {
      assert.ok(byId.has(id), `unknown state ${id}`);
      assert.ok(!seen.has(id), `state ${id} occurs in more than one fiber`);
      seen.add(id);
      fiberIndexByState.set(id, fiberIndex);
      return byId.get(id);
    });
    for (const state of members) {
      assert.ok(sameView(members[0], state, visibleFields));
      assert.deepEqual(fiber.visibleValue, Object.fromEntries(visibleFields.map((field) =>
        [field, state.attributes[field]])));
    }
    const decisions = [...new Set(members.map(decide))].sort();
    assert.deepEqual([...fiber.decisionValues].sort(), decisions);
    const decisionState = decisions.length === 1 ? decisions[0] : "needs_refinement";
    assert.equal(fiber.decisionState, decisionState);
    assert.equal(fiber.enforcementDisposition, decisionState === "executable" ? "allow" : "block");
    if (decisions.length === 1) {
      assert.equal(fiber.ambiguityWitness, null);
      assert.equal(fiber.refinement, null);
      return;
    }
    const witness = fiber.ambiguityWitness;
    assert.ok(witness, "mixed decisions require an ambiguity witness");
    const left = byId.get(witness.leftStateRef);
    const right = byId.get(witness.rightStateRef);
    assert.ok(members.includes(left) && members.includes(right));
    assert.ok(sameView(left, right, visibleFields));
    assert.notEqual(decide(left), decide(right));
    const differingFields = Object.keys(left.attributes).filter((field) =>
      !isDeepStrictEqual(left.attributes[field], right.attributes[field])).sort();
    assert.deepEqual([...witness.differingFields].sort(), differingFields);

    const sufficient = subsets(candidateFields).filter((fields) =>
      homogeneous(members, [...visibleFields, ...fields], decide));
    assert.ok(sufficient.length > 0, "test population must be refinable");
    const minimumCardinality = Math.min(...sufficient.map((fields) => fields.length));
    const allMinima = normalizedSets(sufficient.filter((fields) => fields.length === minimumCardinality));
    assert.equal(fiber.refinement.minimumCardinality, minimumCardinality);
    assert.deepEqual(normalizedSets(fiber.refinement.allMinimumRefinements), allMinima);
    assert.deepEqual(fiber.refinement.canonicalRefinement, allMinima[0]);
    assert.equal(fiber.refinement.necessityWitnesses.length, minimumCardinality);
    assert.deepEqual(fiber.refinement.necessityWitnesses.map((item) => item.field).sort(),
      [...allMinima[0]].sort());
    for (const item of fiber.refinement.necessityWitnesses) {
      const withoutField = [...visibleFields, ...allMinima[0].filter((field) => field !== item.field)];
      const witnessLeft = byId.get(item.leftStateRef);
      const witnessRight = byId.get(item.rightStateRef);
      assert.ok(members.includes(witnessLeft) && members.includes(witnessRight));
      assert.ok(sameView(witnessLeft, witnessRight, withoutField), `${item.field} necessity was not shown`);
      assert.notEqual(decide(witnessLeft), decide(witnessRight));
    }
  });
  assert.equal(seen.size, states.length);
  for (const left of states) for (const right of states) {
    assert.equal(fiberIndexByState.get(left.id) === fiberIndexByState.get(right.id),
      sameView(left, right, visibleFields), "fiber partition disagrees with visible equality");
  }
  assert.equal(result.globallySufficient, homogeneous(states, visibleFields, decide));
}

test("every Boolean decision on three bits is exact or unresolved at every resolution", () => {
  const fields = ["a", "b", "c"];
  const states = Array.from({ length: 8 }, (_, value) => row(`state:${value}`, {
    a: Boolean(value & 1), b: Boolean(value & 2), c: Boolean(value & 4),
  }));
  for (let truthTable = 0; truthTable < 256; truthTable += 1) {
    const decide = (state) => {
      const index = Number(state.attributes.a) + 2 * Number(state.attributes.b) + 4 * Number(state.attributes.c);
      return (truthTable & (1 << index)) !== 0 ? "executable" : "blocked";
    };
    for (const visibleFields of subsets(fields)) {
      const candidateFields = fields.filter((field) => !visibleFields.includes(field));
      const result = analyzeProjection({ states, visibleFields, candidateFields, decide });
      verifyAnalysis(result, states, visibleFields, candidateFields, decide);
    }
  }
});

test("minimum cardinality excludes a larger inclusion-minimal refinement and preserves ties", () => {
  const states = [0, 1, 2, 3].map((value) => row(`state:${value}`, {
    a: value === 3, alternative: value === 3, b: Boolean(value & 1), c: Boolean(value & 2),
  }));
  const decide = (state) => state.attributes.b && state.attributes.c ? "executable" : "blocked";
  const candidateFields = ["c", "alternative", "b", "a"];
  const result = analyzeProjection({ states, visibleFields: [], candidateFields, decide });
  verifyAnalysis(result, states, [], candidateFields, decide);
  assert.deepEqual(result.fibers[0].refinement.allMinimumRefinements, [["a"], ["alternative"]]);
  assert.deepEqual(result.fibers[0].refinement.canonicalRefinement, ["a"]);
  assert.ok(homogeneous(states, ["b", "c"], decide));
  assert.ok(!homogeneous(states, ["b"], decide) && !homogeneous(states, ["c"], decide));
});

test("each coarse fiber can require a different refinement", () => {
  const states = Array.from({ length: 8 }, (_, value) => row(`state:${value}`, {
    context: Boolean(value & 1), x: Boolean(value & 2), y: Boolean(value & 4),
  }));
  const decide = (state) => (state.attributes.context ? state.attributes.x : state.attributes.y)
    ? "executable" : "blocked";
  const result = analyzeProjection({ states, visibleFields: ["context"], candidateFields: ["x", "y"], decide });
  verifyAnalysis(result, states, ["context"], ["x", "y"], decide);
  for (const fiber of result.fibers) {
    assert.deepEqual(fiber.refinement.canonicalRefinement, [fiber.visibleValue.context ? "x" : "y"]);
  }
});

test("reordering states, attributes, and field declarations cannot change the receipt analysis", () => {
  const states = [0, 1, 2, 3].map((value) => row(`state:${value}`, {
    summary: { approved: true, label: "synthetic" }, a: Boolean(value & 1), b: Boolean(value & 2),
  }));
  const decide = (state) => state.attributes.a !== state.attributes.b ? "executable" : "blocked";
  const forward = analyzeProjection({ states, visibleFields: ["summary"], candidateFields: ["a", "b"], decide });
  const reversed = states.toReversed().map((state) => row(state.id, {
    b: state.attributes.b, a: state.attributes.a, summary: { label: "synthetic", approved: true },
  }));
  assert.deepEqual(analyzeProjection({ states: reversed, visibleFields: ["summary"], candidateFields: ["b", "a"], decide }), forward);
  assert.equal(forward.fibers.length, 1);
});

test("projection distinguishes JSON types and exposes only declared attributes", () => {
  const attributes = { zero: 0, boolean: false, absent: null, string: "0", hidden: "private fixture value" };
  assert.deepEqual(projectState(attributes, ["string", "absent", "boolean", "zero"]), {
    string: "0", absent: null, boolean: false, zero: 0,
  });
  const states = [0, "0", false, null].map((value, index) => row(`state:${index}`, { value }));
  const decide = (state) => state.attributes.value === 0 ? "executable" : "blocked";
  const result = analyzeProjection({ states, visibleFields: ["value"], candidateFields: [], decide });
  assert.equal(result.fibers.length, 4);
  verifyAnalysis(result, states, ["value"], [], decide);
  for (const invalid of [null, false, "source", [], new Date(0)]) {
    assert.throws(() => projectState(invalid, []));
  }
  assert.throws(() => projectState(attributes, ["missing"]));
});

test("empty or malformed populations cannot yield an exact conclusion", () => {
  const valid = { states: [row("one", { a: false }), row("two", { a: true })],
    visibleFields: [], candidateFields: ["a"], decide: (state) => state.attributes.a ? "executable" : "blocked" };
  for (const change of [
    { states: [] },
    { states: [row("same", { a: false }), row("same", { a: true })] },
    { states: [row("", { a: true })] },
    { states: [row("one", {}), row("two", { a: true })] },
    { visibleFields: ["a", "a"], candidateFields: [] },
    { candidateFields: ["a", "a"] },
    { visibleFields: ["a"], candidateFields: ["a"] },
    { candidateFields: ["unknown"] },
    { decide: () => "allow" },
    { decide: () => undefined },
    { decide: () => Promise.resolve("executable") },
  ]) assert.throws(() => analyzeProjection({ ...valid, ...change }));
  for (const field of ["visibleFields", "candidateFields"]) {
    assert.throws(() => analyzeProjection({
      states: [row("one", { undefined: true })], visibleFields: [], candidateFields: [],
      decide: () => "blocked", [field]: Array(1),
    }));
  }
});

test("an unresolvable candidate set remains unresolved and blocks", () => {
  const result = analyzeProjection({
    states: [row("one", { a: true }), row("two", { a: true })],
    visibleFields: [], candidateFields: ["a"],
    decide: (state) => state.id === "one" ? "executable" : "blocked",
  });
  assert.equal(result.globallySufficient, false);
  assert.equal(result.fibers[0].decisionState, "needs_refinement");
  assert.equal(result.fibers[0].enforcementDisposition, "block");
  assert.deepEqual(result.fibers[0].refinement, {
    minimumCardinality: null, allMinimumRefinements: [], canonicalRefinement: [], necessityWitnesses: [],
  });
});

test("non-JSON values that would collapse during serialization are rejected", () => {
  for (const value of [undefined, NaN, Infinity, -Infinity, -0, 1n, () => true, Symbol("hidden"), Array(1)]) {
    assert.throws(() => analyzeProjection({ states: [row("one", { a: value })],
      visibleFields: ["a"], candidateFields: [], decide: () => "blocked" }));
  }
  const circular = {};
  circular.self = circular;
  assert.throws(() => analyzeProjection({ states: [row("one", { a: circular })],
    visibleFields: ["a"], candidateFields: [], decide: () => "blocked" }));
});

test("each reference result is captured once and callback mutation cannot rewrite the source", () => {
  const states = [row("one", { a: false }), row("two", { a: true })];
  const original = structuredClone(states);
  const calls = [];
  const result = analyzeProjection({ states, visibleFields: [], candidateFields: ["a"], decide: (state) => {
    calls.push(state.id);
    const decision = state.attributes.a ? "executable" : "blocked";
    state.attributes.a = "callback changed its own copy";
    return decision;
  } });
  assert.deepEqual(calls.sort(), ["one", "two"]);
  assert.deepEqual(states, original);
  assert.deepEqual(result.fibers[0].refinement.canonicalRefinement, ["a"]);
  assert.throws(() => analyzeProjection({ states, visibleFields: [], candidateFields: ["a"], decide: () => {
    throw new Error("reference evaluator failed");
  } }), /reference evaluator failed/);
});

test("the stored experiment regenerates exactly and all decisions come from the existing gate", async () => {
  const artifact = await readJson("fixtures/decision-sufficiency.v0.1.json");
  assert.deepEqual(await buildDecisionSufficiencyExperiment(), artifact);
  const baseline = await readJson("fixtures/delegated-execution.v1.json");
  const combinations = new Set();
  for (const state of artifact.states) {
    const a = state.attributes;
    combinations.add(JSON.stringify(Object.keys(artifact.domains).map((field) => a[field])));
    const input = {
      relationship: structuredClone(baseline.relationship),
      request: { approvalBasis: a.approval_basis, effectSignature: structuredClone(artifact.query.effectSignature) },
      observedHeadSha: a.observed_head_sha,
      passedProofKinds: a.passed_proof_kinds,
      policy: structuredClone(baseline.policyProposal),
    };
    input.relationship.status = a.relationship_status;
    input.relationship.authority.selfAuthorizationAllowed = a.self_authorization_allowed;
    input.policy.status = a.policy_status;
    input.policy.effectSignature.repository = a.policy_repository;
    const evaluated = evaluateActionGate(input);
    assert.equal(state.referenceDecision, evaluated.executable ? "executable" : "blocked");
    assert.deepEqual(state.blockers, evaluated.blockers);
  }
  assert.equal(combinations.size, 256, "the fixture must cover the entire independent binary product");
  assert.equal(artifact.states.length, 256);
  assert.equal(artifact.states.filter((state) => state.referenceDecision === "executable").length, 2);
  assert.equal(artifact.experiment.fixtureIsSynthetic, true);
  assert.equal(artifact.experiment.liveEffects, false);
  assert.equal(artifact.experiment.normativeAuthority, "none");
});

test("the exported ambiguity and seven-field refinement survive independent pairwise verification", async () => {
  const artifact = await readJson("fixtures/decision-sufficiency.v0.1.json");
  const fibers = artifact.receipts.map((receipt) => ({
    ...receipt.fiber, ...receipt.result, ambiguityWitness: receipt.ambiguityWitness, refinement: receipt.refinement,
  }));
  const decide = (state) => state.referenceDecision;
  verifyAnalysis({ globallySufficient: false, fibers }, artifact.states,
    artifact.projection.visibleFields, artifact.projection.candidateFields, decide);
  const receipt = artifact.receipts[0];
  assert.equal(receipt.refinement.minimumCardinality, 7);
  assert.ok(!receipt.refinement.canonicalRefinement.includes("display_label"));
  const visibleFields = [...artifact.projection.visibleFields, ...receipt.refinement.canonicalRefinement];
  verifyAnalysis({ globallySufficient: true, fibers: artifact.refinedFibers }, artifact.states,
    visibleFields, [], decide);
  assert.equal(artifact.refinedFibers.length, 128);
  assert.equal(artifact.refinedFibers.filter((fiber) => fiber.decisionState === "executable").length, 1);
  assert.equal(artifact.refinedFibers.filter((fiber) => fiber.decisionState === "needs_refinement").length, 0);
  for (const value of Object.values(receipt.boundaries)) assert.equal(typeof value, "boolean");
  assert.equal(receipt.boundaries.receiptGrantsAuthority, false);
  assert.equal(receipt.boundaries.projectionGrantsAuthority, false);
  assert.equal(receipt.boundaries.refinementGrantsDisclosure, false);
});

test("changing any current binding makes the receipt stale without changing its historical content", async () => {
  const { receipts: [receipt] } = await readJson("fixtures/decision-sufficiency.v0.1.json");
  const original = structuredClone(receipt);
  assert.deepEqual(inspectReceiptApplicability(receipt, receipt.bindings), receipt.result);
  for (const field of ["stateSpaceSha256", "querySha256", "projectionSha256", "evaluatorSha256"]) {
    const current = { ...receipt.bindings, [field]: "f".repeat(64) };
    assert.notEqual(current[field], receipt.bindings[field]);
    assert.deepEqual(inspectReceiptApplicability(receipt, current), {
      decisionState: "stale", enforcementDisposition: "block",
    });
    delete current[field];
    assert.deepEqual(inspectReceiptApplicability(receipt, current), {
      decisionState: "invalid", enforcementDisposition: "block",
    });
  }
  assert.deepEqual(receipt, original);
  assert.equal(receiptSha256(receipt), receipt.replay.receiptSha256);
  assert.deepEqual(inspectReceiptApplicability(receipt, receipt.bindings), receipt.result);
});

test("tampering fails integrity, while recomputation is required to detect a self-rehashed false claim", async () => {
  const artifact = await readJson("fixtures/decision-sufficiency.v0.1.json");
  const receipt = structuredClone(artifact.receipts[0]);
  receipt.result = { decisionState: "executable", enforcementDisposition: "allow" };
  assert.deepEqual(inspectReceiptApplicability(receipt, receipt.bindings), {
    decisionState: "invalid", enforcementDisposition: "block",
  });
  receipt.replay.receiptSha256 = receiptSha256(receipt);
  // A plain hash is neither a signature nor a verifier of the mathematical claim.
  assert.deepEqual(inspectReceiptApplicability(receipt, receipt.bindings), receipt.result);
  const recomputed = await buildDecisionSufficiencyExperiment();
  assert.notDeepEqual(receipt, recomputed.receipts[0]);
  assert.equal(recomputed.receipts[0].result.decisionState, "needs_refinement");
  assert.equal(recomputed.receipts[0].result.enforcementDisposition, "block");
});

test("receipt applicability pins the baseline and adapter as well as the gate implementation", async () => {
  const artifact = await readJson("fixtures/decision-sufficiency.v0.1.json");
  const baseline = await readJson("fixtures/delegated-execution.v1.json");
  const state = artifact.states.find((item) => item.referenceDecision === "executable");
  const receipt = artifact.receipts[0];
  assert.equal(evaluateActionGate(gateInputForState(state, baseline, artifact.query)).executable, true);
  const changedBaseline = structuredClone(baseline);
  changedBaseline.policyProposal.effectSignature.headSha = "f".repeat(40);
  const changedResult = evaluateActionGate(gateInputForState(state, changedBaseline, artifact.query));
  assert.equal(changedResult.executable, false);
  assert.ok(changedResult.blockers.includes("headSha_mismatch"));
  const dependencies = receipt.referenceEvaluator.dependencies;
  assert.equal(dependencies.gateSourceSha256, artifact.referenceEvaluator.sourceSha256);
  assert.equal(dependencies.sourceFixtureSha256, canonicalSha256(baseline));
  assert.equal(dependencies.adapterSha256, artifact.instrument.generatorSha256);
  assert.equal(receipt.bindings.evaluatorSha256, canonicalSha256(dependencies));
  for (const changed of [
    { ...dependencies, sourceFixtureSha256: canonicalSha256(changedBaseline) },
    { ...dependencies, adapterSha256: "f".repeat(64) },
  ]) {
    const currentBindings = { ...receipt.bindings, evaluatorSha256: canonicalSha256(changed) };
    assert.deepEqual(inspectReceiptApplicability(receipt, currentBindings), {
      decisionState: "stale", enforcementDisposition: "block",
    });
  }
});

test("generated receipts satisfy the strict experimental receipt schema", async () => {
  const artifact = await readJson("fixtures/decision-sufficiency.v0.1.json");
  const { validate, errors } = await receiptValidator();
  for (const receipt of artifact.receipts) assert.equal(validate(receipt), true, errors());
});

test("invalid receipt examples reject invented authority, lost witnesses, and inconsistent outcomes", async () => {
  const invalid = await readJson("fixtures/decision-sufficiency-receipt.v0.1.invalid.json");
  const artifact = await readJson(invalid.baseArtifactPath);
  const { validate, errors } = await receiptValidator();
  for (const example of invalid.invalidCases) {
    const record = structuredClone(example.recordPath.split("/").reduce((value, field) => value[field], artifact));
    for (const mutation of example.mutations) {
      const path = mutation.path.split("/").slice(1).map((segment) => segment.replaceAll("~1", "/").replaceAll("~0", "~"));
      const parent = path.slice(0, -1).reduce((value, field) => value[field], record);
      parent[path.at(-1)] = mutation.value;
    }
    assert.equal(validate(record), false, example.name);
    assert.match(errors(), new RegExp(example.errorPattern), example.name);
  }
});
