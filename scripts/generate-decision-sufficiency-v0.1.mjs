import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { pathToFileURL } from "node:url";
import { canonicalSha256, evaluateActionGate } from "../lib/delegated-execution-v1.mjs";
import { analyzeProjection, receiptSha256 } from "../lib/decision-sufficiency-v0.1.mjs";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");
const hashText = (text) => createHash("sha256").update(text.replaceAll("\r\n", "\n")).digest("hex");
export const artifactPath = "fixtures/decision-sufficiency.v0.1.json";

export function gateInputForState(state, baseline, query) {
  const a = state.attributes;
  return {
    relationship: {
      ...baseline.relationship,
      status: a.relationship_status,
      authority: { ...baseline.relationship.authority, selfAuthorizationAllowed: a.self_authorization_allowed },
    },
    request: { approvalBasis: a.approval_basis, effectSignature: query.effectSignature },
    observedHeadSha: a.observed_head_sha,
    passedProofKinds: a.passed_proof_kinds,
    policy: {
      ...baseline.policyProposal,
      status: a.policy_status,
      effectSignature: { ...baseline.policyProposal.effectSignature, repository: a.policy_repository },
    },
  };
}

export async function buildDecisionSufficiencyExperiment() {
  const baseline = JSON.parse(await read("fixtures/delegated-execution.v1.json"));
  const evaluatorText = await read("lib/delegated-execution-v1.mjs");
  const generatorSha256 = hashText(await read("scripts/generate-decision-sufficiency-v0.1.mjs"));
  const experiment = {
    domain: "delegated-execution-fixture",
    status: "experimental",
    normativeAuthority: "none",
    fixtureIsSynthetic: true,
    liveEffects: false,
  };
  const source = {
    repository: "https://github.com/yawn-ai/.yawn",
    // This is the source of the reused gate and input fixture, not this experiment's release commit.
    commit: "507303b63af231afad8fcae86482cfae2272649b",
    fixtureRef: "fixtures/delegated-execution.v1.json",
    sourceArtifactSha256: canonicalSha256(baseline),
    hashEncoding: "canonical-json",
  };
  const queryBody = {
    queryId: "query:synthetic:exact-merge-8",
    text: "Is this exact modeled merge executable under the recorded gate conditions?",
    effectSignature: structuredClone(baseline.receipt.effectSignature),
  };
  const query = { ...queryBody, querySha256: canonicalSha256(queryBody) };
  // The decision depends on the adapter and its shared fixture constants too.
  // Pinning only the gate source would miss, for example, changed policy scope.
  const evaluatorDependencies = {
    gateSourceSha256: hashText(evaluatorText),
    adapterSha256: generatorSha256,
    sourceFixtureSha256: source.sourceArtifactSha256,
  };
  const referenceEvaluator = {
    id: "evaluateActionGate",
    version: "delegated-execution-v1",
    sourceRef: "lib/delegated-execution-v1.mjs",
    sourceSha256: hashText(evaluatorText),
    dependencies: evaluatorDependencies,
    evaluatorSha256: canonicalSha256(evaluatorDependencies),
    resultDomain: ["executable", "blocked"],
    limitations: [
      "Approval basis is tested for presence, not independently verified for legitimacy or revocation.",
      "The gate assumes valid input shapes; this instrument supplies a bounded synthetic state space.",
      "An executable fixture outcome grants no real authority and triggers no operation.",
    ],
  };
  // Cartesian product fixed before evaluation. Labels are deliberately irrelevant.
  // Requested effect signature stays fixed so every fiber concerns the same query.
  const domains = {
    approval_basis: [baseline.receipt.approvalBasis, null],
    display_label: ["Operation A", "Operation B"],
    observed_head_sha: [query.effectSignature.headSha, "0".repeat(40)],
    passed_proof_kinds: [query.effectSignature.proofKinds, query.effectSignature.proofKinds.slice(1)],
    policy_repository: [query.effectSignature.repository, "yawn-ai/synthetic-other"],
    policy_status: ["active", "proposed"],
    relationship_status: ["active", "paused"],
    self_authorization_allowed: [false, true],
  };
  let attributes = [{ approval_summary: "Owner approval recorded" }];
  for (const [field, values] of Object.entries(domains)) {
    attributes = attributes.flatMap((existing) => values.map((value) => ({ ...existing, [field]: structuredClone(value) })));
  }
  const states = attributes.map((attributes, index) => {
    const state = { id: `state:synthetic:${String(index).padStart(3, "0")}`, attributes };
    const result = evaluateActionGate(gateInputForState(state, baseline, query));
    return { ...state, referenceDecision: result.executable ? "executable" : "blocked", blockers: result.blockers };
  });
  const projectionBody = {
    projectionId: "projection:decision-sufficiency:coarse-v0.1",
    visibleFields: ["approval_summary"],
    candidateFields: Object.keys(domains).sort(),
  };
  const projection = { ...projectionBody, projectionSha256: canonicalSha256(projectionBody) };
  const analyze = (visibleFields, candidateFields) => analyzeProjection({
    states, visibleFields, candidateFields,
    decide: (state) => evaluateActionGate(gateInputForState(state, baseline, query)).executable ? "executable" : "blocked",
  });
  const coarse = analyze(projection.visibleFields, projection.candidateFields);
  const bindings = {
    stateSpaceSha256: canonicalSha256(states.map(({ id, attributes }) => ({ id, attributes }))),
    querySha256: query.querySha256,
    projectionSha256: projection.projectionSha256,
    evaluatorSha256: referenceEvaluator.evaluatorSha256,
  };
  const receipts = coarse.fibers.map((fiber, index) => {
    const receipt = {
      schemaVersion: "yawn.decision-sufficiency-receipt.v0.1",
      receiptId: `receipt:decision-sufficiency:synthetic:${index}`,
      experiment, source, query, referenceEvaluator, projection, bindings,
      fiber: { visibleValue: fiber.visibleValue, stateRefs: fiber.stateRefs, decisionValues: fiber.decisionValues },
      result: { decisionState: fiber.decisionState, enforcementDisposition: fiber.enforcementDisposition },
      ambiguityWitness: fiber.ambiguityWitness,
      refinement: fiber.refinement,
      boundaries: {
        receiptGrantsAuthority: false, projectionGrantsAuthority: false,
        refinementGrantsDisclosure: false, fixtureIsSynthetic: true,
      },
    };
    return { ...receipt, replay: { receiptSha256: receiptSha256(receipt) } };
  });
  const canonicalRefinement = receipts[0].refinement.canonicalRefinement;
  const refined = analyze([...projection.visibleFields, ...canonicalRefinement], []);
  return {
    schemaVersion: "yawn.decision-sufficiency-experiment.v0.1",
    experiment, source, query, referenceEvaluator, projection,
    instrument: {
      version: "decision-sufficiency-v0.1",
      sourceSha256: hashText(await read("lib/decision-sufficiency-v0.1.mjs")),
      generatorSha256,
    },
    domains, states, receipts, refinedFibers: refined.fibers,
    summary: {
      stateCount: states.length,
      executableStateCount: states.filter(({ referenceDecision }) => referenceDecision === "executable").length,
      blockedStateCount: states.filter(({ referenceDecision }) => referenceDecision === "blocked").length,
      coarseFiberCount: coarse.fibers.length,
      ambiguousFiberCount: coarse.fibers.filter(({ decisionState }) => decisionState === "needs_refinement").length,
      minimumRefinementCardinality: canonicalRefinement.length,
      excludedCandidateFields: projection.candidateFields.filter((field) => !canonicalRefinement.includes(field)),
      refinedFiberCount: refined.fibers.length,
      refinedAmbiguousFiberCount: refined.fibers.filter(({ decisionState }) => decisionState === "needs_refinement").length,
    },
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const result = await buildDecisionSufficiencyExperiment();
  const bytes = `${JSON.stringify(result, null, 2)}\n`;
  if (process.argv.includes("--check")) {
    // Artifact transport pins use LF bytes in every checkout, independently of Git autocrlf.
    if ((await read(artifactPath)).replaceAll("\r\n", "\n") !== bytes) throw new Error("Decision Sufficiency artifact has drifted; regenerate and review it");
  } else {
    await writeFile(new URL(artifactPath, root), bytes);
  }
  console.log(JSON.stringify(result.summary, null, 2));
  console.log(`Artifact SHA-256 (LF bytes): ${createHash("sha256").update(bytes).digest("hex")}`);
}
