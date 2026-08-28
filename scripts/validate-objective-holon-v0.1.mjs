import { readFile } from "node:fs/promises";
import Ajv2020 from "ajv/dist/2020.js";
import { validateObjectiveHolonBindingConformance } from "../lib/objective-holon-v0.1.mjs";

const readJson = async (path) => JSON.parse(await readFile(new URL(path, import.meta.url), "utf8"));

const schema = await readJson("../schemas/objective-holon.v0.1.schema.json");
const fixture = await readJson("../fixtures/dave-good-dad-objective-holon.v0.1.json");
const ajv = new Ajv2020({ allErrors: true, strict: true, validateFormats: false });
const validate = ajv.compile(schema);

if (!validate(fixture)) {
  console.error(ajv.errorsText(validate.errors, { separator: "\n" }));
  process.exitCode = 1;
} else {
  const semanticErrors = validateObjectiveHolonBindingConformance(fixture);
  if (semanticErrors.length > 0) {
    console.error(semanticErrors.join("\n"));
    process.exitCode = 1;
  } else {
    console.log("Validated the Objective Holon Working Draft 0.1 fixture and lifecycle invariants.");
  }
}
