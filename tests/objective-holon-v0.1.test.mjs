import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import Ajv2020 from "ajv/dist/2020.js";
import {
  validateObjectiveHolonBindingConformance,
  validateObjectiveHolonSemantics,
} from "../lib/objective-holon-v0.1.mjs";

const readJson = async (path) => JSON.parse(await readFile(new URL(path, import.meta.url), "utf8"));
const schema = await readJson("../schemas/objective-holon.v0.1.schema.json");
const canonicalFixture = await readJson("../fixtures/dave-good-dad-objective-holon.v0.1.json");
const humanExample = await readFile(
  new URL("../examples/dave-good-dad-objective-holon.yawn", import.meta.url),
  "utf8",
);
const objectiveSpec = await readFile(
  new URL("../spec/objective-holons.md", import.meta.url),
  "utf8",
);
const objectiveCompiler = await readFile(
  new URL("../interface/objective-compiler.yawn", import.meta.url),
  "utf8",
);
const lifecycleRfc = await readFile(
  new URL("../rfcs/0005-optional-objective-promotion-and-bot-binding.md", import.meta.url),
  "utf8",
);
const clone = (value) => structuredClone(value);
const ajv = new Ajv2020({ allErrors: true, strict: true, validateFormats: false });
const validate = ajv.compile(schema);
const errors = () => ajv.errorsText(validate.errors, { separator: "\n" });

const removeObjectiveBot = (document) => {
  document.yawnBots = document.yawnBots.filter(
    (bot) => bot.botId !== "bot:dave:good-dad",
  );
  document.botBindingReceipts = document.botBindingReceipts.filter(
    (receipt) => receipt.botRef !== "bot:dave:good-dad",
  );
  document.activationReceipts = document.activationReceipts.filter(
    (receipt) => receipt.botRef !== "bot:dave:good-dad",
  );
};

test("Dave/good-dad validates as an objective holon with an activated steward", () => {
  assert.equal(validate(canonicalFixture), true, errors());
  assert.deepEqual(validateObjectiveHolonBindingConformance(canonicalFixture), []);
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
  assert.match(validateObjectiveHolonSemantics(invalid).join("\n"), /requires exactly one matching accepted ratification receipt/);
});

test("candidate structural refs remain opaque proposals until materialization and binding", () => {
  const proposalOnly = clone(canonicalFixture);
  proposalOnly.objectiveCandidates[0].proposedYawnRef = "yawn:future:good-dad";
  proposalOnly.objectiveCandidates[0].proposedBotRef = "bot:future:good-dad";
  proposalOnly.ratificationReceipts[0].yawnRef = "yawn:future:good-dad";
  proposalOnly.ratificationReceipts[0].botRef = "bot:future:good-dad";
  removeObjectiveBot(proposalOnly);

  assert.equal(validate(proposalOnly), true, errors());
  assert.deepEqual(validateObjectiveHolonBindingConformance(proposalOnly), []);
});

test("ratification and objective cardinality is closed in v0.1", () => {
  const duplicateDecision = clone(canonicalFixture);
  duplicateDecision.ratificationReceipts.push({
    ...clone(duplicateDecision.ratificationReceipts[0]),
    ratificationReceiptId: "ratification:dave:good-dad:duplicate",
  });
  assert.match(
    validateObjectiveHolonSemantics(duplicateDecision).join("\n"),
    /at most one ratification receipt/,
  );

  const missingAccepted = clone(canonicalFixture);
  missingAccepted.ratificationReceipts[0].decision = "held";
  missingAccepted.ratificationReceipts[0].objectiveRef = null;
  missingAccepted.ratificationReceipts[0].yawnRef = null;
  missingAccepted.ratificationReceipts[0].botRef = null;
  assert.match(
    validateObjectiveHolonSemantics(missingAccepted).join("\n"),
    /requires exactly one matching accepted ratification receipt/,
  );

  const manyObjectives = clone(canonicalFixture);
  manyObjectives.objectives.push({
    ...clone(manyObjectives.objectives[0]),
    objectiveId: "objective:dave:good-dad:duplicate",
  });
  assert.match(
    validateObjectiveHolonSemantics(manyObjectives).join("\n"),
    /cannot derive more than one objective/,
  );

  const mismatchedReceipt = clone(canonicalFixture);
  mismatchedReceipt.objectives[0].ratifiedAt = "2026-08-25T20:01:01Z";
  assert.match(
    validateObjectiveHolonSemantics(mismatchedReceipt).join("\n"),
    /requires exactly one matching accepted ratification receipt|ratifiedAt must match receipt/,
  );

  const candidateAfterReceipt = clone(canonicalFixture);
  candidateAfterReceipt.objectiveCandidates[0].producedBy.producedAt =
    "2026-08-25T20:01:01Z";
  assert.match(
    validateObjectiveHolonSemantics(candidateAfterReceipt).join("\n"),
    /candidate must not be produced after ratification/,
  );
});

test("an objective can be ratified without creating a Yawn or binding a bot", () => {
  const objectiveOnly = clone(canonicalFixture);
  objectiveOnly.objectiveCandidates[0].proposedYawnRef = null;
  objectiveOnly.objectiveCandidates[0].proposedBotRef = null;
  objectiveOnly.ratificationReceipts[0].yawnRef = null;
  objectiveOnly.ratificationReceipts[0].botRef = null;
  removeObjectiveBot(objectiveOnly);

  assert.equal(validate(objectiveOnly), true, errors());
  assert.deepEqual(validateObjectiveHolonSemantics(objectiveOnly), []);
  assert.equal(objectiveOnly.objectives[0].status, "ratified");
  assert.equal(objectiveOnly.yawnBots.length, 1);
});

test("an objective may propose or cross-link a Yawn without proposing a bot", () => {
  const yawnWithoutBot = clone(canonicalFixture);
  yawnWithoutBot.objectiveCandidates[0].proposedBotRef = null;
  yawnWithoutBot.ratificationReceipts[0].yawnRef = "yawn:dave:good-dad";
  yawnWithoutBot.ratificationReceipts[0].botRef = null;
  removeObjectiveBot(yawnWithoutBot);

  assert.equal(validate(yawnWithoutBot), true, errors());
  assert.deepEqual(validateObjectiveHolonSemantics(yawnWithoutBot), []);
  assert.equal(
    yawnWithoutBot.ratificationReceipts[0].yawnRef,
    "yawn:dave:good-dad",
  );
});

test("a bot proposal or ratification cross-link requires a Yawn", () => {
  const candidateBotWithoutYawn = clone(canonicalFixture);
  candidateBotWithoutYawn.objectiveCandidates[0].proposedYawnRef = null;
  assert.equal(validate(candidateBotWithoutYawn), false);

  const receiptBotWithoutYawn = clone(canonicalFixture);
  receiptBotWithoutYawn.ratificationReceipts[0].yawnRef = null;
  receiptBotWithoutYawn.ratificationReceipts[0].botRef = "bot:future:good-dad";
  assert.equal(validate(receiptBotWithoutYawn), false);
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

test("objective bot binding requires its own sleeping-state receipt", () => {
  const missing = clone(canonicalFixture);
  delete missing.botBindingReceipts;
  for (const bot of missing.yawnBots) delete bot.bindingReceiptRefs;
  assert.equal(validate(missing), true, errors());
  assert.deepEqual(validateObjectiveHolonSemantics(missing), []);
  assert.match(
    validateObjectiveHolonBindingConformance(missing).join("\n"),
    /missing matching bot binding receipt/,
  );

  const wrongYawn = clone(canonicalFixture);
  wrongYawn.botBindingReceipts[0].yawnRef = "yawn:dave:wrong";
  assert.match(
    validateObjectiveHolonBindingConformance(wrongYawn).join("\n"),
    /Yawn must match bot binding/,
  );

  const ratificationIsNotBinding = clone(canonicalFixture);
  ratificationIsNotBinding.yawnBots[1].bindingReceiptRefs = [
    ratificationIsNotBinding.ratificationReceipts[0].ratificationReceiptId,
  ];
  assert.match(
    validateObjectiveHolonBindingConformance(ratificationIsNotBinding).join("\n"),
    /bindingReceiptRefs\[0\]: unresolved|missing matching bot binding receipt/,
  );

  const missingRatificationBacklink = clone(canonicalFixture);
  missingRatificationBacklink.yawnBots[1].ratificationReceiptRefs = [];
  assert.match(
    validateObjectiveHolonBindingConformance(missingRatificationBacklink).join("\n"),
    /requires exactly the binding's ratification receipt ref/,
  );

  const mismatchedRatification = clone(canonicalFixture);
  mismatchedRatification.botBindingReceipts[0].ratificationReceiptRef =
    "ratification:dave:good-dad";
  mismatchedRatification.ratificationReceipts[0].objectiveRef = "objective:other";
  assert.match(
    validateObjectiveHolonBindingConformance(mismatchedRatification).join("\n"),
    /ratification must accept the same objective and principal/,
  );

  const authorityProducing = clone(canonicalFixture);
  authorityProducing.botBindingReceipts[0].effects.botActivated = true;
  assert.equal(validate(authorityProducing), false);
  assert.match(
    validateObjectiveHolonBindingConformance(authorityProducing).join("\n"),
    /botActivated must be false/,
  );
});

test("an objective ratified without structural refs may be promoted and bound later", () => {
  const laterPromotion = clone(canonicalFixture);
  laterPromotion.objectiveCandidates[0].proposedYawnRef = null;
  laterPromotion.objectiveCandidates[0].proposedBotRef = null;
  laterPromotion.ratificationReceipts[0].yawnRef = null;
  laterPromotion.ratificationReceipts[0].botRef = null;

  assert.equal(validate(laterPromotion), true, errors());
  assert.deepEqual(validateObjectiveHolonBindingConformance(laterPromotion), []);
  assert.equal(
    laterPromotion.botBindingReceipts[0].structuralChangeReceiptRef,
    "structural-change:dave:good-dad:create-yawn",
  );
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

test("strict binding and activation receipts are one-to-one, reverse-linked, and ordered", () => {
  const duplicateBinding = clone(canonicalFixture);
  duplicateBinding.botBindingReceipts.push({
    ...clone(duplicateBinding.botBindingReceipts[0]),
    botBindingReceiptId: "bot-binding:dave:good-dad:duplicate",
  });
  duplicateBinding.yawnBots[1].bindingReceiptRefs.push(
    "bot-binding:dave:good-dad:duplicate",
  );
  assert.match(
    validateObjectiveHolonBindingConformance(duplicateBinding).join("\n"),
    /requires exactly one matching bot binding receipt/,
  );

  const duplicateActivation = clone(canonicalFixture);
  duplicateActivation.activationReceipts.push({
    ...clone(duplicateActivation.activationReceipts[1]),
    activationReceiptId: "activation:dave:good-dad:duplicate",
  });
  duplicateActivation.yawnBots[1].activationReceiptRefs.push(
    "activation:dave:good-dad:duplicate",
  );
  assert.match(
    validateObjectiveHolonBindingConformance(duplicateActivation).join("\n"),
    /permits at most one activation receipt/,
  );

  const orphanActivation = clone(canonicalFixture);
  orphanActivation.activationReceipts.push({
    ...clone(orphanActivation.activationReceipts[1]),
    activationReceiptId: "activation:dave:good-dad:orphan",
  });
  assert.match(
    validateObjectiveHolonBindingConformance(orphanActivation).join("\n"),
    /bot must reverse-reference activation receipt/,
  );

  const crossBotReference = clone(canonicalFixture);
  crossBotReference.yawnBots[1].activationReceiptRefs = ["activation:dave:root"];
  assert.match(
    validateObjectiveHolonBindingConformance(crossBotReference).join("\n"),
    /activation receipt ref must match bot, Yawn, objective, and principal/,
  );

  const bindingBeforeRatification = clone(canonicalFixture);
  bindingBeforeRatification.botBindingReceipts[0].recordedAt = "2026-08-25T20:00:59Z";
  bindingBeforeRatification.yawnBots[1].producedBy.producedAt = "2026-08-25T20:00:59Z";
  assert.match(
    validateObjectiveHolonBindingConformance(bindingBeforeRatification).join("\n"),
    /ratification must not occur after binding/,
  );

  const activationBeforeBinding = clone(canonicalFixture);
  activationBeforeBinding.activationReceipts[1].recordedAt = "2026-08-25T20:01:29Z";
  assert.match(
    validateObjectiveHolonBindingConformance(activationBeforeBinding).join("\n"),
    /binding must not occur after activation/,
  );

  const proposalTimeMasqueradingAsBinding = clone(canonicalFixture);
  proposalTimeMasqueradingAsBinding.yawnBots[1].producedBy.producedAt =
    proposalTimeMasqueradingAsBinding.ratificationReceipts[0].recordedAt;
  assert.match(
    validateObjectiveHolonBindingConformance(proposalTimeMasqueradingAsBinding).join("\n"),
    /bound bot producedAt must not precede binding recordedAt/,
  );
});

test("root and objective bots cannot cross-reference another bot's receipts", () => {
  const rootClaimsChildBinding = clone(canonicalFixture);
  rootClaimsChildBinding.yawnBots[0].bindingReceiptRefs = ["bot-binding:dave:good-dad"];
  assert.match(
    validateObjectiveHolonBindingConformance(rootClaimsChildBinding).join("\n"),
    /binding receipt ref must match bot, Yawn, objective, and principal|root steward cannot carry/,
  );

  const rootClaimsObjectiveRatification = clone(canonicalFixture);
  rootClaimsObjectiveRatification.yawnBots[0].ratificationReceiptRefs = [
    "ratification:dave:good-dad",
  ];
  assert.match(
    validateObjectiveHolonBindingConformance(rootClaimsObjectiveRatification).join("\n"),
    /ratification receipt ref must accept the same objective and principal|root steward cannot carry/,
  );
});

test("corrected ratification is non-ratifying and requires an explicit correction", () => {
  const structuralCorrection = clone(canonicalFixture);
  structuralCorrection.ratificationReceipts[0].decision = "corrected";
  structuralCorrection.ratificationReceipts[0].corrections = ["correction:new-candidate"];
  assert.equal(validate(structuralCorrection), false);
  assert.match(
    validateObjectiveHolonSemantics(structuralCorrection).join("\n"),
    /corrected decision cannot ratify or name structural refs/,
  );

  const missingCorrection = clone(canonicalFixture);
  missingCorrection.ratificationReceipts[0].decision = "corrected";
  missingCorrection.ratificationReceipts[0].objectiveRef = null;
  missingCorrection.ratificationReceipts[0].yawnRef = null;
  missingCorrection.ratificationReceipts[0].botRef = null;
  assert.equal(validate(missingCorrection), false);
  assert.match(
    validateObjectiveHolonSemantics(missingCorrection).join("\n"),
    /corrected decision requires corrections/,
  );

  const acceptedWithCorrection = clone(canonicalFixture);
  acceptedWithCorrection.ratificationReceipts[0].corrections = ["correction:hidden"];
  assert.equal(validate(acceptedWithCorrection), false);
  assert.match(
    validateObjectiveHolonSemantics(acceptedWithCorrection).join("\n"),
    /only corrected decision may carry corrections/,
  );
});

test("strict corrected decisions resolve a distinct same-principal later candidate", () => {
  const corrected = clone(canonicalFixture);
  const replacement = {
    ...clone(corrected.objectiveCandidates[0]),
    objectiveCandidateId: "objective-candidate:dave:good-dad:corrected",
    statement: "Be a present and repair-capable dad.",
    producedBy: {
      ...clone(corrected.objectiveCandidates[0].producedBy),
      producedAt: "2026-08-25T20:01:01Z",
    },
  };
  corrected.objectiveCandidates.push(replacement);
  corrected.ratificationReceipts[0].decision = "corrected";
  corrected.ratificationReceipts[0].objectiveRef = null;
  corrected.ratificationReceipts[0].yawnRef = null;
  corrected.ratificationReceipts[0].botRef = null;
  corrected.ratificationReceipts[0].correctedCandidateRef = replacement.objectiveCandidateId;
  corrected.ratificationReceipts[0].corrections = [replacement.objectiveCandidateId];
  corrected.objectives = [];
  removeObjectiveBot(corrected);

  assert.equal(validate(corrected), true, errors());
  assert.deepEqual(validateObjectiveHolonBindingConformance(corrected), []);

  const sameCandidate = clone(corrected);
  sameCandidate.ratificationReceipts[0].correctedCandidateRef =
    sameCandidate.ratificationReceipts[0].objectiveCandidateRef;
  sameCandidate.ratificationReceipts[0].corrections = [
    sameCandidate.ratificationReceipts[0].objectiveCandidateRef,
  ];
  assert.match(
    validateObjectiveHolonBindingConformance(sameCandidate).join("\n"),
    /corrected candidate must be distinct/,
  );

  const missingTypedRef = clone(corrected);
  delete missingTypedRef.ratificationReceipts[0].correctedCandidateRef;
  assert.equal(validate(missingTypedRef), true, errors());
  assert.match(
    validateObjectiveHolonBindingConformance(missingTypedRef).join("\n"),
    /strict profile requires correctedCandidateRef/,
  );
});

test("a retired bot may retain one activation receipt as history, not current authority", () => {
  const retired = clone(canonicalFixture);
  retired.objectives[0].status = "retired";
  retired.yawnBots[1].lifecycleState = "retired";
  assert.equal(validate(retired), true, errors());
  assert.deepEqual(validateObjectiveHolonBindingConformance(retired), []);
  assert.equal(retired.yawnBots[1].activationReceiptRefs.length, 1);
});

test("root cardinality, parent chronology, and objective/bot state matrix are closed", () => {
  const secondRoot = clone(canonicalFixture);
  secondRoot.yawnBots[1].role = "root_steward";
  assert.match(
    validateObjectiveHolonSemantics(secondRoot).join("\n"),
    /exactly one root_steward/,
  );

  const rootCarriesObjective = clone(canonicalFixture);
  rootCarriesObjective.yawnBots[0].objectiveRef = "objective:dave:good-dad";
  assert.match(
    validateObjectiveHolonSemantics(rootCarriesObjective).join("\n"),
    /root bot cannot hold an objective/,
  );

  const parentAfterChild = clone(canonicalFixture);
  parentAfterChild.yawnBots[0].producedBy.producedAt = "2026-08-25T20:01:31Z";
  assert.match(
    validateObjectiveHolonBindingConformance(parentAfterChild).join("\n"),
    /parent must not be produced after child|parent bot must not be produced after child binding/,
  );

  const activeAgainstPausedObjective = clone(canonicalFixture);
  activeAgainstPausedObjective.objectives[0].status = "paused";
  assert.match(
    validateObjectiveHolonBindingConformance(activeAgainstPausedObjective).join("\n"),
    /lifecycle state active is incompatible with objective status paused/,
  );
});

test("bot parentage is acyclic and the root stays the root steward", () => {
  const detached = clone(canonicalFixture);
  detached.yawnBots[1].parentBotRef = null;
  assert.equal(validate(detached), false);
  assert.match(
    validateObjectiveHolonSemantics(detached).join("\n"),
    /non-root bot requires a parent|non-root bot must connect to the configured root/,
  );

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

test("the human example exposes each distinct lifecycle receipt and its resolution boundary", () => {
  const ratification = canonicalFixture.ratificationReceipts.find(
    (receipt) => receipt.objectiveRef === "objective:dave:good-dad",
  );
  const activation = canonicalFixture.activationReceipts.find(
    (receipt) => receipt.botRef === "bot:dave:good-dad",
  );
  const binding = canonicalFixture.botBindingReceipts.find(
    (receipt) => receipt.botRef === "bot:dave:good-dad",
  );
  assert.ok(ratification);
  assert.ok(binding);
  assert.ok(activation);

  assert.match(humanExample, /executable_fixture_ref: fixtures\/dave-good-dad-objective-holon\.v0\.1\.json/);
  assert.match(humanExample, new RegExp(`ratification_receipt_ref: ${ratification.ratificationReceiptId}`));
  assert.match(humanExample, new RegExp(`activation_receipt_ref: ${activation.activationReceiptId}`));
  assert.match(humanExample, new RegExp(`bot_binding_receipt_ref: ${binding.botBindingReceiptId}`));
  assert.match(humanExample, new RegExp(`- ${ratification.ratificationReceiptId}`));
  assert.match(humanExample, new RegExp(`- ${binding.botBindingReceiptId}`));
  assert.match(humanExample, new RegExp(`- ${activation.activationReceiptId}`));
  assert.match(
    humanExample,
    /receipt_schema_ref: schemas\/agency-holarchy\.v0\.2\.schema\.json#\/\$defs\/StructuralChangeReceipt/,
  );
  assert.match(humanExample, /operation: create_yawn/);
  assert.match(
    humanExample,
    new RegExp(`structural_change_receipt_ref: ${binding.structuralChangeReceiptRef}`),
  );
  assert.match(humanExample, /aggregate_resolution_status: unavailable-in-objective-holon-v0\.1/);
  assert.match(humanExample, /projection_status: informative-unresolved-until-aggregate-resolution/);
  assert.match(humanExample, /from_binding_state: proposed\s+to_binding_state: sleeping/);
  assert.match(humanExample, /from_state: sleeping\s+to_state: active/);
  assert.match(humanExample, /ratification does not create, bind, activate, grant authority/);
  assert.match(humanExample, /does not ratify the objective, create the Yawn, activate the bot/);
  assert.match(humanExample, /Activation does not\s+itself authorize an external effect/);

  const sleepingProposal = humanExample.indexOf("bot_state: sleeping");
  const ratificationReceipt = humanExample.indexOf("ratification_receipt:");
  const structuralReceipt = humanExample.indexOf("yawn_materialization:");
  const bindingReceipt = humanExample.indexOf("bot_binding_receipt:");
  const activationReceipt = humanExample.indexOf("activation_receipt:");
  const activeBinding = humanExample.indexOf("lifecycle_state: active");
  assert.ok(sleepingProposal < ratificationReceipt);
  assert.ok(ratificationReceipt < structuralReceipt);
  assert.ok(structuralReceipt < bindingReceipt);
  assert.ok(bindingReceipt < activationReceipt);
  assert.ok(activationReceipt < activeBinding);
});

test("specification, compiler, and lifecycle RFC cannot collapse review into materialization", () => {
  for (const surface of [objectiveSpec, objectiveCompiler, lifecycleRfc]) {
    assert.match(surface, /RatificationReceipt/);
    assert.match(surface, /StructuralChangeReceipt/);
    assert.match(surface, /BotBindingReceipt/);
    assert.match(surface, /ActivationReceipt/);
  }
  assert.match(objectiveSpec, /Interaction Operator Receipt cannot satisfy any of those lifecycle receipts/);
  assert.match(objectiveCompiler, /interaction confirmation is not objective ratification/);
  assert.match(lifecycleRfc, /Document-local validation cannot prove/);
  assert.match(lifecycleRfc, /Local validation\s+cannot activate a bot or establish authority/);
});
