import { access, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// Curated public surfaces keep this check precise. Historical records may
// intentionally point to retired or external material.
const markdownFiles = [
  "README.md",
  "CONTRIBUTING.md",
  "SECURITY.md",
  "GOVERNANCE.md",
  "ROADMAP.md",
  "SUPPORT.md",
  "docs/README.md",
  "docs/quickstart.md",
  "docs/project-status.md",
  "docs/repository-map.md",
  "docs/views/README.md",
  "docs/research-basis.md",
  "spec/README.md",
  "spec/ontology.md",
  "spec/holarchy.md",
  "spec/turns.md",
  "spec/routing.md",
  "spec/questions.md",
  "spec/serialization.md",
  "rfcs/README.md",
  "rfcs/0001-agency-holarchy-working-draft.md",
  "adr/README.md",
];

const missing = [];
const markdownLink = /\[[^\]]*\]\(([^)]+)\)/g;

for (const relativeFile of markdownFiles) {
  const absoluteFile = path.join(repositoryRoot, relativeFile);
  const body = await readFile(absoluteFile, "utf8");
  for (const match of body.matchAll(markdownLink)) {
    const rawTarget = match[1].trim().replace(/^<|>$/g, "");
    if (
      rawTarget.startsWith("http://") ||
      rawTarget.startsWith("https://") ||
      rawTarget.startsWith("mailto:") ||
      rawTarget.startsWith("#")
    ) {
      continue;
    }

    const decodedTarget = decodeURIComponent(rawTarget.split("#", 1)[0]);
    if (!decodedTarget) continue;
    const resolved = path.resolve(path.dirname(absoluteFile), decodedTarget);
    if (!resolved.startsWith(`${repositoryRoot}${path.sep}`) && resolved !== repositoryRoot) {
      missing.push(`${relativeFile}: link escapes repository: ${rawTarget}`);
      continue;
    }
    try {
      await access(resolved);
    } catch {
      missing.push(`${relativeFile}: missing ${rawTarget}`);
    }
  }
}

for (const relativeAsset of ["index.html", "404.html", "assets/site.css", "robots.txt", "sitemap.xml"]) {
  try {
    await access(path.join(repositoryRoot, relativeAsset));
  } catch {
    missing.push(`public hub: missing ${relativeAsset}`);
  }
}

if (missing.length > 0) {
  console.error(missing.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Validated local links in ${markdownFiles.length} hub documents.`);
}
