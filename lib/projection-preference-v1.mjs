import { hashCanonical } from "./state-substrate-v1.mjs";

const legacyProtectedRoots = new Set([
  "authority",
  "boundary",
  "privacy",
  "proof",
  "source",
  "provenance",
  "semantic",
]);

const protectedTokens = new Set([
  "authority",
  "authorization",
  "boundaries",
  "boundary",
  "consent",
  "permission",
  "permissions",
  "privacy",
  "proof",
  "provenance",
  "safety",
  "semantic",
  "semantics",
  "source",
  "truth",
]);

const scopeKinds = new Set([
  "principal",
  "agent_space",
  "arena",
  "yawn",
  "observation",
  "view",
]);

const orientationInquiryExactFields = new Set([
  "/density",
  "/question/defaultAxisOrder",
  "/question/foregroundCount",
  "/question/wordingStyle",
  "/question/responseFormat",
  "/input/modality",
  "/output/modality",
  "/pacing",
  "/explanation/showWhyAsked",
  "/accessibility/reducedMotion",
  "/accessibility/highContrast",
  "/accessibility/screenReaderOptimized",
]);

const orientationAxisKeys = new Set([
  "scope",
  "placement",
  "perspective",
  "current-state",
  "intent",
  "lacuna",
  "boundary",
  "movement",
  "proof",
]);

const presentationTokenFields = new Set([
  "/density",
  "/question/wordingStyle",
  "/question/responseFormat",
  "/input/modality",
  "/output/modality",
  "/pacing",
]);
const presentationTokenPattern = /^[a-z][a-z0-9_-]{0,99}$/;
const presentationValueDomains = new Map([
  ["/density", new Set(["compact", "calm", "standard", "spacious"])],
  ["/question/wordingStyle", new Set(["plain", "gentle", "concise", "reflective", "socratic"])],
  ["/question/responseFormat", new Set(["free_text", "structured_choice", "mixed", "voice", "visual_map"])],
  ["/input/modality", new Set(["voice", "free_text", "structured_choice", "mixed", "keyboard", "touch"])],
  ["/output/modality", new Set(["voice", "free_text", "visual_map", "plain_text", "interactive_map", "text", "image", "mixed", "structured_choice"])],
  ["/pacing", new Set(["one-question", "one_question", "conversational", "rapid", "deliberate", "self_paced"])],
]);
const booleanPresentationFields = new Set([
  "/explanation/showWhyAsked",
  "/accessibility/reducedMotion",
  "/accessibility/highContrast",
  "/accessibility/screenReaderOptimized",
]);

const targetedViewPolicies = new Map([
  ["orientation_inquiry", {
    exactFields: orientationInquiryExactFields,
    fieldPrefixes: [],
  }],
]);

function compareText(left, right) {
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
}

function pathTokens(fieldPath) {
  return fieldPath
    .split("/")
    .filter(Boolean)
    .flatMap((segment) => segment
      .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
      .split(/[^A-Za-z0-9]+/)
      .filter(Boolean)
      .map((token) => token.toLowerCase()));
}

function protectedField(fieldPath) {
  return pathTokens(fieldPath).some((token) => protectedTokens.has(token));
}

function legacyProtectedField(fieldPath) {
  return legacyProtectedRoots.has(fieldPath.split("/").filter(Boolean)[0]);
}

function scopeIdentity(scopeRef) {
  return `${scopeRef.kind}\u0000${scopeRef.id}`;
}

function scopeRank(scopeRef) {
  if (scopeRef.kind === "view") return scopeRef.id === "view:default" ? 0 : 60;
  if (scopeRef.kind === "principal") return 10;
  if (scopeRef.kind === "agent_space") return 20;
  if (scopeRef.kind === "arena") return 30;
  if (scopeRef.kind === "yawn") return 40;
  if (scopeRef.kind === "observation") return 50;
  return -1;
}

function normalizeActiveScopeRef(scopeRef) {
  if (scopeRef === null || typeof scopeRef !== "object" || Array.isArray(scopeRef)) {
    throw new Error("projection_preference_active_scope_ref_invalid");
  }
  const keys = Object.keys(scopeRef);
  if (keys.some((key) => !["kind", "id", "revision", "stateSha256"].includes(key))) {
    throw new Error("projection_preference_active_scope_ref_invalid");
  }
  if (!scopeKinds.has(scopeRef.kind) || typeof scopeRef.id !== "string" || scopeRef.id.length === 0) {
    throw new Error("projection_preference_active_scope_ref_invalid");
  }
  if (
    scopeRef.revision !== undefined
    && scopeRef.revision !== null
    && (!Number.isSafeInteger(scopeRef.revision) || scopeRef.revision < 0)
  ) {
    throw new Error("projection_preference_active_scope_ref_invalid");
  }
  if (
    scopeRef.stateSha256 !== undefined
    && scopeRef.stateSha256 !== null
    && (typeof scopeRef.stateSha256 !== "string" || !/^[a-f0-9]{64}$/.test(scopeRef.stateSha256))
  ) {
    throw new Error("projection_preference_active_scope_ref_invalid");
  }
  return {
    kind: scopeRef.kind,
    id: scopeRef.id,
    ...(scopeRef.revision === undefined ? {} : { revision: scopeRef.revision }),
    ...(scopeRef.stateSha256 === undefined ? {} : { stateSha256: scopeRef.stateSha256 }),
  };
}

function normalizeTargetedOptions(options) {
  if (options === null || typeof options !== "object" || Array.isArray(options)) {
    throw new Error("projection_preference_options_object_required");
  }
  if (typeof options.viewKind !== "string" || options.viewKind.length === 0) {
    throw new Error("projection_preference_view_kind_required");
  }
  if (!targetedViewPolicies.has(options.viewKind)) {
    throw new Error(`projection_preference_view_kind_unsupported:${options.viewKind}`);
  }
  if (typeof options.principalRef !== "string" || options.principalRef.length === 0) {
    throw new Error("projection_preference_principal_ref_required");
  }
  if (!Array.isArray(options.activeScopeRefs) || options.activeScopeRefs.length === 0) {
    throw new Error("projection_preference_active_scope_refs_required");
  }

  const activeScopeRefs = options.activeScopeRefs.map(normalizeActiveScopeRef);
  const identities = new Set();
  for (const scopeRef of activeScopeRefs) {
    const identity = scopeIdentity(scopeRef);
    if (identities.has(identity)) {
      throw new Error(`projection_preference_active_scope_ref_duplicate:${scopeRef.kind}:${scopeRef.id}`);
    }
    identities.add(identity);
    if (scopeRef.kind === "principal" && scopeRef.id !== options.principalRef) {
      throw new Error("projection_preference_principal_scope_mismatch");
    }
  }
  if (!identities.has(scopeIdentity({ kind: "principal", id: options.principalRef }))) {
    throw new Error("projection_preference_principal_scope_required");
  }

  activeScopeRefs.sort((left, right) => (
    scopeRank(left) - scopeRank(right)
    || compareText(scopeIdentity(left), scopeIdentity(right))
    || compareText(hashCanonical(left), hashCanonical(right))
  ));

  return {
    viewKind: options.viewKind,
    principalRef: options.principalRef,
    activeScopeRefs,
    activeScopeKeys: new Set(activeScopeRefs.map((scopeRef) => hashCanonical(scopeRef))),
  };
}

function allowedTargetedField(viewKind, fieldPath) {
  const policy = targetedViewPolicies.get(viewKind);
  return policy.exactFields.has(fieldPath)
    || policy.fieldPrefixes.some((prefix) => fieldPath.startsWith(prefix) && fieldPath.length > prefix.length);
}

function validateTargetedPreference(preference, viewKind) {
  if (typeof preference.preferenceId !== "string" || preference.preferenceId.length === 0) {
    throw new Error("projection_preference_id_required");
  }
  if (typeof preference.fieldPath !== "string" || preference.fieldPath.length === 0) {
    throw new Error("projection_preference_field_path_required");
  }
  if (protectedField(preference.fieldPath)) {
    throw new Error(`protected_projection_preference:${preference.fieldPath}`);
  }
  if (!allowedTargetedField(viewKind, preference.fieldPath)) {
    throw new Error(`projection_preference_field_not_allowed:${viewKind}:${preference.fieldPath}`);
  }
  if (!Number.isSafeInteger(preference.revision) || preference.revision < 1) {
    throw new Error("projection_preference_revision_invalid");
  }
  if (!scopeKinds.has(preference.scopeRef?.kind) || typeof preference.scopeRef.id !== "string" || preference.scopeRef.id.length === 0) {
    throw new Error("projection_preference_scope_ref_invalid");
  }
  if (preference.operation !== "set" && preference.operation !== "reset") {
    throw new Error("projection_preference_operation_invalid");
  }
  if (preference.operation === "reset" && preference.value !== null) {
    throw new Error("projection_preference_reset_value_invalid");
  }
  if (preference.operation === "set" && preference.fieldPath === "/question/defaultAxisOrder") {
    const value = preference.value;
    if (
      !Array.isArray(value)
      || value.length < 1
      || value.length > orientationAxisKeys.size
      || new Set(value).size !== value.length
      || value.some((key) => typeof key !== "string" || !orientationAxisKeys.has(key))
    ) {
      throw new Error("projection_preference_default_axis_order_invalid");
    }
  }
  if (
    preference.operation === "set"
    && presentationTokenFields.has(preference.fieldPath)
    && (typeof preference.value !== "string" || !presentationTokenPattern.test(preference.value))
  ) {
    throw new Error(`projection_preference_token_value_invalid:${preference.fieldPath}`);
  }
  if (
    preference.operation === "set"
    && presentationValueDomains.has(preference.fieldPath)
    && !presentationValueDomains.get(preference.fieldPath).has(preference.value)
  ) {
    throw new Error(`projection_preference_value_outside_domain:${preference.fieldPath}`);
  }
  if (
    preference.operation === "set"
    && preference.fieldPath === "/question/foregroundCount"
    && (!Number.isInteger(preference.value) || preference.value < 1 || preference.value > 3)
  ) {
    throw new Error("projection_preference_foreground_count_invalid");
  }
  if (
    preference.operation === "set"
    && booleanPresentationFields.has(preference.fieldPath)
    && typeof preference.value !== "boolean"
  ) {
    throw new Error(`projection_preference_boolean_value_invalid:${preference.fieldPath}`);
  }
  if (typeof preference.sourceEventRef !== "string" || preference.sourceEventRef.length === 0) {
    throw new Error("projection_preference_source_event_ref_required");
  }
}

function resolveLegacyProjectionPreferences(layers) {
  const fields = {};
  const resets = {};

  for (const layer of layers) {
    for (const preference of layer.preferences ?? []) {
      if (preference.status !== "accepted") continue;
      if (legacyProtectedField(preference.fieldPath)) {
        throw new Error(`protected_projection_preference:${preference.fieldPath}`);
      }

      const provenance = {
        preferenceId: preference.preferenceId,
        scopeRef: preference.scopeRef,
        sourceEventRef: preference.sourceEventRef,
        revision: preference.revision,
      };
      if (preference.operation === "reset") {
        delete fields[preference.fieldPath];
        resets[preference.fieldPath] = provenance;
      } else {
        delete resets[preference.fieldPath];
        fields[preference.fieldPath] = { value: preference.value, ...provenance };
      }
    }
  }

  const resolved = { schemaVersion: "yawn.resolved-projection-preferences.v1", fields, resets };
  return { ...resolved, preferenceHash: hashCanonical(resolved).replace(/^sha256:/, "") };
}

function selectCurrentRevisions(preferences) {
  const byLogicalPreference = new Map();
  const logicalKey = (preference) => [
    preference.preferenceId,
    scopeIdentity(preference.scopeRef),
    preference.fieldPath,
  ].join("\u0000");
  const ordered = [...preferences].sort((left, right) => (
    compareText(logicalKey(left), logicalKey(right))
    || right.revision - left.revision
    || compareText(hashCanonical(left), hashCanonical(right))
  ));
  for (const preference of ordered) {
    const key = logicalKey(preference);
    const current = byLogicalPreference.get(key);
    if (current === undefined || preference.revision > current.revision) {
      byLogicalPreference.set(key, preference);
      continue;
    }
    if (preference.revision === current.revision && hashCanonical(preference) !== hashCanonical(current)) {
      throw new Error(`projection_preference_revision_ambiguous:${preference.preferenceId}:${preference.fieldPath}`);
    }
  }
  return [...byLogicalPreference.values()];
}

function compareSelectedPreferences(left, right) {
  return scopeRank(left.scopeRef) - scopeRank(right.scopeRef)
    || compareText(left.fieldPath, right.fieldPath)
    || compareText(scopeIdentity(left.scopeRef), scopeIdentity(right.scopeRef))
    || compareText(left.preferenceId, right.preferenceId);
}

function ambiguousPreferenceError(fieldPath, leftId, rightId) {
  const ids = [leftId, rightId].sort(compareText);
  return new Error(`projection_preference_ambiguous:${fieldPath}:${ids[0]}:${ids[1]}`);
}

function rejectAmbiguousSlots(preferences) {
  const byExactSlot = new Map();
  const byPrecedenceSlot = new Map();
  for (const preference of preferences) {
    const exactKey = `${scopeIdentity(preference.scopeRef)}\u0000${preference.fieldPath}`;
    const exact = byExactSlot.get(exactKey);
    if (exact !== undefined && exact.preferenceId !== preference.preferenceId) {
      throw ambiguousPreferenceError(preference.fieldPath, exact.preferenceId, preference.preferenceId);
    }
    byExactSlot.set(exactKey, preference);

    const precedenceKey = `${scopeRank(preference.scopeRef)}\u0000${preference.fieldPath}`;
    const peer = byPrecedenceSlot.get(precedenceKey);
    if (peer !== undefined && (
      peer.preferenceId !== preference.preferenceId
      || scopeIdentity(peer.scopeRef) !== scopeIdentity(preference.scopeRef)
    )) {
      throw ambiguousPreferenceError(preference.fieldPath, peer.preferenceId, preference.preferenceId);
    }
    byPrecedenceSlot.set(precedenceKey, preference);
  }
}

function resolveTargetedProjectionPreferences(layers, options) {
  const target = normalizeTargetedOptions(options);
  const applicable = [];

  for (const layer of layers) {
    for (const preference of layer.preferences ?? []) {
      if (preference.status !== "accepted") continue;
      if (preference.viewKind !== target.viewKind) continue;
      if (preference.principalRef !== target.principalRef) continue;
      const normalizedScopeRef = normalizeActiveScopeRef(preference.scopeRef);
      if (!target.activeScopeKeys.has(hashCanonical(normalizedScopeRef))) continue;
      validateTargetedPreference(preference, target.viewKind);
      applicable.push(preference);
    }
  }

  const selected = selectCurrentRevisions(applicable);
  selected.sort(compareSelectedPreferences);
  rejectAmbiguousSlots(selected);

  const fields = {};
  const resets = {};
  for (const preference of selected) {
    const provenance = {
      preferenceId: preference.preferenceId,
      principalRef: preference.principalRef,
      scopeRef: preference.scopeRef,
      viewKind: preference.viewKind,
      sourceEventRef: preference.sourceEventRef,
      revision: preference.revision,
      stateSha256: hashCanonical(preference).replace(/^sha256:/, ""),
    };
    if (preference.operation === "reset") {
      delete fields[preference.fieldPath];
      resets[preference.fieldPath] = provenance;
    } else {
      delete resets[preference.fieldPath];
      fields[preference.fieldPath] = { value: preference.value, ...provenance };
    }
  }

  const resolved = {
    schemaVersion: "yawn.resolved-projection-preferences.v1",
    viewKind: target.viewKind,
    principalRef: target.principalRef,
    activeScopeRefs: target.activeScopeRefs,
    fields,
    resets,
  };
  return { ...resolved, preferenceHash: hashCanonical(resolved).replace(/^sha256:/, "") };
}

export function resolveProjectionPreferences(layers, options = undefined) {
  if (options === undefined) return resolveLegacyProjectionPreferences(layers);
  return resolveTargetedProjectionPreferences(layers, options);
}

export function orientationQuestionOrderPreferenceFromResolved(resolved) {
  if (!resolved || typeof resolved !== "object" || Array.isArray(resolved)) {
    throw new Error("resolved_orientation_preferences_required");
  }
  const { preferenceHash, ...resolvedState } = resolved;
  if (
    resolved.schemaVersion !== "yawn.resolved-projection-preferences.v1"
    || resolved.viewKind !== "orientation_inquiry"
    || typeof resolved.principalRef !== "string"
    || !/^principal:[^\s]+$/.test(resolved.principalRef)
    || typeof preferenceHash !== "string"
    || preferenceHash !== hashCanonical(resolvedState).replace(/^sha256:/, "")
  ) {
    throw new Error("resolved_orientation_preferences_invalid");
  }
  const order = resolved.fields?.["/question/defaultAxisOrder"];
  if (
    !order
    || !Array.isArray(order.value)
    || order.value.length < 1
    || order.value.length > orientationAxisKeys.size
    || new Set(order.value).size !== order.value.length
    || order.value.some((questionKey) => !orientationAxisKeys.has(questionKey))
    || typeof order.preferenceId !== "string"
    || !Number.isSafeInteger(order.revision)
    || order.revision < 1
    || typeof order.stateSha256 !== "string"
    || !/^[a-f0-9]{64}$/.test(order.stateSha256)
  ) {
    throw new Error("resolved_orientation_question_order_missing_or_invalid");
  }
  const preferenceRefs = [{
    preferenceId: order.preferenceId,
    revision: order.revision,
    stateSha256: order.stateSha256,
    scopeRef: order.scopeRef,
  }];
  const orderEvidenceState = {
    schemaVersion: "yawn.orientation-question-order-preference-evidence.v1",
    viewKind: resolved.viewKind,
    principalRef: resolved.principalRef,
    activeScopeRefs: resolved.activeScopeRefs,
    fieldPath: "/question/defaultAxisOrder",
    questionKeys: order.value,
    preferenceRefs,
  };
  return {
    evidenceSchemaVersion: orderEvidenceState.schemaVersion,
    viewKind: orderEvidenceState.viewKind,
    fieldPath: orderEvidenceState.fieldPath,
    activeScopeRefs: orderEvidenceState.activeScopeRefs,
    questionKeys: [...order.value],
    status: "accepted",
    preferenceHash: hashCanonical(orderEvidenceState).replace(/^sha256:/, ""),
    preferenceRefs,
    principalRef: resolved.principalRef,
  };
}
