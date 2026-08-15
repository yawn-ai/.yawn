# .yawn

[![Protocol validation](https://github.com/yawn-ai/.yawn/actions/workflows/ci.yml/badge.svg)](https://github.com/yawn-ai/.yawn/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-e8ff03.svg)](LICENSE)
[![Status: working draft](https://img.shields.io/badge/ontology-working%20draft-fd49ac.svg)](docs/project-status.md)

**An open protocol for inspectable orientation and agency.**

A `.yawn` is a holonic record: an inspectable whole in its own right and a
possible part of a larger orientation. It preserves what an attributed agent
could observe, how it oriented, what it intended, what it actually projected
into an arena, what happened, and what evidence justified an update.

It is not a truth machine, a complete model of reality, or permission for an
agent to act.

## The YAWN system

| Part | Role | Boundary |
| --- | --- | --- |
| **`.yawn`** | The portable holonic record and open protocol | Holds sources, distinctions, authority, proof, and replay; it does not execute itself |
| **[YAWN.bot](https://yawn.bot)** | The holonic interface and action agent | Helps a person inspect, choose, communicate, and take authorized action; ungranted action remains a proposal |
| **[YAWN.ai](https://yawn.ai)** | The intelligence and orientation compiler | Processes sources into attributed observations, statements, relations, and proposals; it does not own meaning or approval |

The three surfaces read one canonical record. A page, spiral, timeline, bot
overlay, QR route, or downloaded file is a **view** of that record, never a
second source of truth.

## The constitutional passage

```text
Reality constrains, surprises, and can disconfirm the record.

Arena -> Observation -> Agent -> Orientation -> Choice -> Intention
  -> Projection -> Arena -> Consequence -> Observation' -> Update
```

- **Observation**: what became available to an attributed Agent from within an
  Arena, under stated conditions and limits.
- **Orientation**: the Agent's revisable working model of what is happening,
  what matters, and what remains missing.
- **Intention**: the Agent's presently selected or endorsed direction—what it
  means to understand, communicate, preserve, test, repair, change, or do.
- **Projection**: what the Agent actually expresses, represents, proposes,
  commits, or attempts back into the Arena.
- **Consequence**: what the Arena and reality return, whether or not it matches
  the intention, prediction, or projection.

Intention and Projection never collapse. What an Agent meant can differ from
what it expressed, what another Agent observed, how that Agent interpreted it,
and what happened. YAWN keeps those differences inspectable.

Every Move is a Projection. Not every Projection is a Move: a question, claim,
model, communication, or proposal may be expressed without becoming a selected
attempt to change state.

“Possible Projections” are affordances or candidates. They become Projection
records only when an Agent actually expresses or attempts one in the Arena.

The compact operational loop remains:

```text
signal -> orientation -> choice -> move -> proof -> update
```

It is the stable replay and coordination view of the fuller passage. Signal
admits observation material; Move is the action-bearing subset of Projection;
Proof evaluates consequences; Update revises the record.

## A small `.yawn`

```yaml
document_style: human-authored-yawn
yawn_id: yawn:release-boundary
arena_ref: arena:project-release

observations:
  - id: observation:plan-reopened
    observer_ref: actor:dave
    arena_ref: arena:project-release
    acquired_at: 2026-08-14T12:00:00Z
    source_refs: [source:planning-note]
    conditions: ["Reviewing the release plan"]
    limits: ["No production telemetry was consulted"]

statements:
  - id: statement:release-scope
    about_refs: [yawn:release-boundary]
    asserted_by: actor:dave
    epistemic_status: reported
    text: "Several useful changes are mixed into one undefined release."
    grounded_in_observation_refs: [observation:plan-reopened]

orientation:
  summary: "The blocker may be an unclear proof boundary, not lack of effort."
  lacuna: "Which changes must ship together for the release to be coherent?"

choice:
  selected_intention_ref: intention:define-release

intentions:
  - id: intention:define-release
    held_by: actor:dave
    direction: "Define the smallest coherent, independently testable release."
    status: endorsed

projections:
  - id: projection:release-checklist
    projected_by: actor:dave
    intention_ref: intention:define-release
    arena_ref: arena:project-release
    kind: proposal
    content_ref: artifact:release-checklist-draft
    move_ref: null

consequences: []
proof_receipts: []
```

Unknown is valid. Waiting is valid. A Yawn can remain open with no endorsed
Intention, Projection, Target, or Move. Skipped context becomes a lacuna rather
than invented certainty.

## The holonic structure

```text
Agent Space
  -> Arena
      -> Yawn
          -> observations and attributed statements
          -> orientation, value / goal / lacuna, and choice
          -> intentions and projections
          -> consequences, proof, and updates
          -> child Yawns and typed lateral relations
```

An **Agent Space** is the private or shared root in which an Agent's authority
and records are resolved. An **Arena** is a provisional, purpose-framed slice
of the world. A **Yawn** is a durable orientation episode inside an Arena. A
child Yawn must be independently inspectable; topical similarity alone does
not create parenthood.

The upper ontology stays deliberately small. Topics, timestamps, artifacts,
spatial arrangements, and interface layouts are facets or views—not structural
parents.

[Ontology definitions ->](spec/ontology.md) ·
[Holarchy ->](spec/holarchy.md) ·
[Routing ->](spec/routing.md) ·
[View boundary ->](docs/views/README.md)

## Non-negotiable distinctions

- observation acquisition is distinct from a statement about what was
  observed;
- observed, reported, inferred, assumed, predicted, disputed, and unknown stay
  distinct;
- a model's inference is attributed to the model run, even when it cites a
  human source;
- confidence is not truth, importance, consensus, freshness, or permission;
- desire is directional evidence, not an automatically ratified Target;
- Intention is not Projection; Projection is not Consequence;
- a Move does not prove itself;
- no AI proposal becomes canonical without rightful approval;
- child authority is never broader than parent authority plus an explicit
  grant;
- canonical history is append-only and replayable; and
- views can change presentation, never identity, authority, proof, or event
  truth.

## Build and validate

Requires Node.js 22 or a current Node.js LTS release.

```bash
git clone https://github.com/yawn-ai/.yawn.git yawn-protocol
cd yawn-protocol
npm ci
npm test

cd contracts
npm ci
npm run check
```

The repository separates stable modules from working drafts:

- [`@yawn/contracts`](contracts/) contains versioned constitutional and runtime
  contracts;
- [`schemas/*.v1`](schemas/) contains executable protocol modules;
- Agency Holarchy 0.2 remains an experimental aggregate; and
- RFCs remain proposals until an authorized decision and implementation receipt
  say otherwise.

## Start here

| Goal | Entry point |
| --- | --- |
| Understand the public constitution | [`orientation-framework-v1.yawn`](orientation-framework-v1.yawn) |
| Write one useful record | [Five-minute quickstart](docs/quickstart.md) |
| Inspect the passage contract | [Orientation Passage V1](schemas/orientation-passage.v1.schema.json) |
| Build an implementation | [Specification](spec/) and [schemas](schemas/) |
| See nested agency | [Nested Agent Arena](examples/nested-agent-arena.yawn) |
| Import a conversation archive | [Conversation routing](examples/conversation-import-routing.yawn) |
| Render a public-safe coordinate | [Public View V1](schemas/public-view.v1.schema.json) |
| Understand evidence limits | [Research basis](docs/research-basis.md) |
| Navigate the repository | [Documentation hub](docs/) |

## Status and contribution

YAWN is experimental. The grammar should earn stability through use,
criticism, migration evidence, and independent implementations. Humans and
AI-assisted contributors are welcome; disclose material AI use, preserve source
rights, and bring proof with protocol changes.

[Contributing](CONTRIBUTING.md) · [Roadmap](ROADMAP.md) ·
[Governance](GOVERNANCE.md) · [Security](SECURITY.md) ·
[Code of conduct](CODE_OF_CONDUCT.md) · [Changelog](CHANGELOG.md)

> **Automate the burden. Preserve the authorship. Return the time.**
