# RFC 0002: Recursive observation

Status: **Proposed**

## Summary

YAWN may record an observation about a canonical Yawn, another observation, a
relationship, or a public projection without overwriting the thing observed.
The observation remains an attributed claim with its own epistemic status,
source, time, visibility, and observer.

## Current state and lacuna

Working Draft 0.2 already separates claims from state, but it does not specify
how an observation can refer to another observation or to a projection. Without
typed references, an interface can accidentally turn commentary into canonical
state or build an untraceable second graph.

## Proposed semantics and invariants

An observation has a stable ID and exactly one typed `observes` reference:

```yaml
id: observation:dave:being-40:present
observes:
  kind: yawn
  id: yawn:dave:being-40
observer: principal:dave
epistemic_status: observed
asserted_at: "2026-08-13T00:00:00Z"
source_refs:
  - source:dave:being-40
```

Allowed target kinds are `yawn`, `observation`, `relationship`, `projection`,
`proof_receipt`, and `source`. Implementations MUST preserve the target ID and
kind, MUST append a new record for a revision, and MUST NOT treat observation
depth as authority, confidence, truth, or consciousness.

Recursive observation is a traceability mechanism. It makes no metaphysical
claim about an observer and does not imply that a software agent experiences
what it represents.

## Authority, privacy, and safety

Observation never widens visibility or effect authority. A projection can
include an observation only when the observer, target, sources, and statement
are all permitted for that projection. Redaction creates a new public-safe
projection record and preserves a non-public provenance reference.

## Compatibility and migration

Existing observations can be migrated by assigning `observes.kind: yawn` when
their current Yawn reference is unambiguous. Ambiguous records remain proposals.

## Conformance

The public projection schema and fixtures introduced with this RFC demonstrate
typed references, local reference resolution, attribution, and redaction.

## Falsifiers and decision

This proposal should be revised if typed references cannot preserve replay or
if a public projection requires private source bodies to establish identity.
Acceptance requires authenticated Dave approval and a separate receipt.
