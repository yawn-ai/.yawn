# Five-minute quickstart

You do not need the whole ontology to write a useful `.yawn`. Start with one
signal and make the inferences around it visible.

```yaml
# A small human-readable orientation record.
title: "The next release still feels unclear"

signal: "I keep reopening the plan without choosing a release boundary."

current: "Several useful changes are mixed into one undefined release."
epistemic_status: observed

inference: "The blocker may be an unclear proof boundary, not lack of effort."
inference_status: inferred

lacuna: "Which changes must ship together for the release to be coherent?"

boundary:
  - "Do not publish private user data."
  - "Do not call a draft stable."

move: "List the smallest independently testable release slice."

proof: "Every included change has an owner, test, and rollback path."

replay: "Record what the test changed and what remains open."
```

## Use the loop

```text
signal → orientation → choice → move → proof → update
```

1. Preserve the source signal in the observer's words.
2. Label what was observed and what was inferred.
3. Name the lacuna instead of filling it with certainty.
4. Check boundaries and authority before ranking moves.
5. Choose a bounded, reversible move—or explicitly wait.
6. Say in advance what would count as evidence.
7. Record events, evaluate proof, and update through replay.

## Go deeper only when needed

- Use the [nine questions](../spec/questions.md) for richer orientation.
- Use the [arena template](../templates/arena.yawn) when context and participants
  are unclear.
- Use the [turn template](../templates/turn.yawn) for asynchronous agent work.
- Use [routing](../spec/routing.md) before attaching, creating, merging, or
  splitting Yawns.

The protocol is allowed to say “unknown,” “waiting,” and “not authorized.”
Those are honest states, not failures of intelligence.
