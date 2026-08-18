# Ontology

Status: **Working Draft 0.2**

YAWN models a bounded episode of orientation and agency. Its concepts are not
claims that reality is naturally made of files, turns, or game objects. They
are inspectable cuts that let people and software coordinate without hiding
inference or authority.

## The core relation

```text
Reality
  └─ World horizon
      └─ Field available to an agent
          └─ Arena disclosed for a purpose
              └─ Yawn holding one live orientation contract
                  └─ Observation -> Orientation -> Choice -> Intention
                      └─ Projection -> Consequence -> Observation'
                          └─ Proof, replay, and update
```

These are related, not synonyms.

### Reality

Whatever constrains consequences and can disconfirm the record. YAWN refers to
reality but does not presume to store it.

### World horizon

The open-ended environment in which agents and arenas exist. A world View in an
interface is a high-aperture rendering across arenas; it is not a complete
world model.

### Field

The signals and information available to a particular observer at a particular
time through perception, memory, files, tools, relationships, and environment.
Fields are partial and attributed.

### Agent

A role or entity with identity, capabilities, constraints, goals or values, and
decision rights. Human, collective, institutional, and software agents can be
represented operationally without claiming that they have the same kind of
agency or experience.

Every Agent reference resolves to an attributed descriptor or principal. A
software model's inference remains attributed to that software Agent or model
run; citing a human source does not make the inference the human's testimony.

### Arena

A provisional, agent-relative slice of the world framed as relevant by one or
more attributed Agents for a stated purpose, participants, affordances,
constraints, resources, authority, and open lacunae.
An arena is not necessarily competitive. It may be collaborative, private,
administrative, creative, bodily, or computational.

An Arena does not possess an intrinsic goal. Its purpose is an attributed
framing rationale that can be revised or disputed. The same Arena can be
observed and acted into.

Every arena records its frame limits: what is admitted, excluded, unknown, and
subject to reframing. This protects against treating a useful small-world model
as the whole world.

### Yawn

A durable, versioned orientation contract inside an arena. It holds enough of
the Observations, attributed statements, Orientation, current state, lacuna,
optional Target, Choice, Intention, Projection, boundary, authority,
Consequence, and proof conditions to coordinate a meaningful update.

A Yawn is not a topic, folder label, person, or arena. It can hold uncertainty
and does not need a Target, endorsed Intention, Projection, or selected Move.
When goal-oriented, it should have one primary independently testable
transition contract.

### Lacuna

The named absence, uncertainty, dispute, missing bridge, or unformalized
remainder that matters to orientation. A lacuna is not a defect to be hidden;
it is a first-class reason to hold a Yawn open.

### Turn

A bounded, causally coherent episode opened against a state. An agent may act,
wait, delegate, receive events, or yield within it. Turns can be asynchronous,
nested, and overlapping; they are cuts through continuous activity, not a claim
that reality literally alternates turns.

### Observation and statement

An **Observation** records what became available to an attributed Agent in an
Arena at a time, through a source or acquisition method, under explicit
conditions and limits. It is an acquisition event, not a claim that an
interpretation is true.

An **epistemic statement** is an attributed representation about one or more
typed subjects. It records text, epistemic status, confidence, sources, and the
Observation records that ground it. An Observation can exist without an
endorsed statement; several Agents can interpret the same source differently.

The Yawn remains the durable orientation coordinate. An Observation is an
attributed record within or about that coordinate, not a replacement for the
Yawn. One Yawn may therefore carry many Observations from different Agents,
times, sources, conditions, and limits. New Observations append and may support,
contradict, or revise attributed statements without overwriting their sources.

An Observation does not automatically become a Yawn. It may become a proposed
linked or child Yawn only when it has its own independently inspectable lacuna,
orientation, choice, move, and proof lifecycle. That promotion still requires
the applicable authority and never follows from topical similarity alone.

### Orientation, Choice, and Intention

**Orientation** is an Agent's revisable working model of what is happening,
what matters, what is missing, and which possibilities remain open. **Choice**
records selection without pretending that selection executed anything.
**Intention** is the Agent's presently selected or endorsed direction: what it
means to understand, communicate, preserve, test, repair, change, or do.

An Intention may never be expressed. It does not authorize action by itself.

### Projection, Move, event, and Consequence

A **Projection** is what an Agent actually expresses, represents, proposes,
commits, or attempts back into an Arena. Projection kinds include expression,
claim, model, question, communication, proposal, commitment, and Move.

A **Move** is the subset of Projection selected as an attempt to change or
preserve a condition. Every Move is a Projection; not every Projection is a
Move. A **wait**, **yield**, or explicit non-action can be represented as a
Move when it is deliberately selected in a turn.

An **event** is an attributed occurrence, including exogenous change. A
**Consequence** is what the Arena and reality return after a Projection,
whether or not it matches the Agent's Intention or prediction. A
**transition** is the measured state or affordance delta associated with one or
more events. None is identical to the Move.

### Proof and proof receipt

Proof is the declared method for checking what reality would have to show.
A proof receipt records what was checked, by whom or what, against which
prediction or condition, with what outcome and limitations. Proof can fail,
remain partial, or be disputed.

### State and replay

State is a materialized view reduced from authorized events. Replay is the
deterministic reconstruction of that view plus an inspectable account of what
changed. Presentation changes do not change semantic state.

### View and aperture

A View renders part of the canonical graph for a purpose. Arena, timeline,
proof/replay, memory, causal graph, filesystem, and spatial world Views can
change inclusion, layout, aggregation, and salience. Aperture changes how much
context is included or emphasized. Neither changes permission or truth.

Earlier drafts used `projection` for this rendering sense. New normative work
reserves Projection for what an Agent actually puts into an Arena and uses
`View` for rendering. Legacy rendering fields remain compatibility aliases.

### Recursive observation

An Observation may acquire a prior Observation, statement, Projection,
Consequence, relationship, proof receipt, source, or View as material. The new
Observation keeps its own observer, Arena, time, conditions, limits, and source
coordinates. Any statement about what the recursive observation means is a
separate attributed record. Recursion never promotes a claim to state, widens
authority, or implies consciousness.

### Relationship offer and activation

A public relationship is an offer, not an active edge. Activation requires
explicit consent from every required human principal plus an authorized,
append-only event. A view, download, QR scan, sign-in, inference, or elapsed time
never counts as consent.

## Semantic planes

YAWN separates five semantic planes:

| Plane | Question | Typical records |
| --- | --- | --- |
| World | What is represented as happening? | fields, arenas, observation acquisitions, events, consequences, state |
| Epistemic | How is it known? | statements, sources, confidence, disputes, lacunae, proof |
| Normative | What matters and what is protected? | values, boundaries, privacy, authority |
| Directional | What is selected or meant? | goals, targets, choices, intentions |
| Expressive / action | What entered the Arena? | projections, moves, turns, transitions, updates |

Governance, temporal order, and provenance are control planes that cross all
five. Collapsing these planes creates familiar errors: desire becoming fact,
confidence becoming permission, Intention becoming Projection, Projection
becoming Consequence, an attempted Move becoming proof, or a View becoming the
source of truth.

## Epistemic statuses

At minimum, implementations preserve these distinctions:

```text
observed | reported | inferred | assumed | predicted | disputed | unknown
```

Confidence describes the fit of a representation to available evidence. It is
not importance, moral worth, freshness, consensus, or authorization. Each is a
separate dimension.

Adoption is also separate from effect authority. An adopted arena, Yawn, or
relation may be part of the canonical graph while external action remains
denied. Adoption never overrides per-item privacy or egress constraints.

## Facets, not subclasses

Identity, relationship, context, framework, and ontology may be useful facets
or Views of a Yawn. Draft 0.2 does not make them mutually exclusive Yawn
types. The durable unit is the orientation contract, not a topical taxonomy.

## Executable normalization

`schemas/orientation-passage.v1.schema.json` is the additive executable module
for Observation, statement, Intention, Projection, Consequence, and their typed
references. It does not silently rewrite Working Draft 0.2 records. See
[RFC 0005](../rfcs/0005-observation-intention-projection-consequence.md), the
[competency questions](competency-questions.md), and the
[term-admission gate](term-admission.md).
