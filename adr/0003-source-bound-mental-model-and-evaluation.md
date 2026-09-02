# ADR 0003: Source-bound mental models and attributed Evaluation

- **Status:** Proposed
- **Date:** 2026-09-01
- **Decision owners:** YAWN protocol maintainers and rightful principals of instantiated records
- **Scope:** `.yawn` protocol grammar and conformance artifacts; no production runtime, publication, or external effect

## Context

YAWN already distinguishes coupling, relationship, Observation, orientation, Projection, Move, Consequence, Proof, Update, View, rightful choice, and authority. Several draft branches also model a coordinate-complete `/new` workbench and a typed Move-selection seam.

A new product pressure made an unresolved gap visible. A person may submit a messy thought, transcript, archive, or artifact and ask a Yawnbot to maintain a living model around it. The desired human-facing passage sounded linear:

`Question -> Answer -> Expression -> Move -> Judgment -> Question`

Taken literally, that line would collapse several existing distinctions:

- an Answer could be mistaken for truth;
- an expression configuration could be mistaken for an expression event;
- a Move could be mistaken for execution;
- an expected outcome could be mistaken for Consequence;
- a Judgment could be mistaken for reality or Proof;
- a rendered sequence could be promoted into the ontology.

The Nestheads/Kickstarter relationship also requires unusually strict source, privacy, accountability, and publication boundaries. It is unsafe to infer personal cognition as fact, publish private history because a public View is desired, or claim that a drafted message was sent or fulfilled an earlier promise.

## Decision

### 1. The durable substrate is a typed graph

A source-bound Yawnbot is an addressable mental-model steward for one relationship to a subject. Sources, compiler proposals, cognitive facets, Questions, Positions, expression provisions, Projections, Moves, Consequences, Evaluations, proof adjudications, Updates, character Views, audience policies, and runtime bindings remain separately typed records connected by attributed relations.

The graph is primary. No universal claim is made that human cognition naturally proceeds in one fixed order.

### 2. The straight line is a rebuildable passage View

The default human-facing traversal is:

`Question -> Position -> Expression provision -> Projection -> Move -> Consequence -> Evaluation -> Proof adjudication -> Update -> Question'`

This passage is explicitly noncanonical. Stages may be absent, repeated, held, nested, disputed, simultaneous, or branched. The renderer must not fabricate missing stages to make the sequence look complete.

### 3. Position is the protocol record; “Answer” is a human-facing label

A Position is an attributed, time-indexed stance relative to a Question. It carries source references, epistemic status, confidence, alternatives, revision, and acceptance state.

`Position or Answer != truth.`

### 4. Expression provision and Projection are distinct

An expression provision configures purpose, audience, medium, aperture, constraints, selected Questions and Positions, and allowed Projection kinds. It describes how a model may be made available.

A Projection is what an attributed Agent actually represents, proposes, commits, or attempts into an Arena. A preview or draft remains a draft until an expression event exists.

`Expression provision != Projection != Move.`

### 5. Evaluation is a first-class attributed record

“Judgment” remains the preferred human-facing label. The protocol record is **Evaluation** to keep it descriptively broad and avoid implying judicial or moral authority.

An Evaluation must identify:

- evaluator;
- target and target type;
- phase;
- relationship and Arena;
- criteria snapshot and basis of each criterion;
- criterion-level assessments and rationale;
- source and evidence references;
- epistemic status and confidence;
- dissenting Evaluations;
- Questions opened by the assessment;
- time and revision.

Conflicting Evaluations may coexist. Acceptance means the Evaluation is accepted as an attributed assessment, not that its conclusion became reality.

`Consequence != Evaluation != Proof != authorization or Update.`

### 6. Before-Move prediction and after-Move assessment remain temporally honest

Move selection uses the orientation and predicted fit available at selection time. Consequences are recorded only after an executed Move or another source-backed event. Evaluation may then assess the target against explicit criteria. Proof adjudication checks named evidence against a prior proof condition. An authorized Update may follow.

Later Evaluation must not rewrite a prior selection receipt as though later knowledge were available earlier.

### 7. Source compilation is proposal-first

A source compiler preserves or references the source before proposing segmentation, thoughts, beliefs, goals, emotions, assumptions, Questions, Positions, criteria, relations, character Views, expression provisions, or Moves.

Generated proposals remain proposed until an explicit attributed disposition event. Folk-psychological facets are noncanonical interpretive handles, not discovery of a person’s hidden essence.

### 8. Character Views remain Views

Nestheads and other characters may symbolize or spatialize records. Each character View must identify what it represents.

Animation, a face, a name, or apparent agency does not create an Agent. Agent promotion continues to require identity, persistence, relationship, memory, capability, authority, activation, stop, and retirement contracts.

### 9. Connection and publication do not inherit

A portable Yawnbot package may support scoped, attributed, revocable connections. Connection does not merge identity or import truth, agreement, consent, privacy aperture, authority, or Proof.

A disclosure requirement or public-expression intention remains intent until affected owners, principals, audience, consent, redaction, and publication authorization are explicit.

`Public candidate != authorized != published.`

### 10. The package is noncanonical

`schemas/source-bound-yawnbot.v0.1.schema.json` is a portable aggregate and conformance boundary over existing YAWN records. It is not a second canonical state store. Canonical mutations continue to require the existing event, authority, Proof, and revision contracts.

## Conformance artifacts

- `core/source-bound-mental-model.yawn`
- `schemas/evaluation-record.v0.1.schema.json`
- `schemas/source-bound-yawnbot-cognition.v0.1.schema.json`
- `schemas/source-bound-yawnbot-passage.v0.1.schema.json`
- `schemas/source-bound-yawnbot-governance.v0.1.schema.json`
- `schemas/source-bound-yawnbot.v0.1.schema.json`
- `interface/source-bound-yawnbot-workbench-v0.1.yawn`
- `fixtures/dave-kickstarter-nestheads.source-bound-yawnbot.v0.1.json`
- `lib/source-bound-yawnbot-v0.1.mjs`
- `scripts/validate-source-bound-yawnbot-v0.1.mjs`
- `tests/source-bound-yawnbot-v0.1.test.mjs`

The public fixture uses source references and sanitized propositions. It does not embed exact private conversation text, claim that a founder message was sent, record invented backer responses, adjudicate Proof, apply an Update, or authorize publication.

## Alternatives considered

### A. Make the linear passage the ontology

Rejected. It makes optional or recursive human processes look mandatory, hides branching and simultaneity, and encourages renderers to fabricate completeness.

### B. Add Judgment as a field on Consequence or Move

Rejected. Reality-returned change and criteria-relative assessment have different authors, sources, uncertainty, and failure modes. Combining them would make subjective appraisal look empirical.

### C. Treat Evaluation as Proof

Rejected. Evaluation asks how a target fares relative to criteria. Proof adjudication asks whether named evidence satisfies a predeclared test. Either may be contested, but they are not interchangeable.

### D. Treat an expression template as the expression

Rejected. Provisioning, drafting, expressing, acting, and receiving Consequences are separate events.

### E. Let characters become implicit Agents

Rejected. This would reify representations, obscure authority, and create unsafe recursive delegation from visual design alone.

### F. Automatically publish records marked “must expose”

Rejected. Salience or disclosure intent cannot substitute for ownership, consent, redaction, audience resolution, or authorization.

### G. Use one monolithic schema

Rejected for this draft. Cognition, passage, Evaluation, and governance remain modular so reviewers can challenge one boundary without treating the entire aggregate as one indivisible ontology.

## Consequences

### Benefits

- Preserves the simplicity of Question / Answer / Expression / Move / Judgment while retaining protocol precision.
- Makes “According to what?” executable through criteria and source records.
- Supports conflicting perspectives without forcing consensus.
- Enables portable, connectable mental models without transitive authority or privacy.
- Gives Nestheads characters a principled role as optional cognitive Views.
- Makes unsent, unobserved, unproved, and unauthorized states structurally difficult to misrepresent.

### Costs and risks

- More record types and references increase implementation and explanation burden.
- Criteria snapshots may create false precision or bureaucratic Judgment rituals.
- Users may over-model themselves or others, producing surveillance pressure or identity reification.
- A portable package can become stale or be mistaken for the living source graph.
- Position and Evaluation may overlap with future stable contracts unless promoted carefully.

Mitigation requires progressive disclosure, one-Question choice architecture, explicit holds, source inspection, low-cost correction, retention limits, and comparison against simpler source-linked notes.

## Migration and compatibility

No accepted record is rewritten. Existing Consequence, Proof, Projection, View, Move-selection, Orientation, and authority contracts remain authoritative in their scopes. Implementations may lazily compile the new package from existing records and may omit absent stages.

The overlapping coordinate-complete New Yawn drafts should not be merged independently until their Move-selection, passage, and interface terms are reconciled with this decision.

## Falsifier

Revise or retire this decision if a simpler source-linked note/task architecture performs equally or better on attribution, correction burden, privacy, Question quality, movement, Proof closure, retained agency, and comprehension—or if this grammar increases false certainty, compulsive modeling, accidental publication, character reification, or harmful interpersonal surveillance.
