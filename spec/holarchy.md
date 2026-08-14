# Holarchy

Status: **Working Draft 0.2**

A holarchy is a graph of wholes that can also participate as parts of larger
wholes. In YAWN, the holarchy organizes independently meaningful orientation
contracts without pretending that every relationship is containment.

## Backbone and lateral graph

Each Yawn MAY have one `primary_parent_id`. The resulting containment backbone
MUST be acyclic. This gives navigation, authority inheritance, proof roll-up,
and lifecycle operations one unambiguous path.

Relationships that are not containment use typed lateral links:

| Relation | Meaning |
| --- | --- |
| `overlaps` | Shares material arena, state, or evidence; neither contains the other |
| `depends_on` | Cannot complete or be evaluated without another contract |
| `supports` | Supplies evidence, capability, or progress |
| `conflicts_with` | Contains a material incompatibility requiring resolution |
| `supersedes` | Replaces another contract while preserving its identity trail |
| `same_as` | Verified identity equivalence, not merely similarity |

Links carry provenance, confidence, effective time, and the authority under
which they were accepted. `same_as` requires stronger proof than `overlaps`.

## What parent and child mean

A child is not “something similar” or “something nearby.” It is an
independently inspectable sub-contract whose proof advances or protects the
parent contract. A parent is a real coordinating contract with its own state,
lacuna, boundary, authority, and proof—not a decorative folder.

A child:

- can be understood and completed independently;
- has a narrower arena, authority scope, or proof obligation;
- preserves the source and context inherited from its parent;
- cannot silently widen inherited permissions; and
- reports relevant state and proof upward without exposing private content that
  the parent is not authorized to receive.

## Inheritance

Inheritance is explicit and field-specific. Implementations MUST NOT infer that
all parent context is visible to a child or that all child detail is visible to
a parent.

- Authority can narrow automatically; widening requires an explicit grant.
- Privacy and egress constraints inherit unless explicitly made stricter.
- Sources remain attributed across every structural operation.
- Targets, beliefs, and confidence do not automatically inherit.
- Proof may roll up only when the parent declares how child proof satisfies a
  parent condition.

## Arenas and nested agent arenas

Arenas may nest when a narrower relevance boundary is useful, and the same
agent may participate in several arenas at once. The primary-parent Yawn tree
does not need to mirror arena nesting exactly. One arena is situational; one
Yawn is contractual. A routing receipt explains why the two structures align
or differ.

## Structural changes

`create`, `attach`, `reparent`, `merge`, and `split` are governance operations,
not file conveniences. Each begins as a proposal. If accepted, an append-only
receipt records:

- the before and after identities;
- the proposing and authorizing agents;
- the rationale and evidence;
- authority, privacy, and proof checks;
- preserved aliases and redirects;
- conflicts or information that could not be reconciled;
- affected descendants and lateral links; and
- a replayable event set.

A merge chooses a canonical survivor and preserves aliases, provenance, and
disagreement. A split records a partition rationale, shared evidence, and the
new proof boundary of each child. Neither operation erases the source records.

## Projection positions do not create structure

Spiral radius, angle, color, overlay position, and animation are presentation
fields. They MUST NOT create parentage, relationship activation, authority, or
identity. A deterministic projection preserves canonical node IDs and typed
edges; canonical structure continues to come from accepted graph events.

## No orphans

Every canonical Yawn has a reachable place in its Yawn space: a primary parent
or an explicit root. New material that is not yet safe to place is held as a
routing proposal, not silently absorbed. Spatial position, embedding distance,
or naming similarity never determines containment by itself.
