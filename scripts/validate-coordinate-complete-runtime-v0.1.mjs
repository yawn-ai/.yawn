#!/usr/bin/env node

import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";

const requiredSources = [
  "core/RELATIONSHIP_FIRST_AGENT_ARENA.yawn",
  "core/orientation.yawn",
  "agents/orientation.yawn",
  "question-packets/orientation-nine.yawn",
  "schemas/orientation-map.v0.1.schema.json",
  "core/inquiry-selection.yawn",
  "schemas/agency-holarchy.v0.2.schema.json",
  "schemas/objective-holon.v0.1.schema.json",
  "core/projection-and-aperture.yawn",
  "core/proof-and-boundary.yawn",
  "schemas/execution-relationship.v1.schema.json",
  "interface/new-yawn-v0.1.yawn",
  "interface/new-yawn-coordinate-workbench-v0.1.yawn",
];

for (const path of requiredSources) {
  await access(path);
}

const contractPath = "agents/coordinate-complete-runtime.yawn";
const contract = await readFile(contractPath, "utf8");

for (const phrase of [
  "compiled_working_context",
  "explicit_hold",
  "never_inherit_as_truth",
  "move_selection_lacuna",
  "child_spawn_contract",
  "root_agent_model",
  "recommendation -> choice",
  "choice -> authorization",
  "capability -> permission",
  "consequence -> proof",
]) {
  assert.ok(contract.includes(phrase), `Missing required runtime boundary: ${phrase}`);
}

assert.ok(
  contract.includes("status: unresolved_contract_lacuna"),
  "The composition must not pretend move selection is already closed.",
);
assert.ok(
  contract.includes("default_child_spawn_authority: false"),
  "Recursive spawning must be denied by default.",
);
assert.ok(
  contract.includes("canonical_state: false"),
  "Compiled working context must remain a View rather than canonical state.",
);

console.log(`Coordinate-complete runtime: ${requiredSources.length} pinned sources and all boundary assertions passed.`);
