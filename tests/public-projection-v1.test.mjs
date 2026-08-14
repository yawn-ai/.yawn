import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";
import {
  assertPublicProjectionSemantics,
  canonicalize,
  hashPublicSnapshot,
} from "../lib/public-projection-v1.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const schema = JSON.parse(
  await readFile(join(root, "schemas", "public-projection.v1.schema.json"), "utf8"),
);
const fixture = JSON.parse(
  await readFile(join(root, "fixtures", "public-projection.v1.json"), "utf8"),
);
const ajv = new Ajv2020({ allErrors: true, strict: true, validateFormats: false });
const validate = ajv.compile(schema);

function clone(value) {
  return structuredClone(value);
}

test("canonical fixture validates and its semantic graph resolves", () => {
  assert.equal(validate(fixture), true, ajv.errorsText(validate.errors));
  assert.equal(assertPublicProjectionSemantics(fixture), true);
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
  changed.current_yawn.lacuna = "A materially different lacuna.";
  assert.notEqual(hashPublicSnapshot(changed), fixture.snapshot_hash);
  assert.throws(() => assertPublicProjectionSemantics(changed), /Snapshot hash mismatch/);
});

test("an active public relationship is rejected", () => {
  const changed = clone(fixture);
  changed.relationship_offer.state = "active";
  assert.equal(validate(changed), false);
});

test("recursive observation targets and spiral endpoints must resolve", () => {
  const brokenObservation = clone(fixture);
  brokenObservation.observations[1].observes.id = "observation:missing";
  brokenObservation.snapshot_hash = hashPublicSnapshot(brokenObservation);
  assert.throws(
    () => assertPublicProjectionSemantics(brokenObservation),
    /unresolved observation target/,
  );

  const brokenEdge = clone(fixture);
  brokenEdge.spiral.edges[0].target = "spiral-node:missing";
  assert.throws(
    () => assertPublicProjectionSemantics(brokenEdge),
    /unresolved endpoint/,
  );
});

test("public source bodies are structurally forbidden", () => {
  const leaked = clone(fixture);
  leaked.sources[0].content = "private transcript text";
  assert.equal(validate(leaked), false);
});
