# Codex Handoff — Dialogical Orientation Flywheel

Date: **2026-08-19**  
Status: **implementation-ready working architecture; owner ratification still required**

## First answer

You are here:

```text
coupling / relationship substrate
→ dialogical orientation process
→ human ratification
→ bounded execution
→ consequence and proof
→ updated relationship
→ optional graduation proposal
```

**Do not begin by building a new chat shell.**

The first implementation task is to prove that the process can replay one
historical semantic failure and one live decision without promoting a downstream
mechanism into the ontology root.

## Read in this order

1. `AGENTS.md`
2. `spec/ontology.md`
3. `core/ONTOLOGY_LAYERING_AND_PROMOTION.yawn`
4. `core/ontology-layering.v1.json`
5. `core/DIALOGICAL_ORIENTATION_FLYWHEEL.yawn`
6. `core/dialogical-orientation-flywheel.v1.json`
7. `examples/dialogical-orientation-session-ontology-flywheel.json`
8. `scripts/validate-dialogical-orientation.mjs`
9. `tests/dialogical-orientation-flywheel.test.mjs`

Then run:

```bash
npm ci
npm test
```

Do not continue if the ontology-layering or dialogical-orientation tests fail.

## Architectural ruling

The process is **inspired by** Dialectic into Dialogos, Bohm Dialogue, and
inquiry/deliberative dialogue. It is not claimed to be identical to any of those
practices.

Canonical YAWN term:

```text
dialogical orientation
```

Attributed lineage term:

```text
Dialectic into Dialogos / Dialogos
```

Ontology boundary:

```text
coupling + relationship + Agent + Arena = substrate

dialogical orientation = internal cross-layer process

graduation = optional proof-gated governance mechanism
```

Dialogos must not become the ontology root, public mission, consensus engine,
or authority source.

## The two execution modes

### Fast mode

Use when work is routine, low-stakes, reversible, clearly owned, and not
materially contested:

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

Use when the turn involves multiple affected agents, disputed meaning or
values, high consequences, recurring patterns, conflicting evidence, or changes
to ontology, policy, identity, autonomy, or public purpose:

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

Full dialogical processing is conditional. It is not a universal ritual.

## Domain objects to preserve

Implementations should compose existing YAWN records where possible. Do not
invent another sidecar state store.

Minimum session state:

```yaml
session:
  id:
  mode:
  focal_question:
  relationship_scope:
  source_refs: []
  passes: []
  dependency_map:
  nexus:
    invariant_core: []
    complementary_facets: []
    live_conflicts: []
    blind_spots: []
  residue: []
  orientation_packet:
  ratification:
  authorization:
  move:
  consequence:
  proof:
  update:
  graduation_proposal:
```

Each pass declares:

```yaml
pass:
  id:
  actor:
  stance:
  access_channel:
  method:
  source_lineage: []
  findings: []
  limits: []
  correlated_with: []
```

Repeated analysis by one model over one source may create stance diversity. It
does not automatically create independent evidence.

## Tomorrow's bounded work plan

### Gate 0 — Establish exact-head proof

1. Check out the PR branch.
2. Run `npm test`.
3. Record the exact commit and result.
4. Do not weaken a failing invariant merely to turn the build green.

### Gate 1 — Replay the historical failure

Use this case:

```text
Dave described graduation of agency as an internal flywheel.
A generated explainer promoted it into YAWN's main ontology and mission.
```

The session must show:

- exact source intent;
- the steelman for graduation as a useful mechanism;
- the falsifier showing semantic promotion;
- the ontology-layer aperture;
- the research/lineage aperture;
- correlated-pass discounts;
- nexus and residue;
- Dave as the decision owner;
- a corrected bounded move;
- proof that the invalid explainer shape is rejected.

### Gate 2 — Run one live case

Use a real current decision with Dave. Prefer something bounded and reversible.

The live case succeeds only if Dave can see:

- what was received;
- what each pass added;
- where the passes share lineage;
- what survived;
- what remains disputed or unseen;
- the proposed direction;
- what remains his to decide;
- one bounded next move;
- how reality will answer.

### Gate 3 — Propose the smallest runtime

Only after both cases validate, propose a minimal runtime architecture.

Preferred first implementation:

```text
pure session compiler / reducer
        ↓
append-only session events
        ↓
materialized dialogical session state
        ↓
deterministic .yawn / JSON projection
        ↓
CLI or test harness
```

Adapters such as chat, web, graph, or voice come later.

The compiler should expose pure operations such as:

```text
openSession
addSource
addPass
markPassDependency
compileNexus
proposeOrientation
ratifyDirection
bindAuthorization
recordMove
recordConsequence
recordProof
materializeUpdate
proposeGraduation
```

Do not allow `compileNexus` to call `ratifyDirection` implicitly.
Do not allow `recordMove` before ratification and authorization.
Do not allow `recordProof` to accept an executor's unsupported success claim.
Do not allow `proposeGraduation` to activate broader authority.

## Required tests

The implementation must reject:

- Dialogos as ontology root;
- forced consensus;
- erased dissent or residue;
- a pass without actor, stance, access channel, method, lineage, or limits;
- repeated same-model passes counted as independent;
- an orientation packet silently treated as ratified;
- AI or system ownership of Dave's terminal goal;
- movement before ratification and authorization;
- a move proving itself;
- graduation before repeated proof;
- automatic graduation activation;
- a full Dialogos ceremony required for routine reversible work;
- publication, deployment, or external effects without separate authority.

## Acceptance criteria

The first runtime slice is ready for review when:

1. all repository tests pass;
2. the historical failure replays deterministically;
3. a live case produces nexus, residue, orientation, ratification, move, and proof contract;
4. source wording survives every transformation;
5. correlated passes are visibly discounted;
6. dissent and blind spots remain visible;
7. Dave can correct any inferred field;
8. Dave remains the ratifying owner;
9. no external effect is executed;
10. no new ontology root or state store is introduced.

## Stop conditions

Stop and surface the lacuna when:

- source intent is ambiguous;
- the decision owner is unclear;
- affected-party consent or privacy is unresolved;
- all passes share one error lineage and no discriminating test exists;
- dialogue is repeating without a new aperture or evidence;
- no safe bounded move exists;
- the implementation requires changing the ontology contract merely to fit the code.

## Stable implementation sentence

> YAWN's dialogical flywheel helps distinct agents inspect one consequential
> relationship from meaningfully different apertures, preserve what survives and
> what does not, let the rightful steward ratify direction, take one bounded
> authorized move, and allow consequence and proof to update the relationship.

## Authority boundary

This handoff authorizes analysis and a reviewable implementation proposal only.
It does not authorize merge, deployment, publication, external communication,
paid model calls, database mutation, or autonomy widening.
