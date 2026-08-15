import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";
import { assertOrientationPassageSemantics } from "../lib/orientation-passage-v1.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const schema = JSON.parse(
  await readFile(join(root, "schemas", "orientation-passage.v1.schema.json"), "utf8"),
);
const fixture = JSON.parse(
  await readFile(join(root, "fixtures", "orientation-passage.v1.json"), "utf8"),
);
const ajv = new Ajv2020({ allErrors: true, strict: true, validateFormats: false });
const validate = ajv.compile(schema);

const clone = (value) => structuredClone(value);

test("canonical orientation passage fixture validates and resolves", () => {
  assert.equal(validate(fixture), true, ajv.errorsText(validate.errors));
  assert.equal(assertOrientationPassageSemantics(fixture), true);
});

test("Observation acquisition is separate from statement interpretation", () => {
  const observation = fixture.observations[0];
  const statement = fixture.statements.find(
    (candidate) => candidate.statementId === "statement:dave:repair-intention",
  );

  assert.notEqual(observation.observationId, statement.statementId);
  assert.equal("text" in observation, false);
  assert.deepEqual(statement.groundedInObservationRefs, [observation.observationId]);
});

test("AI inference remains attributed to the AI run while human sources stay provenance", () => {
  const statement = fixture.statements.find(
    (candidate) => candidate.statementId === "statement:yawn-ai:divergence",
  );
  assert.equal(statement.assertedBy, "agent:yawn-ai:run-001");
  assert.deepEqual(
    statement.sourceSpans.map((span) => span.sourceRef),
    ["source:dave:repair-reflection", "source:alex:reported-reception"],
  );
});

test("Intention, outward Projection, and Consequence remain distinct", () => {
  const intention = fixture.intentions[0];
  const projection = fixture.projections[0];
  const consequence = fixture.consequences[0];

  assert.equal(projection.intentionRef, intention.intentionId);
  assert.deepEqual(consequence.projectionRefs, [projection.projectionId]);
  assert.notEqual(intention.intentionId, projection.projectionId);
  assert.notEqual(projection.projectionId, consequence.consequenceId);
  assert.equal(projection.kind, "communication");
  assert.equal(projection.moveRef, null);
});

test("Observation, Projection, and Consequence resolve through the same Arena", () => {
  const [yawn] = fixture.yawns;
  const observation = fixture.observations.find((candidate) =>
    yawn.observationRefs.includes(candidate.observationId));
  const projection = fixture.projections.find((candidate) =>
    yawn.projectionRefs.includes(candidate.projectionId));
  const consequence = fixture.consequences.find((candidate) =>
    yawn.consequenceRefs.includes(candidate.consequenceId));

  assert.equal(observation.arenaRef, yawn.arenaRef);
  assert.equal(projection.arenaRef, yawn.arenaRef);
  assert.equal(consequence.arenaRef, yawn.arenaRef);
});

test("a Projection cannot silently switch Arenas", () => {
  const invalid = clone(fixture);
  invalid.arenas.push({ ...invalid.arenas[0], arenaId: "arena:other" });
  invalid.projections[0].arenaRef = "arena:other";

  assert.equal(validate(invalid), true, ajv.errorsText(validate.errors));
  assert.throws(
    () => assertOrientationPassageSemantics(invalid),
    /same Arena as its Yawn/,
  );
});

test("a Yawn may remain valid with no Target or Move", () => {
  assert.deepEqual(fixture.yawns[0].targetRefs, []);
  assert.deepEqual(fixture.yawns[0].moveRefs, []);
  assert.equal(validate(fixture), true, ajv.errorsText(validate.errors));
});

test("a Move without a reciprocal Projection is rejected", () => {
  const invalid = clone(fixture);
  invalid.moves.push({
    moveId: "move:unprojected",
    yawnRef: invalid.yawns[0].yawnId,
    projectionRef: invalid.projections[0].projectionId,
    attemptedBy: "actor:dave",
    description: "Attempt a change without a Projection of kind move.",
    authorityGrantRef: null,
    status: "proposed",
    attemptedAt: null,
    proofPolicyRefs: [],
    control: { visibility: "private", authorityState: "proposed", authorityGrantRefs: [], extensions: {} },
    extensions: {},
  });

  assert.equal(validate(invalid), true, ajv.errorsText(validate.errors));
  assert.throws(
    () => assertOrientationPassageSemantics(invalid),
    /reciprocal Projection of kind move/,
  );
});

test("an attempted Move without granted authority is rejected", () => {
  const invalid = clone(fixture);
  invalid.projections.push({
    projectionId: "projection:unauthorized-move",
    yawnRef: invalid.yawns[0].yawnId,
    projectedBy: "actor:dave",
    arenaRef: invalid.arenas[0].arenaId,
    intentionRef: invalid.intentions[0].intentionId,
    kind: "move",
    producedAt: "2026-08-14T16:30:00Z",
    contentStatementRefs: [],
    contentSourceRefs: [],
    moveRef: "move:unauthorized",
    control: { visibility: "private", authorityState: "proposed", authorityGrantRefs: [], extensions: {} },
    extensions: {},
  });
  invalid.moves.push({
    moveId: "move:unauthorized",
    yawnRef: invalid.yawns[0].yawnId,
    projectionRef: "projection:unauthorized-move",
    attemptedBy: "actor:dave",
    description: "Attempt without an authority grant.",
    authorityGrantRef: null,
    status: "attempted",
    attemptedAt: "2026-08-14T16:30:00Z",
    proofPolicyRefs: [],
    control: { visibility: "private", authorityState: "proposed", authorityGrantRefs: [], extensions: {} },
    extensions: {},
  });

  assert.equal(validate(invalid), true, ajv.errorsText(validate.errors));
  assert.throws(
    () => assertOrientationPassageSemantics(invalid),
    /without an Authority Grant/,
  );
});

test("source-coordinate hash drift is rejected", () => {
  const invalid = clone(fixture);
  invalid.observations[0].sourceSpans[0].sourceSha256 =
    "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
  assert.throws(
    () => assertOrientationPassageSemantics(invalid),
    /source hash does not match/,
  );
});
