import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";
import { assertPublicProjectionSemantics } from "../lib/public-projection-v1.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const schema = JSON.parse(
  await readFile(join(root, "schemas", "public-projection.v1.schema.json"), "utf8"),
);
const fixture = JSON.parse(
  await readFile(join(root, "fixtures", "public-projection.v1.json"), "utf8"),
);
const ajv = new Ajv2020({ allErrors: true, strict: true, validateFormats: false });
const validate = ajv.compile(schema);

if (!validate(fixture)) {
  throw new Error(`Public projection fixture failed schema validation: ${ajv.errorsText(validate.errors)}`);
}

assertPublicProjectionSemantics(fixture);
console.log("Validated the YAWN Public Projection V1 schema, fixture, graph, and snapshot hash.");
