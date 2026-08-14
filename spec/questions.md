# The nine orientation questions

Status: **Working Draft 0.2**

Questions are projections over the ontology, not the ontology itself. A human
may answer them in any order, an interface may ask only the next three that
matter, and a machine import may populate the same semantic fields without
asking them verbatim.

## Canonical question set

1. **What is this Yawn about?**
2. **Where does it belong?**
3. **Whose perspective is represented, and who is affected?**
4. **What appears to be happening now?**
5. **What are you trying to make true, preserve, learn, avoid, repair,
   coordinate, decide, or accept—and why?**
6. **What is unknown, disputed, constrained, dependent, or in tension?**
7. **What must be protected, and who may decide or act?**
8. **What can move next?**
9. **What would reality have to show for this Yawn to update or close?**

## Traceability

| # | Plane | Concepts populated | Readiness signal |
| --- | --- | --- | --- |
| 1 | World | scope, subject, source | signal is bounded enough to hold |
| 2 | World / Governance | arena, primary parent, lateral relations | a routing proposal can be made |
| 3 | World / Provenance | agents, roles, perspectives, affected parties | attribution is visible |
| 4 | World / Epistemic | field, observations, reports, current state | current claims have statuses and sources |
| 5 | Normative / Action | values, optional target, purpose, motivation | desire is separate from agreement and authority |
| 6 | Epistemic | lacunae, disputes, constraints, dependencies | missing structure is explicit |
| 7 | Normative / Governance | boundaries, privacy, decision rights, grants | unsafe moves can be excluded |
| 8 | Action | affordances, candidate moves, waits, delegations | an authorized next turn may be proposed |
| 9 | Epistemic / Temporal | prediction, verifier, falsifier, proof, close rule | consequences can update the map |

## Coverage is not truth

Each answer carries its own source, epistemic status, confidence, freshness,
observer, visibility, and dispute state. “Nine of nine answered” is orientation
coverage, not proof that the answers are correct.

A valid Yawn may intentionally leave questions unanswered. Skipped or unknown
answers become explicit lacunae; the system MUST NOT fabricate completion.
High coverage is useful for consequential routing, merge, and split decisions,
but no universal score automatically authorizes those operations.

## Adaptive interfaces

An interface SHOULD foreground no more questions than a person can usefully
answer at once. Prioritize:

1. safety or authority blockers;
2. missing information that blocks movement;
3. high-consequence, low-confidence claims;
4. contradiction or dispute;
5. stale, high-impact information; and
6. questions with high expected information value.

The original source language remains available. A system-generated answer is a
proposal, visibly attributed to the system, until an authorized person accepts
or edits it.
