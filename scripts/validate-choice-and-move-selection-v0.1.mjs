import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";
import {
  createChoiceEvent,
  selectMoveProposal,
} from "../lib/choice-and-move-selection-v0.1.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const readJson = async (...parts) => JSON.parse(await readFile(join(root, ...parts), "utf8"));

const ajv = new Ajv2020({ allErrors: true, strict: true, validateFormats: false });
const recordRefSchema = await readJson("schemas", "record-ref.v1.schema.json");
ajv.addSchema(recordRefSchema);

const moveSelectionSchema = await readJson("schemas", "move-selection-receipt.v0.1.schema.json");
const choiceEventSchema = await readJson("schemas", "choice-event.v0.1.schema.json");
const validateMoveSelection = ajv.compile(moveSelectionSchema);
const validateChoiceEvent = ajv.compile(choiceEventSchema);
const fixture = await readJson("fixtures", "choice-and-move-selection.v0.1.json");

assertValid(validateMoveSelection, fixture.moveSelectionReceipt, "move-selection fixture");
assertValid(validateChoiceEvent, fixture.choiceEvent, "choice-event fixture");

const generatedMoveSelection = selectMoveProposal({
  receiptId: fixture.moveSelectionReceipt.receiptId,
  revision: fixture.moveSelectionReceipt.revision,
  orientationMapRef: fixture.moveSelectionReceipt.orientationMapRef,
  principalRef: fixture.moveSelectionReceipt.principalRef,
  relationshipRef: fixture.moveSelectionReceipt.relationshipRef,
  arenaRef: fixture.moveSelectionReceipt.arenaRef,
  sourceRefs: fixture.moveSelectionReceipt.sourceRefs,
  gateAssessments: fixture.moveSelectionReceipt.gateAssessments,
  candidates: fixture.moveSelectionReceipt.candidates,
  createdAt: fixture.moveSelectionReceipt.createdAt,
});
assertValid(validateMoveSelection, generatedMoveSelection, "generated move-selection receipt");

if (generatedMoveSelection.outcome.kind !== "proposal") {
  throw new Error("Expected the fixture compiler to produce a move proposal.");
}
if (generatedMoveSelection.outcome.selectedCandidateId !== "move-candidate:confirm-parent-purpose") {
  throw new Error("The reversible clarification candidate did not rank first.");
}
if (!generatedMoveSelection.choiceRequired || !generatedMoveSelection.authorizationRequired) {
  throw new Error("Move selection illegally collapsed recommendation into choice or authorization.");
}

const generatedChoiceEvent = createChoiceEvent({
  choiceEventId: fixture.choiceEvent.choiceEventId,
  revision: fixture.choiceEvent.revision,
  principalRef: fixture.choiceEvent.principalRef,
  moveSelectionReceipt: generatedMoveSelection,
  decision: fixture.choiceEvent.decision,
  sourceRefs: fixture.choiceEvent.sourceRefs,
  canonicalState: false,
  createdAt: fixture.choiceEvent.createdAt,
});
assertValid(validateChoiceEvent, generatedChoiceEvent, "generated choice event");

if (generatedChoiceEvent.authorization.grantedByThisEvent || generatedChoiceEvent.authorization.effectAuthorized) {
  throw new Error("Choice event illegally granted effect authority.");
}

console.log("Validated YAWN move-selection and rightful-choice working-draft contracts.");

function assertValid(validate, value, label) {
  if (!validate(value)) {
    throw new Error(`${label} failed validation: ${ajv.errorsText(validate.errors)}`);
  }
}
