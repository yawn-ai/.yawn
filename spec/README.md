# YAWN specification

Status: **Working Draft 0.2**
Last updated: 2026-08-28

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
| Observation proposals | Source-bound open Question, Art Brief, local candidate, and attributed Projection feedback | [`question-proposal.v1`](../schemas/question-proposal.v1.schema.json) and related v1 schemas |
| Delegated execution | Owner/delegate relationship, exact effect signatures, reusable policy proposals, reconciliation batches, and consequence receipts | [`execution-relationship.v1`](../schemas/execution-relationship.v1.schema.json) and related v1 schemas |
| Agency holarchy | Arena, Yawn, relation, turn, routing, and structural change | [Draft 0.2 schema](../schemas/agency-holarchy.v0.2.schema.json) |
| Objective holons | Detection, objective-only ratification, optional Yawn promotion, sleeping-bot binding, and resolved activation | [Draft 0.1 schema](../schemas/objective-holon.v0.1.schema.json) |
| Orientation map | Nine-axis semantic coverage, adaptive inquiry ranking, closed selection receipts, and presentation hypotheses | [Draft 0.1 schema](../schemas/orientation-map.v0.1.schema.json) |
| Interaction operator receipt | Document-local, non-authoritative review and question-response dispositions; application requires external resolution | [Draft 0.1 schema](../schemas/interaction-operator-receipt.v0.1.schema.json) |
| Protocol release/profile identity | Content-addressed module set and closed product conformance profiles | [Manifest Draft 0.1](../protocol-manifest.v0.1.json) |
| Human document | Portable orientation written in `.yawn` | Existing templates; unified document schema is planned |
| View | Arena, timeline, filesystem, memory, and proof/replay renderings | Informative only |

The v1 contracts are not silently redefined by these drafts. Agency Holarchy
0.2, Objective Holon 0.1, and Orientation Map 0.1 are additive candidates for a
future unified protocol. Where prose and an executable schema disagree, treat
that as a lacuna and open an issue; do not invent a silent reconciliation.
Objective Holon artifacts prove document grammar and local lifecycle coherence,
not resolution of externally governed Yawns, grants, policies, or authority.
Materialization conformance therefore remains unavailable until an aggregate
cross-document resolver can fail closed on those references.

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
11. Detection MUST NOT become a ratified objective, and objective ratification
    MUST NOT become bot activation or effect authority, by inference.
12. Question order, wording, and medium MUST NOT alter semantic orientation or
    suppress safety, authority, privacy, provenance, or proof.

## Read the specification

- [Ontology](ontology.md): the concepts and their boundaries
- [Holarchy](holarchy.md): containment, lateral relations, and inheritance
- [Turns](turns.md): causal episodes, waiting, handoff, and replay
- [Routing](routing.md): attach, create, link, merge, split, and hold
- [Objective holons](objective-holons.md): compile, ratify, bind, activate, and spawn
- [Nine questions](questions.md): the human orientation projection
- [Serialization](serialization.md): identifiers, extensions, time, and hashes
- [Observation schema](../schemas/observation.v1.schema.json): source-backed state valid before Yawn promotion
- [Delegated execution](../schemas/execution-relationship.v1.schema.json): revocable owner authority that cannot be self-granted by an agent or model output
- [Question/art template](../templates/observation-question-art.yawn): proposal-only chain with explicit render and publication boundaries

## Maturity labels

- **Stable**: compatibility is declared and changes require migration guidance.
- **Draft**: usable for experiments; names and shapes may change through an RFC.
- **Informative**: explains or projects the protocol but is not canonical state.
- **Historical**: preserved for provenance and may use earlier language.

The project is maintainer-led and open to evidence-backed revision. Clear
boundaries are a form of authority; naming what remains uncertain is a form of
humility.
