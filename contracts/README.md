# @yawn/contracts

Stable v1 constitutional and runtime contracts for the YAWN loop:

`signal → orientation → choice → move → proof → update`

`schemas/yawn-contracts-v1.schema.json` is the source for this package.
`src/generated.ts` is generated with `npm run generate`; do not edit it by hand.

This package defines the constitution, Agent Space, Arena identity, Yawn state,
source atoms, change proposals, grants, budgets, events, and proof receipts used
by current runtimes. Canonical events remain attributable and replayable. Model
output remains a proposal until an authenticated authority grant accepts it.
Observation-derived Question, Art Brief, local candidate, and attributed
View-feedback types preserve the same proposal boundary around an exact
Observation hash.

## Scope boundary

This v1 schema is **not** the complete schema for every human-readable `.yawn`
file in the repository. The root [`schemas/`](../schemas/) directory contains
the parallel v1 state-substrate modules and explicitly labeled working drafts.
The relationship is documented in [ADR 0001](../adr/0001-protocol-layers.md).

Provider, model-pricing, and usage receipt definitions currently included in v1
are compatibility surfaces. New provider-specific semantics should use a
namespaced extension while a future RFC separates the provider-neutral core.
Provider response schemas are generated compatibility Views: refusal or
incomplete output, run receipts, eval cases, and human decisions remain outside
the semantic record and must never be inferred from a successful parse.

## Verify

```bash
npm ci
npm run check
npm pack --dry-run
```

The check regenerates TypeScript, fails on drift, and compiles the package.
