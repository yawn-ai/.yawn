# Repository map

The repository records its own evolution, but the active tree now uses one
product name and one human-readable record extension. Historical source remains
available through immutable Git commits and explicit migration receipts rather
than through a second live schema layer.

## Active protocol surface

```text
README.md / index.html     public doors
spec/                      human-readable specification
contracts/                 stable v1 constitution/runtime package
schemas/                   state modules and labeled protocol drafts
core/                      concept records and lexical invariants
templates/                 authoring surfaces
examples/ + fixtures/      explanatory and executable evidence
docs/                      guides, status, projections, research boundary
interface/ + q-space/      presentation contracts and projections
rfcs/ + adr/               proposed and accepted change rationale
migrations/                source-preserving structural receipts
```

## Retired numbered generation

The former numbered `00-start` through `08-research` directories were a
pre-canonical generation. They were removed from the active tree on
2026-08-17 after their surviving claims had already been restated across the
named `.yawn`, specification, schema, record, and automation layers.

The removal is **semantic absorption**, not history erasure:

- the immutable source commit remains readable;
- every retired path is listed in
  [`migrations/2026-08-17-canonical-extension.yawn`](../migrations/2026-08-17-canonical-extension.yawn);
- each path maps to its current canonical target or targets;
- no historical claim becomes current merely because its filename changes; and
- a missing historical detail must be deliberately restated and proved in a
  current `.yawn` record before reuse.

# yawn-invalid-alias-guard:start
The product is **YAWN** and the only YAWN record extension is **`.yawn`**.
`.ion` and `.yon` are invalid schema aliases and common speech-to-text/model
transcription errors. They are not compatibility formats or alternate
ontologies.
# yawn-invalid-alias-guard:end

The context-gated normalization and ambiguity rules live in
[`core/canonical-extension.yawn`](../core/canonical-extension.yawn). The raw
transcript is preserved when correction provenance matters. Similar ordinary
language—such as a chemical term or an actual personal name—is not rewritten
without established YAWN context.

`records/` preserves operational receipts and ledgers. Historical records may
contain environment-specific paths or old terminology. Do not copy those paths
into new active contracts; treat them as attributed evidence from their time.
Some earlier named `automation/`, `agents/`, and reference files also retain
such paths for compatibility. They are a known migration lacuna, not a portable
runtime configuration.

## Naming and canonicality

- `README.md` is the human front door.
- `readme.yawn` is the root orientation record, not a source from which the
  Markdown README is mechanically generated.
- `yawn.yawn` is the machine-addressable repository manifest.
- `core/canonical-extension.yawn` is the naming and speech-normalization
  invariant.
- Executable schemas are canonical only for the version and kind named in their
  `$id`; there is not yet one schema for every `.yawn` file.
- A projection is never canonical state.
- A path locates a portable file or View; stable IDs and typed relations carry
  semantic identity.

This replaces both the earlier “canonical source / mirror” wording and the
numbered historical bridge as a live repository layer.

## Planned convergence

The intended destination is:

```text
spec/ normative intent
  -> schemas/ executable serialization
    -> generated reference and types
      -> templates/examples conformance evidence
        -> projections and products
```

The convergence happens through compatible RFCs and migration receipts, not
through silent rewriting or deletion of provenance.
