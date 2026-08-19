import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const contractUrl = new URL("../core/ontology-layering.v1.json", import.meta.url);
const exampleUrl = new URL("../examples/yawn-explainer-brief-coupling-first.json", import.meta.url);

const requiredLayerOrder = [
  "substrate",
  "epistemic_operation",
  "action_transition",
  "governance",
  "projection",
];

const requiredClassifications = {
  coupling: "substrate",
  relationship: "substrate",
  observation: "epistemic_operation",
  orientation: "epistemic_operation",
  intention: "action_transition",
  move: "action_transition",
  consequence: "action_transition",
  proof: "action_transition",
  authority: "governance",
  graduation: "governance",
  view: "projection",
  video: "projection",
};

export function classificationFor(term, contract) {
  return contract.terms?.[term]
    ?? contract.crossLayerTerms?.[term]?.classification
    ?? null;
}

export function validateLayeringContract(contract) {
  const errors = [];

  if (contract.schemaVersion !== "yawn.ontology-layering.v1") {
    errors.push("Layering contract must use yawn.ontology-layering.v1.");
  }

  if (JSON.stringify(contract.layerOrder) !== JSON.stringify(requiredLayerOrder)) {
    errors.push(`Layer order must be ${requiredLayerOrder.join(" -> ")}.`);
  }

  for (const [term, expectedLayer] of Object.entries(requiredClassifications)) {
    const actualLayer = classificationFor(term, contract);
    if (actualLayer !== expectedLayer) {
      errors.push(`${term} must remain classified as ${expectedLayer}; received ${actualLayer ?? "unclassified"}.`);
    }
  }

  if (classificationFor("agency", contract) !== "cross_layer_capacity") {
    errors.push("agency must remain a cross-layer capacity rather than an ontology root.");
  }

  const rootLayers = contract.publicMission?.headlineRootLayers ?? [];
  if (rootLayers.length !== 1 || rootLayers[0] !== "substrate") {
    errors.push("Whole-system headline roots must compile from the substrate layer.");
  }

  if (contract.publicMission?.terminalGoalOwner !== "rightful_human_or_collective") {
    errors.push("The rightful human or collective must retain terminal-goal ownership.");
  }

  const blockedPromotions = new Set(contract.publicMission?.downstreamTermsMayNotReplacePurpose ?? []);
  for (const term of ["orientation", "agency", "graduation", "autonomy", "automation"]) {
    if (!blockedPromotions.has(term)) {
      errors.push(`${term} must be listed as unable to replace the whole-system purpose by default.`);
    }
  }

  const order = contract.defaultNarrativeOrder ?? [];
  const relationshipIndex = order.indexOf("relationship");
  const orientationIndex = order.indexOf("orientation");
  if (relationshipIndex < 0 || orientationIndex < 0 || relationshipIndex >= orientationIndex) {
    errors.push("Default narrative order must encounter relationship before orientation.");
  }
  if (order.includes("graduation")) {
    errors.push("Graduation belongs in governance and must not enter the default operational narrative loop.");
  }

  if (!contract.sourceIntentRule?.example?.includes("internal proof-gated governance mechanism")) {
    errors.push("The source-intent rule must preserve graduation as an internal proof-gated governance mechanism.");
  }

  return errors;
}

export function validateExplainerBrief(brief, contract) {
  const errors = [];

  if (brief.schemaVersion !== "yawn.explainer-brief.v1") {
    errors.push("Explainer brief must use yawn.explainer-brief.v1.");
  }

  const root = brief.rootSubject;
  if (!root?.term || !root?.layer) {
    errors.push("Explainer brief requires rootSubject.term and rootSubject.layer.");
  } else {
    const expectedLayer = classificationFor(root.term, contract);
    if (!expectedLayer) {
      errors.push(`Root subject ${root.term} is not classified by the ontology layering contract.`);
    }
    if (root.layer !== expectedLayer) {
      errors.push(`Root subject ${root.term} declares ${root.layer} but is classified as ${expectedLayer}.`);
    }
    if (root.layer !== "substrate") {
      errors.push(`Whole-system root subject ${root.term} is downstream (${root.layer}); root subjects must be substrate terms.`);
    }
  }

  for (const term of brief.headlineTerms ?? []) {
    const layer = classificationFor(term, contract);
    if (layer !== "substrate") {
      errors.push(`Headline term ${term} is classified as ${layer ?? "unknown"}; whole-system headline terms must be substrate terms.`);
    }
  }

  for (const mechanism of brief.supportingMechanisms ?? []) {
    const expectedLayer = classificationFor(mechanism.term, contract);
    if (!expectedLayer) {
      errors.push(`Supporting mechanism ${mechanism.term} is not classified.`);
      continue;
    }
    if (mechanism.layer !== expectedLayer) {
      errors.push(`Supporting mechanism ${mechanism.term} declares ${mechanism.layer} but is classified as ${expectedLayer}.`);
    }
  }

  for (const term of brief.internalFlywheel ?? []) {
    const layer = classificationFor(term, contract);
    if (!layer) {
      errors.push(`Internal flywheel term ${term} is not classified.`);
    } else if (layer === "substrate") {
      errors.push(`Substrate term ${term} cannot be demoted into an internal flywheel without a versioned ontology change.`);
    }
    if (brief.rootSubject?.term === term || (brief.headlineTerms ?? []).includes(term)) {
      errors.push(`Term ${term} was explicitly classified as an internal flywheel and cannot also be the whole-system root or headline.`);
    }
  }

  if (brief.terminalGoalOwner !== contract.publicMission?.terminalGoalOwner) {
    errors.push("Explainer brief must preserve rightful human or collective terminal-goal ownership.");
  }

  const primaryLoop = brief.primaryLoop ?? [];
  const relationshipIndex = primaryLoop.indexOf("relationship");
  const orientationIndex = primaryLoop.indexOf("orientation");
  if (relationshipIndex < 0 || orientationIndex < 0 || relationshipIndex >= orientationIndex) {
    errors.push("Explainer primaryLoop must place relationship before orientation.");
  }

  for (const governanceTerm of ["authority", "permission", "delegation", "autonomy", "graduation"]) {
    if (primaryLoop.includes(governanceTerm)) {
      errors.push(`Governance term ${governanceTerm} must gate or support the loop, not replace the primary relationship-to-proof loop.`);
    }
  }

  const namedInternalMechanisms = new Set(brief.sourceIntent?.internalMechanismsNamedByAuthor ?? []);
  for (const term of namedInternalMechanisms) {
    if (brief.rootSubject?.term === term || (brief.headlineTerms ?? []).includes(term)) {
      errors.push(`Source intent names ${term} as internal, but the artifact promotes it into the root or headline.`);
    }
  }

  if (!Array.isArray(brief.notClaimed) || brief.notClaimed.length === 0) {
    errors.push("Explainer brief must state at least one notClaimed boundary.");
  }

  if (brief.proof?.humanReviewRequired !== true) {
    errors.push("Whole-system explainer briefs require human review.");
  }

  return errors;
}

export async function loadLayeringContract() {
  return JSON.parse(await readFile(contractUrl, "utf8"));
}

export async function loadCanonicalExplainerExample() {
  return JSON.parse(await readFile(exampleUrl, "utf8"));
}

async function main() {
  const contract = await loadLayeringContract();
  const example = await loadCanonicalExplainerExample();
  const errors = [
    ...validateLayeringContract(contract),
    ...validateExplainerBrief(example, contract),
  ];

  if (errors.length > 0) {
    for (const error of errors) console.error(`[ontology-layering] ${error}`);
    process.exitCode = 1;
    return;
  }

  console.log("[ontology-layering] contract and canonical explainer brief passed.");
}

const invokedPath = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : null;
if (invokedPath === import.meta.url) {
  await main();
}
