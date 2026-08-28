import { createHash } from "node:crypto";
import { readFile, realpath, stat } from "node:fs/promises";
import path from "node:path";

export const NEW_YAWN_PROFILE_ID = "yawn.bot/new.v0.1";

export const REQUIRED_NEW_YAWN_ARTIFACT_PATHS_BY_MODULE = Object.freeze({
  "protocol-manifest.v0.1": Object.freeze([
    "schemas/protocol-manifest.v0.1.schema.json",
    "lib/protocol-manifest-v0.1.mjs",
    "scripts/validate-protocol-manifest-v0.1.mjs",
  ]),
  "ontology.0.2": Object.freeze([
    "spec/ontology.md",
    "core/projection-and-aperture.yawn",
  ]),
  "record-ref.v1": Object.freeze([
    "schemas/record-ref.v1.schema.json",
  ]),
  "contracts.v1": Object.freeze([
    "contracts/schemas/yawn-contracts-v1.schema.json",
  ]),
  "record-event-proof.v1": Object.freeze([
    "schemas/record-event.v1.schema.json",
    "schemas/record-proof-receipt.v1.schema.json",
  ]),
  "observation.v1": Object.freeze([
    "schemas/observation.v1.schema.json",
    "lib/observation-state-v1.mjs",
    "interface/yawn-observation-view-v1.yawn",
  ]),
  "agency-holarchy.v0.2": Object.freeze([
    "core/holarchy.yawn",
    "schemas/agency-holarchy.v0.2.schema.json",
    "lib/agency-holarchy-v0.2.mjs",
    "spec/holarchy.md",
  ]),
  "objective-holon.v0.1": Object.freeze([
    "core/objective-holon.yawn",
    "schemas/objective-holon.v0.1.schema.json",
    "lib/objective-holon-v0.1.mjs",
    "spec/objective-holons.md",
    "interface/objective-compiler.yawn",
    "templates/objective-holon.yawn",
    "scripts/validate-objective-holon-v0.1.mjs",
    "fixtures/dave-good-dad-objective-holon.v0.1.json",
    "examples/dave-good-dad-objective-holon.yawn",
  ]),
  "projection-preference.v1": Object.freeze([
    "schemas/projection-preference.v1.schema.json",
    "lib/projection-preference-v1.mjs",
  ]),
  "orientation-map.v0.1": Object.freeze([
    "core/orientation.yawn",
    "question-packets/orientation-nine.yawn",
    "schemas/orientation-map.v0.1.schema.json",
    "lib/orientation-map-v0.1.mjs",
  ]),
  "inquiry-selection.v0.1": Object.freeze([
    "core/inquiry-selection.yawn",
    "schemas/inquiry-selection-receipt.v0.1.schema.json",
    "lib/inquiry-selection-receipt-v0.1.mjs",
  ]),
  "interaction-operator-receipt.v0.1": Object.freeze([
    "schemas/interaction-operator-receipt.v0.1.schema.json",
    "lib/interaction-operator-receipt-v0.1.mjs",
    "scripts/validate-interaction-operator-receipt-v0.1.mjs",
    "fixtures/interaction-operator-receipt.v0.1.json",
  ]),
  "new-yawn-interface.v0.1": Object.freeze([
    "interface/new-yawn-v0.1.yawn",
  ]),
});

export const REQUIRED_NEW_YAWN_MODULE_IDS = Object.freeze(
  Object.keys(REQUIRED_NEW_YAWN_ARTIFACT_PATHS_BY_MODULE),
);

export const REQUIRED_NEW_YAWN_ARTIFACT_PATHS = Object.freeze(
  Object.values(REQUIRED_NEW_YAWN_ARTIFACT_PATHS_BY_MODULE).flat(),
);

export const REQUIRED_NEW_YAWN_INVARIANTS = Object.freeze([
  "observation_valid_without_promotion",
  "orientation_map_is_noncanonical_view",
  "confirmation_is_not_authority",
  "objective_ratification_is_not_bot_activation",
  "activation_is_not_effect_authority",
  "view_yawn_and_yawn_bot_are_distinct",
  "objective_materialization_requires_cross_document_resolution",
  "interaction_receipt_application_requires_resolution",
  "source_evidence_uses_constitutional_source_identity",
  "objective_bot_binding_receipt_required",
]);

const sha256 = (value) => createHash("sha256").update(value).digest("hex");

export const flattenProtocolArtifacts = (manifest) =>
  manifest.modules.flatMap((module) =>
    module.artifacts.map((artifact) => ({
      ...artifact,
      moduleId: module.moduleId,
      moduleVersion: module.version,
    }))
  );

export const computeArtifactSetSha256 = (manifest) => {
  const tuples = flattenProtocolArtifacts(manifest)
    .map((artifact) => [
      artifact.moduleId,
      artifact.moduleVersion,
      artifact.path,
      artifact.role,
      artifact.sha256,
    ])
    .toSorted((left, right) => {
      const leftSerialized = JSON.stringify(left);
      const rightSerialized = JSON.stringify(right);
      return leftSerialized < rightSerialized ? -1 : leftSerialized > rightSerialized ? 1 : 0;
    });
  return sha256(Buffer.from(JSON.stringify(tuples), "utf8"));
};

const duplicateValues = (values) => {
  const seen = new Set();
  const duplicates = new Set();
  for (const value of values) {
    if (seen.has(value)) duplicates.add(value);
    seen.add(value);
  }
  return [...duplicates].toSorted();
};

const isPortablePath = (value) =>
  typeof value === "string" &&
  value.length > 0 &&
  !path.posix.isAbsolute(value) &&
  !value.includes("\\") &&
  path.posix.normalize(value) === value &&
  !value.split("/").includes("..");

/**
 * Verify the manifest's cross-record integrity and its content-addressed local
 * artifacts. JSON Schema validates shape; this function checks uniqueness,
 * profile closure, path containment, file presence, and bytes-on-disk hashes.
 */
export const validateProtocolManifestSemantics = async (
  manifest,
  {
    repositoryRoot = process.cwd(),
    manifestPath = "protocol-manifest.v0.1.json",
  } = {},
) => {
  const errors = [];
  const resolvedRoot = path.resolve(repositoryRoot);
  let canonicalRoot = resolvedRoot;
  try {
    canonicalRoot = await realpath(resolvedRoot);
  } catch {
    errors.push(`repositoryRoot: missing ${resolvedRoot}`);
  }

  const duplicateModuleIds = duplicateValues(manifest.modules.map((module) => module.moduleId));
  for (const moduleId of duplicateModuleIds) errors.push(`modules: duplicate ${moduleId}`);

  const artifacts = flattenProtocolArtifacts(manifest);
  const duplicateArtifactPaths = duplicateValues(artifacts.map((artifact) => artifact.path));
  for (const artifactPath of duplicateArtifactPaths) errors.push(`artifacts: duplicate ${artifactPath}`);

  const duplicateProfileIds = duplicateValues(
    manifest.conformanceProfiles.map((profile) => profile.profileId),
  );
  for (const profileId of duplicateProfileIds) errors.push(`conformanceProfiles: duplicate ${profileId}`);

  const moduleIndex = new Map(manifest.modules.map((module) => [module.moduleId, module]));
  const artifactIndex = new Map(artifacts.map((artifact) => [artifact.path, artifact]));

  if (manifest.artifactSetSha256 !== computeArtifactSetSha256(manifest)) {
    errors.push("artifactSetSha256: does not match canonical path-and-hash set");
  }

  for (const artifact of artifacts) {
    if (!isPortablePath(artifact.path)) {
      errors.push(`artifact:${artifact.path}: path is not portable`);
      continue;
    }
    if (artifact.path === manifestPath) {
      errors.push(`artifact:${artifact.path}: manifest cannot hash itself`);
      continue;
    }

    const resolvedArtifact = path.resolve(resolvedRoot, artifact.path);
    if (
      resolvedArtifact !== resolvedRoot &&
      !resolvedArtifact.startsWith(`${resolvedRoot}${path.sep}`)
    ) {
      errors.push(`artifact:${artifact.path}: path escapes repository`);
      continue;
    }

    try {
      const [artifactStat, canonicalArtifact] = await Promise.all([
        stat(resolvedArtifact),
        realpath(resolvedArtifact),
      ]);
      if (!artifactStat.isFile()) {
        errors.push(`artifact:${artifact.path}: not a regular file`);
        continue;
      }
      if (
        canonicalArtifact !== canonicalRoot &&
        !canonicalArtifact.startsWith(`${canonicalRoot}${path.sep}`)
      ) {
        errors.push(`artifact:${artifact.path}: symlink target escapes repository`);
        continue;
      }
      const actualSha256 = sha256(await readFile(canonicalArtifact));
      if (actualSha256 !== artifact.sha256) {
        errors.push(
          `artifact:${artifact.path}: sha256 mismatch; expected ${artifact.sha256}, found ${actualSha256}`,
        );
      }
    } catch (error) {
      if (error?.code === "ENOENT") errors.push(`artifact:${artifact.path}: missing file`);
      else errors.push(`artifact:${artifact.path}: ${error.message}`);
    }
  }

  for (const profile of manifest.conformanceProfiles) {
    const requiredModules = new Set(profile.requiredModuleIds);
    const requiredArtifacts = new Set(profile.requiredArtifactPaths);

    for (const moduleId of requiredModules) {
      const module = moduleIndex.get(moduleId);
      if (!module) {
        errors.push(`profile:${profile.profileId}: unresolved module ${moduleId}`);
        continue;
      }
      for (const artifact of module.artifacts) {
        if (!requiredArtifacts.has(artifact.path)) {
          errors.push(`profile:${profile.profileId}: missing required artifact ${artifact.path}`);
        }
      }
    }

    for (const artifactPath of requiredArtifacts) {
      const artifact = artifactIndex.get(artifactPath);
      if (!artifact) {
        errors.push(`profile:${profile.profileId}: unresolved artifact ${artifactPath}`);
      } else if (!requiredModules.has(artifact.moduleId)) {
        errors.push(
          `profile:${profile.profileId}: artifact ${artifactPath} belongs to undeclared module ${artifact.moduleId}`,
        );
      }
    }

    if (profile.profileId === NEW_YAWN_PROFILE_ID) {
      const closedModuleIds = new Set(REQUIRED_NEW_YAWN_MODULE_IDS);
      const closedArtifactPaths = new Set(REQUIRED_NEW_YAWN_ARTIFACT_PATHS);

      for (const moduleId of REQUIRED_NEW_YAWN_MODULE_IDS) {
        if (!requiredModules.has(moduleId)) {
          errors.push(`profile:${profile.profileId}: missing required module ${moduleId}`);
        }
        if (!moduleIndex.has(moduleId)) {
          errors.push(`manifest: missing required module ${moduleId} for ${profile.profileId}`);
        }
      }

      for (const moduleId of requiredModules) {
        if (!closedModuleIds.has(moduleId)) {
          errors.push(`profile:${profile.profileId}: unexpected required module ${moduleId}`);
        }
      }

      for (const artifactPath of REQUIRED_NEW_YAWN_ARTIFACT_PATHS) {
        if (!requiredArtifacts.has(artifactPath)) {
          errors.push(`profile:${profile.profileId}: missing required artifact ${artifactPath}`);
        }
        if (!artifactIndex.has(artifactPath)) {
          errors.push(`manifest: missing required artifact ${artifactPath} for ${profile.profileId}`);
        }
      }

      for (const artifactPath of requiredArtifacts) {
        if (!closedArtifactPaths.has(artifactPath)) {
          errors.push(`profile:${profile.profileId}: unexpected required artifact ${artifactPath}`);
        }
      }

      const invariants = new Set(profile.invariants);
      for (const invariant of REQUIRED_NEW_YAWN_INVARIANTS) {
        if (!invariants.has(invariant)) {
          errors.push(`profile:${profile.profileId}: missing invariant ${invariant}`);
        }
      }
      for (const invariant of invariants) {
        if (!REQUIRED_NEW_YAWN_INVARIANTS.includes(invariant)) {
          errors.push(`profile:${profile.profileId}: unexpected invariant ${invariant}`);
        }
      }
    }
  }

  if (!manifest.conformanceProfiles.some((profile) => profile.profileId === NEW_YAWN_PROFILE_ID)) {
    errors.push(`conformanceProfiles: missing ${NEW_YAWN_PROFILE_ID}`);
  }

  return errors;
};
