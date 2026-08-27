import assert from "node:assert/strict";
import test from "node:test";
import {
  orientationQuestionOrderPreferenceFromResolved,
  resolveProjectionPreferences,
} from "../lib/projection-preference-v1.mjs";
import { hashCanonical } from "../lib/state-substrate-v1.mjs";

const principalRef = "principal:fixture-owner";
const orientationView = "orientation_inquiry";
const scopes = {
  defaultView: { kind: "view", id: "view:default" },
  principal: { kind: "principal", id: principalRef },
  arena: { kind: "arena", id: "arena:current-lived-field" },
  yawn: { kind: "yawn", id: "yawn:fixture:participation-choice" },
  currentView: { kind: "view", id: "view:orientation:current-turn" },
};

const options = (activeScopeRefs = [
  scopes.defaultView,
  scopes.principal,
  scopes.arena,
  scopes.yawn,
]) => ({
  viewKind: orientationView,
  principalRef,
  activeScopeRefs,
});

const preference = ({
  preferenceId,
  scopeRef = scopes.principal,
  fieldPath = "/output/modality",
  operation = "set",
  value = "free_text",
  revision = 1,
  preferencePrincipalRef = principalRef,
  viewKind = orientationView,
  sourceEventRef = `event:${preferenceId}`,
}) => ({
  schemaVersion: "yawn.projection-preference.v1",
  preferenceId,
  principalRef: preferencePrincipalRef,
  scopeRef,
  viewKind,
  fieldPath,
  operation,
  value,
  status: "accepted",
  revision,
  sourceEventRef,
  createdAt: "2026-08-27T00:00:00Z",
  updatedAt: `2026-08-27T00:00:0${Math.min(revision, 9)}Z`,
});

test("one-argument resolution preserves the exact legacy result and hash", () => {
  const legacyPreference = (preferenceId, scopeRef, fieldPath, operation, value, revision) => ({
    preferenceId,
    scopeRef,
    fieldPath,
    operation,
    value,
    revision,
    status: "accepted",
    sourceEventRef: `event:${preferenceId}`,
  });
  const resolved = resolveProjectionPreferences([
    { preferences: [legacyPreference("default-density", scopes.defaultView, "/density", "set", "calm", 1)] },
    { preferences: [legacyPreference("fixture-owner-density", scopes.principal, "/density", "set", "compact", 2)] },
    { preferences: [legacyPreference("observation-reset", { kind: "observation", id: "observation:one" }, "/density", "reset", null, 1)] },
  ]);

  assert.deepEqual(resolved, {
    schemaVersion: "yawn.resolved-projection-preferences.v1",
    fields: {},
    resets: {
      "/density": {
        preferenceId: "observation-reset",
        scopeRef: { kind: "observation", id: "observation:one" },
        sourceEventRef: "event:observation-reset",
        revision: 1,
      },
    },
    preferenceHash: "9cb2724fcb4bd50c30cc2c4e0bf917d5706014612ef325d5a83793f4eda05362",
  });
});

test("targeted mode requires an object with exact View, principal, and active scopes", () => {
  assert.throws(
    () => resolveProjectionPreferences([], orientationView),
    /projection_preference_options_object_required/,
  );
  assert.throws(
    () => resolveProjectionPreferences([], { viewKind: orientationView }),
    /projection_preference_principal_ref_required/,
  );
  assert.throws(
    () => resolveProjectionPreferences([], { viewKind: orientationView, principalRef }),
    /projection_preference_active_scope_refs_required/,
  );
  assert.throws(
    () => resolveProjectionPreferences([], {
      viewKind: "orientation-inquiry",
      principalRef,
      activeScopeRefs: [scopes.principal],
    }),
    /projection_preference_view_kind_unsupported:orientation-inquiry/,
  );
  assert.throws(
    () => resolveProjectionPreferences([], {
      viewKind: orientationView,
      principalRef,
      activeScopeRefs: [scopes.yawn],
    }),
    /projection_preference_principal_scope_required/,
  );
});

test("targeted resolution isolates principal and exact active scopes", () => {
  const layers = [{ preferences: [
    preference({ preferenceId: "active-principal", value: "voice" }),
    preference({
      preferenceId: "foreign-principal",
      preferencePrincipalRef: "principal:other",
      value: "image",
    }),
    preference({
      preferenceId: "foreign-yawn",
      scopeRef: { kind: "yawn", id: "yawn:other" },
      value: "video",
    }),
    preference({
      preferenceId: "foreign-view",
      viewKind: "observation_question_art",
      value: "illustration",
    }),
  ] }];
  const resolved = resolveProjectionPreferences(layers, options());

  assert.equal(resolved.fields["/output/modality"].value, "voice");
  assert.equal(resolved.fields["/output/modality"].preferenceId, "active-principal");
  assert.equal(resolved.fields["/output/modality"].principalRef, principalRef);
  assert.equal(resolved.principalRef, principalRef);
  assert.deepEqual(resolved.activeScopeRefs, [
    scopes.defaultView,
    scopes.principal,
    scopes.arena,
    scopes.yawn,
  ]);
});

test("active scope revision and state hash must match exactly", () => {
  const activeYawn = {
    ...scopes.yawn,
    revision: 2,
    stateSha256: "a".repeat(64),
  };
  const staleYawn = {
    ...scopes.yawn,
    revision: 1,
    stateSha256: "b".repeat(64),
  };
  const resolved = resolveProjectionPreferences([{ preferences: [
    preference({ preferenceId: "principal-fallback", value: "voice" }),
    preference({ preferenceId: "stale-yawn", scopeRef: staleYawn, value: "image" }),
    preference({ preferenceId: "active-yawn", scopeRef: activeYawn, value: "visual_map" }),
  ] }], options([scopes.defaultView, scopes.principal, scopes.arena, activeYawn]));

  assert.equal(resolved.fields["/output/modality"].preferenceId, "active-yawn");
  assert.deepEqual(resolved.fields["/output/modality"].scopeRef, activeYawn);
  assert.deepEqual(resolved.activeScopeRefs.at(-1), activeYawn);
});

test("default View is lowest and explicit current-turn View is highest", () => {
  const preferences = [
    preference({ preferenceId: "yawn-medium", scopeRef: scopes.yawn, value: "visual_map" }),
    preference({ preferenceId: "default-medium", scopeRef: scopes.defaultView, value: "plain_text" }),
    preference({ preferenceId: "arena-medium", scopeRef: scopes.arena, value: "voice" }),
    preference({ preferenceId: "principal-medium", value: "free_text" }),
    preference({ preferenceId: "turn-medium", scopeRef: scopes.currentView, value: "interactive_map" }),
  ];

  const withoutTurn = resolveProjectionPreferences(
    [{ preferences: [...preferences].reverse() }],
    options(),
  );
  assert.equal(withoutTurn.fields["/output/modality"].preferenceId, "yawn-medium");

  const withTurn = resolveProjectionPreferences(
    [{ preferences }],
    options([scopes.currentView, scopes.yawn, scopes.defaultView, scopes.arena, scopes.principal]),
  );
  assert.equal(withTurn.fields["/output/modality"].preferenceId, "turn-medium");
});

test("a more-specific reset wins without erasing omitted fields", () => {
  const resolved = resolveProjectionPreferences([{ preferences: [
    preference({ preferenceId: "principal-medium", value: "voice" }),
    preference({
      preferenceId: "principal-order",
      fieldPath: "/question/defaultAxisOrder",
      value: ["scope", "placement"],
    }),
    preference({
      preferenceId: "yawn-medium-reset",
      scopeRef: scopes.yawn,
      operation: "reset",
      value: null,
    }),
  ] }], options());

  assert.equal(resolved.fields["/output/modality"], undefined);
  assert.equal(resolved.resets["/output/modality"].preferenceId, "yawn-medium-reset");
  assert.deepEqual(resolved.fields["/question/defaultAxisOrder"].value, ["scope", "placement"]);
});

test("orientation inquiry uses a safe field allowlist", () => {
  const accepted = resolveProjectionPreferences([{ preferences: [
    preference({
      preferenceId: "reduced-motion",
      fieldPath: "/accessibility/reducedMotion",
      value: true,
    }),
    preference({
      preferenceId: "density",
      fieldPath: "/density",
      value: "compact",
    }),
  ] }], options());
  assert.equal(accepted.fields["/accessibility/reducedMotion"].value, true);
  assert.equal(accepted.fields["/density"].value, "compact");

  for (const fieldPath of ["/layout/visibleSections", "/layout/density"]) {
    assert.throws(
      () => resolveProjectionPreferences([{ preferences: [preference({
        preferenceId: `bad-${fieldPath}`,
        fieldPath,
        value: [],
      })] }], options()),
      /projection_preference_field_not_allowed/,
    );
  }
  assert.throws(
    () => resolveProjectionPreferences([{ preferences: [preference({
      preferenceId: "hide-safety",
      fieldPath: "/presentation/safety/visible",
      value: false,
    })] }], options()),
    /protected_projection_preference/,
  );
});

test("default axis order is a validated partial tie-break and is not expanded", () => {
  const partialOrder = ["perspective", "current-state", "scope"];
  const resolved = resolveProjectionPreferences([{ preferences: [preference({
    preferenceId: "axis-order",
    fieldPath: "/question/defaultAxisOrder",
    value: partialOrder,
  })] }], options());
  assert.deepEqual(resolved.fields["/question/defaultAxisOrder"].value, partialOrder);

  for (const value of [
    [],
    ["scope", "scope"],
    ["scope", "unknown"],
    "scope",
  ]) {
    assert.throws(
      () => resolveProjectionPreferences([{ preferences: [preference({
        preferenceId: "bad-axis-order",
        fieldPath: "/question/defaultAxisOrder",
        value,
      })] }], options()),
      /projection_preference_default_axis_order_invalid/,
    );
  }
});

test("orientation-order evidence hash excludes unrelated presentation fields", () => {
  const orderPreference = preference({
    preferenceId: "axis-order",
    fieldPath: "/question/defaultAxisOrder",
    value: ["perspective", "scope"],
  });
  const compact = orientationQuestionOrderPreferenceFromResolved(resolveProjectionPreferences([{ preferences: [
    orderPreference,
    preference({ preferenceId: "density", fieldPath: "/density", value: "compact" }),
  ] }], options()));
  const spacious = orientationQuestionOrderPreferenceFromResolved(resolveProjectionPreferences([{ preferences: [
    orderPreference,
    preference({ preferenceId: "density", fieldPath: "/density", value: "spacious" }),
  ] }], options()));
  assert.deepEqual(compact, spacious);

  const changedOrder = orientationQuestionOrderPreferenceFromResolved(resolveProjectionPreferences([{ preferences: [
    { ...orderPreference, value: ["scope", "perspective"] },
  ] }], options()));
  assert.notEqual(compact.preferenceHash, changedOrder.preferenceHash);

  const unsafeRevision = structuredClone(resolveProjectionPreferences([{ preferences: [orderPreference] }], options()));
  unsafeRevision.fields["/question/defaultAxisOrder"].revision = Number.MAX_SAFE_INTEGER + 1;
  const { preferenceHash: ignoredHash, ...unsafeState } = unsafeRevision;
  unsafeRevision.preferenceHash = hashCanonical(unsafeState).replace(/^sha256:/, "");
  assert.throws(
    () => orientationQuestionOrderPreferenceFromResolved(unsafeRevision),
    /resolved_orientation_question_order_missing_or_invalid/,
  );
});

test("targeted presentation fields cannot hide all questions or carry malformed values", () => {
  for (const value of [0, 4, 1.5, "1"]) {
    assert.throws(
      () => resolveProjectionPreferences([{ preferences: [preference({
        preferenceId: "bad-foreground-count",
        fieldPath: "/question/foregroundCount",
        value,
      })] }], options()),
      /projection_preference_foreground_count_invalid/,
    );
  }
  assert.throws(
    () => resolveProjectionPreferences([{ preferences: [preference({
      preferenceId: "bad-medium",
      fieldPath: "/output/modality",
      value: "bad token",
    })] }], options()),
    /projection_preference_token_value_invalid/,
  );
  for (const [fieldPath, value] of [
    ["/output/modality", "none"],
    ["/density", "zero"],
    ["/question/wordingStyle", "omit"],
    ["/question/responseFormat", "hidden"],
  ]) {
    assert.throws(
      () => resolveProjectionPreferences([{ preferences: [preference({
        preferenceId: `unsafe-value-${fieldPath}`,
        fieldPath,
        value,
      })] }], options()),
      /projection_preference_value_outside_domain/,
    );
  }
  assert.throws(
    () => resolveProjectionPreferences([{ preferences: [preference({
      preferenceId: "bad-explanation-toggle",
      fieldPath: "/explanation/showWhyAsked",
      value: "yes",
    })] }], options()),
    /projection_preference_boolean_value_invalid/,
  );
  for (const fieldPath of [
    "/accessibility/ariaHidden",
    "/accessibility/display",
    "/accessibility/visible",
    "/accessibility/foo",
  ]) {
    assert.throws(
      () => resolveProjectionPreferences([{ preferences: [preference({
        preferenceId: `unsafe-${fieldPath}`,
        fieldPath,
        value: true,
      })] }], options()),
      /projection_preference_field_not_allowed/,
    );
  }
  const resolved = resolveProjectionPreferences([{ preferences: [preference({
    preferenceId: "one-question",
    fieldPath: "/question/foregroundCount",
    value: 1,
  })] }], options());
  assert.equal(resolved.fields["/question/foregroundCount"].value, 1);
  assert.throws(
    () => resolveProjectionPreferences([{ preferences: [preference({
      preferenceId: "unsafe-revision",
      revision: Number.MAX_SAFE_INTEGER + 1,
    })] }], options()),
    /projection_preference_revision_invalid/,
  );
});

test("highest revision wins independent of input order", () => {
  const revisions = [
    preference({ preferenceId: "medium", revision: 1, value: "text" }),
    preference({ preferenceId: "medium", revision: 2, value: "image" }),
    preference({ preferenceId: "medium", revision: 3, value: "visual_map" }),
    preference({ preferenceId: "medium", revision: 2, value: "voice" }),
  ];
  const forward = resolveProjectionPreferences([{ preferences: revisions }], options());
  const reverse = resolveProjectionPreferences([{ preferences: [...revisions].reverse() }], options());

  assert.equal(forward.fields["/output/modality"].revision, 3);
  assert.equal(forward.fields["/output/modality"].value, "visual_map");
  assert.deepEqual(forward, reverse);
});

test("conflicting same revisions and distinct IDs at one slot are rejected", () => {
  assert.throws(
    () => resolveProjectionPreferences([{ preferences: [
      preference({ preferenceId: "medium", revision: 2, value: "voice" }),
      preference({ preferenceId: "medium", revision: 2, value: "visual_map" }),
    ] }], options()),
    /projection_preference_revision_ambiguous/,
  );

  const ambiguous = [
    preference({ preferenceId: "medium-a", value: "voice" }),
    preference({ preferenceId: "medium-b", value: "visual_map" }),
  ];
  const errorMessage = (preferences) => {
    try {
      resolveProjectionPreferences([{ preferences }], options());
      assert.fail("expected projection preference ambiguity");
    } catch (error) {
      return error.message;
    }
  };
  assert.equal(errorMessage(ambiguous), errorMessage([...ambiguous].reverse()));
  assert.match(errorMessage(ambiguous), /projection_preference_ambiguous/);
});

test("principal and active scope identities are bound into deterministic provenance and hash", () => {
  const layers = [{ preferences: [preference({ preferenceId: "wording", fieldPath: "/question/wordingStyle", value: "plain" })] }];
  const firstScopes = [scopes.yawn, scopes.defaultView, scopes.principal, scopes.arena];
  const sameScopesDifferentOrder = [scopes.principal, scopes.arena, scopes.yawn, scopes.defaultView];
  const differentContext = [
    scopes.principal,
    scopes.defaultView,
    scopes.arena,
    { kind: "yawn", id: "yawn:fixture:another" },
  ];

  const first = resolveProjectionPreferences(layers, options(firstScopes));
  const reordered = resolveProjectionPreferences(layers, options(sameScopesDifferentOrder));
  const changed = resolveProjectionPreferences(layers, options(differentContext));

  assert.deepEqual(first, reordered);
  assert.notEqual(first.preferenceHash, changed.preferenceHash);
  assert.equal(first.fields["/question/wordingStyle"].principalRef, principalRef);
  assert.deepEqual(first.fields["/question/wordingStyle"].scopeRef, scopes.principal);
});
