# ADR 0003: Give relationships stable identity; make slashes Views

- Status: Proposed
- Date: 2026-09-30
- Decision owners: Dave
- Related: `core/relationship.yawn`, `core/participation.yawn`, `core/relation-address.yawn`, `schemas/relationship.v0.1.schema.json`

## Context

The protocol describes relationship as structurally first, but its machine-facing
surfaces split that idea across a Yawn-to-Yawn structural `Relation`, an
execution-delegate relationship, an interpersonal partner template, Arena
participants, and a slash described as the relationship record. None can
represent an arbitrary, durable relationship among people, agents, institutions,
concepts, source corpora, or artifacts without overloading a narrower object.

That overload risks treating a route as identity, a source author as a live
participant, a coupling channel as permission, or a visual hierarchy as
containment.

## Decision

Add a generic, versioned **Relationship** record with independent identity. It
holds participating referents, participation records, purpose, coupling,
boundaries, policy references, links to claims and events, revision, and
allowed Views.

Add **Participation** as a reusable, time-indexed record. It separates an
addressable referent from its current role, standpoint, presence, and access.

Add **Relation Address** as a directional View over typed steps. Slash syntax
opens or traverses that address; it is not the relationship record. Only an
explicit `primary_parent` step establishes semantic parentage.

Retain the Agency Holarchy `Relation` as a named **Structural Relation**: a
Yawn-to-Yawn lateral edge. Retain execution relationships and interpersonal
templates as specialized profiles; neither becomes the universal primitive.

## Consequences

- A shared Dave/Jaime relationship can have directional private or shared Views
  without becoming two unrelated relationship records.
- Dave/Christianity can represent a person-to-tradition relation without
  inferring religious identity or treating historical voices as live
  participants.
- Policies and authority stay narrow: technical coupling can exist even when
  an effect is prohibited.
- Old path-shaped records remain readable. A migration records the corrected
  active semantics without rewriting historical wording.

## Rejected alternatives

### Treat every slash as parentage or the relationship itself

Rejected because a route cannot preserve history, role, direction, source,
time, consent, authority, or trajectory.

### Expand the interpersonal template into a universal schema

Rejected because partner-specific fields and review conventions do not model
institutions, concepts, source corpora, or multi-party relationships.

### Overload Agency Holarchy `Relation`

Rejected because it is deliberately a non-parent edge between Yawns and must
remain usable for structural graph semantics.

## Validation

The relationship-core fixture and tests must demonstrate a stable relationship
identity, distinct participation, a non-parent slash traversal, source-only
historical voices, preserved private boundaries, and source-bound supersession
of an inference.
