# RFC 0003 — Relational Reconstruction and Digital Compost

Status: **Working proposal**  
Date: 2026-08-17

## Abstract

YAWN should distinguish **what an agent directly had access to** from **what becomes knowable later through relationships, traces, other agents, artifacts, and consequences**.

This closes a missing link in the relationship-first ontology.

An agent's usable world-model is not assembled from first-person observation alone. It is continuously reconstructed from a distributed evidence field. Memory, testimony, logs, photographs, receipts, messages, changed relationships, bodily consequences, environmental traces, and later observations may all disclose aspects of an event that were unavailable to the focal agent when the event occurred.

This RFC names that process **relational reconstruction**.

It also proposes a retention principle: discarded, superseded, low-salience, or currently unused information should not automatically be treated as meaningless trash. When lawful, consent-compatible, affordable, and safe to retain, it may remain available as **cold provenance** from which future orientation can learn. This is called **digital compost**, not because all data is valuable forever, but because present irrelevance is not equivalent to permanent uselessness.

Neither principle authorizes surveillance, infinite retention, involuntary memory, or retrospective certainty.

---

## 1. Motivating example: an episode with impaired memory

Consider a person who becomes severely intoxicated, later has only fragmentary episodic memory, and regrets actions from the period.

The person may possess:

- a few direct remembered frames;
- bodily or environmental traces;
- messages they sent;
- photographs or video;
- transaction or location records;
- reports from other people;
- another person's emotional response;
- later consequences;
- inferences that connect those sources;
- uncertainty that never fully resolves.

The important point is epistemic, not diagnostic:

> The focal agent can learn about an event that the focal agent did not continuously observe or later remember.

Their later orientation emerges from a relationship among multiple evidence-bearing participants and traces.

```text
                           other agent report
                                  ↓
fragmentary memory ──→ RELATIONAL EVIDENCE FIELD ←── messages / artifacts
                                  ↑
                         consequence / changed relation
                                  ↓
                         reconstructed account
                                  ↓
                        present orientation
```

This does **not** imply that every report is accurate, that memory fragments are reliable, or that reconstruction recovers a perfect hidden past. Human memory is reconstructive, testimony can conflict, records can be incomplete, and later interpretation can be biased.

YAWN's role is to preserve those differences rather than collapse them into one story.

---

## 2. The missing distinction

The current relationship-first loop remains useful:

```text
Relationship → Observation → Relevance → Orientation → Intention
             → Projection → Consequence → Proof → Updated Relationship
```

But `Observation` must not be read as synonymous with **the focal agent's immediate first-person perception**.

A relationship can mediate later observations about earlier events.

For example:

```text
Event E at t0

Agent A access at t0:
  partial / impaired / absent

Agent B access at t0:
  reportable observation

Artifact C:
  durable trace of E

Consequence D at t1:
  new evidence about E

Agent A at t2:
  observes B's report, C, and D
  → forms attributed reconstruction of E
```

Agent A did not retroactively perceive `E` at `t0`.

Agent A **did** directly observe evidence about `E` at `t2`.

This distinction is foundational.

---

## 3. Proposed primitive: Evidence Field

YAWN already uses `Field` for signals and information available to an observer. This RFC specializes that concept for reconstruction without introducing a new metaphysical object.

An **evidence field** is the attributed set of observations, traces, reports, artifacts, consequences, and absences currently available for evaluating a claim or reconstructing an episode.

```yaml
evidence_field:
  focal_episode:
  horizon:
  participants:
  direct_observations: []
  reported_observations: []
  artifacts: []
  consequences: []
  absences: []
  conflicts: []
  unknowns: []
```

An evidence field is a View over existing records. It is not automatically canonical truth.

---

## 4. Proposed operation: Relational Reconstruction

**Relational reconstruction** is an attributed inference process that proposes an account of an event or state from evidence distributed across relationships and time.

```text
sources + relationships + traces + consequences
                    ↓
          relational reconstruction
                    ↓
          candidate account / model
                    ↓
       uncertainty + alternatives preserved
```

A reconstruction MUST preserve:

1. the focal event or question;
2. each source independently;
3. who or what had access to what;
4. timestamps or temporal uncertainty;
5. direct observation versus report versus inference;
6. conflicts among sources;
7. missing evidence;
8. confidence or uncertainty per claim;
9. alternative reconstructions when materially plausible;
10. provenance linking every reconstructed claim back to evidence.

A reconstruction MUST NOT silently overwrite the underlying observations.

---

## 5. Epistemic grammar

The existing statuses remain canonical:

```text
observed | reported | inferred | assumed | predicted | disputed | unknown
```

Relational reconstruction composes them rather than inventing a new truth status.

Example:

```yaml
episode:
  claim: "I argued with someone after leaving the restaurant."
  epistemic_status: inferred
  confidence: 0.72
  evidence:
    - source: memory-fragment-1
      status: reported
      contribution: "remembers being outside and angry"
    - source: witness-b
      status: reported
      contribution: "reports an argument"
    - source: message-42
      status: observed
      contribution: "message sent afterward references an argument"
  conflicts:
    - "exact words and sequence remain disputed"
  unknown:
    - "whether the argument began inside or outside"
```

The system may say **the evidence currently supports this reconstruction**.

It may not say **this is what definitely happened** unless the relevant proof standard actually warrants that claim.

---

## 6. Relationship as epistemic infrastructure

This RFC sharpens the meaning of relationship-first.

Relationship is not only what shapes current relevance and affordance. Relationships can also function as **distributed epistemic infrastructure**.

Another agent may observe what I cannot.

An artifact may preserve what I forget.

A consequence may reveal what an intention concealed.

A changed relationship may become evidence that something consequential occurred without uniquely determining what occurred.

A future version of me may reinterpret evidence differently from a past version of me.

Therefore:

> An agent's inspectable orientation can exceed the agent's immediate perception without pretending to exceed the evidence available through the relationship field.

This is the stronger formulation.

It avoids both extremes:

- **solipsism:** only my direct perception counts;
- **naive omniscience:** combining enough data reveals reality exactly.

---

## 7. Memory is evidence, not replay

YAWN should never model autobiographical memory as a perfect recording.

A remembered episode is an attributed present report about past experience.

```yaml
memory_report:
  experiencer: agent-a
  reported_at: t2
  refers_to: episode-e-at-t0
  content:
  vividness:
  confidence:
  gaps:
  source_status: reported
```

If a person remembers only fragments, YAWN preserves fragments.

If later testimony changes their interpretation, YAWN records the new interpretation without rewriting the earlier memory report.

If two people remember the same event differently, both reports can coexist.

The disagreement is information.

---

## 8. Regret illustrates the separation of planes

Regret is particularly useful because it demonstrates why YAWN separates world, epistemic, normative, and action planes.

A person can regret an action even when their knowledge of the action is reconstructed rather than directly remembered.

```text
WORLD
candidate account of what occurred

EPISTEMIC
how the person currently knows or infers it

NORMATIVE
why the action conflicts with present values, commitments, or relationships

ACTION
what repair, acceptance, boundary, or future change is possible now
```

The normative judgment does not prove the historical reconstruction.

The historical uncertainty does not make the regret unreal.

And regret does not automatically dictate the appropriate next action.

These distinctions are precisely what an orientation protocol should preserve.

---

## 9. Digital compost: there is less trash, not no trash

A tempting formulation is:

> There is no digital trash. Everything is data.

YAWN should preserve the intuition but reject the absolute claim.

Some information that appears useless now can become useful later because new relationships, questions, models, or computational capabilities make old traces newly relevant.

Examples include:

- superseded drafts that explain why a decision changed;
- rejected hypotheses that prevent repeated mistakes;
- old preferences that reveal drift;
- dead code that preserves design intent or failed approaches;
- unresolved questions that become answerable later;
- low-confidence observations that gain corroboration;
- obsolete interfaces that reveal product evolution.

Call this **digital compost**:

> Information removed from the active aperture but retained, when justified, as low-cost provenance that may acquire future relevance.

But some digital material genuinely should be deleted:

- secrets and credentials;
- unlawfully obtained data;
- data whose retention violates consent or policy;
- unnecessary sensitive personal information;
- redundant high-risk data;
- corrupt or malicious payloads;
- information subject to a valid deletion requirement;
- material whose retention cost or harm exceeds plausible future value.

Therefore the principle is:

> **Do not confuse low current salience with zero future information value; do not confuse possible future value with permission to retain.**

---

## 10. Retention is a normative and economic decision

Falling storage and compute costs change the feasible retention frontier, but they do not eliminate privacy, security, cognitive, environmental, or governance costs.

Retention should be evaluated across independent dimensions:

```yaml
retention:
  future_information_value:
  provenance_value:
  legal_basis:
  consent:
  privacy_risk:
  security_risk:
  storage_cost:
  retrieval_cost:
  cognitive_noise:
  duplication:
  reversibility:
  deletion_obligation:
  owner_authority:
```

Possible lifecycle:

```text
ACTIVE
  ↓
LOW-SALIENCE
  ↓
COLD PROVENANCE
  ↓           ↘
REACTIVATED    DELETED
```

Nothing enters cold provenance merely because an AI predicts that it might someday be useful.

---

## 11. Forgetting is also a capability

A mature memory architecture needs both retention and forgetting.

Biological cognition does not preserve every sensory detail indefinitely, and useful computational systems likewise require compression, abstraction, deduplication, and deletion.

YAWN should therefore distinguish:

- **source preservation** — retain the original when justified;
- **active memory** — currently salient information;
- **summary / abstraction** — compressed representation;
- **cold provenance** — retained but not actively surfaced;
- **tombstone** — evidence that something existed or was deleted without retaining prohibited content;
- **hard deletion** — bytes intentionally removed when required or justified.

Forgetting is not automatically data loss. It can be privacy, safety, compression, relevance realization, or respect for human agency.

---

## 12. Interface implication: the View emerges from the relationship field

The interface should not be a fixed form exposing every ontology field.

For a focal object, YAWN.bot can construct an aperture from the currently relevant relationship neighborhood:

```text
                  open question
                       │
source ── relationship ── FOCAL CLUSTER ── consequence
                       │
                   possible move
```

The visible View may change when:

- a new source arrives;
- a relationship becomes more or less relevant;
- an uncertainty is resolved;
- authority changes;
- a consequence returns;
- a new question becomes more informative;
- the user changes aperture.

But presentation weighting must remain inspectable. Salience is not truth.

A View emerging from relationships means **the renderer selects and arranges attributable records according to the current orientation problem**. It does not mean the UI magically discovers objective meaning.

---

## 13. Implication for semantic clusters and AI

The current token-cluster intuition becomes more precise under this RFC.

Raw tokenizer units are model-specific segmentation. They are not stable human concepts.

A YAWN semantic cluster can instead be treated as a temporary inspectable handle over a relationship neighborhood:

```yaml
semantic_cluster:
  focal_label:
  source_spans: []
  related_records: []
  relationship_types: []
  definitions: []
  open_questions: []
  epistemic_statuses: []
  salience_basis: []
  provenance: []
```

Machine representations—tokens, embeddings, activations, model outputs—may contribute evidence to candidate clustering when available and authorized.

They do not determine semantic identity, human meaning, or action authority.

The meeting surface between human and machine intelligence is therefore not the raw token itself. It is the **inspectable, attributed relationship structure around a semantic handle**.

---

## 14. Recursive learning implication

This produces a more defensible recursive improvement loop:

```text
new event / source / consequence
          ↓
relationship field changes
          ↓
new evidence becomes available
          ↓
reconstruction may update
          ↓
orientation changes
          ↓
new question or move becomes relevant
          ↓
consequence
          ↓
proof
          ↓
relationship updates again
```

Nothing requires deleting prior mistakes from history.

A rejected interpretation can become evidence about how the system tends to misinterpret.

A bad interface can become evidence about projection failure.

A failed action can become evidence about affordances or assumptions.

A superseded preference can become evidence of human change.

This is how historical residue can support recursive learning without becoming permanent active clutter.

---

## 15. Required invariants

Any implementation of relational reconstruction or digital compost MUST preserve:

1. **Source ≠ reconstruction.**
2. **Memory ≠ recording.**
3. **Report ≠ observation of the reported event by the recipient.**
4. **Corroboration ≠ certainty.**
5. **Salience ≠ truth.**
6. **Retention ≠ relevance.**
7. **Possible future value ≠ permission to retain.**
8. **Deletion ≠ proof that an event never occurred.**
9. **A semantic cluster ≠ a raw tokenizer token.**
10. **Inference ≠ authority.**
11. **Reconstruction cannot silently overwrite source records.**
12. **A changed relationship can be evidence without uniquely determining its cause.**
13. **A model may propose links; rightful authority governs adoption and action.**
14. **Reality remains larger than the retained evidence field.**

---

## 16. Minimal `.yawn` example

```yaml
title: "Reconstructing an episode I only partly remember"

relationship:
  focal_agent: me
  arena: "the previous evening"

observations:
  - source: me
    epistemic_status: reported
    content: "I remember leaving the restaurant, then only fragments."
  - source: friend-a
    epistemic_status: reported
    content: "They report that I argued with someone later."
  - source: message-log
    epistemic_status: observed
    content: "A message sent at 00:41 appears to refer to an argument."

reconstruction:
  epistemic_status: inferred
  candidate: "An argument probably occurred after I left the restaurant."
  confidence: 0.72
  alternatives:
    - "The message may refer to an earlier disagreement."

lacuna:
  - "What actually happened between leaving and the message?"

normative:
  reported_value_conflict: "The candidate behavior conflicts with how I want to treat people."

possible_move:
  - "Ask the friend for a factual account without leading the answer."

proof:
  - "Compare the new report against existing independent evidence and preserve disagreements."

retention:
  active:
    - reconstruction
    - lacuna
  cold_provenance:
    - original message metadata if retention is authorized
  delete:
    - unnecessary sensitive third-party content
```

---

## 17. Product consequence

The user-facing lesson should remain simple:

> **You