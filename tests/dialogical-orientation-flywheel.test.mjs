import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

import {
  loadDialogicalArchitecture,
  loadDialogicalSession,
  validateDialogicalArchitecture,
  validateDialogicalSession,
} from "../scripts/validate-dialogical-orientation.mjs";

const humanContractPath = new URL("../core/DIALOGICAL_ORIENTATION_FLYWHEEL.yawn", import.meta.url);
const agentInstructionsPath = new URL("../AGENTS.md", import.meta.url);
const handoffPath = new URL("../docs/CODEX_DIALOGICAL_FLYWHEEL_HANDOFF_2026-08-19.md", import.meta.url);

test("the canonical dialogical architecture and session validate", async () => {
  const [architecture, session] = await Promise.all([
    loadDialogicalArchitecture(),
    loadDialogicalSession(),
  ]);

  assert.deepEqual(validateDialogicalArchitecture(architecture), []);
  assert.deepEqual(validateDialogicalSession(session, architecture), []);
  assert.equal(architecture.notOntologyRoot, true);
  assert.deepEqual(architecture.rootDependency.substrate, [
    "coupling",
    "relationship",
    "agent",
    "arena",
  ]);
  assert.equal(session.ratification.decisionOwner, "agent:dave");
  assert.equal(session.candidateMove.externalEffectsAuthorized, false);
});

test("Dialogos cannot become the ontology root or forced consensus", async () => {
  const architecture = structuredClone(await loadDialogicalArchitecture());
  architecture.notOntologyRoot = false;
  architecture.rootDependency.substrate = ["dialogos"];
  architecture.stages.find((stage) => stage.id === "dialogos").forcedConsensus = true;

  const errors = validateDialogicalArchitecture(architecture);
  assert.ok(errors.some((error) => /outside the ontology root/.test(error)));
  assert.ok(errors.some((error) => /Root dependency/.test(error)));
  assert.ok(errors.some((error) => /reject forced consensus/.test(error)));
});

test("ratification and authorization must precede movement", async () => {
  const architecture = structuredClone(await loadDialogicalArchitecture());
  const stages = architecture.modes.dialogical.stages;
  const moveIndex = stages.indexOf("move");
  stages.splice(moveIndex, 1);
  stages.splice(stages.indexOf("ratification"), 0, "move");

  const errors = validateDialogicalArchitecture(architecture);
  assert.ok(errors.some((error) => /Dialogical mode stage order has drifted/.test(error)));
  assert.ok(errors.some((error) => /authorization must remain before move/.test(error)));
});

test("repeated passes by one actor must disclose correlation", async () => {
  const [architecture, sessionSource] = await Promise.all([
    loadDialogicalArchitecture(),
    loadDialogicalSession(),
  ]);
  const session = structuredClone(sessionSource);
  session.passes
    .filter((pass) => pass.actor === "agent:chatgpt")
    .forEach((pass) => {
      pass.correlatedWith = [];
    });

  const errors = validateDialogicalSession(session, architecture);
  assert.ok(errors.some((error) => /Repeated actor agent:chatgpt/.test(error)));
});

test("the system cannot ratify Dave's terminal direction", async () => {
  const [architecture, sessionSource] = await Promise.all([
    loadDialogicalArchitecture(),
    loadDialogicalSession(),
  ]);
  const session = structuredClone(sessionSource);
  session.ratification.decisionOwner = "agent:system";

  const errors = validateDialogicalSession(session, architecture);
  assert.ok(errors.some((error) => /Ratification must remain with Dave/.test(error)));
});

test("fast mode avoids ritualizing difficult-turn practices", async () => {
  const architecture = await loadDialogicalArchitecture();
  const fast = architecture.modes.fast.stages;

  for (const stage of ["articulation", "dialectic", "aperture_diversification", "dialogos", "optional_graduation_proposal"]) {
    assert.equal(fast.includes(stage), false);
  }
  assert.match(architecture.modes.fast.rule, /Do not force a ceremonial Dialogos session/);
});

test("human, agent, and Codex handoff documents preserve the process boundary", async () => {
  const [humanContract, agents, handoff] = await Promise.all([
    readFile(humanContractPath, "utf8"),
    readFile(agentInstructionsPath, "utf8"),
    readFile(handoffPath, "utf8"),
  ]);

  assert.match(humanContract, /This is not too far if it remains a process rather than becoming a new root/);
  assert.match(humanContract, /The nexus guides\. It does not govern/);
  assert.match(agents, /dialogical orientation/i);
  assert.match(agents, /fast mode/i);
  assert.match(handoff, /Do not begin by building a new chat shell/);
  assert.match(handoff, /Dave remains the ratifying owner/);
});
