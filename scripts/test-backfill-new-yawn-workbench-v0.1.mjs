#!/usr/bin/env node

import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { backfillNewYawnWorkbenchViews } from "./backfill-new-yawn-workbench-v0.1.mjs";

const temporary = await mkdtemp(join(tmpdir(), "yawn-workbench-backfill-"));
const sourceRoot = join(temporary, "source");
const outputRoot = join(temporary, "views");
await mkdir(sourceRoot, { recursive: true });

const sourceA = `---
title: Frontier inquiry
actor: user:dave
epistemic_status: reported
---
I want to map the AI frontier with my team, but I do not know what would prove progress.
`;
const sourceB = `---
title: Quiet observation
actor: user:dave
epistemic_status: reported
---
Something has my attention.
`;
await writeFile(join(sourceRoot, "a.yawn"), sourceA);
await writeFile(join(sourceRoot, "b.yawn"), sourceB);

const first = await backfillNewYawnWorkbenchViews({
  sourceRoot,
  out: outputRoot,
  rootCoordinate: "yawn.bot/test",
});
const second = await backfillNewYawnWorkbenchViews({
  sourceRoot,
  out: outputRoot,
  rootCoordinate: "yawn.bot/test",
});

assert.deepEqual(first.manifest, second.manifest, "Equivalent inputs must compile replayably.");
assert.equal(first.manifest.recordCount, 2);
assert.equal(first.manifest.canonicalWrites, 0);
assert.equal(first.manifest.graphMutations, 0);
assert.equal(first.manifest.providerConnections, 0);
assert.equal(first.manifest.authorityGrants, 0);
assert.equal(first.manifest.externalEffects, 0);
assert.equal(first.views.every((view) => view.canonicalState === false), true);
assert.equal(first.views.every((view) => view.projectionStatus === "proposed"), true);

assert.equal(await readFile(join(sourceRoot, "a.yawn"), "utf8"), sourceA);
assert.equal(await readFile(join(sourceRoot, "b.yawn"), "utf8"), sourceB);

const manifestOnDisk = JSON.parse(await readFile(join(outputRoot, "manifest.json"), "utf8"));
assert.deepEqual(manifestOnDisk, first.manifest);

console.log("New Yawn workbench backfill: deterministic, source-preserving, and mutation-free.");
