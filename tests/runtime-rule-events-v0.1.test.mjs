import assert from "node:assert/strict";
import test from "node:test";
import { reduceRuleEvents, RuleEventError, ruleMeaningHash, ruleScopeHash } from "../lib/runtime-rule-events-v0.1.mjs";

const rule = (overrides = {}) => ({
  id: "customer-contact", revision: 1, type: "permission_requirement", state: "proposed",
  statement: "Customer contact requires a current grant.",
  scope: { descendants: true, actions: ["customer.contact"] },
  enforcement: { mode: "code", handler: "yawn.require-grant@1", parameters: { grant: "shop.customer-contact" } },
  source_refs: ["source:owner-contact-restriction"],
  ...overrides,
});
const propose = (value = rule(), eventId = "event:propose") => ({ event_id: eventId, operation: "propose_rule", rule: value });
const adopt = (value = rule(), overrides = {}) => ({
  event_id: "event:adopt", operation: "adopt_rule", rule_id: value.id, expected_rule_revision: value.revision,
  reviewed_meaning_hash: ruleMeaningHash(value), reviewed_scope_hash: ruleScopeHash(value),
  authorized_by: "principal:owner", ...overrides,
});
const replacement = (overrides = {}) => rule({ revision: 3, state: "adopted", ...overrides });
const supersede = (value = replacement(), overrides = {}) => ({
  event_id: "event:supersede", operation: "supersede_rule", rule_id: value.id, expected_rule_revision: 2,
  replacement: value, reviewed_meaning_hash: ruleMeaningHash(value), reviewed_scope_hash: ruleScopeHash(value),
  authorized_by: "principal:owner", ...overrides,
});
const retire = (overrides = {}) => ({
  event_id: "event:retire", operation: "retire_rule", rule_id: "customer-contact", expected_rule_revision: 2,
  authorized_by: "principal:owner", ...overrides,
});
const allow = { authorize: () => true };
const errorCodes = (result) => result.errors.map((error) => error.code);

test("rule adoption binds actual enforcement and scope, while object/action ordering is immaterial", () => {
  const original = rule({ scope: { descendants: true, actions: ["customer.contact", "customer.read"] } });
  const reordered = rule({
    scope: { actions: ["customer.read", "customer.contact"], descendants: true },
    enforcement: { parameters: { grant: "shop.customer-contact" }, handler: "yawn.require-grant@1", mode: "code" },
  });
  assert.equal(ruleMeaningHash(original), ruleMeaningHash(reordered));
  assert.equal(ruleScopeHash(original), ruleScopeHash(reordered));
  const changedMeaning = [
    rule({ statement: "Customer contact is allowed." }),
    rule({ type: "default" }),
    rule({ enforcement: { mode: "model" } }),
    rule({ enforcement: { mode: "code", handler: "yawn.require-grant@2", parameters: { grant: "shop.customer-contact" } } }),
    rule({ enforcement: { mode: "code", handler: "yawn.require-grant@1", parameters: { grant: "shop.unrestricted" } } }),
  ];
  for (const changed of changedMeaning) assert.notEqual(ruleMeaningHash(changed), ruleMeaningHash(rule()));
  assert.notEqual(ruleScopeHash(rule({ scope: { descendants: false, actions: ["customer.contact"] } })), ruleScopeHash(rule()));
  assert.notEqual(ruleScopeHash(rule({ scope: { descendants: true } })), ruleScopeHash(rule()));
  const result = reduceRuleEvents([propose(original), adopt(original)], allow);
  assert.equal(result.status, "resolved");
  assert.equal(result.rules[0].adoption_ref, "event:adopt");
  assert.equal(result.rules[0].revision, 2);
});

test("proposals need no host grant, but strings in events cannot authorize adoption", () => {
  const proposed = reduceRuleEvents([propose()]);
  assert.equal(proposed.rules[0].state, "proposed");
  const result = reduceRuleEvents([propose(), adopt()]);
  assert.equal(result.status, "held");
  assert.deepEqual(result.rules, []);
  assert.deepEqual(errorCodes(result), ["authorization_required"]);
  assert.equal(result.history[0].rule.state, "proposed");
});

test("reviewing only a statement cannot approve a changed handler, parameters, or scope", () => {
  const original = rule();
  const changed = [
    rule({ enforcement: { mode: "code", handler: "yawn.allow-all@1" } }),
    rule({ enforcement: { mode: "code", handler: "yawn.require-grant@1", parameters: { grant: "other.grant" } } }),
    rule({ scope: { descendants: true } }),
  ];
  for (const value of changed) {
    let checked = false;
    const result = reduceRuleEvents([propose(value), adopt(original)], { authorize: () => { checked = true; return true; } });
    assert.deepEqual(errorCodes(result), ["review_hash_mismatch"]);
    assert.equal(checked, false, "stale reviews never reach host authorization");
    assert.deepEqual(result.rules, []);
  }
});

test("host denial, exceptions, promises, and truthy strings cannot become authority", () => {
  for (const authorize of [() => false, () => "authorized", () => ({ authorized: true }), async () => true, () => { throw new Error("denied"); }]) {
    const result = reduceRuleEvents([propose(), adopt()], { authorize });
    assert.equal(result.status, "held");
    assert.deepEqual(result.rules, []);
    assert.equal(result.history.length, 1);
    assert.match(result.errors[0].code, /^authorization_(denied|failed)$/);
  }
});

test("supersession is a newly reviewed host decision with the exact next revision", () => {
  const next = replacement({ statement: "Contact requires the shop approval grant." });
  const contexts = [];
  const events = [propose(), adopt(), supersede(next)];
  const result = reduceRuleEvents(events, { authorize: (context) => { contexts.push(context); return true; } });
  assert.equal(result.status, "resolved");
  assert.equal(result.rules[0].revision, 3);
  assert.equal(result.rules[0].statement, next.statement);
  assert.equal(result.rules[0].adoption_ref, "event:supersede");
  assert.equal(result.history[1].rule.adoption_ref, "event:adopt");
  assert.equal(contexts[1].rule.revision, 2);
  assert.equal(contexts[1].replacement.revision, 3);
  assert.ok(Object.isFrozen(contexts[1].replacement.enforcement));
  assert.equal(Object.hasOwn(result.rules[0], "history"), false);
  assert.equal(Object.hasOwn(result.rules[0], "permissions"), false);
});

test("two amendments racing on one revision reject the stale amendment without event ID tie breaking", () => {
  const first = supersede(replacement({ statement: "First reviewed replacement." }), { event_id: "event:z-first" });
  const second = supersede(replacement({ statement: "Second reviewed replacement." }), { event_id: "event:a-second" });
  const result = reduceRuleEvents([propose(), adopt(), first, second], allow);
  assert.deepEqual(errorCodes(result), ["stale_rule_revision"]);
  assert.equal(result.history.at(-1).rule.statement, first.replacement.statement);
  assert.equal(result.status, "held");
  assert.deepEqual(result.rules, [], "a replay containing errors cannot release partial governing state");
});

test("causal input order is required and not silently repaired by sorting event IDs", () => {
  const events = [adopt(), propose()];
  const before = structuredClone(events);
  const result = reduceRuleEvents(events, allow);
  assert.deepEqual(errorCodes(result), ["rule_not_found"]);
  assert.deepEqual(events, before);
  assert.equal(result.history[0].event.operation, "propose_rule");
});

test("retirement retains historical adoption and cannot be resurrected by proposal or amendment", () => {
  const events = [propose(), adopt(), retire()];
  const retired = reduceRuleEvents(events, allow);
  assert.equal(retired.status, "resolved");
  assert.equal(retired.rules[0].state, "retired");
  assert.equal(retired.rules[0].revision, 3);
  assert.equal(retired.rules[0].adoption_ref, "event:adopt");
  const resurrection = reduceRuleEvents([...events, propose(rule(), "event:resurrection")], allow);
  assert.deepEqual(errorCodes(resurrection), ["rule_already_exists"]);
  const stale = reduceRuleEvents([...events, adopt(rule(), { event_id: "event:readopt", expected_rule_revision: 3 })], allow);
  assert.deepEqual(errorCodes(stale), ["rule_retired"]);
});

test("retirement is host authorized even if the event claims a principal", () => {
  const result = reduceRuleEvents([propose(), adopt(), retire()], { authorize: ({ event }) => event.operation === "adopt_rule" });
  assert.deepEqual(errorCodes(result), ["authorization_denied"]);
  assert.equal(result.history.at(-1).rule.state, "adopted");
});

test("duplicate IDs are rejected even when their operations or payloads differ", () => {
  const result = reduceRuleEvents([propose(), adopt(rule(), { event_id: "event:propose" })], allow);
  assert.deepEqual(errorCodes(result), ["duplicate_event_id"]);
  const deniedThenRetried = reduceRuleEvents([propose(), adopt(), adopt()], { authorize: () => false });
  assert.deepEqual(errorCodes(deniedThenRetried), ["authorization_denied", "duplicate_event_id"]);
});

test("caller-owned inputs are immutable and callbacks cannot edit reviewed state", () => {
  const events = [propose(), adopt()];
  const before = structuredClone(events);
  const result = reduceRuleEvents(events, { authorize: ({ rule: value, event }) => {
    assert.throws(() => { value.statement = "Allow anything"; }, TypeError);
    assert.throws(() => { event.reviewed_scope_hash = "forged"; }, TypeError);
    events[0].rule.statement = "Input changed during callback";
    return true;
  } });
  assert.equal(result.rules[0].statement, before[0].rule.statement);
  events[0].rule.statement = before[0].rule.statement;
  assert.deepEqual(events, before);
  assert.ok(Object.isFrozen(result.rules[0].scope));
  assert.deepEqual(reduceRuleEvents(events, allow), result);
});

test("a malformed or self-adopted proposal cannot enter replay output", () => {
  const malformed = [
    rule({ state: "adopted", adoption_ref: "event:forged" }),
    rule({ revision: 2 }), rule({ source_refs: [] }), rule({ scope: { descendants: "true" } }),
    rule({ enforcement: { mode: "code", handler: "./arbitrary.mjs" } }),
    rule({ enforcement: { mode: "model", handler: "yawn.require-grant@1" } }),
    rule({ enforcement: { mode: "unknown" } }), rule({ type: "arbitrary" }), rule({ permissions: ["send"] }),
  ];
  for (const value of malformed) {
    const result = reduceRuleEvents([propose(value)], allow);
    assert.equal(result.status, "held");
    assert.deepEqual(result.history, []);
    assert.deepEqual(result.rules, []);
  }
});

test("supersession rejects unreviewed changes, reused adoption refs, and revision skipping", () => {
  const wrongReview = supersede(replacement({ statement: "Changed after review." }), { reviewed_meaning_hash: ruleMeaningHash(rule()) });
  const prebound = supersede(replacement({ adoption_ref: "event:forged" }));
  const skipped = supersede(replacement({ revision: 4 }));
  for (const event of [wrongReview, prebound, skipped]) {
    const result = reduceRuleEvents([propose(), adopt(), event], allow);
    assert.equal(result.status, "held");
    assert.equal(result.history.length, 2);
    assert.deepEqual(result.rules, []);
  }
});

test("non-JSON values cannot disappear from hashes or trigger getters during replay", () => {
  for (const parameters of [{ x: undefined }, { x: NaN }, { x: () => true }, { x: 1n }]) {
    const value = rule({ enforcement: { mode: "code", handler: "yawn.require-grant@1", parameters } });
    assert.throws(() => ruleMeaningHash(value), (error) => error instanceof RuleEventError && error.code === "invalid_json");
    assert.deepEqual(errorCodes(reduceRuleEvents([propose(value)])), ["invalid_json"]);
  }
  let called = false;
  const event = { operation: "propose_rule", rule: rule() };
  Object.defineProperty(event, "event_id", { enumerable: true, get() { called = true; return "event:getter"; } });
  assert.deepEqual(errorCodes(reduceRuleEvents([event])), ["invalid_json"]);
  assert.equal(called, false);
  const cyclic = rule();
  cyclic.enforcement.parameters.self = cyclic;
  assert.deepEqual(errorCodes(reduceRuleEvents([propose(cyclic)])), ["invalid_json"]);
});

test("prototype-shaped operation names are ordinary unsupported data", () => {
  for (const operation of ["__proto__", "constructor", "toString", { toString: "not a function" }]) {
    assert.deepEqual(errorCodes(reduceRuleEvents([{ event_id: "event:hostile", operation }])), ["unsupported_operation"]);
  }
});

test("deep or oversized records are held before recursion or resource use becomes unbounded", () => {
  let deep = {};
  for (let index = 0; index < 70; index += 1) deep = { next: deep };
  for (const parameters of [deep, { values: Array(10001).fill(0) }]) {
    const value = rule({ enforcement: { mode: "code", handler: "yawn.require-grant@1", parameters } });
    assert.deepEqual(errorCodes(reduceRuleEvents([propose(value)])), ["json_limit_exceeded"]);
    assert.throws(() => ruleMeaningHash(value), (error) => error instanceof RuleEventError && error.code === "json_limit_exceeded");
  }
});

test("prototype pollution and YAML merge keys stay invalid even inside opaque handler parameters", () => {
  for (const key of ["__proto__", "prototype", "constructor", "<<"]) {
    const parameters = { nested: JSON.parse(`{"${key}": {"allowed": true}}`) };
    const value = rule({ enforcement: { mode: "code", handler: "yawn.require-grant@1", parameters } });
    assert.deepEqual(errorCodes(reduceRuleEvents([propose(value)])), ["unsafe_key"]);
    assert.equal(Object.prototype.allowed, undefined);
  }
});

test("the causal replay is snapshotted before callbacks can modify later caller data", () => {
  const events = [propose(), adopt(), retire()];
  const result = reduceRuleEvents(events, { authorize: ({ event }) => {
    if (event.operation === "adopt_rule") events[2].expected_rule_revision = 999;
    return true;
  } });
  assert.equal(events[2].expected_rule_revision, 999);
  assert.equal(result.status, "resolved");
  assert.equal(result.rules[0].state, "retired");
  assert.equal(result.history[2].event.expected_rule_revision, 2);
});

test("custom array iterators and accessor elements are never executed", () => {
  let executed = false;
  const customIterator = [propose()];
  customIterator[Symbol.iterator] = function* () { executed = true; yield propose(); };
  assert.throws(() => reduceRuleEvents(customIterator), (error) => error instanceof RuleEventError && error.code === "invalid_events");
  const accessor = [null];
  Object.defineProperty(accessor, 0, { enumerable: true, get() { executed = true; return propose(); } });
  assert.throws(() => reduceRuleEvents(accessor), (error) => error instanceof RuleEventError && error.code === "invalid_events");
  assert.equal(executed, false);
});

test("inherited array serialization and iteration cannot run through custom prototypes", () => {
  let executed = false;
  class HostileArray extends Array {
    toJSON() { executed = true; return []; }
    *[Symbol.iterator]() { executed = true; yield "forged"; }
  }
  const events = new HostileArray(propose());
  assert.throws(() => reduceRuleEvents(events), (error) => error instanceof RuleEventError && error.code === "invalid_events");
  const value = rule({ enforcement: { mode: "code", handler: "yawn.require-grant@1", parameters: { values: new HostileArray("data") } } });
  assert.deepEqual(errorCodes(reduceRuleEvents([propose(value)])), ["invalid_json"]);
  assert.throws(() => ruleMeaningHash(value), (error) => error instanceof RuleEventError && error.code === "invalid_json");
  assert.equal(executed, false);
});
