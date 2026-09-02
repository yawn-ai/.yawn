# .yawn

[![License: MIT](https://img.shields.io/badge/license-MIT-e8ff03.svg)](LICENSE)
[![Status: working draft](https://img.shields.io/badge/ontology-working%20draft-fd49ac.svg)](docs/project-status.md)

**An open protocol for inspectable relationships, orientation, and agency.**

`.yawn` helps a person and their intelligences preserve what was received, who
received it, through which relationship, what was inferred, what remains
unknown, what may happen next, and what reality later changed.

It is not a truth machine, a mind upload, a theory that reality is code, or
permission for an agent to act. It is a portable, correctable model of a
relationship to part of a world no model fully contains.

> **Automate the burden. Preserve the authorship. Return the time.**

[Five-minute quickstart](docs/quickstart.md) ·
[Ontology](spec/ontology.md) ·
[Research basis](docs/research-basis.md) ·
[Mental models and social sense-making](docs/mental-models-and-social-sensemaking.md) ·
[Schema directory](schemas/)

## Why you may be here

Human beings do not encounter every relevant fact at once. We perceive from a
standpoint, attend selectively, remember imperfectly, inherit language and
social models, infer causes, and act before uncertainty disappears.

Psychology does not require a little all-seeing person inside the head.
Executive functions help regulate attention and goal-directed behavior, while
metacognitive processes monitor and regulate parts of that regulation. Both are
limited, distributed, and context-sensitive—not a view from nowhere.

Mental models help us describe, explain, simulate, and predict. They also hide
their own construction. A model can feel obvious because it is familiar,
identity-protective, institutionally reinforced, repeatedly narrated, or useful
for coordination. Persistence and popularity are evidence about transmission,
not automatic evidence of truth.

AI increases the stakes. An agent can now summarize, infer, plan, write, call
tools, and act faster than a person can inspect every hidden assumption. Most
agent frameworks can represent prompts, goals, tools, memory, and workflows.
That is necessary but insufficient when the system cannot answer:

- Who is related to what?
- From whose standpoint did this become observable?
- What is the purpose of this relationship?
- Which roles, boundaries, affected principals, and histories are active?
- Which inference came from which source?
- Who may choose, disclose, or act?
- What consequence would revise the model?

`.yawn` is an attempt to make that missing relational layer inspectable.

## The smallest useful picture

```text
Agent/                                  open relation port
  ↓ something becomes relevant
Agent /[typed relation]/ Subject        bound relation address
  ↓
Observation → Orientation → Question → Position
  ↓
Choice, hold, or refusal
  ↓
Projection / Move → Consequence → Evaluation → Proof → Update
  ↓
Agent′/                                 renewed openness with history retained
```

This is a useful traversal through a recursive graph, not a compulsory pipeline.
Any node can remain open, branch, conflict, or become the subject of another
Question.

## The open slash

```text
Dave
```

names an addressable referent.

```text
Dave/
```

projects Dave at an **open relation port**: the anchor is known, while no target
or foreground relationship is presently selected.

```text
Dave/Observation
```

projects a typed relation from Dave to Observation, such as
`holds_model_of`. It does not mean Observation is literally inside Dave.

The slash is the visible traversal handle. The relationship record underneath
it carries the semantics:

```yaml
from_ref: agent:dave
to_ref: concept:observation
relation_type: holds_model_of
direction: forward
standpoint_ref: agent:dave
arena_ref: arena:public-model-sharing
roles: [observer, model-steward]
aperture_ref: aperture:public
source_refs: []
```

Only an explicit `primary_parent` relation creates semantic ancestry. A path
prefix alone is address context—not proof of containment, identity, agreement,
consent, truth, or authority.

[Open relation port](core/open-relation-port.yawn) ·
[Relation address](core/relation-address.yawn) ·
[Relation Address schema](schemas/relation-address.v0.1.schema.json)

## Relationship first; Observation first in use

A relationship is structurally first because Agent, Arena, relevance,
affordance, power, trust, and possible action are operationally specified
through their coupling.

Observation is operationally first because it is the first inspectable record
of a difference becoming available from within that already-active
relationship.

```text
Relationship
  → Observation
  → Relevance
  → Orientation
  → Question and Position
  → Choice / hold / refusal
  → Projection or Move
  → Consequence
  → Evaluation
  → Proof
  → authorized Update
  → Updated Relationship
```

The observer is normally a role, stance, or View of an existing Agent. It
becomes a distinct Agent only when a system gives it a persistent identity
boundary, memory, capabilities, objectives, and authority.

A relational Observation preserves:

```text
observer + observed referent + relationship + Arena
+ standpoint + access + mediation + conditions + limits
+ registered difference + observer contribution + inference
```

Self-observation is useful but is not independent corroboration. Repeating the
same source through several models does not create aperture diversity.

[Relationship-first Agent–Arena](core/RELATIONSHIP_FIRST_AGENT_ARENA.yawn) ·
[Relational Observation](core/relational-observation.yawn) ·
[Relational Observation schema](schemas/relational-observation.v0.1.schema.json)

[Local observation-art contract](interface/local-observation-art-v0.1.yawn)

## Mental models: clues, not verdicts

A mental model is a partial representation used to make possibilities runnable:
to explain, anticipate, compare, decide, or coordinate.

Models emerge through perception, memory, language, instruction, imitation,
institutions, communities, tools, and repeated participation. Religious,
scientific, political, professional, and family traditions can all transmit
useful structure, blind spots, identity commitments, and standards of evidence.

YAWN therefore does not ask only, “What do you believe?” It preserves:

```text
Question
→ attributed Positions
→ sources and source relationships
→ alternatives and counterexamples
→ confidence and uncertainty
→ social transmission and identity stakes
→ agreement, conflict, and inaccessible standpoints
→ criteria for Evaluation
→ consequences and falsifiers
```

When two people answer the same Question differently, the next operation is not
forced consensus. The system can expose which sources, definitions, values,
criteria, roles, or experiences differ—and which Move could increase shared
resolution without erasing either participant.

[Deeper research and design implications →](docs/mental-models-and-social-sensemaking.md)

## Source-bound Yawnbots

A source-bound Yawnbot begins with whatever the person actually has: a
transcript, message, document, image, event, repository record, or rough
thought.

```text
exact Source
→ attributed compiler proposals
→ correction by the rightful principal
→ Questions, Positions, facets, relationships, and possible Moves
→ provisioned expressions for an audience
→ consequence, Evaluation, Proof, and Update
```

Generated interpretation never silently becomes accepted cognition.

A Yawnbot is an addressable steward of a durable relationship model. The
`.yawn` record is the portable contract; a runtime bot is optional and requires
separate activation and authority.

[Source-bound aggregate](schemas/source-bound-yawnbot.v0.1.schema.json) ·
[Evaluation record](schemas/evaluation-record.v0.1.schema.json) ·
[Source-bound workbench](interface/source-bound-yawnbot-workbench-v0.1.yawn)

## One name, one extension

<!-- yawn-invalid-alias-guard:start -->
The project is **YAWN** and the only YAWN record extension is **`.yawn`**.
`.ion`, `.yon`, and `.ywn` are common speech-to-text substitutions. They are not
alternate formats, products, schemas, or compatibility layers.
<!-- yawn-invalid-alias-guard:end -->

In an established YAWN context, implementations normalize those substitutions
before creating a path, identifier, schema, or record. The original source text
must remain preserved, and genuine ambiguity must remain visible.

[Canonical naming contract](core/canonical-extension.yawn)

## A small `.yawn`

```yaml
title: "I keep reopening the plan"

source:
  kind: self_report
  text: "I keep reopening the plan without choosing a release boundary."

relationship:
  ref: relationship:dave-release
  agent_ref: agent:dave
  arena_ref: arena:current-release

observation:
  what_became_available: "The plan has been reopened several times."
  observer_added: "I am interpreting repetition as evidence of a missing frame."

question: "Which changes must ship together for the release to be coherent?"

position:
  statement: "The blocker may be an unclear proof boundary, not lack of effort."
  epistemic_status: inferred
  confidence: 0.62

lacuna:
  - "Which changes are independently testable?"
  - "What would be lost by shipping the smallest slice?"

boundary:
  - "Do not publish private user data."
  - "Do not call a draft stable."
  - "Confidence does not authorize release."

move: "List the smallest independently testable release slice."
proof: "Every included change has an owner, test, and rollback path."
replay: "Record what changed, what failed, and what remains open."
```

Unknown is a valid answer. Waiting is a valid state. A Move can be deferred.
Skipped context becomes a visible lacuna, not invented certainty.

## The semantic planes

| Plane | Question | Typical records |
| --- | --- | --- |
| World | What is represented as happening? | fields, Arenas, observations, events, state |
| Epistemic | How is it known? | claims, sources, confidence, disputes, lacunae, proof |
| Normative | What matters and what is protected? | values, needs, commitments, privacy, authority |
| Action | What may change next? | choices, holds, projections, Moves, turns, transitions |

Time, provenance, governance, and relation addresses cross all four planes.

Common illegal casts include:

```text
source ≠ interpretation
Position / Answer ≠ truth
confidence ≠ authority
expression provision ≠ Projection
Projection ≠ Move
recommendation ≠ choice
expected consequence ≠ observed Consequence
Consequence ≠ Evaluation
Evaluation ≠ Proof
Proof ≠ unrestricted Update
Character View ≠ Agent
path prefix ≠ parentage
open port ≠ pure consciousness
related sources ≠ independent corroboration
```

## The nine orientation questions

These are stable coverage coordinates, not mandatory database fields or a fixed
interview order:

1. What has your attention, and what episode are we orienting?
2. Where and when is this happening, and which relationship or Arena is active?
3. Who are you here, in what role, and who participates or is affected?
4. What appears to be happening now?
5. What matters, is needed, or is being protected—and why?
6. What is unknown, disputed, constrained, dependent, or in tension?
7. What must be protected, and who may decide or act?
8. What is possible next?
9. What would reality have to show for this map to update?

An interface should ask the highest-leverage Question it can justify, or
explicitly hold. Answering all nine does not make the answers true or authorize
a Move.

[Question packet](question-packets/orientation-nine.yawn) ·
[Inquiry selection](core/inquiry-selection.yawn)

## Holarchy without compulsory hierarchy

Yawns may form one acyclic primary-parent backbone for addressability and
maintenance. Non-containment meaning uses typed lateral relations such as
`supports`, `depends_on`, `conflicts_with`, `coordinates_with`, and
`derived_from`.

Parent–child is one relationship type. It is not the meaning of every slash.

Create, attach, reparent, merge, split, connect, expose, activate, and publish
begin as proposals. Accepted changes require a rightful authority and append an
inspectable receipt. Privacy and authority may narrow through inheritance; they
never silently widen.

[Holarchy](spec/holarchy.md) ·
[Routing](spec/routing.md) ·
[Agency Holarchy schema](schemas/agency-holarchy.v0.2.schema.json)

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

JSON Schema validates shape. Reducers and policy engines must additionally
validate referential integrity, temporal order, source independence, tree
acyclicity, privacy, consent, authority, and effect boundaries.

## Find your path

| If you want to… | Start here |
| --- | --- |
| Understand why the protocol exists | [Mental models and social sense-making](docs/mental-models-and-social-sensemaking.md) |
| Record what became available before interpreting it | [Observation template](templates/observation.yawn) |
| Model a directional slash path | [Relation Address schema](schemas/relation-address.v0.1.schema.json) |
| Represent a trailing open slash | [Open relation port](core/open-relation-port.yawn) |
| Write one useful record | [Five-minute quickstart](docs/quickstart.md) |
| Build an implementation | [Specification](spec/) and [schemas](schemas/) |
| See nested Agent–Arena structure | [Nested Agent Arena](examples/nested-agent-arena.yawn) |
| Understand link, merge, and split | [Routing example](examples/merge-split-routing.yawn) |
| Turn a durable objective into a Yawnbot | [Dave / good dad](examples/dave-good-dad-objective-holon.yawn) |
| Explore unresolved Questions | [Q-Space](q-space/) |
| Inspect research boundaries | [Research basis](docs/research-basis.md) |

## Status and intent

YAWN is experimental. The grammar is public early because agents are becoming
more capable faster than their relationships, inferences, and actions are
becoming inspectable.

The vocabulary should earn stability through use, criticism, migration
evidence, independent implementation, and contact with consequences.

YAWN should carry the mechanical and return meaningful choice to the human. It
should not become a new boss, diagnose a person from prose, optimize every free
hour, or decide what a life is for.

## Project and contribution

The repository is MIT licensed and maintainer-led. Human and AI-assisted
contributors are welcome. Disclose material AI use, preserve source rights,
keep uncertainty visible, and bring proof with protocol changes.

[Contributing](CONTRIBUTING.md) ·
[Roadmap](ROADMAP.md) ·
[Governance](GOVERNANCE.md) ·
[Security](SECURITY.md) ·
[Code of conduct](CODE_OF_CONDUCT.md) ·
[Changelog](CHANGELOG.md)

The [Declaration of Agency](https://yawn-ai.github.io/.yawn/agency-declaration/)
is a cultural expression of the human boundary. The specification is the
narrower engineering contract.

**Intelligence should carry the mechanical. Humans should carry the meaningful.**
