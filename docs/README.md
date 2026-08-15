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
4. Inspect [Orientation Passage V1](../schemas/orientation-passage.v1.schema.json)
   and [Public View V1](../schemas/public-view.v1.schema.json).
5. Experiment with the [Agency Holarchy Draft 0.2](../schemas/agency-holarchy.v0.2.schema.json).
6. Read [serialization and compatibility](../spec/serialization.md).

### I want to understand the theory

1. Read [World → Field → Arena → Yawn](../spec/ontology.md).
2. Read the [holarchy](../spec/holarchy.md), [turn](../spec/turns.md), and
   [routing](../spec/routing.md) specifications.
3. See how [Views](views/README.md) render one canonical graph.
4. Review the [research basis and limits](research-basis.md).

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
| [`core/`](../core/) | Concept explanations and compatibility vocabulary |
| [`templates/`](../templates/) | Commented authoring surfaces |
| [`examples/`](../examples/) | Informative, inspectable use cases |
| [`interface/`](../interface/) | Presentation and interaction contracts |
| [`q-space/`](../q-space/) | Question-oriented View |
| [`research/`](../08-research/) and [`references/`](../references/) | Evidence, influences, and historical locks |
| Numbered `00-`…`08-` folders | Historical `.ion` bridge; preserved, not current source of truth |

For the current compatibility boundary and known gaps, see
[Project status](project-status.md) and [Repository map](repository-map.md).

## A sentence to keep

> Automate the burden. Preserve the authorship. Return the time.

YAWN can carry mechanical work, surface alternatives, and make consequences
legible. It does not decide what a person's life should mean.
