import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import Ajv2020 from "ajv/dist/2020.js";
import {
  canonicalSha256,
  evaluateActionGate,
  matchActionPolicy,
  proposePolicyGraduation,
} from "../lib/delegated-execution-v1.mjs";

const readJson = async (path) => JSON.parse(await readFile(new URL(`../${path}`, import.meta.url), "utf8"));

async function validators() {
  const ajv = new Ajv2020({ allErrors: true, strict: false, formats: { "date-time": true } });
  for (const name of ["record-ref", "action-signature"]) {
    ajv.addSchema(await readJson(`schemas/${name}.v1.schema.json`));
  }
  return Object.fromEntries(await Promise.all([
    "execution-relationship",
    "action-policy",
    "reconciliation-batch",
    "action-receipt",
  ].map(async (name) => [name, ajv.compile(await readJson(`schemas/${name}.v1.schema.json`))])));
}

test("delegated execution fixture validates as a relationship-to-consequence loop", async () => {
  const fixture = await readJson("fixtures/delegated-execution.v1.json");
  const validate = await validators();
  for (const [name, value] of [
    ["execution-relationship", fixture.relationship],
    ["action-policy", fixture.policyProposal],
    ["reconciliation-batch", fixture.batch],
    ["action-receipt", fixture.receipt],
  ]) assert.equal(validate[name](value), true, `${name}: ${JSON.stringify(validate[name].errors)}`);
});

test("exact policy matching rejects head, action, boundary, cost, and proof drift", async () => {
  const fixture = await readJson("fixtures/delegated-execution.v1.json");
  const allowed = fixture.policyProposal.effectSignature;
  assert.deepEqual(matchActionPolicy(allowed, allowed), { matches: true, reasons: [] });
  const drifted = { ...allowed, headSha: "0".repeat(40), action: "close", riskClass: "release", maxCostMicrousd: 1, proofKinds: [...allowed.proofKinds, "deployment"] };
  assert.deepEqual(matchActionPolicy(drifted, allowed).reasons, ["headSha_mismatch", "action_mismatch", "riskClass_mismatch", "cost_ceiling_exceeded", "proof_contract_mismatch"]);
});

test("the action gate requires active relationship, owner approval, fresh SHA, and proof", async () => {
  const fixture = await readJson("fixtures/delegated-execution.v1.json");
  const request = { approvalBasis: fixture.receipt.approvalBasis, effectSignature: fixture.receipt.effectSignature };
  assert.deepEqual(evaluateActionGate({
    relationship: fixture.relationship,
    request,
    observedHeadSha: fixture.receipt.observedHeadSha,
    passedProofKinds: fixture.receipt.effectSignature.proofKinds,
  }), { executable: true, blockers: [] });
  const blocked = evaluateActionGate({ relationship: { ...fixture.relationship, status: "paused" }, request, observedHeadSha: "0".repeat(40), passedProofKinds: [] });
  assert.deepEqual(blocked.blockers, ["relationship_not_active", "stale_head_sha", "required_proof_missing"]);
});

test("receipt graduation proposes but never activates policy", async () => {
  const fixture = await readJson("fixtures/delegated-execution.v1.json");
  assert.equal(proposePolicyGraduation({ cleanReceiptCount: 4, graduationThreshold: 5, effectSignature: fixture.receipt.effectSignature, relationshipRef: fixture.receipt.relationshipRef }), null);
  const proposal = proposePolicyGraduation({ cleanReceiptCount: 5, graduationThreshold: 5, effectSignature: fixture.receipt.effectSignature, relationshipRef: fixture.receipt.relationshipRef });
  assert.equal(proposal.status, "proposed");
  assert.equal(proposal.activationRequiresRightfulGrantor, true);
  assert.match(canonicalSha256(proposal), /^[a-f0-9]{64}$/);
});
