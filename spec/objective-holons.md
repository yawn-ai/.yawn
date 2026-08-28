# Objective holons and Yawn.bot lifecycle

Status: **Working Draft 0.1**

YAWN treats dialogue as a programming surface. A signal may reveal a durable
objective, but detection is not adoption and adoption is not authorization.
The system exposes its parse and lets the rightful principal correct it.
Interpretation confirmation, objective ratification, authorized Yawn creation,
sleeping-bot binding, and bot activation remain separate operations with
separate receipts. A ratified objective need not become a Yawn or a bot.

## The lifecycle

```text
source-preserved signal -> typed detections -> objective candidate
  -> principal ratification -> ratified objective

optional structural branch:
  exact proposed RoutingProposal -> authorized create_yawn receipt
    -> optional bot-binding receipt -> sleeping Yawn.bot
      -> explicit activation receipt -> active bounded stewardship
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
is the bounded agent that operates inside it. A ratified objective can exist
without a Yawn, and a Yawn can exist without a bot. A proposed bot becomes a
sleeping binding only through a BotBindingReceipt, then gains bounded runtime
activation only through a separate ActivationReceipt. Neither operation grants
effect authority.

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

[Confirm interpretation] [Reject] [Correct] [Add more]
```

`Confirm interpretation` emits an Interaction Operator Receipt for the exact
detection or proposal. It does not ratify an objective, create a Yawn, activate
a bot, or grant authority.

Correction controls stay available while no more than three currently valid
structural paths are foregrounded. Ranking may combine estimated structural
fit, expected usefulness, information gain, reversibility, and cost. A displayed
score states whether it is a heuristic or a calibrated posterior estimate; it
never stands in for ratification.

```text
Recommended operation
  1  REQUEST OBJECTIVE RATIFICATION   structural fit 0.86

Other valid paths
  2  ATTACH TO ROOT          structural fit 0.09
  3  HOLD                    structural fit 0.05

[Request ratification] [Choose another path] [Inspect all operators]
```

The governed lifecycle is explicit:

```text
ratify_objective
  -> RatificationReceipt

create_yawn
  -> exact proposed RoutingProposal
  -> rightful authority and current-head checks
  -> agency-holarchy StructuralChangeReceipt(operation: create_yawn)

bind sleeping bot
  -> BotBindingReceipt(from: absent|proposed, to: sleeping)
  -> resolve referenced StructuralChangeReceipt, authority, and current state

activate
  -> ActivationReceipt
  -> authenticate principal, resolve grants and current bot state
  -> enforce append-only receipt-ID idempotency

[Activate] [Inspect contract] [Keep sleeping]
```

An Interaction Operator Receipt cannot satisfy any of those lifecycle receipts.
Objective Holon V0.1 validates document-local lifecycle coherence, while Agency
Holarchy 0.2 governs structural creation. Because the aggregate cross-document
resolver is not yet defined, this profile does not claim end-to-end
objective-linked materialization conformance.

V0.1 requires one binding receipt and permits at most one activation receipt for
each objective-steward or worker bot; the root steward carries no binding
receipt. For a retired non-root bot, the activation receipt is retained only as
historical provenance; it is not current authority. Pause, reactivation,
retirement, and decision-change history need a future explicit
supersession/head chain. Until then, the strict profile rejects ambiguous
duplicate current records.

Local ActivationReceipt validation cannot apply or authorize activation. The
consumer must authenticate the principal, resolve every authority grant, prove
the claimed lifecycle state current, and enforce unique receipt-ID idempotency.
Activation remains distinct from effect authority and external effects.

Personality is an optional projection field. With no selected personality,
Yawn.bot emits typed detections, uncertainties, proposed operations, and
receipts in concise protocol language.

## Executable surface

The additive schema at
[`schemas/objective-holon.v0.1.schema.json`](../schemas/objective-holon.v0.1.schema.json)
defines compile projections, objective candidates, ratified objectives,
Yawn.bot records, ratification receipts, bot-binding receipts, and activation
receipts. It references
Yawn and agent identifiers governed by the stable v1 and Agency Holarchy 0.2
layers rather than redefining those contracts.

A successful standalone Objective Holon validation therefore does not prove
that referenced Yawns, principals, policies, grants, or structural receipts
resolve. Implementations must fail closed rather than infer materialization from
an interface confirmation, infer a Yawn from objective ratification, or infer a
sleeping bot binding from either receipt.
