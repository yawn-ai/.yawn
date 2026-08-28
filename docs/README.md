# YAWN documentation

`.yawn` is an open protocol for inspectable orientation and agency. This hub
separates stable contracts, working drafts, explanations, examples, research,
and historical material so each can be read with the right level of trust.

## Choose a path

### I want to use `.yawn`

1. Read the [five-minute quickstart](quickstart.md).
2. Open the [basic template](../templates/basic.yawn).
3. Use the [nine orientation questions](../spec/questions.md) when the situation
   needs more context.
4. Check an [example](../examples/).

### I want to build with the protocol

1. Start with the [specification status and invariants](../spec/README.md).
2. Learn the [ontology](../spec/ontology.md) and [state substrate](../core/state.yawn).
3. Validate the [v1 contracts](../contracts/) and [state schemas](../schemas/).
4. Experiment with the [Agency Holarchy Draft 0.2](../schemas/agency-holarchy.v0.2.schema.json).
5. Compile a signal into an [Objective Holon Draft 0.1](../spec/objective-holons.md).
6. Resolve adaptive inquiry with the [Orientation Map Draft 0.1](../schemas/orientation-map.v0.1.schema.json)
   and its [closed selection receipt](../schemas/inquiry-selection-receipt.v0.1.schema.json).
7. Record explicit review and response events with the
   [Interaction Operator Receipt Draft 0.1](../schemas/interaction-operator-receipt.v0.1.schema.json).
8. Verify the exact module set for `/new` with the
   [`yawn.bot/new.v0.1` profile](../protocol-manifest.v0.1.json).
9. Read [serialization and compatibility](../spec/serialization.md).
10. Apply the [canonical naming and transcript-normalization contract](../core/canonical-extension.yawn) before creating records.

### I want to understand the theory

1. Read [World → Field → Arena → Yawn](../spec/ontology.md).
2. Read the [holarchy](../spec/holarchy.md), [turn](../spec/turns.md), and
   [routing](../spec/routing.md) specifications.
3. Study the [objective/Yawn/Yawn.bot lifecycle](../spec/objective-holons.md).
4. Read how [orientation questions adapt without changing meaning](../spec/questions.md).
5. See how [projections](projections/README.md) render one canonical graph.
6. Review the [research basis and limits](research-basis.md).

### I want to contribute

- [Contributing](../CONTRIBUTING.md)
- [Roadmap](../ROADMAP.md)
- [Governance](../GOVERNANCE.md)
- [Security](../SECURITY.md)
- [RFC process](../rfcs/README.md)
- [Architecture decisions](../adr/README.md)

## Repository truth map

| Location | Role |
| --- | --- |
| [`contracts/`](../contracts/) | Stable v1 constitutional and runtime contracts |
| [`schemas/`](../schemas/) | Executable state modules and explicitly labeled drafts |
| [`spec/`](../spec/) | Human-readable normative and draft specification |
| [`core/`](../core/) | Concept explanations, compatibility vocabulary, and lexical invariants |
| [`templates/`](../templates/) | Commented authoring surfaces |
| [`examples/`](../examples/) | Informative, inspectable use cases |
| [`interface/`](../interface/) | Presentation and interaction contracts |
| [`q-space/`](../q-space/) | Question-oriented projection |
| [`references/`](../references/) and [research basis](research-basis.md) | Evidence, influences, and scientific boundaries |
| [`migrations/`](../migrations/) | Source-preserving structural receipts and canonical target maps |

The numbered pre-canonical generation is no longer part of the active tree. Its
immutable source commit and path-by-path absorption map are preserved in the
[canonical-extension migration receipt](../migrations/2026-08-17-canonical-extension.yawn).
Historical wording is attributable evidence, not current canon merely under a
new filename.

For the current compatibility boundary and known gaps, see
[Project status](project-status.md) and [Repository map](repository-map.md).

## A sentence to keep

> Automate the burden. Preserve the authorship. Return the time.

YAWN can carry mechanical work, surface alternatives, and make consequences
legible. It does not decide what a person's life should mean.
