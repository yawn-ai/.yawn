# RFC 0002: Recursive observation

Status: **Proposed**

## Summary

YAWN may record that an attributed Agent acquired material from a canonical
Yawn, statement, prior Observation, relationship, Projection, Consequence,
proof receipt, source, or View without overwriting the thing observed.

Observation is a situated acquisition event. A statement describing or
interpreting the acquisition is a different attributed record.

## Current state and lacuna

Working Draft 0.2 embeds `EpistemicStatement` records in a field snapshot but
does not provide a first-class acquisition object. The first public draft also
treated an Observation as a statement. That collapses what became available
with what an Agent later said it meant, and it can wrongly assign a model's
inference to the human it cites.

## Proposed semantics and invariants

An Observation has a stable ID, observer, Arena, acquisition time and method,
source coordinates, conditions, limits, and one or more typed `observes`
references:

```yaml
id: observation:yawn-bot:being-40:statement
observer_id: agent:yawn-bot
arena_id: arena:dave:public-orientation
acquired_at: "2026-08-13T00:00:01Z"
acquisition_method: file_read
observes:
  - kind: statement
    id: statement:dave:being-40:present
source_refs:
  - source:dave:being-40-public
conditions:
  - The public-safe statement was available to the overlay.
limits:
  - The overlay cannot infer Dave's complete private state.
```

A separate statement can then interpret that Observation:

```yaml
id: statement:yawn-bot:being-40:open-loop
asserted_by: agent:yawn-bot
epistemic_status: inferred
grounded_in_observation_refs:
  - observation:yawn-bot:being-40:statement
```

Allowed observed target kinds include Yawn, Observation, statement,
relationship, Intention, Projection, Consequence, View, proof receipt, and
source. Implementations MUST preserve target kind and ID, MUST append a new
record for a revision, and MUST NOT treat recursion depth as authority,
confidence, truth, or consciousness.

## Authority, privacy, and safety

Observation never widens visibility or effect authority. A public View can
include an Observation only when the observer, target, source metadata,
conditions, limits, and any related statement are each permitted for that
View. Redaction produces a public-safe View with a redaction receipt; it does
not mutate the private record.

Representing a software observer is operational provenance, not a claim of
conscious experience.

## Compatibility and migration

Existing records that combine `observer`, `statement`, and `epistemic_status`
split into:

1. an acquisition `ObservationRecord`; and
2. an attributed `EpistemicStatement` grounded in that Observation.

The original observer remains the acquisition actor. The statement's
`asserted_by` is the Agent that produced the representation. Ambiguous records
remain proposals and are not silently migrated.

## Conformance

`orientation-passage.v1` and `public-view.v1` demonstrate acquisition/statement
separation, typed recursive references, local resolution, source coordinates,
model attribution, and redaction.

## Falsifiers and decision

This proposal should be revised if acquisition and interpretation cannot be
replayed separately, or if a public View requires a private source body to
establish identity. Acceptance requires an authenticated authorized decision
and separate receipt.
