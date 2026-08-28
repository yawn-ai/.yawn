import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import test from "node:test";
import Ajv2020 from "ajv/dist/2020.js";
import {
  computeArtifactSetSha256,
  NEW_YAWN_PROFILE_ID,
  REQUIRED_NEW_YAWN_ARTIFACT_PATHS,
  REQUIRED_NEW_YAWN_INVARIANTS,
  REQUIRED_NEW_YAWN_MODULE_IDS,
  validateProtocolManifestSemantics,
} from "../lib/protocol-manifest-v0.1.mjs";

const readJson = async (relativePath) =>
  JSON.parse(await readFile(new URL(relativePath, import.meta.url), "utf8"));

const schema = await readJson("../schemas/protocol-manifest.v0.1.schema.json");
const canonicalManifest = await readJson("../protocol-manifest.v0.1.json");
const canonicalManifestBytes = await readFile(
  new URL("../protocol-manifest.v0.1.json", import.meta.url),
);
const repositoryOrientation = await readFile(
  new URL("../readme.yawn", import.meta.url),
  "utf8",
);
const licenseBytes = await readFile(new URL("../LICENSE", import.meta.url));
const licenseSha256 = createHash("sha256").update(licenseBytes).digest("hex");
const repositoryRoot = fileURLToPath(new URL("..", import.meta.url));
const clone = (value) => structuredClone(value);
const ajv = new Ajv2020({ allErrors: true, strict: true, validateFormats: false });
const validate = ajv.compile(schema);
const schemaErrors = () => ajv.errorsText(validate.errors, { separator: "\n" });

const findArtifact = (manifest, artifactPath) => {
  for (const module of manifest.modules) {
    const artifact = module.artifacts.find((candidate) => candidate.path === artifactPath);
    if (artifact) return artifact;
  }
  return null;
};

test("the protocol manifest validates its current content-addressed module set", async () => {
  assert.equal(validate(canonicalManifest), true, schemaErrors());
  assert.equal(
    canonicalManifest.artifactSetSha256,
    computeArtifactSetSha256(canonicalManifest),
  );
  assert.deepEqual(
    await validateProtocolManifestSemantics(canonicalManifest, { repositoryRoot }),
    [],
  );
  assert.equal(Object.hasOwn(canonicalManifest, "gitCommit"), false);
  assert.equal(
    findArtifact(canonicalManifest, "protocol-manifest.v0.1.json"),
    null,
  );
  assert.match(
    repositoryOrientation,
    new RegExp(`revision: ${canonicalManifest.protocolRevision.replaceAll(".", "\\.")}`),
  );
});

test("the /new profile includes Objective Holon, Orientation Map, and every authority boundary", () => {
  const profile = canonicalManifest.conformanceProfiles.find(
    (candidate) => candidate.profileId === NEW_YAWN_PROFILE_ID,
  );
  assert.ok(profile);
  assert.ok(profile.requiredModuleIds.includes("objective-holon.v0.1"));
  assert.ok(profile.requiredModuleIds.includes("orientation-map.v0.1"));
  assert.ok(profile.requiredModuleIds.includes("observation.v1"));
  assert.ok(profile.requiredModuleIds.includes("contracts.v1"));
  assert.ok(profile.requiredModuleIds.includes("record-event-proof.v1"));
  assert.ok(profile.requiredModuleIds.includes("protocol-manifest.v0.1"));
  assert.ok(profile.requiredModuleIds.includes("interaction-operator-receipt.v0.1"));
  assert.ok(
    profile.requiredArtifactPaths.includes("schemas/objective-holon.v0.1.schema.json"),
  );
  assert.ok(
    profile.requiredArtifactPaths.includes("schemas/orientation-map.v0.1.schema.json"),
  );
  assert.ok(
    profile.requiredArtifactPaths.includes(
      "schemas/interaction-operator-receipt.v0.1.schema.json",
    ),
  );
  assert.ok(
    profile.requiredArtifactPaths.includes(
      "scripts/validate-interaction-operator-receipt-v0.1.mjs",
    ),
  );
  for (const artifactPath of [
    "contracts/schemas/yawn-contracts-v1.schema.json",
    "schemas/record-event.v1.schema.json",
    "schemas/record-proof-receipt.v1.schema.json",
    "scripts/validate-objective-holon-v0.1.mjs",
    "fixtures/dave-good-dad-objective-holon.v0.1.json",
  ]) {
    assert.ok(profile.requiredArtifactPaths.includes(artifactPath), artifactPath);
  }
  for (const invariant of REQUIRED_NEW_YAWN_INVARIANTS) {
    assert.ok(profile.invariants.includes(invariant), invariant);
  }
  assert.deepEqual(new Set(profile.requiredModuleIds), new Set(REQUIRED_NEW_YAWN_MODULE_IDS));
  assert.deepEqual(
    new Set(profile.requiredArtifactPaths),
    new Set(REQUIRED_NEW_YAWN_ARTIFACT_PATHS),
  );
});

test("artifact-set integrity is not the downstream profile claim identity", () => {
  const wholeManifestSha256 = createHash("sha256")
    .update(canonicalManifestBytes)
    .digest("hex");
  assert.notEqual(wholeManifestSha256, canonicalManifest.artifactSetSha256);

  const profileChanged = clone(canonicalManifest);
  profileChanged.conformanceProfiles[0].description += " Changed profile semantics.";
  assert.equal(
    computeArtifactSetSha256(profileChanged),
    canonicalManifest.artifactSetSha256,
  );
  assert.notEqual(
    createHash("sha256").update(JSON.stringify(profileChanged)).digest("hex"),
    createHash("sha256").update(JSON.stringify(canonicalManifest)).digest("hex"),
  );
});

test("a self-consistent subset cannot claim the closed /new profile", async (t) => {
  for (const removedModuleId of [
    "agency-holarchy.v0.2",
    "record-ref.v1",
    "objective-holon.v0.1",
  ]) {
    await t.test(`rejects deletion of ${removedModuleId}`, async () => {
      const invalid = clone(canonicalManifest);
      const removedModule = invalid.modules.find(
        (module) => module.moduleId === removedModuleId,
      );
      const removedPaths = new Set(removedModule.artifacts.map((artifact) => artifact.path));
      invalid.modules = invalid.modules.filter((module) => module.moduleId !== removedModuleId);
      const profile = invalid.conformanceProfiles.find(
        (candidate) => candidate.profileId === NEW_YAWN_PROFILE_ID,
      );
      profile.requiredModuleIds = profile.requiredModuleIds.filter(
        (moduleId) => moduleId !== removedModuleId,
      );
      profile.requiredArtifactPaths = profile.requiredArtifactPaths.filter(
        (artifactPath) => !removedPaths.has(artifactPath),
      );
      invalid.artifactSetSha256 = computeArtifactSetSha256(invalid);

      const errors = await validateProtocolManifestSemantics(invalid, { repositoryRoot });
      assert.match(
        errors.join("\n"),
        new RegExp(`missing required module ${removedModuleId.replaceAll(".", "\\.")}`),
      );
    });
  }
});

test("a self-consistent module cannot delete a fixed /new artifact", async () => {
  const invalid = clone(canonicalManifest);
  const artifactPath = "schemas/objective-holon.v0.1.schema.json";
  const objectiveModule = invalid.modules.find(
    (module) => module.moduleId === "objective-holon.v0.1",
  );
  objectiveModule.artifacts = objectiveModule.artifacts.filter(
    (artifact) => artifact.path !== artifactPath,
  );
  const profile = invalid.conformanceProfiles.find(
    (candidate) => candidate.profileId === NEW_YAWN_PROFILE_ID,
  );
  profile.requiredArtifactPaths = profile.requiredArtifactPaths.filter(
    (candidate) => candidate !== artifactPath,
  );
  invalid.artifactSetSha256 = computeArtifactSetSha256(invalid);

  const errors = await validateProtocolManifestSemantics(invalid, { repositoryRoot });
  assert.match(
    errors.join("\n"),
    /manifest: missing required artifact schemas\/objective-holon\.v0\.1\.schema\.json/,
  );
});

test("a self-consistent surprise module cannot widen the closed /new profile", async () => {
  const invalid = clone(canonicalManifest);
  invalid.modules.push({
    moduleId: "surprise.v1",
    version: "1",
    stability: "stable",
    artifacts: [
      {
        path: "LICENSE",
        role: "normative_contract",
        sha256: licenseSha256,
      },
    ],
  });
  const profile = invalid.conformanceProfiles.find(
    (candidate) => candidate.profileId === NEW_YAWN_PROFILE_ID,
  );
  profile.requiredModuleIds.push("surprise.v1");
  profile.requiredArtifactPaths.push("LICENSE");
  invalid.artifactSetSha256 = computeArtifactSetSha256(invalid);

  const errors = await validateProtocolManifestSemantics(invalid, { repositoryRoot });
  assert.match(errors.join("\n"), /unexpected required module surprise\.v1/);
  assert.match(errors.join("\n"), /unexpected required artifact LICENSE/);
});

test("a required module cannot smuggle an unexpected profile artifact", async () => {
  const invalid = clone(canonicalManifest);
  invalid.modules.find((module) => module.moduleId === "ontology.0.2").artifacts.push({
    path: "LICENSE",
    role: "normative_contract",
    sha256: licenseSha256,
  });
  const profile = invalid.conformanceProfiles.find(
    (candidate) => candidate.profileId === NEW_YAWN_PROFILE_ID,
  );
  profile.requiredArtifactPaths.push("LICENSE");
  invalid.artifactSetSha256 = computeArtifactSetSha256(invalid);

  const errors = await validateProtocolManifestSemantics(invalid, { repositoryRoot });
  assert.match(errors.join("\n"), /unexpected required artifact LICENSE/);
});

test("a closed profile cannot silently add a surprise invariant", async () => {
  const invalid = clone(canonicalManifest);
  const profile = invalid.conformanceProfiles.find(
    (candidate) => candidate.profileId === NEW_YAWN_PROFILE_ID,
  );
  profile.invariants.push("surprise_invariant");

  const errors = await validateProtocolManifestSemantics(invalid, { repositoryRoot });
  assert.match(errors.join("\n"), /unexpected invariant surprise_invariant/);
});

test("artifact-set hashing is reorder-invariant and sensitive to normative tuple changes", () => {
  const reordered = clone(canonicalManifest);
  reordered.modules.reverse();
  for (const module of reordered.modules) module.artifacts.reverse();
  assert.equal(
    computeArtifactSetSha256(reordered),
    computeArtifactSetSha256(canonicalManifest),
  );

  const changedRole = clone(canonicalManifest);
  changedRole.modules[0].artifacts[0].role = "interface_contract";
  assert.notEqual(
    computeArtifactSetSha256(changedRole),
    computeArtifactSetSha256(canonicalManifest),
  );

  const changedVersion = clone(canonicalManifest);
  changedVersion.modules[0].version = "0.2-draft+changed";
  assert.notEqual(
    computeArtifactSetSha256(changedVersion),
    computeArtifactSetSha256(canonicalManifest),
  );
});

test("a profile cannot silently omit one artifact from a required module", async () => {
  const invalid = clone(canonicalManifest);
  const profile = invalid.conformanceProfiles.find(
    (candidate) => candidate.profileId === NEW_YAWN_PROFILE_ID,
  );
  profile.requiredArtifactPaths = profile.requiredArtifactPaths.filter(
    (artifactPath) => artifactPath !== "schemas/objective-holon.v0.1.schema.json",
  );
  const errors = await validateProtocolManifestSemantics(invalid, { repositoryRoot });
  assert.match(
    errors.join("\n"),
    /profile:yawn\.bot\/new\.v0\.1: missing required artifact schemas\/objective-holon\.v0\.1\.schema\.json/,
  );
});

test("a stale artifact hash fails even when the aggregate hash is recomputed", async () => {
  const invalid = clone(canonicalManifest);
  findArtifact(invalid, "schemas/orientation-map.v0.1.schema.json").sha256 = "0".repeat(64);
  invalid.artifactSetSha256 = computeArtifactSetSha256(invalid);
  const errors = await validateProtocolManifestSemantics(invalid, { repositoryRoot });
  assert.match(
    errors.join("\n"),
    /artifact:schemas\/orientation-map\.v0\.1\.schema\.json: sha256 mismatch/,
  );
});

test("a declared profile artifact must exist on disk", async () => {
  const invalid = clone(canonicalManifest);
  const oldPath = "interface/new-yawn-v0.1.yawn";
  const missingPath = "interface/new-yawn-v0.1.missing.yawn";
  findArtifact(invalid, oldPath).path = missingPath;
  const profile = invalid.conformanceProfiles.find(
    (candidate) => candidate.profileId === NEW_YAWN_PROFILE_ID,
  );
  profile.requiredArtifactPaths = profile.requiredArtifactPaths.map((artifactPath) =>
    artifactPath === oldPath ? missingPath : artifactPath
  );
  invalid.artifactSetSha256 = computeArtifactSetSha256(invalid);
  const errors = await validateProtocolManifestSemantics(invalid, { repositoryRoot });
  assert.match(errors.join("\n"), /artifact:interface\/new-yawn-v0\.1\.missing\.yawn: missing file/);
});

test("the manifest cannot include itself in its artifact hash set", () => {
  const invalid = clone(canonicalManifest);
  invalid.modules[0].artifacts[0].path = "protocol-manifest.v0.1.json";
  assert.equal(validate(invalid), false);
  assert.match(schemaErrors(), /must NOT be valid/);
});
