import { readFile } from "node:fs/promises";
import Ajv2020 from "ajv/dist/2020.js";
import { validateAgencyHolarchySemantics } from "../lib/agency-holarchy-v0.2.mjs";

const readJson = async (relativePath) =>
  JSON.parse(await readFile(new URL(relativePath, import.meta.url), "utf8"));

const schema = await readJson("../schemas/agency-holarchy.v0.2.schema.json");
const fixture = await readJson("../fixtures/agency-holarchy.v0.2.json");
const ajv = new Ajv2020({ allErrors: true, strict: true, validateFormats: false });
const validate = ajv.compile(schema);

const semanticErrors = validateAgencyHolarchySemantics(fixture);

if (!validate(fixture)) {
  console.error(ajv.errorsText(validate.errors, { separator: "\n" }));
  process.exitCode = 1;
} else if (semanticErrors.length > 0) {
  console.error(semanticErrors.join("\n"));
  process.exitCode = 1;
} else {
  console.log("Validated the canonical Agency Holarchy Working Draft 0.2 fixture and cross-record invariants.");
}
