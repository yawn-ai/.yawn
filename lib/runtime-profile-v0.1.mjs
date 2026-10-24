import { readFileSync } from "node:fs";
import Ajv2020 from "ajv/dist/2020.js";
import { isAlias, isMap, isScalar, isSeq, parseDocument } from "yaml";
import { canonicalJson, hashCanonical } from "./state-substrate-v1.mjs";

export const RUNTIME_PROFILE_VERSION = "yawn.runtime-profile.v0.1";
export const PARSE_LIMITS = Object.freeze({ bytes: 262144, depth: 64, nodes: 10000 });
const FORBIDDEN_KEYS = new Set(["__proto__", "prototype", "constructor", "<<"]);
const PARENT_ID = /^yawn:[A-Za-z0-9][A-Za-z0-9._:-]*$/;
const schema = JSON.parse(readFileSync(new URL("../schemas/runtime-profile.v0.1.schema.json", import.meta.url), "utf8"));
const checkShape = new Ajv2020({ allErrors: true, strict: true }).compile(schema);

function fail(code, message) {
  const error = new Error(message);
  error.code = code;
  throw error;
}

function assertArrayData(array) {
  if (Object.getPrototypeOf(array) !== Array.prototype) fail("object_prototype", "Custom array prototypes are forbidden.");
  if (array.length > PARSE_LIMITS.nodes || Object.keys(array).length !== array.length || Object.keys(array).some((key, index) => key !== String(index))) fail("non_json_data", "Arrays must contain dense JSON data without named properties.");
  for (const key of Reflect.ownKeys(array)) {
    if (key === "length") continue;
    const descriptor = Object.getOwnPropertyDescriptor(array, key);
    if (typeof key !== "string" || !descriptor.enumerable || !Object.hasOwn(descriptor, "value")) fail("non_json_data", "Array accessors and custom iterators are forbidden.");
  }
}

// Object entry points have the same data boundary as parsed YAML. In particular,
// getters, prototypes, shared references, non-finite numbers and cycles are not
// portable JSON and must never reach hashing or a host callback.
function assertData(value) {
  const pending = [[value, 0]];
  const seen = new WeakSet();
  let nodes = 0;
  while (pending.length) {
    const [current, depth] = pending.pop();
    if (++nodes > PARSE_LIMITS.nodes || depth > PARSE_LIMITS.depth) fail("data_limit", "Runtime profile exceeds structural limits.");
    if (current === null || typeof current === "string" || typeof current === "boolean") continue;
    if (typeof current === "number" && Number.isFinite(current)) continue;
    if (typeof current !== "object") fail("non_json_data", "Runtime profile must contain only JSON data.");
    if (seen.has(current)) fail("object_reference", "Shared or cyclic object references are forbidden.");
    seen.add(current);
    if (!Array.isArray(current) && Object.getPrototypeOf(current) !== Object.prototype && Object.getPrototypeOf(current) !== null) fail("object_prototype", "Custom object prototypes are forbidden.");
    if (Array.isArray(current)) assertArrayData(current);
    for (const key of Reflect.ownKeys(current)) {
      if (Array.isArray(current) && key === "length") continue;
      if (typeof key !== "string" || FORBIDDEN_KEYS.has(key)) fail("unsafe_key", "Nonportable object key.");
      const descriptor = Object.getOwnPropertyDescriptor(current, key);
      if (!descriptor.enumerable || !Object.hasOwn(descriptor, "value")) fail("non_json_data", "Accessors and hidden data are forbidden.");
      pending.push([descriptor.value, depth + 1]);
    }
  }
}

export function validateRuntimeProfile(profile) {
  try { assertData(profile); } catch (error) { return [{ code: error.code, message: error.message }]; }
  if (!checkShape(profile)) return checkShape.errors.map(({ instancePath, keyword, message }) => ({ code: "schema", path: instancePath, keyword, message }));
  const errors = [];
  for (const name of ["instructions", "skills", "rules", "capabilities"]) {
    const ids = new Set();
    for (const item of profile.runtime[name] ?? []) {
      if (ids.has(item.id)) errors.push({ code: "duplicate_id", path: `/runtime/${name}`, message: `Duplicate ${name} ID: ${item.id}` });
      ids.add(item.id);
    }
  }
  const verificationIds = new Set();
  for (const check of profile.runtime.verification?.required ?? []) {
    if (verificationIds.has(check.id)) errors.push({ code: "duplicate_id", path: "/runtime/verification/required", message: `Duplicate verification ID: ${check.id}` });
    verificationIds.add(check.id);
  }
  return errors;
}

/** Parse one bounded YAML 1.2 document. Never load a module, tag or resource. */
export function parseRuntimeProfile(text) {
  if (typeof text !== "string") fail("input_type", "Runtime profile input must be text.");
  if (Buffer.byteLength(text, "utf8") > PARSE_LIMITS.bytes) fail("input_limit", "Runtime profile exceeds 256 KiB.");
  const document = parseDocument(text, { version: "1.2", schema: "core", strict: true, uniqueKeys: true, merge: false });
  if (document.errors.length || document.warnings.length) fail("yaml_syntax", "Invalid or unsupported YAML syntax.");
  if (document.directives.yaml.version !== "1.2" || canonicalJson(document.directives.tags) !== canonicalJson({ "!!": "tag:yaml.org,2002:" })) fail("yaml_directive", "Only the YAML 1.2 core profile is supported.");
  const pending = [[document.contents, 0]];
  let nodes = 0;
  while (pending.length) {
    const [node, depth] = pending.pop();
    if (++nodes > PARSE_LIMITS.nodes || depth > PARSE_LIMITS.depth) fail("data_limit", "Runtime profile exceeds structural limits.");
    if (node === null) continue;
    if (isAlias(node) || node.anchor || node.tag) fail("yaml_reference_or_tag", "YAML tags, anchors and aliases are forbidden.");
    if (isMap(node)) {
      for (const pair of node.items) {
        if (!isScalar(pair.key) || typeof pair.key.value !== "string" || FORBIDDEN_KEYS.has(pair.key.value)) fail("unsafe_key", "Only safe string map keys are supported.");
        pending.push([pair.key, depth + 1], [pair.value, depth + 1]);
      }
    } else if (isSeq(node)) {
      for (const item of node.items) pending.push([item, depth + 1]);
    } else if (!isScalar(node)) fail("yaml_type", "Unsupported YAML node.");
  }
  const profile = document.toJS({ maxAliasCount: 0 });
  const errors = validateRuntimeProfile(profile);
  if (errors.length) fail("invalid_profile", `Invalid runtime profile: ${JSON.stringify(errors)}`);
  return profile;
}

const ALIAS_PATHS = Object.freeze({
  [RUNTIME_PROFILE_VERSION]: [],
  "agency-holarchy.v0.2": [["primaryParentYawnRef"]],
  "0.2-draft": [["primary_parent_yawn_ref"], ["context", "primary_parent_yawn_ref"]],
  "yawn.app-legacy.v0": [["primary_parent"], ["parent_coordinate"], ["context", "primary_parent"], ["context", "parent_coordinate"]],
});
const ALL_PARENT_PATHS = [...new Map(Object.values(ALIAS_PATHS).flat().map((path) => [path.join("."), path])).values()];
function atPath(record, path) {
  let current = record;
  for (const key of path) {
    if (current === null || typeof current !== "object" || !Object.hasOwn(current, key)) return { present: false };
    current = current[key];
  }
  return { present: true, value: current };
}

/** Normalize ancestry only; this is not a whole-document schema migration. */
export function normalizePrimaryParent(record, { sourceVersion } = {}) {
  assertData(record);
  if (record === null || typeof record !== "object" || Array.isArray(record)) fail("record_type", "Ancestry source must be a JSON object.");
  if (sourceVersion === undefined) sourceVersion = record.spec_version ?? record.schemaVersion;
  if (!Object.hasOwn(ALIAS_PATHS, sourceVersion)) fail("unsupported_source_version", "An explicit supported source version is required.");
  const allowed = ALIAS_PATHS[sourceVersion];
  const allowedNames = new Set(allowed.map((path) => path.join(".")));
  for (const path of ALL_PARENT_PATHS) {
    if (atPath(record, path).present && !allowedNames.has(path.join("."))) fail("unexpected_parent_alias", "Parent alias does not belong to the declared source version.");
  }
  const candidates = [["primary_parent_id"], ...allowed].map((path) => ({ path, ...atPath(record, path) })).filter((entry) => entry.present);
  if (!candidates.length) fail("missing_parent", "Declare a parent identity or an explicit null root.");
  for (const { value } of candidates) if (value !== null && (typeof value !== "string" || !PARENT_ID.test(value))) fail("invalid_parent_id", "Parent must be a stable yawn: identity, never a route or filename.");
  const parent = candidates[0].value;
  if (candidates.some(({ value }) => value !== parent)) fail("conflicting_parent_aliases", "Parent aliases disagree; migration cannot guess ancestry.");
  const normalized = structuredClone(record);
  const warnings = [];
  for (const { path } of candidates) {
    if (path.join(".") === "primary_parent_id") continue;
    let container = normalized;
    for (const key of path.slice(0, -1)) container = container[key];
    delete container[path.at(-1)];
    warnings.push(`Deprecated ${path.join(".")} normalized to primary_parent_id for ${sourceVersion}.`);
  }
  normalized.primary_parent_id = parent;
  return { record: normalized, primary_parent_id: parent, warnings, source_hash: hashCanonical(record) };
}

/** Comments and map ordering are absent from this hash; all data is retained. */
export function semanticProfileHash(profile) {
  const errors = validateRuntimeProfile(profile);
  if (errors.length) fail("invalid_profile", `Cannot hash invalid runtime profile: ${JSON.stringify(errors)}`);
  return hashCanonical(profile);
}

function freezeData(value) {
  if (value && typeof value === "object") {
    for (const item of Object.values(value)) freezeData(item);
    Object.freeze(value);
  }
  return value;
}

/**
 * Pure configuration resolution, never effect admission. Callbacks and handler
 * identities are supplied by a trusted host, not by the document being read.
 * A held result exposes no usable effective config. Dependencies include empty
 * ancestor rule scopes so a newly adopted parent rule invalidates old results.
 */
export function resolveRuntimeConfig(targetId, profiles, { verifyAdoption, verifySkill, verifyCapability, supportedHandlers = [] } = {}) {
  const issues = [];
  const dependencies = [];
  const issue = (code, profile_id, message) => issues.push({ code, profile_id, message });
  const held = () => ({ status: "held", issues, config: null, semantic_revision: null, dependencies });
  if (typeof targetId !== "string" || !PARENT_ID.test(targetId)) { issue("invalid_target", null, "Target must be a stable yawn: identity."); return held(); }
  if (!Array.isArray(profiles)) { issue("profiles_type", targetId, "Profiles must be an array."); return held(); }
  // Inspect the collection without invoking user iterators or getters. Each
  // profile is validated separately; sharing source objects between distinct
  // input profiles does not itself make their identities ambiguous.
  try { assertArrayData(profiles); } catch (error) { issue("invalid_profiles", targetId, error.message); return held(); }
  const byId = new Map();
  for (const input of profiles) {
    const errors = validateRuntimeProfile(input);
    if (errors.length) { issue("invalid_profile", null, JSON.stringify(errors)); continue; }
    const profile = freezeData(structuredClone(input));
    if (byId.has(profile.id)) issue("duplicate_profile", profile.id, "Ambiguous profile identity.");
    byId.set(profile.id, profile);
  }
  if (issues.length) return held();
  const chain = [];
  const seen = new Set();
  let next = targetId;
  while (next !== null) {
    if (seen.has(next)) { issue("parent_cycle", next, "Primary ancestry contains a cycle."); return held(); }
    seen.add(next);
    const profile = byId.get(next);
    if (!profile) { issue("missing_parent", next, "Required profile cannot be resolved."); return held(); }
    chain.unshift(profile);
    next = profile.primary_parent_id;
  }
  const handlers = new Set(Array.isArray(supportedHandlers) ? supportedHandlers : []);
  const boundaries = [];
  const defaults = new Map();
  const ruleTypes = new Map();
  const skills = new Map();
  const capabilities = new Map();
  const instructions = [];
  const verification = [];
  const execution = {};
  let privacy = null;
  const checkHandler = (enforcement, profile) => {
    if (enforcement?.mode === "code" && !handlers.has(enforcement.handler)) issue("unsupported_handler", profile.id, `Unsupported semantic handler: ${enforcement.handler}`);
  };
  const trusted = (callback, item, profile, code) => {
    try {
      const decision = typeof callback === "function" ? callback(item, profile) : false;
      if (decision !== true) {
        if (decision instanceof Promise) decision.catch(() => {});
        issue(code, profile.id, `Trusted host verification required for ${item.id}.`);
      }
    } catch { issue(code, profile.id, `Trusted host verification failed for ${item.id}.`); }
  };
  for (const profile of chain) {
    dependencies.push({ id: profile.id, revision: profile.revision, semantic_hash: semanticProfileHash(profile), rule_scope_hash: hashCanonical(profile.runtime.rules ?? []) });
    const origin = (item) => ({ ...item, origin_id: profile.id, origin_revision: profile.revision });
    for (const instruction of profile.runtime.instructions ?? []) instructions.push(origin(instruction));
    for (const rule of profile.runtime.rules ?? []) {
      const inherited = boundaries.find((item) => item.id === rule.id && item.origin_id !== profile.id);
      if (inherited && rule.state !== "proposed") {
        // A local declaration cannot amend another game's adopted boundary.
        issue("boundary_override", profile.id, `Inherited boundary ${rule.id} must be amended at its authorized source.`);
      }
      if (rule.state !== "adopted" || (profile.id !== targetId && !rule.scope.descendants)) continue;
      if (ruleTypes.has(rule.id) && ruleTypes.get(rule.id) !== rule.type) issue("rule_type_conflict", profile.id, `Inherited rule ${rule.id} cannot change composition type.`);
      ruleTypes.set(rule.id, rule.type);
      if (["boundary", "permission_requirement", "verification_requirement"].includes(rule.type)) {
        trusted(verifyAdoption, rule, profile, "unverified_adoption");
        checkHandler(rule.enforcement, profile);
        boundaries.push(origin(rule));
      } else {
        const prior = defaults.get(rule.id);
        const actionScope = (r) => r.scope.actions === undefined ? null : [...r.scope.actions].sort();
        if (prior && canonicalJson(actionScope(prior)) !== canonicalJson(actionScope(rule))) issue("default_scope_conflict", profile.id, `Default ${rule.id} must retain its action scope when specializing.`);
        defaults.set(rule.id, origin(rule));
      }
    }
    for (const skill of profile.runtime.skills ?? []) skills.set(skill.id, { skill, profile });
    for (const capability of profile.runtime.capabilities ?? []) {
      const existing = capabilities.get(capability.id);
      if (existing && canonicalJson(existing.capability) !== canonicalJson(capability)) issue("capability_conflict", profile.id, `Conflicting binding for ${capability.id}.`);
      else capabilities.set(capability.id, { capability, profile });
    }
    for (const check of profile.runtime.verification?.required ?? []) {
      checkHandler(check, profile);
      verification.push(origin(check));
    }
    for (const [key, value] of Object.entries(profile.runtime.execution ?? {})) {
      execution[key] = typeof value === "number" ? Math.min(execution[key] ?? Infinity, value) : value;
    }
    if (profile.runtime.privacy) privacy = structuredClone(profile.runtime.privacy);
  }
  for (const selected of defaults.values()) {
    const profile = byId.get(selected.origin_id);
    const rule = profile.runtime.rules.find(({ id }) => id === selected.id);
    trusted(verifyAdoption, rule, profile, "unverified_adoption");
    checkHandler(rule.enforcement, profile);
  }
  const effectiveSkills = [];
  for (const { skill, profile } of skills.values()) {
    if (skill.activation !== "disabled") {
      trusted(verifySkill, skill, profile, "unverified_skill");
      for (const capability of skill.capabilities) if (!capabilities.has(capability)) issue("unbound_capability", profile.id, `Missing host capability binding: ${capability}`);
    }
    effectiveSkills.push({ ...skill, origin_id: profile.id, origin_revision: profile.revision });
  }
  for (const { capability, profile } of capabilities.values()) {
    trusted(verifyCapability, capability, profile, "unverified_capability");
    if (capability.binding.protocol === "function" && !handlers.has(capability.binding.handler)) issue("unsupported_handler", profile.id, `Unsupported capability handler: ${capability.binding.handler}`);
  }
  if (issues.length) return held();
  const config = {
    id: targetId, ancestry: chain.map(({ id }) => id), instructions,
    rules: [...boundaries, ...defaults.values()], skills: effectiveSkills,
    capabilities: [...capabilities.values()].map(({ capability, profile }) => ({ ...capability, origin_id: profile.id, origin_revision: profile.revision })),
    execution, verification: { required: verification }, privacy,
  };
  return {
    status: "resolved", issues, config,
    semantic_revision: hashCanonical({ profile_version: RUNTIME_PROFILE_VERSION, dependencies, config }),
    dependencies,
  };
}
