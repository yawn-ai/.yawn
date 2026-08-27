import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import Ajv2020 from "ajv/dist/2020.js";
import {
  createObservationEvent,
  observationStateSha256,
  parseObservationYawn,
  reduceObservationEvents,
  serializeObservationYawn,
} from "../lib/observation-state-v1.mjs";
import { resolveProjectionPreferences } from "../lib/projection-preference-v1.mjs";

const fixture = async (name) => JSON.parse(await readFile(new URL(`../fixtures/${name}`, import.meta.url), "utf8"));
const schema = async (name) => JSON.parse(await readFile(new URL(`../schemas/${name}`, import.meta.url), "utf8"));
const GOLDEN_OBSERVATION_SHA256 = "495e916cc5ef539e6523fa41995532060e18951efb409801791dfd53c82862ca";
const projectionPrincipalRef = "principal:fixture-owner";
const preference = (preferenceId, scopeRef, fieldPath, operation, value, revision, viewKind) => ({
  preferenceId,
  principalRef: projectionPrincipalRef,
  scopeRef,
  fieldPath,
  operation,
  value,
  revision,
  ...(viewKind === undefined ? {} : { viewKind }),
  status: "accepted",
  sourceEventRef: `event:${preferenceId}`,
});

test("Observation is valid without Target, Move, or Yawn promotion", async () => {
  const observation = await fixture("observation.v1.json");
  const ajv = new Ajv2020({ allErrors: true, strict: false, formats: { "date-time": true } });
  const validate = ajv.compile(await schema("observation.v1.schema.json"));
  assert.equal(validate(observation), true, JSON.stringify(validate.errors));
  assert.equal(observationStateSha256(observation), GOLDEN_OBSERVATION_SHA256);
  assert.equal("target" in observation, false);
  assert.equal("move" in observation, false);
  assert.deepEqual(observation.observedYawnRefs, ["yawn:public-release"]);
});

test("Observation replay preserves revision and hash continuity", async () => {
  const first = await fixture("observation.v1.json");
  const firstEvent = createObservationEvent({
    eventId: "event:observation:first",
    actorRef: "principal:dave",
    occurredAt: first.recordedAt,
    state: first,
  });
  const second = {
    ...first,
    revision: 2,
    remainsOpen: [...first.remainsOpen, "Which earlier choice created this UI?"],
    updatedAt: "2026-08-15T20:02:00Z",
    previousStateSha256: firstEvent.resultingStateSha256,
  };
  const secondEvent = createObservationEvent({
    eventId: "event:observation:revision-2",
    actorRef: "principal:dave",
    occurredAt: second.updatedAt,
    state: second,
    previousStateSha256: firstEvent.resultingStateSha256,
  });
  const replay = reduceObservationEvents([secondEvent, firstEvent]);
  assert.equal(replay.revision, 2);
  assert.equal(replay.stateSha256, observationStateSha256(second));
  assert.deepEqual(replay.state.observedYawnRefs, first.observedYawnRefs);
});

test("canonical replay ignores proposals and rejected events", async () => {
  const state = await fixture("observation.v1.json");
  const accepted = createObservationEvent({
    eventId: "event:accepted",
    actorRef: "principal:dave",
    occurredAt: state.recordedAt,
    state,
  });
  const proposal = { ...accepted, eventId: "event:proposal", authorityStatus: "proposed" };
  const rejected = { ...accepted, eventId: "event:rejected", authorityStatus: "rejected" };
  assert.equal(reduceObservationEvents([proposal, accepted, rejected]).stateSha256, accepted.resultingStateSha256);
});

test("observation.yawn bytes round trip and remain deterministic", async () => {
  const observation = await fixture("observation.v1.json");
  const preferenceHash = "f".repeat(64);
  const one = serializeObservationYawn(observation, { preferenceHash });
  const two = serializeObservationYawn({ ...observation, extensions: {} }, { preferenceHash });
  assert.equal(one, two);
  const parsed = parseObservationYawn(one);
  assert.deepEqual(parsed.state, observation);
  assert.equal(parsed.stateSha256, observationStateSha256(observation));
  assert.throws(() => serializeObservationYawn(observation, { preferenceHash: "not-a-hash" }), /preference_hash_invalid/);
});

test("source statements cannot be smuggled into the inference plane", async () => {
  const observation = await fixture("observation.v1.json");
  const ajv = new Ajv2020({ allErrors: true, strict: false, formats: { "date-time": true } });
  const validate = ajv.compile(await schema("observation.v1.schema.json"));
  const invalid = {
    ...observation,
    observerAdded: [{
      text: "This might be the cause.", assertedBy: "principal:dave",
      epistemicStatus: "inferred", confidence: 0.6, sourceSpanIndexes: [0],
    }],
  };
  assert.equal(validate(invalid), false);
  assert.throws(() => serializeObservationYawn(invalid), /observer_added_epistemic_status_invalid/);
});

test("generic record references include observations and Git commits", async () => {
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  const validate = ajv.compile(await schema("record-ref.v1.schema.json"));
  assert.equal(validate({ kind: "observation", id: "observation:one", revision: 1, stateSha256: null }), true);
  assert.equal(validate({ kind: "git_commit", id: "19ebd6cdd46215dd7500021701659c674c623fed" }), true);
});

test("generic event and proof schemas address records without a Yawn foreign key", async () => {
  const ajv = new Ajv2020({ allErrors: true, strict: false, formats: { "date-time": true } });
  const recordRef = await schema("record-ref.v1.schema.json");
  ajv.addSchema(recordRef);
  const validateEvent = ajv.compile(await schema("record-event.v1.schema.json"));
  const validateProof = ajv.compile(await schema("record-proof-receipt.v1.schema.json"));
  const event = {
    schemaVersion: "yawn.record-event.v1", eventId: "event:1", subjectRef: { kind: "observation", id: "observation:1" },
    revision: 1, eventType: "observation.accepted", actorRef: "principal:dave", authorityStatus: "authorized", payload: {},
    previousStateSha256: null, resultingStateSha256: "0".repeat(64), occurredAt: "2026-08-15T20:00:00Z",
  };
  const receipt = {
    schemaVersion: "yawn.record-proof-receipt.v1", receiptId: "proof:commit:1",
    subjectRef: { kind: "git_commit", id: "19ebd6cdd46215dd7500021701659c674c623fed" },
    preconditions: {}, prediction: "Checks pass.", postconditions: {}, verifier: "npm run yawn:prove", falsifier: "Any command fails.",
    sourceRefs: [], status: "passed", recordedAt: "2026-08-15T20:00:00Z",
  };
  assert.equal(validateEvent(event), true, JSON.stringify(validateEvent.errors));
  assert.equal(validateProof(receipt), true, JSON.stringify(validateProof.errors));
  assert.equal("yawnId" in receipt, false);
});

test("projection preferences preserve precedence, resets, and field provenance", () => {
  const resolved = resolveProjectionPreferences([
    { preferences: [preference("default-density", { kind: "view", id: "view:default" }, "/density", "set", "calm", 1)] },
    { preferences: [preference("fixture-owner-density", { kind: "principal", id: projectionPrincipalRef }, "/density", "set", "compact", 2)] },
    { preferences: [preference("observation-reset", { kind: "observation", id: "observation:one" }, "/density", "reset", null, 1)] },
  ]);
  assert.equal(resolved.fields["/density"], undefined);
  assert.equal(resolved.resets["/density"].preferenceId, "observation-reset");
  assert.match(resolved.preferenceHash, /^[a-f0-9]{64}$/);
});

test("targeted projection preferences stay within their View and use scope specificity", () => {
  const orientation = "orientation_inquiry";
  const art = "observation_question_art";
  const activeScopeRefs = [
    { kind: "view", id: "view:default" },
    { kind: "principal", id: projectionPrincipalRef },
    { kind: "arena", id: "arena:current-lived-field" },
    { kind: "yawn", id: "yawn:fixture:participation-choice" },
  ];
  const layers = [
    { preferences: [
      preference("yawn-medium", { kind: "yawn", id: "yawn:fixture:participation-choice" }, "/output/modality", "set", "visual_map", 1, orientation),
      preference("yawn-order", { kind: "yawn", id: "yawn:fixture:participation-choice" }, "/question/defaultAxisOrder", "set", ["perspective", "current-state"], 1, orientation),
      preference("art-medium", { kind: "yawn", id: "yawn:fixture:participation-choice" }, "/output/modality", "set", "image", 1, art),
      preference("art-order", { kind: "yawn", id: "yawn:fixture:participation-choice" }, "/question/defaultAxisOrder", "set", ["visual-intention"], 1, art),
    ] },
    { preferences: [
      preference("arena-medium", { kind: "arena", id: "arena:current-lived-field" }, "/output/modality", "set", "voice", 1, orientation),
      preference("arena-pacing", { kind: "arena", id: "arena:current-lived-field" }, "/pacing", "set", "one-question", 1, orientation),
    ] },
    { preferences: [
      preference("principal-medium", { kind: "principal", id: projectionPrincipalRef }, "/output/modality", "set", "free_text", 1, orientation),
      preference("principal-order", { kind: "principal", id: projectionPrincipalRef }, "/question/defaultAxisOrder", "set", ["scope", "current-state"], 1, orientation),
      preference("principal-wording", { kind: "principal", id: projectionPrincipalRef }, "/question/wordingStyle", "set", "plain", 1, orientation),
    ] },
    { preferences: [
      preference("legacy-unscoped-density", { kind: "principal", id: projectionPrincipalRef }, "/density", "set", "compact", 1),
    ] },
  ];

  const resolvedOrientation = resolveProjectionPreferences(layers, {
    viewKind: orientation,
    principalRef: projectionPrincipalRef,
    activeScopeRefs,
  });
  assert.equal(resolvedOrientation.viewKind, orientation);
  assert.equal(resolvedOrientation.fields["/output/modality"].value, "visual_map");
  assert.equal(resolvedOrientation.fields["/output/modality"].preferenceId, "yawn-medium");
  assert.deepEqual(resolvedOrientation.fields["/question/defaultAxisOrder"].value, ["perspective", "current-state"]);
  assert.equal(resolvedOrientation.fields["/question/wordingStyle"].value, "plain");
  assert.equal(resolvedOrientation.fields["/pacing"].value, "one-question");
  assert.equal(resolvedOrientation.fields["/density"], undefined);

  assert.throws(
    () => resolveProjectionPreferences(layers, art),
    /projection_preference_options_object_required/,
  );
});

test("a more-specific targeted reset wins while omitted presentation axes remain inherited", () => {
  const orientation = "orientation_inquiry";
  const resolved = resolveProjectionPreferences([
    { preferences: [
      preference("yawn-medium-reset", { kind: "yawn", id: "yawn:fixture:participation-choice" }, "/output/modality", "reset", null, 1, orientation),
    ] },
    { preferences: [
      preference("principal-medium", { kind: "principal", id: projectionPrincipalRef }, "/output/modality", "set", "free_text", 1, orientation),
      preference("principal-order", { kind: "principal", id: projectionPrincipalRef }, "/question/defaultAxisOrder", "set", ["scope", "placement"], 1, orientation),
      preference("principal-wording", { kind: "principal", id: projectionPrincipalRef }, "/question/wordingStyle", "set", "plain", 1, orientation),
    ] },
    { preferences: [
      preference("arena-medium", { kind: "arena", id: "arena:current-lived-field" }, "/output/modality", "set", "voice", 1, orientation),
    ] },
  ], {
    viewKind: orientation,
    principalRef: projectionPrincipalRef,
    activeScopeRefs: [
      { kind: "principal", id: projectionPrincipalRef },
      { kind: "arena", id: "arena:current-lived-field" },
      { kind: "yawn", id: "yawn:fixture:participation-choice" },
    ],
  });

  assert.equal(resolved.fields["/output/modality"], undefined);
  assert.equal(resolved.resets["/output/modality"].preferenceId, "yawn-medium-reset");
  assert.deepEqual(resolved.fields["/question/defaultAxisOrder"].value, ["scope", "placement"]);
  assert.equal(resolved.fields["/question/wordingStyle"].value, "plain");
});

test("projection preferences cannot hide protected semantics in any View", () => {
  const protectedPaths = [
    "/Authority/canWrite",
    "/presentation/safety/visible",
    "/semantic_truth/visible",
    "/sections/proof/visible",
  ];

  for (const [index, fieldPath] of protectedPaths.entries()) {
    const bad = preference(
      `bad-${index}`,
      { kind: "yawn", id: "yawn:fixture:participation-choice" },
      fieldPath,
      "set",
      false,
      1,
      "orientation_inquiry",
    );
    assert.throws(
      () => resolveProjectionPreferences([{ preferences: [bad] }], {
        viewKind: "orientation_inquiry",
        principalRef: projectionPrincipalRef,
        activeScopeRefs: [
          { kind: "principal", id: projectionPrincipalRef },
          { kind: "yawn", id: "yawn:fixture:participation-choice" },
        ],
      }),
      /protected_projection_preference/,
    );
  }
});
