import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

// schemas/statuses.v1.schema.json fixes lifecycleStatus:
//   draft | active | superseded | archived | deleted
// and says "Consumers must not infer one status dimension from another."
// A cross-root scan on 2026-09-12 found the top-level `status:` field in .yawn
// records carrying 38 distinct values across 176 files: lifecycle words mixed
// with version markers (v0-seed, v1, draft-0.2), authority words (proposed,
// accepted, official), and sentences (proposal-only-not-scheduled). One field
// was carrying at least four of the eight status dimensions the schema keeps
// separate. Free-text statuses make records uncomputable — no ranker, ledger,
// or bot can ask "what is active?" over an open vocabulary — and the drift was
// invisible because nothing checked it.
//
// This test closes the top-level `status:` field to the lifecycle enum. Version
// belongs in `spec_version:` or `version:`; authority in `authority_status:` or
// `ratification_status:`; loop position in `loop_status:`. It follows the shape
// of tests/epistemic-status-vocabulary.test.mjs exactly: every existing
// divergent value is grandfathered BY FILE below so history is never rewritten
// silently, and the ledger may only shrink. Migrating a record removes its entry.

const LIFECYCLE = new Set(["draft", "active", "superseded", "archived", "deleted"]);

// Frozen grandfather ledger (file path -> allowed legacy values), snapshot
// 2026-09-12. Entries are removed when their records migrate; nothing may be
// added. New records must use the five lifecycle values.
const GRANDFATHERED = new Map([
  [".github/ISSUE_TEMPLATE/node.yawn", ["v0-seed"]],
  [".github/node.yawn", ["v0-seed"]],
  ["agency-declaration.yawn", ["v0-seed"]],
  ["agency-declaration/node.yawn", ["v0-seed"]],
  ["agents/collaboration-history.yawn", ["working_draft"]],
  ["agents/contributor-agent.yawn", ["v0-seed"]],
  ["agents/contributor-architecture.yawn", ["v0-seed"]],
  ["agents/node.yawn", ["active-mixed"]],
  ["agents/orientation.yawn", ["draft-0.2"]],
  ["agents/repo-contributor.yawn", ["active-module"]],
  ["agents/yawn.bot.policy.yawn", ["active-module"]],
  ["agents/yawn.bot.yawn", ["official"]],
  ["automation/codex-repo-agent.yawn", ["v0-seed"]],
  ["automation/node.yawn", ["v0-seed"]],
  ["automation/yawn-bot-repo-contributor-loop.yawn", ["active-module"]],
  ["automation/yawn.bot.feedback-loop.yawn", ["active-seed"]],
  ["automation/yawn.bot.pr-notification.yawn", ["active-seed"]],
  ["automation/yawn.bot.statement-image-proposals.yawn", ["proposal-only-not-scheduled"]],
  ["core/agency.yawn", ["v0-seed"]],
  ["core/design-principles.yawn", ["v0-seed"]],
  ["core/event-reduction.yawn", ["v1"]],
  ["core/folder-node.yawn", ["v0-seed"]],
  ["core/holarchy.yawn", ["draft-0.2"]],
  ["core/human-use.yawn", ["v0-seed"]],
  ["core/inquiry-selection.yawn", ["draft-0.1"]],
  ["core/lacuna.yawn", ["v1"]],
  ["core/memory-update.yawn", ["v1"]],
  ["core/motivation-and-purpose.yawn", ["v1"]],
  ["core/movement-frame.yawn", ["v1"]],
  ["core/movement-loop.yawn", ["v1"]],
  ["core/next-move-logic.yawn", ["v1"]],
  ["core/node.yawn", ["active-mixed"]],
  ["core/objective-holon.yawn", ["draft-0.1"]],
  ["core/observer-and-body.yawn", ["v0-seed"]],
  ["core/orientation.yawn", ["draft-0.2"]],
  ["core/projection-and-aperture.yawn", ["draft-0.3"]],
  ["core/proof-and-boundary.yawn", ["v1"]],
  ["core/routing.yawn", ["draft-0.2"]],
  ["core/state-transition.yawn", ["v1"]],
  ["core/state.yawn", ["v1"]],
  ["core/target-and-lacuna.yawn", ["v1"]],
  ["core/turn.yawn", ["draft-0.2"]],
  ["core/what-is-a-yawn.yawn", ["v0-seed"]],
  ["core/world-field-arena.yawn", ["draft-0.2"]],
  ["core/yawn-space.yawn", ["v0-seed"]],
  ["database/feedback-intake.yawn", ["v0-seed"]],
  ["database/node.yawn", ["v0-seed"]],
  ["dave/number-sense/model.yawn", ["draft-0.1"]],
  ["dave/prenumerical-thinking/model.yawn", ["draft-0.1"]],
  ["declaration-of-agency/node.yawn", ["v0-redirect"]],
  ["examples/choice.yawn", ["example"]],
  ["examples/conversation-import-routing.yawn", ["informative"]],
  ["examples/dave-good-dad-objective-holon.yawn", ["informative"]],
  ["examples/decision.yawn", ["example"]],
  ["examples/merge-split-routing.yawn", ["informative"]],
  ["examples/nested-agent-arena.yawn", ["informative"]],
  ["examples/node.yawn", ["active-mixed"]],
  ["examples/relationship-commitment-conversation.yawn", ["example"]],
  ["examples/relationship-tension.yawn", ["example"]],
  ["examples/repair.yawn", ["example"]],
  ["examples/signal.yawn", ["example"]],
  ["examples/state-substrate-family.yawn", ["v1-example"]],
  ["examples/stuck.yawn", ["example"]],
  ["examples/waiting-turn.yawn", ["informative"]],
  ["examples/yawn-spine-dogfood.yawn", ["example"]],
  ["feedback/codex-t4o-parser.yawn", ["v0-seed"]],
  ["feedback/email-intake.yawn", ["v0-seed"]],
  ["feedback/form.yawn", ["v0-seed"]],
  ["feedback/node.yawn", ["v0-seed"]],
  ["fixtures/node.yawn", ["active-mixed"]],
  ["interface/desktop-homebase-v1.yawn", ["working_draft"]],
  ["interface/local-observation-art-v0.1.yawn", ["proposed"]],
  ["interface/map.yawn", ["v0-seed"]],
  ["interface/meaning.yawn", ["v1"]],
  ["interface/memory.yawn", ["v0-seed"]],
  ["interface/mirror.yawn", ["v0-seed"]],
  ["interface/move.yawn", ["v0-seed"]],
  ["interface/node.yawn", ["v0-seed"]],
  ["interface/objective-compiler.yawn", ["draft-0.1"]],
  ["interface/projection-stack.yawn", ["v0-seed"]],
  ["migrations/2026-08-17-canonical-extension.yawn", ["proposed"]],
  ["observations/lived-agency.yawn", ["v0-seed"]],
  ["observations/node.yawn", ["v0-seed"]],
  ["q-space/node.yawn", ["owner-review-required"]],
  ["q-space/protocol-v1.yawn", ["owner-review-required"]],
  ["question-packets/basic.yawn", ["seed"]],
  ["question-packets/orientation-nine.yawn", ["draft-0.4"]],
  ["question-packets/relationship.yawn", ["seed"]],
  ["question-packets/turn-close.yawn", ["draft-0.2"]],
  ["questions/node.yawn", ["preview"]],
  ["questions/open-questions.yawn", ["preview"]],
  ["questions/what-can-i-do-next.yawn", ["preview"]],
  ["questions/what-is-this.yawn", ["preview"]],
  ["questions/where-am-i.yawn", ["preview"]],
  ["records/2026-09-03-yawnbot-intelligence-container-clarification.yawn", ["proposed-canonical-backfill"]],
  ["records/access-log.yawn", ["v0-seed"]],
  ["records/automation-log.yawn", ["v0-seed"]],
  ["records/backup-log.yawn", ["v0-seed"]],
  ["records/cold-start-proof-2026-07-11.yawn", ["passed"]],
  ["records/epistemic-status-drift-ledger-2026-08-28.yawn", ["reported_pending_dave_acceptance"]],
  ["records/feedback-log.yawn", ["v0-seed"]],
  ["records/github-access.yawn", ["v0-seed"]],
  ["records/inquiry-aperture-one-question-face.yawn", ["owner-review-required"]],
  ["records/interception-publication-2026-08-29.yawn", ["complete"]],
  ["records/interception-statement-image-approval-2026-08-29.yawn", ["accepted-with-conditions"]],
  ["records/interception-statement-image-result-2026-08-29.yawn", ["proved-candidate-and-production-publication"]],
  ["records/llm-access.yawn", ["v0-seed"]],
  ["records/material-time.yawn", ["v0-seed"]],
  ["records/next-move-ledger.yawn", ["v0-seed"]],
  ["records/node.yawn", ["v0-seed"]],
  ["records/yawn-bot-runtime-promotion-2026-07-11.yawn", ["accepted"]],
  ["records/yawn.ai-funnel-bridge-ledger.yawn", ["active-seed"]],
  ["records/yawn.bot-ai-writing-ledger.yawn", ["active-seed"]],
  ["records/yawn.bot-license-risk-ledger.yawn", ["active-seed"]],
  ["records/yawn.bot-log.yawn", ["active-seed"]],
  ["records/yawn.bot-pattern-ledger.yawn", ["active-seed"]],
  ["records/yawn.bot-pr-notification-ledger.yawn", ["active-seed"]],
  ["records/yawn.bot-private-pr-ledger.yawn", ["active-seed"]],
  ["records/yawn.bot-trending-ledger.yawn", ["active-seed"]],
  ["records/yawn.bot-verification-2026-07-01.yawn", ["complete"]],
  ["references/interception.yawn", ["public-working-paper"]],
  ["references/july-01-lock.yawn", ["v0-seed"]],
  ["references/node.yawn", ["v0-seed"]],
  ["references/ownership-and-license.yawn", ["v0-seed"]],
  ["references/scientific-frame.yawn", ["v0-seed"]],
  ["references/source-index.yawn", ["v0-seed"]],
  ["shape/information-field.yawn", ["v0-seed"]],
  ["shape/node.yawn", ["draft-0.2"]],
  ["shape/observing-agent.yawn", ["v0-seed"]],
  ["shape/orientation-shape.yawn", ["draft-0.2"]],
  ["start/first-yawn.yawn", ["v0-seed"]],
  ["start/how-to-use-yawn.yawn", ["v0-seed"]],
  ["start/node.yawn", ["v0-seed"]],
  ["start/value-proposition.yawn", ["v0-seed"]],
  ["start/what-is-a-yawn.yawn", ["v0-seed"]],
  ["templates/arena.yawn", ["proposed"]],
  ["templates/full.yawn", ["seed"]],
  ["templates/mental-model.yawn", ["draft-0.1"]],
  ["templates/node.yawn", ["active-mixed"]],
  ["templates/observation.yawn", ["accepted"]],
  ["templates/orientation-shape.yawn", ["seed"]],
  ["templates/q-space-frontier-candidate.yawn", ["proposed"]],
  ["templates/routing-proposal.yawn", ["proposed"]],
  ["templates/structural-change-receipt.yawn", ["not_authorized"]],
  ["templates/turn.yawn", ["open"]],
]);
const LEDGER_CEILING = 145;
// Frozen snapshot of the ledger as first written. The live map above may only lose entries:
// every key in it must appear in the snapshot, and the snapshot file may not change.
const SNAPSHOT_FILE = "tests/fixtures/status-grandfather-2026-09-12.txt";
const SNAPSHOT_SHA256 = "d34580a7be469245e7ff03df4ed651d6c23cdb979fbd494d4f1a3f4503fdf5b7";

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

function topLevelStatuses(text) {
  // Every top-level (column-0) `status:` scalar, in order. Nested status fields inside
  // proof:, entries, or schema-typed records are different dimensions and are
  // governed by their own contracts. A record normally has one; a second column-0
  // status: is checked too, so it cannot hide an off-vocabulary value.
  if (text.trimStart().startsWith("{")) return []; // JSON-format record
  const values = [];
  for (const line of text.split(/\r?\n/)) {
    const match = line.match(/^status:\s*(.*)$/);
    if (!match) continue;
    let value = match[1].trim();
    if (value.startsWith('"') || value.startsWith("'")) value = value.slice(1, value.lastIndexOf(value[0]));
    else value = value.replace(/\s+#.*$/, "").trim();
    values.push(value);
  }
  return values;
}
const topLevelStatus = (text) => topLevelStatuses(text)[0] ?? null;

test("top-level status: values stay inside the lifecycle vocabulary", async () => {
  const violations = [];
  for (const file of await walkYawnFiles(ROOT)) {
    const relative = path.relative(ROOT, file).split(path.sep).join("/");
    const allowedLegacy = GRANDFATHERED.get(relative) ?? [];
    for (const value of topLevelStatuses(await readFile(file, "utf8"))) {
      if (value === "") continue;
      if (!LIFECYCLE.has(value) && !allowedLegacy.includes(value)) {
        violations.push(`${relative}: "${value}"`);
      }
    }
  }
  assert.deepEqual(
    violations,
    [],
    `status: outside the lifecycle vocabulary (draft|active|superseded|archived|deleted). Put version in spec_version:, authority in ratification_status:, loop position in loop_status:.\n${violations.join("\n")}`,
  );
});

test("the grandfather ledger only shrinks", async () => {
  assert.ok(GRANDFATHERED.size <= LEDGER_CEILING, `no new grandfathered files may be added (ceiling ${LEDGER_CEILING})`);
  const snapshotText = await readFile(path.join(ROOT, SNAPSHOT_FILE), "utf8");
  assert.equal(createHash("sha256").update(snapshotText).digest("hex"), SNAPSHOT_SHA256, `${SNAPSHOT_FILE} is frozen; do not edit it`);
  const snapshot = new Set(snapshotText.split("\n").filter(Boolean));
  const added = [...GRANDFATHERED.keys()].filter((k) => !snapshot.has(k));
  assert.deepEqual(added, [], `files grandfathered after the snapshot (a freed slot may not be reused):\n${added.join("\n")}`);
  // An entry whose file no longer carries its legacy value is stale: remove it.
  const stale = [];
  for (const [relative, legacy] of GRANDFATHERED) {
    let value = null;
    try { value = topLevelStatus(await readFile(path.join(ROOT, relative), "utf8")); } catch { stale.push(`${relative} (file missing)`); continue; }
    if (value === null || LIFECYCLE.has(value) || !legacy.includes(value)) stale.push(`${relative} (now "${value}")`);
  }
  assert.deepEqual(stale, [], `grandfather entries whose records have migrated must be removed:\n${stale.join("\n")}`);
});

test("the basic template teaches the lifecycle vocabulary", async () => {
  const template = await readFile(path.join(ROOT, "templates", "basic.yawn"), "utf8");
  const comment = template.match(/^status:.*#\s*(.+)$/m)?.[1] ?? "";
  const taught = comment.split("|").map((w) => w.trim()).filter(Boolean);
  assert.deepEqual(taught.sort(), [...LIFECYCLE].sort(), "templates/basic.yawn must list the five lifecycle statuses on its status: line");
});
