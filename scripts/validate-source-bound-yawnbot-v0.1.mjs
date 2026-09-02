import fs from "node:fs";
import path from "node:path";
import Ajv2020 from "ajv/dist/2020.js";
import { validateSourceBoundYawnbotSemantics } from "../lib/source-bound-yawnbot-v0.1.mjs";

const root = process.cwd();
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));

const schemaPaths = [
  "schemas/evaluation-record.v0.1.schema.json",
  "schemas/source-bound-yawnbot-cognition.v0.1.schema.json",
  "schemas/source-bound-yawnbot-passage.v0.1.schema.json",
  "schemas/source-bound-yawnbot-governance.v0.1.schema.json",
];
const rootSchemaPath = "schemas/source-bound-yawnbot.v0.1.schema.json";
const fixturePath = "fixtures/dave-kickstarter-nestheads.source-bound-yawnbot.v0.1.json";

for (const relativePath of [...schemaPaths, rootSchemaPath, fixturePath, "core/source-bound-mental-model.yawn"]) {
  if (!fs.existsSync(path.join(root, relativePath))) throw new Error(`missing ${relativePath}`);
}

const ajv = new Ajv2020({ allErrors: true, strict: true, validateFormats: false });
for (const schemaPath of schemaPaths) ajv.addSchema(readJson(schemaPath));
const validateShape = ajv.compile(readJson(rootSchemaPath));
const fixture = readJson(fixturePath);

if (!validateShape(fixture)) {
  throw new Error(`source-bound Yawnbot shape invalid:\n${ajv.errorsText(validateShape.errors, { separator: "\n" })}`);
}

const semanticErrors = validateSourceBoundYawnbotSemantics(fixture);
if (semanticErrors.length > 0) {
  throw new Error(`source-bound Yawnbot semantics invalid:\n${semanticErrors.join("\n")}`);
}

if (fixture.coordinate !== "dave/kickstarter/nestheads") throw new Error("dogfood coordinate drifted");
if (fixture.consequences.length !== 0) throw new Error("unsent dogfood message cannot have consequences");
if (fixture.proofAdjudications.length !== 0) throw new Error("unsent dogfood message cannot claim proof");
if (fixture.updates.length !== 0) throw new Error("dogfood fixture cannot claim a canonical update");
if (fixture.projections.some((projection) => projection.status !== "draft")) throw new Error("dogfood projection must remain draft");
if (fixture.moves.some((move) => move.status !== "proposed")) throw new Error("dogfood move must remain proposed");
if (fixture.sourceRecords.some((source) => source.visibility === "private" && source.exactTextAvailable)) {
  throw new Error("public conformance fixture cannot embed exact private source text");
}
const publicCandidate = fixture.audiencePolicies.find((policy) => policy.audiencePolicyId === "audience-policy:kickstarter-public-candidate");
if (!publicCandidate || publicCandidate.visibility !== "public_candidate" || publicCandidate.publicationStatus !== "not_authorized") {
  throw new Error("public candidate must remain explicitly unauthorized");
}
if (fixture.traversalView.canonicalState !== false || fixture.boundary.defaultTraversalIsOntology !== false) {
  throw new Error("recursive passage must remain a noncanonical View");
}

console.log("source-bound Yawnbot contracts and sanitized dogfood fixture: valid");
