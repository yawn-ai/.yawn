import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";
import {
  normalizeOrientationMap,
  orientationMapSemanticSha256,
  rankNextOrientationQuestions,
} from "../lib/orientation-map-v0.1.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const readJson = async (relativePath) => JSON.parse(await readFile(join(root, relativePath), "utf8"));
const rfc3339 = /^([0-9]{4})-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])T([01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9](?:\.[0-9]+)?(?:Z|[+-]([01][0-9]|2[0-3]):[0-5][0-9])$/;
const validDateTime = (value) => {
  const match = typeof value === "string" ? rfc3339.exec(value) : null;
  if (match === null || !Number.isFinite(Date.parse(value))) return false;
  return Number(match[3]) <= new Date(Date.UTC(Number(match[1]), Number(match[2]), 0)).getUTCDate();
};

const ajv = new Ajv2020({
  allErrors: true,
  strict: true,
  formats: { "date-time": validDateTime },
});
ajv.addSchema(await readJson("schemas/record-ref.v1.schema.json"));
const validate = ajv.compile(await readJson("schemas/orientation-map.v0.1.schema.json"));
const fixture = await readJson("fixtures/orientation-map.v0.1.json");

assert.equal(validate(fixture), true, ajv.errorsText(validate.errors));
const normalized = normalizeOrientationMap(fixture);
const ranked = rankNextOrientationQuestions(normalized);
assert.match(orientationMapSemanticSha256(normalized), /^[a-f0-9]{64}$/);
assert.ok(ranked.candidates.length > 0 && ranked.candidates.length <= 3);
assert.ok(ranked.candidates.every((candidate) => candidate.proposalStatus === "proposed" && candidate.notAuthority));

console.log(`Validated Orientation Map V0.1 and ranked ${ranked.candidates.length} proposed questions.`);
