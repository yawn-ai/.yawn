import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";

const approvalUrl = new URL(
  "../records/interception-statement-image-approval-2026-08-29.yawn",
  import.meta.url,
);
const resultUrl = new URL(
  "../records/interception-statement-image-result-2026-08-29.yawn",
  import.meta.url,
);
const automationUrl = new URL(
  "../automation/yawn.bot.statement-image-proposals.yawn",
  import.meta.url,
);
const automationIndexUrl = new URL("../automation/node.yawn", import.meta.url);
const recordsIndexUrl = new URL("../records/node.yawn", import.meta.url);
const sourceIndexUrl = new URL("../references/source-index.yawn", import.meta.url);
const rootUrl = new URL("../yawn.yawn", import.meta.url);

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, canonicalize(value[key])]),
    );
  }
  return value;
}

function field(source, name) {
  const match = source.match(new RegExp(`^\\s*${name}: (.+)$`, "m"));
  assert.ok(match, `missing ${name}`);
  return match[1].trim();
}

test("the owner decision is bound to canonical JSON with a strict SHA-256 digest", async () => {
  const approval = await readFile(approvalUrl, "utf8");
  const quotedCanonicalJson = field(approval, "canonical_json");
  assert.match(quotedCanonicalJson, /^'.*'$/);
  const canonicalJson = quotedCanonicalJson.slice(1, -1);
  const payload = JSON.parse(canonicalJson);
  const digest = field(approval, "payload_sha256");

  assert.equal(JSON.stringify(canonicalize(payload)), canonicalJson);
  assert.match(digest, /^[a-f0-9]{64}$/);
  assert.equal(
    createHash("sha256").update(canonicalJson, "utf8").digest("hex"),
    digest,
  );
  assert.equal(payload.authorized_candidate_count, 1);
  assert.equal(payload.separate_from_post_output_acceptance, true);
  assert.equal(payload.target.coordinate, "https://yawn.bot/interception");
});

test("approval is one-time conditional preauthorization, never recurring authority", async () => {
  const approval = await readFile(approvalUrl, "utf8");

  assert.match(approval, /interpretation: conditional-first-conforming-candidate-preauthorization/);
  assert.match(approval, /post_output_aesthetic_acceptance: not-claimed/);
  assert.match(approval, /recurring_or_standing_authority: false/);
  assert.match(approval, /candidate_count: 1/);
  assert.match(approval, /A nonconforming first candidate ends this grant/);
  assert.match(approval, /a second candidate/);
});

test("the result proves the bounded candidate and production publication", async () => {
  const result = await readFile(resultUrl, "utf8");

  assert.match(result, /actual_adapter: OpenAI-built-in-image-generation/);
  assert.match(result, /candidate_count: 1/);
  assert.match(
    result,
    /sha256: 54bd1d3bd256857ddfc6f2027f8af8aa8b209c1d62194a24e07db31cd387718b/,
  );
  assert.match(result, /canonical_http_status: 200/);
  assert.match(result, /browser_figure_visibility: observed/);
  assert.match(result, /browser_accessible_alt: observed/);
  assert.match(result, /route_owned_console_errors: 0/);
  assert.match(result, /status: proved/);
  assert.match(result, /overall: proved-bounded-operation/);
  assert.match(result, /authorization_is_not_success: true/);
  assert.match(result, /deployment_success_inferred: false/);
});

test("the recurring contract can propose but cannot generate, spend, or publish", async () => {
  const automation = await readFile(automationUrl, "utf8");

  assert.match(automation, /status: proposal-only-not-scheduled/);
  assert.match(automation, /invoke an image model/);
  assert.match(automation, /incur provider cost/);
  assert.match(automation, /merge, deploy, publish, or change a domain/);
  assert.match(automation, /per_proposal_bounded_approval_required: true/);
  assert.match(automation, /prior_approval_implies_future_approval: false/);
  assert.match(automation, /exactly-64-lowercase-hex-characters/);
});

test("approval, result, and proposal contract are reachable from public indexes", async () => {
  const [automationIndex, recordsIndex, sourceIndex, root] = await Promise.all([
    readFile(automationIndexUrl, "utf8"),
    readFile(recordsIndexUrl, "utf8"),
    readFile(sourceIndexUrl, "utf8"),
    readFile(rootUrl, "utf8"),
  ]);

  for (const source of [automationIndex, sourceIndex, root]) {
    assert.match(source, /automation\/yawn\.bot\.statement-image-proposals\.yawn/);
  }
  for (const source of [recordsIndex, sourceIndex, root]) {
    assert.match(source, /records\/interception-statement-image-approval-2026-08-29\.yawn/);
    assert.match(source, /records\/interception-statement-image-result-2026-08-29\.yawn/);
  }
});
