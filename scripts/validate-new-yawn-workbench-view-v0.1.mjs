#!/usr/bin/env node

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import Ajv2020 from "ajv/dist/2020.js";

import { backfillNewYawnWorkbenchViews } from "./backfill-new-yawn-workbench-v0.1.mjs";

const schemaPath = "schemas/new-yawn-coordinate-workbench-view.v0.1.schema.json";
const schema = JSON.parse(await readFile(schemaPath, "utf8"));
const ajv = new Ajv2020({ allErrors: true, strict: true });
const validate = ajv.compile(schema);

const { views, manifest } = await backfillNewYawnWorkbenchViews({ sourceRoot: "." });
const failures = [];

for (const view of views) {
  if (!validate(view)) {
    failures.push({
      source: view.source.path,
      errors: structuredClone(validate.errors ?? []),
    });
  }
}

if (failures.length) {
  console.error(JSON.stringify({ failureCount: failures.length, failures: failures.slice(0, 20) }, null, 2));
  process.exit(1);
}

assert.ok(views.length > 0, "The repository-wide validator must compile at least one .yawn source.");
assert.equal(manifest.canonicalWrites, 0);
assert.equal(manifest.graphMutations, 0);
assert.equal(manifest.providerConnections, 0);
assert.equal(manifest.authorityGrants, 0);
assert.equal(manifest.externalEffects, 0);
assert.equal(
  views.some((view) => view.cells.some((cell) => cell.status === "verified")),
  false,
  "Historical source compilation cannot manufacture a verified intelligence binding.",
);

console.log(
  `New Yawn workbench View schema: ${views.length} source records compiled and validated; no canonical writes or verified bindings manufactured.`,
);
