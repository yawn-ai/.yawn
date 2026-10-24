import assert from "node:assert/strict";
import test from "node:test";
import { stringify } from "yaml";
import {
  normalizePrimaryParent,
  parseRuntimeProfile,
  resolveRuntimeConfig,
  validateRuntimeProfile,
} from "../lib/runtime-profile-v0.1.mjs";

const profile = (runtime = {}) => ({
  spec_version: "yawn.runtime-profile.v0.1",
  kind: "yawn",
  id: "yawn:review",
  revision: 1,
  primary_parent_id: null,
  runtime,
  provenance: { source_refs: ["source:synthetic-review"] },
});
const capability = () => ({
  id: "research.read",
  effect: "read",
  binding: { protocol: "mcp", server_ref: "connector:unverified", operation: "tools/call", tool: "search" },
  authorization: { mode: "current_grant_required" },
});
const hasCode = (result, code) => result.issues.some((issue) => issue.code === code);

test("an invalid target never resolves to an empty configuration or reaches host verification", () => {
  const input = profile({ capabilities: [capability()] });
  let calls = 0;
  for (const target of [null, undefined, false, 0, "", "/review", "https://example.test/review"]) {
    const result = resolveRuntimeConfig(target, [input], { verifyCapability: () => { calls++; return true; } });
    assert.equal(result.status, "held");
    assert.equal(result.config, null);
    assert.equal(result.semantic_revision, null);
    assert.ok(hasCode(result, "invalid_target"));
  }
  assert.equal(calls, 0);
});

test("YAML directives cannot redefine core tags or introduce unused custom tag vocabularies", () => {
  const body = stringify(profile());
  for (const directive of [
    "%TAG !! tag:example.test,2026:",
    "%TAG ! tag:example.test,2026:",
    "%TAG !custom! tag:example.test,2026:",
  ]) {
    assert.throws(() => parseRuntimeProfile(`${directive}\n---\n${body}`), { code: "yaml_directive" });
  }
  assert.deepEqual(parseRuntimeProfile(`%YAML 1.2\n---\n${body}`), profile());
});

test("provider descriptors cannot verify their own capability identity, effect or binding", () => {
  const input = profile({ capabilities: [capability()] });
  for (const decision of [undefined, false, "true", 1, Promise.resolve(true)]) {
    const result = resolveRuntimeConfig(input.id, [input], { verifyCapability: () => decision });
    assert.equal(result.status, "held");
    assert.ok(hasCode(result, "unverified_capability"));
  }
  let checked;
  const allowed = resolveRuntimeConfig(input.id, [input], {
    verifyCapability: (item, source) => {
      checked = { id: item.id, server: item.binding.server_ref, effect: item.effect, source: source.id };
      return true;
    },
  });
  assert.deepEqual(checked, { id: "research.read", server: "connector:unverified", effect: "read", source: input.id });
  assert.equal(allowed.status, "resolved");
  assert.equal(Object.hasOwn(allowed.config, "grants"), false);
  assert.equal(allowed.config.capabilities[0].authorization.mode, "current_grant_required");
});

test("a function capability needs both trusted binding verification and handler support", () => {
  const item = capability();
  item.binding = { protocol: "function", handler: "yawn.search@1" };
  const input = profile({ capabilities: [item] });
  assert.ok(hasCode(resolveRuntimeConfig(input.id, [input], { supportedHandlers: [item.binding.handler] }), "unverified_capability"));
  assert.ok(hasCode(resolveRuntimeConfig(input.id, [input], { verifyCapability: () => true }), "unsupported_handler"));
  assert.equal(resolveRuntimeConfig(input.id, [input], {
    verifyCapability: () => true,
    supportedHandlers: [item.binding.handler],
  }).status, "resolved");
});

test("host checks receive immutable copies and failed mutation cannot turn into acceptance", () => {
  const input = profile({ capabilities: [capability()] });
  const before = structuredClone(input);
  const result = resolveRuntimeConfig(input.id, [input], {
    verifyCapability: (item) => { item.binding.server_ref = "connector:replacement"; return true; },
  });
  assert.equal(result.status, "held");
  assert.ok(hasCode(result, "unverified_capability"));
  assert.deepEqual(input, before);
});

test("object validation rejects arrays that JSON would silently change or discard", () => {
  for (const array of [new Array(1), Object.assign([1], { hidden: "would disappear in JSON" })]) {
    const input = profile();
    input.extensions = { "org.example.review": { array } };
    assert.equal(validateRuntimeProfile(input)[0].code, "non_json_data");
  }
});

test("ancestry normalization never reads a source-version accessor before rejecting it", () => {
  let calls = 0;
  const input = { primary_parent_id: null };
  Object.defineProperty(input, "spec_version", {
    get() { calls++; return "yawn.runtime-profile.v0.1"; },
    enumerable: true,
  });
  assert.throws(() => normalizePrimaryParent(input), { code: "non_json_data" });
  assert.equal(calls, 0);
});

test("malformed profile collections are held before any index getter or custom iterator runs", () => {
  let calls = 0;
  const accessor = [];
  Object.defineProperty(accessor, "0", { get() { calls++; return profile(); }, enumerable: true });
  const customIterator = [profile()];
  Object.defineProperty(customIterator, Symbol.iterator, {
    value: function* () { calls++; yield profile(); },
  });
  for (const inputs of [new Array(1), accessor, customIterator, Object.assign([profile()], { extra: true })]) {
    const result = resolveRuntimeConfig("yawn:review", inputs);
    assert.equal(result.status, "held");
    assert.equal(result.config, null);
  }
  assert.equal(calls, 0);
});

test("custom array prototypes cannot introduce inherited executable iteration", () => {
  let calls = 0;
  class ExecutableArray extends Array {
    *[Symbol.iterator]() { calls++; yield profile(); }
  }
  const inputs = new ExecutableArray(profile());
  const result = resolveRuntimeConfig("yawn:review", inputs);
  assert.equal(result.status, "held");
  assert.equal(result.config, null);
  assert.equal(calls, 0);
  const input = profile({ rules: new ExecutableArray() });
  assert.equal(validateRuntimeProfile(input)[0].code, "object_prototype");
  assert.equal(calls, 0);
});

test("unsupported instruction replacement cannot silently leave both instructions effective", () => {
  const input = profile({ instructions: [{
    id: "replacement",
    text: "New instruction",
    effect: "model",
    source_refs: ["source:review"],
    supersedes: ["prior"],
  }] });
  assert.ok(validateRuntimeProfile(input).some((issue) => issue.code === "schema"));
});
