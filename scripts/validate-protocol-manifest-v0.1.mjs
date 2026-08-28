import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";
import { validateProtocolManifestSemantics } from "../lib/protocol-manifest-v0.1.mjs";

const readJson = async (relativePath) =>
  JSON.parse(await readFile(new URL(relativePath, import.meta.url), "utf8"));

const schema = await readJson("../schemas/protocol-manifest.v0.1.schema.json");
const manifest = await readJson("../protocol-manifest.v0.1.json");
const ajv = new Ajv2020({ allErrors: true, strict: true, validateFormats: false });
const validate = ajv.compile(schema);

if (!validate(manifest)) {
  console.error(ajv.errorsText(validate.errors, { separator: "\n" }));
  process.exitCode = 1;
} else {
  const semanticErrors = await validateProtocolManifestSemantics(manifest, {
    repositoryRoot: fileURLToPath(new URL("..", import.meta.url)),
  });
  if (semanticErrors.length > 0) {
    console.error(semanticErrors.join("\n"));
    process.exitCode = 1;
  } else {
    console.log(
      `Validated ${manifest.protocolRevision}: ${manifest.modules.length} modules, ` +
        `${manifest.conformanceProfiles.length} conformance profile, and content-addressed artifacts.`,
    );
  }
}
