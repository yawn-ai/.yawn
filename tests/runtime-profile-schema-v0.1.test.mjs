import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import Ajv2020 from "ajv/dist/2020.js";

const readJson = async (path) => JSON.parse(await readFile(new URL(path, import.meta.url), "utf8"));
const [schema, fixture] = await Promise.all([
  readJson("../schemas/runtime-profile.v0.1.schema.json"),
  readJson("../fixtures/runtime-profile.v0.1.json"),
]);
const ajv = new Ajv2020({ allErrors: true, strict: true });
const validate = ajv.compile(schema);
const clone = (value) => structuredClone(value);
const [shop, scheduling, draft] = fixture.profiles;
const errors = () => ajv.errorsText(validate.errors, { separator: "\n" });
const accepts = (profile) => assert.equal(validate(profile), true, errors());
const rejects = (profile, label) => assert.equal(validate(profile), false, label);
const minimal = () => ({
  spec_version: "yawn.runtime-profile.v0.1",
  kind: "yawn",
  id: "yawn:minimal",
  revision: 1,
  primary_parent_id: null,
  runtime: {},
  provenance: { source_refs: ["source:minimal"] },
});

test("runtime-profile shape accepts the explicit shop, scheduling and draft fixture", () => {
  assert.equal(fixture.profiles.length, 3);
  for (const profile of fixture.profiles) accepts(profile);
  assert.equal(scheduling.primary_parent_id, shop.id);
  assert.equal(draft.primary_parent_id, scheduling.id);
  assert.equal(shop.runtime.rules[0].type, "permission_requirement");
  assert.equal(scheduling.runtime.rules[0].type, "default");
  assert.equal(draft.runtime.skills[0].source.version, "1.4.2");
});

test("minimal profiles declare a version, stable identity, parent and source without inventing operational defaults", () => {
  accepts(minimal());
  const templateShape = minimal();
  templateShape.record_shape = "spec-version";
  accepts(templateShape);
  for (const field of ["spec_version", "kind", "id", "revision", "primary_parent_id", "runtime", "provenance"]) {
    const profile = minimal();
    delete profile[field];
    rejects(profile, `missing ${field}`);
  }
  for (const version of ["yawn.runtime-profile.v1", "0.1", null]) {
    rejects({ ...minimal(), spec_version: version }, `unsupported profile version ${version}`);
  }
  rejects({ ...minimal(), record_shape: "header" }, "unrelated record shape");
});

test("parent identity cannot be a path, route, URL or legacy alias", () => {
  for (const parent of ["shop/scheduling", "/shop/scheduling", "https://example.org/shop", "yawn:shop/scheduling", "", "yawn:shop scheduling"]) {
    rejects({ ...minimal(), primary_parent_id: parent }, `nonidentity parent ${parent}`);
    rejects({ ...minimal(), id: parent }, `nonidentity self ${parent}`);
  }
  for (const field of ["primaryParentYawnRef", "primary_parent_yawn_ref", "parent_coordinate", "parent"]) {
    rejects({ ...minimal(), [field]: "yawn:shop" }, `legacy alias ${field} requires a separate adapter`);
  }
});

test("revisions and execution limits reject unsafe numeric representations and preserve zero budgets", () => {
  for (const revision of [0, -1, 1.5, "1", Number.MAX_SAFE_INTEGER + 1]) {
    rejects({ ...minimal(), revision }, `invalid revision ${revision}`);
    const profile = clone(shop);
    profile.runtime.rules[0].revision = revision;
    rejects(profile, `invalid rule revision ${revision}`);
  }
  for (const field of ["max_model_calls", "max_paid_cost_microusd", "max_retries"]) {
    const profile = clone(shop);
    profile.runtime.execution[field] = 0;
    accepts(profile);
    for (const invalid of [-1, 0.5, "0", Number.MAX_SAFE_INTEGER + 1]) {
      profile.runtime.execution[field] = invalid;
      rejects(profile, `invalid ${field} ${invalid}`);
    }
  }
  for (const field of ["max_concurrency", "timeout_ms"]) {
    const profile = clone(shop);
    profile.runtime.execution[field] = 0;
    rejects(profile, `${field} must be positive`);
  }
  const unfenced = clone(shop);
  unfenced.runtime.execution.stop_semantics = "best_effort";
  rejects(unfenced, "execution cannot claim weaker stop semantics");
  delete unfenced.runtime.execution.stop_semantics;
  rejects(unfenced, "configured execution must name fenced admission");
});

test("code rules and verification require registry keys rather than arbitrary executable references", () => {
  for (const target of ["rule", "verification"]) {
    const profile = clone(target === "rule" ? shop : draft);
    const enforcement = target === "rule" ? profile.runtime.rules[0].enforcement : profile.runtime.verification.required[0];
    delete enforcement.handler;
    rejects(profile, `${target} missing code handler`);
    for (const handler of ["../../untrusted.js", "C:\\runtime\\handler.js", "https://example.org/handler", "require('fs')", "yawn.require-grant", "yawn.require-grant@0", "yawn/require-grant@1"]) {
      enforcement.handler = handler;
      rejects(profile, `${target} executable reference ${handler}`);
    }
    enforcement.handler = "org.example.unknown-handler@2";
    accepts(profile);
  }
});

test("advisory, human and evidence rules cannot present a handler as code enforcement", () => {
  for (const mode of ["model", "human", "evidence"]) {
    const profile = clone(shop);
    profile.runtime.rules[0].enforcement = { mode };
    accepts(profile);
    profile.runtime.rules[0].enforcement.handler = "yawn.require-grant@1";
    rejects(profile, `${mode} rule cannot claim code handler`);
    const check = clone(draft);
    check.runtime.verification.required[0] = { id: "review", mode };
    accepts(check);
    check.runtime.verification.required[0].handler = "yawn.verify.artifact-exists@1";
    rejects(check, `${mode} verification cannot claim code handler`);
  }
});

test("adopted rules need an event reference while proposals stay distinct and retirement retains history", () => {
  const profile = clone(shop);
  const rule = profile.runtime.rules[0];
  delete rule.adoption_ref;
  rejects(profile, "adopted rule missing adoption reference");
  rule.state = "proposed";
  accepts(profile);
  rule.adoption_ref = "event:adopt-customer-contact-rule";
  rejects(profile, "proposal must not claim adoption");
  for (const state of ["adopted", "superseded", "retired"]) {
    rule.state = state;
    accepts(profile);
    rule.adoption_ref = "source:unverified-assertion";
    rejects(profile, `${state} adoption ref must identify an event`);
    rule.adoption_ref = "event:adopt-customer-contact-rule";
  }
  // Resolution must verify this event; a well-shaped string alone cannot prove adoption.
  rule.state = "adopted";
  rule.adoption_ref = "event:unknown-but-well-shaped";
  accepts(profile);
});

test("skills require immutable version and complete SHA-256 pins even when disabled", () => {
  for (const activation of ["auto", "manual", "disabled"]) {
    for (const field of ["version", "digest"]) {
      const profile = clone(draft);
      profile.runtime.skills[0].activation = activation;
      delete profile.runtime.skills[0].source[field];
      rejects(profile, `${activation} skill missing ${field}`);
    }
  }
  for (const version of ["latest", "^1.4.2", "1.*", "1.4", ""]) {
    const profile = clone(draft);
    profile.runtime.skills[0].source.version = version;
    rejects(profile, `unpinned version ${version}`);
  }
  for (const digest of ["sha256:abc123", "sha256:" + "g".repeat(64), "a".repeat(64), "sha256:" + "a".repeat(63)]) {
    const profile = clone(draft);
    profile.runtime.skills[0].source.digest = digest;
    rejects(profile, `invalid digest ${digest}`);
  }
  const pinnedPrerelease = clone(draft);
  pinnedPrerelease.runtime.skills[0].source.version = "1.4.2-rc.1+reviewed";
  accepts(pinnedPrerelease);
});

test("capability metadata always requires a current grant and carries no inline credentials", () => {
  for (const mode of ["allowed", "inherited", "none", "grant_present"]) {
    const profile = clone(draft);
    profile.runtime.capabilities[0].authorization.mode = mode;
    rejects(profile, `metadata cannot grant authority with mode ${mode}`);
  }
  for (const field of ["grant", "grant_ref", "token", "api_key"]) {
    const profile = clone(draft);
    profile.runtime.capabilities[0].authorization[field] = "secret-or-grant";
    rejects(profile, `${field} cannot be embedded in capability authorization`);
  }
  for (const field of ["token", "api_key", "credentials", "shell", "module", "eval"]) {
    const profile = clone(draft);
    profile.runtime.capabilities[0].binding[field] = "untrusted content";
    rejects(profile, `${field} cannot be embedded in provider binding`);
  }
  const functionBinding = clone(draft);
  functionBinding.runtime.capabilities[0].binding = { protocol: "function", handler: "yawn.research.search@1" };
  accepts(functionBinding);
  functionBinding.runtime.capabilities[0].binding.handler = "./search.mjs";
  rejects(functionBinding, "function binding must use registered semantics");
});

test("privacy cannot silently widen model context, egress or secret storage", () => {
  for (const [section, field, value] of [["model_context", "mode", "all"], ["egress", "default", "allow"], ["secrets", "inline", "allowed"]]) {
    const profile = clone(shop);
    profile.runtime.privacy[section][field] = value;
    rejects(profile, `unsafe privacy ${section}`);
    const missing = clone(shop);
    delete missing.runtime.privacy[section];
    rejects(missing, `incomplete declared privacy ${section}`);
  }
});

test("core surfaces reject executable fields and unrecognized governance", () => {
  const paths = [
    [], ["runtime"], ["runtime", "rules", 0], ["runtime", "rules", 0, "scope"],
    ["runtime", "rules", 0, "enforcement"], ["runtime", "execution"], ["provenance"],
  ];
  for (const path of paths) {
    for (const field of ["shell", "module", "eval"]) {
      const profile = clone(shop);
      const object = path.reduce((value, key) => value[key], profile);
      object[field] = "arbitrary executable content";
      rejects(profile, `${path.join("/")}/${field} is not core configuration`);
    }
  }
  const lateral = clone(scheduling);
  lateral.lateral_relations[0].governs = true;
  rejects(lateral, "lateral evidence cannot declare governance");
  lateral.lateral_relations[0] = { type: "governs", target_id: "yawn:shop" };
  rejects(lateral, "a lateral type cannot import governing configuration");
});

test("source references preserve provenance and extensions remain explicitly namespaced data", () => {
  for (const refs of [[], [""], ["   "], ["source:one", "source:one"], ["source:contains space"]]) {
    const profile = minimal();
    profile.provenance.source_refs = refs;
    rejects(profile, `invalid source references ${JSON.stringify(refs)}`);
  }
  const profile = minimal();
  profile.extensions = { arbitrary: { enabled: true } };
  rejects(profile, "unnamespaced extension could masquerade as core semantics");
  profile.extensions = { "org.example.audit": { shell: "retained text only", reviewed: false } };
  accepts(profile);
});
