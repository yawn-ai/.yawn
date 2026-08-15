import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";
import {
  assertPublicViewSemantics,
  canonicalize,
  hashPublicSnapshot,
} from "../lib/public-view-v1.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const schema = JSON.parse(
  await readFile(join(root, "schemas", "public-view.v1.schema.json"), "utf8"),
);
const fixture = JSON.parse(
  await readFile(join(root, "fixtures", "public-view.v1.json"), "utf8"),
);
const ajv = new Ajv2020({ allErrors: true, strict: true, validateFormats: false });
const validate = ajv.compile(schema);

const clone = (value) => structuredClone(value);

test("canonical fixture validates and its semantic graph resolves", () => {
  assert.equal(validate(fixture), true, ajv.errorsText(validate.errors));
  assert.equal(assertPublicViewSemantics(fixture), true);
});

test("hash is deterministic across object key order", () => {
  const reordered = Object.fromEntries(Object.entries(fixture).reverse());
  assert.deepEqual(canonicalize(reordered), canonicalize(fixture));
  assert.equal(hashPublicSnapshot(reordered), fixture.snapshot_hash);
});

test("presentation-only changes do not change semantic snapshot identity", () => {
  const changed = clone(fixture);
  changed.interface.purpose = "A different renderer can say this differently.";
  changed.spiral.nodes[0].label = "A shorter display label";
  changed.media = [
    {
      id: "media:explainer",
      kind: "video",
      src: "/media/explainer.mp4",
      title: "Explainer",
      captions_href: "/media/explainer.vtt",
      transcript_href: "/explainer#transcript",
    },
  ];
  assert.equal(hashPublicSnapshot(changed), fixture.snapshot_hash);
});

test("semantic changes require a new snapshot hash", () => {
  const changed = clone(fixture);
  changed.intentions[0].direction = "A materially different intended direction.";
  assert.notEqual(hashPublicSnapshot(changed), fixture.snapshot_hash);
  assert.throws(() => assertPublicViewSemantics(changed), /Snapshot hash mismatch/);
});

test("Observation acquisition and statement interpretation remain separate", () => {
  assert.equal("statement" in fixture.observations[0], false);
  assert.deepEqual(
    fixture.statements[0].grounded_in_observation_refs,
    ["observation:dave:being-40:source"],
  );
});

test("the overlay inference stays attributed to YAWN.bot", () => {
  const inference = fixture.statements.find(
    (statement) => statement.id === "statement:yawn-bot:being-40:open-loop",
  );
  assert.equal(inference.asserted_by, "agent:yawn-bot");
  assert.equal(inference.epistemic_status, "inferred");
});

test("Intention and outward Projection remain separate", () => {
  assert.equal(fixture.projections[0].intention_id, fixture.intentions[0].id);
  assert.notEqual(fixture.projections[0].id, fixture.intentions[0].id);
  assert.equal(fixture.projections[0].kind, "expression");
  assert.equal(fixture.projections[0].move_id, null);
});

test("an active public relationship is rejected", () => {
  const changed = clone(fixture);
  changed.relationship_offer.state = "active";
  assert.equal(validate(changed), false);
});

test("recursive Observation targets and spiral endpoints must resolve", () => {
  const brokenObservation = clone(fixture);
  brokenObservation.observations[1].observes[0].id = "statement:missing";
  brokenObservation.snapshot_hash = hashPublicSnapshot(brokenObservation);
  assert.throws(
    () => assertPublicViewSemantics(brokenObservation),
    /unresolved statement target/,
  );

  const brokenEdge = clone(fixture);
  brokenEdge.spiral.edges[0].target = "spiral-node:missing";
  assert.throws(() => assertPublicViewSemantics(brokenEdge), /unresolved endpoint/);
});

test("public source bodies are structurally forbidden", () => {
  const leaked = clone(fixture);
  leaked.sources[0].content = "private transcript text";
  assert.equal(validate(leaked), false);
});
