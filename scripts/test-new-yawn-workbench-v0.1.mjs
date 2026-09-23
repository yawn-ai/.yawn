#!/usr/bin/env node

import assert from "node:assert/strict";

import { compileNewYawnWorkbenchView } from "./compile-new-yawn-workbench-v0.1.mjs";

const empty = compileNewYawnWorkbenchView("", "fixture:empty");
assert.equal(empty.canonicalState, false);
assert.equal(empty.orientationResolutionLevel, 1);
assert.equal(empty.draftIdentity.coordinate, "yawn.bot/draft/untitled");
assert.deepEqual(empty.boundaries, {
  persistence: false,
  graphMutation: false,
  providerConnection: false,
  authorityGrant: false,
  externalEffects: false,
});
assert.equal(empty.cells.find((cell) => cell.cellKey === "intelligence")?.status, "unknown");

const frontierSource = `---
title: Frontier map
actor: user:dave
epistemic_status: reported
---
I want to map the AI frontier with my team, but I do not know what would prove progress.`;
const frontierA = compileNewYawnWorkbenchView(frontierSource, "fixture:frontier");
const frontierB = compileNewYawnWorkbenchView(frontierSource, "fixture:frontier");
assert.deepEqual(frontierA, frontierB);
assert.equal(frontierA.draftIdentity.coordinate, "yawn.bot/draft/frontier-map");
assert.equal(frontierA.cells.find((cell) => cell.cellKey === "purpose")?.status, "proposed");
assert.equal(frontierA.cells.find((cell) => cell.cellKey === "relationship")?.status, "proposed");
assert.equal(frontierA.cells.find((cell) => cell.cellKey === "lacuna")?.status, "proposed");
assert.equal(frontierA.cells.find((cell) => cell.cellKey === "proof")?.status, "proposed");
assert.equal(frontierA.cells.find((cell) => cell.cellKey === "intelligence")?.status, "unknown");

const merelyNamedProvider = compileNewYawnWorkbenchView(
  `---\nprovider: model:example\n---\nConnect an intelligence provider.`,
  "fixture:provider-name-only",
);
assert.equal(
  merelyNamedProvider.cells.find((cell) => cell.cellKey === "intelligence")?.status,
  "unknown",
  "A named or available provider must not become a verified connection.",
);

const verifiedProvider = compileNewYawnWorkbenchView(
  `---\nverified_intelligence_binding: service:yawn->model:example\n---\nConnect an intelligence provider.`,
  "fixture:verified-provider",
);
assert.equal(
  verifiedProvider.cells.find((cell) => cell.cellKey === "intelligence")?.status,
  "verified",
);

console.log("New Yawn workbench compiler: all proposal-only invariants passed.");
