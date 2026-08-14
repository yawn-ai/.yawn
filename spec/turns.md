# Turns and causal time

Status: **Working Draft 0.2**

A turn is YAWN's bounded trace unit: an opened causal episode in which an agent
may act, communicate, wait, delegate, or yield. “Keeping this turn open” means
the causal loop is unresolved—not that a process must keep a network request or
chat connection alive.

## Lifecycle

```text
turn.open(state, arena, authority, intention, prediction)
  -> move proposed or committed
  -> events observed
  -> wait / block / delegate / resume as needed
  -> outcome attributed
  -> transition measured
  -> proof evaluated
  -> discrepancy and learning recorded
  -> authorized update
turn.close(outcome | handoff | abandonment)
```

Turns and transitions are not synonyms. A turn is the causally coherent
interval. A transition is the state or affordance delta measured from events
within or related to that interval.

## Required trace

An open turn records:

- stable ID, Yawn ID, arena ID, actor, and causal parents;
- prior state reference and opening time;
- purpose or intention, if any;
- applicable authority and privacy constraints;
- proposed or committed moves;
- expected result or falsifier, when the move makes an empirical prediction;
- events and external dependencies; and
- current status.

A closed turn additionally records the closure reason, resulting transition or
handoff, proof receipts, and next-turn references when known.

## Waiting is first-class

`waiting` and `blocked` are meaningful states, not missing logs. A wait record
should name:

```yaml
waiting_on: "Supabase migration job run:42"
since: "2026-08-13T16:00:00Z"
resume_when: "job run:42 reaches a terminal state"
deadline: null
owner: "agent:codex"
```

Waiting does not authorize busy polling, unlimited resource use, or hidden
external action. An implementation may suspend execution while keeping the
turn causally open.

## Concurrency and nesting

There is no global alternating-turn requirement. Turns MAY overlap and MAY be
nested. Causal relationships use IDs (`caused_by`, `parent_turn_id`,
`correlation_id`) rather than relying on one total sequence. A local monotonic
event cursor MAY be used for deterministic replay inside one event stream.

Delegation opens a child or linked turn with explicitly narrowed context and
authority. Handoff records what was observed, what was inferred, what remains
unknown, what may be done, and what will count as completion.

## Close conditions

A turn closes through one of four explicit reasons:

- `completed`: outcome and applicable proof were recorded;
- `handed_off`: responsibility moved with an accepted handoff;
- `abandoned`: an authorized agent stopped the episode and stated why;
- `superseded`: a later turn replaced it while preserving causal history.

Timeout alone does not imply failure, and a move never marks itself successful.
