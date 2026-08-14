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
                  └─ Turn containing moves, events, and waiting
                      └─ Transition supported by proof
                          └─ Replayed state and a changed horizon
```

These are related, not synonyms.

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

### Yawn

A durable, versioned orientation contract inside an arena. It holds enough of
the current state, lacuna, optional target, boundary, authority, possible move,
and proof conditions to coordinate a meaningful update.

A Yawn is not a topic, folder label, person, or arena. It can hold uncertainty
and does not need to be ready for action or to have a target. When goal-oriented,
it should have one primary independently testable transition contract.

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

### Projection and aperture

A projection renders part of the canonical graph for a purpose. Arena,
timeline, proof/replay, memory, causal graph, filesystem, and spatial world are
projections. Aperture changes how much context is included or emphasized; it
never changes permission or truth.

## Semantic planes

YAWN separates four semantic planes:

| Plane | Question | Typical records |
| --- | --- | --- |
| World | What is represented as happening? | fields, arenas, observations, events, state |
| Epistemic | How is it known? | claims, sources, confidence, disputes, lacunae, proof |
| Normative | What matters and what is protected? | values, boundaries, privacy, authority |
| Action | What may change next? | targets, moves, turns, transitions, updates |

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
