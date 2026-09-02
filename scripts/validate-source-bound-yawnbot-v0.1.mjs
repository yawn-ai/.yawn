import fs from "node:fs";
import path from "node:path";
import Ajv2020 from "ajv/dist/2020.js";
import { validateSourceBoundYawnbotSemantics } from "../lib/source-bound-yawnbot-v0.1.mjs";

const root = process.cwd();
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));

const moduleSchemaPaths = [
  "schemas/evaluation-record.v0.1.schema.json",
  "schemas/source-bound-yawnbot-cognition.v0.1.schema.json",
  "schemas/source-bound-yawnbot-passage.v0.1.schema.json",
  "schemas/source-bound-yawnbot-governance.v0.1.schema.json",
];
const aggregateSchemaPath = "schemas/source-bound-yawnbot.v0.1.schema.json";
const fixturePath = "fixtures/dave-kickstarter-nestheads.source-bound-yawnbot.v0.1.json";
const requiredArtifacts = [
  ...moduleSchemaPaths,
  aggregateSchemaPath,
  fixturePath,
  "core/source-bound-mental-model.yawn",
  "interface/source-bound-yawnbot-workbench-v0.1.yawn",
  "adr/0003-source-bound-mental-model-and-evaluation.md",
  "lib/source-bound-yawnbot-v0.1.mjs",
  "tests/source-bound-yawnbot-v0.1.test.mjs",
];

for (const relativePath of requiredArtifacts) {
  if (!fs.existsSync(path.join(root, relativePath))) throw new Error(`missing ${relativePath}`);
}

const ajv = new Ajv2020({ allErrors: true, strict: true, validateFormats: false });
for (const schemaPath of moduleSchemaPaths) ajv.addSchema(readJson(schemaPath));
const validateShape = ajv.compile(readJson(aggregateSchemaPath));
const fixture = readJson(fixturePath);

if (!validateShape(fixture)) {
  throw new Error(`source-bound Yawnbot shape invalid:\n${ajv.errorsText(validateShape.errors, { separator: "\n" })}`);
}

const semanticErrors = validateSourceBoundYawnbotSemantics(fixture);
if (semanticErrors.length > 0) {
  throw new Error(`source-bound Yawnbot semantics invalid:\n${semanticErrors.join("\n")}`);
}

if (fixture.coordinate !== "dave/kickstarter/nestheads") throw new Error("dogfood coordinate drifted");
if (fixture.consequences.length !== 0) throw new Error("unsent dogfood message cannot have Consequences");
if (fixture.proofAdjudications.length !== 0) throw new Error("unsent dogfood message cannot claim Proof");
if (fixture.updates.length !== 0) throw new Error("dogfood fixture cannot claim a canonical Update");
if (fixture.projections.some((projection) => projection.status !== "draft")) throw new Error("dogfood Projection must remain draft");
if (fixture.moves.some((move) => move.status !== "proposed")) throw new Error("dogfood Move must remain proposed");
if (fixture.sourceRecords.some((source) => source.visibility === "private" && source.exactTextAvailable)) {
  throw new Error("public conformance fixture cannot embed exact private source text");
}

const publicCandidate = fixture.audiencePolicies.find(
  (policy) => policy.audiencePolicyId === "audience-policy:kickstarter-public-candidate",
);
if (!publicCandidate || publicCandidate.visibility !== "public_candidate" || publicCandidate.publicationStatus !== "not_authorized") {
  throw new Error("public candidate must remain explicitly unauthorized");
}
if (fixture.traversalView.canonicalState !== false || fixture.boundary.defaultTraversalIsOntology !== false) {
  throw new Error("recursive passage must remain a noncanonical View");
}
if (fixture.characterViews.some((view) => view.agentRef !== null || view.canonicalState !== false)) {
  throw new Error("character representations must remain noncanonical Views, not Agents");
}

console.log("source-bound Yawnbot contracts and sanitized dogfood fixture: valid");
