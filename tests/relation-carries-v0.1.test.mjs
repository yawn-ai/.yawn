import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

// RFC 0004: a relation step carries; a slash command is a capability
// invocation addressed at a relation step. This test only checks that the
// proposed contract is whole and uses the locked vocabulary — it does not
// make the proposal accepted.

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const CANONICAL_EPISTEMIC = new Set([
  "observed", "reported", "inferred", "assumed", "predicted", "disputed", "unknown",
]);

async function readContract() {
  return readFile(path.join(ROOT, "core", "relation-carries.yawn"), "utf8");
}

test("relation-carries contract declares the required top-level keys", async () => {
  const text = await readContract();
  for (const key of [
    "id: core/relation-carries",
    "kind: ontology-contract",
    "status: draft-0.1",
    "owner_ruling: pending",
    "carries:",
    "slash_command:",
    "invariants:",
    "taxonomy_view:",
    "boundary:",
    "proof:",
  ]) {
    assert.ok(text.includes(key), `missing ${key}`);
  }
});

test("relation-carries uses a canonical epistemic status and stays a proposal", async () => {
  const text = await readContract();
  const match = text.match(/^epistemic_status:\s*(.+)$/m);
  assert.ok(match, "epistemic_status missing");
  assert.ok(CANONICAL_EPISTEMIC.has(match[1].trim()), `non-canonical epistemic status ${match[1]}`);
  assert.ok(/status: proposal-pending-owner-ruling/.test(text), "proof.status must stay a proposal");
});

test("relation-carries states the authority invariant and the no-invocation-from-nowhere rule", async () => {
  const text = await readContract();
  assert.ok(text.includes("Authority = carried grant"), "authority invariant missing");
  assert.ok(text.includes("No invocation from nowhere"), "open-port rule missing");
  assert.ok(text.includes("cannot mint capability"), "subset rule missing");
});

test("RFC 0004 exists and is indexed", async () => {
  const rfc = await readFile(path.join(ROOT, "rfcs", "0004-slash-command-as-capability-invocation.md"), "utf8");
  assert.ok(rfc.startsWith("# RFC 0004"));
  const index = await readFile(path.join(ROOT, "rfcs", "README.md"), "utf8");
  assert.ok(index.includes("0004-slash-command-as-capability-invocation.md"), "RFC 0004 not indexed in rfcs/README.md");
});
