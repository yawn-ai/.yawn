import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { extname } from "node:path";

const requiredFiles = [
  "core/canonical-extension.yawn",
  "migrations/2026-08-17-canonical-extension.yawn",
  "lib/canonical-extension-v1.mjs",
  "tests/canonical-extension-v1.test.mjs",
];

const contentExemptFiles = new Set([
  "core/canonical-extension.yawn",
  "migrations/2026-08-17-canonical-extension.yawn",
  "lib/canonical-extension-v1.mjs",
  "tests/canonical-extension-v1.test.mjs",
  "scripts/validate-canonical-extension.mjs",
]);

const scannedExtensions = new Set([
  "", ".cff", ".css", ".html", ".js", ".json", ".md", ".mjs",
  ".ps1", ".py", ".sql", ".ts", ".tsx", ".txt", ".yaml", ".yawn", ".yml",
]);

// yawn-invalid-alias-guard:start
const forbiddenPathPattern = /\.(?:ion|yon)$/iu;
const forbiddenContentPatterns = [
  { id: "dotted-invalid-extension", pattern: /\.(?:ion|yon)\b/iu },
  { id: "invalid-schema-key", pattern: /^\s*(?:ion|yon)\s*:/imu },
  {
    id: "invalid-schema-noun",
    pattern: /\b(?:ion|yon)\s+(?:file|files|schema|schemas|record|records|format|formats|extension|extensions|protocol|protocols)\b/iu,
  },
  { id: "invalid-product-host", pattern: /\b(?:ion|yon)\.(?:ai|bot)\b/iu },
  { id: "retired-expansion", pattern: /\bInterface Orientation Node\b/iu },
  { id: "retired-definition-slug", pattern: /\bwhat-is-an-ion\b/iu },
];
// yawn-invalid-alias-guard:end

const guardStart = "yawn-invalid-alias-guard:start";
const guardEnd = "yawn-invalid-alias-guard:end";

function listTrackedFiles() {
  const output = execFileSync("git", ["ls-files", "-z"], { encoding: "utf8" });
  return output.split("\0").filter(Boolean).sort();
}

function stripApprovedGuardBlocks(file, source, violations) {
  const lines = source.split(/\r?\n/u);
  const retained = [];
  let insideGuard = false;

  lines.forEach((line, index) => {
    const starts = line.includes(guardStart);
    const ends = line.includes(guardEnd);

    if (starts && insideGuard) {
      violations.push(`${file}:${index + 1}: nested alias-guard start`);
      return;
    }
    if (starts) {
      insideGuard = true;
      return;
    }
    if (ends && !insideGuard) {
      violations.push(`${file}:${index + 1}: alias-guard end without start`);
      return;
    }
    if (ends) {
      insideGuard = false;
      return;
    }
    if (!insideGuard) retained.push(line);
  });

  if (insideGuard) violations.push(`${file}: alias-guard block is not closed`);
  return retained.join("\n");
}

function firstMatchingLine(source, pattern) {
  const lines = source.split(/\r?\n/u);
  for (let index = 0; index < lines.length; index += 1) {
    if (pattern.test(lines[index])) {
      pattern.lastIndex = 0;
      return index + 1;
    }
    pattern.lastIndex = 0;
  }
  return null;
}

const trackedFiles = listTrackedFiles();
const trackedSet = new Set(trackedFiles);
const violations = [];

for (const requiredFile of requiredFiles) {
  if (!trackedSet.has(requiredFile)) {
    violations.push(`${requiredFile}: required canonical-extension artifact is missing`);
  }
}

for (const file of trackedFiles) {
  if (forbiddenPathPattern.test(file)) {
    violations.push(`${file}: tracked path uses an invalid YAWN schema extension`);
  }
  forbiddenPathPattern.lastIndex = 0;

  if (contentExemptFiles.has(file)) continue;
  if (!scannedExtensions.has(extname(file).toLowerCase())) continue;

  const buffer = readFileSync(file);
  if (buffer.includes(0)) continue;

  const source = stripApprovedGuardBlocks(file, buffer.toString("utf8"), violations);
  for (const rule of forbiddenContentPatterns) {
    const line = firstMatchingLine(source, rule.pattern);
    if (line !== null) violations.push(`${file}:${line}: ${rule.id}`);
  }
}

if (violations.length > 0) {
  console.error("[canonical-extension] validation failed:");
  for (const violation of violations) console.error(`- ${violation}`);
  process.exit(1);
}

console.log(`[canonical-extension] passed: ${trackedFiles.length} tracked paths use canonical YAWN naming`);
