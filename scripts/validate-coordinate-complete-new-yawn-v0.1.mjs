import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const mustExist = [
  "interface/new-yawn-coordinate-resolution-v0.1.yawn",
  "migrations/2026-09-01-coordinate-complete-new-yawn.yawn",
  "schemas/orientation-map.v0.1.schema.json",
  "question-packets/orientation-nine.yawn",
  "core/inquiry-selection.yawn",
  "core/move-selection.yawn",
  "schemas/move-selection-receipt.v0.1.schema.json",
];

for (const relative of mustExist) {
  if (!fs.existsSync(path.join(root, relative))) throw new Error(`missing ${relative}`);
}

const contract = fs.readFileSync(path.join(root, "interface/new-yawn-coordinate-resolution-v0.1.yawn"), "utf8");
for (const required of [
  "resolution_ladder",
  "auto_lacuna",
  "auto_cohere",
  "confidence -> authority",
  "choice -> authorization",
  "provider -> Agent identity",
]) {
  if (!contract.includes(required)) throw new Error(`contract missing ${required}`);
}

const schema = JSON.parse(fs.readFileSync(path.join(root, "schemas/move-selection-receipt.v0.1.schema.json"), "utf8"));
if (schema.properties?.canonicalState?.const !== false) throw new Error("move-selection receipt must remain noncanonical");
if (!schema.description?.includes("not a choice or authorization")) throw new Error("receipt boundary missing");

console.log("coordinate-complete New Yawn contracts: valid");
