import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { dirname, isAbsolute, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";
import {
  validateInquirySelectionReceiptReplay,
  validateInquirySelectionReceiptSemantics,
} from "../lib/inquiry-selection-receipt-v0.1.mjs";
import {
  inquirySelectionFixtureRankingOptions,
  inquirySelectionFixtureReceiptOptions,
} from "./generate-inquiry-selection-receipt-v0.1.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const requestedPath = process.argv[2] ?? "fixtures/inquiry-selection-receipt.v0.1.json";
const receiptPath = isAbsolute(requestedPath) ? requestedPath : resolve(process.cwd(), requestedPath);
const readJson = async (path) => JSON.parse(await readFile(path, "utf8"));
const utcDateTime = /^([0-9]{4})-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])T([01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9](?:\.[0-9]+)?Z$/;
const validDateTime = (value) => {
  const match = typeof value === "string" ? utcDateTime.exec(value) : null;
  if (match === null || !Number.isFinite(Date.parse(value))) return false;
  return Number(match[3]) <= new Date(Date.UTC(Number(match[1]), Number(match[2]), 0)).getUTCDate();
};

const ajv = new Ajv2020({
  allErrors: true,
  strict: true,
  formats: { "date-time": validDateTime },
});
ajv.addSchema(await readJson(join(root, "schemas/record-ref.v1.schema.json")));
const validate = ajv.compile(await readJson(join(root, "schemas/inquiry-selection-receipt.v0.1.schema.json")));
const receipt = await readJson(receiptPath);
let replayValidated = false;

if (!validate(receipt)) {
  console.error(ajv.errorsText(validate.errors, { separator: "\n" }));
  process.exitCode = 1;
} else {
  const semanticErrors = validateInquirySelectionReceiptSemantics(receipt);
  const promptSetBytes = await readFile(join(root, "question-packets/orientation-nine.yawn"));
  const currentPromptSetSha256 = createHash("sha256").update(promptSetBytes).digest("hex");
  if (receipt.promptSetSha256 !== currentPromptSetSha256) {
    semanticErrors.push("prompt_set_sha256_does_not_match_versioned_packet_bytes");
  }
  const defaultFixturePath = join(root, "fixtures/inquiry-selection-receipt.v0.1.json");
  if (receiptPath === defaultFixturePath) {
    const orientationMap = await readJson(join(root, "fixtures/orientation-map.v0.1.json"));
    semanticErrors.push(...validateInquirySelectionReceiptReplay(
      receipt,
      orientationMap,
      inquirySelectionFixtureRankingOptions,
      inquirySelectionFixtureReceiptOptions,
    ));
    replayValidated = true;
  }

  if (semanticErrors.length > 0) {
    console.error(semanticErrors.join("\n"));
    process.exitCode = 1;
  } else {
    console.log(replayValidated
      ? `Replay-validated Inquiry Selection Receipt V0.1: ${receipt.receiptId}`
      : `Validated Inquiry Selection Receipt V0.1 shape/internal semantics only (origin not replayed): ${receipt.receiptId}`);
  }
}
