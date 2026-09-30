import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import Ajv2020 from "ajv/dist/2020.js";

const readJson = async (relativePath) =>
  JSON.parse(await readFile(new URL(relativePath, import.meta.url), "utf8"));
const clone = (value) => structuredClone(value);

const [
  relationshipSchema,
  participationSchema,
  inferenceEnvelopeSchema,
  relationAddressSchema,
  fixture,
  invalidFixture,
] = await Promise.all([
  readJson("../schemas/relationship.v0.1.schema.json"),
  readJson("../schemas/participation.v0.1.schema.json"),
  readJson("../schemas/inference-envelope.v0.1.schema.json"),
  readJson("../schemas/relation-address.v0.1.schema.json"),
  readJson("../fixtures/relationship-core.v0.1.json"),
  readJson("../fixtures/relationship-core.v0.1.invalid.json"),
]);

const ajv = new Ajv2020({ allErrors: true, strict: true, validateFormats: false });
const validators = {
  relationships: ajv.compile(relationshipSchema),
  participations: ajv.compile(participationSchema),
  inferenceEnvelopes: ajv.compile(inferenceEnvelopeSchema),
  relationAddresses: ajv.compile(relationAddressSchema),
};

const errors = (validator) => ajv.errorsText(validator.errors, { separator: "\n" });

const recordAt = (root, recordPath) => recordPath
  .split("/")
  .reduce((value, segment) => value[segment], root);

const setAt = (record, pointer, value) => {
  const segments = pointer.split("/").slice(1);
  assert.ok(segments.length > 0, "mutation path must be a JSON pointer: " + pointer);
  let current = record;
  for (const segment of segments.slice(0, -1)) {
    assert.ok(
      Object.hasOwn(current, segment),
      "mutation path does not resolve before " + segment + ": " + pointer,
    );
    current = current[segment];
  }
  current[segments.at(-1)] = value;
};

const validatorFor = (recordPath) => {
  const collection = recordPath.split("/")[0];
  const validator = validators[collection];
  assert.ok(validator, "no validator for fixture collection: " + collection);
  return validator;
};

test("the Relationship Core fixture validates each first-class record", () => {
  for (const [collection, validator] of Object.entries(validators)) {
    for (const record of fixture[collection]) {
      assert.equal(
        validator(record),
        true,
        collection + " record did not validate:\n" + errors(validator),
      );
    }
  }
});

test("a relationship keeps referents, participation, coupling, boundaries, policy, and inference distinct", () => {
  const relationship = fixture.relationships.find(
    ({ relationshipId }) => relationshipId === "relationship:dave:christianity",
  );
  assert.ok(relationship);
  assert.deepEqual(
    relationship.referents.map(({ referentRef }) => referentRef),
    ["principal:dave", "tradition:christianity"],
  );
  assert.deepEqual(relationship.policyRefs, []);
  assert.deepEqual(
    relationship.participationRefs,
    [
      "participation:dave:christianity:principal",
      "participation:yawn-bot:dave-christianity:proposal",
    ],
  );
  assert.deepEqual(
    relationship.inferenceRefs,
    [
      "inference:dave:christianity:source-attribution-proposal",
      "inference:dave:christianity:source-attribution-correction",
    ],
  );
  assert.equal(relationship.revision, 2);
  assert.equal(
    relationship.previousRevisionRef,
    "relationship:dave:christianity:revision:1",
  );
  assert.equal(relationship.stewardYawnRef, null);
  assert.equal(relationship.boundary.recordIsStructuralRelation, false);
  assert.equal(relationship.boundary.recordIsCoupling, false);
  assert.equal(relationship.boundary.recordIsPolicy, false);
  assert.equal(relationship.boundary.recordGrantsAuthority, false);
  assert.equal(relationship.boundary.routeDefinesIdentity, false);
});

test("the Dave / Christianity conformance case does not turn source-attributed history into current participation", () => {
  const sourceAttribution = fixture.relationships.find(
    ({ relationshipId }) => relationshipId === "relationship:christianity:jesus:source-attribution",
  );
  assert.ok(sourceAttribution);
  assert.deepEqual(sourceAttribution.participationRefs, []);
  assert.ok(
    sourceAttribution.referents.some(
      ({ referentRef }) => referentRef === "historical-person:jesus",
    ),
  );
  assert.equal(
    fixture.participations.some(
      ({ referentRef }) => referentRef === "historical-person:jesus",
    ),
    false,
  );

  for (const participation of fixture.participations) {
    assert.equal(participation.boundary.sourceReferenceCreatesParticipation, false);
    assert.equal(participation.boundary.representedVoiceCreatesParticipation, false);
    assert.equal(participation.boundary.roleGrantsAuthority, false);
  }
});

test("an inference correction keeps source versions while replaying each persisted output", () => {
  const first = fixture.inferenceEnvelopes.find(
    ({ inferenceId }) => inferenceId === "inference:dave:christianity:source-attribution-proposal",
  );
  const corrected = fixture.inferenceEnvelopes.find(
    ({ inferenceId }) => inferenceId === "inference:dave:christianity:source-attribution-correction",
  );
  assert.ok(first);
  assert.ok(corrected);
  assert.equal(first.relationshipRef, "relationship:dave:christianity");
  assert.equal(first.relationshipRevision, 1);
  assert.equal(corrected.relationshipRevision, 2);
  assert.equal(first.generationMode, "generative");
  assert.equal(first.replayMode, "persisted_output");
  assert.match(first.persistedOutputSha256, /^[a-f0-9]{64}$/);
  assert.match(corrected.persistedOutputSha256, /^[a-f0-9]{64}$/);
  assert.notEqual(first.persistedOutputSha256, corrected.persistedOutputSha256);
  assert.deepEqual(first.sourceVersionRefs, corrected.sourceVersionRefs);
  assert.equal(first.supersededByInferenceRef, corrected.inferenceId);
  assert.equal(corrected.supersedesInferenceRef, first.inferenceId);
  assert.equal(first.disposition, "superseded");
  assert.equal(corrected.disposition, "corrected");
  for (const inference of [first, corrected]) {
    assert.equal(inference.boundary.inferenceIsFact, false);
    assert.equal(inference.boundary.inferenceGrantsAuthority, false);
    assert.equal(inference.boundary.historicalReplayUsesPersistedOutput, true);
    assert.equal(inference.boundary.freshGenerationRewritesHistory, false);
    assert.equal(inference.disclosure.visibility, "private");
  }
});

test("slash addresses select a directional View without turning the path into identity or containment", () => {
  const open = fixture.relationAddresses.find(({ portState }) => portState === "open");
  const model = fixture.relationAddresses.find(
    ({ displayPath }) => displayPath === "dave/christianity",
  );
  const sourceView = fixture.relationAddresses.find(
    ({ displayPath }) => displayPath === "dave/christianity/jesus",
  );

  assert.ok(open);
  assert.equal(open.displayPath, "dave/");
  assert.equal(open.targetAbsence, "intentional_unbound");
  assert.deepEqual(open.steps, []);
  assert.equal(open.foregroundRelationshipRef, null);

  assert.ok(model);
  assert.ok(sourceView);
  assert.equal(model.foregroundRelationshipRef, "relationship:dave:christianity");
  assert.equal(sourceView.foregroundRelationshipRef, "relationship:dave:christianity");
  assert.notDeepEqual(model.viewCoordinates, sourceView.viewCoordinates);

  const sourceStep = sourceView.steps.at(-1);
  assert.equal(sourceStep.relationRecordKind, "relationship");
  assert.equal(sourceStep.relationType, "references");
  assert.equal(sourceStep.semanticParentage, false);

  for (const address of fixture.relationAddresses) {
    assert.equal(address.boundary.pathProvesParentage, false);
    assert.equal(address.boundary.pathProvesContainment, false);
    assert.equal(address.boundary.pathProvesConsent, false);
    assert.equal(address.boundary.pathGrantsAuthority, false);
    assert.equal(address.boundary.pathGrantsMutation, false);
    assert.equal(address.boundary.viewChangesRelationshipIdentity, false);
  }
});

test("invalid fixtures reject collapsed relationship semantics", () => {
  for (const invalidCase of invalidFixture.invalidCases) {
    const record = clone(recordAt(fixture, invalidCase.recordPath));
    for (const mutation of invalidCase.mutations) {
      setAt(record, mutation.path, mutation.value);
    }
    const validator = validatorFor(invalidCase.recordPath);
    assert.equal(
      validator(record),
      false,
      invalidCase.name + " unexpectedly validated",
    );
    assert.match(
      errors(validator),
      new RegExp(invalidCase.errorPattern),
      invalidCase.name + " failed for an unexpected reason:\n" + errors(validator),
    );
  }
});
