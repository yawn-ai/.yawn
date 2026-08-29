import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

// Ontology (Working Draft 0.2) fixes the epistemic vocabulary:
//   observed | reported | inferred | assumed | predicted | disputed | unknown
// A cross-root scan on 2026-08-28 found 50+ ad-hoc values in the wild
// (mixed_reported_observed_inferred_proposed, reported_plus_inferred, ...),
// seeded partly by templates/full.yawn teaching a divergent list. Free-text
// statuses make records uncomputable: no ranker, graduation ladder, or claim
// calculator can operate over an open vocabulary. This test locks the canon
// repository: new records must use the seven values; the composite nuance
// belongs in a separate field (for example `epistemic_note`) or in per-claim
// attribution. Existing divergent values are grandfathered EXPLICITLY below
// so history is never rewritten silently — the ledger may only shrink.

const CANONICAL = new Set([
  "observed",
  "reported",
  "inferred",
  "assumed",
  "predicted",
  "disputed",
  "unknown",
]);

// Frozen grandfather ledger (file path -> allowed legacy values). Entries are
// removed when their records migrate; nothing may be added.
const GRANDFATHERED = new Map([
  ["core/RELATIONSHIP_FIRST_AGENT_ARENA.yawn", ["falsifiable_design_hypothesis"]],
  ["core/state.yawn", ["how a claim is known or contested"]], // field-definition doc
  ["readme.yawn", ["proposed"]],
  ["records/inquiry-aperture-one-question-face.yawn", ["proposed_interpretation"]],
  ["references/RELATIONSHIP_FIRST_RESEARCH_BRAID.yawn", ["attributed_multilineage_synthesis"]],
]);

const SKIP_DIRS = new Set(["node_modules", "build", "output", "backup", ".git"]);
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

async function walkYawnFiles(dir) {
  const found = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) found.push(...(await walkYawnFiles(path.join(dir, entry.name))));
    } else if (entry.name.endsWith(".yawn")) {
      found.push(path.join(dir, entry.name));
    }
  }
  return found;
}

function scalarStatusesIn(text) {
  const statuses = [];
  for (const line of text.split(/\r?\n/)) {
    const match = line.match(/^\s*epistemic_status:\s*(.*)$/);
    if (!match) continue;
    let value = match[1].trim();
    if (value.startsWith('"') || value.startsWith("'")) {
      value = value.slice(1, value.lastIndexOf(value[0]));
    } else {
      value = value.replace(/\s+#.*$/, "").trim();
    }
    // Empty scalar opens a nested map; booleans are contract requirement
    // flags ("messages must carry an epistemic_status"), not status values.
    if (value === "" || value === "true" || value === "false") continue;
    statuses.push(value);
  }
  return statuses;
}

test("epistemic_status values in this repository stay inside the ontology vocabulary", async () => {
  const violations = [];
  for (const file of await walkYawnFiles(ROOT)) {
    const relative = path.relative(ROOT, file).split(path.sep).join("/");
    const allowedLegacy = GRANDFATHERED.get(relative) ?? [];
    for (const value of scalarStatusesIn(await readFile(file, "utf8"))) {
      if (!CANONICAL.has(value) && !allowedLegacy.includes(value)) {
        violations.push(`${relative}: "${value}"`);
      }
    }
  }
  assert.deepEqual(
    violations,
    [],
    `epistemic_status outside the seven-value vocabulary (put nuance in epistemic_note or per-claim attribution):\n${violations.join("\n")}`,
  );
});

test("the template teaches exactly the canonical vocabulary", async () => {
  const template = await readFile(path.join(ROOT, "templates", "full.yawn"), "utf8");
  const comment = template.match(/epistemic_status:.*#\s*(.+)$/m)?.[1] ?? "";
  const taught = comment.split("|").map((word) => word.trim()).filter(Boolean);
  assert.deepEqual(taught.sort(), [...CANONICAL].sort(), "templates/full.yawn must list the ontology's seven statuses");
});

test("the grandfather ledger only shrinks", () => {
  // 5 files, 5 legacy values as of 2026-08-28. Migrating a record removes its
  // entry; this ceiling prevents the ledger from becoming a growth surface.
  assert.ok(GRANDFATHERED.size <= 5, "no new grandfathered files may be added");
});
