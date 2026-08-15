# Term-admission gate

Status: **Normative working-draft discipline**

YAWN keeps a deliberately small upper ontology. New terms create migration,
teaching, query, UI, and safety costs. A term enters the core only when it earns
those costs.

## Required evidence

A proposal for a new normative term must show all of the following:

1. **Competency gap** — identify a concrete question that current terms cannot
   answer safely or without ambiguity.
2. **Distinct referent** — show that the term is not a synonym, lifecycle state,
   facet, View, field, or convenience label for an existing object.
3. **Identity rule** — state how records receive stable IDs and when two records
   are or are not the same.
4. **Attribution rule** — state which Agent asserted, acquired, selected, or
   produced it.
5. **Temporal rule** — state whether it is an event, interval, state, revision,
   or timeless vocabulary item.
6. **Authority and privacy rule** — state what the term cannot authorize and how
   disclosure is evaluated.
7. **Proof and falsifier** — state what evidence would challenge its use.
8. **Counterexample** — include at least one case where collapsing it into a
   nearby term causes a real error.
9. **Compatibility path** — define how ambiguous legacy records remain
   proposals rather than being silently rewritten.
10. **Executable proof** — add schema, fixture, reference-integrity validation,
    and tests.

## Decision outcomes

- **Core term** — required across conforming implementations.
- **Module term** — normative only inside a named versioned contract.
- **Facet** — an attributed classification over existing records.
- **View term** — presentation vocabulary with no canonical identity.
- **Alias** — accepted human wording normalized to an existing term.
- **Deferred** — useful idea without enough distinction or evidence.
- **Rejected** — duplicates a term or weakens attribution, proof, privacy,
  authority, or replay.

## Current normalization example

Observation, Intention, Projection, and Consequence pass the gate because each
answers a different competency question and collapsing them erases provenance
or misalignment. `View` replaces the prior rendering sense of `projection` so
that an Agent's outward Projection remains separately addressable.
