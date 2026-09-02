# ADR 0004: Separate slash addressing from semantic relation and parentage

- Status: Proposed
- Date: 2026-09-02
- Decision owners: Dave
- Related: `core/RELATIONSHIP_FIRST_AGENT_ARENA.yawn`,
  `core/open-relation-port.yawn`, `core/relation-address.yawn`,
  `core/relational-observation.yawn`

## Context

YAWN already held two claims:

1. `A/B` is a relationship projection rather than automatic containment.
2. The product breadcrumb treated every accumulated path prefix as ancestry.

Those claims are incompatible when a route such as
`yawn.bot/dave/observation` means “Dave's model of Observation” rather than
“Observation is a child contained inside Dave.”

The ontology also described Relationship as a first-class changing field while
the executable holarchy relation represented only a narrow Yawn-to-Yawn edge.
The interface then attempted to reconstruct missing relational meaning from
path order.

## Decision

Introduce three additive working-draft primitives:

- **Open Relation Port** — an anchored, intentionally unbound foreground state,
  rendered as a trailing slash such as `Dave/`.
- **Relation Address** — a directional View over explicit typed relation steps.
- **Relational Observation** — an Observation that preserves observer and
  observed roles, relationship, Arena, standpoint, access, mediation, limits,
  observer contribution, and source-independence class.

The slash glyph remains a compact interface handle. It is not the relation
record itself.

Only `relation_type: primary_parent` may set
`semantic_parentage: true`. Path prefixes alone cannot establish containment,
identity, consent, agreement, truth, or authority.

## Consequences

- Existing URLs remain usable as addresses.
- Breadcrumbs must eventually read a relation manifest instead of assuming
  ancestry from every prefix.
- Inverse paths are explicit Views, not automatic reversals of obligation,
  authority, consent, or causation.
- `Dave/` can represent return to open foreground orientation without claiming
  pure consciousness or completion of every unresolved relationship.
- Observer and observed become episode-relative roles; one self-observing person
  is not duplicated into two Agents.
- Model comparison can inspect differences in Question, Position, source,
  standpoint, role, criterion, and value without forcing consensus.

## Rejected alternatives

### Treat every slash as parent–child

Rejected because it misrepresents relationship, concept, audience, View, and
resource paths as containment.

### Treat the slash as the relationship itself

Rejected because a glyph or URL segment cannot preserve history, roles,
direction, source, time, authority, consent, or trajectory.

### Treat the open slash as pure Observation or consciousness

Rejected because a stored View cannot establish prereflective awareness or a
final metaphysics. The port is an operational open-state representation.

### Create a separate observer Agent for every reflection

Rejected because role differentiation does not require identity multiplication.

## Validation

The conformance fixture must prove:

- an open address has no relation steps and uses
  `targetAbsence: intentional_unbound`;
- a `holds_model_of` slash step has `semanticParentage: false`;
- a false parentage cast fails schema validation;
- self-observation is not independent corroboration;
- no Relation Address grants consent, identity, authority, or canonical
  mutation.
