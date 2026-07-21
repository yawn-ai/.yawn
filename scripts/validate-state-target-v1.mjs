import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const schemaNames = [
  "statuses",
  "event",
  "state-snapshot",
  "desire",
  "target-condition",
  "transition-intent",
  "transition-result",
  "materialized-state",
  "state-update",
  "living-snapshot",
];
const fixtureKeys = [
  "statuses",
  "events",
  "stateSnapshot",
  "desire",
  "targetCondition",
  "transitionIntent",
  "transitionResult",
  "materializedState",
  "stateUpdate",
  "livingSnapshot",
];
const ajv = new Ajv2020({ allErrors: true, strict: true, validateFormats: false });
const fixtures = JSON.parse(await readFile(join(root, "fixtures", "canonical-contracts.v1.json"), "utf8"));

for (const [index, schemaName] of schemaNames.entries()) {
  const schema = JSON.parse(await readFile(join(root, "schemas", `${schemaName}.v1.schema.json`), "utf8"));
  const validate = ajv.compile(schema);
  const values = Array.isArray(fixtures[fixtureKeys[index]]) ? fixtures[fixtureKeys[index]] : [fixtures[fixtureKeys[index]]];
  for (const value of values) {
    if (!validate(value)) {
      throw new Error(`${schemaName} fixture failed validation: ${ajv.errorsText(validate.errors)}`);
    }
  }
}

console.log(`Validated ${schemaNames.length} canonical YAWN V1 contracts.`);
