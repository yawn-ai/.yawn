# YAWN Relational Reconstruction — Implementation Handoff

Date: 2026-08-17  
Status: implementation brief; RFC remains proposed

## Read first

Before changing ontology or schema, read:

1. `README.md`
2. `spec/ontology.md`
3. `core/RELATIONSHIP_FIRST_AGENT_ARENA.yawn`
4. `rfcs/0002-inquiry-aperture-one-question-face.md`
5. `rfcs/0003-relational-reconstruction-and-digital-compost.md`

Do not rename `.yawn`. Speech-to-text variants such as `.yon` are normalized only when the referent is clearly YAWN.

## The insight to implement

The relationship-first ontology is missing an explicit account of **distributed knowing across time**.

A focal agent does not need to have directly perceived or remembered an event in order to later orient toward it. Other agents, artifacts, logs, consequences, and changed relationships can provide evidence. The focal agent observes those sources later and constructs an attributed, revisable account.

The key distinction is:

```text
Event at t0
≠
focal agent's access at t0
≠
later evidence about the event
≠
reconstruction at t2
≠
present meaning / regret / judgment
≠
next authorized action
```

Do not collapse these.

## Canonical working terms

### Evidence field

A View over independently attributed observations, reports, artifacts, consequences, conflicts, absences, and unknowns relevant to a focal claim or episode.

Prefer making this a specialization/View over existing Field and record types rather than a new top-level metaphysical primitive.

### Relational reconstruction

An attributed inference operation that proposes an account from evidence distributed across relationships and time.

It must preserve source-level provenance, conflicts, uncertainty, alternatives, and temporal access.

### Digital compost

Low-current-salience information retained as cold provenance when retention is lawful, consent-compatible, safe, economical, and authorized because future questions may make it relevant again.

Digital compost is not a justification for infinite retention.

### Semantic cluster

An inspectable handle over a relationship neighborhood containing source spans, records, definitions, epistemic statuses, questions, and provenance.

A semantic cluster is not a tokenizer token and does not imply identical internal representation across human and machine agents.

## Why the blackout example matters

Use the impaired-memory example as a test fixture, not as a claim about intoxication or a diagnostic model.

A person may have:

- fragmentary first-person memory;
- another person's report;
- a message log;
- later consequences;
- a present value conflict;
- regret;
- unresolved uncertainty.

The system should be able to say:

> “The current evidence supports this reconstruction with these unresolved gaps.”

It should not silently convert witness reports into the person's own observations or convert regret into proof of what happened.

## Required epistemic distinctions

Preserve:

```text
observed | reported | inferred | assumed | predicted | disputed | unknown
```

Also preserve:

```text
source ≠ reconstruction
memory ≠ recording
report ≠ recipient observation of the historical event
corroboration ≠ certainty
regret ≠ proof
confidence ≠ permission
salience ≠ truth
```

## Relationship-first update

Do not replace the current loop:

```text
Relationship → Observation → Relevance → Orientation → Intention
             → Projection → Consequence → Proof → Updated Relationship
```

Clarify it.

A relationship can carry evidence across agents and time. Observation remains operationally first because the focal agent must observe the presently available evidence. Relationship remains structurally first because access, testimony, artifacts, trust, authority, and consequence all arise through situated relations.

A useful nested representation is:

```text
Relationship_t0
  → event / projection / consequence
  → distributed traces

Relationship_t2
  → observation of traces
  → evidence field
  → relational reconstruction
  → orientation
  → question / move
  → consequence
  → proof
  → updated relationship
```

## Data lifecycle

Do not implement “there is no trash” literally.

Use:

```text
ACTIVE
→ LOW-SALIENCE
→ COLD PROVENANCE
→ REACTIVATED | DELETED
```

Add explicit retention dimensions before building automated archival behavior:

- future information value;
- provenance value;
- legal basis;
- consent;
- privacy risk;
- security risk;
- storage/retrieval cost;
- cognitive noise;
- duplication;
- reversibility;
- deletion obligation;
- owner authority.

Support tombstones where deletion should preserve only the fact that a record existed or was intentionally removed.

## Interface consequence

Do not add another ontology dashboard.

The UI should emerge as a **purpose-specific aperture over the relationship neighborhood**.

For a focal cluster, default to:

```text
              highest-value open question
                         │
important source ── FOCAL CLUSTER ── consequence / proof
                         │
                  possible next move
```

Then allow drill-down into:

- source provenance;
- conflicting accounts;
- timeline;
- definitions;
- confidence and uncertainty;
- relationship explanation;
- retention state;
- history of reconstruction changes.

The renderer may rank what is shown. It must expose why the ranking occurred. Salience is never canonical truth.

## Implementation sequence

1. **Ontology text only.** Integrate the RFC distinctions into `spec/ontology.md` without prematurely creating new core nouns.
2. **Examples/fixtures.** Add a relational-reconstruction example with fragmentary memory, testimony, artifact evidence, conflict, and an unresolved lacuna.
3. **Schema proposal.** Determine whether existing Observation / claim / provenance structures can represent reconstruction. Prefer composition before adding schema.
4. **Retention proposal.** Specify active, low-salience, cold-provenance, tombstone, and deletion semantics with privacy/authority gates.
5. **View contract.** Define a reconstruction aperture showing the smallest useful evidence neighborhood.
6. **Tests.** Prove source/reconstruction separation, contradictory testimony preservation, no authority inference, deterministic serialization/replay, and deletion boundaries.
7. **Only then** consider implementation in YAWN.bot or YAWN.ai.

## Tests that must fail if the system is wrong

- Witness testimony is relabeled as the focal agent's direct observation.
- A high-confidence reconstruction overwrites the original source.
- Two contradictory reports are merged into one unqualified fact.
- Regret is used as evidence that the reconstructed event definitely happened.
- A semantic cluster is represented as a raw tokenizer token.
- An embedding similarity score merges semantic identity automatically.
- Old information is retained despite an explicit deletion requirement.
- Deleted sensitive content remains recoverable through a supposedly harmless View.
- A changed relationship is treated as proof of one unique causal story.
- AI inference grants itself authority to act or retain data.

## Success criterion

The architecture should support this sentence without contradiction:

> **YAWN lets an agent orient beyond the limits of its own memory by inspecting evidence distributed across relationships, while preserving the difference between what happened, what was observed, what was reported, what is reconstructed, what it means, and what anyone is authorized to do next.**

If an implementation makes that sentence less true, it is moving in the wrong direction.
