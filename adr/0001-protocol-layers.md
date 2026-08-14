# ADR 0001: Protocol layers and compatibility

- Status: proposed
- Date: 2026-08-13
- Decision authority: founding maintainer acceptance required

## Context

The repository has a stable `@yawn/contracts` v1 package, a parallel set of v1
state-substrate schemas, and older human-readable `.yawn` templates. They
represent complementary concerns but do not validate one another. Calling any
one of them “the complete `.yawn` schema” would be inaccurate.

## Decision

Preserve both v1 modules. Identify each schema by version and kind. Add the
Agency Holarchy as an explicitly experimental module in the existing root
`schemas/` directory. Describe the intended aggregate protocol through the
human specification, fixtures, and tests while a future RFC defines unification.

`README.md` is the human landing page. `readme.yawn` is a dogfooded orientation
record, not its canonical source. `yawn.yawn` is the repository manifest.

## Consequences

- Existing v1 consumers are not silently broken.
- The hub can explain one ontology without falsely promising one serialization.
- Builders must choose the module and version they implement.
- A future unification requires migration and compatibility evidence.

## Alternatives

Replacing either v1 module, adding an unmarked third canonical schema root, or
continuing the canonical/mirror ambiguity were rejected because each would hide
meaningful incompatibility.
