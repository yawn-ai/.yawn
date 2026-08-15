# Repository map

The repository contains multiple generations because the project records its
own evolution. This page says which layer to use without deleting that history.

## Active protocol surface

```text
README.md / index.html     public doors
spec/                      human-readable specification
contracts/                 stable v1 constitution/runtime package
schemas/                   state modules and labeled protocol drafts
core/                      concept records
templates/                 authoring surfaces
examples/ + fixtures/      explanatory and executable evidence
docs/                      guides, status, Views, research boundary
interface/ + q-space/      interface contracts and views
rfcs/ + adr/               proposed and accepted change rationale
```

## Historical bridge

The numbered `00-start` through `08-research` directories preserve the `.ion`
generation and the evidence locks that preceded the named `.yawn` tree. They
are historical inputs, not a second current specification. Links may remain for
provenance. New normative work goes into `spec/`, versioned schemas, RFCs, and
tests.

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
- Executable schemas are canonical only for the version and kind named in their
  `$id`; there is not yet one schema for every `.yawn` file.
- A View is never canonical state.

This replaces the earlier “canonical source / mirror” wording, which implied a
generation guarantee that did not exist.

## Planned convergence

The intended destination is:

```text
spec/ normative intent
  -> schemas/ executable serialization
    -> generated reference and types
      -> templates/examples conformance evidence
        -> Views and products
```

The convergence will happen through compatible RFCs and migration receipts,
not a mass rename or history deletion.
