# RFC 0004: Public projection and interface contract

Status: **Proposed**

## Summary

Define one deterministic, public-safe projection contract shared by YAWN.ai,
YAWN.bot, downloadable `.yawn` records, QR-resolved routes, and the Orientation
Spiral. These surfaces are views of one canonical snapshot, never additional
state stores.

## Snapshot contract

The public snapshot hash is SHA-256 over canonical JSON containing only:

- canonical reference, coordinate, and visibility;
- current Yawn;
- attributed observations;
- relationship offer;
- public source metadata; and
- redaction receipts.

Object keys are sorted recursively. Array order remains meaningful and is
preserved. Interface copy, media, QR rendering, agent overlays, and spiral
positions are excluded so presentation can change without changing semantic
identity.

Every surface MUST report the same `snapshot_hash` for the same semantic input.
The QR resolves to a canonical public route, not an opaque second record.

## Permanent interface contract

Every public projection exposes:

1. current coordinate;
2. one contextual primary action;
3. a short reason that explains why the action belongs on that page;
4. a YAWN.bot reflective overlay control;
5. Download `.yawn`;
6. QR;
7. the open-protocol GitHub link; and
8. sign-in or account state where relevant.

The contract does not require all controls to remain expanded on small screens.
The same semantic labels and actions remain keyboard accessible. The overlay
may add attributed observations but cannot mutate canonical state or create a
second graph.

## Orientation Spiral

The human-facing loop is a projection of the canonical protocol:

```text
observe -> orient -> relate -> intend -> move
  -> consequence / proof -> observe again
```

The active Yawn or lacuna is the center. Parent and child nodes preserve their
canonical IDs. Stable input order and deterministic layout parameters replace
uncontrolled random replay positions. Reduced-motion and semantic-list modes
are required.

## Privacy and source handling

Public sources contain metadata and hashes only. Transcript bodies, private
coordinates, private relationship state, secrets, and hidden inference are
forbidden. A redaction receipt states what class of information was withheld
without disclosing it.

## Compatibility and conformance

Legacy routes may redirect to a canonical coordinate. A compatible renderer
validates the schema, recomputes the hash, resolves graph references, and proves
that node IDs and relationship states satisfy the semantic rules.

This RFC ships as a proposal with schema, fixture, template, examples, validator,
and tests. It does not accept itself or authorize publication.
