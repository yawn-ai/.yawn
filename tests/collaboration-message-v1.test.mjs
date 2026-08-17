import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import Ajv2020 from "ajv/dist/2020.js";
import {
  attributionErrors,
  evaluateMessageAuthority,
} from "../lib/collaboration-message-v1.mjs";

const readJson = async (path) => JSON.parse(await readFile(new URL(`../${path}`, import.meta.url), "utf8"));
const readText = async (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("the collaboration fixture validates and keeps model authority closed", async () => {
  const ajv = new Ajv2020({ allErrors: true, strict: false, formats: { "date-time": true } });
  ajv.addSchema(await readJson("schemas/record-ref.v1.schema.json"));
  const validate = ajv.compile(await readJson("schemas/collaboration-message.v1.schema.json"));
  const message = await readJson("fixtures/collaboration-message.v1.json");
  assert.equal(validate(message), true, JSON.stringify(validate.errors));
  assert.deepEqual(attributionErrors(message), []);
  assert.deepEqual(evaluateMessageAuthority(message), {
    attributable: true,
    canonicalizable: false,
    externalEffectAuthorized: false,
    blockers: ["rightful_grantor_decision_missing"],
  });
});

test("an agent cannot impersonate Dave or another model handle", async () => {
  const message = await readJson("fixtures/collaboration-message.v1.json");
  const impersonation = {
    ...message,
    sender: { actorId: "agent:openai:codex", handle: "@dave", kind: "model" },
    speechAct: "decision",
    authority: {
      rightfulGrantorActorId: "user:dave",
      grantorDecisionRecorded: true,
      canonicalMutationAuthorized: true,
      externalEffectsAuthorized: true,
    },
  };
  assert.deepEqual(attributionErrors(impersonation), ["sender_handle_mismatch"]);
  assert.equal(evaluateMessageAuthority(impersonation).canonicalizable, false);
  assert.equal(evaluateMessageAuthority(impersonation).externalEffectAuthorized, false);
});

test("the protocol binds all actors to the relationship and proof loop", async () => {
  const contract = await readText("agents/collaboration-history.yawn");
  const homebase = await readText("interface/desktop-homebase-v1.yawn");
  for (const value of ["@dave", "@codex", "@claude", "Relationship", "Observation", "Relevance", "Orientation", "Intention", "Projection", "Consequence", "Proof", "Updated Relationship"]) {
    assert.match(contract, new RegExp(value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  assert.match(homebase, /ultimate Homebase/);
  assert.match(homebase, /exposure_to_remote_content: none_by_default/);
});
