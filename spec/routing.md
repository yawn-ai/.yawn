# Arena discovery and Yawn routing

Status: **Working Draft 0.2**

The orienting agent's first structural job is to infer the smallest adequate
arena in which one authorized, falsifiable move makes sense—and then propose
where the corresponding Yawn belongs in the holarchy.

This is a routing proposal, not an automatic truth claim. Low-confidence or
high-consequence cases remain on hold for human review.

## Resolve the arena first

An arena description should answer:

- What purpose makes this slice relevant now?
- Which agents participate, observe, decide, or are affected?
- What state, affordances, impediments, resources, and constraints matter?
- What authority and privacy boundaries apply?
- What is admitted, excluded, unknown, or likely to require reframing?
- What open turns or external events can change the situation?

World, field, arena, and Yawn remain distinct. The field is what the agent can
currently access. The arena is the provisional task-relevant slice. The Yawn
is the durable contract for one live lacuna or transition within it.

## Outcomes

| Proposal | Use when |
| --- | --- |
| `attach` | This is new evidence or state for the same Yawn contract |
| `create_child` | It is an independently completable sub-contract whose proof advances the parent |
| `create_sibling` | It shares a coordinating parent but has a different proof, owner, or transition |
| `create_parent` | A genuine coordinating contract is missing |
| `create_root` | No safe parent exists and the contract is independently meaningful |
| `link` | The records overlap, depend on, support, or conflict without being the same contract |
| `merge_candidate` | Two Yawns appear to encode the same arena, transition, authority, and proof contract |
| `split_candidate` | One Yawn contains independently closable transitions, proofs, owners, or permission scopes |
| `hold` | Evidence, authority, privacy, or structural confidence is insufficient |

“Related” is not the same as “identical.” Link by default when a merge would
erase meaningful provenance, disagreement, ownership, or proof boundaries.

## Hard gates before similarity

Implementations MUST evaluate these before ranking candidates:

1. permission and authority compatibility;
2. privacy, visibility, and egress constraints;
3. preservation of source attribution and disputes;
4. compatibility of proof obligations and falsifiers;
5. satisfiable parent/child inheritance rules;
6. independently meaningful transition boundaries; and
7. required human review.

Embeddings, keywords, spatial coordinates, and filenames MAY retrieve
candidates. They MUST NOT determine identity, containment, merge, or disclosure.

## Three independent confidence dimensions

- **Orientation coverage**: how much decision-relevant context is represented.
- **Claim confidence**: how well a particular proposition fits its evidence.
- **Routing confidence**: how well a proposed structural relationship fits the
  routing criteria.

A Yawn exists partly to hold lacunae, so incomplete orientation or low claim
confidence is not a reason to reject it. It is a reason to keep the uncertainty
visible. Structural confidence determines whether the routing proposal can be
accepted, not whether the underlying experience is important.

## Informative candidate score

Draft implementations may compare a candidate using:

```text
same_contract_score =
  routing_coverage
  × (0.30 goal_or_purpose_equivalence
     + 0.20 proof_equivalence
     + 0.20 arena_overlap
     + 0.15 causal_continuity
     + 0.10 stable_identity
     + 0.05 semantic_similarity)
  − 0.30 exception_cost
```

This formula is **informative**, not normative. It deliberately gives semantic
similarity the weakest weight. For non-goal Yawns, `goal_or_purpose_equivalence`
means equivalence of the holding, inquiry, maintenance, safety, or archival
purpose.

Minimum-description-length reasoning can serve as a guard: prefer the structure
that explains the records with the fewest special cases while preserving proof,
authority, privacy, and provenance. Compression never overrides the hard gates
or human authorization.

## Merge and split tests

Propose a merge only if the records can share one identity, arena boundary,
primary purpose or transition, authority scope, and proof contract without
losing disputes or provenance.

Propose a split when at least one of these is independently closable:

- a goal or non-goal purpose;
- a proof condition;
- an accountable owner;
- a permission/privacy scope; or
- a causal lifecycle.

Accepted operations produce a [structural change receipt](holarchy.md), aliases
or redirects, and replayable events. Rejected proposals remain part of the
decision history.
