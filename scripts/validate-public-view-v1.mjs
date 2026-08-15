import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";
import { assertPublicViewSemantics } from "../lib/public-view-v1.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const schema = JSON.parse(
  await readFile(join(root, "schemas", "public-view.v1.schema.json"), "utf8"),
);
const fixture = JSON.parse(
  await readFile(join(root, "fixtures", "public-view.v1.json"), "utf8"),
);
const ajv = new Ajv2020({ allErrors: true, strict: true, validateFormats: false });
const validate = ajv.compile(schema);

if (!validate(fixture)) {
  throw new Error(`Public View fixture failed schema validation: ${ajv.errorsText(validate.errors)}`);
}

assertPublicViewSemantics(fixture);
console.log("Validated YAWN Public View V1 shape, attribution, references, redaction, and snapshot hash.");
