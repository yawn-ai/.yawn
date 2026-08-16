import { hashCanonical } from "./state-substrate-v1.mjs";

const protectedRoots = new Set(["authority", "boundary", "privacy", "proof", "source", "provenance", "semantic"]);

function protectedField(fieldPath) {
  return protectedRoots.has(fieldPath.split("/").filter(Boolean)[0]);
}

export function resolveProjectionPreferences(layers) {
  const fields = {};
  const resets = {};

  for (const layer of layers) {
    for (const preference of layer.preferences ?? []) {
      if (preference.status !== "accepted") continue;
      if (protectedField(preference.fieldPath)) {
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
