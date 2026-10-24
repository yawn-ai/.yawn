# Project status

Runtime-profile addition reviewed: 2026-10-24. Other status statements below
retain their earlier verification boundary of 2026-08-27.

YAWN is public, MIT licensed, maintainer-led, and under active development.
Parts of the protocol are stable enough to build against; the integrated
ontology and document format are still a working draft.

## Runtime contract stages

| Stage | Current evidence |
| --- | --- |
| Runtime Profile 0.1 syntax and composition | Strict schema, bounded parser, ancestry and lifecycle reference tests |
| Structural/action host contract | Additive `yawn.runtime-action.v0.1` implementation and offline adversarial tests |
| Interoperability | Language-neutral corpus with exact expected JSON, issue codes and SHA-256 digests |
| Disclosure | Default-deny reference projection; bounded consuming-host Rules/privacy tests attributed to PR395; production policy remains host-owned |
| Reuse | Explicit private-package exports and an exact-file vendoring contract |
| Bounded consuming-host admission | Local function-only Movement comparison merged in [YAWN.bot PR395](https://github.com/yawn-ai/yawn.bot/pull/395), with PostgreSQL admission fence and separate admission/result receipts |
| Host conformance and browser evidence | Same ten golden vectors, five fresh Chromium cases with zero skips/retries, twelve PGlite and fifteen native PostgreSQL cases; [attributed scope and source](runtime-host-integration.md#consuming-host-evidence) |
| Production enablement and live execution | Hosted migration, production enablement and observed live execution remain unverified |

The [host contract](../spec/runtime-host-contract.md) preserves Runtime Profile
0.1. Proposed skill I/O schemas, validity windows, richer privacy and MCP schema
pins remain future versioned work rather than silent 0.1 changes.

## What is stable now

- `@yawn/contracts` v1 constitutional invariants and generated TypeScript
- v1 state-substrate schemas for state, event, desire, target, transition,
  update, and living snapshots
- the rule that only authorized events update canonical state
- the separation of desire, target, permission, move, outcome, and proof
- source attribution and proposal-before-approval boundaries
- first-class `yawn.observation-state.v1` records, generic record events and
  proof subjects, deterministic Observation replay/export, and source/view
  preference separation at the protocol-contract layer
- YAWN as the single product name and `.yawn` as the single human-readable
  record extension, enforced by a tracked-path/content validator
- context-gated normalization of common speech-to-text substitutions with raw
  transcript preservation and an ambiguity hold

Compatibility promises apply to these v1 artifacts as documented in their
packages. Security or correctness fixes may still require additive changes.

## What is draft

- Agency Holarchy 0.2: arena, Yawn, relation, turn, routing, and structural
  change records
- Objective Holon 0.1: typed detection, objective ratification, objective-Yawn
  binding, Yawn.bot lifecycle, and activation receipts
- Orientation Map 0.1: nine-axis semantic coverage, deterministic adaptive
  inquiry, closed selection/hold replay receipts, source-preserving presentation
  metadata, and proposed presentation-fit hypotheses
- Articulation Floor 0.1: sealed predictions written before a question renders,
  reason-checked answers, a per-axis floor that replays from its ledger, and a
  readout that refuses a verdict below ten closed records
- Runtime Profile 0.1: an opt-in configuration schema, versioned ancestry
  migration, semantic hashing, lifecycle checks, and a reference resolver with
  provenance and explicit unresolved results; see its
  [implementation boundary](../spec/runtime-profile.md#implementation-boundary)
- the exact portable `.yawn` document envelope
- cross-module canonical hashing and reference resolution beyond the new
  Observation/record-subject slice
- merge/split thresholds and conformance profiles
- public projection APIs for arena, timeline, filesystem, memory, and replay
- field validation of the new Observation-derived Question, local-art candidate,
  and View-feedback proposal contracts beyond their conformance fixture
- shared web/desktop ingestion of canonical naming-correction receipts
- the attributed collaboration-message envelope, multi-intelligence history
  loop, and desktop Homebase projection/capability split

Draft artifacts are useful for experiments but may change after RFC review.

## Known lacunae

1. The human-readable full template and runtime v1 contract are two different
   shapes. Neither is yet “the complete `.yawn` schema.”
2. The contracts package and root state schemas were developed as parallel v1
   modules. A future unified package must preserve both rather than silently
   selecting one.
3. JSON-compatible YAML Observation exports now have a reference implementation;
   Runtime Profile 0.1 adds a bounded parser/resolver for its own profile.
   Broader human-authored document parsing, cross-module schema resolution, and
   whole-repository conformance still need a shared implementation.
4. Privacy/egress and multi-principal authority require more executable tests.
5. Merge, split, and reparent operations need field evidence before thresholds
   become normative.
6. Several pre-hub automation and reference records still contain
   environment-specific local paths. They are compatibility/provenance inputs,
   not portable defaults; active runtimes should inject configured paths.
7. The YAWN.bot database migration remains unapplied and still needs executable
   Postgres concurrency, RLS, replay, and cross-owner isolation proof.
8. Projection-preference schemas and deterministic resolution exist, but an
   accepted write path and shared YAWN.ai/YAWN.bot consumer are not yet shipped.
9. The canonical lexical normalizer is executable in this repository, but web,
   desktop, API, import, and agent-ingestion boundaries still need cross-repo
   golden fixtures proving identical correction receipts.
10. The collaboration-history schema preserves attribution and authority, but
    automatic Codex and Claude Code adapters still need authenticated cursors,
    replay, concurrency, privacy, and cross-principal isolation proof.
11. Objective Holon 0.1 proves lifecycle separation but still references Yawn,
    agent, source, policy, and authority identifiers governed by other modules;
    a unified aggregate and cross-document resolver remain future work.
12. Orientation Map 0.1 implements deterministic heuristic ranking, not a
    calibrated psychometric instrument or proof of one universal question order.
13. One consuming-host path is implemented and tested in
    [YAWN.bot PR395](https://github.com/yawn-ai/yawn.bot/pull/395): local
    `movement.compare` through the function-only `yawn.movement.compare@1`
    program. Its [bounded evidence](runtime-host-integration.md#consuming-host-evidence)
    covers authenticated governance, primary ancestry, private Rules disclosure,
    current admission fencing and separate receipts. The app integration merged
    at `ad4cf0dbe24b0b3d8f06041c24e7c33bead02608`. MCP tool-schema pins, further live adapters and
    their versioned contracts remain future work; hosted migration, production
    enablement and observed live execution have not been established.

## Historical naming migration

The numbered pre-canonical generation was removed from the active tree after
all 50 invalid-extension paths were mapped to current canonical targets. The
immutable source commit remains available through
[`migrations/2026-08-17-canonical-extension.yawn`](../migrations/2026-08-17-canonical-extension.yawn).
This is semantic absorption: old wording is evidence from its time, not current
canon merely under a new suffix.

## Source-of-truth order

For a named stable version:

1. constitutional invariant;
2. versioned executable schema;
3. accepted RFC or ADR;
4. human-readable spec;
5. conformance fixture and test;
6. template, guide, or projection.

This is not permission to ignore a contradiction. A contradiction is a
repository lacuna and should be reported. Until resolved, use the narrower
claim and do not widen authority.

## Non-goals

YAWN does not aim to:

- model all of reality;
- turn life into a fixed-score game;
- diagnose people from patterns;
- make AI output authoritative;
- optimize every hour or decide what matters for a person;
- replace legal, medical, financial, or relational judgment; or
- make private context public by default.

See the [Roadmap](../ROADMAP.md) for the next proof obligations.
