# RFC 0003: Objective holons and Yawn.bot lifecycle

- Status: proposed
- Date: 2026-08-25
- Authors: David Forman with AI-assisted synthesis
- Decision authority: founding maintainer

> Amendment notice: [RFC 0005](0005-optional-objective-promotion-and-bot-binding.md)
> replaces this RFC's linear promotion implication. Ratification may stop at an
> objective; Yawn creation, sleeping-bot binding, and activation are optional,
> separately receipted transitions.

## Summary

Add an executable lifecycle between dialogue and agent activation:

```text
signal -> typed detections -> objective candidate -> principal ratification
  -> ratified objective

optional: authorized Yawn creation -> receipted sleeping-bot binding
  -> activation receipt
```

This makes explicit that the root `.yawn` is an alignment bridge and routing
steward, not one assistant that owns every objective. A detected objective such
as “Dave wants to be a good dad” may become `yawn:dave:good-dad`, with a bounded
Yawn.bot responsible for maintaining that objective's orientation and proof
loop.

## Decision pressure

Agency Holarchy 0.2 can create child Yawns and V1 can represent optional
targets, but the repository does not currently distinguish:

- an objective detected by a parser;
- an objective ratified by its principal;
- the Yawn that holds that objective;
- the bot that stewards the Yawn; and
- the separate grant that activates the bot.

Without these distinctions, implementations tend to collapse YAWN into one
central assistant choosing likely paths, or silently turn desire into an
agentic goal.

## Proposed records

The additive `objective-holon.v0.1` contract defines:

- `CompileProjection`: typed, source-preserved detections, always-available
  correction operators, and no more than three ranked structural operations;
- `ObjectiveCandidate`: a machine-attributed hypothesis with routing reasons;
- `Objective`: a principal-ratified, finite/ongoing/open direction;
- `YawnBot`: a sleeping or active steward bound to one Yawn;
- `RatificationReceipt`: the principal's explicit response to a candidate;
- `BotBindingReceipt`: the separate absent/proposed-to-sleeping binding event;
  and
- `ActivationReceipt`: a document-local activation claim whose application
  requires external principal, grant, current-state, and idempotency checks.

The module references Yawn and agent identifiers governed elsewhere. It does
not replace stable V1 or Agency Holarchy 0.2.

## Invariants

1. Detection is not ratification.
2. Ratification is not effect authority.
3. A Yawn is the contract; a Yawn.bot is the bounded steward inside it.
4. Objective stewards hold exactly one ratified primary objective.
5. Root stewards may route multiple objectives without owning them.
6. Ratified objectives need not become Yawns, and Yawns need not receive bots.
7. New child bots begin sleeping only through a BotBindingReceipt.
8. Structural context may inherit; truth, consent, confidence, privacy,
   authority, identity, agreement, and proof do not silently inherit.
9. Duplication copies a shell, not powers or claims.
10. Ongoing objectives gather bounded progress evidence rather than global proof
   of personal identity or moral worth.
11. Personality is optional programmed projection data.
12. Operation scores declare whether they are heuristics or estimated
    posteriors; neither kind ratifies the objective or authorizes the operation.
13. Local activation validation cannot apply activation, authenticate authority,
    or grant effect authority.

## Alternatives

1. **Store the detected objective directly as a target.** Rejected because it
   erases attribution, ratification, and the higher-order objective/goal
   distinction.
2. **Treat every Yawn as an active bot.** Rejected because representation does
   not imply runtime activation or authority.
3. **Let children inherit the root bot's permissions.** Rejected because
   containment is not authorization.
4. **Model “be a good dad” as a closable proof condition.** Rejected because an
   ongoing relational objective cannot be globally proved by a score or finite
   checklist.

## Research boundary

Goal Systems Theory supports representing goals and means as a network rather
than a flat list. Hierarchical reinforcement learning supports temporally
extended subpolicies and subgoals. These are useful engineering analogies; they
do not prove that human purposes should be reduced to reward functions or that
software Yawn bots have human-like agency.

## Acceptance evidence

- schema and semantic tests pass;
- the Dave/good-dad example distinguishes candidate, ratification, external
  Agency Yawn creation, bot binding, and activation, and labels unresolved
  cross-document materialization honestly;
- objective-only and optional Yawn proposal/cross-link without bot variants
  remain valid; actual Yawn materialization remains externally resolved;
- strict `/new` binding conformance rejects objective bots without a matching
  BotBindingReceipt while generic validation preserves optional binding-field
  absence for otherwise coherent 0.1 working-draft documents;
- active bots without ratified objectives or activation receipts fail;
- parent-bot cycles fail; and
- proposed operations are ordered, detection-traceable, confirmation-requiring,
  and capped at three while correction controls remain available; and
- README, specification, interface contract, example, and research boundary
  agree on the same distinctions.
