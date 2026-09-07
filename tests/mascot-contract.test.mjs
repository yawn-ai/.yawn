import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const contractPath = new URL("../interface/yawn-mascot-v0.1.yawn", import.meta.url);
const packetPath = new URL("../question-packets/mascot.yawn", import.meta.url);
const interfaceNodePath = new URL("../interface/node.yawn", import.meta.url);
const packetNodePath = new URL("../question-packets/node.yawn", import.meta.url);
const manifestPath = new URL("../yawn.yawn", import.meta.url);
const readmePath = new URL("../README.md", import.meta.url);

const CANONICAL_STATUSES = new Set([
  "observed",
  "reported",
  "inferred",
  "assumed",
  "predicted",
  "disputed",
  "unknown",
]);

test("mascot contract keeps the View boundary, the receipt gates, and the identity rule", async () => {
  const contract = await readFile(contractPath, "utf8");

  assert.match(contract, /^id: interface\/yawn-mascot-v0\.1$/m);
  assert.match(contract, /^kind: interface-contract$/m);
  assert.match(contract, /^status: proposed$/m);
  assert.match(contract, /^schema_version: yawn\.mascot\.v0\.1$/m);

  // The mascot is a rebuildable View over runtime state, never a store.
  assert.match(contract, /resolveMascotState\(inputs\) is a pure function/);
  assert.match(contract, /never written back to loop status, worker status, or any record/);
  assert.match(contract, /Every rendered state carries its text label and an accessible name/);

  // Every state names its runtime sources and a public-safe flag.
  for (const state of [
    "sleeping",
    "orienting",
    "asking",
    "moving",
    "working",
    "proving",
    "updating",
    "holding",
    "blocked",
    "closed",
  ]) {
    assert.match(contract, new RegExp(`^    - state: ${state}$`, "m"), `state ${state} is declared`);
  }
  assert.match(contract, /yawnLoopStatuses: sleeping \| orienting \| awaiting_choice \| moving \| awaiting_proof \| updating \| holding \| closed/);
  assert.match(contract, /AutomationWorkerExpressionState: sleeping \| awake \| working \| needs_dave \| blocked/);

  // Generation, translation, training, and publication stay behind receipts.
  assert.match(contract, /no provider call, spend, storage write, or publication without a current receipt naming this brief hash/);
  assert.match(contract, /generate, spend, store, train, or publish without a current receipt/);
  assert.match(contract, /generated frames are candidates; acceptance, promotion, and publication are separate receipts/);
  assert.match(contract, /training_lane:\n\s+status: planned-approval-gated/);

  // Identity and rights.
  assert.match(contract, /copy a third-party mascot; the body stays the YAWN robot or a rights-cleared skin/);
  assert.match(contract, /name the rights holder of every skin before translating it/);

  // Accessibility and device constraints.
  assert.match(contract, /prefers-reduced-motion shows the reduced_motion_frame and a still field/);
  assert.match(contract, /the header mark never holds a WebGL context/);

  // Skin system: the pose library and the existing pairs.
  assert.match(contract, /skin_id: will-p/);
  assert.match(contract, /count: 20/);
});

test("mascot question packet keeps the frontier format and the canonical epistemic vocabulary", async () => {
  const packet = await readFile(packetPath, "utf8");

  assert.match(packet, /^id: question-packets\/mascot$/m);
  assert.match(packet, /^kind: question-packet$/m);
  assert.match(packet, /^governing_question: /m);
  assert.match(packet, /^honesty_line: >/m);
  assert.match(packet, /^target_contract: interface\/yawn-mascot-v0\.1\.yawn$/m);

  const ranks = [...packet.matchAll(/^  - rank: (\d+)$/gm)].map((match) => Number(match[1]));
  assert.ok(ranks.length >= 12, "at least twelve ranked questions");
  assert.deepEqual(ranks, ranks.map((_, index) => index + 1), "ranks are contiguous from 1");

  for (const line of packet.split(/\r?\n/)) {
    const match = line.match(/^\s*epistemic_status:\s*(\S+)/);
    if (match) {
      assert.ok(CANONICAL_STATUSES.has(match[1]), `epistemic_status ${match[1]} is canonical`);
    }
  }

  const entries = packet.split(/^  - rank: /m).slice(1);
  for (const entry of entries) {
    for (const field of ["key:", "question:", "answer:", "epistemic_status:", "case_against:", "proof:", "loop_status:", "public_safe:", "links:"]) {
      assert.ok(entry.includes(field), `entry ${entry.slice(0, 40).trim()} carries ${field}`);
    }
  }

  // The training question is the only one withheld from the public view so far.
  assert.match(packet, /key: training\n(?:.*\n){1,25}?\s+public_safe: false/);
});

test("mascot records are reachable from the interface node, the packet node, the manifest, and the README", async () => {
  const [interfaceNode, packetNode, manifest, readme] = await Promise.all([
    readFile(interfaceNodePath, "utf8"),
    readFile(packetNodePath, "utf8"),
    readFile(manifestPath, "utf8"),
    readFile(readmePath, "utf8"),
  ]);

  assert.match(interfaceNode, /interface\/yawn-mascot-v0\.1\.yawn/);
  assert.match(interfaceNode, /question-packets\/mascot\.yawn/);
  assert.match(packetNode, /question-packets\/mascot\.yawn/);
  assert.match(manifest, /^  mascot: interface\/yawn-mascot-v0\.1\.yawn$/m);
  assert.match(manifest, /^  mascot: question-packets\/mascot\.yawn$/m);
  assert.match(readme, /interface\/yawn-mascot-v0\.1\.yawn/);
});
