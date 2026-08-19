import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const architectureUrl = new URL("../core/dialogical-orientation-flywheel.v1.json", import.meta.url);
const sessionUrl = new URL("../examples/dialogical-orientation-session-ontology-flywheel.json", import.meta.url);

const requiredFastStages = [
  "relationship_scope",
  "source_preservation",
  "orientation_packet",
  "ratification",
  "authorization",
  "move",
  "consequence_and_proof",
  "update",
];

const requiredDialogicalStages = [
  "relationship_scope",
  "source_preservation",
  "articulation",
  "dialectic",
  "aperture_diversification",
  "dialogos",
  "nexus_and_residue",
  "orientation_packet",
  "ratification",
  "authorization",
  "move",
  "consequence_and_proof",
  "update",
  "optional_graduation_proposal",
];

const requiredSubstrate = ["coupling", "relationship", "agent", "arena"];
const requiredPassFields = [
  "id",
  "actor",
  "stance",
  "accessChannel",
  "method",
  "sourceLineage",
  "findings",
  "limits",
];

function sameArray(actual, expected) {
  return JSON.stringify(actual) === JSON.stringify(expected);
}

function orderedBefore(list, first, second) {
  const firstIndex = list.indexOf(first);
  const secondIndex = list.indexOf(second);
  return firstIndex >= 0 && secondIndex >= 0 && firstIndex < secondIndex;
}

export function validateDialogicalArchitecture(architecture) {
  const errors = [];

  if (architecture.schemaVersion !== "yawn.dialogical-orientation-flywheel.v1") {
    errors.push("Architecture must use yawn.dialogical-orientation-flywheel.v1.");
  }
  if (architecture.canonicalTerm !== "dialogical_orientation") {
    errors.push("The canonical YAWN term must remain dialogical_orientation.");
  }
  if (architecture.classification !== "internal_cross_layer_process") {
    errors.push("Dialogical orientation must remain an internal cross-layer process.");
  }
  if (architecture.notOntologyRoot !== true) {
    errors.push("Dialogical orientation must explicitly remain outside the ontology root.");
  }

  const substrate = architecture.rootDependency?.substrate ?? [];
  if (!sameArray(substrate, requiredSubstrate)) {
    errors.push(`Root dependency must remain ${requiredSubstrate.join(" -> ")}.`);
  }

  const lineage = architecture.externalLineage ?? [];
  const did = lineage.find((item) => item.name === "Dialectic into Dialogos");
  if (!did || !String(did.notClaimed ?? "").includes("not claim")) {
    errors.push("Dialectic into Dialogos must remain attributed lineage, not an identity claim.");
  }

  const fastStages = architecture.modes?.fast?.stages ?? [];
  const dialogicalStages = architecture.modes?.dialogical?.stages ?? [];
  if (!sameArray(fastStages, requiredFastStages)) {
    errors.push("Fast mode stage order has drifted.");
  }
  if (!sameArray(dialogicalStages, requiredDialogicalStages)) {
    errors.push("Dialogical mode stage order has drifted.");
  }

  for (const forbidden of ["articulation", "dialectic", "aperture_diversification", "dialogos", "optional_graduation_proposal"]) {
    if (fastStages.includes(forbidden)) {
      errors.push(`Fast mode must not require ${forbidden}.`);
    }
  }

  const stageEntries = architecture.stages ?? [];
  const stageIds = stageEntries.map((stage) => stage.id);
  if (new Set(stageIds).size !== stageIds.length) {
    errors.push("Architecture stage IDs must be unique.");
  }
  for (const stage of new Set([...requiredFastStages, ...requiredDialogicalStages])) {
    if (!stageIds.includes(stage)) errors.push(`Architecture is missing stage ${stage}.`);
  }

  const dialogos = stageEntries.find((stage) => stage.id === "dialogos");
  if (!dialogos || dialogos.forcedConsensus !== false) {
    errors.push("Dialogos must explicitly reject forced consensus.");
  }
  if (dialogos?.layer !== "internal_cross_layer_process") {
    errors.push("Dialogos must remain an internal cross-layer process rather than a substrate term.");
  }

  for (const [first, second] of [
    ["relationship_scope", "source_preservation"],
    ["dialectic", "dialogos"],
    ["dialogos", "nexus_and_residue"],
    ["orientation_packet", "ratification"],
    ["ratification", "authorization"],
    ["authorization", "move"],
    ["move", "consequence_and_proof"],
    ["consequence_and_proof", "update"],
    ["update", "optional_graduation_proposal"],
  ]) {
    if (!orderedBefore(dialogicalStages, first, second)) {
      errors.push(`${first} must remain before ${second} in dialogical mode.`);
    }
  }

  const passFields = architecture.passContract?.requiredFields ?? [];
  for (const field of requiredPassFields) {
    if (!passFields.includes(field)) errors.push(`Pass contract is missing ${field}.`);
  }
  if (!String(architecture.passContract?.independenceRule ?? "").includes("Repetition is not independent confirmation")) {
    errors.push("The pass contract must discount repeated correlated review.");
  }

  const outputs = new Set(architecture.sessionOutputs ?? []);
  for (const output of ["invariant_core", "complementary_facets", "live_conflicts", "blind_spots", "residue", "ratification_receipt", "proof_contract"]) {
    if (!outputs.has(output)) errors.push(`Session outputs must include ${output}.`);
  }

  const invariants = (architecture.invariants ?? []).join("\n");
  for (const phrase of [
    "Shared reference does not require shared interpretation",
    "may not ratify the human terminal direction",
    "same model repeating itself does not create aperture diversity",
    "move cannot prove itself",
    "fast mode",
  ]) {
    if (!invariants.includes(phrase)) errors.push(`Architecture invariants must preserve: ${phrase}.`);
  }

  return errors;
}

export function validateDialogicalSession(session, architecture) {
  const errors = [];

  if (session.schemaVersion !== "yawn.dialogical-orientation-session.v1") {
    errors.push("Session must use yawn.dialogical-orientation-session.v1.");
  }
  if (!session.question) errors.push("Session requires a focal question.");
  if (session.mode !== "dialogical") errors.push("Canonical fixture must exercise dialogical mode.");
  if (session.relationshipScope?.decisionOwner !== "agent:dave") {
    errors.push("Dave must remain the decision owner in the canonical fixture.");
  }
  if (session.source?.sourcePreserved !== true || !session.source?.rawStatement) {
    errors.push("Session must preserve the raw source before synthesis.");
  }

  const resultVocabulary = new Set(architecture.passContract?.resultVocabulary ?? []);
  const passes = session.passes ?? [];
  if (passes.length < 2) errors.push("Dialogical session requires more than one pass.");

  for (const pass of passes) {
    for (const field of requiredPassFields) {
      if (!(field in pass)) errors.push(`Pass ${pass.id ?? "<unknown>"} is missing ${field}.`);
    }
    if (!Array.isArray(pass.sourceLineage) || pass.sourceLineage.length === 0) {
      errors.push(`Pass ${pass.id ?? "<unknown>"} requires visible source lineage.`);
    }
    for (const finding of pass.findings ?? []) {
      if (!resultVocabulary.has(finding.result)) {
        errors.push(`Pass ${pass.id ?? "<unknown>"} uses unsupported result ${finding.result}.`);
      }
    }
  }

  const passesByActor = new Map();
  for (const pass of passes) {
    const actorPasses = passesByActor.get(pass.actor) ?? [];
    actorPasses.push(pass);
    passesByActor.set(pass.actor, actorPasses);
  }
  for (const [actor, actorPasses] of passesByActor) {
    if (actorPasses.length > 1) {
      for (const pass of actorPasses) {
        if (!Array.isArray(pass.correlatedWith) || pass.correlatedWith.length === 0) {
          errors.push(`Repeated actor ${actor} must disclose correlation on pass ${pass.id}.`);
        }
      }
    }
  }

  const nexus = session.nexus ?? {};
  for (const field of ["invariantCore", "complementaryFacets", "liveConflicts", "blindSpots"]) {
    if (!Array.isArray(nexus[field]) || nexus[field].length === 0) {
      errors.push(`Session nexus requires non-empty ${field}.`);
    }
  }
  if (!Array.isArray(session.residue) || session.residue.length === 0) {
    errors.push("Session must preserve residue rather than forcing synthesis.");
  }

  if (session.ratification?.decisionOwner !== "agent:dave") {
    errors.push("Ratification must remain with Dave in the canonical fixture.");
  }
  if (session.ratification?.epistemicConfidenceSeparateFromAdoption !== true) {
    errors.push("Epistemic confidence and adoption must remain separate.");
  }
  if (session.candidateMove?.externalEffectsAuthorized !== false) {
    errors.push("The architecture fixture must not authorize external effects.");
  }
  if (session.proofContract?.result !== "pending") {
    errors.push("The pre-implementation proof result must remain pending.");
  }
  if (!Array.isArray(session.proofContract?.conditions) || session.proofContract.conditions.length === 0) {
    errors.push("Session requires an explicit proof contract.");
  }

  return errors;
}

export async function loadDialogicalArchitecture() {
  return JSON.parse(await readFile(architectureUrl, "utf8"));
}

export async function loadDialogicalSession() {
  return JSON.parse(await readFile(sessionUrl, "utf8"));
}

async function main() {
  const architecture = await loadDialogicalArchitecture();
  const session = await loadDialogicalSession();
  const errors = [
    ...validateDialogicalArchitecture(architecture),
    ...validateDialogicalSession(session, architecture),
  ];

  if (errors.length > 0) {
    for (const error of errors) console.error(`[dialogical-orientation] ${error}`);
    process.exitCode = 1;
    return;
  }

  console.log("[dialogical-orientation] architecture and canonical session passed.");
}

const invokedPath = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : null;
if (invokedPath === import.meta.url) {
  await main();
}
