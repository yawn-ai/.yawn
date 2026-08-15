# RFC 0005: Observation, Intention, Projection, and Consequence

Status: **Proposed**

## Summary

Reserve four distinct protocol objects for the passage through an Arena:

```text
Arena -> Observation -> Agent -> Orientation -> Choice -> Intention
  -> Projection -> Arena -> Consequence -> Observation'
```

Observation is situated acquisition. Intention is endorsed direction.
Projection is actual outward expression or attempt. Consequence is what the
Arena and reality return. The distinctions are required because misalignment
often lives in the differences between what was meant, expressed, observed,
interpreted, and produced.

## Current state and lacuna

Working Draft 0.2 represents epistemic statements inside a field but has no
first-class acquisition event. Several documents use `projection` for a
rendered interface view. Import contracts mix ontological kinds such as goal,
action, and outcome into a field called `epistemicKind`. These collisions make
it possible to:

- attribute an AI interpretation directly to a cited human source;
- treat intended meaning as the expression that actually entered an Arena;
- treat an attempted Move as the consequence or proof of that Move; or
- confuse a UI rendering with an Agent's outward Projection.

## Proposed semantics

### Observation

An `ObservationRecord` records what became available to one attributed Agent
in one Arena at a time, with source coordinates, acquisition method,
conditions, and limits. It does not assert by itself that any interpretation of
the acquired material is true.

### Epistemic statement

An `EpistemicStatement` represents what an attributed Agent says or models
about typed subjects. It records epistemic status, confidence, sources, and the
Observation records that ground it. A statement may concern an Observation,
Yawn, Agent, Arena, Intention, Projection, Consequence, proof receipt, source,
or another statement.

### Intention

An `IntentionRecord` is a presently selected or endorsed direction held by an
Agent. Its lifecycle is separate from execution: proposed, endorsed, withdrawn,
superseded, or fulfilled. An Intention can exist without any Projection.

### Projection

A `ProjectionRecord` is what an Agent actually puts into an Arena: expression,
claim, model, question, communication, proposal, commitment, or Move. It may
reference an Intention but MUST NOT inherit truth or success from it. A Move is
the subset of Projection selected as an attempt to change or preserve a
condition.

### Consequence

A `ConsequenceRecord` is an attributed occurrence or measured return after a
Projection. It may be expected, unexpected, mixed, unknown, disputed, or not
yet observed. Consequence is not proof until evaluated through an explicit
proof method and receipt.

### View

`View` replaces the rendering sense of `projection`. A View is a rebuildable
selection, aggregation, or rendering over canonical records. Legacy fields and
documents that use `projection` for rendering are deprecated compatibility
aliases and MUST NOT be confused with `ProjectionRecord`.

## Invariants

1. The same Arena MAY receive Observations and Projections.
2. Observation acquisition and statement interpretation are different IDs.
3. Intention and Projection are different IDs and MAY diverge.
4. Projection and Consequence are different IDs and MAY diverge.
5. Every Move is a Projection; not every Projection is a Move.
6. A Projection that references an Intention MUST name the relationship; the
   relationship is never inferred from temporal adjacency.
7. A Consequence MUST NOT be marked proved merely because an Agent expected it.
8. An AI-produced statement is asserted by the AI Agent or inference run. Human
   sources remain cited provenance, not reassigned authorship.
9. A Yawn remains valid without a Target, endorsed Intention, Projection, or
   selected Move.
10. None of these objects widens privacy or effect authority.

## Alternatives and counterexamples

### Collapse Intention into Projection

Rejected. An Intention may never be expressed; an expression may be accidental,
habitual, coerced, automated, or a poor representation of the Intention.

### Collapse Projection into Move

Rejected. Questions, statements, models, and communications enter an Arena but
need not be selected attempts to alter state.

### Keep Projection as the word for UI rendering

Rejected for new normative work. The same word cannot safely name both an
Agent's outward contribution and a rebuildable renderer. `View` is the
rendering term.

### Treat Observation as a claim

Rejected. Acquisition and interpretation have different provenance,
falsifiers, and failure modes. A camera exposure, message receipt, or tool read
can be recorded without adopting a statement about what it means.

## Authority, privacy, safety, and human agency

An Intention does not authorize its Projection. A Projection of kind `move`
must resolve to an applicable Authority Grant or remain proposed. Observation
and Consequence inherit neither disclosure permission nor effect authority
from their container. Public Views include only records whose own disclosure
policy permits inclusion.

The model is operational, not metaphysical. Representing an AI Agent as an
observer records acquisition and computation; it makes no claim that the AI has
conscious experience.

## Compatibility and migration

- `public-projection.v1` introduced on the unmerged draft branch is renamed
  `public-view.v1` before acceptance.
- Existing `EpistemicStatement.kind` values remain readable.
- Existing `OrientationAtom.epistemicKind` is deprecated because it mixes
  epistemic status with semantic kind. Adapters split it into a semantic record
  type plus an epistemic status; ambiguous records remain proposals.
- Legacy rendering fields named `projection` remain readable at system
  boundaries but serialize as `view` in new contracts.
- Existing records are never silently promoted, rewritten, or assigned a new
  author during migration.

## Schemas, examples, and conformance tests

This RFC is accompanied by:

- `orientation-framework-v1.yawn`;
- `schemas/orientation-passage.v1.schema.json`;
- `fixtures/orientation-passage.v1.json`;
- `schemas/public-view.v1.schema.json`; and
- semantic tests for reference integrity, attribution, move subset, proof
  separation, optionality, and deterministic public snapshot hashing.

## Competency questions and falsifiers

An implementation must answer:

- What exactly became available, to whom, in which Arena, when, and under what
  limits?
- Which statement represents the observation, and who asserted that statement?
- What did the Agent intend?
- What did the Agent actually project?
- Was the Projection a Move, and which grant authorized it?
- What consequence occurred independently of prediction?
- What proof evaluated that consequence?
- What did the next Agent observe, and how did its interpretation differ?

The RFC is falsified if conforming storage cannot reconstruct those answers
without assigning unstated intention, authorship, success, consent, or
authority.

## Decision and implementation receipt

This RFC remains proposed. Acceptance requires an authenticated authorized
decision and append-only receipt. The draft itself authorizes no mutation or
external effect.
