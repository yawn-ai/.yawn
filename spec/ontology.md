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
                  ├─ optional Yawn.bot steward
                  └─ Turn containing moves, events, and waiting
                      └─ Transition supported by proof
                          └─ Replayed state and a changed horizon
```

These are related, not synonyms.

### Relationship

The situated, changing coupling through which an Agent and Arena become
mutually identifiable for a purpose. Relationship is structurally prior to the
rest of the operational loop: it conditions what can be disclosed as an
Observation, what becomes relevant, which affordances exist, and which grants
are active. It is not necessarily ownership, containment, agreement, or
authority.

Observation remains the operational entry point because it is the first
inspectable epistemic record. These claims compose as:

```text
Relationship -> Observation -> Relevance -> Orientation -> Intention
             -> Projection -> Consequence -> Proof -> Updated Relationship
```

The updated relationship is not automatically better or more permissive.
Consequence may narrow trust, suspend an execution relationship, expose a new
lacuna, or require the Arena to be reframed. See
[`core/RELATIONSHIP_FIRST_AGENT_ARENA.yawn`](../core/RELATIONSHIP_FIRST_AGENT_ARENA.yawn)
for the high-resolution constitutional source.

### Reality

Whatever constrains consequences and can disconfirm the record. YAWN refers to
reality but does not presume to store it.

### World horizon

The open-ended environment in which agents and arenas exist. A world view in an
interface is a high-aperture projection across arenas; it is not a complete
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

### Arena

A provisional, agent-relative slice of the world made relevant by a purpose,
participants, affordances, constraints, resources, authority, and open lacunae.
An arena is not necessarily competitive. It may be collaborative, private,
administrative, creative, bodily, or computational.

Every arena records its frame limits: what is admitted, excluded, unknown, and
subject to reframing. This protects against treating a useful small-world model
as the whole world.

### Observation

What became available to an attributed Agent from within an Arena, under
particular conditions and limits. Observation is the primary epistemic entry,
not the structural parent of the ontology. Sources, senses, timestamps, and
input adapters preserve how it became available.

An Observation remains valid with no Target, Intention, Projection, Move, or
Yawn. What the observer added and what another Agent inferred are separately
attributed. Attaching an Observation to a Yawn does not retype it; optional
promotion creates a distinct Yawn and an inspectable relation.

### Orientation

Orientation is a time-indexed, attributed, purpose-relative working map of an
Agent in relationship with an Arena. It may compose observations, role and
perspective, bodily and environmental state, concerns and needs, values and
commitments, constraints and resources, authority, lacunae, affordances,
possible moves, and the conditions that would revise the map.

Orientation is revisable process and state, not a view from nowhere and not a
claim that every organism consciously asks the same questions. The nine
orientation questions are stable semantic coverage axes designed by YAWN; an
interface may enter through any axis, wording, or accessible medium. The
resulting presentation is a View. It does not create different semantic truth.
The machine-facing View identifiers are `orientation_map` for the revisable
coverage projection and `orientation_inquiry` for its question-facing surface.

An `observer` is normally a metacognitive stance or View of the same embodied
Agent. It becomes a distinct Agent only when a system intentionally gives it a
persistent identity boundary, capabilities, memory, objective, and authority.
Likewise, a `game` is an optional lens over an Arena, and a `level` names a
declared scope, nesting depth, or capability dimension—never a ranking of
human worth or consciousness.

### Intention

The Agent's presently selected or endorsed direction: what it means to
understand, communicate, preserve, test, repair, change, or do. An Intention
may never be expressed or attempted.

### Projection

What the Agent actually expresses, represents, proposes, commits, or attempts
back into the Arena. A Projection may express an Intention poorly or may be
habitual, accidental, coerced, automated, or misunderstood.

Every Move is a Projection; not every Projection is a Move. Consequence is what
the Arena and reality return, and may differ from both Intention and Projection.

```text
Arena -> Observation -> Agent -> Orientation -> Choice -> Intention
Arena <- Projection  <- Agent
                    consequence -> Observation'
```

An open Question may be proposed from an Observation's `remainsOpen` field.
Organizing its wording never overwrites the verbatim source. An Art Brief is a
proposal for a possible Projection; rendered bytes are a candidate artifact.
Displaying that candidate by an attributed Agent in a review Arena is the
Projection. The page composition and its serialization remain rebuildable
Views. None of these steps accepts a preference, proves the interpretation, or
promotes the Observation into a Yawn.

### Yawn

A durable, versioned orientation contract inside an arena. It holds enough of
the current state, lacuna, optional target, boundary, authority, possible move,
and proof conditions to coordinate a meaningful update.

A Yawn is not a topic, folder label, person, or arena. It can hold uncertainty
and does not need to be ready for action or to have a target. When goal-oriented,
it should have one primary independently testable transition contract.

### Objective and objective holon

An **objective** is a principal-owned direction ratified to persist across
turns, goals, or maintenance cycles. A parser may detect an objective candidate,
but confidence does not adopt it. Desire, candidate, ratification, target,
commitment, and authorization remain distinct records.

An **objective holon** is a Yawn whose primary contract holds one ratified
objective. It may coordinate several bounded goals or child Yawns without
turning an ongoing human objective into a fixed score or proof of identity.

### Yawn.bot

A Yawn.bot is a bounded stewarding agent/runtime bound to a Yawn. The Yawn is
the durable contract; the bot operates inside it. A Yawn may exist with a
sleeping bot or no bot. Ratifying an objective does not activate the bot, and
activation does not itself grant permission for external effects.

The root Yawn.bot is an alignment bridge and routing steward. Objective
stewards hold one primary ratified objective; worker bots hold narrower
delegated transitions or proof obligations.

### Lacuna

The named absence, uncertainty, dispute, missing bridge, or unformalized
remainder that matters to orientation. A lacuna is not a defect to be hidden;
it is a first-class reason to hold a Yawn open.

### Turn

A bounded, causally coherent episode opened against a state. An agent may act,
wait, delegate, receive events, or yield within it. Turns can be asynchronous,
nested, and overlapping; they are cuts through continuous activity, not a claim
that reality literally alternates turns.

### Move, event, transition

- A **move** is an intended commitment: action, communication, delegation,
  explicit non-action, or wait.
- An **event** is an attributed occurrence, including exogenous change.
- A **transition** is the measured state or affordance delta resulting from one
  or more events. It is not identical to the move.

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
proof/replay, memory, causal graph, filesystem, and spatial world interfaces are
Views. Aperture changes how much context is included or emphasized; it never
changes permission or truth. Materializing or serializing a View is not an
ontological Projection unless an Agent actually expresses it into an Arena.

### Execution-delegate relationship and consequence loop

An execution delegate is an active, revocable relationship between a rightful
grantor and a capability-bound worker. The relationship is the starting state
of delegated action, not a decorative label around an isolated task. Each
external effect resolves through an active work order or owner-accepted reusable
policy, an exact typed effect signature, current preconditions, a Projection
into the external Arena, its observed Consequence, and a proof receipt that can
update the relationship.

Repeated clean receipts can justify a reusable-policy proposal. They cannot
activate that proposal, widen scope, add cost, or erase a SHA/proof boundary.
Those changes require a new event from the rightful grantor. Stale input or a
failed check suspends the matching action rather than turning uncertainty into
permission.

## Semantic planes

YAWN separates four semantic planes:

| Plane | Question | Typical records |
| --- | --- | --- |
| World | What is represented as happening? | fields, arenas, observations, events, state |
| Epistemic | How is it known? | claims, sources, confidence, disputes, lacunae, proof |
| Normative | What matters and what is protected? | values, desires, objectives, boundaries, privacy, authority |
| Action | What may change next? | targets, goals, bots, moves, turns, transitions, updates |

Governance, temporal order, and provenance are control planes that cross all
four. Collapsing these planes creates familiar errors: desire becoming fact,
confidence becoming permission, an intended move becoming an outcome, or a UI
becoming the source of truth.

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
or projections of a Yawn. Draft 0.2 does not make them mutually exclusive Yawn
types. The durable unit is the orientation contract, not a topical taxonomy.
