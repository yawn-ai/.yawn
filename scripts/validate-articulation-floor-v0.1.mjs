// Validate the Articulation Floor 0.1 ledger fixture (shape + semantics + floor replay) and every
// seal written into the human-readable records that carry one: the Polanyi question packet and the
// generated bot-state record. A seal that does not recompute to its hash, or a queued question with
// no seal, fails closed: no seal, no question (core/articulation-floor.yawn).
//
//   node scripts/validate-articulation-floor-v0.1.mjs [fixtures/articulation-floor.v0.1.json]
import { readFile } from "node:fs/promises";
import { dirname, isAbsolute, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";
import { extractSealsFromYawn, validateArticulationFloorSemantics, verifySealsInYawn } from "../lib/articulation-floor-v0.1.mjs";
import { canonicalJson } from "../lib/state-substrate-v1.mjs";
import { buildArticulationFloorFixture } from "./generate-articulation-floor-v0.1.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const requestedPath = process.argv[2] ?? "fixtures/articulation-floor.v0.1.json";
const ledgerPath = isAbsolute(requestedPath) ? requestedPath : resolve(process.cwd(), requestedPath);
const readJson = async (path) => JSON.parse(await readFile(path, "utf8"));
const utcDateTime = /^([0-9]{4})-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])T([01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9](?:\.[0-9]+)?Z$/;
const validDateTime = (value) => {
  const match = typeof value === "string" ? utcDateTime.exec(value) : null;
  if (match === null || !Number.isFinite(Date.parse(value))) return false;
  return Number(match[3]) <= new Date(Date.UTC(Number(match[1]), Number(match[2]), 0)).getUTCDate();
};

const ajv = new Ajv2020({ allErrors: true, strict: true, formats: { "date-time": validDateTime } });
const validate = ajv.compile(await readJson(join(root, "schemas/articulation-floor.v0.1.schema.json")));
const ledger = await readJson(ledgerPath);
const errors = [];

if (!validate(ledger)) errors.push(ajv.errorsText(validate.errors, { separator: "\n" }));
else {
  errors.push(...validateArticulationFloorSemantics(ledger));
  if (ledgerPath === join(root, "fixtures/articulation-floor.v0.1.json") && canonicalJson(buildArticulationFloorFixture()) !== canonicalJson(ledger)) {
    errors.push("fixture_does_not_replay_from_generator; run: node scripts/generate-articulation-floor-v0.1.mjs");
  }
}

// Seals carried by records. The packet must seal every axis; the bot-state record must seal every queued question.
const packetText = await readFile(join(root, "question-packets/polanyi.yawn"), "utf8");
errors.push(...verifySealsInYawn(packetText, "question-packets/polanyi.yawn"));
const packetKeys = [...packetText.matchAll(/^  - question_key:\s*(\S+)/gm)].map((m) => m[1]);
const packetSeals = extractSealsFromYawn(packetText).map(({ seal }) => seal);
for (const key of packetKeys) {
  if (!packetSeals.some((item) => item.question === `question-packets/polanyi.yawn#${key}` && item.axis === key)) errors.push(`question-packets/polanyi.yawn: axis ${key} has no seal; no seal, no question`);
}
const stateText = await readFile(join(root, "records/yawn.bot-state.yawn"), "utf8");
errors.push(...verifySealsInYawn(stateText, "records/yawn.bot-state.yawn"));
const stateSeals = extractSealsFromYawn(stateText).map(({ seal }) => seal);
const queued = [...(stateText.match(/^question_queue:\n([\s\S]*?)(?=^\S)/m)?.[1] ?? "").matchAll(/^    decision_ref:\s*(\S+)/gm)].map((m) => m[1]);
for (const ref of queued) if (!stateSeals.some((item) => item.question === ref)) errors.push(`records/yawn.bot-state.yawn: ${ref} is queued without a seal; no seal, no question`);

if (errors.length) { console.error(errors.join("\n")); process.exitCode = 1; }
else console.log(`Validated Articulation Floor V0.1: ${ledger.ledgerId} (${ledger.seals.length} seals, ${ledger.answers.length} answers, ${ledger.floors.length} floors); ${packetSeals.length} packet seals over ${packetKeys.length} axes; ${queued.length} queued decisions sealed.`);
