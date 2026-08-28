import { readFile } from "node:fs/promises";
import { dirname, isAbsolute, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";
import {
  validateInteractionOperatorReceiptSemantics,
} from "../lib/interaction-operator-receipt-v0.1.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const requestedPath = process.argv[2]
  ?? "fixtures/interaction-operator-receipt.v0.1.json";
const receiptPath = isAbsolute(requestedPath)
  ? requestedPath
  : resolve(process.cwd(), requestedPath);
const readJson = async (path) => JSON.parse(await readFile(path, "utf8"));
const utcDateTime = /^([0-9]{4})-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])T([01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9](?:\.[0-9]{1,3})?Z$/;
const validDateTime = (value) => {
  const match = typeof value === "string" ? utcDateTime.exec(value) : null;
  if (match === null || !Number.isFinite(Date.parse(value))) return false;
  return Number(match[3])
    <= new Date(Date.UTC(Number(match[1]), Number(match[2]), 0)).getUTCDate();
};
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const ajv = new Ajv2020({
  allErrors: true,
  strict: true,
  formats: { "date-time": validDateTime, uuid },
});
const validate = ajv.compile(
  await readJson(join(root, "schemas/interaction-operator-receipt.v0.1.schema.json")),
);
const receipt = await readJson(receiptPath);

if (!validate(receipt)) {
  console.error(ajv.errorsText(validate.errors, { separator: "\n" }));
  process.exitCode = 1;
} else {
  const semanticErrors = validateInteractionOperatorReceiptSemantics(receipt);
  if (semanticErrors.length > 0) {
    console.error(semanticErrors.join("\n"));
    process.exitCode = 1;
  } else {
    console.log(
      `Locally validated Interaction Operator Receipt V0.1: ${receipt.receiptId}; `
        + "application still requires authenticated cross-record and current-state resolution.",
    );
  }
}
