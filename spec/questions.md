# Orientation questions and adaptive inquiry

Status: **Working Draft 0.2**

Questions are projections over the ontology, not the ontology itself. The nine
keys below are stable semantic coverage axes, not a universal interview order
or a claim about the biological questions every organism asks. A person may
enter through any question or medium; an interface may ask only the next useful
question; and an import may populate the same axes without asking them
verbatim.

## Stable semantic axes

| Key | Default prompt | Important alternate probes |
| --- | --- | --- |
| `scope` | What has your attention, and what episode are we orienting? | What is in or out of scope? |
| `placement` | Where and when is this happening, and which relationship or Arena is active? | Structural placement in the Yawn holarchy is normally derived afterward. |
| `perspective` | Who are you here, in what role, and who participates or is affected? | Who reports, observes, decides, or bears consequences? |
| `current-state` | What appears to be happening now? | What is happening in the body, environment, relationship, resources, and capabilities? |
| `intent` | What matters, is needed, or is being protected—and why? | Is a purpose, mission, objective, or obligation chosen, inherited, imposed, requested, or unclear? |
| `lacuna` | What is unknown, disputed, constrained, dependent, or in tension? | Which answer would actually change orientation? |
| `boundary` | What must be protected, and who may decide or act? | What is requested or needed from you, by whom, and is it genuinely authorized or owed? |
| `movement` | What is possible next? | Presence, observe, ask, cooperate, voice, exit, redesign, compete, wait, or make one bounded move? |
| `proof` | What would reality have to show for this map to update? | What consequence, falsifier, or observation would revise the Yawn or relationship? |

“What is needed from me?” is always an attributed request, commitment, or
authority question. Another party's need does not create an obligation by
inference. Purpose and mission are possible chosen or inherited commitments,
not mandatory biological fields.

## Traceability

| # | Plane | Concepts populated | Readiness signal |
| --- | --- | --- | --- |
| 1 | World | scope, subject, source | signal is bounded enough to hold |
| 2 | World / Governance | arena, primary parent, lateral relations | a routing proposal can be made |
| 3 | World / Provenance | agents, roles, perspectives, affected parties | attribution is visible |
| 4 | World / Epistemic | field, observations, reports, current state | current claims have statuses and sources |
| 5 | Normative / Action | values, desire, objective candidate, optional target, purpose, motivation | a candidate is separate from ratification, agreement, and authority |
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

An interface SHOULD foreground one useful question by default and MAY expose up
to three candidate paths. The versioned policy in
[`core/inquiry-selection.yawn`](../core/inquiry-selection.yawn) applies hard
gates before informative ranking. In summary, apply:

1. safety, authority, privacy, provenance, and proof-integrity hard gates;
2. movement-critical missing information;
3. affected relationships or unresolved roles;
4. high-consequence, low-confidence claims;
5. contradiction or dispute;
6. stale, high-impact information;
7. expected information value;
8. proof or close-condition gaps;
9. orientation gain relative to effort;
10. lower answer burden; and then
11. explicit current-turn order, accepted order, and canonical order as
    successive substantive tie-breaks.

The original source language remains available. A system-generated answer is a
proposal, visibly attributed to the system, until an authorized person accepts
or edits it.

The selection is replayable. Preserve the orientation revision and semantic
hash, candidate keys and exclusions, score inputs, preference hash,
`question_key`, `exact_rendered_prompt`, `representation_medium`,
`answer_input_adapter`, sequence position, and deterministic tie-break. A
question can also resolve to an explicit `hold` when safety, authority, privacy,
or burden makes asking inappropriate.

## Personalized presentation

The orientation map stores medium-independent meaning. A presentation profile
is a mutable View preference for how to ask, answer, and render it. Conventional
`orientation_inquiry` preference fields include:

- `/question/defaultAxisOrder`
- `/question/foregroundCount`
- `/question/wordingStyle`
- `/question/responseFormat`
- `/input/modality`
- `/output/modality`
- `/pacing`
- `/explanation/showWhyAsked`
- `/accessibility/reducedMotion`
- `/accessibility/highContrast`
- `/accessibility/screenReaderOptimized`

Presentation-preference scope resolution is shown below. It applies only after
hard gates, semantic priority, and lower answer burden have tied:

```text
safety and authority invariants
  -> explicit current-turn choice
  -> accepted Yawn preference
  -> accepted Arena preference
  -> accepted principal preference
  -> default View
```

The general preference model may retain wording, pacing, chunking, or density
as attributed proposals. The executable V0.1 selection receipt currently lets
accepted order affect ranking and records the chosen representation medium and
answer input adapter. Its prompt wording is still byte-pinned to the versioned
question packet: either the default prompt or the deterministic hard-gate
overlay. An adapted wording cannot enter a V0.1 receipt until a later contract
registers and replay-binds that prompt variant.

Targeted resolution also requires an exact `view_kind`, `principal_ref`, and
active scope reference match. Foreign principals or scopes are ignored; an
ambiguous pair of accepted preferences for the same scope and field fails
closed rather than depending on caller order.

When an accepted question order reaches the selector, its dedicated evidence
hash is recomputed from the order, winning preference revision and scope, and
the exact active scope set. A partial explicit current-turn order applies first;
ties it does not resolve fall through to accepted order and then canonical
question order. These layers are retained separately in the selection receipt.

Receipt-only validation checks schema, gate provenance, rendered prompts,
preference evidence, and the winner implied by the included ranking evidence.
Paired replay checks equivalence against the effective normalized ranking and
render inputs supplied by the caller. Proposed presentation hypotheses and
options that cannot affect a given outcome may normalize away, so neither a
self-consistent receipt nor successful replay is a signature or proof of the
historical input objects.

Keep transient choices, explicitly accepted durable preferences, inferred
preference proposals, and measured context-specific usefulness as different
claims. A presentation preference may propose wording, order, chunking,
density, or medium, subject to each executable contract's supported fields; it
cannot erase an axis, rewrite its answer, or hide a required safety, authority,
privacy, provenance, or proof question. Do not serialize a fixed “visual
learner,” “auditory learner,” or similar type as truth. Match the View to the
task, accessibility requirements, current context, and observed utility, and
always permit switching.

## orientation_inquiry records preserve the path

Questions affect answers, so they are not neutral sensors. Every answer event
SHOULD retain:

```yaml
orientation_inquiry:
  question_key: scope
  exact_rendered_prompt: "What has your attention, and what episode are we orienting?"
  policy_version: yawn.inquiry-selection.v0.1
  reason_asked: "opening signal capture"
  orientation_revision: 1
  candidate_hypotheses_before: []
  sequence_position: 1
  representation_medium: dialogue-text
  answer_input_adapter: typed-text
  selection_receipt_ref:
    kind: inquiry_selection_receipt
    id: receipt:orientation-example
    revision: 1
    state_sha256: "..."
  raw_response: "..."
  parsed_claim_refs: []
  correction_or_revision_ref: null
  asked_at: "..."
```

Raw signal, Observation, interpretation, candidate hypothesis, confidence,
lacuna, preference, choice, move, prediction, proof, revision, and provenance
remain separately recoverable. Orientation is a rebuildable View over that
history rather than a second mutable source of truth.
