import { createHash } from "node:crypto";

const stable = (value) => {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stable(value[key])]));
  }
  return value;
};

export const canonicalSha256 = (value) => createHash("sha256")
  .update(JSON.stringify(stable(value)))
  .digest("hex");

export function matchActionPolicy(requested, allowed) {
  const reasons = [];
  for (const field of ["repository", "pullRequestNumber", "headSha", "action", "baseBranch", "riskClass"]) {
    if ((requested[field] ?? null) !== (allowed[field] ?? null)) reasons.push(`${field}_mismatch`);
  }
  if (requested.maxCostMicrousd > allowed.maxCostMicrousd) reasons.push("cost_ceiling_exceeded");
  const allowedProof = new Set(allowed.proofKinds);
  if (requested.proofKinds.some((kind) => !allowedProof.has(kind))) reasons.push("proof_contract_mismatch");
  return { matches: reasons.length === 0, reasons };
}

export function evaluateActionGate({ relationship, request, policy = null, observedHeadSha, passedProofKinds = [] }) {
  const blockers = [];
  if (relationship.status !== "active") blockers.push("relationship_not_active");
  if (relationship.authority.selfAuthorizationAllowed !== false) blockers.push("self_authorization_boundary_invalid");
  if (!request.approvalBasis) blockers.push("approval_basis_missing");
  if (request.effectSignature.headSha && request.effectSignature.headSha !== observedHeadSha) blockers.push("stale_head_sha");
  const passed = new Set(passedProofKinds);
  if (request.effectSignature.proofKinds.some((kind) => !passed.has(kind))) blockers.push("required_proof_missing");
  if (policy) {
    if (policy.status !== "active") blockers.push("policy_not_active");
    blockers.push(...matchActionPolicy(request.effectSignature, policy.effectSignature).reasons);
  }
  return { executable: blockers.length === 0, blockers: [...new Set(blockers)] };
}

export function proposePolicyGraduation({ cleanReceiptCount, graduationThreshold, effectSignature, relationshipRef }) {
  if (cleanReceiptCount < graduationThreshold) return null;
  return {
    schemaVersion: "yawn.action-policy.v1",
    status: "proposed",
    relationshipRef,
    effectSignature,
    cleanReceiptCount,
    graduationThreshold,
    activationRequiresRightfulGrantor: true,
  };
}
