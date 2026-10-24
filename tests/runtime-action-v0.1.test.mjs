import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { buildRuntimeIndex, resolveForAction, projectRuntimeDisclosure, describeRuntimeBlockers } from "../lib/runtime-action-v0.1.mjs";
import { syntheticConformanceHost } from "../lib/runtime-action-conformance-v0.1.mjs";

const corpus = JSON.parse(await readFile(new URL("../fixtures/runtime-action-golden.v0.1.json", import.meta.url), "utf8"));
const clone = (value) => structuredClone(value);
const baseline = corpus.cases[0];
const resolve = (entry) => {
  const indexed = buildRuntimeIndex(entry.profiles.at(-1).id, entry.profiles);
  return indexed.status === "indexed" ? resolveForAction(indexed.index, entry.action, syntheticConformanceHost(entry.trusted_host)) : indexed;
};
const codes = (result) => result.issues.map(({ code }) => code);

test("language-neutral golden vectors match exact outputs, issues and SHA-256 digests", () => {
  assert.equal(corpus.contract, "yawn.runtime-action-golden.v0.1");
  for (const entry of corpus.cases) {
    const result = resolve(entry);
    assert.deepEqual(result, entry.expected, entry.id);
    const disclosure = projectRuntimeDisclosure(result, {
      canDisclose: ({ kind, item }) => entry.id === "private-rule-enforced-before-public-projection" && !(kind === "rule" && item.id === "private-contact-policy"),
    });
    assert.deepEqual(disclosure, entry.expected_disclosure, `${entry.id}: disclosure`);
  }
});

test("document, operational and action revisions have distinct invalidation boundaries", () => {
  const [base, , , , , display, optional] = corpus.cases;
  assert.notEqual(base.expected.document_hash, display.expected.document_hash);
  assert.equal(base.expected.operational_revision, display.expected.operational_revision);
  assert.equal(base.expected.action_revision, display.expected.action_revision);
  assert.notEqual(base.expected.operational_revision, optional.expected.operational_revision);
  assert.equal(base.expected.action_revision, optional.expected.action_revision);
  const changed = clone(baseline);
  changed.trusted_host.dynamic.grants_revision = "grants:changed";
  assert.notEqual(resolve(changed).action_revision, base.expected.action_revision);
  changed.trusted_host.dynamic = clone(baseline.trusted_host.dynamic);
  changed.profiles[2].runtime.skills[0].config = { title: "An operational parameter, not display metadata" };
  changed.trusted_host.skills[0].item.config = clone(changed.profiles[2].runtime.skills[0].config);
  assert.notEqual(resolve(changed).action_revision, base.expected.action_revision);
});

test("optional unsupported skills and capabilities hold only actions that select them", () => {
  const entry = clone(baseline);
  entry.profiles[2].runtime.skills.push({ ...clone(entry.profiles[2].runtime.skills[0]), id: "optional-email", capabilities: ["email.send"] });
  const indexed = buildRuntimeIndex(entry.profiles[2].id, entry.profiles);
  assert.equal(indexed.status, "indexed");
  assert.equal(resolveForAction(indexed.index, entry.action, syntheticConformanceHost(entry.trusted_host)).status, "resolved");
  entry.action.skill_ids.push("optional-email");
  entry.trusted_host.programs[0].skill_ids.push("optional-email");
  entry.trusted_host.programs[0].capability_ids.push("email.send");
  const held = resolveForAction(indexed.index, entry.action, syntheticConformanceHost(entry.trusted_host));
  assert.equal(held.status, "held");
  assert.ok(codes(held).includes("unverified_skill"));
  assert.ok(codes(held).includes("unverified_capability"));
});

test("revision strings are dependencies and never substitute for current host decisions", () => {
  const indexed = buildRuntimeIndex(baseline.profiles[2].id, baseline.profiles);
  const host = syntheticConformanceHost(baseline.trusted_host);
  for (const callback of ["verifyAdoption", "verifySkill", "verifyCapability", "checkGrant", "checkBudget", "checkCancellation"]) {
    for (const decision of [false, "true", Promise.resolve(true)]) {
      const result = resolveForAction(indexed.index, baseline.action, { ...host, [callback]: () => decision });
      assert.equal(result.status, "held", callback);
      assert.equal(result.config, null);
      assert.equal(result.action_revision, null);
    }
  }
});

test("hard boundaries need code or recorded human evaluation and cannot fall back to model advice", () => {
  const entry = clone(corpus.cases.find(({ id }) => id === "private-rule-enforced-before-public-projection"));
  const privateRule = entry.profiles[0].runtime.rules.find(({ id }) => id === "private-contact-policy");
  privateRule.enforcement = { mode: "model" };
  entry.trusted_host.adoptions.find(({ item }) => item.id === privateRule.id).item = clone(privateRule);
  const result = resolve(entry);
  assert.equal(result.status, "held");
  assert.ok(codes(result).includes("unsupported_admission_enforcement"));
  const human = clone(entry);
  human.profiles[0].runtime.rules.find(({ id }) => id === privateRule.id).enforcement = { mode: "human" };
  human.trusted_host.adoptions.find(({ item }) => item.id === privateRule.id).item = clone(human.profiles[0].runtime.rules.find(({ id }) => id === privateRule.id));
  assert.equal(resolve(human).status, "resolved");
});

test("a private rule is enforced before a permitted explanation or model context is projected", () => {
  const entry = corpus.cases.find(({ id }) => id === "private-rule-enforced-before-public-projection");
  const indexed = buildRuntimeIndex(entry.profiles[2].id, entry.profiles);
  const host = syntheticConformanceHost(entry.trusted_host);
  let evaluated = false;
  const result = resolveForAction(indexed.index, entry.action, { ...host, evaluateRule: (rule) => { evaluated = rule.id === "private-contact-policy"; return true; } });
  assert.equal(result.status, "resolved");
  assert.equal(evaluated, true);
  for (const audience of ["participant", "model"]) {
    const view = projectRuntimeDisclosure(result, { audience, canDisclose: ({ kind, item }) => !(kind === "rule" && item.id === "private-contact-policy") });
    const serialized = JSON.stringify(view);
    assert.equal(serialized.includes("Private recipient details"), false);
    assert.equal(serialized.includes("source:private-recipient-details"), false);
    assert.equal(serialized.includes("private-contact-policy"), false);
  }
  assert.deepEqual(projectRuntimeDisclosure(result).rules, []);
  const denied = resolveForAction(indexed.index, entry.action, { ...host, evaluateRule: () => false });
  assert.equal(denied.status, "held");
  assert.deepEqual(projectRuntimeDisclosure(denied).reason_codes, ["rule_unsatisfied"]);
});

test("indexes are reproducible immutable data and edited projections cannot bypass source validation", () => {
  const indexed = buildRuntimeIndex(baseline.profiles[2].id, baseline.profiles);
  const tampered = clone(indexed.index);
  tampered.config.rules = [];
  assert.ok(codes(resolveForAction(tampered, baseline.action, syntheticConformanceHost(baseline.trusted_host))).includes("index_changed"));
  assert.throws(() => { indexed.index.config.rules.length = 0; }, TypeError);
  let calls = 0;
  const input = {};
  Object.defineProperty(input, "target_id", { enumerable: true, get() { calls++; return "yawn:shop"; } });
  assert.equal(resolveForAction(input, baseline.action).status, "held");
  assert.equal(calls, 0);
});

test("host programs bound selected methods and cannot become dynamic imports or extra tool grants", () => {
  const indexed = buildRuntimeIndex(baseline.profiles[2].id, baseline.profiles);
  const host = syntheticConformanceHost(baseline.trusted_host);
  const wrong = { ...baseline.action, capability_ids: ["email.send"] };
  assert.ok(codes(resolveForAction(indexed.index, wrong, host)).includes("program_selection_mismatch"));
  host.programs[0].handler = "../../run.mjs";
  assert.ok(codes(resolveForAction(indexed.index, baseline.action, host)).includes("invalid_host_registry"));
});

test("a new relevant parent rule invalidates action identity while lateral evidence creates no governance", () => {
  const entry = clone(baseline);
  const root = entry.profiles[0];
  const rule = { ...clone(root.runtime.rules[0]), id: "new-parent-boundary", type: "boundary", scope: { descendants: true, actions: [entry.action.kind] } };
  root.runtime.rules.push(rule);
  entry.trusted_host.adoptions.push({ profile_id: root.id, item: rule });
  entry.trusted_host.rule_checks.push({ action_id: entry.action.id, rule_id: rule.id, profile_id: root.id, allowed: true });
  assert.notEqual(resolve(entry).action_revision, baseline.expected.action_revision);
  const lateral = clone(baseline);
  lateral.profiles[1].lateral_relations = [{ type: "supports", target_id: "yawn:unloaded-evidence" }];
  assert.equal(resolve(lateral).action_revision, baseline.expected.action_revision);
});

test("no eligible action is a blocker and does not prove the goal impossible", () => {
  for (const results of [[], corpus.cases.filter(({ expected }) => expected.status === "held").map(({ expected }) => expected)]) {
    const described = describeRuntimeBlockers(results);
    assert.equal(described.state, "no_eligible_action");
    assert.equal(described.impossible, false);
    assert.ok(described.alternatives.includes("propose_amendment"));
    assert.ok(described.alternatives.includes("hold"));
  }
});
