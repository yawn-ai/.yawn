# RFC 0001: Agency Holarchy Working Draft 0.2

- Status: proposed
- Date: 2026-08-13
- Authors: David Forman with AI-assisted synthesis
- Decision authority: founding maintainer

## Summary

Publish an additive, experimental vocabulary and schema for the layer missing
between YAWN's state substrate and its Agent Arena projection: world horizon,
field, arena, Yawn holarchy, causal turn, move, event, transition, proof receipt,
routing proposal, and authorized structural-change receipt.

The RFC does not replace `@yawn/contracts` v1 or the state-substrate v1 schemas.
It creates a field-testable draft whose names and serialization may change.

## Current state and lacuna

The repository already defines orientation, state, optional targets, authority,
events, proof, replay, folders as coherence containers, and parent/child arrays.
It does not yet define:

- the distinction among world, field, arena, and Yawn;
- one executable containment backbone plus lateral relations;
- asynchronous causal turns with waiting and resume conditions;
- structural routing among attach, create, link, merge, split, and hold; or
- proof-bearing receipts for structural change.

The human full template and stable runtime schema are also different shapes.
Calling either one the entire `.yawn` schema would hide that incompatibility.

## Proposed semantics

```text
World horizon
  → attributed Field
    → provisional Arena
      → durable Yawn
        → causal Turn
          → Move + Events
            → Transition + Proof
              → authorized State update
```

Containment uses at most one acyclic primary parent per Yawn. Non-containment
relationships use typed, attributed, time-aware lateral links. Turns may overlap
and nest. Waiting is first-class. World is an unbounded referent and is not
serialized as an exhaustive object.

Routing and structural mutation obey these boundaries:

- privacy, egress, authority, transition boundary, proof, provenance,
  inheritance, and human review are explicit gates;
- semantic similarity retrieves candidates but never decides identity;
- AI output remains a proposal;
- accepted merge/split/reparent operations require a human-authorized receipt;
- source identity, aliases, disagreement, and proof continuity survive change;
- canonical events are append-only; and
- projections do not alter truth, permission, or state.

## Alternatives

1. **World equals arena.** Rejected because it erases partial access and the
   model's frame limits.
2. **Arena equals Yawn.** Rejected because one situation can hold several
   independently closable orientation contracts.
3. **Folders establish the holarchy.** Rejected because physical placement is a
   useful projection but cannot prove semantic identity or containment.
4. **One global turn sequence.** Rejected because real agent work is concurrent,
   asynchronous, nested, and partly ordered.
5. **Merge by embedding similarity.** Rejected because similarity cannot protect
   authority, privacy, proof, identity, or disagreement.
6. **Rewrite v1 now.** Rejected because it would silently break two newly
   published compatibility surfaces before field evidence exists.

## Authority, privacy, and safety

Every public/shared item requires explicit owners, audience, and consent refs.
Permissions are states rather than confidence. Granted moves, authorized events,
ratified targets, and authorized structural receipts require consistent granted
control envelopes. Children do not inherit wider authority or visibility.

Implementations treat `.yawn` documents as untrusted data and never execute
embedded commands or YAML constructors.

## Compatibility and migration

This is a new `agency-holarchy.v0.2` aggregate in the existing root `schemas/`
module. It does not change stable v1 JSON. Human authoring templates remain
informative projections and label their snake_case-to-camelCase boundary.

Legacy migration guidance:

- `field` → attributed `FieldSnapshot`;
- first `parent_yawns` value → `primaryParentYawnRef`;
- additional parents → typed relations after review;
- `child_yawns` → derived index;
- movement state → materialized loop state plus current `Turn`;
- move/proof/replay → separate Move, Event, Transition, ProofReceipt, and update.

## Conformance and evidence

The draft includes:

- an annotated JSON Schema with namespaced extensions;
- a canonical fixture that distinguishes proposed future actions from occurred
  events;
- schema tests for privacy, authority, waiting, routing, merge, and split;
- semantic validation for references, parent cycles, causal references, and
  append-only local event continuity; and
- commented human templates and counterexamples.

Acceptance for field testing requires all existing v1 checks and Draft 0.2
tests to pass. Stable adoption requires reviewed routing evidence, at least one
independent implementation, a migration RFC, and an explicit compatibility
decision.

## Open questions and falsifiers

- Do one-parent semantics survive multi-principal use without excessive links?
- Can the routing key distinguish attachment from identity-preserving merge?
- Are turns useful outside software and project work without forcing discreteness?
- Which proof obligations can roll up without leaking private child content?
- Does the aggregate need to become separate independently addressable schemas?

The proposal should be revised or rejected if it cannot preserve provenance,
produces unsafe authority inheritance, encourages one record per message, or
makes common routing decisions less inspectable than the current files.

## Decision and implementation receipt

Decision: pending founding-maintainer acceptance.

Implementation evidence will be linked to the pull request and merge commit.
Publishing the draft does not mark every proposal in its fixture as enacted.
