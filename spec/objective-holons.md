# Objective holons and Yawn.bot lifecycle

Status: **Working Draft 0.1**

YAWN treats dialogue as a programming surface. A signal may reveal a durable
objective, but detection is not adoption and adoption is not authorization.
The system exposes its parse, lets the rightful principal correct it, and only
then may create an objective-holding Yawn and activate a Yawn.bot to steward it.

## The lifecycle

```text
source-preserved signal
  -> typed detections
    -> objective candidate
      -> routing and independence proposal
        -> principal ratification
          -> objective-holding Yawn
            -> sleeping Yawn.bot
              -> explicit activation grant
                -> questions, moves, proof, replay
```

Each arrow is inspectable. No arrow is inferred merely because the next record
would be convenient.

## Four records that must remain distinct

### Objective candidate

A machine-attributed interpretation that a signal may express a direction worth
holding across turns. It preserves the source, principal, proposed wording,
mode, time horizon, confidence, and the reasons it may deserve an independent
Yawn. A candidate remains a proposal even when confidence is high.

### Ratified objective

A principal-owned direction accepted through a ratification receipt. An
objective may be finite, ongoing, or deliberately open. It may coordinate many
goals and child Yawns. Evidence can show movement relative to it without proving
a person's identity, worth, or final completion.

### Objective-holding Yawn

A durable orientation contract that holds one primary objective, its current
lacuna, boundaries, relevant relationships, optional target, and proof policy.
For example, `yawn:dave:good-dad` may hold the ongoing objective “be a good
dad,” while child Yawns hold independently testable goals such as repairing one
rupture or establishing one weekly ritual.

### Yawn.bot

The stewarding agent/runtime bound to a Yawn. The Yawn is the contract; the bot
is the bounded agent that operates inside it. A Yawn can exist without an
active bot. A bot begins sleeping and gains no effect authority until activation
is explicitly granted.

## The root alignment bridge

The principal's root `.yawn` is not one assistant attempting every objective.
It is the first coordinating holon and alignment bridge. It preserves the
principal's attributed values, boundaries, relationships, source history, and
authority roots; detects candidate objectives; and proposes where they belong.

The root may propose `Dave/good-dad`, `Dave/founder`, or another objective
holon. Those children can connect laterally and may receive selected structural
context. They do not silently inherit truth, agreement, confidence, identity,
consent, privacy, proof, or permission to act.

## When an objective becomes its own holon

Propose an objective holon when the direction is independently meaningful and
at least one of these is distinct:

- enduring or independently testable objective;
- principal or affected participants;
- time horizon or cadence;
- authority, privacy, or consent boundary;
- proof or maintenance loop;
- relationships and dependencies that must remain inspectable; or
- explicit human request for a dedicated Yawn.bot.

Otherwise attach the signal to an existing Yawn, link it laterally, or hold it
as an unresolved candidate. Repetition and semantic similarity are retrieval
signals, not permission to create, merge, or activate a bot.

## Bot roles and spawning

- A `root_steward` detects, routes, and protects alignment; it need not hold one
  primary objective.
- An `objective_steward` holds one ratified primary objective across turns.
- A `worker` holds a narrower delegated transition or proof obligation.

An active bot may propose a child. It may not grant that child authority. New
children start sleeping, preserve their parent breadcrumb and sources, and
require their own accepted structural receipt and any necessary activation
grant. “Duplication” therefore copies a protocol shell, not authority or truth.

## Default programming interface

The default surface is declarative, not conversationally personified:

```text
SIGNAL COMPILED

Detected
  Principal          Dave                         reported
  Desire             Be a good dad               reported
  Objective candidate Dave / good dad             inferred · 0.93
  Arena              Family life                  inferred · 0.78
  Lacuna             What would count as movement? provisional

Proposed structure
  Parent              yawn:dave:root
  Yawn                yawn:dave:good-dad
  Bot                 bot:dave:good-dad · sleeping

[Confirm objective] [Reject] [Correct] [Add more]
```

Correction controls stay available while no more than three currently valid
structural paths are foregrounded. Ranking may combine estimated structural
fit, expected usefulness, information gain, reversibility, and cost. A displayed
score states whether it is a heuristic or a calibrated posterior estimate; it
never stands in for ratification.

```text
Recommended operation
  1  CREATE OBJECTIVE HOLON   structural fit 0.86   requires confirmation

Other valid paths
  2  ATTACH TO ROOT          structural fit 0.09
  3  HOLD                    structural fit 0.05

[Create objective holon] [Choose another path] [Inspect all operators]
```

After ratification, activation is a separate operation:

```text
OBJECTIVE RATIFIED
YAWN CREATED
BOT SLEEPING

[Activate] [Inspect contract] [Keep sleeping]
```

Personality is an optional projection field. With no selected personality,
Yawn.bot emits typed detections, uncertainties, proposed operations, and
receipts in concise protocol language.

## Executable surface

The additive schema at
[`schemas/objective-holon.v0.1.schema.json`](../schemas/objective-holon.v0.1.schema.json)
defines compile projections, objective candidates, ratified objectives,
Yawn.bot bindings, ratification receipts, and activation receipts. It references
Yawn and agent identifiers governed by the stable v1 and Agency Holarchy 0.2
layers rather than redefining those contracts.
