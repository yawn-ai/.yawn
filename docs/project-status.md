# Project status

Last verified: 2026-08-14

YAWN is public, MIT licensed, maintainer-led, and under active development.
Parts of the protocol are stable enough to build against; the integrated
ontology and document format are still a working draft.

## What is stable now

- `@yawn/contracts` v1 constitutional invariants and generated TypeScript
- v1 state-substrate schemas for state, event, desire, target, transition,
  update, and living snapshots
- the rule that only authorized events update canonical state
- the separation of desire, target, permission, move, outcome, and proof
- source attribution and proposal-before-approval boundaries

Compatibility promises apply to these v1 artifacts as documented in their
packages. Security or correctness fixes may still require additive changes.

## What is draft

- Agency Holarchy 0.2: arena, Yawn, relation, turn, routing, and structural
  change records
- the exact portable `.yawn` document envelope
- cross-module canonical hashing and reference resolution
- merge/split thresholds and conformance profiles
- public View APIs for arena, timeline, filesystem, memory, and replay
- Orientation Passage V1 and Public View V1, both proposed until maintainer
  acceptance

Draft artifacts are useful for experiments but may change after RFC review.

## Known lacunae

1. The human-readable full template and runtime v1 contract are two different
   shapes. Neither is yet “the complete `.yawn` schema.”
2. The contracts package and root state schemas were developed as parallel v1
   modules. A future unified package must preserve both rather than silently
   selecting one.
3. YAML-safe parsing, schema resolution, and whole-repository conformance need a
   shared reference implementation.
4. Privacy/egress and multi-principal authority require more executable tests.
5. Merge, split, and reparent operations need field evidence before thresholds
   become normative.
6. Several pre-hub automation and reference records still contain
   environment-specific local paths. They are compatibility/provenance inputs,
   not portable defaults; active runtimes should inject configured paths.

## Source-of-truth order

For a named stable version:

1. constitutional invariant;
2. versioned executable schema;
3. accepted RFC or ADR;
4. human-readable spec;
5. conformance fixture and test;
6. template, guide, or View.

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
