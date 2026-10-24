import { createHash } from "node:crypto";
import { canonicalJson } from "./state-substrate-v1.mjs";

const RULE_TYPES = new Set(["default", "boundary", "permission_requirement", "preference", "verification_requirement"]);
const ENFORCEMENT_MODES = new Set(["code", "model", "human", "evidence"]);
const IDENTIFIER = /^[a-z][a-z0-9]*(?:[._:-][a-z0-9]+)*$/;
const EVENT_REFERENCE = /^event:[A-Za-z0-9][A-Za-z0-9._:-]*$/;
const SOURCE_REFERENCE = /^[a-z][a-z0-9_-]*:[^\s]+$/;
const HANDLER = /^[a-z][a-z0-9]*(?:[.-][a-z0-9]+)*@[1-9][0-9]*$/;
const UNSAFE_KEYS = new Set(["__proto__", "prototype", "constructor", "<<"]);
const RULE_KEYS = ["id", "revision", "type", "state", "statement", "scope", "enforcement", "source_refs", "adoption_ref"];
const GOVERNING_KEYS = ["event_id", "operation", "rule_id", "expected_rule_revision", "authorized_by"];
const REVIEW_KEYS = ["reviewed_meaning_hash", "reviewed_scope_hash"];

export class RuleEventError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "RuleEventError";
    this.code = code;
  }
}

function reject(code, message) {
  throw new RuleEventError(code, message);
}

function isRecord(value) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

// Hashing must not silently drop functions, undefined, nonfinite numbers, or cycles.
function assertJson(value, context = { ancestors: new Set(), nodes: 0 }, depth = 0) {
  context.nodes += 1;
  if (context.nodes > 10000 || depth > 64) reject("json_limit_exceeded", "Each rule event is limited to 10000 JSON values and nesting depth 64.");
  if (value === null || typeof value === "string" || typeof value === "boolean") return;
  if (typeof value === "number" && Number.isFinite(value)) return;
  if (Array.isArray(value) && Object.getPrototypeOf(value) !== Array.prototype) {
    reject("invalid_json", "Rule event arrays must use the native JSON array prototype.");
  }
  if ((!Array.isArray(value) && !isRecord(value)) || context.ancestors.has(value)) {
    reject("invalid_json", "Rule events must contain finite, acyclic JSON data only.");
  }
  context.ancestors.add(value);
  if (Reflect.ownKeys(value).some((key) => typeof key !== "string")) {
    reject("invalid_json", "Symbol properties are not portable JSON data.");
  }
  for (const [key, descriptor] of Object.entries(Object.getOwnPropertyDescriptors(value))) {
    if (Array.isArray(value) && key === "length") continue;
    if (UNSAFE_KEYS.has(key)) reject("unsafe_key", "Rule events cannot contain prototype or YAML merge keys.");
    if (!descriptor.enumerable || !Object.hasOwn(descriptor, "value")) {
      reject("invalid_json", "Rule events cannot contain accessors or hidden properties.");
    }
    assertJson(descriptor.value, context, depth + 1);
  }
  if (Array.isArray(value) && (Object.keys(value).length !== value.length
    || Object.keys(value).some((key, index) => key !== String(index)))) {
    reject("invalid_json", "Rule event arrays must be dense JSON arrays.");
  }
  context.ancestors.delete(value);
}

function snapshotEvents(events) {
  if (!Array.isArray(events)) reject("invalid_events", "Rule events must be an array in causal order.");
  if (Object.getPrototypeOf(events) !== Array.prototype) reject("invalid_events", "Rule event collection must use the native JSON array prototype.");
  const descriptors = Object.getOwnPropertyDescriptors(events);
  if (Reflect.ownKeys(events).some((key) => typeof key !== "string")
    || Object.keys(events).length !== events.length
    || Object.keys(events).some((key, index) => key !== String(index))
    || Object.entries(descriptors).some(([key, descriptor]) => key !== "length"
      && (!descriptor.enumerable || !Object.hasOwn(descriptor, "value")))) {
    reject("invalid_events", "Rule event collection must be a dense JSON array without custom properties.");
  }
  const snapshots = [];
  for (let index = 0; index < events.length; index += 1) {
    const input = descriptors[index].value;
    try {
      assertJson(input);
      snapshots.push({ input: clone(input) });
    } catch (error) {
      if (!(error instanceof RuleEventError)) throw error;
      snapshots.push({ inputError: error });
    }
  }
  return snapshots;
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function freeze(value) {
  if (value && typeof value === "object") {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
}

function shape(value, allowed, required, label) {
  if (!isRecord(value)
    || Object.keys(value).some((key) => !allowed.includes(key))
    || required.some((key) => !Object.hasOwn(value, key))) {
    reject("invalid_shape", `${label} has missing or unsupported fields.`);
  }
}

function text(value, label) {
  if (typeof value !== "string" || value.trim().length === 0) {
    reject("invalid_shape", `${label} must be a nonempty string.`);
  }
}

function strings(value, label, { nonempty = true } = {}) {
  if (!Array.isArray(value) || value.length > 1000 || (nonempty && value.length === 0) || new Set(value).size !== value.length) {
    reject("invalid_shape", `${label} must be an array of unique strings.`);
  }
  value.forEach((item) => text(item, label));
}

function revision(value, label) {
  if (!Number.isSafeInteger(value) || value < 1) reject("invalid_shape", `${label} must be a positive safe integer.`);
}

function assertRule(rule, { allowUnboundAdoption = false } = {}) {
  assertJson(rule);
  shape(rule, RULE_KEYS, RULE_KEYS.filter((key) => key !== "adoption_ref"), "Rule");
  text(rule.id, "Rule id");
  if (rule.id.length > 200 || !IDENTIFIER.test(rule.id)) reject("invalid_shape", "Rule id is not a supported identifier.");
  revision(rule.revision, "Rule revision");
  if (!RULE_TYPES.has(rule.type) || !["proposed", "adopted", "superseded", "retired"].includes(rule.state)) {
    reject("invalid_shape", "Rule type or state is unsupported.");
  }
  text(rule.statement, "Rule statement");
  if (rule.statement.length > 64000) reject("invalid_shape", "Rule statement exceeds the profile text limit.");
  shape(rule.scope, ["actions", "descendants"], ["descendants"], "Rule scope");
  if (typeof rule.scope.descendants !== "boolean") reject("invalid_shape", "Rule descendants must be boolean.");
  if (Object.hasOwn(rule.scope, "actions")) {
    strings(rule.scope.actions, "Rule actions");
    if (rule.scope.actions.some((action) => action.length > 200 || !IDENTIFIER.test(action))) {
      reject("invalid_shape", "Rule actions must be supported identifiers.");
    }
  }
  shape(rule.enforcement, ["mode", "handler", "parameters"], ["mode"], "Rule enforcement");
  if (!ENFORCEMENT_MODES.has(rule.enforcement.mode)) reject("invalid_shape", "Rule enforcement mode is unsupported.");
  if (rule.enforcement.mode === "code" || Object.hasOwn(rule.enforcement, "handler")) {
    text(rule.enforcement.handler, "Rule enforcement handler");
    if (rule.enforcement.mode !== "code" || rule.enforcement.handler.length > 200 || !HANDLER.test(rule.enforcement.handler)) {
      reject("invalid_shape", "Only code rules have a supported versioned enforcement handler.");
    }
  }
  if (Object.hasOwn(rule.enforcement, "parameters") && !isRecord(rule.enforcement.parameters)) {
    reject("invalid_shape", "Rule enforcement parameters must be a JSON object.");
  }
  strings(rule.source_refs, "Rule source_refs");
  if (rule.source_refs.some((ref) => ref.length > 1000 || !SOURCE_REFERENCE.test(ref))) reject("invalid_shape", "Rule source_refs must be namespaced references.");
  if (Object.hasOwn(rule, "adoption_ref") && (typeof rule.adoption_ref !== "string" || rule.adoption_ref.length > 500 || !EVENT_REFERENCE.test(rule.adoption_ref))) {
    reject("invalid_shape", "Rule adoption_ref must be an event reference.");
  }
  if (rule.state === "proposed" && Object.hasOwn(rule, "adoption_ref")) reject("invalid_shape", "A proposed rule cannot carry adoption authority.");
  if (rule.state === "adopted" && !allowUnboundAdoption && !Object.hasOwn(rule, "adoption_ref")) {
    reject("invalid_shape", "Adopted rule requires an adoption_ref.");
  }
}

function hash(value) {
  return `sha256:${createHash("sha256").update(canonicalJson(value)).digest("hex")}`;
}

/** Bind prose AND operational enforcement, including an unadopted replacement draft. */
export function ruleMeaningHash(rule) {
  assertRule(rule, { allowUnboundAdoption: true });
  return hash({ type: rule.type, statement: rule.statement, enforcement: rule.enforcement });
}

/** Actions form a set; their source order has no operational significance. */
export function ruleScopeHash(rule) {
  assertRule(rule, { allowUnboundAdoption: true });
  return hash({
    descendants: rule.scope.descendants,
    ...(rule.scope.actions === undefined ? {} : { actions: [...rule.scope.actions].sort() }),
  });
}

function reviewed(event, rule) {
  if (event.reviewed_meaning_hash !== ruleMeaningHash(rule) || event.reviewed_scope_hash !== ruleScopeHash(rule)) {
    reject("review_hash_mismatch", "Adoption must bind the current reviewed operational meaning and scope.");
  }
}

function authorizeChange(authorize, event, rule, replacement) {
  if (typeof authorize !== "function") reject("authorization_required", "A host authorization callback is required.");
  let result;
  try {
    result = authorize(freeze({ event: clone(event), rule: clone(rule), ...(replacement ? { replacement: clone(replacement) } : {}) }));
  } catch {
    reject("authorization_failed", "Host authorization failed or threw an error.");
  }
  if (result !== true) {
    // An asynchronous decision cannot authorize this synchronous replay.
    if (result instanceof Promise) result.catch(() => {});
    reject("authorization_denied", "Host authorization must synchronously return true.");
  }
}

function assertEvent(event) {
  assertJson(event);
  const shapes = {
    propose_rule: ["event_id", "operation", "rule"],
    adopt_rule: [...GOVERNING_KEYS, ...REVIEW_KEYS],
    supersede_rule: [...GOVERNING_KEYS, ...REVIEW_KEYS, "replacement"],
    retire_rule: GOVERNING_KEYS,
  };
  if (!isRecord(event) || typeof event.operation !== "string" || !Object.hasOwn(shapes, event.operation)) reject("unsupported_operation", "Unsupported rule event operation.");
  const allowed = shapes[event.operation];
  shape(event, allowed, allowed, "Rule event");
  text(event.event_id, "Event id");
  if (event.event_id.length > 500 || !EVENT_REFERENCE.test(event.event_id)) reject("invalid_shape", "Event id must be an event reference.");
  if (event.operation !== "propose_rule") {
    text(event.rule_id, "Event rule_id");
    revision(event.expected_rule_revision, "Expected rule revision");
    text(event.authorized_by, "Event authorized_by attribution");
  }
}

/**
 * Replay trusted-host decisions over untrusted JSON events in supplied causal order.
 * Strings such as authorized_by/adoption_ref never constitute authorization.
 * The host callback must verify actual authority for the given operation and
 * current rule (and replacement when present), returning strict true immediately.
 * The expected revision is checked before invoking it: competing amendments
 * cannot use event ID sorting or a stale authorization to select governance.
 * Any error holds the replay: inspect history/errors, but no rules are released.
 * Successful lifecycle transitions advance the revision, including adoption.
 */
export function reduceRuleEvents(events, { authorize } = {}) {
  // Snapshot before host callbacks so callback side effects cannot rewrite later input.
  const snapshots = snapshotEvents(events);
  const rules = new Map();
  const seen = new Set();
  const history = [];
  const errors = [];

  for (const { input, inputError } of snapshots) {
    let eventId = null;
    try {
      if (inputError) throw inputError;
      if (isRecord(input) && typeof input.event_id === "string") eventId = input.event_id;
      // Reserve IDs even for invalid/denied events; they cannot be retried with new contents.
      if (eventId !== null) {
        if (seen.has(eventId)) reject("duplicate_event_id", "Rule event IDs must be unique in a replay.");
        seen.add(eventId);
      }
      assertEvent(input);
      const event = clone(input);
      let next;
      if (event.operation === "propose_rule") {
        assertRule(event.rule);
        if (event.rule.state !== "proposed" || event.rule.revision !== 1 || Object.hasOwn(event.rule, "adoption_ref")) {
          reject("invalid_proposal", "A proposal starts at revision 1 in proposed state without adoption authority.");
        }
        if (rules.has(event.rule.id)) reject("rule_already_exists", "A rule identity cannot be proposed again, including after retirement.");
        next = event.rule;
      } else {
        const current = rules.get(event.rule_id);
        if (!current) reject("rule_not_found", "Rule event references an unknown rule.");
        if (event.expected_rule_revision !== current.revision) reject("stale_rule_revision", "Expected rule revision does not match current causal state.");
        if (current.state === "retired") reject("rule_retired", "Retired rule identities cannot be resurrected.");
        if (current.revision === Number.MAX_SAFE_INTEGER) reject("revision_exhausted", "Rule revision cannot advance safely.");
        if (event.operation === "adopt_rule") {
          if (current.state !== "proposed") reject("invalid_transition", "Only a proposed rule may be adopted.");
          reviewed(event, current);
          authorizeChange(authorize, event, current);
          next = { ...current, revision: current.revision + 1, state: "adopted", adoption_ref: event.event_id };
        } else if (event.operation === "supersede_rule") {
          if (current.state !== "adopted") reject("invalid_transition", "Only an adopted rule may be superseded.");
          // The event cannot choose the adoption reference that the host will attest.
          if (Object.hasOwn(event.replacement ?? {}, "adoption_ref")) reject("invalid_replacement", "Replacement adoption_ref is assigned by the reducer.");
          const replacement = { ...event.replacement, adoption_ref: event.event_id };
          assertRule(replacement);
          if (replacement.id !== current.id || replacement.revision !== current.revision + 1 || replacement.state !== "adopted") {
            reject("invalid_replacement", "Replacement must keep the rule identity and advance exactly one adopted revision.");
          }
          reviewed(event, replacement);
          authorizeChange(authorize, event, current, replacement);
          next = replacement;
        } else {
          authorizeChange(authorize, event, current);
          next = { ...current, revision: current.revision + 1, state: "retired" };
        }
      }
      rules.set(next.id, next);
      history.push({ event, rule: clone(next) });
    } catch (error) {
      if (!(error instanceof RuleEventError)) throw error;
      errors.push({ event_id: eventId, code: error.code, message: error.message });
    }
  }

  return freeze({
    status: errors.length === 0 ? "resolved" : "held",
    rules: errors.length === 0 ? [...rules.values()].map(clone) : [],
    history,
    errors,
  });
}
