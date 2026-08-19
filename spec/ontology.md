# Ontology

Status: **Working Draft 0.2**

YAWN models how distinguishable Agents orient and act within history-dependent
relationships and Arenas. Its concepts are not claims that reality is naturally
made of files, turns, game objects, or five software layers. They are inspectable
cuts that let people and software coordinate without hiding inference or
authority.

## Ontology layers and compilation boundary

YAWN separates foundational conditions from operations, action, governance, and
presentation so that a useful downstream mechanism cannot silently become the
purpose of the whole system.

```text
L0  substrate             coupling, relationship, Agent, Arena, access,
                           constraint, affordance, influence, history
L1  epistemic operation   Observation, trace, evidence, aperture, relevance,
                           orientation
L2  action / transition   Intention, Projection, Move, Consequence, Proof,
                           Update
L3  governance            authority, permission, delegation, autonomy,
                           graduation
L4  projection / View     interfaces, narratives, diagrams, slides, video
```

This is a dependency and compilation order, not a final metaphysics. Agency and
meaning cross layers and remain attributed; they are not automatically ontology
roots or system-owned terminal objectives.

Whole-system explainers MUST preserve the layer boundary in
[`core/ONTOLOGY_LAYERING_AND_PROMOTION.yawn`](../core/ONTOLOGY_LAYERING_AND_PROMOTION.yawn)
and the machine-readable classifications in
[`core/ontology-layering.v1.json`](../core/ontology-layering.v1.json).

A downstream concept can become a specialized subject without becoming the
public purpose. For example, proof-gated graduation may explain an internal
autonomy mechanism. It does not replace coupling and relationship as the
substrate of the story.

## The core relation

```text
Reality
  └─ World horizon
      └─ Field available to an agent
          └─ Arena disclosed for a purpose
              └─ Yawn holding one live orientation contract
                  └─ Turn containing moves, events, and waiting
                      └─ Transition supported by proof
                          └─ replayed state and a changed horizon
```

These are related, not synonyms.

### Coupling

Coupling is the dependency and influence skeleton: changes in one pole alter,
constrain, enable, or become informative to another pole. A body and oxygen, a
thermostat and room, a person and road, or two communicating agents may be
coupled in different ways.

Coupling does not by itself imply mutual modeling, trust, consent, meaning,
memory, or legitimate authority. A bare coupling can be real and consequential
without being a reflective relationship.

### Relationship

A Relationship is the broader, history-dependent situated state through which
one or more couplings acquire access conditions, roles, stakes, expectations,
meanings, constraints, affordances, authority, and possible movement.

```text
coupling = dependency / influence skeleton
relationship = inspectable situated state around that skeleton
```

Not every coupling is a full reflective Relationship. Not every Relationship
requires both poles to carry explicit psychological models of one another. YAWN
preserves the distinguishable poles and does not reify Relationship as a
mystical third substance.

Relationship is structurally prior to the rest of the operational loop: it
conditions what can be disclosed as an Observation, what becomes relevant,
which affordances exist, and which grants are active. Observation remains the
operational entry point because it is the first inspectable epistemic record.
These claims compose as:

```text
Relationship -> Observation -> Relevance -> Orientation -> Intention
             -> Projection -> Consequence -> Proof -> Updated Relationship
```

The updated Relationship is not automatically better or more permissive.
Consequence may narrow trust, suspend an execution relationship, expose a new
lacuna, or require the Arena to be reframed. See
[`core/RELATIONSHIP_FIRST_AGENT_ARENA.yawn`](../core/RELATIONSHIP_FIRST_AGENT_ARENA.yawn)
for the high-resolution constitutional source.

### Reality

Whatever constrains consequences and can disconfirm the record. YAWN refers to
reality but does not presume to store it.

### World horizon

The open-ended environment in which Agents and Arenas exist. A world view in an
interface is a high-aperture projection across Arenas; it is not a complete
world model.

### Field

The signals and information available to a particular observer at a particular
time through perception, memory, files, tools, relationships, and environment.
Fields are partial and attributed.

### Agent

A role or entity with identity, capabilities, constraints, goals or values, and
decision rights. Human, collective, institutional, and software Agents can be
represented operationally without claiming that they have the same kind of
agency or experience.

### Agency and graduation

Agency is a cross-layer capacity realized through an Agent's situated access,
orientation, action repertoire, authority, and feedback. A system may support
or attenuate agency, but it may not silently choose what a human life or
relationship is for.

Graduation is a governance policy, not the ontology root or public purpose.
Repeated proof may justify a proposal to widen an Agent's scope, trust,
autonomy, or responsibility. Graduation cannot define the Relationship, choose
the terminal goal, or prove itself.

```text
graduation of agency
= optional internal proof-gated governance mechanism
!= coupling or relationship substrate
!= human terminal objective
!= permission to automate everything
```

### Arena

A provisional, agent-relative slice of the world made relevant by a purpose,
participants, affordances, constraints, resources, authority, and open lacunae.
An Arena is not necessarily competitive. It may be collaborative, private,
administrative, creative, bodily, or computational.

Every Arena records its frame limits: what is admitted, excluded, unknown, and
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

A durable, versioned orientation contract inside an Arena. It holds enough of
the current state, lacuna, optional Target, boundary, authority, possible Move,
and proof conditions to coordinate a meaningful update.

A Yawn is not a topic, folder label, person, or Arena. It can hold uncertainty
and does not need to be ready for action or to have a Target. When goal-oriented,
it should have one primary independently testable transition contract.

### Lacuna

The named absence, uncertainty, dispute, missing bridge, or unformalized
remainder that matters to orientation. A lacuna is not a defect to be hidden;
it is a first-class reason to hold a Yawn open.

### Turn

A bounded, causally coherent episode opened against a state. An Agent may act,
wait, delegate, receive events, or yield within it. Turns can be asynchronous,
nested, and overlapping; they are cuts through continuous activity, not a claim
that reality literally alternates turns.

### Move, event, transition

- A **Move** is an intended commitment: action, communication, delegation,
  explicit non-action, or wait.
- An **event** is an attributed occurrence, including exogenous change.
- A **transition** is the measured state or affordance delta resulting from one
  or more events. It is not identical to the Move.

### Proof and proof receipt

Proof is the declared method for checking what reality would have to show.
A proof receipt records what was checked, by whom or what, against which
prediction or condition, with what outcome and limitations. Proof can fail,
remain partial, or be disputed.

### State and replay

State is a materialized View reduced from authorized events. Replay is the
deterministic reconstruction of that View plus an inspectable account of what
changed. Presentation changes do not change semantic state.

### View and aperture

A View renders part of the canonical graph for a purpose. Arena, timeline,
proof/replay, memory, causal graph, filesystem, and spatial world interfaces are
Views. Aperture changes how much context is included or emphasized; it never
changes permission or truth. Materializing or serializing a View is not an
ontological Projection unless an Agent actually expresses it into an Arena.

### Execution-delegate relationship and consequence loop

An execution delegate is an active, revocable Relationship between a rightful
grantor and a capability-bound worker. The Relationship is the starting state
of delegated action, not a decorative label around an isolated task. Each
external effect resolves through an active work order or owner-accepted reusable
policy, an exact typed effect signature, current preconditions, a Projection
into the external Arena, its observed Consequence, and a proof receipt that can
update the Relationship.

Repeated clean receipts can justify a reusable-policy proposal. They cannot
activate that proposal, widen scope, add cost, or erase a SHA/proof boundary.
Those changes require a new event from the rightful grantor. Stale input or a
failed check suspends the matching action rather than turning uncertainty into
permission.

## Semantic planes

YAWN separates four semantic planes:

| Plane | Question | Typical records |
| --- | --- | --- |
| World | What is represented as happening? | fields, Arenas, Observations, events, state |
| Epistemic | How is it known? | claims, sources, confidence, disputes, lacunae, Proof |
| Normative | What matters and what is protected? | values, boundaries, privacy, authority |
| Action | What may change next? | Targets, Moves, Turns, transitions, updates |

Governance, temporal order, and provenance are control planes that cross all
four. Collapsing these planes creates familiar errors: desire becoming fact,
confidence becoming permission, an intended Move becoming an outcome, or a UI
becoming the source of truth.

## Epistemic statuses

At minimum, implementations preserve these distinctions:

```text
observed | reported | inferred | assumed | predicted | disputed | unknown
```

Confidence describes the fit of a representation to available evidence. It is
not importance, moral worth, freshness, consensus, or authorization. Each is a
separate dimension.

Adoption is also separate from effect authority. An adopted Arena, Yawn, or
relation may be part of the canonical graph while external action remains
denied. Adoption never overrides per-item privacy or egress constraints.

## Facets, not subclasses

Identity, Relationship, context, framework, and ontology may be useful facets
or projections of a Yawn. Draft 0.2 does not make them mutually exclusive Yawn
types. The durable unit is the orientation contract, not a topical taxonomy.
