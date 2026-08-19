# AGENTS.md

## Scope

These instructions apply to the entire `.yawn` repository.

Before changing ontology, public language, interfaces, diagrams, presentations,
or explainer media, read:

1. `spec/ontology.md`
2. `core/ONTOLOGY_LAYERING_AND_PROMOTION.yawn`
3. `core/ontology-layering.v1.json`
4. the nearest domain contract for the feature being changed

Before changing inquiry, review, multi-agent reasoning, or difficult-turn
execution, also read:

5. `core/DIALOGICAL_ORIENTATION_FLYWHEEL.yawn`
6. `core/dialogical-orientation-flywheel.v1.json`
7. `docs/CODEX_DIALOGICAL_FLYWHEEL_HANDOFF_2026-08-19.md`

## Preserve ontology layers

YAWN uses this compilation order:

```text
substrate
→ epistemic operation
→ action / transition
→ governance
→ projection / View
```

Do not promote a downstream mechanism merely because it is vivid, recently
discussed, repeated, visually central, or useful for one artifact.

The required classifications include:

```text
coupling, relationship, Agent, Arena  → substrate
Observation, evidence, aperture,
orientation                          → epistemic operation
Intention, Move, Consequence, Proof  → action / transition
authority, delegation, autonomy,
graduation                           → governance
interface, narrative, slides, video  → projection / View
```

Agency is a cross-layer capacity. It is not the default ontology root or
terminal objective.

## Source-intent rule

Preserve explicit role language from the rightful author.

If the user says a concept is:

- an **internal flywheel**;
- an **implementation mechanism**;
- **one way to look at the system**;
- a **working hypothesis**; or
- a **pressure-test candidate**;

keep it in that role unless a separate constitutional promotion is accepted.
Do not infer semantic hierarchy from emotional emphasis or frequency alone.

The known regression is:

```text
"graduation of agency" described as internal flywheel
→ incorrectly promoted into whole-system mission
```

Any change that recreates that hierarchy is wrong even when the resulting prose,
slides, or code are internally coherent.

## Dialogical orientation gate

`Dialogos` is an attributed lineage term. The canonical YAWN process name is
**dialogical orientation**.

Dialogical orientation is an internal cross-layer process. It is not the
ontology root, public mission, consensus engine, or source of authority.

Choose the mode before implementing the turn:

### Fast mode

Use for routine, low-stakes, reversible work with one clear decision owner and
no material value, ontology, policy, or identity conflict.

```text
relationship scope
→ source
→ orientation packet
→ ratification / authorization
→ move
→ proof
→ update
```

### Dialogical mode

Use when the turn involves multiple affected agents, contested meaning or
values, recurring unresolved patterns, high consequence, conflicting evidence,
or changes to ontology, policy, autonomy, identity, or public purpose.

```text
relationship scope
→ source preservation
→ articulation
→ dialectic
→ aperture diversification
→ dialogos
→ nexus + residue
→ orientation packet
→ ratification
→ authorization
→ move
→ consequence + proof
→ update
→ optional graduation proposal
```

Full dialogical processing is conditional. Do not turn it into a universal
ritual or force consensus.

Every serious pass declares actor, stance, access channel, method, source
lineage, findings, limits, and correlation. Repeating one model over one source
may create stance diversity; it does not automatically create independent
evidence.

The nexus guides. The rightful human or collective decides. Epistemic
confidence does not ratify a direction, and ratification does not make an
empirical claim true.

Do not allow:

- Dialogos, orientation, agency, proof, autonomy, or graduation to replace the
  coupling/relationship substrate;
- a synthesis to erase residue, conflict, dissent, or blind spots;
- an AI to own the human terminal direction;
- movement before ratification and authorization;
- a move to prove itself;
- graduation to activate itself; or
- a new chat shell before the pure session compiler and canonical fixture work.

## Whole-system explainer gate

Before creating or changing a whole-system explainer, homepage thesis, diagram,
slide deck, video, or narrative route:

1. create an explainer brief conforming to
   `interface/yawn-explainer-brief-v1.yawn`;
2. identify the L0 root subject;
3. list supporting mechanisms and their layers;
4. name the human or collective that owns terminal goals;
5. state what the artifact is not claiming;
6. validate the brief with `npm run validate`; and
7. preserve captions/transcript/source lineage for media.

A specialized artifact may focus on orientation, proof, agency, or graduation.
Its title and description must say that it explains a mechanism or lens, not the
purpose of all YAWN.

## Promotion requires a versioned decision

Moving a concept upward requires:

- an RFC or constitutional proposal;
- counterexamples and pressure tests;
- evidence that the current simpler layering fails;
- schema and migration analysis;
- public-language and interface impact analysis;
- rightful maintainer adoption; and
- a versioned contract change.

A generated artifact can propose promotion. It cannot perform promotion.

## Terminal-goal boundary

AI may inspect, organize, compare, simulate, propose, execute within granted
scope, and gather proof. It may not silently choose the human terminal goal,
replace consent, or turn a governance mechanism into the reason a life or
relationship exists.

## Proof

Run:

```bash
npm test
```

The ontology-layering regression tests must reject at least:

- `orientation` as the substrate root;
- `graduation` as the public mission;
- an AI-owned terminal goal; and
- a primary loop that places governance before relationship and observation.

The dialogical-orientation tests must reject at least:

- Dialogos as ontology root;
- forced consensus;
- repeated correlated passes counted as independent;
- erased residue or blind spots;
- system-owned ratification;
- movement before authorization;
- self-proving moves; and
- graduation without repeated proof and separate activation.
