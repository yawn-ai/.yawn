# RFC 0005: Optional objective promotion and receipted bot binding

- Status: proposed
- Date: 2026-08-28
- Authors: David Forman with AI-assisted synthesis
- Decision authority: founding maintainer
- Amends: RFC 0003

## 1. Summary and status

Amend Objective Holon Working Draft 0.1 so objective adoption and structural
promotion are genuinely separate:

```text
objective candidate -> RatificationReceipt -> ratified objective

optional:
  exact proposed RoutingProposal -> StructuralChangeReceipt(create_yawn)
    -> materialized Yawn
  BotBindingReceipt -> sleeping bot binding
  ActivationReceipt -> active bounded stewardship
```

Not every ratified objective needs a Yawn. Not every Yawn needs a bot. Neither
ratification nor Yawn creation silently creates a sleeping bot.

This RFC is proposed. The amended records remain working drafts pending
maintainer review.

## 2. Current state and lacuna

The first Objective Holon draft required non-null proposed Yawn and bot refs on
every ObjectiveCandidate. An accepted RatificationReceipt also required both
refs, and local semantics treated the ratification as the bot's binding proof.
That shape contradicted the stated ontology: a direction may be ratified and
held without deserving a new holon or runtime.

The draft also had no first-class record for the transition from an absent or
proposed bot to a sleeping bot bound to an already materialized Yawn. The
missing record made that transition appear as an unreceipted canonical mutation.

## 3. Proposed semantics and invariants

`proposedYawnRef` and `proposedBotRef` remain present on ObjectiveCandidate for
serialization continuity but may be null. A bot proposal requires a Yawn
proposal. An accepted RatificationReceipt requires only `objectiveRef`; its
optional Yawn and bot refs retain accepted proposal context and authorize no
structural transition.

BotBindingReceipt claims principal authorization and records a separate
transition from `absent` or `proposed` to a `sleeping` binding. It names:

- the exact objective, Yawn, bot, and principal;
- an accepted RatificationReceipt naming the same objective and principal;
- the Agency Holarchy StructuralChangeReceipt that created the Yawn;
- the authority record and explicit authorized status; and
- fixed-false activation, authority-grant, effect-authority, and external-effect
  flags.

Document-local validation cannot prove that external authority, current head,
RoutingProposal, or StructuralChangeReceipt records resolve. Applying a binding
must fail closed until an aggregate resolver authenticates those records and
the current append-only state.

The lifecycle invariants are:

1. Detection is not ratification.
2. Ratification creates an objective only; structural refs are optional context.
3. Yawn creation requires Agency Holarchy `StructuralChangeReceipt(create_yawn)`.
4. Bot binding requires its own BotBindingReceipt and begins sleeping.
5. Activation requires a separate ActivationReceipt.
6. Binding and activation grant no effect authority.
7. V0.1 permits at most one RatificationReceipt per candidate and exactly one
   matching accepted receipt per Objective; candidate and Objective are
   one-to-one.
8. A changed decision requires a new corrected candidate ID until a future
   supersession/head-chain contract exists. Strict conformance carries that
   link in `correctedCandidateRef`, which resolves to a distinct same-principal
   candidate produced no earlier than the correction receipt.
9. The strict `/new` profile requires exactly one binding and permits at most
   one activation receipt for each objective-steward or worker bot. The root
   steward carries no binding receipt. A retired non-root bot may retain its
   activation receipt only as historical provenance, not current authority;
   pause/reactivation/retirement history awaits that same supersession contract.
10. Applying activation requires external principal authentication, exact grant
    and current-state resolution, and receipt-ID idempotency. Local validation
    cannot activate a bot or establish authority.

## 4. Alternatives and counterexamples

1. **Require a Yawn and bot for every accepted objective.** Rejected because it
   turns conceptual adoption into automatic architecture and runtime.
2. **Let RatificationReceipt double as a binding receipt.** Rejected because the
   rightful decision to hold an objective is not proof of materialization,
   current head, or bot binding.
3. **Let StructuralChangeReceipt create and activate the bot.** Rejected because
   Yawn topology, bot binding, runtime activation, and effect authority have
   different principals, checks, and consequences.
4. **Require new binding fields in every earlier 0.1 document.** Rejected because
   absent binding fields remain valid in the base grammar. This does not promise
   that every earlier working-draft document passes the tightened semantic
   invariants.

## 5. Authority, privacy, safety, and human-agency effects

A BotBindingReceipt carries an authority reference and an authorization claim,
but local validation does not authenticate either. Its closed effect flags are
false. It cannot activate the bot, grant authority, widen privacy, or authorize
an external effect. Context inheritance remains proposal-only for truth,
identity, agreement, consent, privacy, confidence, proof, and effect authority.

## 6. Compatibility and migration

These changes are additive relative to stable V1, which is unchanged. Within
the Objective Holon 0.1 working draft, proposed structural refs are loosened and
`botBindingReceipts` plus per-bot `bindingReceiptRefs` remain optional in the
base grammar, so binding-field absence alone does not invalidate a document.

This is not a blanket compatibility promise for every earlier working-draft
Objective Holon document. Generic `validateObjectiveHolonSemantics` now closes
ratification cardinality, corrected decisions, root topology, lifecycle-state,
and chronology invariants; documents violating those rules require migration.
The closed `yawn.bot/new.v0.1` profile additionally uses the stricter
`validateObjectiveHolonBindingConformance` path: every objective-steward or
worker bot must have a matching BotBindingReceipt. This separates base-grammar
compatibility from the stronger current product claim.

## 7. Schemas, examples, and conformance tests

The Objective Holon schema, semantic validator, canonical Dave/good-dad fixture,
human example, template, compiler contract, and specification carry the amended
lifecycle. The canonical example exposes four distinct records:

1. RatificationReceipt;
2. external Agency StructuralChangeReceipt(create_yawn);
3. BotBindingReceipt to sleeping; and
4. ActivationReceipt to active.

Tests prove that objective-only and optional Yawn proposal/cross-link without
bot variants remain valid, binding-field absence remains valid under generic
local validation, strict binding conformance
rejects an unreceipted objective bot, and no ratification or binding receipt can
stand in for activation or effect authority.

## 8. Evidence, open questions, and falsifiers

The aggregate objective/Yawn/authority resolver remains open. The human example
therefore labels its materialized Yawn projection informative and unresolved;
it does not claim end-to-end conformance merely because refs agree locally.

Optional Yawn and bot refs on the earlier ratification never gate later
promotion: the StructuralChangeReceipt governs the actual Yawn and the
BotBindingReceipt governs the actual bot.

Ratification, binding, and activation supersession/head chains remain an
explicit future contract. V0.1 rejects ambiguous duplicate current receipts
rather than inventing ordering from timestamps alone.

Current snapshots use a closed state matrix: a paused objective permits only a
sleeping or paused bot, while a retired/revoked objective permits only a retired
bot. This checks snapshot coherence but does not invent the missing transition
history receipts.

This proposal is falsified if an objective requires a Yawn to be ratified; a bot
exists without a binding receipt under the strict `/new` profile; a binding
receipt resolves against a different ratification; or binding activates a bot,
grants authority, or authorizes an effect.

## 9. Decision and implementation receipt

Decision: pending authenticated maintainer review.

The amendment must be reviewed and merged through repository governance. No
working-draft schema or RFC is treated as accepted before that review.
