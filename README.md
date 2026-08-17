# .yawn

[![License: MIT](https://img.shields.io/badge/license-MIT-e8ff03.svg)](LICENSE)
[![Status: working draft](https://img.shields.io/badge/ontology-working%20draft-fd49ac.svg)](docs/project-status.md)

**An open protocol for inspectable orientation and agency.**

`.yawn` gives human and AI agents a portable way to show what they noticed,
what they inferred, what remains missing, what they were authorized to do, what
happened, and what evidence changed the state.

It is not a truth machine, a theory that reality is code, or permission for an
agent to act. It is an accountable orientation toward part of a world no model
fully contains.

| Part | Role |
| --- | --- |
| [`.yawn`](https://github.com/yawn-ai/.yawn) | The holonic record: portable source, state, authority, proof, and revision contracts. |
| [YAWN.bot](https://yawn.bot) | The holonic interface and action agent: where a person observes, chooses, approves, and coordinates moves. |
| [YAWN.ai](https://yawn.ai) | The intelligence: it observes and processes records, preserves inference as proposal, and helps the system orient. |

They are three roles around one record grammar, not three competing stores.
The record can exist without either website; neither website may
silently change its meaning or authority.

> **Automate the burden. Preserve the authorship. Return the time.**

[Explore the ontology hub](https://yawn-ai.github.io/.yawn/) ·
[Read the specification](spec/) ·
[Write your first Yawn](docs/quickstart.md) ·
[See nested Agent Arena](examples/nested-agent-arena.yawn)

## One name, one extension

<!-- yawn-invalid-alias-guard:start -->
The product is **YAWN** and the only YAWN record extension is **`.yawn`**.
`.ion` and `.yon` are invalid aliases commonly introduced by speech-to-text or
model transcription. They are not alternate formats, schemas, products, or
compatibility layers.
<!-- yawn-invalid-alias-guard:end -->

In an already-established YAWN context, implementations normalize those
substitutions **before** creating a path, ID, schema, or record. When the
referent could genuinely be something else—such as a chemical term or a
person's name—the system preserves the raw words and asks or flags the
ambiguity. A correction never changes semantic identity or grants authority.

[Canonical naming contract →](core/canonical-extension.yawn) ·
[Migration receipt →](migrations/2026-08-17-canonical-extension.yawn)

## Start with Observation

Observation is the cleanest entry into the ontology: what became available to
an attributed Agent from an Arena, under stated conditions and limits. It is
valid before a Target, Intention, Projection, Move, or Yawn exists.

An accepted Observation remains its own record. Attaching it to a Yawn does not
make it a child Yawn, and promotion creates a distinct Yawn through a separate
human-approved lifecycle. What was observed and what an Agent inferred must
never be collapsed.

[Observation schema](schemas/observation.v1.schema.json) ·
[Delegated execution](schemas/execution-relationship.v1.schema.json) ·
[Observation template](templates/observation.yawn) ·
[Observation View contract](interface/yawn-observation-view-v1.yawn) ·
[Question and local-art chain](interface/local-observation-art-v0.1.yawn)

The proposed [one-question inquiry aperture](rfcs/0002-inquiry-aperture-one-question-face.md)
keeps this record network behind one situated Question instead of exposing an
ontology dashboard as the primary experience.

An open question may be organized from `remainsOpen` without rewriting its
verbatim source. A visual brief and local image can then be proposed around
that question while the question stays accessible live text. The brief,
candidate, and serialized page are not new truth: acceptance, rendering,
publication, preference updates, and Yawn promotion each keep separate
authority.

## The loop

```text
signal → orientation → choice → move → proof → update
```

YAWN exists because agents act from inferences they often cannot see. The loop
makes those inferences inspectable before action and makes consequences
replayable afterward.

State is the substrate. Desire is attributed directional evidence. Targets are
optional and scoped. Moves attempt change; proof evaluates outcomes; authorized
events rematerialize state.

## A small `.yawn`

```yaml
title: "The next release still feels unclear"

signal: "I keep reopening the plan without choosing a release boundary."
current: "Several useful changes are mixed into one undefined release."

inference: "The blocker may be an unclear proof boundary, not lack of effort."
epistemic_status: inferred

lacuna: "Which changes must ship together for the release to be coherent?"

boundary:
  - "Do not publish private user data."
  - "Do not call a draft stable."

move: "List the smallest independently testable release slice."
proof: "Every included change has an owner, test, and rollback path."
replay: "Record what changed and what remains open."
```

Unknown is a valid answer. Waiting is a valid state. A move can be deferred.
Skipped context becomes a visible lacuna, not invented certainty.

## The ontology

```text
Reality
  └─ World horizon                 open; exceeds the model
      └─ Field                     information available to an observer
          └─ Arena                 provisional task-relevant slice
              └─ Yawn             durable orientation contract
                  └─ Turn          causal episode: act, wait, delegate, yield
                      └─ Events    attributed occurrences
                          └─ Transition + proof
                              └─ replayed state and a changed horizon
```

World, field, arena, and Yawn are not synonyms. An arena names the agents,
affordances, constraints, authority, resources, exclusions, and open questions
that matter for a purpose. A Yawn holds one live orientation contract inside
that arena. A turn traces how that contract acts—or waits—through causal time.

[Definitions and semantic planes →](spec/ontology.md)

## Interface contracts

YAWN.ai and YAWN.bot share one semantic palette and one compact public-header
grammar while keeping their roles distinct. Public roots stay quiet; richer
View tools appear only through explicit disclosure when the route has a real
canonical object to inspect.

[Brand contract →](interface/yawn-brand-v1.yawn) ·
[Chrome contract →](interface/yawn-chrome-v1.yawn) ·
[Observation View contract →](interface/yawn-observation-view-v1.yawn)

## Nested agency without hidden authority

Yawns form a holarchy: one acyclic primary-parent backbone plus typed lateral
links such as `overlaps`, `depends_on`, `supports`, `conflicts_with`, and
`supersedes`. A child is an independently inspectable sub-contract, not merely a
similar topic or nearby file.

Every create, attach, reparent, merge, or split begins as a proposal. Accepted
changes append an authorized receipt preserving sources, aliases, disputes,
proof conditions, and the before/after state. Embeddings and spatial position
may retrieve candidates; they never determine identity, disclosure, or
permission.

[Holarchy →](spec/holarchy.md) · [Routing →](spec/routing.md)

## Agent Arena and open turns

Agent Arena is the vivid, game-readable view: nested arenas, available moves,
open turns, consequences, and what becomes possible next. It is a projection,
not the source of truth. Arena does not mean combat, and reality does not
literally wait for one global turn clock.

Turns may overlap, nest, wait on external systems, resume, delegate, or hand
off. “Keeping this turn open” means the causal episode is unresolved; execution
may safely sleep while the trace remains open.

[Turn protocol →](spec/turns.md) · [Projection boundary →](docs/projections/README.md)

## The nine orientation questions

Questions are a human projection over the ontology, not nine mandatory database
fields:

1. What is this Yawn about?
2. Where does it belong?
3. Whose perspective is represented, and who is affected?
4. What appears to be happening now?
5. What are you trying to make true, preserve, learn, avoid, repair, coordinate,
   decide, or accept—and why?
6. What is unknown, disputed, constrained, dependent, or in tension?
7. What must be protected, and who may decide or act?
8. What can move next?
9. What would reality have to show for this Yawn to update or close?

Coverage, claim confidence, and routing confidence remain separate. Answering
all nine does not make the answers true or authorize a move.

[Question-to-ontology traceability →](spec/questions.md)

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

The repository currently has two preserved v1 modules:

- [`@yawn/contracts` v1](contracts/): constitutional and runtime contracts;
- [`schemas/*.v1`](schemas/): state, event, desire, target, transition, and
  update modules.

Agency Holarchy 0.2 is an additive working draft covering arenas, Yawns,
relations, turns, routing, and structural receipts. Neither v1 module is
marketed as the complete schema for every human-readable `.yawn` file.

These local commands are the primary proof path. GitHub Actions may run the
same checks as a secondary witness; runner or billing unavailability is not a
test failure and cannot replace a commit-bound local result.

[Protocol layers →](spec/README.md) · [Project status →](docs/project-status.md) ·
[Serialization →](spec/serialization.md)

## Find your path

| If you want to… | Start here |
| --- | --- |
| Record what became available before interpreting it | [Observation template](templates/observation.yawn) |
| Write one useful record | [Five-minute quickstart](docs/quickstart.md) |
| Copy a human template | [Basic](templates/basic.yawn), [Arena](templates/arena.yawn), [Turn](templates/turn.yawn) |
| Build an implementation | [Specification](spec/), [schemas](schemas/), [fixtures](fixtures/) |
| See the holarchy in use | [Nested Agent Arena](examples/nested-agent-arena.yawn) |
| Model an async dependency | [Waiting turn](examples/waiting-turn.yawn) |
| Import a long conversation archive | [Conversation routing](examples/conversation-import-routing.yawn) |
| Generate observation art locally | [Local observation-art contract](interface/local-observation-art-v0.1.yawn) |
| Understand merge vs. link vs. split | [Routing example](examples/merge-split-routing.yawn) |
| Explore unresolved questions | [Q-Space](q-space/) |
| Understand the evidence boundary | [Research basis](docs/research-basis.md) |
| Navigate the whole repository | [Documentation hub](docs/) |

## Status, limits, and intent

YAWN is experimental. We are publishing the grammar early because agents are
becoming more capable faster than their actions are becoming inspectable. The
vocabulary should earn stability through use, criticism, migration evidence,
and independent implementations.

The core invariants are firmer than the draft names:

- observed, reported, inferred, assumed, predicted, disputed, and unknown stay
  distinct;
- confidence is not freshness, importance, consensus, or permission;
- privacy and authority are checked before moves are ranked;
- AI output remains a proposal until rightful approval;
- moves do not prove themselves;
- canonical history is append-only; and
- projections can change the view, never the truth or authority underneath it.

YAWN should carry the mechanical and return meaningful choice to the human. It
should not become a new boss, optimize every free hour, or decide what a life is
for.

## Project and contribution

The repository is MIT licensed and honestly maintainer-led. Humans and
AI-assisted contributors are welcome; disclose material AI use, preserve source
rights, and bring proof with protocol changes.

[Contributing](CONTRIBUTING.md) · [Roadmap](ROADMAP.md) ·
[Governance](GOVERNANCE.md) · [Security](SECURITY.md) ·
[Code of conduct](CODE_OF_CONDUCT.md) · [Changelog](CHANGELOG.md)

The [Declaration of Agency](https://yawn-ai.github.io/.yawn/agency-declaration/)
is a cultural expression of the project's human boundary. The specification is
the narrower engineering contract.

If this work informs research or software, see [`CITATION.cff`](CITATION.cff)
and cite the version or commit you used.

**Intelligence should carry the mechanical. Humans should carry the meaningful.**
