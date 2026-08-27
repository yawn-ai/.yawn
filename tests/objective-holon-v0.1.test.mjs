import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import Ajv2020 from "ajv/dist/2020.js";
import { validateObjectiveHolonSemantics } from "../lib/objective-holon-v0.1.mjs";

const readJson = async (path) => JSON.parse(await readFile(new URL(path, import.meta.url), "utf8"));
const schema = await readJson("../schemas/objective-holon.v0.1.schema.json");
const canonicalFixture = await readJson("../fixtures/dave-good-dad-objective-holon.v0.1.json");
const clone = (value) => structuredClone(value);
const ajv = new Ajv2020({ allErrors: true, strict: true, validateFormats: false });
const validate = ajv.compile(schema);
const errors = () => ajv.errorsText(validate.errors, { separator: "\n" });

test("Dave/good-dad validates as an objective holon with an activated steward", () => {
  assert.equal(validate(canonicalFixture), true, errors());
  assert.deepEqual(validateObjectiveHolonSemantics(canonicalFixture), []);
  const bot = canonicalFixture.yawnBots.find((item) => item.botId === "bot:dave:good-dad");
  assert.equal(bot.objectiveRef, "objective:dave:good-dad");
  assert.equal(bot.parentBotRef, "bot:dave:root");
  assert.equal(bot.personalityProfileRef, null);
});

test("reported desire and inferred objective remain distinct detections", () => {
  const detections = canonicalFixture.compileProjections[0].detections;
  const desire = detections.find((item) => item.kind === "desire");
  const objective = detections.find((item) => item.kind === "objective_candidate");
  assert.equal(desire.epistemicStatus, "reported");
  assert.equal(objective.epistemicStatus, "inferred");
  assert.equal(canonicalFixture.objectiveCandidates[0].status, "proposed");
});

test("choice architecture exposes corrections and at most three ranked structural paths", () => {
  const projection = canonicalFixture.compileProjections[0];
  assert.deepEqual(projection.correctionOperators, ["confirm", "reject", "correct", "add_more"]);
  assert.deepEqual(projection.proposedOperations.map((operation) => operation.rank), [1, 2, 3]);
  assert.equal(projection.proposedOperations[0].kind, "create_objective_holon");
  assert.equal(projection.proposedOperations.every((operation) => operation.requiresConfirmation), true);

  const tooMany = clone(canonicalFixture);
  tooMany.compileProjections[0].proposedOperations.push({
    ...clone(tooMany.compileProjections[0].proposedOperations[2]),
    operationId: "operation:dave:good-dad:fourth",
  });
  assert.equal(validate(tooMany), false);
  assert.match(errors(), /must NOT have more than 3 items/);

  const missingCorrection = clone(canonicalFixture);
  missingCorrection.compileProjections[0].correctionOperators = ["confirm", "reject", "correct", "hold"];
  assert.equal(validate(missingCorrection), false);
  assert.match(errors(), /must contain at least 1 valid item/);
});

test("operation rankings must remain ordered and traceable to visible detections", () => {
  const invalidRank = clone(canonicalFixture);
  invalidRank.compileProjections[0].proposedOperations[0].rank = 2;
  assert.match(validateObjectiveHolonSemantics(invalidRank).join("\n"), /expected 1/);

  const invalidBasis = clone(canonicalFixture);
  invalidBasis.compileProjections[0].proposedOperations[0].basisDetectionRefs = ["detection:missing"];
  assert.match(validateObjectiveHolonSemantics(invalidBasis).join("\n"), /unresolved detection:missing/);
});

test("confidence cannot substitute for an accepted ratification receipt", () => {
  const invalid = clone(canonicalFixture);
  invalid.objectiveCandidates[0].confidence = 1;
  invalid.ratificationReceipts = [];
  invalid.yawnBots[1].ratificationReceiptRefs = [];
  assert.match(validateObjectiveHolonSemantics(invalid).join("\n"), /missing accepted ratification receipt/);
});

test("objective stewards require an objective", () => {
  const invalid = clone(canonicalFixture);
  invalid.yawnBots[1].objectiveRef = null;
  assert.equal(validate(invalid), false);
  assert.match(errors(), /must be string/);
});

test("sleeping bots carry no activation receipt or effect grant", () => {
  const sleeping = clone(canonicalFixture);
  const bot = sleeping.yawnBots[1];
  bot.lifecycleState = "sleeping";
  bot.authorityGrantRefs = [];
  bot.activationReceiptRefs = [];
  sleeping.activationReceipts = sleeping.activationReceipts.filter((receipt) => receipt.botRef !== bot.botId);
  assert.equal(validate(sleeping), true, errors());
  assert.deepEqual(validateObjectiveHolonSemantics(sleeping), []);

  bot.authorityGrantRefs = ["authority:should-not-inherit"];
  assert.equal(validate(sleeping), false);
  assert.match(errors(), /must NOT have more than 0 items/);
});

test("active bots require explicit grants and matching activation receipts", () => {
  const invalidShape = clone(canonicalFixture);
  invalidShape.yawnBots[1].activationReceiptRefs = [];
  assert.equal(validate(invalidShape), false);
  assert.match(errors(), /must NOT have fewer than 1 items/);

  const invalidSemantics = clone(canonicalFixture);
  invalidSemantics.activationReceipts[1].yawnRef = "yawn:dave:wrong";
  assert.match(validateObjectiveHolonSemantics(invalidSemantics).join("\n"), /Yawn must match bot binding/);

  const invalidPrincipal = clone(canonicalFixture);
  invalidPrincipal.activationReceipts[1].principalRef = "principal:other";
  invalidPrincipal.activationReceipts[1].authorizedBy = "principal:other";
  assert.match(validateObjectiveHolonSemantics(invalidPrincipal).join("\n"), /principal must match bot binding/);

  const invalidGrant = clone(canonicalFixture);
  invalidGrant.activationReceipts[1].authorityGrantRefs = ["authority:not-on-bot"];
  assert.match(validateObjectiveHolonSemantics(invalidGrant).join("\n"), /activation grants must be present on bot binding/);
});

test("bot parentage is acyclic and the root stays the root steward", () => {
  const cyclic = clone(canonicalFixture);
  cyclic.yawnBots[0].parentBotRef = "bot:dave:good-dad";
  assert.match(validateObjectiveHolonSemantics(cyclic).join("\n"), /cycle/);

  const wrongRoot = clone(canonicalFixture);
  wrongRoot.yawnBots[0].role = "objective_steward";
  wrongRoot.yawnBots[0].objectiveRef = "objective:dave:good-dad";
  assert.match(validateObjectiveHolonSemantics(wrongRoot).join("\n"), /root bot must have role root_steward/);
});

test("inherited context excludes every non-inheritable semantic and authority dimension", () => {
  const exclusions = new Set(canonicalFixture.yawnBots[1].contextInheritance.exclusions);
  for (const item of ["truth", "identity", "agreement", "consent", "privacy", "confidence", "effect_authority", "proof"]) {
    assert.equal(exclusions.has(item), true);
  }
});
