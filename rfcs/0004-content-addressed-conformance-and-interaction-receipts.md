# RFC 0004: Content-addressed conformance and interaction receipts

- Status: proposed
- Date: 2026-08-28
- Authors: David Forman with AI-assisted synthesis
- Decision authority: founding maintainer

## 1. Summary and status

Add two working-draft protocol surfaces without changing stable V1 records:

1. a content-addressed Protocol Manifest V0.1 that names one additive semantic
   revision and closed conformance profiles; and
2. a typed Interaction Operator Receipt V0.1 for explicit review and response
   events such as `confirm`, `reject`, `correct`, `answer`, or `defer`.

The initial `yawn.bot/new.v0.1` profile binds the public modules needed to
implement `/new` without silently dropping Observation, Objective Holon,
Orientation Map, inquiry selection, interaction receipts, or their authority
and View boundaries.

This RFC is proposed. Its records remain working drafts until maintainer review.
The separate Objective Holon lifecycle amendment is governed by
[RFC 0005](0005-optional-objective-promotion-and-bot-binding.md), not hidden in
either of the two surfaces proposed here.

## 2. Current state and lacuna

The repository links its protocol modules, but a consumer cannot yet cite one
commit-independent semantic revision and prove that it received the complete
artifact set for a product profile. A partial implementation can therefore
appear current while omitting a draft module.

The interface also names controls such as “yes,” “confirm,” and “correct”
without a typed receipt that binds the operation to an exact source, question
event, detection, or proposal. This invites several invalid collapses:

- Observation into Yawn creation;
- confirmation into truth or objective ratification;
- an answer to an open question into proposal confirmation;
- objective ratification into bot activation; and
- activation into authority for external effects.

Finally, Objective Holon V0.1 contains references to Yawns, grants, policies,
and receipts governed by other documents. Validating its standalone grammar
does not resolve those references or prove materialization conformance.

## 3. Proposed semantics and invariants

### Protocol manifest

`protocol-manifest.v0.1.json` publishes:

- an additive semantic revision rather than a Git commit identifier;
- versioned modules with exact artifact paths, roles, and SHA-256 digests;
- a canonical artifact-set digest; and
- closed conformance profiles whose required modules and artifacts must agree.

The artifact-set digest is SHA-256 over the UTF-8 bytes of `JSON.stringify`
applied to lexicographically sorted
`[moduleId, version, path, role, sha256]` tuples, with no extra whitespace or
trailing newline. Tuple order in the source manifest is therefore irrelevant;
changing any tuple value changes the digest.

`artifactSetSha256` proves artifact-set integrity only. It does not hash profile
membership, descriptions, invariants, or manifest-level semantics and therefore
is not a profile identity. A downstream conformance claim MUST pin the pair
`(whole-manifest SHA-256, profileId)`. `protocolRevision` alone is a human-facing
semantic label and is insufficient for that claim.

The manifest cannot hash itself. A downstream deployment lock may additionally
record an accepted Git commit, but the protocol manifest contains no commit
identity and does not replace repository governance.

### Interaction operator receipt

An Interaction Operator Receipt binds one operator to one exact subject and
exactly one immutable `SourceEvidenceRef {kind:"source", id, sourceSha256}`
produced by that interaction. `id` is the constitutional SourceRecord UUID;
`sourceKey` remains a field on the resolved SourceRecord and is never used as a
substitute identity. Mutable Question, detection, and proposal subjects retain
revision and state hash. The receipt records a review or response disposition.
It is explicitly non-canonical and cannot by itself establish truth, ratify an
objective, materialize a Yawn, activate a bot, grant authority, or authorize an
external effect.

`confirm` and `reject` apply to detection or proposal review. A yes/no response
to an open Question uses `answer`; it is not silently reinterpreted as
confirmation or rejection of a model inference.

Question and mapping transitions use closed operator-specific allowed-from
tables. `answer` cannot overwrite an answered/corrected response; `correct`
requires an existing answered/corrected response; explicit unknown, disputed,
not-applicable, skip, defer, and withhold operations remain distinct. Mapping
confirmation, rejection, and correction reject unmapped or illegal self-
overwrites. A downstream reducer must still compare the claimed from-status to
the current append-only state.

Shape and local semantic validation prove only internal binding and attribution.
Before applying any View transition, a consumer MUST authenticate actor and
principal; resolve the exact constitutional Source, subject, inquiry-selection
receipt, and prompt hash; prove from-status current; and enforce privacy/egress.
`Response.visibility` MUST NOT widen a resolved SourceRecord's `localOnly` or
visibility boundary. Resolution fails closed on mismatch.

The append-only receipt store MUST enforce unique `receiptId`. An exact same-ID,
same-bytes replay is idempotent. The same ID with different bytes is a conflict,
including for operators without a from-status compare-and-swap. A locally
self-consistent or forged bundle is not a valid application merely because this
validator returns no document-local errors.

### Cross-document boundary

Including Objective Holon artifacts in a profile proves grammar availability,
not closed Yawn, authority-grant, policy, receipt, or principal resolution. Any
claim that an objective was materialized must run an aggregate cross-document
resolver. This RFC does not invent that future resolver.

The closed `/new` profile also carries the stable constitution/Source contract,
generic record-event and proof surfaces, and the strict Objective binding
validator/fixture. This makes required source identity, append-only replay,
proof, and binding checks available without claiming that the future aggregate
resolver already exists.

The following invariants are profile requirements:

1. An Observation remains valid without promotion or Yawn materialization.
2. An Orientation Map is a non-canonical View.
3. Confirmation is not authority.
4. Objective ratification is not bot activation.
5. Activation is not effect authority.
6. View, Yawn, and Yawn.bot remain distinct types.
7. Objective materialization requires cross-document resolution.
8. Interaction-receipt application requires external resolution, idempotency,
   current-state, and privacy/egress checks.
9. Source evidence uses the constitutional SourceRecord UUID identity and
   immutable `sourceSha256`; `sourceKey` never substitutes for that identity.
10. An objective-steward or worker bot in the `/new` profile requires a
   matching BotBindingReceipt under the strict profile validator.

## 4. Alternatives and counterexamples

1. **Use only a Git commit hash.** Rejected as the sole semantic identity: it
   pins repository bytes but does not name module membership or a product
   conformance profile.
2. **Embed the manifest's own raw-byte hash inside the manifest.** Rejected
   because that field would be recursive. A detached downstream lock MUST still
   hash the final raw manifest bytes and pair that digest with `profileId`.
3. **Treat every click as generic confirmation.** Rejected because review,
   answer, correction, and authority events have different consequences.
4. **Let Objective Holon schema validity prove materialization.** Rejected
   because standalone validation cannot establish that external references
   exist, are current, or authorize the transition.

## 5. Authority, privacy, safety, and human-agency effects

The manifest attests to bytes and module closure only. A matching digest cannot
make a draft stable, establish truth, widen visibility, grant authority, or
authorize an effect.

Interaction receipts preserve exact source binding, actor attribution, and
scope. Their effect flags are closed to `false`. Document-local validation
cannot authenticate the claimed identity, make private evidence public, or
apply a View transition. Ratification, binding, activation, delegation,
canonical mutation, and external effects continue to require their own governed
records and checks.

## 6. Compatibility and migration

This change is additive. Stable V1 schemas and existing `.yawn` files remain
valid. Consumers that do not claim `yawn.bot/new.v0.1` conformance may ignore
the new records. Consumers that do claim the profile must verify the manifest,
resolve every required artifact, and preserve all listed invariants.

The corrected `/new` draft stores the first non-empty signal as an Observation.
It does not create a Yawn until an explicit, receipted materialization
operation. This narrows a contradictory working-draft sentence; it does not
migrate or reinterpret stable records.

## 7. Schemas, examples, and conformance tests

The implementation adds:

- `schemas/protocol-manifest.v0.1.schema.json` and a semantic validator;
- `protocol-manifest.v0.1.json` with `yawn.bot/new.v0.1`;
- `schemas/interaction-operator-receipt.v0.1.schema.json`, a reference runtime,
  validator, fixture, and adversarial tests; and
- explicit ratification and activation receipts in the human-readable
  Dave/good-dad Objective Holon example.

Objective promotion and BotBindingReceipt changes are governed and tested
separately by RFC 0005.

Tests must reject missing or unexpected profile modules/artifacts, stale
artifact hashes, manifest self-reference, invalid operator/subject transitions,
authority-producing interaction receipts, and unreceipted lifecycle narration.
They must also expose the external application requirements for receipt-ID
idempotency, current-state resolution, and privacy/egress. Artifact-set hashing
must be reorder-invariant and mutation-sensitive.

## 8. Evidence, open questions, and falsifiers

Acceptance evidence is a clean repository-wide suite, schema and semantic
validation of the canonical manifest and receipts, resolved public links, and
byte-for-byte agreement with every declared SHA-256.

An aggregate resolver for Objective Holon references remains future work. The
profile must state that limitation rather than imply it exists.

The proposal is falsified if a consumer can omit or add a profile artifact and
still claim the closed profile; array reordering changes the aggregate digest;
artifactSetSha256 is treated as profile identity; a confirmation receipt grants
authority; an unanswered Question is closed by review feedback; a duplicated
receipt ID applies conflicting bytes; private Source evidence is relabeled to a
wider visibility; a locally self-consistent forged bundle is applied without
resolution; or a signal automatically becomes a Yawn.

## 9. Decision and implementation receipt

Decision: pending authenticated maintainer review.

The implementing change must be reviewed and merged through repository
governance. No commit identity is embedded in the protocol manifest or asserted
by this proposed RFC.
