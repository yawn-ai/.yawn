import { readFile, writeFile } from "node:fs/promises";
import { buildRuntimeIndex, resolveForAction, projectRuntimeDisclosure } from "../lib/runtime-action-v0.1.mjs";
import { syntheticConformanceHost } from "../lib/runtime-action-conformance-v0.1.mjs";

const { profiles: sourceProfiles } = JSON.parse(await readFile(new URL("../fixtures/runtime-profile.v0.1.json", import.meta.url), "utf8"));
const profiles = structuredClone(sourceProfiles);
const email = { id: "email.send", effect: "send", binding: { protocol: "mcp", server_ref: "connector:mail", operation: "tools/call", tool: "send_message" }, authorization: { mode: "current_grant_required" } };
profiles[0].runtime.capabilities = [email];
const compare = { id: "action:compare", kind: "movement.compare", program_id: "yawn.movement.compare@1", skill_ids: ["draft-schedule"], capability_ids: [], resource_refs: ["schedule:shop"] };
const send = { id: "action:send", kind: "customer.contact", program_id: "yawn.customer.contact@1", skill_ids: [], capability_ids: ["email.send"], resource_refs: ["customer:reviewed-recipient"], input_digest: `sha256:${"1".repeat(64)}` };
const baseHost = {
  programs: [
    { id: compare.program_id, handler: compare.program_id, actions: [compare.kind], skill_ids: ["draft-schedule"], capability_ids: ["research.read"] },
    { id: send.program_id, handler: send.program_id, actions: [send.kind], skill_ids: [], capability_ids: ["email.send"] },
  ],
  supported_handlers: [compare.program_id, send.program_id, "yawn.require-grant@1", "yawn.verify.artifact-exists@1"],
  dynamic: { grants_revision: "grants:1", budget_revision: "budget:1", cancellation_epoch: 0 },
  adoptions: profiles.flatMap((profile) => (profile.runtime.rules ?? []).filter(({ state }) => state === "adopted").map((item) => ({ profile_id: profile.id, item }))),
  skills: profiles.flatMap((profile) => (profile.runtime.skills ?? []).map((item) => ({ profile_id: profile.id, item }))),
  capabilities: profiles.flatMap((profile) => (profile.runtime.capabilities ?? []).filter(({ id }) => id !== "email.send").map((item) => ({ profile_id: profile.id, item }))),
  rule_checks: [{ action_id: send.id, rule_id: "customer-contact-approval", profile_id: profiles[0].id, allowed: true }],
  grants: [{ action_id: compare.id, capability_ids: ["research.read"], allowed: true }, { action_id: send.id, capability_ids: ["email.send"], allowed: true }],
  budgets: [compare, send].map(({ id }) => ({ action_id: id, allowed: true })),
  cancellations: [compare, send].map(({ id }) => ({ action_id: id, allowed: true })),
};
const cases = [];
function add(id, { docs = profiles, action = compare, host = baseHost, disclose = false } = {}) {
  const indexed = buildRuntimeIndex(docs.at(-1).id, docs);
  const expected = indexed.status === "indexed" ? resolveForAction(indexed.index, action, syntheticConformanceHost(host)) : indexed;
  cases.push({ id, profiles: structuredClone(docs), action: structuredClone(action), trusted_host: structuredClone(host), expected, expected_disclosure: projectRuntimeDisclosure(expected, { canDisclose: ({ kind, item }) => disclose && !(kind === "rule" && item.id === "private-contact-policy") }) });
}
add("optional-unverified-email-does-not-hold-comparison");
add("selected-unverified-email-is-held", { action: send });
const revoked = structuredClone(baseHost);
revoked.capabilities.push({ profile_id: profiles[0].id, item: email });
revoked.grants.find(({ action_id }) => action_id === send.id).allowed = false;
revoked.dynamic.grants_revision = "grants:2";
add("revoked-grant-is-held", { action: send, host: revoked });
const noBudget = structuredClone(baseHost);
noBudget.budgets[0].allowed = false; noBudget.dynamic.budget_revision = "budget:2";
add("exhausted-budget-is-held", { host: noBudget });
const cancelled = structuredClone(baseHost);
cancelled.cancellations[0].allowed = false; cancelled.dynamic.cancellation_epoch = 1;
add("cancelled-action-is-held", { host: cancelled });
const displayChange = structuredClone(profiles);
displayChange[0].title = "A changed display title"; displayChange[0].revision += 1;
add("display-edit-changes-only-document-hash", { docs: displayChange });
const optionalChange = structuredClone(profiles);
optionalChange[0].runtime.capabilities[0].binding.tool = "deliver_message";
add("unrelated-binding-changes-only-operational-revision", { docs: optionalChange });
const privateDocs = structuredClone(profiles), privateHost = structuredClone(baseHost);
const privateRule = { id: "private-contact-policy", revision: 1, type: "boundary", state: "adopted", statement: "Private recipient details must never appear in a public explanation.", scope: { actions: [compare.kind], descendants: true }, enforcement: { mode: "code", handler: "yawn.private-policy@1" }, adoption_ref: "event:private-policy", source_refs: ["source:private-recipient-details"] };
privateDocs[0].runtime.rules.push(privateRule);
privateHost.adoptions.push({ profile_id: profiles[0].id, item: privateRule });
privateHost.rule_checks.push({ action_id: compare.id, rule_id: privateRule.id, profile_id: profiles[0].id, allowed: true });
privateHost.supported_handlers.push(privateRule.enforcement.handler);
add("private-rule-enforced-before-public-projection", { docs: privateDocs, host: privateHost, disclose: true });
const unsupported = structuredClone(privateHost);
unsupported.supported_handlers = unsupported.supported_handlers.filter((id) => id !== privateRule.enforcement.handler);
add("relevant-unsupported-handler-is-held", { docs: privateDocs, host: unsupported });
add("missing-parent-holds-structural-index", { docs: profiles.slice(1) });
const corpus = { contract: "yawn.runtime-action-golden.v0.1", "$comment": "Synthetic trusted host snapshots. These records are test assumptions, never authority or production grant evidence. Expected outputs and SHA-256 digests are committed language-neutral conformance vectors.", cases };
await writeFile(new URL("../fixtures/runtime-action-golden.v0.1.json", import.meta.url), `${JSON.stringify(corpus, null, 2)}\n`);
console.log(`Generated ${cases.length} Runtime Action 0.1 golden cases.`);
