# @yawn/contracts

Stable v1 constitutional and runtime contracts for the YAWN loop:

`signal → orientation → choice → move → proof → update`

`schemas/yawn-contracts-v1.schema.json` is the source for this package.
`src/generated.ts` is generated with `npm run generate`; do not edit it by hand.

This package defines the constitution, Agent Space, Arena identity, Yawn state,
source atoms, change proposals, grants, budgets, events, and proof receipts used
by current runtimes. Canonical events remain attributable and replayable. Model
output remains a proposal until an authenticated authority grant accepts it.

Version 1.1 adds additive, generated types for the normalized passage:

- `ActorDescriptorV1`
- `ObservationRecordV1`
- `EpistemicStatementV1`
- `IntentionRecordV1`
- `ProjectionRecordV1`
- `ConsequenceRecordV1`
- `TypedRelationV1`

`ObservationRecordV1` is situated acquisition. `EpistemicStatementV1` is an
attributed representation grounded in one or more Observations.
`ProjectionRecordV1` is what an Agent actually expresses or attempts in an
Arena; it is not a rendering View. `OrientationAtom` remains readable but is
deprecated because its `epistemicKind` mixes semantic kinds with epistemic
status.

A possible Projection is an affordance or candidate, not yet a
`ProjectionRecordV1`. A proposal becomes a Projection record only when that
proposal is actually expressed into an Arena.

## Scope boundary

This v1 schema is **not** the complete schema for every human-readable `.yawn`
file in the repository. The root [`schemas/`](../schemas/) directory contains
the parallel v1 state-substrate modules and explicitly labeled working drafts.
The relationship is documented in [ADR 0001](../adr/0001-protocol-layers.md).

Provider, model-pricing, and usage receipt definitions currently included in v1
are compatibility surfaces. New provider-specific semantics should use a
namespaced extension while a future RFC separates the provider-neutral core.

## Verify

```bash
npm ci
npm run check
npm pack --dry-run
```

The check regenerates TypeScript, fails on drift, and compiles the package.
