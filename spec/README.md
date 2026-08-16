# YAWN specification

Status: **Working Draft 0.2**
Last updated: 2026-08-13

This directory is the human-readable specification for `.yawn`: an open
protocol for inspectable orientation and agency.

The specification is intentionally smaller than reality. It defines a shared
language for recording how an agent encounters a situation, identifies what is
missing, acts within authority, observes consequences, and updates the record.
It does not claim that the record is the world.

## Protocol layers

| Layer | Purpose | Current authority |
| --- | --- | --- |
| Constitution | Stable agency and state invariants | [`@yawn/contracts` v1](../contracts/) |
| State substrate | State, evidence, target, transition, and event records | [`schemas/*.v1.schema.json`](../schemas/) |
| Observation record | Accepted source-backed Observation, generic event/proof subject, and View preference | [`observation.v1`](../schemas/observation.v1.schema.json) |
| Agency holarchy | Arena, Yawn, relation, turn, routing, and structural change | [Draft 0.2 schema](../schemas/agency-holarchy.v0.2.schema.json) |
| Human document | Portable orientation written in `.yawn` | Existing templates; unified document schema is planned |
| View | Arena, timeline, filesystem, memory, and proof/replay renderings | Informative only |

The v1 contracts are not silently redefined by this draft. Draft 0.2 is an
additive candidate for a future unified protocol. Where prose and an executable
schema disagree, treat that as a lacuna and open an issue; do not invent a
silent reconciliation.

## Normative core

The words **MUST**, **MUST NOT**, **SHOULD**, and **MAY** are used as described
by [RFC 2119](https://www.rfc-editor.org/rfc/rfc2119) only where a requirement
can be tested.

1. A record MUST distinguish observations, reports, inferences, assumptions,
   predictions, disputes, and unknowns.
2. An AI-generated interpretation or action MUST remain a proposal until an
   authorized human or governance process accepts it.
3. A move MUST NOT authorize itself or declare its own success.
4. Canonical state MUST change only through authorized, append-only events.
5. Permissions MUST be explicit states. Confidence MUST NOT stand in for
   permission.
6. Privacy and egress constraints MUST be checked before candidate moves are
   ranked.
7. A Yawn MUST preserve source attribution, uncertainty, authority, and proof
   through replay and structural change.
8. A View MAY change inclusion, layout, or salience. It MUST NOT change
   truth status, permission, identity, or canonical history.
9. Every merge, split, or reparent operation MUST begin as a proposal and, when
   accepted, produce an authorized receipt that preserves provenance.
10. The world MUST NOT be serialized as if the model exhausts reality.

## Read the specification

- [Ontology](ontology.md): the concepts and their boundaries
- [Holarchy](holarchy.md): containment, lateral relations, and inheritance
- [Turns](turns.md): causal episodes, waiting, handoff, and replay
- [Routing](routing.md): attach, create, link, merge, split, and hold
- [Nine questions](questions.md): the human orientation projection
- [Serialization](serialization.md): identifiers, extensions, time, and hashes
- [Observation schema](../schemas/observation.v1.schema.json): source-backed state valid before Yawn promotion

## Maturity labels

- **Stable**: compatibility is declared and changes require migration guidance.
- **Draft**: usable for experiments; names and shapes may change through an RFC.
- **Informative**: explains or projects the protocol but is not canonical state.
- **Historical**: preserved for provenance and may use earlier language.

The project is maintainer-led and open to evidence-backed revision. Clear
boundaries are a form of authority; naming what remains uncertain is a form of
humility.
