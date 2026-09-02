import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import Ajv2020 from "ajv/dist/2020.js";

const readJson = async (relativePath) =>
  JSON.parse(await readFile(new URL(relativePath, import.meta.url), "utf8"));

const [relationSchema, observationSchema, fixture] = await Promise.all([
  readJson("../schemas/relation-address.v0.1.schema.json"),
  readJson("../schemas/relational-observation.v0.1.schema.json"),
  readJson("../fixtures/dave-observation-relation-address.v0.1.json"),
]);

const ajv = new Ajv2020({ allErrors: true, strict: true, validateFormats: false });
const validateRelationAddress = ajv.compile(relationSchema);
const validateRelationalObservation = ajv.compile(observationSchema);

test("relation addresses and relational observation validate", () => {
  for (const address of fixture.relationAddresses) {
    assert.equal(
      validateRelationAddress(address),
      true,
      ajv.errorsText(validateRelationAddress.errors),
    );
  }
  assert.equal(
    validateRelationalObservation(fixture.relationalObservation),
    true,
    ajv.errorsText(validateRelationalObservation.errors),
  );
});

test("the trailing slash is an intentionally open relation port", () => {
  const open = fixture.relationAddresses.find((address) => address.portState === "open");
  assert.ok(open);
  assert.equal(open.displayPath, "yawn.bot/dave/");
  assert.equal(open.targetAbsence, "intentional_unbound");
  assert.deepEqual(open.steps, []);
  assert.equal(open.foregroundRelationRef, null);
  assert.equal(open.boundary.openPortIsPureConsciousness, false);
});

test("a slash path does not establish ancestry unless the step is primary_parent", () => {
  const bound = fixture.relationAddresses.find((address) => address.portState === "engaged");
  assert.ok(bound);
  assert.equal(bound.steps.length, 1);
  assert.equal(bound.steps[0].relationType, "holds_model_of");
  assert.equal(bound.steps[0].semanticParentage, false);

  const illegal = structuredClone(bound);
  illegal.steps[0].semanticParentage = true;
  assert.equal(validateRelationAddress(illegal), false);
});

test("observer and observed remain roles without multiplying Agent identity", () => {
  const observation = fixture.relationalObservation;
  assert.equal(observation.observerRef, "agent:dave");
  assert.ok(observation.participationRoles.includes("self_observer"));
  assert.equal(observation.boundary.observerRoleCreatesAgent, false);
  assert.equal(observation.boundary.selfObservationIsIndependentCorroboration, false);
});

test("relation direction does not grant consent, truth, or authority", () => {
  for (const address of fixture.relationAddresses) {
    assert.equal(address.boundary.pathProvesIdentity, false);
    assert.equal(address.boundary.pathProvesConsent, false);
    assert.equal(address.boundary.pathGrantsAuthority, false);
    assert.equal(address.boundary.canonicalMutationAuthorized, false);
  }
});

test("same-episode reflection is not counted as independent corroboration", () => {
  assert.equal(
    fixture.relationalObservation.independenceClass,
    "first_person_same_episode",
  );
  assert.equal(
    fixture.relationalObservation.boundary.selfObservationIsIndependentCorroboration,
    false,
  );
});
