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
`.ion`, `.yon`, and `.ywn` are invalid aliases commonly introduced by speech-to-text or
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

## Start inside Relationship

Relationship is structurally first even though Observation is operationally
first. An Agent can observe only from a situated relation with an Arena, its
affordances, other agents, and the conditions that disclose anything at all.
The protocol therefore keeps both statements true without turning either into
an absolute hierarchy:

```text
Relationship -> Observation -> Relevance -> Orientation -> Intention
             -> Projection -> Consequence -> Proof -> Updated Relationship
```

The relationship is dynamic, not decorative context. It may change what can be
noticed, what matters, what movement is appropriate, and what authority is
actually active. Proof returns to the relationship instead of merely closing a
task.

[Relationship-first Agent Arena →](core/RELATIONSHIP_FIRST_AGENT_ARENA.yawn) ·
[Research braid →](references/RELATIONSHIP_FIRST_RESEARCH_BRAID.yawn) ·
[Attributed collaboration history →](agents/collaboration-history.yawn)

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
[Observation View contract →](interface/yawn-observation-view-v1.yawn) ·
[Desktop Homebase contract →](interface/desktop-homebase-v1.yawn)

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

## Objectives become holons; bots steward them

A source signal can reveal a durable objective without immediately becoming a
goal, instruction, or active agent. YAWN compiles the signal into typed,
source-preserved detections and proposes an objective and possible place in the
holarchy. The principal can confirm, reject, correct, or add to that
interpretation; this review is not objective ratification. Ratification is a
separate explicit operation.

For example, “I want to be a good dad” may become the ratified objective
`Dave/good-dad`. If a distinct durable holon is useful, an authorized structural
receipt can create a Yawn to hold that objective, its relationships, boundaries,
lacunae, and proof policy. A separate receipt can bind a sleeping Yawn.bot, and
another can activate bounded stewardship. Ratification alone does none of
those things. The root `.yawn` is the alignment bridge:
it routes and relates objective holons rather than acting as one assistant that
owns them all.

```text
signal → detections → objective candidate → ratified objective
  → optional authorized Yawn → optional receipted sleeping bot
    → optional activation → proof + replay
```

The default interface shows the compiled data model in concise protocol
language, keeps correction controls available, and foregrounds no more than
three ranked structural paths. A score says whether it is a heuristic or an
estimated posterior; neither is ratification. Personality is optional
programmed projection data. Child bots may
receive selected structural context, but never silently inherit truth, consent,
privacy, confidence, proof, identity, agreement, or effect authority.

[Objective holons →](spec/objective-holons.md) ·
[Dave / good dad →](examples/dave-good-dad-objective-holon.yawn) ·
[Lifecycle amendment →](rfcs/0005-optional-objective-promotion-and-bot-binding.md)

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

These are stable semantic coverage axes, not nine mandatory database fields or
a fixed interview order. A person may enter through any question, wording, or
accessible medium while answers map back to the same attributed graph:

1. What has your attention, and what episode are we orienting?
2. Where and when is this happening, and which relationship or Arena is active?
3. Who are you here, in what role, and who participates or is affected?
4. What appears to be happening now?
5. What matters, is needed, or is being protected—and why?
6. What is unknown, disputed, constrained, dependent, or in tension?
7. What must be protected, and who may decide or act?
8. What is possible next?
9. What would reality have to show for this map to update?

An adaptive interface asks one useful question at a time and may expose up to
three candidate paths. Safety and authority blockers outrank convenience;
accepted View preferences may tune order and the chosen representation medium
or answer-input adapter without changing meaning. Wording, pacing, and density
may remain attributed preference proposals, but receipt V0.1 executes only the
packet-pinned default or hard-gated prompt; a later versioned prompt registry is
required for adapted wording. Unknown, skipped, disputed, deferred, and
withheld answers stay distinct rather than being silently completed.

Coverage, claim confidence, and routing confidence remain separate. Answering
all nine does not make the answers true or authorize a move. For a choice about
which “game” or competition is worth entering, orientation begins with the
relationship, obligation, value, or capacity worth serving or protecting;
competition remains an optional Arena lens.

[Question-to-ontology traceability →](spec/questions.md) ·
[Selection receipt schema →](schemas/inquiry-selection-receipt.v0.1.schema.json) ·
[Participation-choice example →](examples/participation-choice.yawn)

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
relations, turns, routing, and structural receipts. Objective Holon 0.1 adds
typed objective compilation, objective-only ratification, optional Yawn
promotion, receipted sleeping-bot binding, and separately resolved activation.
Orientation Map 0.1 adds attributed semantic coverage, adaptive inquiry, and
closed selected-question or hold receipts while keeping presentation separate.
Neither v1 module is marketed as the complete schema for every human-readable
`.yawn` file.

[`protocol-manifest.v0.1.json`](protocol-manifest.v0.1.json) publishes the
commit-independent semantic revision, exact artifact hashes, and closed
`yawn.bot/new.v0.1` conformance profile. A downstream lock still records the
detached whole-manifest SHA-256 together with `profileId` (and may also record
the accepted Git commit); the manifest prevents a consumer from silently
omitting or adding a required module while claiming current protocol
conformance.
[RFC 0004](rfcs/0004-content-addressed-conformance-and-interaction-receipts.md)
records the proposed compatibility, authority, and cross-document boundaries.
Explicit UI review and response events use the
[Interaction Operator Receipt V0.1](schemas/interaction-operator-receipt.v0.1.schema.json).
Its validators establish document-local binding and attribution only. Applying
a View transition additionally requires authenticated actor/principal identity,
resolution of the exact constitutional Source UUID and hash, subject, selection
receipt and prompt hash, proof that the claimed `fromStatus` is current in
append-only state, receipt-ID idempotency/conflict checks, and a fail-closed
privacy/egress check that prevents Response visibility from widening Source
visibility.

Including the Objective Holon artifacts proves that the objective grammar is
available. It does not prove that referenced Yawns, authority grants, or policy
records resolve, and it does not prove materialization conformance; those claims
require cross-document resolution. Likewise, an interaction confirmation is a
review receipt, not ratification, bot activation, or effect authority.
[RFC 0005](rfcs/0005-optional-objective-promotion-and-bot-binding.md)
separately governs optional objective promotion and BotBindingReceipt.

`artifactSetSha256` is SHA-256 over the UTF-8 bytes of `JSON.stringify` applied
to lexicographically sorted `[moduleId, version, path, role, sha256]` tuples,
with no added whitespace or trailing newline. This makes the digest insensitive
to manifest array order but sensitive to every normative tuple value. It is
artifact-set integrity, not profile identity; `protocolRevision` and
`artifactSetSha256` are each insufficient without the detached raw-manifest hash
and profile ID.

These local commands are the primary proof path. GitHub Actions may run the
same checks as a secondary witness; runner or billing unavailability is not a
test failure and cannot replace a commit-bound local result.

[Protocol manifest →](protocol-manifest.v0.1.json) · [Protocol layers →](spec/README.md) · [Project status →](docs/project-status.md) ·
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
| See one objective become a Yawn.bot | [Dave / good dad](examples/dave-good-dad-objective-holon.yawn) |
| Orient before choosing a game or competition | [Participation-choice example](examples/participation-choice.yawn) |
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
