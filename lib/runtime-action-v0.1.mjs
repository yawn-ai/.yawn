import { canonicalJson, hashCanonical } from "./state-substrate-v1.mjs";
import { resolveRuntimeConfig, validateRuntimeProfile } from "./runtime-profile-v0.1.mjs";

export const RUNTIME_ACTION_CONTRACT = "yawn.runtime-action.v0.1";
export const HOST_LIMITS = Object.freeze({ profiles: 100, bytes: 1048576, nodes: 50000, depth: 64 });
const ID = /^[a-z][a-z0-9]*(?:[._:-][a-z0-9]+)*$/;
const HANDLER = /^[a-z][a-z0-9]*(?:[.-][a-z0-9]+)*@[1-9][0-9]*$/;
const YAWN_ID = /^yawn:[A-Za-z0-9][A-Za-z0-9._:-]*$/;
const SHA256 = /^sha256:[a-f0-9]{64}$/;
const UNSAFE = new Set(["__proto__", "prototype", "constructor", "<<"]);
const HARD = new Set(["boundary", "permission_requirement", "verification_requirement"]);

function reject(code) { const error = new Error(code); error.code = code; throw error; }
function record(value) { return value !== null && typeof value === "object" && !Array.isArray(value); }
function exact(value, allowed, required = allowed) {
  return record(value) && Object.keys(value).every((key) => allowed.includes(key)) && required.every((key) => Object.hasOwn(value, key));
}
function strings(value, pattern = ID) {
  return Array.isArray(value) && value.length <= 1000 && value.every((item) => typeof item === "string" && item.length <= 1000 && pattern.test(item)) && new Set(value).size === value.length;
}
function freeze(value) { if (value && typeof value === "object") { Object.values(value).forEach(freeze); Object.freeze(value); } return value; }

// Inspect descriptors before any property value is read. Host callbacks are
// deliberately outside this JSON boundary and never come from a profile.
function snapshot(value) {
  let count = 0;
  const ancestors = new WeakSet();
  function visit(item, depth) {
    if (++count > HOST_LIMITS.nodes || depth > HOST_LIMITS.depth) reject("host_data_limit");
    if (item === null || typeof item === "string" || typeof item === "boolean") return item;
    if (typeof item === "number" && Number.isFinite(item)) return item;
    if (typeof item !== "object" || ancestors.has(item)) reject("invalid_host_data");
    const array = Array.isArray(item);
    const prototype = Object.getPrototypeOf(item);
    if (array ? prototype !== Array.prototype : prototype !== Object.prototype && prototype !== null) reject("invalid_host_data");
    const descriptors = Object.getOwnPropertyDescriptors(item);
    const keys = Reflect.ownKeys(item);
    if (array && (Object.keys(item).length !== item.length || Object.keys(item).some((key, index) => key !== String(index)))) reject("invalid_host_data");
    ancestors.add(item);
    const copy = array ? [] : {};
    for (const key of keys) {
      if (array && key === "length") continue;
      const descriptor = descriptors[key];
      if (typeof key !== "string" || UNSAFE.has(key) || !descriptor.enumerable || !Object.hasOwn(descriptor, "value")) reject("invalid_host_data");
      copy[key] = visit(descriptor.value, depth + 1);
    }
    ancestors.delete(item);
    return copy;
  }
  const copy = visit(value, 0);
  if (Buffer.byteLength(JSON.stringify(copy), "utf8") > HOST_LIMITS.bytes) reject("host_data_limit");
  return copy;
}

// Display, source attribution, and profile concurrency revisions remain in the
// document hash. They do not by themselves alter the operational contract.
function operationalItem({ source_refs, origin_revision, ...item }) { return item; }
function operational(value) {
  if (Array.isArray(value)) return value.map(operationalItem);
  if (!record(value)) return value;
  if (Object.hasOwn(value, "ancestry") && Object.hasOwn(value, "instructions")) {
    return { ...value,
      instructions: value.instructions.map(operationalItem),
      rules: value.rules.map(operationalItem),
      skills: value.skills.map(operationalItem),
      capabilities: value.capabilities.map(operationalItem),
      verification: { required: value.verification.required.map(operationalItem) },
    };
  }
  return operationalItem(value);
}
function issue(code, profile_id = null, component_id = null) { return { code, profile_id, component_id }; }
function orderedIssues(issues) { return [...issues].sort((a, b) => canonicalJson(a) < canonicalJson(b) ? -1 : canonicalJson(a) > canonicalJson(b) ? 1 : 0); }
function held(issues, extra = {}) { return freeze({ status: "held", issues: orderedIssues(issues), ...extra }); }
const origin = (item, profile) => ({ ...item, origin_id: profile.id, origin_revision: profile.revision });

/** Structural configuration only. An indexed result has no trust or permission. */
export function buildRuntimeIndex(targetId, profiles) {
  const empty = { index: null, document_hash: null, operational_revision: null };
  let inputs;
  try { inputs = snapshot(profiles); } catch (error) { return held([issue(error.code ?? "invalid_host_data")], empty); }
  if (typeof targetId !== "string" || !YAWN_ID.test(targetId)) return held([issue("invalid_target")], empty);
  if (!Array.isArray(inputs) || inputs.length > HOST_LIMITS.profiles) return held([issue("profiles_limit_or_type")], empty);
  const issues = [];
  const byId = new Map();
  for (const input of inputs) {
    if (validateRuntimeProfile(input).length) { issues.push(issue("invalid_profile")); continue; }
    if (byId.has(input.id)) issues.push(issue("duplicate_profile", input.id));
    byId.set(input.id, input);
  }
  const chain = [], seen = new Set();
  let next = targetId;
  while (!issues.length && next !== null) {
    if (seen.has(next)) { issues.push(issue("parent_cycle", next)); break; }
    seen.add(next);
    const profile = byId.get(next);
    if (!profile) { issues.push(issue("missing_parent", next)); break; }
    chain.unshift(profile);
    next = profile.primary_parent_id;
  }
  if (issues.length) return held(issues, empty);
  // Reuse 0.1's unchanged composition algebra with structurally recognized
  // handlers. This internal pass confers no adoption or registry trust.
  const handlers = new Set();
  const structural = chain.map((profile) => {
    for (const rule of profile.runtime.rules ?? []) if (rule.enforcement.mode === "code") handlers.add(rule.enforcement.handler);
    for (const check of profile.runtime.verification?.required ?? []) if (check.mode === "code") handlers.add(check.handler);
    return { ...profile, runtime: { ...profile.runtime, skills: [], capabilities: [] } };
  });
  const composed = resolveRuntimeConfig(targetId, structural, { verifyAdoption: () => true, supportedHandlers: [...handlers] });
  if (composed.status !== "resolved") return held(composed.issues.map((entry) => issue(entry.code, entry.profile_id)), empty);
  const skills = new Map(), capabilities = new Map();
  for (const profile of chain) {
    for (const skill of profile.runtime.skills ?? []) skills.set(skill.id, origin(skill, profile));
    for (const capability of profile.runtime.capabilities ?? []) {
      const prior = capabilities.get(capability.id);
      if (prior && canonicalJson(operational(prior)) !== canonicalJson(operational(origin(capability, profile)))) {
        // Origin provenance is distinct from provider binding identity.
        const stripOrigin = ({ origin_id, origin_revision, ...item }) => item;
        if (canonicalJson(stripOrigin(prior)) !== canonicalJson(capability)) issues.push(issue("capability_conflict", profile.id, capability.id));
      }
      capabilities.set(capability.id, origin(capability, profile));
    }
  }
  if (issues.length) return held(issues, empty);
  const config = { ...composed.config, skills: [...skills.values()], capabilities: [...capabilities.values()] };
  const document_hash = hashCanonical(chain);
  const operational_revision = hashCanonical({ contract: RUNTIME_ACTION_CONTRACT, config: operational(config) });
  const index = freeze({ contract: RUNTIME_ACTION_CONTRACT, target_id: targetId, profiles: chain, config, document_hash, operational_revision });
  return freeze({ status: "indexed", issues: [], index, document_hash, operational_revision });
}

function applicable(rule, kind) { return !rule.scope.actions || rule.scope.actions.includes(kind); }
function validAction(action) {
  return exact(action, ["id", "kind", "program_id", "skill_ids", "capability_ids", "resource_refs", "input_digest"], ["id", "kind", "program_id", "skill_ids", "capability_ids"])
    && typeof action.id === "string" && /^action:[^\s]+$/.test(action.id) && action.id.length <= 500
    && typeof action.kind === "string" && ID.test(action.kind)
    && typeof action.program_id === "string" && HANDLER.test(action.program_id)
    && strings(action.skill_ids) && strings(action.capability_ids)
    && (!Object.hasOwn(action, "resource_refs") || strings(action.resource_refs, /^[a-z][a-z0-9_-]*:[^\s]+$/))
    && (!Object.hasOwn(action, "input_digest") || (typeof action.input_digest === "string" && SHA256.test(action.input_digest)));
}
function validProgram(program) {
  return exact(program, ["id", "handler", "actions", "skill_ids", "capability_ids"])
    && typeof program.id === "string" && HANDLER.test(program.id)
    && typeof program.handler === "string" && HANDLER.test(program.handler)
    && strings(program.actions) && program.actions.length > 0 && strings(program.skill_ids) && strings(program.capability_ids);
}

/**
 * Action preflight against a trusted host registry and current snapshots.
 * This function never dispatches, reserves budget, grants authority, or fences
 * a concurrent effect. A host must repeat these checks inside final admission.
 */
export function resolveForAction(inputIndex, inputAction, host = {}) {
  const base = { config: null, document_hash: null, operational_revision: null, action_revision: null, dependencies: null };
  let index, action, programs, dynamic, supported;
  try {
    index = snapshot(inputIndex); action = snapshot(inputAction);
    programs = snapshot(host.programs ?? []); dynamic = snapshot(host.dynamic ?? {}); supported = snapshot(host.supportedHandlers ?? []);
  } catch (error) { return held([issue(error.code ?? "invalid_host_data")], base); }
  if (!exact(index, ["contract", "target_id", "profiles", "config", "document_hash", "operational_revision"]) || index.contract !== RUNTIME_ACTION_CONTRACT) return held([issue("invalid_index")], base);
  const rebuilt = buildRuntimeIndex(index.target_id, index.profiles);
  if (rebuilt.status !== "indexed" || canonicalJson(rebuilt.index) !== canonicalJson(index)) return held([issue("index_changed")], base);
  const revisions = { document_hash: index.document_hash, operational_revision: index.operational_revision };
  if (!validAction(action)) return held([issue("invalid_action")], { ...base, ...revisions });
  if (!Array.isArray(programs) || !programs.every(validProgram) || new Set(programs.map(({ id }) => id)).size !== programs.length || !strings(supported, HANDLER)) return held([issue("invalid_host_registry")], { ...base, ...revisions });
  if (!exact(dynamic, ["grants_revision", "budget_revision", "cancellation_epoch"]) || ![dynamic.grants_revision, dynamic.budget_revision].every((value) => typeof value === "string" && value.length > 0 && value.length <= 500) || !Number.isSafeInteger(dynamic.cancellation_epoch) || dynamic.cancellation_epoch < 0) return held([issue("invalid_dynamic_dependencies")], { ...base, ...revisions });
  freeze(index); freeze(action); freeze(programs); freeze(dynamic);
  const issues = [], handlers = new Set(supported);
  const program = programs.find(({ id }) => id === action.program_id);
  if (!program || !program.actions.includes(action.kind)) return held([issue("unsupported_program")], { ...base, ...revisions });
  if (!handlers.has(program.handler)) issues.push(issue("unsupported_handler", null, program.id));
  if (action.skill_ids.some((id) => !program.skill_ids.includes(id)) || action.capability_ids.some((id) => !program.capability_ids.includes(id))) issues.push(issue("program_selection_mismatch", null, program.id));
  const profileById = new Map(index.profiles.map((profile) => [profile.id, profile]));
  const verified = (callback, args, code, item = null) => {
    try {
      const decision = typeof callback === "function" ? callback(...args) : false;
      if (decision === true) return;
      if (decision instanceof Promise) decision.catch(() => {});
    } catch { /* A failed trusted check remains a hold. */ }
    issues.push(issue(code, item?.origin_id ?? null, item?.id ?? null));
  };
  const handlerCheck = (item, enforcement) => { if (enforcement.mode === "code" && !handlers.has(enforcement.handler)) issues.push(issue("unsupported_handler", item.origin_id, item.id)); };
  const rules = index.config.rules.filter((rule) => applicable(rule, action.kind));
  for (const rule of rules) {
    verified(host.verifyAdoption, [rule, profileById.get(rule.origin_id)], "unverified_adoption", rule);
    handlerCheck(rule, rule.enforcement);
    if (HARD.has(rule.type)) {
      if (!["code", "human"].includes(rule.enforcement.mode)) issues.push(issue("unsupported_admission_enforcement", rule.origin_id, rule.id));
      else verified(host.evaluateRule, [rule, action], "rule_unsatisfied", rule);
    }
  }
  const skills = [];
  const requestedCapabilities = new Set(action.capability_ids);
  for (const id of action.skill_ids) {
    const skill = index.config.skills.find((item) => item.id === id);
    if (!skill || skill.activation === "disabled") { issues.push(issue("skill_unavailable", null, id)); continue; }
    skills.push(skill);
    verified(host.verifySkill, [skill, profileById.get(skill.origin_id)], "unverified_skill", skill);
    for (const capabilityId of skill.capabilities) requestedCapabilities.add(capabilityId);
  }
  const capabilities = [];
  for (const id of [...requestedCapabilities].sort()) {
    if (!program.capability_ids.includes(id)) issues.push(issue("program_selection_mismatch", null, id));
    const capability = index.config.capabilities.find((item) => item.id === id);
    if (!capability) { issues.push(issue("capability_unavailable", null, id)); continue; }
    capabilities.push(capability);
    verified(host.verifyCapability, [capability, profileById.get(capability.origin_id)], "unverified_capability", capability);
    if (capability.binding.protocol === "function" && !handlers.has(capability.binding.handler)) issues.push(issue("unsupported_handler", capability.origin_id, capability.id));
  }
  for (const check of index.config.verification.required) handlerCheck(check, check);
  const config = freeze({ ...index.config, rules, skills, capabilities, program, action });
  if (capabilities.length) verified(host.checkGrant, [action, capabilities], "grant_unavailable");
  verified(host.checkBudget, [action, config.execution], "budget_unavailable");
  verified(host.checkCancellation, [action], "cancelled_or_unknown");
  const dependencies = freeze({
    ancestry: index.profiles.map((profile) => ({ id: profile.id, primary_parent_id: profile.primary_parent_id, rule_scope_hash: hashCanonical(operational((profile.runtime.rules ?? []).filter((rule) => rule.state === "adopted" && (profile.id === index.target_id || rule.scope.descendants) && applicable(rule, action.kind)))) })),
    dynamic,
  });
  if (issues.length) return held(issues, { ...base, ...revisions, dependencies });
  const action_revision = hashCanonical({ contract: RUNTIME_ACTION_CONTRACT, config: operational(config), dependencies });
  return freeze({ status: "resolved", issues: [], config, ...revisions, action_revision, dependencies });
}

/** Default-deny projection. Internal configuration is never a public Rules view. */
export function projectRuntimeDisclosure(result, { canDisclose, audience = "participant" } = {}) {
  try { result = snapshot(result); } catch { return freeze({ status: "held", reason_codes: ["invalid_result"], instructions: [], rules: [], skills: [], capabilities: [], verification: [] }); }
  const visible = { status: result?.status === "resolved" ? "resolved" : "held", reason_codes: [...new Set((result?.issues ?? []).map(({ code }) => code))].sort(), instructions: [], rules: [], skills: [], capabilities: [], verification: [] };
  if (result?.status !== "resolved" || !result.config) return freeze(visible);
  const allow = (kind, item) => { try { return typeof canDisclose === "function" && canDisclose(freeze({ kind, item, audience })) === true; } catch { return false; } };
  for (const [key, kind] of [["instructions", "instruction"], ["rules", "rule"], ["skills", "skill"], ["capabilities", "capability"]]) {
    visible[key] = result.config[key].filter((item) => allow(kind, item)).map((item) => snapshot(item));
  }
  visible.verification = result.config.verification.required.filter((item) => allow("verification", item)).map((item) => snapshot(item));
  if (allow("execution", result.config.execution)) visible.execution = snapshot(result.config.execution);
  if (allow("privacy", result.config.privacy)) visible.privacy = snapshot(result.config.privacy);
  return freeze(visible);
}

/** Lack of an eligible method is a blocker, never proof that a goal is impossible. */
export function describeRuntimeBlockers(results) {
  try { results = snapshot(results); } catch { results = null; }
  const available = Array.isArray(results) && results.some((result) => result?.status === "resolved");
  const codes = Array.isArray(results) ? results.flatMap((result) => (result?.issues ?? []).map(({ code }) => code)) : ["invalid_results"];
  return freeze({ state: available ? "eligible_action_available" : "no_eligible_action", impossible: false, reason_codes: [...new Set(codes)].sort(), alternatives: available ? [] : ["request_authority", "revise_goal", "propose_amendment", "choose_another_method", "hold"] });
}
