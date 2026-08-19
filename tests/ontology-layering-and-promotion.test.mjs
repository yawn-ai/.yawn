import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

import {
  loadCanonicalExplainerExample,
  loadLayeringContract,
  validateExplainerBrief,
  validateLayeringContract,
} from "../scripts/validate-ontology-layering.mjs";

const humanContractPath = new URL("../core/ONTOLOGY_LAYERING_AND_PROMOTION.yawn", import.meta.url);
const agentInstructionsPath = new URL("../AGENTS.md", import.meta.url);
const explainerContractPath = new URL("../interface/yawn-explainer-brief-v1.yawn", import.meta.url);
const ontologyPath = new URL("../spec/ontology.md", import.meta.url);

test("the ontology contract keeps substrate, operation, governance, and View layers distinct", async () => {
  const contract = await loadLayeringContract();
  assert.deepEqual(validateLayeringContract(contract), []);

  assert.equal(contract.terms.coupling, "substrate");
  assert.equal(contract.terms.relationship, "substrate");
  assert.equal(contract.terms.orientation, "epistemic_operation");
  assert.equal(contract.terms.graduation, "governance");
  assert.equal(contract.terms.video, "projection");
  assert.equal(contract.crossLayerTerms.agency.classification, "cross_layer_capacity");
});

test("the canonical coupling-first explainer brief passes", async () => {
  const [contract, brief] = await Promise.all([
    loadLayeringContract(),
    loadCanonicalExplainerExample(),
  ]);

  assert.deepEqual(validateExplainerBrief(brief, contract), []);
  assert.equal(brief.rootSubject.term, "relationship");
  assert.deepEqual(brief.headlineTerms, ["coupling", "relationship"]);
  assert.deepEqual(brief.internalFlywheel, ["graduation"]);
  assert.equal(brief.terminalGoalOwner, "rightful_human_or_collective");
});

test("a graduation-first whole-system explainer is rejected", async () => {
  const [contract, validBrief] = await Promise.all([
    loadLayeringContract(),
    loadCanonicalExplainerExample(),
  ]);

  const invalidBrief = structuredClone(validBrief);
  invalidBrief.rootSubject = {
    term: "graduation",
    layer: "governance",
    statement: "Agents graduate toward goals.",
  };
  invalidBrief.headlineTerms = ["graduation"];
  invalidBrief.publicPurpose = "Graduate agents toward goals.";

  const errors = validateExplainerBrief(invalidBrief, contract);
  assert.ok(errors.some((error) => /downstream \(governance\)/.test(error)));
  assert.ok(errors.some((error) => /Headline term graduation/.test(error)));
  assert.ok(errors.some((error) => /internal flywheel/.test(error)));
});

test("an orientation-first whole-system explainer is rejected", async () => {
  const [contract, validBrief] = await Promise.all([
    loadLayeringContract(),
    loadCanonicalExplainerExample(),
  ]);

  const invalidBrief = structuredClone(validBrief);
  invalidBrief.rootSubject = {
    term: "orientation",
    layer: "epistemic_operation",
    statement: "Orientation is the substrate.",
  };
  invalidBrief.headlineTerms = ["orientation"];
  invalidBrief.primaryLoop = [
    "orientation",
    "relationship",
    "observation",
    "intention",
    "move",
    "consequence",
    "proof",
    "updated_relationship",
  ];

  const errors = validateExplainerBrief(invalidBrief, contract);
  assert.ok(errors.some((error) => /downstream \(epistemic_operation\)/.test(error)));
  assert.ok(errors.some((error) => /relationship before orientation/.test(error)));
});

test("terminal goals cannot be reassigned to the system", async () => {
  const [contract, validBrief] = await Promise.all([
    loadLayeringContract(),
    loadCanonicalExplainerExample(),
  ]);

  const invalidBrief = structuredClone(validBrief);
  invalidBrief.terminalGoalOwner = "system";

  assert.ok(
    validateExplainerBrief(invalidBrief, contract)
      .some((error) => /rightful human or collective/.test(error)),
  );
});

test("human, agent, interface, and ontology documents preserve the regression boundary", async () => {
  const [humanContract, agents, explainerContract, ontology] = await Promise.all([
    readFile(humanContractPath, "utf8"),
    readFile(agentInstructionsPath, "utf8"),
    readFile(explainerContractPath, "utf8"),
    readFile(ontologyPath, "utf8"),
  ]);

  assert.match(humanContract, /\*\*Graduation\*\* is an L3 governance mechanism/);
  assert.match(humanContract, /Emphasis, excitement, repetition, rhetorical polish/);
  assert.match(agents, /internal flywheel/);
  assert.match(agents, /Do not infer semantic hierarchy from emotional emphasis or frequency alone/);
  assert.match(explainerContract, /rootSubject\.layer.*MUST be `substrate`/s);
  assert.match(explainerContract, /Audio clarifies temporal movement\. It does not authorize a new ontology/);
  assert.match(ontology, /Coupling is the dependency and influence skeleton/);
  assert.match(ontology, /Graduation is a governance policy, not the ontology root or public purpose/);
});
