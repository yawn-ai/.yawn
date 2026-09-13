# TAXONOMY — the merge record

Eighteen extraction agents worked blind to each other and produced 2350 distinct pole names across 1249 judgments — near-total uniqueness, because each agent
invented its own words for the same handful of axes. Intransitive triples can only be found where
judgments share poles, so the vocabulary had to be collapsed into one shared space.

**This file is that collapse, in full, so it can be rejected.** Every judgment below shows the pole
names its extractor originally wrote and the canonical pole it was mapped onto. A merge you disagree
with is a merge you can strike here; the preference graph, the cycles, and the ranking in
`JUDGMENTS.md` are all downstream of this table and change when it changes.

Where a mapping is wrong the damage is specific: a judgment forced onto the wrong axis creates a
false edge, and false edges fabricate intransitive triples that do not exist. `UNMAPPED` is the
honest outcome when nothing fits, and is listed at the end rather than hidden.

| | |
|---|---|
| Canonical dimensions | 84 |
| Judgments mapped | 1211 |
| Judgments left UNMAPPED | 38 |
| Raw dimension names absorbed | 1085 |

### How this taxonomy was built, in its author's words

84 canonical dimensions. Every one of the 1085 raw dimension names is absorbed exactly once - 0 left out, 0 assigned twice (verified mechanically against dimensions.txt). Absorb-list sizes run 7-29, median ~11.

**HOW IT WAS BUILT**

The axes were derived from the raw vocabulary itself, not imposed: the 19 high-frequency tokens (authority, default, scope, record, order, evidence, status, proof, provenance, source, vocabulary, disclosure, agent, surface, boundary, migration, attribution, consent, coverage) each seed one or more dimensions, and the pole names reuse the corpus's own words wherever the raw pole list supplied a genuine opposing pair (deny-by-default/permit-by-default, closed-vocabulary/open-vocabulary, human-readability/machine-addressability, generated-index/hand-curated-index, self-certification/external-verification, append-only/destructive, proposal/accepted, gates-before-ranking/ranking-before-gates).

**POLE OPPOSITION**

Each pair is a single axis a record can sit at either end of, not two adjacent virtues. Where a raw name named only one end (e.g. 'deny-by-default', 'fail-closed', 'observation-first'), the opposite end was taken from the raw pole list rather than invented, so both ends are attested somewhere in the corpus. Axes that looked like one dimension but are two were split rather than fused: who-may-authorise (who decides) is separate from authority-breadth (how far one grant reaches), authority-duration (how long it lasts) and default-authorisation-posture (what happens absent a decision); evidence-locus (where evidence comes from) is separate from how-success-is-judged (who declares the move worked) and from source-reachability (whether a cited source can be opened by a second person); enforcement-mechanism (code vs prose) is separate from enforcement-locus (schema vs runtime). Fusing any of those pairs would have manufactured edges between judgments that never compete.

**PROVENANCE**

These dimensions are coordinates, not verdicts. A judgment mapped to a pole says only where an artifact or a written preference SITS on that axis. Mapping a REVEALED judgment (the extraction's reading of what an artifact does) onto a pole does not convert it into a STATED preference of Dave's, and the pole names must not be read as anyone's choice. Several axes exist precisely because the corpus sits at opposite ends STATED vs REVEALED - naming-convention-uniformity (lowercase declared, MASTER-CONTROL.YAWN shipped), audience-primacy (human-readable declared, the two machine-grammar templates are the only ones with contract tests), proof-scope-fidelity (a proof block covering a narrower claim than the one it sits under), tie-break-basis (list order vs the stated ladder the tests implement). On those axes the pole a record occupies is a description of behaviour; nothing about intent follows from it.

**JUDGMENT CALLS WORTH KNOWING**

About 40-50 raw names were placed by nearest axis rather than exact fit and are the ones most worth re-checking if an edge looks wrong: the -location/-locus family (memory-location, state-location, ownership-location, responsibility-location) all went to enforcement-locus on the 'where does this live' reading; the -granularity family was split across record-granularity (how many records), attribution-granularity (per claim vs per document), consent-granularity (per instance vs blanket) and versioning-granularity by what is being subdivided, not by the word; and the '-modelling' names (message-modelling, asynchrony-modelling, temporal-modeling) went to record-granularity because in this corpus they are arguments about decomposition, not about ontology.

**COVERAGE OF THE GROUND TRUTH**

All 20 verified facts land on an axis: FACT 1-2 status-vocabulary-closure and status-dimensionality; FACT 3/16 proof-obligation-breadth and tie-break-basis; FACT 4 structural-topology; FACT 5-6 enforcement-mechanism and coverage-allocation; FACT 7 rule-versus-carve-out; FACT 8/20 naming-convention-uniformity; FACT 9 audience-primacy and serialisation-form; FACT 10 proof-scope-fidelity; FACT 11 naming-convention-uniformity; FACT 12 record-shape-uniformity; FACT 13 onboarding-friction; FACT 14-15 canonical-multiplicity and field-obligation; FACT 17 unattended-effect-authorisation and automation-cadence; FACT 19 source-reachability.

---

## coverage-allocation — 64 judgments

**`exhaustive-even-coverage`  ⇄  `selective-concentrated-coverage`**

whether verification, indexing and specification are spread evenly over everything, or concentrated on a chosen few

<details><summary>absorbs 22 raw dimension names</summary>

`audit-completeness` · `audit-vs-resilience` · `effort-allocation` · `evidence-allocation` · `governance-vs-telemetry` · `how-example-effort-is-spent` · `index-coverage` · `interface-coverage` · `investment-allocation` · `policy-coverage` · `record-weight-allocation` · `revision-allocation` · `specification-coverage` · `test-coverage-allocation` · `test-granularity` · `verification-cost` · `what-examples-demonstrate` · `what-the-protocol-is-tested-on` · `where-effort-goes` · `where-the-repo-spends` · `where-the-writing-goes` · `which-folder-is-argued-for`

</details>

| Judgment | Extractor's original poles | Mapped to | Conf | Prov |
|---|---|---|---|---|
| `J0381` | machine-checked-examples > unchecked-examples | selective-concentrated-coverage > exhaustive-even-coverage | 0.85 | BP |
| `J0652` | spend-gated-testing > uniform-record-testing | selective-concentrated-coverage > exhaustive-even-coverage | 0.85 | BP |
| `J0339` | selective-fixture-coverage > per-schema-fixture | selective-concentrated-coverage > exhaustive-even-coverage | 0.80 | RU |
| `J0507` | relationship-elaboration > packet-parity | selective-concentrated-coverage > exhaustive-even-coverage | 0.80 | RU |
| `J1226` | concentrated-proof-spend > even-coverage | selective-concentrated-coverage > exhaustive-even-coverage | 0.80 | BP |
| `J0533` | orientation-investment > closure-investment | selective-concentrated-coverage > exhaustive-even-coverage | 0.75 | RU |
| `J0557` | ontology-investment > onboarding-investment | selective-concentrated-coverage > exhaustive-even-coverage | 0.75 | RU |
| `J0721` | theory-spend > governance-spend | selective-concentrated-coverage > exhaustive-even-coverage | 0.75 | BP |
| `J0057` | spend-gated-rigor > uniform-effect-rigor | selective-concentrated-coverage > exhaustive-even-coverage | 0.70 | RU |
| `J0106` | mechanizable-substrate > conceptual-frame | selective-concentrated-coverage > exhaustive-even-coverage | 0.70 | RU |
| `J0136` | orientation-elaboration > agency-elaboration | selective-concentrated-coverage > exhaustive-even-coverage | 0.70 | RU |
| `J0188` | diff-scoped-verification > whole-repo-verification | selective-concentrated-coverage > exhaustive-even-coverage | 0.70 | RU |
| `J0242` | target-formalization > lacuna-formalization | selective-concentrated-coverage > exhaustive-even-coverage | 0.70 | BP |
| `J0322` | naming-verification > pipeline-verification | selective-concentrated-coverage > exhaustive-even-coverage | 0.70 | BP |
| `J0551` | shape-primitive-investment > uniform-primitive-maturity | selective-concentrated-coverage > exhaustive-even-coverage | 0.70 | RU |
| `J0613` | contract-authoring > run-receipting | selective-concentrated-coverage > exhaustive-even-coverage | 0.70 | BP |
| `J0614` | access-provenance > recoverability-assurance | selective-concentrated-coverage > exhaustive-even-coverage | 0.70 | BP |
| `J0786` | specification-volume > lived-observation-volume | selective-concentrated-coverage > exhaustive-even-coverage | 0.70 | RU |
| `J0852` | relational-depth > operational-depth | selective-concentrated-coverage > exhaustive-even-coverage | 0.70 | RU |
| `J1229` | in-use-schema-proof > whole-schema-proof | selective-concentrated-coverage > exhaustive-even-coverage | 0.70 | BP |
| `J0239` | lexical-enforcement > ontological-enforcement | selective-concentrated-coverage > exhaustive-even-coverage | 0.65 | BP |
| `J0336` | draft-validation > v1-validation | selective-concentrated-coverage > exhaustive-even-coverage | 0.65 | BP |
| `J0612` | self-activity-recording > outcome-recording | selective-concentrated-coverage > exhaustive-even-coverage | 0.65 | BP |
| `J1089` | exhaustive-gate-matrix > sampled-gate-evaluation | exhaustive-even-coverage > selective-concentrated-coverage | 0.65 | BP |
| `J0192` | label-enforcement > invariant-enforcement | selective-concentrated-coverage > exhaustive-even-coverage | 0.60 | RU |
| `J0385` | addressable-navigation > prose-mention | selective-concentrated-coverage > exhaustive-even-coverage | 0.60 | RU |
| `J0562` | single-object-scope > broad-catalog | selective-concentrated-coverage > exhaustive-even-coverage | 0.60 | RU |
| `J0608` | consequence-triggered-recording > exhaustive-logging | selective-concentrated-coverage > exhaustive-even-coverage | 0.60 | A |
| `J0616` | agent-activity-logging > human-activity-logging | selective-concentrated-coverage > exhaustive-even-coverage | 0.60 | BP |
| `J0627` | canon-root-first > all-roots-at-once | selective-concentrated-coverage > exhaustive-even-coverage | 0.60 | BP |
| `J0697` | curated-native-index > complete-folder-index | selective-concentrated-coverage > exhaustive-even-coverage | 0.60 | RU |
| `J0770` | prose-folder-nodes > code-folder-nodes | selective-concentrated-coverage > exhaustive-even-coverage | 0.60 | RU |
| `J0783` | automation-observability > protocol-observability | selective-concentrated-coverage > exhaustive-even-coverage | 0.60 | BP |
| `J0945` | outcome-for-automation > outcome-for-ontology | selective-concentrated-coverage > exhaustive-even-coverage | 0.60 | BP |
| `J1076` | reference-without-schema > schema-per-kind | selective-concentrated-coverage > exhaustive-even-coverage | 0.60 | RU |
| `J1079` | draft-investment > stable-investment | selective-concentrated-coverage > exhaustive-even-coverage | 0.60 | BP |
| `J1225` | per-record-reachability > global-hub-validation | selective-concentrated-coverage > exhaustive-even-coverage | 0.60 | RU |
| `J0037` | selective-durable-memory > uniform-memory | selective-concentrated-coverage > exhaustive-even-coverage ⚠ | 0.55 | RU |
| `J0128` | machine-gate-maturity > human-gate-maturity | selective-concentrated-coverage > exhaustive-even-coverage ⚠ | 0.55 | RU |
| `J0171` | failure-specified > meaning-only | selective-concentrated-coverage > exhaustive-even-coverage ⚠ | 0.55 | RU |
| `J0197` | operationalized-primitive > narrative-framing | selective-concentrated-coverage > exhaustive-even-coverage ⚠ | 0.55 | RU |
| `J0415` | length-gated-privacy > subject-gated-privacy | selective-concentrated-coverage > exhaustive-even-coverage ⚠ | 0.55 | RU |
| `J0775` | authority-separation > memory-fidelity | selective-concentrated-coverage > exhaustive-even-coverage ⚠ | 0.55 | RU |
| `J0777` | protocol-core-iteration > public-surface-iteration | selective-concentrated-coverage > exhaustive-even-coverage ⚠ | 0.55 | BP |
| `J0779` | extension-normalization > identifier-normalization | selective-concentrated-coverage > exhaustive-even-coverage ⚠ | 0.55 | RU |
| `J0785` | structural-templates > human-situation-templates | selective-concentrated-coverage > exhaustive-even-coverage ⚠ | 0.55 | RU |
| `J1025` | executable-ordering > prose-ordering | selective-concentrated-coverage > exhaustive-even-coverage ⚠ | 0.55 | BP |
| `J0034` | voice-risk-priority > audit-cadence-parity | selective-concentrated-coverage > exhaustive-even-coverage ⚠ | 0.50 | RU |
| `J0137` | migration-for-rename > migration-for-semantics | selective-concentrated-coverage > exhaustive-even-coverage ⚠ | 0.50 | BP |
| `J0170` | runtime-effect-denial > full-authority-denial | selective-concentrated-coverage > exhaustive-even-coverage ⚠ | 0.50 | RU |
| `J0249` | receipt-completeness > input-completeness | selective-concentrated-coverage > exhaustive-even-coverage ⚠ | 0.50 | RU |
| `J0384` | curated-proof-set > folder-as-proof | selective-concentrated-coverage > exhaustive-even-coverage ⚠ | 0.50 | RU |
| `J0889` | outcome-in-receipts > outcome-everywhere | selective-concentrated-coverage > exhaustive-even-coverage ⚠ | 0.50 | RU |
| `J1145` | invoked-code-indexed > library-code-indexed | selective-concentrated-coverage > exhaustive-even-coverage ⚠ | 0.50 | RU |
| `J0038` | ledgered-findings > ephemeral-findings | selective-concentrated-coverage > exhaustive-even-coverage ⚠ | 0.45 | RU |
| `J0193` | render-gated-surface > contract-gated-surface | selective-concentrated-coverage > exhaustive-even-coverage ⚠ | 0.45 | BP |
| `J0267` | safety-first-stabilization > structure-first-stabilization | selective-concentrated-coverage > exhaustive-even-coverage ⚠ | 0.45 | RU |
| `J0323` | per-file-traceability > summary-disposition | exhaustive-even-coverage > selective-concentrated-coverage ⚠ | 0.45 | RU |
| `J1029` | five-stage-epistemic-stack > seven-stage-credibility-standard | selective-concentrated-coverage > exhaustive-even-coverage ⚠ | 0.45 | RU |
| `J1243` | cli-output-pinned > library-only-testing | exhaustive-even-coverage > selective-concentrated-coverage ⚠ | 0.45 | BP |
| `J0318` | family-arena > work-arena | selective-concentrated-coverage > exhaustive-even-coverage ⚠ | 0.40 | RU |
| `J0340` | personal-worked-example > neutral-worked-example | selective-concentrated-coverage > exhaustive-even-coverage ⚠ | 0.40 | BP |
| `J0653` | voice-risk-remediation > legal-risk-remediation | selective-concentrated-coverage > exhaustive-even-coverage ⚠ | 0.40 | BP |
| `J0854` | eight-key-formula > nine-key-coverage | selective-concentrated-coverage > exhaustive-even-coverage ⚠ | 0.40 | RU |

## canonical-multiplicity — 38 judgments

**`single-canonical-artifact`  ⇄  `plural-parallel-artifacts`**

whether one blessed artifact (schema, template, root, entry point, memory) governs, or several coexist in parallel

<details><summary>absorbs 23 raw dimension names</summary>

`artifact-canonicity` · `artifact-precedence` · `canonicality-of-representation` · `comprehension-entry-point` · `document-authority` · `entry-path` · `entry-point` · `front-door-framing` · `memory-substrate` · `memory-write-target` · `onboarding-path` · `onboarding-surface` · `primary-surface` · `record-authority` · `redundancy-vs-normalization` · `repository-entry-point` · `surface-distribution` · `teaching-surface-authority` · `template-composition` · `template-inventory` · `templates-per-concept` · `what-makes-memory-durable` · `what-the-protocol-root-promotes`

</details>

| Judgment | Extractor's original poles | Mapped to | Conf | Prov |
|---|---|---|---|---|
| `J0419` | split-roots > single-root | plural-parallel-artifacts > single-canonical-artifact | 0.90 | RU |
| `J0841` | duplicate-template > single-canonical-template | plural-parallel-artifacts > single-canonical-artifact | 0.85 | RU |
| `J0900` | parallel-v1-preservation > single-canonical-schema | plural-parallel-artifacts > single-canonical-artifact | 0.85 | A |
| `J0754` | single-canonical-memory > split-memory-roots | single-canonical-artifact > plural-parallel-artifacts | 0.80 | A |
| `J0241` | duplicated-definition > single-source | plural-parallel-artifacts > single-canonical-artifact | 0.75 | RU |
| `J0662` | supporting-source > second-constitution | single-canonical-artifact > plural-parallel-artifacts | 0.75 | A |
| `J0715` | dual-front-door > single-root-file | plural-parallel-artifacts > single-canonical-artifact | 0.75 | BP |
| `J0795` | multi-surface-publication > single-canonical-address | plural-parallel-artifacts > single-canonical-artifact | 0.75 | BP |
| `J0049` | audience-specific-entry > single-read-order | plural-parallel-artifacts > single-canonical-artifact | 0.70 | RU |
| `J0413` | many-entry-points > single-canonical-example | plural-parallel-artifacts > single-canonical-artifact | 0.70 | RU |
| `J0744` | additive-versioned-schemas > single-collapsed-schema | plural-parallel-artifacts > single-canonical-artifact | 0.70 | A |
| `J1047` | canonical-root > legacy-root | single-canonical-artifact > plural-parallel-artifacts | 0.70 | A |
| `J1119` | additive-draft > v1-replacement | plural-parallel-artifacts > single-canonical-artifact | 0.70 | A |
| `J0029` | canonical-root > legacy-root | single-canonical-artifact > plural-parallel-artifacts | 0.65 | A |
| `J0093` | single-shared-ontology > parallel-ontology | single-canonical-artifact > plural-parallel-artifacts | 0.65 | A |
| `J0781` | single-blessed-runtime > plural-conformant-runtimes | single-canonical-artifact > plural-parallel-artifacts | 0.65 | BP |
| `J0901` | three-role-front-door > canonical-mirror-claim | plural-parallel-artifacts > single-canonical-artifact | 0.65 | A |
| `J0047` | restated-definition > single-definition-by-reference | plural-parallel-artifacts > single-canonical-artifact | 0.60 | RU |
| `J0067` | per-family-policy > single-agent-policy | plural-parallel-artifacts > single-canonical-artifact | 0.60 | RU |
| `J0115` | parallel-vocabulary > single-canonical-name | plural-parallel-artifacts > single-canonical-artifact | 0.60 | RU |
| `J0658` | general-orientation-loop > repo-automation-loop | single-canonical-artifact > plural-parallel-artifacts | 0.60 | A |
| `J0686` | dual-aperture-mapping > single-canonical-sequence | plural-parallel-artifacts > single-canonical-artifact | 0.60 | A |
| `J1105` | duplicated-loop-definition > single-shared-definition | plural-parallel-artifacts > single-canonical-artifact | 0.60 | BP |
| `J1154` | parallel-layers > paired-template-and-schema | plural-parallel-artifacts > single-canonical-artifact | 0.60 | BP |
| `J0074` | folder-level-summary > file-by-file-reading | single-canonical-artifact > plural-parallel-artifacts ⚠ | 0.55 | A |
| `J0099` | lens-over-primitive > new-root-primitive | single-canonical-artifact > plural-parallel-artifacts ⚠ | 0.55 | A |
| `J0253` | local-restatement > canonical-lifecycle | plural-parallel-artifacts > single-canonical-artifact ⚠ | 0.55 | RU |
| `J0305` | additive-draft > v1-redefinition | plural-parallel-artifacts > single-canonical-artifact ⚠ | 0.55 | A |
| `J1170` | duplicate-tolerated > consolidated-address | plural-parallel-artifacts > single-canonical-artifact ⚠ | 0.55 | RU |
| `J0051` | central-numeric-budget > per-contract-quota | single-canonical-artifact > plural-parallel-artifacts ⚠ | 0.50 | RU |
| `J0114` | six-stage-canon > eight-stage-path | single-canonical-artifact > plural-parallel-artifacts ⚠ | 0.50 | RU |
| `J0497` | single-object-view > marketing-section-stack | single-canonical-artifact > plural-parallel-artifacts ⚠ | 0.50 | RU |
| `J0792` | curated-reading-path > uniform-node-entry | plural-parallel-artifacts > single-canonical-artifact ⚠ | 0.50 | RU |
| `J1174` | copy-a-form > read-the-spec | single-canonical-artifact > plural-parallel-artifacts ⚠ | 0.50 | A |
| `J0705` | per-artifact-license > single-repo-license | plural-parallel-artifacts > single-canonical-artifact ⚠ | 0.45 | BP |
| `J0711` | machine-readable-twin > human-page-only | plural-parallel-artifacts > single-canonical-artifact ⚠ | 0.45 | BP |
| `J0817` | pointer-guide > composite-wrapper | single-canonical-artifact > plural-parallel-artifacts ⚠ | 0.45 | A |
| `J0851` | duplicated-salience > single-declaration | plural-parallel-artifacts > single-canonical-artifact ⚠ | 0.45 | RU |

## default-authorisation-posture — 31 judgments

**`deny-by-default`  ⇄  `permit-by-default`**

what a field, gate or actor is allowed to do when nobody has said anything: closed until opened, or open until closed

<details><summary>absorbs 29 raw dimension names</summary>

`authorization-default-by-artifact-type` · `authorization-threshold` · `blocking-criterion` · `capture-default` · `consent-default` · `default-agent-verb-set` · `default-authority` · `default-authorization-posture` · `default-effect-authorization` · `default-epistemic-standing` · `default-gate-polarity` · `default-outcome` · `default-policy` · `default-posture` · `default-posture-for-new-layers` · `default-risk-posture` · `default-sequence` · `default-state` · `default-trust-in-a-stored-copy` · `default-value` · `default-value-as-rail` · `default-value-of-the-safety-slot` · `default-write-path` · `gate-default-direction` · `gate-semantics` · `rights-posture` · `structural-routing-default` · `template-default-loop-state` · `write-authority-default`

</details>

| Judgment | Extractor's original poles | Mapped to | Conf | Prov |
|---|---|---|---|---|
| `J0991` | deny-by-default > permit-by-default | deny-by-default > permit-by-default | 0.90 | BP |
| `J1125` | deny-by-default > permit-by-default | deny-by-default > permit-by-default | 0.90 | RU |
| `J0112` | default-locked > always-on-capture | deny-by-default > permit-by-default | 0.85 | RU |
| `J0426` | capability-isolation > ambient-local-access | deny-by-default > permit-by-default | 0.85 | A |
| `J0634` | default-deny > default-surface | deny-by-default > permit-by-default | 0.85 | RU |
| `J0539` | read-only-default > write-enabled-default | deny-by-default > permit-by-default | 0.80 | RU |
| `J0859` | optimistic-default > deny-by-default | permit-by-default > deny-by-default | 0.80 | RU |
| `J0789` | default-non-canonical > default-canonical | deny-by-default > permit-by-default | 0.75 | RU |
| `J0504` | draft-populate-only > direct-canonical-write | deny-by-default > permit-by-default | 0.70 | RU |
| `J0574` | consent-gated-inference > default-on-inference | deny-by-default > permit-by-default | 0.70 | RU |
| `J0776` | preauthorized-publication > maintainer-gated-change | permit-by-default > deny-by-default | 0.70 | BP |
| `J0496` | explicit-null-authority > unstated-authority | deny-by-default > permit-by-default | 0.65 | RU |
| `J0607` | draft-pr-default > direct-to-main | deny-by-default > permit-by-default | 0.65 | A |
| `J0890` | human-review-default-on > uniformly-unevaluated | deny-by-default > permit-by-default | 0.65 | RU |
| `J0984` | proposal-verbs > effect-verbs | deny-by-default > permit-by-default | 0.65 | A |
| `J1127` | reversible-presumed > reversibility-unknown | permit-by-default > deny-by-default | 0.65 | RU |
| `J1202` | field-allowlist > field-denylist | deny-by-default > permit-by-default | 0.65 | BP |
| `J0449` | presumed-reversible > unanswered-field | permit-by-default > deny-by-default | 0.60 | RU |
| `J0615` | proof-of-restore > backup-as-recoverability | deny-by-default > permit-by-default ⚠ | 0.55 | RU |
| `J0807` | verified-promotion > document-as-authorization | deny-by-default > permit-by-default ⚠ | 0.55 | A |
| `J1003` | empty-boundary-default > prefilled-rail | permit-by-default > deny-by-default ⚠ | 0.55 | RU |
| `J1186` | confidence-floor > zero-confidence-clear | deny-by-default > permit-by-default ⚠ | 0.55 | A |
| `J0343` | divergent-consent-default > uniform-conservative-default | permit-by-default > deny-by-default ⚠ | 0.50 | RU |
| `J0475` | prohibition-first-spec > requirement-first-spec | deny-by-default > permit-by-default ⚠ | 0.50 | RU |
| `J0499` | null-persona > default-persona | deny-by-default > permit-by-default ⚠ | 0.50 | RU |
| `J0534` | asymmetric-safety-default > symmetric-caution | permit-by-default > deny-by-default ⚠ | 0.50 | RU |
| `J0833` | observation-canonical > observation-as-proposal | permit-by-default > deny-by-default ⚠ | 0.50 | RU |
| `J0847` | explicit-contact-consent > assumed-reply-permission | deny-by-default > permit-by-default ⚠ | 0.50 | RU |
| `J0774` | prohibition-enumeration > permission-enumeration | permit-by-default > deny-by-default ⚠ | 0.45 | RU |
| `J0930` | permissive-licence > reserved-rights-licence | permit-by-default > deny-by-default ⚠ | 0.40 | RU |
| `J1052` | holding-default > orienting-default | deny-by-default > permit-by-default ⚠ | 0.40 | RU |

## who-may-authorise — 29 judgments

**`principal-authority`  ⇄  `agent-autonomy`**

whether an effect needs a named human principal's say-so, or an agent/automation may license its own action

<details><summary>absorbs 28 raw dimension names</summary>

`advisory-authority` · `agent-authority` · `agent-authority-transfer` · `agent-permission-default` · `agent-power` · `ai-authority` · `authority-attribution` · `authority-source` · `automation-authority` · `cold-start-agent-permissions` · `command-authority` · `effect-authority` · `gate-clearing-authority` · `human-gate-placement` · `initial-authority` · `locus-of-authority` · `permission-model` · `position-of-the-human-in-the-loop` · `source-of-authority` · `source-of-permission` · `who-authorizes` · `who-can-commit` · `who-holds-authority` · `who-may-clear-a-hard-gate` · `who-may-land-a-change` · `who-may-speak` · `who-may-write-without-evidence` · `who-must-agree`

</details>

| Judgment | Extractor's original poles | Mapped to | Conf | Prov |
|---|---|---|---|---|
| `J0735` | human-authorization > ai-authority | principal-authority > agent-autonomy | 0.95 | A |
| `J0957` | human-authority > ai-output-authority | principal-authority > agent-autonomy | 0.95 | A |
| `J0211` | human-authority > ai-output | principal-authority > agent-autonomy | 0.90 | A |
| `J0294` | human-merge-authority > agent-self-merge | principal-authority > agent-autonomy | 0.90 | A |
| `J0749` | proposal-only-agent > self-authorizing-agent | principal-authority > agent-autonomy | 0.90 | A |
| `J0816` | external-authorization > self-authorization | principal-authority > agent-autonomy | 0.90 | A |
| `J1185` | principal-report > machine-inference | principal-authority > agent-autonomy | 0.90 | A |
| `J0360` | mirror-role > decider-role | principal-authority > agent-autonomy | 0.85 | A |
| `J0962` | principal-ratification > confidence-threshold | principal-authority > agent-autonomy | 0.85 | A |
| `J1090` | principal-attested-clearance > machine-inferred-clearance | principal-authority > agent-autonomy | 0.85 | BP |
| `J0139` | human-sourced-writes > model-sourced-writes | principal-authority > agent-autonomy | 0.80 | RU |
| `J0362` | read-and-propose > unilateral-effect | principal-authority > agent-autonomy | 0.80 | A |
| `J0987` | principal-report > machine-gate-clearance | principal-authority > agent-autonomy | 0.80 | A |
| `J0005` | draft-pr-target > direct-main-commit | principal-authority > agent-autonomy | 0.75 | A |
| `J0022` | owner-decision > statistical-consensus | principal-authority > agent-autonomy | 0.75 | A |
| `J0489` | propose-only-agent > acting-agent | principal-authority > agent-autonomy | 0.75 | A |
| `J1211` | principal-only-pause > assistant-declared-hold | principal-authority > agent-autonomy | 0.75 | A |
| `J0113` | human-ownership > system-ownership | principal-authority > agent-autonomy | 0.70 | RU |
| `J0218` | explicit-ratification > inferred-agreement | principal-authority > agent-autonomy | 0.70 | A |
| `J0308` | classify-only > decide-and-write | principal-authority > agent-autonomy | 0.70 | A |
| `J0014` | risk-report > legal-authority | principal-authority > agent-autonomy | 0.65 | A |
| `J0791` | human-stewardship > machine-review-rights | principal-authority > agent-autonomy | 0.65 | RU |
| `J0030` | route-only > external-mutation | principal-authority > agent-autonomy | 0.60 | A |
| `J0376` | per-principal-authority > delegated-household-authority | principal-authority > agent-autonomy | 0.60 | A |
| `J0850` | second-party-consent-gate > single-author-authority | principal-authority > agent-autonomy | 0.60 | RU |
| `J1188` | verified-attribution > self-declared-identity | principal-authority > agent-autonomy ⚠ | 0.55 | A |
| `J0397` | propose-then-review > review-then-propose | agent-autonomy > principal-authority ⚠ | 0.45 | RU |
| `J0759` | agency-expansion > agency-capture | principal-authority > agent-autonomy ⚠ | 0.45 | A |
| `J0545` | runtime-ownership > human-ownership | agent-autonomy > principal-authority ⚠ | 0.40 | RU |

## field-obligation — 29 judgments

**`mandatory-field-set`  ⇄  `optional-field-set`**

whether a field must be present for a record to be valid, or may be left off

<details><summary>absorbs 11 raw dimension names</summary>

`field-obligation` · `field-order` · `field-selection` · `goal-obligation` · `minimal-shape-membership` · `required-versus-optional-fields` · `required-vs-optional` · `target-requirement` · `what-a-move-must-declare` · `what-a-result-must-carry` · `what-a-teaching-form-must-carry`

</details>

| Judgment | Extractor's original poles | Mapped to | Conf | Prov |
|---|---|---|---|---|
| `J0582` | total-required-receipt > partial-receipt | mandatory-field-set > optional-field-set | 0.90 | RU |
| `J0408` | first-class-desire > mandatory-target | optional-field-set > mandatory-field-set | 0.85 | RU |
| `J0518` | heavy-provenance > lightweight-capture | mandatory-field-set > optional-field-set | 0.80 | RU |
| `J0762` | optional-targets > mandatory-targets | optional-field-set > mandatory-field-set | 0.80 | A |
| `J0110` | mandatory-residue > success-only-record | mandatory-field-set > optional-field-set | 0.75 | RU |
| `J0342` | required-derived-fields > optional-derived-fields | mandatory-field-set > optional-field-set | 0.75 | RU |
| `J1110` | mandatory-confidence > optional-confidence | mandatory-field-set > optional-field-set | 0.75 | RU |
| `J0109` | recoverability-required > cost-required | mandatory-field-set > optional-field-set | 0.70 | RU |
| `J0219` | optional-target > mandatory-goal | optional-field-set > mandatory-field-set | 0.70 | A |
| `J0268` | shape-stub > required-fields | optional-field-set > mandatory-field-set | 0.70 | RU |
| `J0556` | partial-fill > required-completeness | optional-field-set > mandatory-field-set | 0.70 | A |
| `J0810` | inquiry-turn > goal-directed-turn | optional-field-set > mandatory-field-set | 0.70 | A |
| `J1191` | optional-target > goal-mandatory-record | optional-field-set > mandatory-field-set | 0.70 | BP |
| `J1137` | loop-bearing-message > free-form-message | mandatory-field-set > optional-field-set | 0.65 | RU |
| `J0329` | optional-proof-status > required-proof-status | optional-field-set > mandatory-field-set | 0.60 | RU |
| `J0483` | orientation-projection > mandatory-field-set | optional-field-set > mandatory-field-set | 0.60 | A |
| `J0572` | rationale-required > score-only-candidacy | mandatory-field-set > optional-field-set | 0.60 | RU |
| `J0829` | standalone-observation > promotion-required | optional-field-set > mandatory-field-set | 0.60 | A |
| `J1132` | complete-status-vector > partial-status | mandatory-field-set > optional-field-set | 0.60 | RU |
| `J0299` | standalone-observation > target-required-record | optional-field-set > mandatory-field-set ⚠ | 0.55 | A |
| `J0491` | addressability-required > purpose-required | optional-field-set > mandatory-field-set ⚠ | 0.55 | RU |
| `J1111` | sourceless-proof > source-backed-proof | optional-field-set > mandatory-field-set ⚠ | 0.55 | RU |
| `J1139` | always-present-extension-point > absent-when-unused | mandatory-field-set > optional-field-set ⚠ | 0.55 | RU |
| `J1141` | shape-locked-content-optional > content-mandated-upfront | optional-field-set > mandatory-field-set ⚠ | 0.55 | RU |
| `J1160` | pedagogy-over-boundary > uniform-boundary-discipline | optional-field-set > mandatory-field-set ⚠ | 0.55 | RU |
| `J1246` | explicit-resume-contract > open-ended-waiting | mandatory-field-set > optional-field-set ⚠ | 0.55 | BP |
| `J0429` | partial-authority-declaration > full-authority-block | optional-field-set > mandatory-field-set ⚠ | 0.50 | RU |
| `J0468` | unversioned-contract > schema-versioned-contract | optional-field-set > mandatory-field-set ⚠ | 0.50 | RU |
| `J0558` | seven-field-shape > inference-bearing-shape | mandatory-field-set > optional-field-set ⚠ | 0.50 | RU |

## machine-output-standing — 29 judgments

**`machine-output-as-proposal`  ⇄  `machine-output-as-accepted`**

whether what a model or script produces enters the record as a proposal awaiting ratification, or as an accepted fact

<details><summary>absorbs 14 raw dimension names</summary>

`classification-under-uncertainty` · `epistemic-status-of-labels` · `human-ratification-coverage` · `inference-status` · `inference-visibility` · `input-authority` · `machine-vs-human-record` · `proposal-authority` · `recommendation-form` · `standing-of-a-classification` · `status-of-user-input` · `what-a-recommendation-emits` · `what-embeddings-may-decide` · `who-gets-past-the-ratification-gate`

</details>

| Judgment | Extractor's original poles | Mapped to | Conf | Prov |
|---|---|---|---|---|
| `J0566` | human-acceptance > model-autonomy | machine-output-as-proposal > machine-output-as-accepted | 0.90 | A |
| `J1091` | machine-answer-proposed > machine-answer-accepted | machine-output-as-proposal > machine-output-as-accepted | 0.90 | BP |
| `J1187` | machine-output-as-proposal > machine-output-as-accepted | machine-output-as-proposal > machine-output-as-accepted | 0.90 | A |
| `J0232` | accepted-preference > inferred-preference | machine-output-as-proposal > machine-output-as-accepted | 0.75 | A |
| `J0301` | closed-proposal > self-accepting-proposal | machine-output-as-proposal > machine-output-as-accepted | 0.70 | A |
| `J0356` | correctable-proposal > diagnosis | machine-output-as-proposal > machine-output-as-accepted | 0.70 | A |
| `J0364` | similarity-as-retrieval > similarity-as-identity | machine-output-as-proposal > machine-output-as-accepted | 0.70 | A |
| `J0864` | held-until-ratified > accept-on-compile | machine-output-as-proposal > machine-output-as-accepted | 0.70 | RU |
| `J0972` | correctable-proposal > diagnosis | machine-output-as-proposal > machine-output-as-accepted | 0.70 | A |
| `J0011` | review-signal > authorship-verdict | machine-output-as-proposal > machine-output-as-accepted | 0.65 | A |
| `J0090` | inspectable-ranking > automated-authority | machine-output-as-proposal > machine-output-as-accepted | 0.65 | A |
| `J0100` | authorized-structure > similarity-derived-structure | machine-output-as-proposal > machine-output-as-accepted | 0.65 | A |
| `J0594` | principal-ruling > agent-self-canonization | machine-output-as-proposal > machine-output-as-accepted | 0.65 | A |
| `J0060` | vendor-neutral-authority > per-vendor-trust-tier | machine-output-as-proposal > machine-output-as-accepted | 0.60 | RU |
| `J0580` | ledger-as-truth > model-as-truth | machine-output-as-proposal > machine-output-as-accepted | 0.60 | A |
| `J0659` | illustration-status > evidence-status | machine-output-as-proposal > machine-output-as-accepted | 0.60 | A |
| `J0747` | declared-identity > embedding-similarity | machine-output-as-proposal > machine-output-as-accepted | 0.60 | A |
| `J0834` | agent-output-discounted > uniform-standing | machine-output-as-proposal > machine-output-as-accepted | 0.60 | RU |
| `J0599` | answer-as-attributed-source > answer-as-truth | machine-output-as-proposal > machine-output-as-accepted ⚠ | 0.55 | A |
| `J0673` | attributed-interpretation > psychodynamic-certainty | machine-output-as-proposal > machine-output-as-accepted ⚠ | 0.55 | A |
| `J0835` | verbatim-credence > inference-credence | machine-output-as-proposal > machine-output-as-accepted ⚠ | 0.55 | RU |
| `J0861` | disclaimer-as-default > blank-placeholder | machine-output-as-proposal > machine-output-as-accepted ⚠ | 0.55 | RU |
| `J0875` | model-as-observer > model-as-asserter | machine-output-as-proposal > machine-output-as-accepted ⚠ | 0.55 | RU |
| `J0814` | principal-authored-evidence > assistant-text-as-evidence | machine-output-as-proposal > machine-output-as-accepted ⚠ | 0.50 | A |
| `J0935` | merge-without-promotion > merge-implies-acceptance | machine-output-as-proposal > machine-output-as-accepted ⚠ | 0.50 | BP |
| `J1097` | redundant-ai-rail > single-general-rule | machine-output-as-proposal > machine-output-as-accepted ⚠ | 0.50 | BP |
| `J1103` | mandatory-correction-set > confirm-only-affordance | machine-output-as-proposal > machine-output-as-accepted ⚠ | 0.50 | BP |
| `J0433` | reflective-agent > authoritative-agent | machine-output-as-proposal > machine-output-as-accepted ⚠ | 0.45 | A |
| `J0836` | asymmetric-measurement > symmetric-measurement | machine-output-as-proposal > machine-output-as-accepted ⚠ | 0.45 | RU |

## vocabulary-locality — 28 judgments

**`single-shared-vocabulary`  ⇄  `per-record-local-vocabulary`**

whether one vocabulary governs the whole corpus, or each record, folder or layer coins its own

<details><summary>absorbs 14 raw dimension names</summary>

`canonical-loop-shape` · `contributor-taxonomy` · `cross-packet-consistency` · `cross-surface-consistency` · `key-naming-consistency` · `key-naming-precedence` · `loop-canonicity` · `loop-step-naming-vs-serialized-key` · `naming-consistency` · `vocabulary-asymmetry` · `vocabulary-layering` · `vocabulary-locality` · `vocabulary-reconciliation` · `vocabulary-scope`

</details>

| Judgment | Extractor's original poles | Mapped to | Conf | Prov |
|---|---|---|---|---|
| `J0404` | plural-loop-vocabulary > canonical-loop | per-record-local-vocabulary > single-shared-vocabulary | 0.90 | RU |
| `J0629` | per-ledger-vocabulary > shared-vocabulary | per-record-local-vocabulary > single-shared-vocabulary | 0.90 | RU |
| `J0651` | per-record-proof-vocabulary > shared-proof-enum | per-record-local-vocabulary > single-shared-vocabulary | 0.85 | BP |
| `J0039` | per-file-vocabulary > shared-capability-schema | per-record-local-vocabulary > single-shared-vocabulary | 0.80 | RU |
| `J0526` | per-packet-identifier > unified-identifier | per-record-local-vocabulary > single-shared-vocabulary | 0.80 | RU |
| `J0089` | fixed-six-stage-loop > free-stage-vocabulary | single-shared-vocabulary > per-record-local-vocabulary | 0.75 | A |
| `J0479` | shared-interaction-grammar > per-host-grammar | single-shared-vocabulary > per-record-local-vocabulary | 0.75 | A |
| `J1068` | per-schema-proof-status > shared-proof-status | per-record-local-vocabulary > single-shared-vocabulary | 0.75 | RU |
| `J0528` | invariant-framing > rule-framing | per-record-local-vocabulary > single-shared-vocabulary | 0.70 | RU |
| `J1065` | endorsement-vocabulary > authorization-vocabulary | per-record-local-vocabulary > single-shared-vocabulary | 0.70 | RU |
| `J1066` | unrevocable-event-authority > revocable-event-authority | per-record-local-vocabulary > single-shared-vocabulary | 0.70 | RU |
| `J1067` | proved-contested > verified-disputed | per-record-local-vocabulary > single-shared-vocabulary | 0.70 | RU |
| `J1069` | receipt-hold-codes > map-hold-codes | per-record-local-vocabulary > single-shared-vocabulary | 0.70 | BP |
| `J1100` | fine-turn-states > coarse-turn-states | per-record-local-vocabulary > single-shared-vocabulary | 0.70 | RU |
| `J0466` | exact-token-reuse > near-match-literal | single-shared-vocabulary > per-record-local-vocabulary | 0.65 | A |
| `J0716` | public-vocabulary-layer > single-shared-ontology | per-record-local-vocabulary > single-shared-vocabulary | 0.65 | RU |
| `J0151` | unified-grammar > per-kind-vocabularies | single-shared-vocabulary > per-record-local-vocabulary | 0.60 | A |
| `J0467` | inline-hex-literal > brand-token-reference | per-record-local-vocabulary > single-shared-vocabulary | 0.60 | RU |
| `J0839` | per-family-versioning > uniform-version-key | per-record-local-vocabulary > single-shared-vocabulary | 0.60 | RU |
| `J0843` | domain-field-priority > uniform-provenance-key | per-record-local-vocabulary > single-shared-vocabulary | 0.60 | RU |
| `J1064` | seven-value-epistemics > eight-value-epistemics | per-record-local-vocabulary > single-shared-vocabulary | 0.60 | RU |
| `J1152` | proof-as-record-fields > proof-as-named-block | per-record-local-vocabulary > single-shared-vocabulary | 0.60 | RU |
| `J0050` | transparency-conditioned-prohibition > authorization-conditioned-prohibition | per-record-local-vocabulary > single-shared-vocabulary ⚠ | 0.55 | RU |
| `J0132` | per-file-section-names > uniform-record-schema | per-record-local-vocabulary > single-shared-vocabulary ⚠ | 0.55 | RU |
| `J0457` | canonical-operator > surface-label | single-shared-vocabulary > per-record-local-vocabulary ⚠ | 0.55 | A |
| `J0778` | per-document-versioning > uniform-version-field | per-record-local-vocabulary > single-shared-vocabulary ⚠ | 0.55 | RU |
| `J1173` | replay-as-closing-key > update-as-closing-key | per-record-local-vocabulary > single-shared-vocabulary ⚠ | 0.55 | RU |
| `J0465` | semantic-alias-layer > palette-name-layer | per-record-local-vocabulary > single-shared-vocabulary ⚠ | 0.50 | RU |

## warrant-basis — 26 judgments

**`felt-warrant`  ⇄  `evidential-warrant`**

whether wanting, feeling, resonance or salience can stand as grounds for a claim or an action, or only evidence can

<details><summary>absorbs 14 raw dimension names</summary>

`action-pressure` · `desire-vs-authority` · `epistemic-warrant` · `evidence-from-frequency` · `goal-semantics` · `justification-standard` · `metric-epistemics` · `obligation-created-by-a-record` · `practice-format` · `preference-legitimacy` · `rhetorical-force` · `signal-to-action-coupling` · `truth-criterion` · `warrant-standard`

</details>

| Judgment | Extractor's original poles | Mapped to | Conf | Prov |
|---|---|---|---|---|
| `J0212` | evidential-warrant > felt-intensity | evidential-warrant > felt-warrant | 0.90 | A |
| `J0954` | evidence > felt-recognition | evidential-warrant > felt-warrant | 0.90 | A |
| `J0958` | calibrated-claim > felt-intensity | evidential-warrant > felt-warrant | 0.90 | A |
| `J0058` | earned-evidence > salience-as-proof | evidential-warrant > felt-warrant | 0.85 | RU |
| `J0080` | ratified-authority > desire-as-authority | evidential-warrant > felt-warrant | 0.85 | A |
| `J0092` | proof-and-replay > resonance-and-confidence | evidential-warrant > felt-warrant | 0.85 | A |
| `J0733` | attributed-evidence > desire-as-authorization | evidential-warrant > felt-warrant | 0.85 | A |
| `J0589` | proof-standard > popularity-signal | evidential-warrant > felt-warrant | 0.80 | A |
| `J0202` | proof > certainty | evidential-warrant > felt-warrant | 0.75 | A |
| `J0361` | authorization-separate-from-desire > desire-as-warrant | evidential-warrant > felt-warrant | 0.75 | A |
| `J0565` | pattern-candidate > repetition-as-truth | evidential-warrant > felt-warrant | 0.75 | A |
| `J0830` | desire-as-data > desire-as-authority | evidential-warrant > felt-warrant | 0.75 | A |
| `J0606` | gated-commit > vibes-commit | evidential-warrant > felt-warrant | 0.70 | A |
| `J0674` | comparative-validation > conceptual-elegance | evidential-warrant > felt-warrant | 0.70 | A |
| `J0693` | no-oracle > signal-as-authority | evidential-warrant > felt-warrant | 0.70 | A |
| `J0960` | suitable-evidence > assertion | evidential-warrant > felt-warrant | 0.70 | A |
| `J0609` | checkable-record > model-narration | evidential-warrant > felt-warrant | 0.65 | A |
| `J0961` | explicit-authorization > desire-as-authorization | evidential-warrant > felt-warrant | 0.65 | A |
| `J0165` | empirical-validation > conceptual-elegance | evidential-warrant > felt-warrant | 0.60 | A |
| `J0208` | explicit-authorization > desire | evidential-warrant > felt-warrant | 0.60 | A |
| `J0641` | mechanical-closure > satisfaction-closure | evidential-warrant > felt-warrant | 0.60 | BP |
| `J0665` | mechanism > metaphor | evidential-warrant > felt-warrant | 0.60 | A |
| `J0007` | encode-the-gate > infer-a-thesis | evidential-warrant > felt-warrant ⚠ | 0.55 | A |
| `J0805` | purpose-equivalence > semantic-similarity | evidential-warrant > felt-warrant ⚠ | 0.55 | A |
| `J0970` | bounded-agency > manifestation-tool | evidential-warrant > felt-warrant ⚠ | 0.50 | A |
| `J0367` | proof-equivalence > semantic-overlap | evidential-warrant > felt-warrant ⚠ | 0.45 | A |

## enforcement-mechanism — 26 judgments

**`executable-enforcement`  ⇄  `documentary-declaration`**

whether a rule is carried by code that can fail, or by prose that states the rule and relies on compliance

<details><summary>absorbs 19 raw dimension names</summary>

`authority-declaration-completeness` · `authority-encoding` · `authority-specification-style` · `contract-enforcement-method` · `document-vs-executable-enforcement` · `enforcement-mechanism` · `governance-enforcement` · `invariant-emphasis` · `machine-addressability` · `normative-checklist-vs-executable-shape` · `prose-vs-schema-authority` · `rule-encoding` · `runtime-plurality` · `schema-integration` · `validation-strictness` · `vocabulary-enforcement` · `what-gets-enforced` · `which-concept-gets-a-contract` · `which-contract-gets-code`

</details>

| Judgment | Extractor's original poles | Mapped to | Conf | Prov |
|---|---|---|---|---|
| `J0191` | unenforced-constitution > schema-enforced-constitution | documentary-declaration > executable-enforcement | 0.75 | BP |
| `J0042` | machine-readable-authority > prose-authority | executable-enforcement > documentary-declaration | 0.70 | RU |
| `J0855` | field-enforcement > prose-restatement | executable-enforcement > documentary-declaration | 0.70 | RU |
| `J0858` | machine-checkable-flags > prose-rails | executable-enforcement > documentary-declaration | 0.70 | RU |
| `J1124` | standard-as-prose > standard-as-serialization | documentary-declaration > executable-enforcement | 0.70 | RU |
| `J1146` | validator-enforced-containment > per-folder-node | executable-enforcement > documentary-declaration | 0.70 | RU |
| `J1231` | regex-pinned-prose > unenforced-prose | executable-enforcement > documentary-declaration | 0.70 | BP |
| `J0255` | activation-enforcement > perception-enforcement | executable-enforcement > documentary-declaration | 0.65 | BP |
| `J0912` | comment-declared-enum > schema-enforced-enum | documentary-declaration > executable-enforcement | 0.65 | BP |
| `J0004` | digest-bound-approval > prose-approval | executable-enforcement > documentary-declaration | 0.60 | A |
| `J0246` | guarded-region > whole-file-trust | executable-enforcement > documentary-declaration | 0.60 | BP |
| `J0442` | inline-field-list > pinned-schema-ref | documentary-declaration > executable-enforcement | 0.60 | RU |
| `J1073` | regex-validated-timestamp > format-keyword-timestamp | executable-enforcement > documentary-declaration | 0.60 | BP |
| `J1142` | advisory-structure-rule > enforced-structure-rule | documentary-declaration > executable-enforcement | 0.60 | RU |
| `J1156` | unenforced-record-shape > validated-record-shape | documentary-declaration > executable-enforcement | 0.60 | BP |
| `J0990` | authority-booleans > boundary-prose | executable-enforcement > documentary-declaration ⚠ | 0.55 | RU |
| `J1081` | const-denial > boolean-denial | executable-enforcement > documentary-declaration ⚠ | 0.55 | RU |
| `J1181` | template-as-tested-canon > template-as-free-prose | executable-enforcement > documentary-declaration ⚠ | 0.55 | A |
| `J0130` | schema-strictness > prose-strictness | executable-enforcement > documentary-declaration ⚠ | 0.50 | RU |
| `J0661` | human-judged-mattering > machine-judged-mattering | documentary-declaration > executable-enforcement ⚠ | 0.50 | A |
| `J0699` | machine-readable-inertness > prose-or-absent-inertness | executable-enforcement > documentary-declaration ⚠ | 0.50 | RU |
| `J0906` | changelog-and-tests-as-receipt > rfc-before-implementation | executable-enforcement > documentary-declaration ⚠ | 0.50 | BP |
| `J1075` | bounded-identifier > unbounded-identifier | executable-enforcement > documentary-declaration ⚠ | 0.50 | RU |
| `J0536` | heuristic-smallest-move > mandated-smallest-move | documentary-declaration > executable-enforcement ⚠ | 0.45 | A |
| `J0160` | embodied-ontology > explained-ontology | executable-enforcement > documentary-declaration ⚠ | 0.40 | A |
| `J1074` | utc-only-timestamp > offset-tolerant-timestamp | executable-enforcement > documentary-declaration ⚠ | 0.40 | RU |

## capability-permission-coupling — 25 judgments

**`capability-implies-permission`  ⇄  `permission-separate-from-capability`**

whether being able to do a thing (or being confident, or having proof) is itself licence to do it, or licence is a separate fact

<details><summary>absorbs 17 raw dimension names</summary>

`adoption-gating` · `affordance-honesty` · `authority-evidence` · `capability-naming-honesty` · `confidence-vs-authority` · `gate-membership` · `interaction-affordance` · `maturity-gating` · `promotion-gate` · `proof-vs-authorization` · `state-mutation-gate` · `status-gating` · `visibility-of-agent-power` · `what-gates-a-transition` · `what-licenses-a-change` · `what-licenses-action` · `what-publishing-authorizes`

</details>

| Judgment | Extractor's original poles | Mapped to | Conf | Prov |
|---|---|---|---|---|
| `J0147` | permission-separate-from-capability > capability-implies-permission | permission-separate-from-capability > capability-implies-permission | 0.90 | A |
| `J0520` | explicit-authorization > confidence-as-license | permission-separate-from-capability > capability-implies-permission | 0.90 | A |
| `J0591` | proof-authority-separation > proof-implies-permission | permission-separate-from-capability > capability-implies-permission | 0.90 | A |
| `J0666` | delegated-authority > capability-implies-authority | permission-separate-from-capability > capability-implies-permission | 0.90 | A |
| `J0396` | review-regardless-of-score > confidence-threshold-autonomy | permission-separate-from-capability > capability-implies-permission | 0.85 | RU |
| `J0537` | explicit-authorization > reversibility-as-license | permission-separate-from-capability > capability-implies-permission | 0.85 | A |
| `J0084` | two-gate-update > single-gate-update | permission-separate-from-capability > capability-implies-permission | 0.80 | A |
| `J0488` | separated-confidence > confidence-as-truth | permission-separate-from-capability > capability-implies-permission | 0.80 | A |
| `J0550` | orientation-without-authority > inference-as-authority | permission-separate-from-capability > capability-implies-permission | 0.80 | A |
| `J0588` | explicit-grant > confidence-derived-authority | permission-separate-from-capability > capability-implies-permission | 0.80 | A |
| `J0986` | conformance-evidence > publish-authorization | permission-separate-from-capability > capability-implies-permission | 0.80 | A |
| `J0146` | authorized-update > automatic-update | permission-separate-from-capability > capability-implies-permission | 0.75 | A |
| `J0804` | confidence-as-fit > confidence-as-authority | permission-separate-from-capability > capability-implies-permission | 0.75 | A |
| `J0095` | explicit-promotion-check > implicit-promotion | permission-separate-from-capability > capability-implies-permission | 0.70 | A |
| `J0233` | staged-gates > single-step-adoption | permission-separate-from-capability > capability-implies-permission | 0.70 | A |
| `J0311` | conformance-evidence > publication-authority | permission-separate-from-capability > capability-implies-permission | 0.70 | A |
| `J0503` | authorized-event-gating > open-write-state | permission-separate-from-capability > capability-implies-permission | 0.70 | A |
| `J0942` | propose-never-self-activate > automatic-graduation | permission-separate-from-capability > capability-implies-permission | 0.70 | A |
| `J1183` | separate-authorization-receipt > inline-self-declared-authority | permission-separate-from-capability > capability-implies-permission | 0.70 | A |
| `J1189` | ratification-receipt > confidence-score | permission-separate-from-capability > capability-implies-permission | 0.70 | A |
| `J0358` | publication-without-grant > publication-as-consent | permission-separate-from-capability > capability-implies-permission | 0.65 | A |
| `J0472` | bounded-draft > authorized-execution | permission-separate-from-capability > capability-implies-permission | 0.65 | A |
| `J0181` | split-proof-and-update > fused-proof-update | permission-separate-from-capability > capability-implies-permission | 0.60 | RU |
| `J0667` | criteria-gated-agenthood > interaction-reification | permission-separate-from-capability > capability-implies-permission ⚠ | 0.55 | A |
| `J1175` | inert-extension > authority-bearing-extension | permission-separate-from-capability > capability-implies-permission ⚠ | 0.55 | A |

## state-ownership-in-interface — 25 judgments

**`view-holds-state`  ⇄  `model-holds-state`**

whether the rendered surface owns the state it shows, or it is a derived projection of state owned elsewhere

<details><summary>absorbs 10 raw dimension names</summary>

`projection-cost` · `state-ownership` · `state-ownership-in-the-interface` · `state-vs-view` · `view-versus-state` · `view-vs-semantics` · `view-vs-state` · `write-direction` · `write-path-for-automated-commits` · `write-target`

</details>

| Judgment | Extractor's original poles | Mapped to | Conf | Prov |
|---|---|---|---|---|
| `J0436` | bounded-orchestration > shadow-state-store | model-holds-state > view-holds-state | 0.90 | A |
| `J0660` | projection-holds-state > view-holds-state | model-holds-state > view-holds-state | 0.90 | A |
| `J0234` | rebuildable-view > canonical-view-state | model-holds-state > view-holds-state | 0.85 | A |
| `J0495` | rebuildable-view > ontological-projection | model-holds-state > view-holds-state | 0.85 | A |
| `J0553` | derived-view > canonical-view | model-holds-state > view-holds-state | 0.85 | RU |
| `J0478` | inert-navigation > navigation-as-event | model-holds-state > view-holds-state | 0.80 | A |
| `J0569` | derived-projection > stored-projection | model-holds-state > view-holds-state | 0.80 | RU |
| `J0821` | record-as-source > view-as-source | model-holds-state > view-holds-state | 0.80 | A |
| `J1236` | view-materialization > canonical-rendering | model-holds-state > view-holds-state | 0.80 | A |
| `J0009` | repo-as-canon > site-as-canon | model-holds-state > view-holds-state | 0.70 | A |
| `J0306` | view-provenance > canonical-state | model-holds-state > view-holds-state | 0.70 | A |
| `J0737` | semantic-invariance > presentation-preference | model-holds-state > view-holds-state | 0.70 | A |
| `J0967` | semantic-state > presentation-preference | model-holds-state > view-holds-state | 0.70 | A |
| `J0010` | downstream-write > upstream-write | model-holds-state > view-holds-state | 0.65 | A |
| `J0024` | single-semantic-model > parallel-ontology | model-holds-state > view-holds-state | 0.65 | A |
| `J0157` | single-source > per-view-sources | model-holds-state > view-holds-state | 0.65 | A |
| `J0229` | semantic-identity > presentation-adaptation | model-holds-state > view-holds-state | 0.65 | A |
| `J0359` | independent-projection > embedded-canon | model-holds-state > view-holds-state | 0.60 | A |
| `J0370` | view-reads-model > view-creates-model | model-holds-state > view-holds-state | 0.60 | A |
| `J0512` | semantic-key-identity > presentation-identity | model-holds-state > view-holds-state | 0.60 | A |
| `J1006` | semantic-priority > presentation-fit | model-holds-state > view-holds-state ⚠ | 0.55 | A |
| `J0248` | receipt-as-evidence > receipt-as-state | model-holds-state > view-holds-state ⚠ | 0.50 | RU |
| `J0818` | live-text > rasterized-text | model-holds-state > view-holds-state ⚠ | 0.50 | A |
| `J0796` | rendered-route-first > source-object-first | view-holds-state > model-holds-state ⚠ | 0.45 | RU |
| `J1084` | live-text > pixel-text | model-holds-state > view-holds-state ⚠ | 0.45 | A |

## claim-boundedness — 25 judgments

**`bounded-claim`  ⇄  `unbounded-claim`**

whether a claim states the limits of what it covers, or is asserted without any declared boundary

<details><summary>absorbs 10 raw dimension names</summary>

`boundary-coverage` · `claim-ambition` · `claim-calibration` · `claim-scope` · `how-limits-are-expressed` · `restraint-quantification` · `scope-definition-completeness` · `scope-of-provable-claims` · `scope-of-representation` · `scope-of-self-description`

</details>

| Judgment | Extractor's original poles | Mapped to | Conf | Prov |
|---|---|---|---|---|
| `J0168` | claim-refusal > unbounded-claim | bounded-claim > unbounded-claim | 0.80 | A |
| `J0373` | bounded-behavioral-evidence > global-trait-claim | bounded-claim > unbounded-claim | 0.80 | A |
| `J0691` | narrow-defensible-claim > metaphysical-claim | bounded-claim > unbounded-claim | 0.80 | A |
| `J0728` | unfenced-legal-claim > uniform-boundary-discipline | unbounded-claim > bounded-claim | 0.70 | RU |
| `J0207` | bounded-record > interpretive-authority | bounded-claim > unbounded-claim | 0.60 | A |
| `J0438` | honest-job-state > optimistic-cancel | bounded-claim > unbounded-claim | 0.60 | A |
| `J0577` | purpose-scoped-closure > global-closure | bounded-claim > unbounded-claim | 0.60 | A |
| `J0642` | negative-attestation > positive-attestation-only | bounded-claim > unbounded-claim | 0.60 | BP |
| `J0915` | named-lacunae > uniform-stability-claim | bounded-claim > unbounded-claim | 0.60 | A |
| `J0167` | revisable-ontology > fixed-ontology | bounded-claim > unbounded-claim ⚠ | 0.55 | A |
| `J0226` | operational-representation > experiential-claim | bounded-claim > unbounded-claim ⚠ | 0.55 | A |
| `J0257` | required-unknowns > optional-unknowns | bounded-claim > unbounded-claim ⚠ | 0.55 | RU |
| `J0619` | explicit-denylist > implicit-deny | bounded-claim > unbounded-claim ⚠ | 0.55 | RU |
| `J0654` | self-rebutting-finding > bare-flag | bounded-claim > unbounded-claim ⚠ | 0.55 | BP |
| `J0823` | bounded-progress-claim > identity-claim | bounded-claim > unbounded-claim ⚠ | 0.55 | A |
| `J0138` | version-scoped-determinism > cross-version-determinism | bounded-claim > unbounded-claim ⚠ | 0.50 | RU |
| `J0150` | attributed-agency > fluency-inferred-agency | bounded-claim > unbounded-claim ⚠ | 0.50 | A |
| `J0532` | world-caused-events > agent-only-attribution | bounded-claim > unbounded-claim ⚠ | 0.50 | RU |
| `J0924` | bounded-container > bot-as-intelligence | bounded-claim > unbounded-claim ⚠ | 0.50 | A |
| `J0008` | concrete-vocabulary > ai-polished-gloss | bounded-claim > unbounded-claim ⚠ | 0.45 | A |
| `J0154` | non-moralized-direction > normative-labeling | bounded-claim > unbounded-claim ⚠ | 0.45 | A |
| `J0178` | hard-coded-default > author-supplied-value | bounded-claim > unbounded-claim ⚠ | 0.45 | RU |
| `J0256` | counterexample-teaching > definition-only | bounded-claim > unbounded-claim ⚠ | 0.45 | RU |
| `J0684` | coupling-loosening > emotion-suppression | bounded-claim > unbounded-claim ⚠ | 0.45 | A |
| `J0971` | inspectable-record > therapy | bounded-claim > unbounded-claim ⚠ | 0.45 | A |

## authority-breadth — 24 judgments

**`scoped-grant`  ⇄  `blanket-authority`**

how wide a single grant or rule reaches: narrowly scoped to one object versus a blanket grant over a whole surface

<details><summary>absorbs 24 raw dimension names</summary>

`authority-boundary` · `authority-breadth` · `authority-reach` · `authorization-strictness` · `causal-attribution-scope` · `closure-scope` · `context-scope` · `dogfooding-scope` · `enforcement-blast-radius` · `enforcement-breadth` · `enforcement-surface` · `enforcement-target` · `governance-surface` · `grant-scope` · `grant-threshold` · `observation-scope` · `override-boundary` · `rule-application-scope` · `rule-precedence` · `schema-authority-scope` · `scope-model` · `style-rule-scope` · `validator-reach` · `write-scope-precision`

</details>

| Judgment | Extractor's original poles | Mapped to | Conf | Prov |
|---|---|---|---|---|
| `J0083` | scoped-revocable-authority > blanket-authority | scoped-grant > blanket-authority | 0.90 | A |
| `J0435` | grant-bound-scope > prompt-widened-scope | scoped-grant > blanket-authority | 0.90 | A |
| `J0056` | enumerated-allowlist > prose-scoped-write | scoped-grant > blanket-authority | 0.80 | RU |
| `J0485` | tiered-adaptation > open-personalization | scoped-grant > blanket-authority | 0.70 | A |
| `J0493` | preference-field-fence > unrestricted-preference-scope | scoped-grant > blanket-authority | 0.70 | A |
| `J0508` | relationship-scoped-publication-gate > universal-publication-gate | scoped-grant > blanket-authority | 0.70 | RU |
| `J0021` | least-necessary-scope > bulk-ingestion | scoped-grant > blanket-authority | 0.65 | A |
| `J0018` | single-writer > distributed-write-authority | scoped-grant > blanket-authority | 0.60 | A |
| `J0052` | role-tiered-commands > flat-command-surface | scoped-grant > blanket-authority | 0.60 | RU |
| `J0409` | scoped-aperture > full-document-access | scoped-grant > blanket-authority | 0.60 | RU |
| `J0910` | local-scope-lock > cross-root-enforcement | scoped-grant > blanket-authority | 0.60 | A |
| `J0013` | meaning-bearing-repetition > blanket-repetition-ban | scoped-grant > blanket-authority ⚠ | 0.55 | A |
| `J0028` | module-scoped-role > runtime-wide-identity | scoped-grant > blanket-authority ⚠ | 0.55 | A |
| `J0053` | single-egress-exception > general-egress | scoped-grant > blanket-authority ⚠ | 0.55 | RU |
| `J0598` | effect-class-gating > uniform-prompting | scoped-grant > blanket-authority ⚠ | 0.55 | A |
| `J0645` | self-governance-scope > product-change-scope | scoped-grant > blanket-authority ⚠ | 0.55 | BP |
| `J0925` | three-role-separation > single-product-identity | scoped-grant > blanket-authority ⚠ | 0.55 | A |
| `J1235` | scoped-guard-exemption > blanket-exemption | scoped-grant > blanket-authority ⚠ | 0.55 | RU |
| `J0292` | context-gated-normalization > blanket-substitution | scoped-grant > blanket-authority ⚠ | 0.50 | A |
| `J0296` | per-version-canonicity > global-schema | scoped-grant > blanket-authority ⚠ | 0.50 | A |
| `J0443` | ungated-hashing > grant-before-any-work | scoped-grant > blanket-authority ⚠ | 0.50 | RU |
| `J1143` | yawn-tree-self-governance > whole-repo-self-governance | scoped-grant > blanket-authority ⚠ | 0.50 | RU |
| `J1233` | context-scoped-normalization > blanket-string-rewrite | scoped-grant > blanket-authority ⚠ | 0.50 | BP |
| `J0313` | local-inspection > network-check | scoped-grant > blanket-authority ⚠ | 0.45 | A |

## disclosure-depth — 24 judgments

**`full-fidelity-disclosure`  ⇄  `minimal-redacted-disclosure`**

how much of what is known is shown: verbatim and complete, or summarised, redacted and progressively revealed

<details><summary>absorbs 15 raw dimension names</summary>

`control-disclosure` · `depiction-of-persons` · `disclosure-depth` · `disclosure-discipline` · `disclosure-reciprocity` · `interface-disclosure-depth` · `interface-self-disclosure` · `lossiness-of-compression` · `privacy-vs-evidence` · `privacy-vs-fidelity` · `resolution-vs-compression` · `source-fidelity` · `surface-complexity` · `text-fidelity` · `who-may-be-named`

</details>

| Judgment | Extractor's original poles | Mapped to | Conf | Prov |
|---|---|---|---|---|
| `J0813` | minimal-verbatim-disclosure > full-transcript-import | minimal-redacted-disclosure > full-fidelity-disclosure | 0.85 | A |
| `J0392` | author-self-disclosure > synthesized-persona | full-fidelity-disclosure > minimal-redacted-disclosure | 0.80 | RU |
| `J0158` | progressive-disclosure > flat-detail | minimal-redacted-disclosure > full-fidelity-disclosure | 0.70 | A |
| `J0596` | single-question-face > candidate-list-surface | minimal-redacted-disclosure > full-fidelity-disclosure | 0.70 | A |
| `J0685` | family-privacy > citation-completeness | minimal-redacted-disclosure > full-fidelity-disclosure | 0.70 | A |
| `J0144` | high-resolution-source > compressed-slogan | full-fidelity-disclosure > minimal-redacted-disclosure | 0.60 | A |
| `J0365` | contradiction-preservation > clean-summary | full-fidelity-disclosure > minimal-redacted-disclosure | 0.60 | A |
| `J0439` | receipt-privacy > full-prompt-logging | minimal-redacted-disclosure > full-fidelity-disclosure | 0.60 | A |
| `J0459` | narrowed-primary-controls > flat-operator-set | minimal-redacted-disclosure > full-fidelity-disclosure | 0.60 | RU |
| `J0462` | collapsed-default > expanded-default | minimal-redacted-disclosure > full-fidelity-disclosure | 0.60 | RU |
| `J0581` | public-contract-only > full-runtime-publication | minimal-redacted-disclosure > full-fidelity-disclosure | 0.60 | A |
| `J0644` | unsanitized-local-paths > path-sanitization | full-fidelity-disclosure > minimal-redacted-disclosure | 0.60 | BP |
| `J1056` | top-n-operations > exhaustive-operations | minimal-redacted-disclosure > full-fidelity-disclosure | 0.60 | A |
| `J0031` | surface-graded-redaction > uniform-redaction | minimal-redacted-disclosure > full-fidelity-disclosure ⚠ | 0.55 | A |
| `J0087` | lossy-projection > conflicting-projection | minimal-redacted-disclosure > full-fidelity-disclosure ⚠ | 0.55 | A |
| `J0064` | smallest-surface-first > desktop-first | minimal-redacted-disclosure > full-fidelity-disclosure ⚠ | 0.50 | RU |
| `J0183` | compressed-display-loop > canonical-loop-parity | minimal-redacted-disclosure > full-fidelity-disclosure ⚠ | 0.50 | RU |
| `J0184` | thesis-first-disclosure > provenance-first-disclosure | minimal-redacted-disclosure > full-fidelity-disclosure ⚠ | 0.50 | RU |
| `J0236` | single-question > question-batch | minimal-redacted-disclosure > full-fidelity-disclosure ⚠ | 0.50 | A |
| `J0286` | visible-disagreement > adjudicated-source | full-fidelity-disclosure > minimal-redacted-disclosure ⚠ | 0.50 | A |
| `J0461` | three-path-cap > unbounded-option-set | minimal-redacted-disclosure > full-fidelity-disclosure ⚠ | 0.50 | RU |
| `J0680` | reflexive-mediation > neutral-display | full-fidelity-disclosure > minimal-redacted-disclosure ⚠ | 0.50 | A |
| `J0709` | disconfirming-evidence-included > supportive-citation-only | full-fidelity-disclosure > minimal-redacted-disclosure ⚠ | 0.50 | BP |
| `J1055` | justified-ranked-shortlist > unranked-list | minimal-redacted-disclosure > full-fidelity-disclosure ⚠ | 0.45 | A |

## record-granularity — 24 judgments

**`decomposed-many-records`  ⇄  `combined-single-record`**

whether one concern gets one small record each, or several concerns are fused into a single larger record

<details><summary>absorbs 15 raw dimension names</summary>

`answer-state-granularity` · `asynchrony-modelling` · `episode-cardinality` · `import-granularity` · `message-modelling` · `migration-granularity` · `outcome-granularity` · `provenance-granularity` · `receipt-granularity` · `record-granularity` · `state-representation` · `state-storage-model` · `statefulness` · `temporal-model` · `temporal-modeling`

</details>

| Judgment | Extractor's original poles | Mapped to | Conf | Prov |
|---|---|---|---|---|
| `J0638` | split-grant-and-outcome > combined-record | decomposed-many-records > combined-single-record | 0.95 | BP |
| `J0066` | separated-identity-files > single-bot-file | decomposed-many-records > combined-single-record | 0.85 | RU |
| `J1247` | distinct-action-records > merged-action-record | decomposed-many-records > combined-single-record | 0.85 | BP |
| `J0148` | linking > merging | decomposed-many-records > combined-single-record | 0.80 | A |
| `J0417` | referenced-records > inline-prose | decomposed-many-records > combined-single-record | 0.80 | RU |
| `J0524` | split-packets > single-packet | decomposed-many-records > combined-single-record | 0.80 | A |
| `J0943` | split-approval-and-result > combined-receipt | decomposed-many-records > combined-single-record | 0.80 | A |
| `J0857` | event-sourced-decomposition > single-record | decomposed-many-records > combined-single-record | 0.75 | RU |
| `J0812` | semantic-granularity > id-granularity | combined-single-record > decomposed-many-records | 0.70 | A |
| `J1114` | split-preference-lifecycle > single-record-lifecycle | decomposed-many-records > combined-single-record | 0.60 | RU |
| `J1166` | single-long-source > many-short-notes | combined-single-record > decomposed-many-records | 0.60 | RU |
| `J0141` | reference-by-ref > embedded-value | decomposed-many-records > combined-single-record ⚠ | 0.55 | RU |
| `J0363` | judged-granularity > id-granularity | combined-single-record > decomposed-many-records ⚠ | 0.55 | A |
| `J0741` | alignment-bridge-routing > central-objective-ownership | decomposed-many-records > combined-single-record ⚠ | 0.55 | A |
| `J0742` | local-orientation-card > central-index-only | decomposed-many-records > combined-single-record ⚠ | 0.55 | A |
| `J0882` | multi-move-episode > single-move-frame | combined-single-record > decomposed-many-records ⚠ | 0.55 | RU |
| `J1106` | immutable-outcome-receipt > mutable-intent-policy | decomposed-many-records > combined-single-record ⚠ | 0.55 | BP |
| `J0366` | link-first > merge-first | decomposed-many-records > combined-single-record ⚠ | 0.50 | A |
| `J0225` | layered-scope > conflated-scope | decomposed-many-records > combined-single-record ⚠ | 0.45 | A |
| `J0254` | additive-extension > version-bump | combined-single-record > decomposed-many-records ⚠ | 0.45 | RU |
| `J0522` | stance-as-view > stance-as-agent | combined-single-record > decomposed-many-records ⚠ | 0.45 | A |
| `J0337` | generation-in-verification > verification-only | combined-single-record > decomposed-many-records ⚠ | 0.40 | BP |
| `J0724` | separated-evidence-frame > in-app-documentation | decomposed-many-records > combined-single-record ⚠ | 0.40 | BP |
| `J0784` | per-head-sha-dedupe > per-pr-dedupe | decomposed-many-records > combined-single-record ⚠ | 0.40 | RU |

## gap-disclosure — 22 judgments

**`declared-lacuna`  ⇄  `silent-omission`**

whether what is missing is named in the record as a gap, or simply left out without trace

<details><summary>absorbs 8 raw dimension names</summary>

`evidence-disclosure` · `fixture-honesty` · `gap-disclosure` · `handling-absent-evidence` · `incomplete-work-handling` · `self-disclosure-of-gaps` · `what-a-result-must-admit` · `what-gets-written-down`

</details>

| Judgment | Extractor's original poles | Mapped to | Conf | Prov |
|---|---|---|---|---|
| `J0441` | declared-lacunae > intent-only-contract | declared-lacuna > silent-omission | 0.90 | RU |
| `J0682` | named-lacuna > concealed-gap | declared-lacuna > silent-omission | 0.85 | A |
| `J0798` | gapless-index > self-declared-lacuna | silent-omission > declared-lacuna | 0.80 | RU |
| `J1135` | residue-disclosure > clean-success-reporting | declared-lacuna > silent-omission | 0.80 | RU |
| `J0401` | redacted-presence > silent-omission | declared-lacuna > silent-omission | 0.75 | BP |
| `J0655` | open-lacuna-tail > clean-closure | declared-lacuna > silent-omission | 0.75 | BP |
| `J0802` | recorded-exclusions > inclusion-only-frame | declared-lacuna > silent-omission | 0.70 | A |
| `J0321` | recorded-lacunae > known-only-record | declared-lacuna > silent-omission | 0.65 | RU |
| `J0610` | structure-disclosure > lane-concealment | declared-lacuna > silent-omission | 0.65 | A |
| `J0065` | recorded-miss > silent-patch | declared-lacuna > silent-omission | 0.60 | BP |
| `J0639` | disclosed-substitution > silent-substitution | declared-lacuna > silent-omission ⚠ | 0.55 | BP |
| `J0173` | partial-serialization > complete-serialization | silent-omission > declared-lacuna ⚠ | 0.50 | RU |
| `J0174` | relationship-owned-agents > arena-owned-agents | silent-omission > declared-lacuna ⚠ | 0.50 | RU |
| `J0175` | unserialized-repair > recorded-repair | silent-omission > declared-lacuna ⚠ | 0.50 | RU |
| `J0179` | generic-agent-shape > typed-artificial-agent | silent-omission > declared-lacuna ⚠ | 0.50 | RU |
| `J0180` | flat-agent-list > multi-actor-field | silent-omission > declared-lacuna ⚠ | 0.50 | RU |
| `J0176` | actual-history > counterfactual-history | silent-omission > declared-lacuna ⚠ | 0.45 | RU |
| `J0177` | computable-contributors > enumerated-contributors | silent-omission > declared-lacuna ⚠ | 0.45 | RU |
| `J0198` | single-trajectory-field > indicator-set | silent-omission > declared-lacuna ⚠ | 0.45 | RU |
| `J0371` | timeout-as-event > inferred-failure | declared-lacuna > silent-omission ⚠ | 0.45 | A |
| `J0883` | waiting-as-first-class > waiting-as-absence | declared-lacuna > silent-omission ⚠ | 0.45 | RU |
| `J1026` | implicit-direction > declared-direction | silent-omission > declared-lacuna ⚠ | 0.45 | RU |

## record-shape-uniformity — 22 judgments

**`uniform-record-shape`  ⇄  `per-kind-record-shape`**

whether every record in the corpus takes the same shape, or each kind of record gets its own

<details><summary>absorbs 18 raw dimension names</summary>

`composition-model` · `data-model-discipline` · `episode-purpose` · `example-to-template-mapping` · `generality-of-templates` · `generality-vs-personal-fit` · `intake-form-shape` · `intake-mechanism` · `intake-structure` · `minimal-record-shape` · `objective-shape` · `record-composition` · `record-discipline` · `record-purpose` · `record-uniformity` · `structural-consistency` · `template-content-vs-structure` · `template-to-instance-ratio`

</details>

| Judgment | Extractor's original poles | Mapped to | Conf | Prov |
|---|---|---|---|---|
| `J0319` | template-conformance > per-record-shape | uniform-record-shape > per-kind-record-shape | 0.80 | BP |
| `J0405` | genre-specific-boundary > uniform-boundary-shape | per-kind-record-shape > uniform-record-shape | 0.75 | RU |
| `J0617` | llm-specific-provenance > uniform-access-log | per-kind-record-shape > uniform-record-shape | 0.70 | RU |
| `J0698` | versioned-frontmatter > flat-header | per-kind-record-shape > uniform-record-shape | 0.70 | RU |
| `J0773` | per-document-ordering > one-normalized-spine | per-kind-record-shape > uniform-record-shape | 0.65 | RU |
| `J0414` | boundary-before-proof > proof-before-boundary | uniform-record-shape > per-kind-record-shape | 0.60 | RU |
| `J0447` | enriched-handle > bare-handle | per-kind-record-shape > uniform-record-shape | 0.60 | RU |
| `J0797` | weight-by-significance > uniform-record-shape | per-kind-record-shape > uniform-record-shape | 0.60 | RU |
| `J0801` | schema-wrapped-rhetoric > free-standing-manifesto | uniform-record-shape > per-kind-record-shape | 0.60 | BP |
| `J0331` | interrogative-knowledge-node > uniform-questions-first | per-kind-record-shape > uniform-record-shape ⚠ | 0.55 | RU |
| `J0878` | transition-machinery > boundary-machinery | per-kind-record-shape > uniform-record-shape ⚠ | 0.55 | RU |
| `J0932` | structured-commit-envelope > freeform-commit-subject | uniform-record-shape > per-kind-record-shape ⚠ | 0.55 | BP |
| `J1080` | per-record-boundary > shared-boundary-def | per-kind-record-shape > uniform-record-shape ⚠ | 0.55 | BP |
| `J1172` | purpose-for-containers > purpose-for-instances | per-kind-record-shape > uniform-record-shape ⚠ | 0.55 | RU |
| `J0300` | generic-record-ref > typed-foreign-key | uniform-record-shape > per-kind-record-shape ⚠ | 0.50 | A |
| `J0527` | concrete-write-path > abstract-concept-map | per-kind-record-shape > uniform-record-shape ⚠ | 0.50 | RU |
| `J0904` | two-record-types > single-decision-record | per-kind-record-shape > uniform-record-shape ⚠ | 0.50 | A |
| `J1113` | timeless-intent > timestamped-intent | per-kind-record-shape > uniform-record-shape ⚠ | 0.50 | RU |
| `J0194` | question-surface > render-surface | per-kind-record-shape > uniform-record-shape ⚠ | 0.45 | RU |
| `J0348` | agent-as-contributor-class > generic-contributor | per-kind-record-shape > uniform-record-shape ⚠ | 0.45 | RU |
| `J0848` | pre-seeded-prompts > empty-shell | per-kind-record-shape > uniform-record-shape ⚠ | 0.45 | RU |
| `J0862` | maintenance-objective > achievement-objective | per-kind-record-shape > uniform-record-shape ⚠ | 0.35 | RU |

## runtime-dependence — 22 judgments

**`zero-dependency-portability`  ⇄  `tool-and-vendor-binding`**

whether an artifact can be read and checked with nothing installed, or requires a particular parser, runtime, host or vendor

<details><summary>absorbs 9 raw dimension names</summary>

`deployment-portability` · `durability-vs-vendor-integration` · `harness-configuration` · `operator-environment-assumption` · `protocol-implementation-boundary` · `provider-binding` · `runtime-dependency` · `substrate-dependency` · `tooling-dependence`

</details>

| Judgment | Extractor's original poles | Mapped to | Conf | Prov |
|---|---|---|---|---|
| `J0073` | plain-filesystem > hosted-application | zero-dependency-portability > tool-and-vendor-binding | 0.90 | A |
| `J0206` | parser-free-plain-text > required-tooling | zero-dependency-portability > tool-and-vendor-binding | 0.90 | A |
| `J0976` | plain-text > required-parser | zero-dependency-portability > tool-and-vendor-binding | 0.90 | A |
| `J0036` | operator-machine-binding > portable-configuration | tool-and-vendor-binding > zero-dependency-portability | 0.85 | RU |
| `J0624` | windows-host-tooling > portable-tooling | tool-and-vendor-binding > zero-dependency-portability | 0.85 | BP |
| `J0245` | executable-enforcement > parser-free-plain-text | tool-and-vendor-binding > zero-dependency-portability | 0.80 | BP |
| `J0994` | validator-stack > no-required-parser | tool-and-vendor-binding > zero-dependency-portability | 0.80 | BP |
| `J0287` | zero-dependency-projection > per-page-dependency | zero-dependency-portability > tool-and-vendor-binding | 0.70 | A |
| `J0314` | dependency-free-check > library-backed-check | zero-dependency-portability > tool-and-vendor-binding | 0.70 | A |
| `J0383` | windows-runner > portable-runner | tool-and-vendor-binding > zero-dependency-portability | 0.70 | BP |
| `J0585` | provider-neutrality > provider-lock-in | zero-dependency-portability > tool-and-vendor-binding | 0.70 | A |
| `J0587` | manual-operability > ai-mediated-access | zero-dependency-portability > tool-and-vendor-binding | 0.70 | A |
| `J1083` | local-render-only > provider-neutral-render | tool-and-vendor-binding > zero-dependency-portability | 0.70 | RU |
| `J0424` | web-projection-plane > native-monolith | zero-dependency-portability > tool-and-vendor-binding | 0.60 | A |
| `J0338` | polyglot-checks > single-runtime-checks | tool-and-vendor-binding > zero-dependency-portability ⚠ | 0.55 | BP |
| `J0345` | zero-backend-surface > hosted-form-backend | zero-dependency-portability > tool-and-vendor-binding ⚠ | 0.55 | RU |
| `J0420` | separate-runtime-repo > monorepo-runtime | zero-dependency-portability > tool-and-vendor-binding ⚠ | 0.55 | BP |
| `J0948` | script-free-pages > client-side-scripting | zero-dependency-portability > tool-and-vendor-binding ⚠ | 0.55 | A |
| `J0310` | email-first > automation-first | zero-dependency-portability > tool-and-vendor-binding ⚠ | 0.50 | A |
| `J0372` | causal-openness > process-liveness | zero-dependency-portability > tool-and-vendor-binding ⚠ | 0.45 | A |
| `J0649` | concrete-principal-binding > abstract-role-binding | tool-and-vendor-binding > zero-dependency-portability ⚠ | 0.40 | RU |
| `J0873` | named-principal-default > principal-agnostic-template | tool-and-vendor-binding > zero-dependency-portability ⚠ | 0.40 | RU |

## record-mutability — 20 judgments

**`append-only-immutable`  ⇄  `destructive-in-place-update`**

whether a record is corrected by appending a new entry, or by overwriting, rewriting or deleting the old one

<details><summary>absorbs 14 raw dimension names</summary>

`deletion-policy` · `durability-of-change-records` · `durability-of-replay` · `edit-safety` · `history-mutability` · `log-mutability` · `record-mutability` · `record-retention` · `reversibility` · `revisability` · `state-mutation-authority` · `update-licensing` · `what-may-mutate-canonical-state` · `which-outputs-persist`

</details>

| Judgment | Extractor's original poles | Mapped to | Conf | Prov |
|---|---|---|---|---|
| `J0020` | append-only-history > destructive-correction | append-only-immutable > destructive-in-place-update | 0.95 | A |
| `J0204` | fork > hidden-mutation | append-only-immutable > destructive-in-place-update | 0.90 | A |
| `J0460` | append-receipt > source-rewrite | append-only-immutable > destructive-in-place-update | 0.90 | A |
| `J0547` | append-correction > overwrite-correction | append-only-immutable > destructive-in-place-update | 0.90 | A |
| `J0078` | event-replay > mutable-state | append-only-immutable > destructive-in-place-update | 0.85 | A |
| `J0621` | append-only-history > in-place-update | append-only-immutable > destructive-in-place-update | 0.85 | BP |
| `J0905` | append-only-supersession > in-place-correction | append-only-immutable > destructive-in-place-update | 0.85 | A |
| `J0082` | preserved-residue > proof-supersession | append-only-immutable > destructive-in-place-update | 0.80 | A |
| `J0127` | non-destructive-affordances > mutation-affordances | append-only-immutable > destructive-in-place-update | 0.80 | RU |
| `J0923` | forward-clarification > history-rewrite | append-only-immutable > destructive-in-place-update | 0.75 | RU |
| `J1248` | identity-preserving-restructure > destructive-overwrite | append-only-immutable > destructive-in-place-update | 0.75 | BP |
| `J0808` | tombstone > silent-deletion | append-only-immutable > destructive-in-place-update | 0.70 | A |
| `J0182` | append-only-history > current-value-snapshot | append-only-immutable > destructive-in-place-update | 0.65 | RU |
| `J0368` | addressable-supersession > id-deletion | append-only-immutable > destructive-in-place-update | 0.65 | A |
| `J0880` | hash-chained-revision > mutable-record | append-only-immutable > destructive-in-place-update | 0.65 | RU |
| `J0959` | authorized-event > ambient-mutation | append-only-immutable > destructive-in-place-update | 0.60 | A |
| `J0722` | narrated-change-history > bare-updated-date | append-only-immutable > destructive-in-place-update ⚠ | 0.55 | RU |
| `J0885` | mutable-pointer > dated-record | destructive-in-place-update > append-only-immutable ⚠ | 0.55 | RU |
| `J0895` | forward-only-migration > rollback-restore | append-only-immutable > destructive-in-place-update ⚠ | 0.55 | A |
| `J0922` | receipted-promotion > silent-status-edit | append-only-immutable > destructive-in-place-update ⚠ | 0.55 | BP |

## audience-primacy — 20 judgments

**`human-readability-first`  ⇄  `machine-addressability-first`**

which reader the artifact is shaped for when the two conflict: a person reading it, or a parser consuming it

<details><summary>absorbs 7 raw dimension names</summary>

`artifact-audience-priority` · `artifact-genre` · `artifact-location` · `audience` · `audience-ranking` · `primary-audience` · `primary-reader`

</details>

| Judgment | Extractor's original poles | Mapped to | Conf | Prov |
|---|---|---|---|---|
| `J0201` | human-readability > machine-addressability | human-readability-first > machine-addressability-first | 0.95 | A |
| `J0377` | human-readability > machine-addressability | human-readability-first > machine-addressability-first | 0.95 | A |
| `J1034` | human-readability > machine-addressability | human-readability-first > machine-addressability-first | 0.95 | A |
| `J0554` | human-readability > machine-addressability | human-readability-first > machine-addressability-first | 0.90 | RU |
| `J0731` | human-readability > machine-addressability | human-readability-first > machine-addressability-first | 0.90 | A |
| `J1164` | human-readability > machine-addressability | human-readability-first > machine-addressability-first | 0.85 | A |
| `J0238` | machine-addressability > human-readability | machine-addressability-first > human-readability-first | 0.80 | BP |
| `J0559` | human-audience-primacy > builder-audience-primacy | human-readability-first > machine-addressability-first | 0.75 | RU |
| `J0769` | machine-contract-stability > human-document-stability | machine-addressability-first > human-readability-first | 0.70 | BP |
| `J0828` | human-authoring-projection > executable-interchange | human-readability-first > machine-addressability-first | 0.70 | A |
| `J1036` | machine-addressability > human-readability | machine-addressability-first > human-readability-first | 0.70 | RU |
| `J1155` | substrate-machine-only > substrate-with-human-form | machine-addressability-first > human-readability-first | 0.65 | RU |
| `J1163` | machine-contract-stability > human-document-unification | machine-addressability-first > human-readability-first | 0.65 | RU |
| `J0243` | selector-governance > human-use-guidance | machine-addressability-first > human-readability-first | 0.60 | BP |
| `J0244` | contract-maintenance > human-doc-maintenance | machine-addressability-first > human-readability-first | 0.60 | RU |
| `J0330` | human-readable-holds > machine-addressable-holds | human-readability-first > machine-addressability-first | 0.60 | RU |
| `J0186` | machine-addressable-rules > prose-only-rules | machine-addressability-first > human-readability-first ⚠ | 0.55 | RU |
| `J1037` | human-readability > proof-discipline | human-readability-first > machine-addressability-first ⚠ | 0.55 | RU |
| `J0764` | narrative-orientation-card > machine-manifest | human-readability-first > machine-addressability-first ⚠ | 0.50 | RU |
| `J0690` | agency-question > system-question | human-readability-first > machine-addressability-first ⚠ | 0.35 | A |

## maturity-claim-honesty — 19 judgments

**`honest-maturity-label`  ⇄  `inflated-stability-claim`**

whether a record's advertised maturity matches what it actually has, or overstates it

<details><summary>absorbs 10 raw dimension names</summary>

`authority-of-experimental-fields` · `how-aggregate-maturity-is-reported` · `maturity-allocation` · `maturity-disclosure` · `maturity-divergence` · `maturity-labelling` · `maturity-self-description` · `template-divergence` · `template-vs-instance-drift` · `what-a-draft-schema-commits-to`

</details>

| Judgment | Extractor's original poles | Mapped to | Conf | Prov |
|---|---|---|---|---|
| `J0748` | labelled-draft > claimed-stability | honest-maturity-label > inflated-stability-claim | 0.85 | A |
| `J0981` | labeled-draft > stable-claim | honest-maturity-label > inflated-stability-claim | 0.85 | A |
| `J0189` | record-first-canon > implementation-gated-canon | inflated-stability-claim > honest-maturity-label | 0.70 | BP |
| `J0914` | seed-honest-labeling > stable-claim-inflation | honest-maturity-label > inflated-stability-claim | 0.70 | RU |
| `J0390` | draft-on-elaboration > promotion-on-effort | honest-maturity-label > inflated-stability-claim | 0.65 | RU |
| `J0891` | draft-tolerated > stable-before-use | honest-maturity-label > inflated-stability-claim | 0.65 | RU |
| `J0477` | honest-availability > optimistic-catalog | honest-maturity-label > inflated-stability-claim | 0.60 | A |
| `J0824` | partial-template-honesty > complete-schema-claim | honest-maturity-label > inflated-stability-claim | 0.60 | A |
| `J1004` | public-working-paper > peer-reviewed-claim | honest-maturity-label > inflated-stability-claim | 0.60 | A |
| `J1085` | unverifiable-by-construction > self-claimed-verification | honest-maturity-label > inflated-stability-claim | 0.60 | BP |
| `J0631` | ownership-derived-status > evidence-derived-status | inflated-stability-claim > honest-maturity-label ⚠ | 0.55 | BP |
| `J0045` | index-lag > index-tracks-contents | honest-maturity-label > inflated-stability-claim ⚠ | 0.50 | RU |
| `J0315` | draft-personal-content > promoted-personal-content | honest-maturity-label > inflated-stability-claim ⚠ | 0.50 | RU |
| `J0455` | draft-dependency > ratified-dependency | honest-maturity-label > inflated-stability-claim ⚠ | 0.50 | RU |
| `J0471` | usable-instruction > decorative-marketing-copy | honest-maturity-label > inflated-stability-claim ⚠ | 0.50 | A |
| `J0700` | imported-theory-maturity > native-reference-maturity | inflated-stability-claim > honest-maturity-label ⚠ | 0.50 | RU |
| `J0135` | mixed-status-admission > uniform-status | honest-maturity-label > inflated-stability-claim ⚠ | 0.45 | RU |
| `J0351` | record-maturity > operational-maturity | honest-maturity-label > inflated-stability-claim ⚠ | 0.40 | RU |
| `J0903` | perpetual-proposed-status > acceptance-on-implementation | honest-maturity-label > inflated-stability-claim ⚠ | 0.40 | RU |

## proof-obligation-breadth — 18 judgments

**`uniform-proof-obligation`  ⇄  `selective-proof-obligation`**

whether every record owes the same proof, or the obligation is graded, waived or exempted for some classes

<details><summary>absorbs 15 raw dimension names</summary>

`burden-on-the-accuser` · `does-the-repo-obey-its-own-ontology` · `evidentiary-rigor-at-entry` · `evidentiary-standard-by-effect-reach` · `obligation-to-attach-proof` · `proof-obligation` · `proof-obligation-scope` · `proof-rigor` · `proof-rigour-allocation` · `reflexivity-of-rules` · `schema-obligation` · `standard-applied-to-own-claims` · `where-rigor-is-required` · `who-is-held-to-falsifiability` · `who-is-held-to-the-proof-rule`

</details>

| Judgment | Extractor's original poles | Mapped to | Conf | Prov |
|---|---|---|---|---|
| `J0696` | theory-proof-exemption > uniform-proof-requirement | selective-proof-obligation > uniform-proof-obligation | 0.85 | RU |
| `J0765` | manifest-as-index > manifest-as-provable-claim | selective-proof-obligation > uniform-proof-obligation | 0.85 | RU |
| `J0787` | graded-proof-obligation > uniform-proof-obligation | selective-proof-obligation > uniform-proof-obligation | 0.85 | RU |
| `J0070` | proof-block-for-contracts > proof-block-for-identity-files | selective-proof-obligation > uniform-proof-obligation | 0.80 | RU |
| `J0108` | links-only > proof-block | selective-proof-obligation > uniform-proof-obligation | 0.80 | RU |
| `J0240` | link-list > proof-block | selective-proof-obligation > uniform-proof-obligation | 0.80 | RU |
| `J1099` | identity-needs-evidence > uniform-evidence-requirement | selective-proof-obligation > uniform-proof-obligation | 0.80 | BP |
| `J1149` | manifest-exempt > manifest-proof-bound | selective-proof-obligation > uniform-proof-obligation | 0.80 | RU |
| `J1151` | doorway-exempt > doorway-proof-bound | selective-proof-obligation > uniform-proof-obligation | 0.80 | RU |
| `J0061` | single-promotion-receipt > per-contract-receipt | selective-proof-obligation > uniform-proof-obligation | 0.70 | BP |
| `J1133` | machine-enforced-falsifiability > human-optional-falsifiability | selective-proof-obligation > uniform-proof-obligation | 0.70 | RU |
| `J0335` | unverified-verifier > self-verifying-verifier | selective-proof-obligation > uniform-proof-obligation | 0.65 | RU |
| `J1148` | unenforced-shape-slot > validated-shape-slot | selective-proof-obligation > uniform-proof-obligation | 0.65 | RU |
| `J1121` | proof-as-sentence > proof-as-contract | selective-proof-obligation > uniform-proof-obligation | 0.60 | RU |
| `J0391` | self-case-advancement > uniform-hold | selective-proof-obligation > uniform-proof-obligation ⚠ | 0.55 | RU |
| `J0048` | asymmetric-disclosure > symmetric-disclosure | selective-proof-obligation > uniform-proof-obligation ⚠ | 0.50 | RU |
| `J0704` | asymmetric-fencing > symmetric-epistemic-treatment | selective-proof-obligation > uniform-proof-obligation ⚠ | 0.50 | RU |
| `J1035` | machine-addressability > proof-binding | selective-proof-obligation > uniform-proof-obligation ⚠ | 0.50 | A |

## onboarding-friction — 18 judgments

**`low-friction-entry`  ⇄  `conformance-at-entry`**

whether the first move is made as cheap as possible, or the newcomer's first artifact must already conform to the corpus's rules

<details><summary>absorbs 11 raw dimension names</summary>

`authoring-cost-vs-addressability` · `capture-form` · `capture-friction-vs-addressability` · `entry-barrier` · `entry-point-format` · `first-contact-success-criterion` · `onboarding-density` · `onboarding-friction-vs-provenance-discipline` · `onboarding-surface-width` · `token-discipline` · `user-onboarding`

</details>

| Judgment | Extractor's original poles | Mapped to | Conf | Prov |
|---|---|---|---|---|
| `J0159` | utility-first > vocabulary-first | low-friction-entry > conformance-at-entry | 0.80 | A |
| `J0542` | question-entry > structure-entry | low-friction-entry > conformance-at-entry | 0.80 | A |
| `J0831` | low-friction-authoring > machine-addressability | low-friction-entry > conformance-at-entry | 0.80 | RU |
| `J1120` | unaddressable-first-capture > identity-at-creation | low-friction-entry > conformance-at-entry | 0.80 | RU |
| `J1165` | brevity-at-entry > depth-at-entry | low-friction-entry > conformance-at-entry | 0.80 | RU |
| `J0378` | compact-entry > complete-entry | low-friction-entry > conformance-at-entry | 0.75 | A |
| `J0482` | single-question-surface > onboarding-form | low-friction-entry > conformance-at-entry | 0.75 | A |
| `J0675` | progressive-disclosure > ontology-literacy-prerequisite | low-friction-entry > conformance-at-entry | 0.75 | A |
| `J0794` | single-entry-template > template-menu | low-friction-entry > conformance-at-entry | 0.70 | RU |
| `J1051` | concrete-use-case > deep-ontology | low-friction-entry > conformance-at-entry | 0.70 | A |
| `J0555` | madlibs-fill > formal-schema | low-friction-entry > conformance-at-entry | 0.65 | RU |
| `J1122` | frictionless-capture > consent-at-capture | low-friction-entry > conformance-at-entry | 0.65 | RU |
| `J0026` | lived-use-opening > ontology-first-opening | low-friction-entry > conformance-at-entry | 0.60 | A |
| `J0790` | standalone-observation > promotion-gated-record | low-friction-entry > conformance-at-entry ⚠ | 0.55 | BP |
| `J0950` | automatic-creation > explicit-creation-step | low-friction-entry > conformance-at-entry ⚠ | 0.55 | RU |
| `J0125` | yawn-native-entry > markdown-entry | conformance-at-entry > low-friction-entry ⚠ | 0.50 | RU |
| `J0266` | solo-process > multi-principal-process | low-friction-entry > conformance-at-entry ⚠ | 0.45 | RU |
| `J0856` | one-at-a-time-pacing > form-completion | low-friction-entry > conformance-at-entry ⚠ | 0.40 | RU |

## resolution-under-uncertainty — 17 judgments

**`hold-and-ask`  ⇄  `forced-resolution`**

when the record cannot be completed honestly: stop and surface a question, or fill the slot with an inference or guess

<details><summary>absorbs 9 raw dimension names</summary>

`default-interaction-posture` · `default-speech-act` · `elicitation-pacing` · `interaction-friction` · `question-order` · `question-ownership` · `question-sequence` · `question-set-completeness` · `who-gets-asked-questions`

</details>

| Judgment | Extractor's original poles | Mapped to | Conf | Prov |
|---|---|---|---|---|
| `J0291` | hold-and-ask > silent-guess | hold-and-ask > forced-resolution | 0.75 | A |
| `J0983` | visible-lacuna > fabricated-answer | hold-and-ask > forced-resolution | 0.75 | A |
| `J0075` | holding > forced-action | hold-and-ask > forced-resolution | 0.65 | A |
| `J0220` | observation > premature-action | hold-and-ask > forced-resolution | 0.65 | A |
| `J0760` | blank-holder > false-certainty | hold-and-ask > forced-resolution | 0.65 | A |
| `J0079` | representable-unknown > forced-resolution | hold-and-ask > forced-resolution | 0.60 | A |
| `J0307` | explicit-unknown > forced-guess | hold-and-ask > forced-resolution | 0.60 | A |
| `J0535` | inaction-as-move > action-only-movement | hold-and-ask > forced-resolution | 0.60 | RU |
| `J0974` | question-generator > oracle | hold-and-ask > forced-resolution | 0.60 | A |
| `J0105` | explicit-closure > timeout-as-failure | hold-and-ask > forced-resolution ⚠ | 0.55 | A |
| `J0763` | clearer-question > forced-answer | hold-and-ask > forced-resolution ⚠ | 0.55 | A |
| `J0251` | hold-bias > ask-bias | hold-and-ask > forced-resolution ⚠ | 0.45 | RU |
| `J0278` | show-and-wait > telling | hold-and-ask > forced-resolution ⚠ | 0.45 | A |
| `J0670` | inspectable-weighting > regulatory-absolutism | hold-and-ask > forced-resolution ⚠ | 0.45 | A |
| `J0975` | holdable-feeling > forced-action | hold-and-ask > forced-resolution ⚠ | 0.45 | A |
| `J0277` | questions-first > answers-first | hold-and-ask > forced-resolution ⚠ | 0.40 | A |
| `J0758` | invitation > coerced-belief | hold-and-ask > forced-resolution ⚠ | 0.40 | A |

## proof-timing — 16 judgments

**`prove-then-act`  ⇄  `act-then-prove`**

whether the evidence must exist before the change lands, or the change ships first and acquires its proof later

<details><summary>absorbs 19 raw dimension names</summary>

`acceptance-criteria` · `category-promotion` · `claim-promotion` · `deployment-readiness` · `experiment-design` · `failure-timing` · `how-an-objective-becomes-canonical` · `maturation-priority` · `maturity-promotion` · `promotion-authority` · `promotion-evidence` · `promotion-order` · `proof-timing` · `provenance-timing` · `speed-vs-external-validation` · `stabilisation-priority` · `stabilization-order` · `truth-promotion` · `when-proof-is-required-relative-to-merge`

</details>

| Judgment | Extractor's original poles | Mapped to | Conf | Prov |
|---|---|---|---|---|
| `J1032` | act-then-prove > prove-then-act | act-then-prove > prove-then-act | 0.90 | RU |
| `J1000` | shipped-gap > blocked-bridge | act-then-prove > prove-then-act | 0.80 | BP |
| `J0647` | accept-then-prove > prove-then-accept | act-then-prove > prove-then-act | 0.75 | BP |
| `J1150` | ship-draft-then-prove > proof-before-merge | act-then-prove > prove-then-act | 0.75 | RU |
| `J0636` | labeled-preprint-publication > review-gated-publication | act-then-prove > prove-then-act | 0.70 | BP |
| `J0683` | publish-with-disclosure > withhold-until-reviewed | act-then-prove > prove-then-act | 0.70 | A |
| `J0044` | ship-the-loop > settle-the-doctrine | act-then-prove > prove-then-act | 0.60 | RU |
| `J0860` | owner-confirmation-gate > proof-gate | act-then-prove > prove-then-act | 0.60 | RU |
| `J0894` | deliberate-restatement > automatic-promotion | prove-then-act > act-then-prove | 0.60 | A |
| `J1033` | proof-gated-memory > immediate-memory-write | prove-then-act > act-then-prove | 0.60 | A |
| `J0325` | cite-in-flight > cite-after-merge | act-then-prove > prove-then-act ⚠ | 0.55 | RU |
| `J0406` | intent-record > outcome-record | act-then-prove > prove-then-act ⚠ | 0.55 | RU |
| `J0752` | accumulated-pattern-evidence > single-signal-reaction | prove-then-act > act-then-prove ⚠ | 0.55 | A |
| `J0772` | proof-gated-update > move-triggered-update | prove-then-act > act-then-prove ⚠ | 0.50 | RU |
| `J0913` | mechanism-first-stabilization > definition-first-stabilization | prove-then-act > act-then-prove ⚠ | 0.50 | BP |
| `J1207` | construction-time-rejection > emit-then-validate | prove-then-act > act-then-prove ⚠ | 0.50 | BP |

## status-dimensionality — 16 judgments

**`multi-axis-status`  ⇄  `single-scalar-status`**

whether a record's standing is reported as several orthogonal axes, or collapsed into one value

<details><summary>absorbs 10 raw dimension names</summary>

`epistemic-separation` · `field-decomposition` · `packet-decomposition` · `provenance-separation` · `record-decomposition` · `record-separation` · `role-separation` · `status-truthfulness` · `terminology-granularity` · `type-decomposition`

</details>

| Judgment | Extractor's original poles | Mapped to | Conf | Prov |
|---|---|---|---|---|
| `J0452` | separated-axes > conflated-enum | multi-axis-status > single-scalar-status | 0.90 | A |
| `J0304` | orthogonal-statuses > single-status-enum | multi-axis-status > single-scalar-status | 0.85 | A |
| `J0327` | single-status-scalar > orthogonal-statuses | single-scalar-status > multi-axis-status | 0.85 | RU |
| `J0870` | orthogonal-status-axes > single-status | multi-axis-status > single-scalar-status | 0.85 | RU |
| `J0122` | decomposed-confidence > single-score | multi-axis-status > single-scalar-status | 0.75 | RU |
| `J0671` | agency-profile > binary-agency | multi-axis-status > single-scalar-status | 0.65 | A |
| `J0129` | free-text-status > typed-status | single-scalar-status > multi-axis-status | 0.60 | RU |
| `J0190` | use-status > confidence-status | multi-axis-status > single-scalar-status | 0.60 | RU |
| `J0519` | coverage-metric > coverage-as-truth | multi-axis-status > single-scalar-status | 0.60 | A |
| `J0263` | flat-label-list > dimensioned-status | single-scalar-status > multi-axis-status ⚠ | 0.55 | RU |
| `J0677` | set-intersection > scalar-score | multi-axis-status > single-scalar-status ⚠ | 0.55 | A |
| `J1130` | multi-axis-status > single-status-of-record | multi-axis-status > single-scalar-status ⚠ | 0.55 | RU |
| `J1180` | separate-nuance-field > composite-status-value | multi-axis-status > single-scalar-status ⚠ | 0.55 | A |
| `J0768` | authority-flavoured-epistemics > dimension-separated-status | single-scalar-status > multi-axis-status ⚠ | 0.50 | RU |
| `J1190` | source-plane-separation > merged-statement-plane | multi-axis-status > single-scalar-status ⚠ | 0.50 | A |
| `J1214` | separated-confidence-axes > aggregate-confidence-score | multi-axis-status > single-scalar-status ⚠ | 0.50 | A |

## list-order-semantics — 16 judgments

**`order-is-load-bearing`  ⇄  `order-is-display-only`**

whether the sequence of items in a list carries rank and is binding, or is presentation with no claim of priority

<details><summary>absorbs 10 raw dimension names</summary>

`implicit-preference-among-options` · `list-order` · `list-ordering` · `list-ordering-principle` · `meaning-of-an-ordered-list` · `ranking-order` · `ranking-priority` · `what-is-most-unrankable` · `whether-a-disclaimed-list-order-is-load-bearing` · `which-orderings-get-enforced`

</details>

| Judgment | Extractor's original poles | Mapped to | Conf | Prov |
|---|---|---|---|---|
| `J1002` | canonical-order-as-mechanism > order-as-mere-display | order-is-load-bearing > order-is-display-only | 0.85 | BP |
| `J0357` | non-ranking-labels > developmental-hierarchy | order-is-display-only > order-is-load-bearing | 0.70 | A |
| `J0395` | numeric-ranking > unranked-candidates | order-is-load-bearing > order-is-display-only | 0.70 | RU |
| `J0481` | creation-first > retrieval-first | order-is-load-bearing > order-is-display-only | 0.65 | RU |
| `J0476` | local-first-ordering > cloud-first-ordering | order-is-load-bearing > order-is-display-only | 0.60 | RU |
| `J0274` | attain-first-ordering > neutral-mode-ordering | order-is-load-bearing > order-is-display-only ⚠ | 0.55 | RU |
| `J0317` | alphabetical-order > prerequisite-order | order-is-display-only > order-is-load-bearing ⚠ | 0.55 | RU |
| `J0676` | free-navigation > fixed-sequence-wizard | order-is-display-only > order-is-load-bearing ⚠ | 0.55 | A |
| `J0199` | human-authority-first > machine-authority-first | order-is-load-bearing > order-is-display-only ⚠ | 0.50 | RU |
| `J0344` | friction-first-ordering > neutral-ordering | order-is-load-bearing > order-is-display-only ⚠ | 0.50 | RU |
| `J0333` | naming-gate-first > content-gate-first | order-is-load-bearing > order-is-display-only ⚠ | 0.45 | BP |
| `J0633` | proof-value-primacy > cost-primacy | order-is-load-bearing > order-is-display-only ⚠ | 0.45 | RU |
| `J0717` | salience-ordering > stable-ordering | order-is-load-bearing > order-is-display-only ⚠ | 0.45 | RU |
| `J0820` | role-first > definition-first | order-is-load-bearing > order-is-display-only ⚠ | 0.45 | A |
| `J0844` | proof-value-first > cost-first | order-is-load-bearing > order-is-display-only ⚠ | 0.45 | RU |
| `J1021` | semantic-invariants > safety-gates | order-is-load-bearing > order-is-display-only ⚠ | 0.45 | RU |

## orientation-versus-action-order — 16 judgments

**`orient-first`  ⇄  `act-first`**

whether a turn must establish observation, boundary and orientation before moving, or the move leads and orientation follows

<details><summary>absorbs 19 raw dimension names</summary>

`agent-disclosure-order` · `agent-read-order` · `disclosure-order` · `document-legibility-order` · `feedback-channel-sequencing` · `first-screen-order` · `interaction-order` · `loop-entry-point` · `loop-sequencing` · `loop-stage-order` · `onboarding-order` · `order-of-unattended-loops` · `orientation-composition` · `orientation-order` · `reader-route-order` · `root-file-reading-order` · `teaching-move-order` · `what-orients-first` · `what-vs-how-precedence`

</details>

| Judgment | Extractor's original poles | Mapped to | Conf | Prov |
|---|---|---|---|---|
| `J0450` | observation-first > action-first | orient-first > act-first | 0.75 | RU |
| `J0502` | boundary-first > move-first | orient-first > act-first | 0.75 | A |
| `J0032` | audit-first-ordering > author-first-ordering | orient-first > act-first | 0.70 | RU |
| `J0509` | observation-first-ordering > interpretation-first-ordering | orient-first > act-first | 0.65 | RU |
| `J0876` | hold-and-mirror > act-and-plan | orient-first > act-first | 0.60 | RU |
| `J1053` | normalize-first > interpret-then-normalize | orient-first > act-first | 0.60 | A |
| `J1058` | ask-first > tell-first | orient-first > act-first | 0.60 | A |
| `J0072` | orientation-shape > productivity-object | orient-first > act-first ⚠ | 0.55 | A |
| `J0997` | audit-first > propose-first | orient-first > act-first ⚠ | 0.55 | RU |
| `J0793` | policy-first-entry > definition-first-entry | orient-first > act-first ⚠ | 0.50 | RU |
| `J0261` | gated-progression > direct-action | orient-first > act-first ⚠ | 0.45 | RU |
| `J0832` | boundary-before-move > declared-loop-order | orient-first > act-first ⚠ | 0.45 | RU |
| `J0949` | why-first > example-first | orient-first > act-first ⚠ | 0.45 | RU |
| `J1054` | questions-first-route > start-first-route | orient-first > act-first ⚠ | 0.45 | RU |
| `J1060` | orientation-first > policy-first | orient-first > act-first ⚠ | 0.45 | RU |
| `J0283` | noticing > installing | orient-first > act-first ⚠ | 0.40 | A |

## evidence-locus — 15 judgments

**`internal-self-sourcing`  ⇄  `external-verification`**

whether the warrant for a claim comes from inside the repository's own graph, or from something outside it

<details><summary>absorbs 9 raw dimension names</summary>

`division-of-evaluative-labor` · `evidence-authority` · `scope-of-evidence` · `source-authority` · `source-conflict` · `source-of-truth` · `source-of-truth-for-inventory` · `source-of-truth-location` · `truth-location`

</details>

| Judgment | Extractor's original poles | Mapped to | Conf | Prov |
|---|---|---|---|---|
| `J0995` | self-sourcing > external-verification | internal-self-sourcing > external-verification | 0.85 | BP |
| `J0062` | intra-graph-sourcing > external-evidence | internal-self-sourcing > external-verification | 0.80 | RU |
| `J0107` | internal-citation > external-evidence | internal-self-sourcing > external-verification | 0.80 | RU |
| `J0650` | internal-cross-reference > external-verification | internal-self-sourcing > external-verification | 0.80 | RU |
| `J0872` | internal-citation > external-verification | internal-self-sourcing > external-verification | 0.75 | RU |
| `J1153` | self-sourcing-proof-standard > external-verification-standard | internal-self-sourcing > external-verification | 0.75 | RU |
| `J0273` | self-sourcing > external-grounding | internal-self-sourcing > external-verification | 0.70 | RU |
| `J0707` | deployment-grade-proof > citation-grade-proof | external-verification > internal-self-sourcing | 0.60 | BP |
| `J0463` | local-proof-boundary > live-provider-integration | internal-self-sourcing > external-verification ⚠ | 0.55 | RU |
| `J0719` | operational-provenance > bibliographic-index | internal-self-sourcing > external-verification ⚠ | 0.55 | RU |
| `J0012` | named-signal-review > detector-score | internal-self-sourcing > external-verification ⚠ | 0.50 | A |
| `J0264` | personally-obtainable-proof > institutional-proof | internal-self-sourcing > external-verification ⚠ | 0.50 | RU |
| `J0723` | internal-ablation > external-baseline-only | internal-self-sourcing > external-verification ⚠ | 0.50 | RU |
| `J0940` | local-proof-primary > ci-proof-primary | internal-self-sourcing > external-verification ⚠ | 0.50 | A |
| `J1086` | remains-open-origin > free-field-origin | internal-self-sourcing > external-verification ⚠ | 0.50 | BP |

## provenance-retention — 15 judgments

**`raw-source-preserved`  ⇄  `normalised-only`**

whether the original wording, shape and cost of an input survive into the record, or only a cleaned, normalised form does

<details><summary>absorbs 10 raw dimension names</summary>

`evidence-provenance` · `operational-traceability` · `provenance-honesty` · `provenance-integrity` · `provenance-origin` · `provenance-reach` · `provenance-retention` · `record-provenance` · `synthesis-method` · `transformation-provenance`

</details>

| Judgment | Extractor's original poles | Mapped to | Conf | Prov |
|---|---|---|---|---|
| `J0738` | raw-transcript-preservation > normalized-only-record | raw-source-preserved > normalised-only | 0.90 | A |
| `J0431` | source-preservation > generated-backfill | raw-source-preserved > normalised-only | 0.85 | A |
| `J0511` | verbatim-quote > summary-only | raw-source-preserved > normalised-only | 0.85 | RU |
| `J1234` | recorded-correction > silent-rewrite | raw-source-preserved > normalised-only | 0.85 | BP |
| `J1240` | verbatim-attributed-source > unsubstantiated-attribution | raw-source-preserved > normalised-only | 0.85 | A |
| `J0346` | raw-preserved-first > derived-only | raw-source-preserved > normalised-only | 0.75 | RU |
| `J0643` | verbatim-utterance > agent-paraphrase | raw-source-preserved > normalised-only | 0.75 | BP |
| `J0917` | preserve-import-shape > normalize-to-house-style | raw-source-preserved > normalised-only | 0.75 | BP |
| `J0869` | verbatim-transformation > paraphrase | raw-source-preserved > normalised-only | 0.70 | RU |
| `J0156` | preserved-standpoints > averaged-consensus | raw-source-preserved > normalised-only ⚠ | 0.55 | A |
| `J0664` | difference-preservation > vocabulary-blending | raw-source-preserved > normalised-only ⚠ | 0.55 | A |
| `J0815` | contradiction-preservation > summarization | raw-source-preserved > normalised-only ⚠ | 0.55 | A |
| `J0200` | reason-preserving-log > diff-log | raw-source-preserved > normalised-only ⚠ | 0.50 | BP |
| `J0761` | access-logging > silent-use | raw-source-preserved > normalised-only ⚠ | 0.50 | A |
| `J0840` | version-pinning > template-pinning | normalised-only > raw-source-preserved ⚠ | 0.45 | RU |

## index-derivation — 15 judgments

**`generated-index`  ⇄  `hand-curated-index`**

whether an index, registry or list is computed from the tree it describes, or maintained by hand and allowed to drift

<details><summary>absorbs 9 raw dimension names</summary>

`index-authority` · `index-maintenance` · `index-purpose` · `list-maintenance` · `lock-maintenance` · `maintenance-allocation` · `maintenance-attention` · `what-the-hub-points-at` · `where-upkeep-goes`

</details>

| Judgment | Extractor's original poles | Mapped to | Conf | Prov |
|---|---|---|---|---|
| `J0771` | hand-curated-index > generated-index | hand-curated-index > generated-index | 0.90 | RU |
| `J0656` | hand-curated-index > generated-index | hand-curated-index > generated-index | 0.85 | BP |
| `J0871` | ship-first > index-first | hand-curated-index > generated-index | 0.75 | RU |
| `J1168` | central-hand-maintained-index > discovery-by-walking | hand-curated-index > generated-index | 0.75 | RU |
| `J0427` | unregistered-surface > node-registered-surface | hand-curated-index > generated-index | 0.70 | RU |
| `J0332` | filesystem-registry > node-index-registry | hand-curated-index > generated-index | 0.65 | BP |
| `J1077` | selective-root-index > complete-root-index | hand-curated-index > generated-index | 0.60 | RU |
| `J1078` | unindexed-schema > indexed-schema | hand-curated-index > generated-index | 0.60 | BP |
| `J0134` | new-layer-links > seed-layer-links | hand-curated-index > generated-index ⚠ | 0.55 | RU |
| `J0714` | frozen-lock > living-lock | hand-curated-index > generated-index ⚠ | 0.55 | BP |
| `J0262` | append-without-renormalizing > naming-consistency | hand-curated-index > generated-index ⚠ | 0.50 | RU |
| `J0454` | split-registry > flat-registry | hand-curated-index > generated-index ⚠ | 0.50 | RU |
| `J0423` | crossed-provenance > matched-provenance | hand-curated-index > generated-index ⚠ | 0.45 | RU |
| `J1147` | practice-leads-declared-shape > shape-leads-practice | hand-curated-index > generated-index ⚠ | 0.45 | RU |
| `J0133` | undeclared-header-fields > declared-shape-completeness | hand-curated-index > generated-index ⚠ | 0.40 | RU |

## authority-origin — 14 judgments

**`explicit-grant`  ⇄  `inherited-authority`**

whether an actor's authority must be granted to it explicitly, or is picked up by inheritance from a parent, delegator or context

<details><summary>absorbs 12 raw dimension names</summary>

`authority-escalation` · `authority-widening` · `authorization-declaration` · `authorization-matching` · `borrowing-conditions` · `claim-inheritance` · `direction-of-authority-between-repos` · `inheritance-default` · `inheritance-direction` · `inheritance-scope` · `permission-derivation` · `source-of-directive`

</details>

| Judgment | Extractor's original poles | Mapped to | Conf | Prov |
|---|---|---|---|---|
| `J0104` | narrowing-delegation > inherited-authority | explicit-grant > inherited-authority | 0.90 | A |
| `J0736` | explicit-grant > parent-child-inheritance | explicit-grant > inherited-authority | 0.90 | A |
| `J0222` | narrowing-inheritance > widening-inheritance | explicit-grant > inherited-authority | 0.85 | A |
| `J0259` | non-inheritance-default > inheritance-default | explicit-grant > inherited-authority | 0.80 | RU |
| `J0884` | explicit-per-handoff-grant > inherited-permission | explicit-grant > inherited-authority | 0.80 | RU |
| `J0964` | re-earned-grant > inherited-authority | explicit-grant > inherited-authority | 0.80 | A |
| `J1102` | mandatory-full-exclusion > selective-exclusion | explicit-grant > inherited-authority | 0.80 | BP |
| `J1219` | enumerated-non-inheritance > full-context-inheritance | explicit-grant > inherited-authority | 0.80 | BP |
| `J0303` | grantor-activation > earned-escalation | explicit-grant > inherited-authority | 0.75 | A |
| `J0375` | selective-inheritance > wholesale-inheritance | explicit-grant > inherited-authority | 0.70 | A |
| `J0289` | manual-restatement > automatic-promotion | explicit-grant > inherited-authority | 0.60 | A |
| `J1249` | exact-effect-signature > fuzzy-authorization | explicit-grant > inherited-authority | 0.60 | BP |
| `J0978` | declared-grant > hidden-agent-authority | explicit-grant > inherited-authority ⚠ | 0.50 | A |
| `J0955` | explicit-command > coincidence-as-command | explicit-grant > inherited-authority ⚠ | 0.45 | A |

## what-counts-as-proof — 14 judgments

**`executable-proof`  ⇄  `prose-proof`**

whether a claim is backed by something a machine can run, or by a cited sentence a reader must accept

<details><summary>absorbs 28 raw dimension names</summary>

`citation-weight` · `evidence-strength` · `evidence-threshold` · `evidence-threshold-for-action` · `evidence-under-tooling-constraint` · `explanatory-standard` · `falsification-bar` · `grounding-technique` · `how-experimentation-is-carried` · `how-proof-is-discharged` · `machine-checkability` · `node-verification-strength` · `proof-definition` · `proof-framing` · `proof-locus` · `proof-standard` · `proof-status-criteria` · `proof-strength` · `proof-vs-integration` · `source-citation` · `structural-matching-evidence` · `verification-concreteness` · `verification-method` · `what-counts-as-backing` · `what-counts-as-evidence` · `what-counts-as-proof` · `what-upgrades-a-claim` · `what-upgrades-an-empirical-claim`

</details>

| Judgment | Extractor's original poles | Mapped to | Conf | Prov |
|---|---|---|---|---|
| `J0055` | executable-validation > prose-validation | executable-proof > prose-proof | 0.80 | RU |
| `J0316` | executable-self-scan > seed-source-list | executable-proof > prose-proof | 0.75 | BP |
| `J0440` | falsifiable-proof > citation-proof | executable-proof > prose-proof | 0.75 | RU |
| `J0453` | citation-proof > acceptance-criteria | prose-proof > executable-proof | 0.75 | RU |
| `J1227` | executable-proof > prose-proof | executable-proof > prose-proof | 0.75 | BP |
| `J0382` | executable-proof > prose-proof | executable-proof > prose-proof | 0.65 | RU |
| `J0525` | machine-bound-packet > prose-only-packet | executable-proof > prose-proof | 0.60 | RU |
| `J1144` | proof-as-ledger > proof-as-test-suite | prose-proof > executable-proof | 0.60 | BP |
| `J1228` | executable-template > prose-template | executable-proof > prose-proof | 0.60 | BP |
| `J0701` | specification-completeness > implementation-completeness | prose-proof > executable-proof ⚠ | 0.55 | BP |
| `J0879` | coordinate-addressing > quote-copying | executable-proof > prose-proof ⚠ | 0.55 | RU |
| `J1193` | recomputed-replay > trusted-receipt | executable-proof > prose-proof ⚠ | 0.55 | BP |
| `J0279` | behavioral-evidence > verbal-report | executable-proof > prose-proof ⚠ | 0.45 | A |
| `J0126` | material-record > interpretation-only | executable-proof > prose-proof ⚠ | 0.40 | RU |

## how-success-is-judged — 14 judgments

**`self-certified-success`  ⇄  `independently-evaluated-success`**

whether the actor that made the move declares it succeeded, or a separate step or party evaluates the outcome

<details><summary>absorbs 27 raw dimension names</summary>

`acceptance-evidence` · `closure-standard` · `completion-requirement` · `done-criteria` · `evaluation-status` · `how-episodes-end` · `how-success-is-reported` · `loop-closure` · `measurement-authority` · `outcome-recording` · `record-closing-convention` · `self-evidencing` · `success-evidence` · `what-a-green-check-buys` · `what-a-green-test-buys` · `what-closes-a-question` · `what-closes-a-record` · `what-counts-as-done` · `what-counts-as-outcome` · `what-keeps-work-open` · `what-proof-settles` · `what-the-bot-optimizes` · `what-the-system-returns` · `who-closes-a-question` · `who-closes-a-turn` · `who-evaluates-a-move` · `who-judges-outcome`

</details>

| Judgment | Extractor's original poles | Mapped to | Conf | Prov |
|---|---|---|---|---|
| `J0081` | external-proof > self-certification | independently-evaluated-success > self-certified-success | 0.95 | A |
| `J0209` | external-proof > self-certification | independently-evaluated-success > self-certified-success | 0.95 | A |
| `J0529` | external-verification > self-certification | independently-evaluated-success > self-certified-success | 0.95 | A |
| `J0965` | external-verification > self-certification | independently-evaluated-success > self-certified-success | 0.95 | A |
| `J0145` | evaluated-proof > self-certifying-move | independently-evaluated-success > self-certified-success | 0.90 | A |
| `J0734` | independent-proof > self-verification | independently-evaluated-success > self-certified-success | 0.90 | A |
| `J0410` | separated-verification > self-verification | independently-evaluated-success > self-certified-success | 0.85 | RU |
| `J0811` | event-evidence > move-as-proof | independently-evaluated-success > self-certified-success | 0.85 | A |
| `J0601` | observed-outcome > inferred-success | independently-evaluated-success > self-certified-success | 0.80 | A |
| `J1222` | observed-consequence > inferred-success | independently-evaluated-success > self-certified-success | 0.80 | A |
| `J0842` | restore-verification > copy-existence | independently-evaluated-success > self-certified-success | 0.65 | RU |
| `J0546` | evidence-backed-resolution > prose-resolution | independently-evaluated-success > self-certified-success ⚠ | 0.50 | BP |
| `J0576` | falsification-counts > confirmation-only | independently-evaluated-success > self-certified-success ⚠ | 0.50 | RU |
| `J0845` | intent-only-record > outcome-closed-record | self-certified-success > independently-evaluated-success ⚠ | 0.45 | RU |

## absence-representation — 14 judgments

**`explicit-typed-absence`  ⇄  `silent-blank`**

how a missing value is shown: a named marker saying what is absent and why, or an empty string, null or omitted key

<details><summary>absorbs 13 raw dimension names</summary>

`absence-handling` · `emptiness-semantics` · `handling-of-missing-answers` · `handling-of-missing-input` · `handling-of-the-unknown` · `how-unfilled-fields-are-shown` · `inference-from-null-data` · `null-semantics` · `representation-of-gaps-in-state` · `representing-absence` · `uncertainty-handling` · `unknowns-handling` · `which-states-get-fields`

</details>

| Judgment | Extractor's original poles | Mapped to | Conf | Prov |
|---|---|---|---|---|
| `J0494` | explicit-absence > null-collapse | explicit-typed-absence > silent-blank | 0.85 | A |
| `J0740` | visible-lacuna > invented-content | explicit-typed-absence > silent-blank | 0.85 | A |
| `J0853` | enumerated-gaps > omitted-unknowns | explicit-typed-absence > silent-blank | 0.85 | RU |
| `J1134` | required-ignorance-declaration > silent-omission | explicit-typed-absence > silent-blank | 0.85 | RU |
| `J1204` | explicit-reset > absence-as-reset | explicit-typed-absence > silent-blank | 0.85 | BP |
| `J0822` | explicit-non-answer > blank-as-answer | explicit-typed-absence > silent-blank | 0.80 | A |
| `J0881` | null-for-absence > empty-string-for-absence | explicit-typed-absence > silent-blank | 0.80 | RU |
| `J0054` | recorded-nonaction > silent-nonaction | explicit-typed-absence > silent-blank | 0.70 | RU |
| `J1115` | null-pinned-placeholder > field-removal | explicit-typed-absence > silent-blank | 0.65 | BP |
| `J0116` | unknown-as-zero > unknown-as-blocker | silent-blank > explicit-typed-absence | 0.60 | RU |
| `J0583` | hold-as-outcome > selection-only-outcome | explicit-typed-absence > silent-blank | 0.60 | RU |
| `J0595` | absence-is-not-evidence > inference-from-silence | explicit-typed-absence > silent-blank | 0.60 | A |
| `J0124` | instrumented-waiting > instrumented-blocking | explicit-typed-absence > silent-blank ⚠ | 0.55 | RU |
| `J1210` | typed-hold-reasons > undifferentiated-silence | explicit-typed-absence > silent-blank ⚠ | 0.55 | BP |

## migration-completeness — 14 judgments

**`complete-migration`  ⇄  `partial-migration`**

whether a rename or vocabulary change is carried through every affected artifact, or only where it was convenient

<details><summary>absorbs 7 raw dimension names</summary>

`metadata-migration` · `migration-cost-vs-vocabulary-coherence` · `migration-coverage` · `migration-follow-through` · `migration-method` · `migration-policy` · `migration-strategy`

</details>

| Judgment | Extractor's original poles | Mapped to | Conf | Prov |
|---|---|---|---|---|
| `J0388` | forward-only-versioning > retroactive-backfill | partial-migration > complete-migration | 0.85 | RU |
| `J0451` | unmigrated-handle > migration-sourced-handle | partial-migration > complete-migration | 0.85 | RU |
| `J0729` | legacy-link-retention > post-migration-repointing | partial-migration > complete-migration | 0.80 | RU |
| `J0593` | opportunistic-migration > bulk-sweep | partial-migration > complete-migration | 0.75 | A |
| `J1123` | onboarding-continuity > canonical-vocabulary | partial-migration > complete-migration | 0.70 | RU |
| `J0071` | opportunistic-remediation > exhaustive-remediation | partial-migration > complete-migration | 0.60 | RU |
| `J0626` | upstream-teaching-fix > downstream-record-fix | partial-migration > complete-migration | 0.60 | BP |
| `J0288` | semantic-absorption > mechanical-rename | complete-migration > partial-migration ⚠ | 0.50 | A |
| `J0347` | index-maintenance > contract-maintenance | partial-migration > complete-migration ⚠ | 0.50 | RU |
| `J0745` | explicit-mapping > implicit-mapping | complete-migration > partial-migration ⚠ | 0.50 | A |
| `J0780` | lexical-migration > semantic-migration | partial-migration > complete-migration ⚠ | 0.50 | BP |
| `J1129` | manifest-as-living-list > synchronized-invariants | partial-migration > complete-migration ⚠ | 0.50 | RU |
| `J0992` | four-flag-interlock > publication-interlock | partial-migration > complete-migration ⚠ | 0.45 | RU |
| `J0993` | abridged-rail > canonical-rail | partial-migration > complete-migration ⚠ | 0.45 | RU |

## formalisation-spend — 14 judgments

**`heavy-specification`  ⇄  `minimum-sufficient-commitment`**

whether a concept is given a full formal apparatus before use, or the smallest commitment that lets work proceed

<details><summary>absorbs 14 raw dimension names</summary>

`formalization-spend` · `governance-spend` · `infrastructure-spend` · `maintenance-investment` · `navigational-investment` · `observability-investment` · `onboarding-formalism` · `proof-investment` · `provenance-spend` · `specification-depth` · `specification-mode` · `specification-spend` · `where-specification-effort-goes` · `where-structure-is-spent`

</details>

| Judgment | Extractor's original poles | Mapped to | Conf | Prov |
|---|---|---|---|---|
| `J0579` | object-protocol > prose-protocol | heavy-specification > minimum-sufficient-commitment | 0.85 | RU |
| `J0445` | specification-depth > shipping-proportionality | heavy-specification > minimum-sufficient-commitment | 0.70 | RU |
| `J0473` | lightly-governed > invariant-governed | minimum-sufficient-commitment > heavy-specification | 0.65 | RU |
| `J0487` | exhaustive-provenance > minimal-capture | heavy-specification > minimum-sufficient-commitment | 0.65 | RU |
| `J1158` | form-before-content > content-before-form | heavy-specification > minimum-sufficient-commitment | 0.65 | RU |
| `J0702` | field-vocabulary > worked-instance | heavy-specification > minimum-sufficient-commitment | 0.60 | RU |
| `J0874` | message-as-oriented-turn > message-as-text | heavy-specification > minimum-sufficient-commitment | 0.60 | RU |
| `J0944` | template-before-instance > instance-before-template | heavy-specification > minimum-sufficient-commitment | 0.60 | RU |
| `J1159` | apparatus-ahead-of-instances > proportional-spend | heavy-specification > minimum-sufficient-commitment | 0.60 | RU |
| `J0161` | time-as-primitive > time-as-timestamp | heavy-specification > minimum-sufficient-commitment ⚠ | 0.55 | A |
| `J0999` | contract-first > outcome-first | heavy-specification > minimum-sufficient-commitment ⚠ | 0.55 | BP |
| `J0258` | attribution-metadata > relation-semantics | heavy-specification > minimum-sufficient-commitment ⚠ | 0.50 | RU |
| `J1043` | minimal-tie-break > full-tie-break-ladder | minimum-sufficient-commitment > heavy-specification ⚠ | 0.50 | RU |
| `J0117` | unweighted-sum > calibrated-weights | minimum-sufficient-commitment > heavy-specification ⚠ | 0.45 | RU |

## disclosure-default — 13 judgments

**`private-by-default`  ⇄  `public-by-default`**

what happens to material nobody has classified: it stays in, or it goes out

<details><summary>absorbs 20 raw dimension names</summary>

`accessibility-policy` · `bot-output-destination` · `default-data-egress` · `default-disclosure` · `default-disclosure-posture` · `deployment-exposure` · `external-communication` · `how-privacy-is-represented` · `licensing-openness` · `personal-data-handling` · `privacy-in-tree` · `privacy-vs-observability` · `public-private-boundary` · `publication-authority-per-folder` · `publication-control` · `publication-surface` · `repository-contents` · `stated-privacy-vs-practiced-privacy` · `visibility-default` · `what-to-publish-about-private-work`

</details>

| Judgment | Extractor's original poles | Mapped to | Conf | Prov |
|---|---|---|---|---|
| `J0505` | private-by-default > public-by-default | private-by-default > public-by-default | 0.95 | RU |
| `J0398` | deny-by-default > allow-by-default | private-by-default > public-by-default | 0.90 | RU |
| `J1126` | private-by-default > shared-by-default | private-by-default > public-by-default | 0.90 | RU |
| `J0006` | private-staging-write > public-repo-write | private-by-default > public-by-default | 0.85 | A |
| `J0877` | private-unconsented-default > shared-by-default | private-by-default > public-by-default | 0.85 | RU |
| `J0753` | private-staging > public-default-publication | private-by-default > public-by-default | 0.80 | A |
| `J0399` | self-description-sharable > person-record-sharable | private-by-default > public-by-default | 0.75 | RU |
| `J1169` | owner-gated-publication > open-publication | private-by-default > public-by-default | 0.75 | A |
| `J0430` | loopback-only > production-availability | private-by-default > public-by-default | 0.70 | A |
| `J0564` | owner-approval-gate > open-preview-publication | private-by-default > public-by-default | 0.70 | RU |
| `J1098` | consent-backed-disclosure > declared-visibility | private-by-default > public-by-default | 0.70 | BP |
| `J0302` | synthetic-fixture > real-user-text | private-by-default > public-by-default | 0.60 | A |
| `J0309` | minimal-retention > full-capture | private-by-default > public-by-default ⚠ | 0.45 | A |

## failure-posture — 13 judgments

**`fail-closed`  ⇄  `warn-and-proceed`**

what a check does when it cannot decide: it blocks and stops the work, or it records a warning and lets the work continue

<details><summary>absorbs 11 raw dimension names</summary>

`conflict-resolution` · `delivery-semantics` · `error-handling` · `failure-handling` · `failure-posture` · `failure-provenance` · `handling-conflict` · `next-move-under-uncertainty` · `tradeoff-handling` · `what-gets-fail-closed` · `which-unknowns-halt-work`

</details>

| Judgment | Extractor's original poles | Mapped to | Conf | Prov |
|---|---|---|---|---|
| `J0941` | fail-closed > warn-and-proceed | fail-closed > warn-and-proceed | 0.95 | A |
| `J0016` | fail-visibly > improvised-delivery | fail-closed > warn-and-proceed | 0.85 | A |
| `J0228` | fail-closed > machine-clearance | fail-closed > warn-and-proceed | 0.80 | A |
| `J1096` | unknown-is-failure > best-effort-ranking | fail-closed > warn-and-proceed | 0.80 | BP |
| `J1205` | fail-on-ambiguity > last-write-wins | fail-closed > warn-and-proceed | 0.75 | BP |
| `J0751` | blocker-report > partial-mutation | fail-closed > warn-and-proceed | 0.70 | A |
| `J0603` | one-shot-grant > retry-loop | fail-closed > warn-and-proceed | 0.65 | A |
| `J0648` | at-most-once-delivery > at-least-once-delivery | fail-closed > warn-and-proceed | 0.60 | RU |
| `J0739` | normalize-before-create > create-then-correct | fail-closed > warn-and-proceed | 0.60 | A |
| `J0544` | semantic-risk-blocking > cosmetic-risk-blocking | fail-closed > warn-and-proceed ⚠ | 0.55 | RU |
| `J0543` | decision-relevant-blocking > blanket-blocking | warn-and-proceed > fail-closed ⚠ | 0.50 | A |
| `J0575` | conservative-matching > recall-first-matching | fail-closed > warn-and-proceed ⚠ | 0.40 | RU |
| `J0185` | recurrence-threshold > single-counterexample | warn-and-proceed > fail-closed ⚠ | 0.35 | RU |

## legacy-handling — 13 judgments

**`retain-alias`  ⇄  `hard-break`**

whether the old name, route or address keeps working alongside the new one, or is broken so only the new one remains

<details><summary>absorbs 7 raw dimension names</summary>

`compatibility-surface` · `compatibility-vs-cleanliness` · `deprecation-handling` · `deprecation-indexing` · `identity-migration` · `legacy-handling` · `url-continuity`

</details>

| Judgment | Extractor's original poles | Mapped to | Conf | Prov |
|---|---|---|---|---|
| `J0756` | route-preservation > broken-link | retain-alias > hard-break | 0.90 | A |
| `J0298` | boundary-compatibility > hard-break | retain-alias > hard-break | 0.85 | A |
| `J0379` | legacy-as-fixture > clean-break | retain-alias > hard-break | 0.85 | A |
| `J0755` | retain-as-alias > delete-superseded-file | retain-alias > hard-break | 0.85 | A |
| `J0825` | alias-legacy > delete-legacy | retain-alias > hard-break | 0.85 | A |
| `J0919` | keep-alias > delete-superseded-file | retain-alias > hard-break | 0.85 | A |
| `J0920` | preserve-old-route > break-old-route | retain-alias > hard-break | 0.85 | A |
| `J0470` | new-product-identity > legacy-identity | hard-break > retain-alias | 0.70 | A |
| `J0799` | legacy-addressability > index-pruning | retain-alias > hard-break | 0.70 | BP |
| `J0896` | history-as-provenance > second-active-schema-layer | hard-break > retain-alias | 0.65 | A |
| `J0293` | one-way-retirement > restorable-alias | hard-break > retain-alias | 0.60 | A |
| `J0605` | address-stability > name-matching-rename | retain-alias > hard-break | 0.60 | A |
| `J0921` | address-stability > name-accuracy | retain-alias > hard-break | 0.60 | BP |

## representation-versus-reality — 13 judgments

**`model-as-map`  ⇄  `model-as-territory`**

whether a record is treated as a fallible map of something outside it, or as constituting the thing it describes

<details><summary>absorbs 7 raw dimension names</summary>

`metaphysical-commitment` · `multi-observer-handling` · `observer-model` · `observer-vs-body` · `protocol-ontological-claim` · `realism-commitment` · `representation-vs-reality`

</details>

| Judgment | Extractor's original poles | Mapped to | Conf | Prov |
|---|---|---|---|---|
| `J0094` | model-as-map > model-as-territory | model-as-map > model-as-territory | 0.95 | A |
| `J0270` | referenced-reality > serialized-reality | model-as-map > model-as-territory | 0.85 | A |
| `J0732` | orientation-inspectability > reality-modeling | model-as-map > model-as-territory | 0.85 | A |
| `J0498` | shaping-map > truth-proof | model-as-map > model-as-territory | 0.80 | A |
| `J0969` | orientation-frame > simulation-claim | model-as-map > model-as-territory | 0.80 | A |
| `J0164` | reality-resistance > observer-constructivism | model-as-map > model-as-territory | 0.75 | A |
| `J0152` | attributed-weight > objective-law | model-as-map > model-as-territory | 0.70 | A |
| `J0076` | embodied-stability > pattern-identification | model-as-map > model-as-territory | 0.60 | A |
| `J0687` | vocabulary-corpus > emotion-ground-truth | model-as-map > model-as-territory | 0.60 | A |
| `J0956` | attributed-record > remembered-fact | model-as-map > model-as-territory | 0.60 | A |
| `J0678` | situated-observation > view-from-nowhere | model-as-map > model-as-territory ⚠ | 0.55 | A |
| `J0153` | inspectability > prescription | model-as-map > model-as-territory ⚠ | 0.50 | A |
| `J0374` | relationship-substance > proxy-metric | model-as-map > model-as-territory ⚠ | 0.50 | A |

## consent-timing — 12 judgments

**`consent-before-effect`  ⇄  `act-then-audit`**

whether agreement is obtained before the effect lands, or the effect lands first and is reviewed or corrected afterwards

<details><summary>absorbs 12 raw dimension names</summary>

`agreement-formation` · `authorization-timing` · `bootstrapping-order` · `commit-threshold` · `consent-before-effect` · `consent-for-effects` · `consent-gating` · `entry-condition` · `human-entry-point-in-automation` · `human-entry-point-in-generation` · `order-of-approval-and-verification` · `publication-timing`

</details>

| Judgment | Extractor's original poles | Mapped to | Conf | Prov |
|---|---|---|---|---|
| `J0380` | two-party-consent > unilateral-relationship-move | consent-before-effect > act-then-audit | 0.90 | A |
| `J0425` | offered-update > silent-install | consent-before-effect > act-then-audit | 0.85 | A |
| `J1044` | stage-then-notify > ask-before-staging | act-then-audit > consent-before-effect | 0.70 | BP |
| `J0506` | blocked-by-default > permissive-default | consent-before-effect > act-then-audit | 0.65 | RU |
| `J0341` | insert-then-review > review-then-insert | act-then-audit > consent-before-effect | 0.60 | RU |
| `J0444` | review-in-pipeline > out-of-band-review | consent-before-effect > act-then-audit | 0.60 | RU |
| `J0620` | audit-before-act > act-then-audit | consent-before-effect > act-then-audit | 0.60 | RU |
| `J1048` | artifact-then-decision > decision-then-artifact | act-then-audit > consent-before-effect | 0.60 | RU |
| `J0998` | branch-default > direct-main-push | consent-before-effect > act-then-audit ⚠ | 0.55 | BP |
| `J0077` | normalize-before-write > normalize-after-write | consent-before-effect > act-then-audit ⚠ | 0.50 | A |
| `J1049` | brief-before-grant > grant-before-brief | consent-before-effect > act-then-audit ⚠ | 0.50 | RU |
| `J0486` | automatic-local-draft > manual-save | act-then-audit > consent-before-effect ⚠ | 0.45 | RU |

## vocabulary-closure — 12 judgments

**`closed-vocabulary`  ⇄  `open-vocabulary`**

whether a term set is fixed and enumerable, or may grow freely as records need new words

<details><summary>absorbs 11 raw dimension names</summary>

`affordance-vocabulary` · `change-vocabulary` · `correction-vocabulary` · `field-vocabulary` · `kind-vocabulary` · `move-vocabulary` · `outcome-vocabulary` · `selection-result-vocabulary` · `type-system-openness` · `vocabulary-agreement` · `vocabulary-closure`

</details>

| Judgment | Extractor's original poles | Mapped to | Conf | Prov |
|---|---|---|---|---|
| `J0907` | closed-enum > free-text-vocabulary | closed-vocabulary > open-vocabulary | 0.95 | A |
| `J1177` | closed-vocabulary > free-text-status | closed-vocabulary > open-vocabulary | 0.95 | A |
| `J0911` | open-status-vocabulary > closed-status-vocabulary | open-vocabulary > closed-vocabulary | 0.90 | RU |
| `J0630` | bespoke-kind > closed-kind-taxonomy | open-vocabulary > closed-vocabulary | 0.85 | RU |
| `J0271` | per-record-kind-coinage > closed-kind-taxonomy | open-vocabulary > closed-vocabulary | 0.80 | RU |
| `J0952` | ad-hoc-status-string > declared-lifecycle-value | open-vocabulary > closed-vocabulary | 0.80 | RU |
| `J1088` | nine-closed-axes > open-axis-set | closed-vocabulary > open-vocabulary | 0.80 | BP |
| `J0886` | enumerated-vocabulary > free-text | closed-vocabulary > open-vocabulary | 0.75 | RU |
| `J0421` | recorded-correction > silent-dismissal | closed-vocabulary > open-vocabulary | 0.60 | RU |
| `J0681` | vocabulary-resolution > umbrella-term | closed-vocabulary > open-vocabulary ⚠ | 0.45 | A |
| `J1192` | plural-target-modes > attain-only-teleology | closed-vocabulary > open-vocabulary ⚠ | 0.45 | BP |
| `J0936` | preservation-framing > removal-framing | open-vocabulary > closed-vocabulary ⚠ | 0.40 | BP |

## history-integrity — 12 judgments

**`immutable-history`  ⇄  `tidied-rewritten-history`**

whether the record of what happened is preserved even when embarrassing or superseded, or cleaned up to match the present

<details><summary>absorbs 13 raw dimension names</summary>

`change-documentation` · `change-recording` · `change-visibility` · `event-sequencing` · `history-handling` · `history-preservation-vs-canonical-tidiness` · `history-retention` · `log-integrity` · `record-temporality` · `revision-integrity` · `temporal-coverage` · `temporal-recording` · `which-changes-get-a-record`

</details>

| Judgment | Extractor's original poles | Mapped to | Conf | Prov |
|---|---|---|---|---|
| `J0746` | provenance-preservation > apparent-coherence | immutable-history > tidied-rewritten-history | 0.95 | A |
| `J0979` | honest-history > tidied-history | immutable-history > tidied-rewritten-history | 0.95 | A |
| `J0290` | immutable-source > rewritten-history | immutable-history > tidied-rewritten-history | 0.85 | A |
| `J0584` | additive-backfill > destructive-rewrite | immutable-history > tidied-rewritten-history | 0.85 | A |
| `J0947` | immutable-history > history-cleanup | immutable-history > tidied-rewritten-history | 0.80 | BP |
| `J1245` | append-only-chain > positional-event-list | immutable-history > tidied-rewritten-history | 0.75 | BP |
| `J0217` | history-preservation > legacy-deletion | immutable-history > tidied-rewritten-history | 0.70 | A |
| `J0809` | before-state-preservation > destructive-update | immutable-history > tidied-rewritten-history | 0.60 | A |
| `J0968` | preserved-cost > proof-absolution | immutable-history > tidied-rewritten-history ⚠ | 0.55 | A |
| `J1167` | immutable-migration-receipt > disposable-migration | immutable-history > tidied-rewritten-history ⚠ | 0.50 | BP |
| `J0169` | retrospective-continuity > discarded-branches | immutable-history > tidied-rewritten-history ⚠ | 0.45 | A |
| `J0295` | structured-receipt > changelog-prose | immutable-history > tidied-rewritten-history ⚠ | 0.45 | A |

## safety-versus-fit-precedence — 12 judgments

**`safety-gates-first`  ⇄  `interaction-fit-first`**

whether safety, privacy and permission checks outrank fit-to-the-person, or the interaction's fit is optimised first

<details><summary>absorbs 8 raw dimension names</summary>

`accessibility` · `form-of-the-safety-device` · `preference-vs-safety` · `ranking-vs-safety` · `risk-ranking-by-frequency` · `risk-weighting` · `view-vs-safety` · `which-risk-class-gets-work`

</details>

| Judgment | Extractor's original poles | Mapped to | Conf | Prov |
|---|---|---|---|---|
| `J0098` | safety-precedence > preference-precedence | safety-gates-first > interaction-fit-first | 0.90 | A |
| `J0023` | safety-gates-first > interaction-fit-first | safety-gates-first > interaction-fit-first | 0.85 | A |
| `J1005` | safety-gates > interaction-fit | safety-gates-first > interaction-fit-first | 0.85 | A |
| `J0227` | hard-gate-priority > question-fit | safety-gates-first > interaction-fit-first | 0.80 | A |
| `J0515` | unsuppressable-gate > presentation-freedom | safety-gates-first > interaction-fit-first | 0.80 | A |
| `J0091` | safety-override > score-maximization | safety-gates-first > interaction-fit-first | 0.70 | A |
| `J0235` | non-suppressible-safety-surface > preference-hiding | safety-gates-first > interaction-fit-first | 0.60 | A |
| `J0464` | text-equivalent > color-position-audio-alone | safety-gates-first > interaction-fit-first ⚠ | 0.55 | RU |
| `J1201` | unhideable-safety-surfaces > configurable-visibility | safety-gates-first > interaction-fit-first ⚠ | 0.55 | A |
| `J0252` | accessibility-as-fit > accessibility-as-gate | safety-gates-first > interaction-fit-first ⚠ | 0.50 | RU |
| `J0432` | accessible-text > image-only-rendering | safety-gates-first > interaction-fit-first ⚠ | 0.50 | A |
| `J1242` | live-text-rendering > pixel-rendered-text | safety-gates-first > interaction-fit-first ⚠ | 0.50 | A |

## output-determinism — 12 judgments

**`deterministic-replay`  ⇄  `adaptive-nondeterminism`**

whether the same inputs must yield the same output and be replayable, or the system may adapt and vary run to run

<details><summary>absorbs 7 raw dimension names</summary>

`asset-pinning` · `dependency-pinning` · `identity-determinism` · `prompt-variability` · `ranking-determinism` · `reproducibility` · `reproducibility-vs-adaptivity`

</details>

| Judgment | Extractor's original poles | Mapped to | Conf | Prov |
|---|---|---|---|---|
| `J0434` | determinism > retry-convenience | deterministic-replay > adaptive-nondeterminism | 0.95 | A |
| `J0597` | deterministic-replay > nondeterministic-ranking | deterministic-replay > adaptive-nondeterminism | 0.90 | A |
| `J1195` | canonical-determinism > serialization-order-significance | deterministic-replay > adaptive-nondeterminism | 0.85 | BP |
| `J0230` | pinned-prompt > adaptive-wording | deterministic-replay > adaptive-nondeterminism | 0.75 | A |
| `J0573` | deterministic-tie-break > arbitrary-order | deterministic-replay > adaptive-nondeterminism | 0.70 | A |
| `J1087` | content-hash-pin > version-string-pin | deterministic-replay > adaptive-nondeterminism | 0.70 | BP |
| `J1194` | byte-pinned-prompts > drifting-prompt-text | deterministic-replay > adaptive-nondeterminism | 0.70 | BP |
| `J0516` | exact-byte-registration > open-wording-execution | deterministic-replay > adaptive-nondeterminism | 0.65 | A |
| `J0866` | deterministic-single-candidate > candidate-exploration | deterministic-replay > adaptive-nondeterminism | 0.65 | RU |
| `J0203` | replay > memory | deterministic-replay > adaptive-nondeterminism ⚠ | 0.50 | A |
| `J0269` | fixed-question-universe > caller-narrowing | deterministic-replay > adaptive-nondeterminism ⚠ | 0.50 | BP |
| `J0140` | cursor-order > clock-order | deterministic-replay > adaptive-nondeterminism ⚠ | 0.40 | RU |

## authority-duration — 11 judgments

**`one-shot-authorisation`  ⇄  `standing-authorisation`**

whether permission is spent once at the moment it is used, or persists as a standing grant across future occasions

<details><summary>absorbs 10 raw dimension names</summary>

`authority-lifetime` · `authorization-recurrence` · `contract-binding` · `durability-of-consent` · `failure-handling-of-a-grant` · `identifier-lifecycle` · `recommendation-lifetime` · `record-lifetime` · `suspension-semantics` · `trust-accrual`

</details>

| Judgment | Extractor's original poles | Mapped to | Conf | Prov |
|---|---|---|---|---|
| `J0002` | per-proposal-approval > standing-authorization | one-shot-authorisation > standing-authorisation | 0.95 | A |
| `J0989` | one-candidate-grant > standing-spend | one-shot-authorisation > standing-authorisation | 0.95 | A |
| `J0602` | narrow-construction > broad-standing-grant | one-shot-authorisation > standing-authorisation | 0.90 | A |
| `J1176` | per-instance-approval > standing-approval | one-shot-authorisation > standing-authorisation | 0.90 | A |
| `J1059` | first-conforming-candidate > iterate-until-acceptable | one-shot-authorisation > standing-authorisation | 0.75 | A |
| `J1220` | bounded-one-time-grant > standing-authority | one-shot-authorisation > standing-authorisation | 0.75 | A |
| `J1184` | proposal-only-graduation > automatic-policy-activation | one-shot-authorisation > standing-authorisation | 0.65 | A |
| `J1218` | lifecycle-bound-authority > persistent-grants | one-shot-authorisation > standing-authorisation | 0.60 | BP |
| `J0040` | receipt-bound-authorization > boolean-approval | one-shot-authorisation > standing-authorisation ⚠ | 0.55 | BP |
| `J1082` | single-candidate > candidate-set | one-shot-authorisation > standing-authorisation ⚠ | 0.55 | BP |
| `J0635` | perishable-suggestion > standing-suggestion | one-shot-authorisation > standing-authorisation ⚠ | 0.40 | RU |

## verdict-arity — 11 judgments

**`binary-verdict`  ⇄  `graded-verdict`**

whether a gate, consent or classification resolves to yes/no, or carries intermediate and qualified values

<details><summary>absorbs 14 raw dimension names</summary>

`ambiguity-handling` · `answer-binding-style` · `cardinality` · `choice-breadth` · `choice-cardinality` · `classification-confidence` · `consent-capture` · `consent-representation` · `decision-binding` · `decision-finality` · `fidelity-of-consent-records` · `interpreting-ambiguous-consent` · `quantification-form` · `tamper-evidence-of-consent`

</details>

| Judgment | Extractor's original poles | Mapped to | Conf | Prov |
|---|---|---|---|---|
| `J0400` | three-valued-consent > binary-consent | graded-verdict > binary-verdict | 0.90 | RU |
| `J0517` | graded-nonanswer-taxonomy > binary-answered-flag | graded-verdict > binary-verdict | 0.85 | RU |
| `J1212` | three-valued-gate > binary-gate | graded-verdict > binary-verdict | 0.85 | A |
| `J0402` | enumerated-ratifiers > boolean-ratification | graded-verdict > binary-verdict | 0.70 | RU |
| `J0531` | failure-representable > success-only-record | graded-verdict > binary-verdict | 0.60 | A |
| `J0578` | rich-state-machine > open-closed-lifecycle | graded-verdict > binary-verdict | 0.60 | RU |
| `J0590` | caveated-human-review > detector-score-as-proof | graded-verdict > binary-verdict | 0.60 | A |
| `J0530` | discrepancy-preserved > collapsed-result | graded-verdict > binary-verdict ⚠ | 0.55 | A |
| `J1107` | fine-grained-refusal > fine-grained-acceptance | graded-verdict > binary-verdict ⚠ | 0.55 | BP |
| `J1108` | two-state-observation > five-state-lifecycle | binary-verdict > graded-verdict ⚠ | 0.50 | BP |
| `J1217` | bounded-choice-architecture > unbounded-suggestion-list | binary-verdict > graded-verdict ⚠ | 0.35 | BP |

## preference-precedence-direction — 11 judgments

**`local-specificity-wins`  ⇄  `principal-scope-wins`**

when preferences at different scopes conflict, whether the most specific local one governs or the broadest principal-level one does

<details><summary>absorbs 7 raw dimension names</summary>

`authoring-precedence` · `configurability` · `precedence-list-direction` · `precedence-semantics` · `preference-inheritance-precedence` · `preference-precedence` · `preference-scope-specificity`

</details>

| Judgment | Extractor's original poles | Mapped to | Conf | Prov |
|---|---|---|---|---|
| `J0231` | specificity-precedence > default-precedence | local-specificity-wins > principal-scope-wins | 0.95 | A |
| `J0492` | local-override-wins > ancestry-wins | local-specificity-wins > principal-scope-wins | 0.90 | RU |
| `J1017` | explicit-turn-choice > view-default | local-specificity-wins > principal-scope-wins | 0.90 | A |
| `J1018` | arena-scope > principal-scope | local-specificity-wins > principal-scope-wins | 0.85 | A |
| `J1019` | yawn-scope > arena-scope | local-specificity-wins > principal-scope-wins | 0.85 | A |
| `J1198` | accepted-preference-precedence > inferred-hypothesis-influence | local-specificity-wins > principal-scope-wins | 0.80 | A |
| `J1203` | scope-specificity-precedence > flat-preference-merge | local-specificity-wins > principal-scope-wins | 0.80 | BP |
| `J1027` | local-override > system-default | local-specificity-wins > principal-scope-wins | 0.70 | RU |
| `J1028` | arena-scope > principal-scope | local-specificity-wins > principal-scope-wins | 0.70 | RU |
| `J0474` | public-root-simplicity > universal-header-completeness | local-specificity-wins > principal-scope-wins | 0.65 | A |
| `J1093` | current-turn-priority > standing-preference-priority | local-specificity-wins > principal-scope-wins | 0.60 | BP |

## ontology-ambition — 11 judgments

**`bounded-ontology`  ⇄  `totalizing-ontology`**

whether the model claims a bounded domain, or claims to cover everything a person or world contains

<details><summary>absorbs 9 raw dimension names</summary>

`construct-scope` · `framework-use` · `model-scope` · `observer-ontology` · `ontological-scope` · `ontology-granularity` · `ontology-growth` · `purpose-of-intelligence` · `study-scope`

</details>

| Judgment | Extractor's original poles | Mapped to | Conf | Prov |
|---|---|---|---|---|
| `J1216` | unbounded-world-referent > serialized-world | bounded-ontology > totalizing-ontology | 0.90 | A |
| `J0750` | bounded-ontology > totalizing-ontology | bounded-ontology > totalizing-ontology | 0.85 | A |
| `J0548` | bounded-claim > metaphysical-claim | bounded-ontology > totalizing-ontology | 0.80 | A |
| `J0561` | bounded-observation-object > universal-decoding | bounded-ontology > totalizing-ontology | 0.80 | A |
| `J0672` | design-audit > totalizing-taxonomy | bounded-ontology > totalizing-ontology | 0.75 | A |
| `J0149` | bounded-arena > total-world | bounded-ontology > totalizing-ontology | 0.70 | A |
| `J0523` | scope-lens > worth-hierarchy | bounded-ontology > totalizing-ontology | 0.60 | A |
| `J0046` | pre-handoff-ladder > full-lifecycle-model | bounded-ontology > totalizing-ontology ⚠ | 0.55 | RU |
| `J0297` | partial-machine-coverage > total-schema-coverage | bounded-ontology > totalizing-ontology ⚠ | 0.50 | A |
| `J0902` | distinct-ontological-kinds > term-aliasing | bounded-ontology > totalizing-ontology ⚠ | 0.50 | A |
| `J0355` | stance-as-view > separate-agent | bounded-ontology > totalizing-ontology ⚠ | 0.40 | A |

## identifier-form — 10 judgments

**`structured-addressable-id`  ⇄  `bare-opaque-handle`**

whether identity is carried by a structured, resolvable, namespaced identifier, or a bare string, hash or path

<details><summary>absorbs 13 raw dimension names</summary>

`address-multiplicity` · `address-uniqueness` · `how-identity-is-decided` · `identity-carrier` · `identity-change-vs-infrastructure-change` · `identity-criterion` · `identity-granularity` · `identity-scope` · `identity-verification` · `product-category` · `product-identity` · `version-identity` · `when-identity-is-assigned`

</details>

| Judgment | Extractor's original poles | Mapped to | Conf | Prov |
|---|---|---|---|---|
| `J0216` | stable-id-identity > path-identity | structured-addressable-id > bare-opaque-handle | 0.75 | A |
| `J0838` | hash-pinned-reference > name-reference | structured-addressable-id > bare-opaque-handle | 0.75 | RU |
| `J0730` | addressable-subrecords > prose-substructure | structured-addressable-id > bare-opaque-handle | 0.65 | RU |
| `J1197` | explicit-lineage-ids > hash-equality-alone | structured-addressable-id > bare-opaque-handle | 0.65 | A |
| `J0712` | resolvable-coordinate > namespace-coordinate | structured-addressable-id > bare-opaque-handle | 0.60 | RU |
| `J1071` | namespaced-string-version > bare-integer-version | structured-addressable-id > bare-opaque-handle | 0.60 | RU |
| `J1072` | bare-hex-hash > prefixed-hash | bare-opaque-handle > structured-addressable-id ⚠ | 0.55 | RU |
| `J0980` | declared-identity > embedding-identity | structured-addressable-id > bare-opaque-handle ⚠ | 0.50 | A |
| `J1171` | unidentified-until-routed > id-on-import | bare-opaque-handle > structured-addressable-id ⚠ | 0.45 | RU |
| `J1196` | layered-identity-hashes > single-record-hash | structured-addressable-id > bare-opaque-handle ⚠ | 0.45 | BP |

## influence-standing — 10 judgments

**`attributed-influence`  ⇄  `influence-as-authority`**

whether an upstream influence is recorded as an influence only, or is allowed to carry authority or count as proof

<details><summary>absorbs 9 raw dimension names</summary>

`authorship-vs-credence` · `credence-by-provenance` · `intellectual-provenance` · `lineage-disclosure` · `lineage-integrity` · `lineage-interpretation` · `mention-semantics` · `status-of-external-influence` · `whose-words-count`

</details>

| Judgment | Extractor's original poles | Mapped to | Conf | Prov |
|---|---|---|---|---|
| `J0027` | influence-as-lineage > influence-as-proof | attributed-influence > influence-as-authority | 0.90 | A |
| `J0692` | disclosed-demoted-influence > hidden-or-authoritative-influence | attributed-influence > influence-as-authority | 0.90 | A |
| `J0743` | proof-gated-influence > inherited-authority | attributed-influence > influence-as-authority | 0.90 | A |
| `J0973` | attributed-influence > spiritual-authority | attributed-influence > influence-as-authority | 0.85 | A |
| `J0166` | bounded-attribution > implied-endorsement | attributed-influence > influence-as-authority | 0.80 | A |
| `J0918` | single-governing-source > coequal-research-authority | attributed-influence > influence-as-authority | 0.80 | A |
| `J0725` | paired-prohibition > bare-contribution | attributed-influence > influence-as-authority | 0.65 | RU |
| `J0757` | field-evidence > media-as-proof | attributed-influence > influence-as-authority | 0.60 | A |
| `J0867` | likeness-as-non-authority > likeness-as-endorsement | attributed-influence > influence-as-authority | 0.60 | RU |
| `J0019` | attention-routing > authority-transfer | attributed-influence > influence-as-authority ⚠ | 0.55 | A |

## who-may-change-structure — 9 judgments

**`human-ratified-structure`  ⇄  `agent-originated-restructure`**

whether the shape of the tree, the ontology and the names may only change under human ratification, or an agent may restructure on its own

<details><summary>absorbs 19 raw dimension names</summary>

`adaptation-authority` · `authority-over-meaning` · `authority-to-create-structure` · `candidate-set-control` · `extension-authority` · `folder-population` · `naming-authority` · `ontological-authority` · `projection-authority` · `reversibility-of-structure-ops` · `source-of-structure` · `structural-change-authority` · `structural-change-protocol` · `structural-change-semantics` · `structural-conservatism` · `structure-formation` · `vocabulary-control` · `which-changes-an-agent-may-originate` · `who-may-change-structure`

</details>

| Judgment | Extractor's original poles | Mapped to | Conf | Prov |
|---|---|---|---|---|
| `J0101` | proposal-plus-receipt > autonomous-restructure | human-ratified-structure > agent-originated-restructure | 0.95 | A |
| `J0806` | human-ratified-structure > automatic-structuring | human-ratified-structure > agent-originated-restructure | 0.95 | A |
| `J1095` | human-authorized-structure > delegated-structural-authority | human-ratified-structure > agent-originated-restructure | 0.95 | A |
| `J1182` | human-authorization > ai-self-authorization | human-ratified-structure > agent-originated-restructure | 0.95 | A |
| `J0224` | receipted-proposal > direct-mutation | human-ratified-structure > agent-originated-restructure | 0.90 | A |
| `J0354` | ratification-gate > auto-adoption | human-ratified-structure > agent-originated-restructure | 0.85 | A |
| `J0120` | review-gated-destruction > symmetric-operations | human-ratified-structure > agent-originated-restructure | 0.70 | RU |
| `J0223` | declared-containment > inferred-containment | human-ratified-structure > agent-originated-restructure | 0.65 | A |
| `J0369` | declared-relation > spatial-inference | human-ratified-structure > agent-originated-restructure ⚠ | 0.55 | A |

## proof-scope-fidelity — 9 judgments

**`scope-matched-proof`  ⇄  `proof-overreach`**

whether the attached proof actually covers the claim it sits under, or covers a narrower or different claim than the one advertised

<details><summary>absorbs 14 raw dimension names</summary>

`claim-strength-honesty` · `declared-shape-vs-actual-fill` · `fidelity-of-a-restated-rule` · `invariant-versus-enforcement` · `mandate-vs-enforcement` · `marketing-vs-accuracy` · `mechanism-claim` · `proof-granularity` · `proof-scope` · `proof-strength-honesty` · `rule-vs-record-of-the-rule` · `scope-of-proof` · `stated-precondition-versus-shipped-state` · `stated-priority-vs-shipped-order`

</details>

| Judgment | Extractor's original poles | Mapped to | Conf | Prov |
|---|---|---|---|---|
| `J0600` | tiered-evidence-disclosure > blended-evidence-claim | scope-matched-proof > proof-overreach | 0.80 | A |
| `J0541` | claim-level-proof > whole-orientation-proof | scope-matched-proof > proof-overreach | 0.70 | A |
| `J0718` | partial-proof > mirrored-proof | proof-overreach > scope-matched-proof | 0.70 | RU |
| `J1117` | replay-equivalence > origin-authentication | scope-matched-proof > proof-overreach | 0.70 | A |
| `J0688` | claim-downgrade > mechanism-to-behaviour-inflation | scope-matched-proof > proof-overreach | 0.65 | A |
| `J0727` | behaviour-inclusive-definition > evidence-matched-definition | proof-overreach > scope-matched-proof | 0.65 | RU |
| `J0187` | shipping-proof > efficacy-proof | proof-overreach > scope-matched-proof | 0.60 | BP |
| `J0210` | retained-cost > proof-absolution | scope-matched-proof > proof-overreach ⚠ | 0.55 | A |
| `J0328` | graded-proof-status > uniform-proof-status | scope-matched-proof > proof-overreach ⚠ | 0.55 | BP |

## epistemic-labelling — 9 judgments

**`per-claim-epistemic-marking`  ⇄  `flat-unmarked-assertion`**

whether each claim carries a marker of how it is known, or claims are asserted flat with no epistemic tag

<details><summary>absorbs 10 raw dimension names</summary>

`data-interpretation` · `epistemic-hygiene` · `epistemic-labeling` · `epistemic-stage-coverage` · `epistemic-standing-of-a-publication` · `epistemic-standing-of-memory` · `epistemic-weight-of-generated-media` · `evidence-vs-conclusion` · `granularity-of-epistemic-attribution` · `status-of-source-media`

</details>

| Judgment | Extractor's original poles | Mapped to | Conf | Prov |
|---|---|---|---|---|
| `J0501` | fact-inference-separation > undifferentiated-capture | per-claim-epistemic-marking > flat-unmarked-assertion | 0.90 | A |
| `J0285` | epistemic-labeling > flat-assertion | per-claim-epistemic-marking > flat-unmarked-assertion | 0.80 | A |
| `J0618` | observation-inference-separation > merged-finding | per-claim-epistemic-marking > flat-unmarked-assertion | 0.80 | BP |
| `J0510` | hypothetical-partner-model > asserted-partner-model | per-claim-epistemic-marking > flat-unmarked-assertion | 0.65 | A |
| `J1109` | partitioned-statements > shared-statement-vocabulary | per-claim-epistemic-marking > flat-unmarked-assertion | 0.60 | BP |
| `J0213` | labeled-subjectivity > excluded-subjectivity | per-claim-epistemic-marking > flat-unmarked-assertion ⚠ | 0.55 | A |
| `J0849` | hedged-other-attribution > symmetric-attribution | per-claim-epistemic-marking > flat-unmarked-assertion ⚠ | 0.55 | RU |
| `J1239` | subjective-attributed-feedback > universal-fact-feedback | per-claim-epistemic-marking > flat-unmarked-assertion ⚠ | 0.55 | A |
| `J0320` | contested-provenance-marked > uniform-reported-provenance | per-claim-epistemic-marking > flat-unmarked-assertion ⚠ | 0.45 | RU |

## serialisation-form — 9 judgments

**`structured-machine-format`  ⇄  `flat-human-format`**

whether a record is written in an exact machine grammar (JSON, schema-shaped, hashed) or a flat human-writable one

<details><summary>absorbs 14 raw dimension names</summary>

`doorway-machinability` · `file-form` · `file-form-priority` · `history-form` · `identifier-encoding` · `machine-computability-vs-authorial-nuance` · `primitive-to-field-fidelity` · `provenance-form` · `publication-format` · `record-form` · `serialization` · `specification-form` · `surface-form` · `text-representation`

</details>

| Judgment | Extractor's original poles | Mapped to | Conf | Prov |
|---|---|---|---|---|
| `J0837` | schema-exact-json > yaml-authoring | structured-machine-format > flat-human-format | 0.85 | RU |
| `J1157` | schema-fidelity-serialization > format-uniformity | structured-machine-format > flat-human-format | 0.80 | RU |
| `J0041` | schema-versioned-record > flat-yawn-header | structured-machine-format > flat-human-format | 0.75 | RU |
| `J0637` | digest-bound-scope > prose-scope | structured-machine-format > flat-human-format | 0.70 | BP |
| `J0350` | structured-intake > free-text-intake | structured-machine-format > flat-human-format | 0.60 | RU |
| `J0538` | structured-doorway > prose-doorway | structured-machine-format > flat-human-format | 0.60 | RU |
| `J1221` | digest-bound-decision > prose-only-approval | structured-machine-format > flat-human-format | 0.60 | BP |
| `J0428` | frontmatter-prose > flat-yaml-record | flat-human-format > structured-machine-format ⚠ | 0.50 | RU |
| `J0632` | compound-field-value > single-value-field | flat-human-format > structured-machine-format ⚠ | 0.50 | RU |

## attribution-granularity — 9 judgments

**`per-claim-attribution`  ⇄  `document-level-attribution`**

whether each individual claim names its source, or attribution is declared once for a whole document

<details><summary>absorbs 10 raw dimension names</summary>

`attribution-granularity` · `attribution-rigor` · `attribution-surface` · `authorship-attribution` · `claim-attribution` · `claim-attribution-granularity` · `provenance-of-claims` · `provenance-of-examples` · `representing-the-other-party` · `what-the-principal-models`

</details>

| Judgment | Extractor's original poles | Mapped to | Conf | Prov |
|---|---|---|---|---|
| `J0085` | attributed-inference > blended-output | per-claim-attribution > document-level-attribution | 0.70 | A |
| `J0586` | per-agent-attribution > single-voice-collapse | per-claim-attribution > document-level-attribution | 0.70 | A |
| `J1136` | span-level-provenance > document-level-citation | per-claim-attribution > document-level-attribution | 0.70 | RU |
| `J0668` | accountability-map > responsibility-laundering | per-claim-attribution > document-level-attribution | 0.60 | A |
| `J0800` | per-claim-attribution > flat-assertion | per-claim-attribution > document-level-attribution ⚠ | 0.55 | BP |
| `J1131` | per-claim-epistemics > document-level-status-vector | per-claim-attribution > document-level-attribution ⚠ | 0.55 | RU |
| `J0679` | preserved-disagreement > consensus-merge | per-claim-attribution > document-level-attribution ⚠ | 0.50 | A |
| `J0703` | keyword-anchor > cited-lineage | document-level-attribution > per-claim-attribution ⚠ | 0.50 | RU |
| `J0416` | freehand-authoring > template-instantiation | document-level-attribution > per-claim-attribution ⚠ | 0.45 | BP |

## scope-propagation — 8 judgments

**`contained-scope`  ⇄  `propagating-scope`**

whether a property (privacy, privilege, constraint) stays inside the object it is declared on, or flows to children, parents and peers

<details><summary>absorbs 18 raw dimension names</summary>

`adaptation-boundary` · `constraint-location` · `constraint-reachability` · `constraint-reuse` · `coupling-between-lifecycle-stages` · `cross-party-propagation` · `extension-boundary` · `human-layer-vs-machine-layer-coupling` · `identity-boundary` · `level-semantics` · `mutability-boundary` · `preference-reachability` · `privacy-propagation` · `privilege-propagation` · `propagation-across-nesting` · `record-dependency` · `scope-containment` · `where-agent-limits-attach`

</details>

| Judgment | Extractor's original poles | Mapped to | Conf | Prov |
|---|---|---|---|---|
| `J0521` | attributed-desire > propagated-obligation | contained-scope > propagating-scope | 0.85 | A |
| `J0982` | scoped-privacy > inheritance-leak | contained-scope > propagating-scope | 0.85 | A |
| `J0469` | additive-skin > role-remapping-skin | contained-scope > propagating-scope | 0.60 | A |
| `J0568` | immutable-event-log > immutable-everything | contained-scope > propagating-scope | 0.60 | RU |
| `J0623` | one-way-bridge > bidirectional-sync | contained-scope > propagating-scope ⚠ | 0.55 | RU |
| `J1128` | intimacy-scoped-agent-constraint > uniform-agent-clause | contained-scope > propagating-scope ⚠ | 0.55 | RU |
| `J1020` | unrankable-invariants > top-ranked-preference | contained-scope > propagating-scope ⚠ | 0.50 | A |
| `J0966` | stable-identity > normalization-side-effect | contained-scope > propagating-scope ⚠ | 0.45 | A |

## naming-convention-uniformity — 8 judgments

**`uniform-naming-convention`  ⇄  `per-file-naming-freedom`**

whether every path, key and file follows one casing and naming rule, or files may depart from it

<details><summary>absorbs 9 raw dimension names</summary>

`document-shape-uniformity` · `file-naming-convention` · `folder-naming` · `identifier-convention` · `identifier-format` · `lexical-canonicity` · `lexical-invariant` · `naming-convention` · `naming-surface`

</details>

| Judgment | Extractor's original poles | Mapped to | Conf | Prov |
|---|---|---|---|---|
| `J0387` | batch-local-identifiers > normalized-identifiers | per-file-naming-freedom > uniform-naming-convention | 0.85 | RU |
| `J0214` | canonical-extension > speech-alias | uniform-naming-convention > per-file-naming-freedom | 0.80 | A |
| `J0916` | case-as-rank-signal > uniform-kebab-case | per-file-naming-freedom > uniform-naming-convention | 0.80 | RU |
| `J0927` | case-distinguished-naming > single-casing | uniform-naming-convention > per-file-naming-freedom | 0.80 | A |
| `J0892` | single-canonical-extension > alias-tolerance | uniform-naming-convention > per-file-naming-freedom | 0.60 | A |
| `J0657` | subject-first-naming > date-first-naming | uniform-naming-convention > per-file-naming-freedom ⚠ | 0.50 | RU |
| `J0272` | namespace-id > path-id | per-file-naming-freedom > uniform-naming-convention ⚠ | 0.45 | RU |
| `J0326` | semantic-roots > ordinal-roots | uniform-naming-convention > per-file-naming-freedom ⚠ | 0.45 | BP |

## completeness-versus-honesty — 8 judgments

**`complete-looking-record`  ⇄  `honest-partial-record`**

whether every slot is filled so the record looks finished, or slots are left visibly unfilled to stay truthful

<details><summary>absorbs 9 raw dimension names</summary>

`completeness-appearance-vs-honesty` · `completeness-vs-honesty` · `completeness-vs-honesty-about-unknowns` · `index-self-consistency` · `model-completeness` · `outcome-completeness` · `receipt-completeness` · `record-completeness` · `state-consistency-within-a-record`

</details>

| Judgment | Extractor's original poles | Mapped to | Conf | Prov |
|---|---|---|---|---|
| `J0500` | visible-lacuna > inferred-completion | honest-partial-record > complete-looking-record | 0.85 | A |
| `J0403` | empty-as-honest > inferred-fill | honest-partial-record > complete-looking-record | 0.80 | RU |
| `J0407` | blank-placeholder > synthetic-digest | honest-partial-record > complete-looking-record | 0.80 | RU |
| `J0484` | typed-lacuna > fabricated-answer | honest-partial-record > complete-looking-record | 0.80 | A |
| `J0640` | recorded-gap > omitted-gap | honest-partial-record > complete-looking-record | 0.75 | BP |
| `J1237` | absent-until-verified > placeholder-fixture | honest-partial-record > complete-looking-record | 0.70 | A |
| `J0111` | unobserved-default > success-default | honest-partial-record > complete-looking-record ⚠ | 0.55 | RU |
| `J0393` | unreconciled-lifecycle > receipted-transition | complete-looking-record > honest-partial-record ⚠ | 0.50 | RU |

## gate-versus-rank-order — 8 judgments

**`gates-before-ranking`  ⇄  `ranking-before-gates`**

whether hard safety/authority gates are evaluated before any preference ranking, or candidates are ranked first and filtered after

<details><summary>absorbs 16 raw dimension names</summary>

`automation-check-order` · `automation-step-order` · `capture-order` · `decision-order` · `evaluation-order` · `gate-precedence` · `gate-vs-preference-order` · `hard-gate-priority` · `modeling-order` · `move-selection-priority` · `pipeline-order` · `resolution-order` · `routing-operation-order` · `selection-pass-order` · `write-order` · `write-ordering`

</details>

| Judgment | Extractor's original poles | Mapped to | Conf | Prov |
|---|---|---|---|---|
| `J0458` | gates-before-ranking > score-first-ranking | gates-before-ranking > ranking-before-gates | 0.95 | A |
| `J0121` | gate-then-rank > rank-then-gate | gates-before-ranking > ranking-before-gates | 0.90 | RU |
| `J1199` | hard-gate-priority > preference-priority | gates-before-ranking > ranking-before-gates | 0.90 | A |
| `J1213` | gate-before-ranking > rank-then-filter | gates-before-ranking > ranking-before-gates | 0.90 | A |
| `J1022` | safety-gates > semantic-priority | gates-before-ranking > ranking-before-gates | 0.60 | A |
| `J0514` | safety-first-gate-order > proof-first-gate-order | gates-before-ranking > ranking-before-gates ⚠ | 0.50 | RU |
| `J1045` | risk-before-choice > choice-before-risk | gates-before-ranking > ranking-before-gates ⚠ | 0.50 | BP |
| `J1244` | serial-validate-first > parallel-test-run | gates-before-ranking > ranking-before-gates ⚠ | 0.40 | RU |

## tie-break-basis — 8 judgments

**`lower-effort-first`  ⇄  `explicit-choice-first`**

when two candidates are otherwise equal, whether the cheaper-to-answer one wins or the one the actor explicitly chose this turn

<details><summary>absorbs 13 raw dimension names</summary>

`cost-of-entry` · `curation-priority` · `interaction-fit-rank` · `path-length-to-action` · `per-message-orientation-overhead` · `principle-rank` · `semantic-priority-rank` · `structural-priority` · `surface-priority` · `tie-break-authority` · `tie-break-elaboration` · `tie-break-order` · `tie-break-stage-order`

</details>

| Judgment | Extractor's original poles | Mapped to | Conf | Prov |
|---|---|---|---|---|
| `J1023` | low-answer-burden > explicit-turn-choice | lower-effort-first > explicit-choice-first | 0.95 | A |
| `J1200` | lower-burden-tiebreak > stated-order-tiebreak | lower-effort-first > explicit-choice-first | 0.95 | A |
| `J0250` | burden-minimization > explicit-turn-choice | lower-effort-first > explicit-choice-first | 0.90 | RU |
| `J1013` | explicit-turn-choice > accessibility-requirement | explicit-choice-first > lower-effort-first | 0.60 | RU |
| `J1016` | explicit-turn-choice > deferral-history | explicit-choice-first > lower-effort-first ⚠ | 0.55 | RU |
| `J1012` | consequence-weight > cheapness | explicit-choice-first > lower-effort-first ⚠ | 0.45 | A |
| `J1015` | answerability > low-friction | explicit-choice-first > lower-effort-first ⚠ | 0.45 | RU |
| `J1094` | movement-critical-first > effort-first | explicit-choice-first > lower-effort-first ⚠ | 0.45 | RU |

## unattended-effect-authorisation — 8 judgments

**`zero-spend-default`  ⇄  `autonomous-spend`**

whether an unattended loop may spend money, generate media or publish on its own, or must stop and propose

<details><summary>absorbs 7 raw dimension names</summary>

`automation-gating` · `cost-authority` · `generation-policy` · `how-spend-is-bounded` · `shape-of-a-spend-authorization` · `which-effects-may-run-unattended` · `which-loops-run-unattended`

</details>

| Judgment | Extractor's original poles | Mapped to | Conf | Prov |
|---|---|---|---|---|
| `J0996` | unscheduled-spend > scheduled-spend | zero-spend-default > autonomous-spend | 0.90 | BP |
| `J1223` | proposal-only-automation > scheduled-autonomous-spend | zero-spend-default > autonomous-spend | 0.90 | A |
| `J1241` | zero-spend-default > bounded-spend-authorization | zero-spend-default > autonomous-spend | 0.90 | BP |
| `J1161` | human-gated-image-publication > scheduled-image-publication | zero-spend-default > autonomous-spend | 0.85 | BP |
| `J0035` | contract-without-runtime > scheduled-runtime | zero-spend-default > autonomous-spend | 0.80 | RU |
| `J0068` | inference-as-effect > compute-as-free | zero-spend-default > autonomous-spend | 0.70 | RU |
| `J0865` | zero-cost-no-egress > paid-provider-render | zero-spend-default > autonomous-spend | 0.60 | RU |
| `J0604` | count-ceiling > currency-budget | zero-spend-default > autonomous-spend ⚠ | 0.55 | A |

## what-is-primitive — 8 judgments

**`relationship-primitive`  ⇄  `object-primitive`**

whether relationship, encounter and process are the base entities and objects derive from them, or the other way round

<details><summary>absorbs 9 raw dimension names</summary>

`concept-status` · `ontological-precedence` · `ontological-primacy` · `ontological-priority` · `primitive-promotion` · `primitive-relation` · `semantic-carrier` · `what-is-primitive` · `when-a-lens-becomes-an-entity`

</details>

| Judgment | Extractor's original poles | Mapped to | Conf | Prov |
|---|---|---|---|---|
| `J1039` | relationship-primacy > observation-primacy | relationship-primitive > object-primitive | 0.90 | A |
| `J0096` | relationship-first > observation-first | relationship-primitive > object-primitive | 0.85 | A |
| `J0142` | relational-coupling > context-free-attributes | relationship-primitive > object-primitive | 0.85 | A |
| `J0552` | relationship-first > observation-first | relationship-primitive > object-primitive | 0.85 | A |
| `J0669` | triadic-non-reduction > relational-totalization | relationship-primitive > object-primitive | 0.60 | A |
| `J0131` | event-substrate > agent-substrate | relationship-primitive > object-primitive ⚠ | 0.55 | RU |
| `J0163` | simultaneous-lenses > processing-sequence | relationship-primitive > object-primitive ⚠ | 0.50 | A |
| `J0143` | dual-precedence > single-precedence | relationship-primitive > object-primitive ⚠ | 0.45 | A |

## content-trust-boundary — 8 judgments

**`content-as-untrusted-data`  ⇄  `content-as-executable`**

whether material pulled from the repo or a third party is treated as inert data, or run and trusted as instruction

<details><summary>absorbs 9 raw dimension names</summary>

`actor-trust` · `executable-surface` · `instruction-provenance` · `logging-threshold` · `third-party-code-handling` · `trust-boundary-of-repo-content` · `untrusted-source-handling` · `validator-trust-model` · `which-code-the-protocol-admits`

</details>

| Judgment | Extractor's original poles | Mapped to | Conf | Prov |
|---|---|---|---|---|
| `J0025` | trusted-control-plane > text-as-instruction | content-as-untrusted-data > content-as-executable | 0.95 | A |
| `J0985` | untrusted-data > executable-content | content-as-untrusted-data > content-as-executable | 0.95 | A |
| `J0017` | metadata-inspection > clone-and-execute | content-as-untrusted-data > content-as-executable | 0.90 | A |
| `J0312` | untrusted-data > executable-content | content-as-untrusted-data > content-as-executable | 0.90 | A |
| `J0611` | read-only-observation > clone-and-execute | content-as-untrusted-data > content-as-executable | 0.85 | A |
| `J0549` | signal-as-material > signal-as-instruction | content-as-untrusted-data > content-as-executable | 0.80 | A |
| `J0567` | record-only-probe > autonomous-execution | content-as-untrusted-data > content-as-executable | 0.65 | A |
| `J0953` | interpretive-gap > direct-compliance | content-as-untrusted-data > content-as-executable | 0.60 | A |

## status-vocabulary-closure — 7 judgments

**`closed-status-enum`  ⇄  `free-text-status`**

whether status values are drawn from a fixed enumerated set, or written freely per record

<details><summary>absorbs 13 raw dimension names</summary>

`authorship-status` · `epistemic-status` · `lifecycle-granularity` · `projection-status` · `status-dimension-discipline` · `status-modeling` · `status-modelling` · `status-semantics` · `status-vocabulary` · `status-vocabulary-unification` · `template-status` · `what-a-status-field-reports` · `what-status-measures`

</details>

| Judgment | Extractor's original poles | Mapped to | Conf | Prov |
|---|---|---|---|---|
| `J0043` | expressive-status > enumerated-status | free-text-status > closed-status-enum | 0.95 | RU |
| `J0386` | free-form-status > controlled-vocabulary | free-text-status > closed-status-enum | 0.95 | RU |
| `J0247` | per-file-status-vocabulary > shared-status-enum | free-text-status > closed-status-enum | 0.90 | RU |
| `J0713` | per-file-status-vocabulary > enumerated-status-ladder | free-text-status > closed-status-enum | 0.85 | RU |
| `J0767` | ad-hoc-status-strings > schema-enumerated-status | free-text-status > closed-status-enum | 0.85 | RU |
| `J0592` | closed-vocabulary > free-text-composite-status | closed-status-enum > free-text-status | 0.80 | A |
| `J0628` | ad-hoc-status-value > declared-enum-conformance | free-text-status > closed-status-enum | 0.70 | BP |

## presentation-adaptivity — 7 judgments

**`adaptive-presentation`  ⇄  `fixed-canonical-rendering`**

whether the surface reshapes itself to the reader and context, or every reader gets the same canonical rendering

<details><summary>absorbs 12 raw dimension names</summary>

`explanatory-copy-placement` · `how-rails-are-carried` · `page-composition` · `presentation-integrity` · `presentation-limits` · `render-fidelity` · `semantics-vs-presentation` · `view-fidelity` · `view-suppression-limits` · `visual-density` · `visual-stability` · `visual-vocabulary`

</details>

| Judgment | Extractor's original poles | Mapped to | Conf | Prov |
|---|---|---|---|---|
| `J0097` | adaptive-presentation > fixed-question-sequence | adaptive-presentation > fixed-canonical-rendering | 0.85 | A |
| `J1232` | frozen-design-constants > mutable-design-tokens | fixed-canonical-rendering > adaptive-presentation | 0.60 | BP |
| `J1024` | accepted-order-preference > canonical-order | adaptive-presentation > fixed-canonical-rendering ⚠ | 0.55 | A |
| `J0827` | wording-change-transparency > silent-rekeying | adaptive-presentation > fixed-canonical-rendering ⚠ | 0.45 | A |
| `J0480` | in-header-affordance > floating-instruction-banner | fixed-canonical-rendering > adaptive-presentation ⚠ | 0.40 | RU |
| `J0490` | austere-visual-field > decorated-status-chrome | fixed-canonical-rendering > adaptive-presentation ⚠ | 0.40 | RU |
| `J0868` | semantic-color > aesthetic-palette | fixed-canonical-rendering > adaptive-presentation ⚠ | 0.35 | RU |

## rule-versus-carve-out — 7 judgments

**`uniform-rule`  ⇄  `explicit-grandfather-ledger`**

whether one rule applies to everything without exception, or known violations are enumerated in a named, shrinking exception list

<details><summary>absorbs 10 raw dimension names</summary>

`candidate-admission` · `constraint-strength` · `derivation-constraint` · `exception-growth` · `how-a-new-rule-meets-existing-violations` · `modality-of-structural-rules` · `prohibition-semantics` · `rule-emphasis` · `rule-force` · `rule-versus-carve-out`

</details>

| Judgment | Extractor's original poles | Mapped to | Conf | Prov |
|---|---|---|---|---|
| `J0625` | ratchet-enforcement > immediate-hard-fail | explicit-grandfather-ledger > uniform-rule | 0.95 | BP |
| `J0908` | explicit-grandfather-ledger > silent-rewrite | explicit-grandfather-ledger > uniform-rule | 0.95 | A |
| `J1178` | explicit-grandfathering > silent-history-rewrite | explicit-grandfather-ledger > uniform-rule | 0.70 | A |
| `J1001` | live-falsifier > enforced-invariant | explicit-grandfather-ledger > uniform-rule | 0.60 | BP |
| `J0324` | guarded-exemption > scrubbed-record | explicit-grandfather-ledger > uniform-rule ⚠ | 0.55 | RU |
| `J0988` | public-root-simplicity > header-uniformity | explicit-grandfather-ledger > uniform-rule ⚠ | 0.50 | A |
| `J1179` | shrink-only-ledger > open-exception-list | uniform-rule > explicit-grandfather-ledger ⚠ | 0.50 | A |

## change-size — 7 judgments

**`smallest-bounded-move`  ⇄  `wholesale-change`**

whether a change is deliberately kept to the smallest adequate step, or made as one sweeping restructure

<details><summary>absorbs 8 raw dimension names</summary>

`change-granularity` · `commitment-size` · `corpus-allocation` · `decomposition-cost` · `generation-attempt-budget` · `generation-breadth` · `inquiry-volume` · `scope-sizing`

</details>

| Judgment | Extractor's original poles | Mapped to | Conf | Prov |
|---|---|---|---|---|
| `J0059` | smallest-bounded-move > comprehensive-fix | smallest-bounded-move > wholesale-change | 0.95 | RU |
| `J0086` | minimum-sufficient-commitment > bold-action | smallest-bounded-move > wholesale-change | 0.80 | A |
| `J0102` | smallest-adequate-arena > broad-arena | smallest-bounded-move > wholesale-change | 0.70 | A |
| `J0119` | attach-first > create-first | smallest-bounded-move > wholesale-change ⚠ | 0.55 | RU |
| `J0909` | fix-the-teaching-surface > fix-the-instances | smallest-bounded-move > wholesale-change ⚠ | 0.55 | BP |
| `J1050` | email-path > automation-path | smallest-bounded-move > wholesale-change ⚠ | 0.55 | A |
| `J1057` | link-first > merge-or-split-first | smallest-bounded-move > wholesale-change ⚠ | 0.55 | A |

## automation-cadence — 7 judgments

**`scheduled-recurring`  ⇄  `on-demand-triggered`**

whether a loop runs on a clock whether or not anything happened, or only when an event or a person triggers it

<details><summary>absorbs 9 raw dimension names</summary>

`cadence-by-surface-type` · `memory-write-timing` · `notification-frequency` · `notification-latency` · `persistence-trigger` · `polling-latency` · `review-cadence` · `scheduled-vs-on-demand` · `when-a-record-is-created`

</details>

| Judgment | Extractor's original poles | Mapped to | Conf | Prov |
|---|---|---|---|---|
| `J0788` | condition-triggered-review > scheduled-review | on-demand-triggered > scheduled-recurring | 0.80 | RU |
| `J0334` | on-demand-check > enforced-check | on-demand-triggered > scheduled-recurring ⚠ | 0.55 | BP |
| `J0033` | hourly-watch > daily-watch | scheduled-recurring > on-demand-triggered ⚠ | 0.50 | RU |
| `J0015` | content-change-dedupe > per-event-notification | on-demand-triggered > scheduled-recurring ⚠ | 0.45 | A |
| `J1162` | inbound-responsiveness > uniform-cadence | scheduled-recurring > on-demand-triggered ⚠ | 0.45 | BP |
| `J0265` | felt-trigger > scheduled-trigger | on-demand-triggered > scheduled-recurring ⚠ | 0.40 | RU |
| `J0622` | hourly-cadence > four-hour-cadence | on-demand-triggered > scheduled-recurring ⚠ | 0.40 | RU |

## structural-topology — 7 judgments

**`single-parent-tree`  ⇄  `multi-parent-graph`**

whether a thing hangs from exactly one parent, or may belong to several containers at once

<details><summary>absorbs 12 raw dimension names</summary>

`arena-membership` · `arena-selection` · `containment-topology` · `holarchy-topology` · `index-centralization-vs-distribution` · `node-purity` · `objective-locus` · `registry-membership` · `registry-structure` · `structural-containment` · `where-holons-open-inward` · `who-owns-which-layer`

</details>

| Judgment | Extractor's original poles | Mapped to | Conf | Prov |
|---|---|---|---|---|
| `J0221` | single-parent-tree > multi-parent-graph | single-parent-tree > multi-parent-graph | 0.95 | A |
| `J1215` | single-parent-backbone > multi-parent-graph | single-parent-tree > multi-parent-graph | 0.90 | BP |
| `J0172` | single-arena-slot > multi-arena-slots | single-parent-tree > multi-parent-graph | 0.65 | RU |
| `J0155` | multiple-projections > single-canonical-arena | multi-parent-graph > single-parent-tree | 0.60 | A |
| `J0162` | holonic-recursion > fixed-hierarchy | multi-parent-graph > single-parent-tree | 0.60 | A |
| `J0411` | group-level-nesting > individual-level-nesting | single-parent-tree > multi-parent-graph ⚠ | 0.40 | RU |
| `J0803` | decoupled-hierarchies > unified-hierarchy | multi-parent-graph > single-parent-tree ⚠ | 0.40 | A |

## consent-granularity — 6 judgments

**`per-instance-consent`  ⇄  `blanket-consent`**

whether each effect is separately approved, or one approval covers a class of future effects

<details><summary>absorbs 13 raw dimension names</summary>

`approval-addressability` · `approval-granularity` · `completeness-of-effect-interlocks` · `consent-granularity` · `effect-granularity` · `effect-ownership` · `gate-arity` · `granularity-of-authorization` · `guard-granularity` · `licensing-granularity` · `permission-granularity` · `what-counts-as-a-side-effect` · `what-counts-as-an-effect`

</details>

| Judgment | Extractor's original poles | Mapped to | Conf | Prov |
|---|---|---|---|---|
| `J0003` | effect-separation > effect-inference | per-instance-consent > blanket-consent | 0.85 | A |
| `J0819` | per-step-authentication > cascading-approval | per-instance-consent > blanket-consent | 0.85 | A |
| `J1140` | separated-authorizations > single-approval | per-instance-consent > blanket-consent | 0.75 | RU |
| `J0437` | human-approval > automatic-promotion | per-instance-consent > blanket-consent | 0.70 | A |
| `J0448` | staged-authority > collapsed-authority | per-instance-consent > blanket-consent | 0.65 | A |
| `J0088` | explicit-egress-authority > non-mutation-as-safety | per-instance-consent > blanket-consent | 0.60 | A |

## source-reachability — 6 judgments

**`independently-reachable-source`  ⇄  `author-only-source`**

whether a cited source can be opened by anyone reading the record, or only by its author on their own machine

<details><summary>absorbs 10 raw dimension names</summary>

`access-independence` · `addressability` · `granularity-of-addressing` · `index-addressability` · `operational-portability` · `reference-integrity` · `reference-mechanism` · `reproducibility-assumption` · `verification-portability` · `version-addressability`

</details>

| Judgment | Extractor's original poles | Mapped to | Conf | Prov |
|---|---|---|---|---|
| `J0708` | lineage-grading > verifiability-grading | author-only-source > independently-reachable-source | 0.75 | RU |
| `J0710` | open-data-preference > open-data-requirement | independently-reachable-source > author-only-source ⚠ | 0.55 | BP |
| `J1224` | tested-index-reachability > orphan-record | independently-reachable-source > author-only-source ⚠ | 0.55 | BP |
| `J0782` | single-operator-concreteness > portable-configuration | author-only-source > independently-reachable-source ⚠ | 0.50 | RU |
| `J0196` | resolvable-citation > prose-credit | independently-reachable-source > author-only-source ⚠ | 0.45 | BP |
| `J0353` | cold-start-command > warm-tree-command | independently-reachable-source > author-only-source ⚠ | 0.45 | RU |

## enforcement-locus — 6 judgments

**`schema-declared-constraint`  ⇄  `runtime-check`**

where a constraint actually lives and gets checked: declared in the schema/contract, or asserted by a script or test at run time

<details><summary>absorbs 24 raw dimension names</summary>

`definition-locality` · `enforcement-depth` · `enforcement-location` · `enforcement-locus` · `enforcement-redundancy` · `identity-locus` · `memory-location` · `naming-enforcement-point` · `ownership-location` · `policy-location` · `responsibility-location` · `state-location` · `validation-precedence` · `where-derived-views-live` · `where-intent-is-declared` · `where-invariants-are-maintained` · `where-orientation-lives` · `where-safety-machinery-attaches` · `where-safety-work-goes` · `where-validators-are-written` · `where-verification-effort-goes` · `where-verification-is-spent` · `where-verification-lives` · `which-layer-gets-hardened`

</details>

| Judgment | Extractor's original poles | Mapped to | Conf | Prov |
|---|---|---|---|---|
| `J1230` | runtime-enforcement > schema-enforcement | runtime-check > schema-declared-constraint | 0.85 | BP |
| `J1092` | policy-in-schema > policy-in-code | schema-declared-constraint > runtime-check | 0.80 | BP |
| `J1118` | runtime-enforcement > schema-enforcement | runtime-check > schema-declared-constraint | 0.80 | A |
| `J1116` | self-disclaiming-record > runtime-canonicality | schema-declared-constraint > runtime-check | 0.60 | BP |
| `J1209` | dual-layer-enforcement > single-layer-validation | runtime-check > schema-declared-constraint ⚠ | 0.55 | BP |
| `J1104` | const-locked-rails > configurable-rails | schema-declared-constraint > runtime-check ⚠ | 0.50 | BP |

## confidence-representation — 6 judgments

**`quantified-confidence`  ⇄  `unquantified-judgment`**

whether uncertainty is carried as a number or score, or left as an unnumbered qualitative judgment

<details><summary>absorbs 17 raw dimension names</summary>

`confidence-representation` · `frontier-penalty-weights` · `frontier-ranking-weights` · `frontier-score-penalty-weight` · `frontier-score-weight` · `identity-resolution-method` · `meaning-of-numbers` · `multi-agent-aggregation` · `notification-granularity` · `question-ranking-basis` · `role-of-scoring` · `score-decomposition` · `scoring-model` · `similarity-threshold` · `uncertainty-in-scoring` · `what-gets-measured` · `where-uncertainty-is-quantified`

</details>

| Judgment | Extractor's original poles | Mapped to | Conf | Prov |
|---|---|---|---|---|
| `J0118` | reasons-as-output > score-as-output | unquantified-judgment > quantified-confidence | 0.65 | RU |
| `J0394` | confidence-on-inference > uniform-confidence | quantified-confidence > unquantified-judgment | 0.60 | RU |
| `J0846` | raw-narrative-first > rating-scale | unquantified-judgment > quantified-confidence ⚠ | 0.50 | RU |
| `J1040` | lacuna-reduction > decision-impact | quantified-confidence > unquantified-judgment ⚠ | 0.45 | RU |
| `J1041` | proof-potential > agency-gain | quantified-confidence > unquantified-judgment ⚠ | 0.45 | RU |
| `J1042` | permission-risk > cost-pressure | quantified-confidence > unquantified-judgment ⚠ | 0.45 | RU |

## authorship-disclosure — 6 judgments

**`disclosed-machine-authorship`  ⇄  `undisclosed-authorship`**

whether a record says that a machine wrote or shaped it, or presents machine output without saying so

<details><summary>absorbs 9 raw dimension names</summary>

`agent-presentation` · `authorship-transparency` · `automation-identity-disclosure` · `evaluative-stance` · `explanatory-technique` · `framing-lead` · `instructional-stance` · `public-prose-register` · `voice`

</details>

| Judgment | Extractor's original poles | Mapped to | Conf | Prov |
|---|---|---|---|---|
| `J0001` | labeled-automation-identity > hidden-personal-identity | disclosed-machine-authorship > undisclosed-authorship | 0.80 | A |
| `J0349` | disclosed-bot-authorship > anonymous-contribution | disclosed-machine-authorship > undisclosed-authorship | 0.80 | RU |
| `J0540` | separated-orientations > merged-orientation | disclosed-machine-authorship > undisclosed-authorship | 0.65 | A |
| `J0456` | protocol-register > conversational-warmth | disclosed-machine-authorship > undisclosed-authorship | 0.60 | A |
| `J0933` | org-authorship-agent-coauthorship > agent-authorship | disclosed-machine-authorship > undisclosed-authorship ⚠ | 0.55 | BP |
| `J0934` | actor-prefixed-branches > topic-only-branches | disclosed-machine-authorship > undisclosed-authorship ⚠ | 0.55 | BP |

## correction-aggressiveness — 6 judgments

**`silent-normalisation`  ⇄  `hold-and-confirm`**

whether a detected nonconformity is rewritten automatically, or held and surfaced as a question before anything changes

<details><summary>absorbs 9 raw dimension names</summary>

`auditability-of-automatic-fixes` · `causal-fix-point` · `correction-aggressiveness` · `data-normalization` · `effect-of-text-cleanup` · `loop-normalization` · `normalization-scope` · `remediation-cost` · `where-to-apply-a-correction`

</details>

| Judgment | Extractor's original poles | Mapped to | Conf | Prov |
|---|---|---|---|---|
| `J0215` | context-gated-normalization > silent-rewrite | hold-and-confirm > silent-normalisation | 0.90 | A |
| `J0898` | context-gated-normalization > unconditional-normalization | hold-and-confirm > silent-normalisation | 0.85 | A |
| `J0418` | receipted-normalization > silent-normalization | hold-and-confirm > silent-normalisation | 0.65 | BP |
| `J0893` | semantic-absorption > mechanical-rename | hold-and-confirm > silent-normalisation ⚠ | 0.50 | A |
| `J0282` | error-as-observation > error-as-failure | hold-and-confirm > silent-normalisation ⚠ | 0.45 | A |
| `J0284` | child-rule-first > adult-rule-first | hold-and-confirm > silent-normalisation ⚠ | 0.45 | A |

## versioning-granularity — 6 judgments

**`per-record-versioning`  ⇄  `repo-wide-versioning`**

whether each record, schema or module carries its own version, or one version number covers the whole tree

<details><summary>absorbs 11 raw dimension names</summary>

`contract-stability` · `release-discipline` · `schema-consolidation-timing` · `schema-evolution` · `semantic-stability` · `spec-currency` · `version-encoding` · `version-granularity` · `version-promise` · `versioning-granularity` · `versioning-strategy`

</details>

| Judgment | Extractor's original poles | Mapped to | Conf | Prov |
|---|---|---|---|---|
| `J0389` | per-concept-versioning > repo-wide-versioning | per-record-versioning > repo-wide-versioning | 0.90 | RU |
| `J0939` | per-module-version-composition > global-spec-version | per-record-versioning > repo-wide-versioning | 0.85 | BP |
| `J0446` | selective-promotion > uniform-maturity | per-record-versioning > repo-wide-versioning | 0.60 | RU |
| `J0937` | dual-track-versioning > uniform-semver | per-record-versioning > repo-wide-versioning ⚠ | 0.55 | A |
| `J0938` | unreleased-accumulation > cut-releases | per-record-versioning > repo-wide-versioning ⚠ | 0.40 | BP |
| `J1238` | stable-aggregate-boundary > all-inclusive-aggregate | per-record-versioning > repo-wide-versioning ⚠ | 0.40 | A |

## agent-activation-default — 6 judgments

**`active-on-create`  ⇄  `dormant-until-activated`**

whether a newly created agent or bot can act as soon as it exists, or sleeps until something separately activates it

<details><summary>absorbs 10 raw dimension names</summary>

`agent-activation-default` · `agent-context-window` · `agent-individuation` · `agent-lifecycle-default` · `agent-modelling` · `bot-inheritance` · `delegation-default` · `inference-capability-default` · `pause-authority` · `spawn-default`

</details>

| Judgment | Extractor's original poles | Mapped to | Conf | Prov |
|---|---|---|---|---|
| `J0123` | sleeping-by-default > active-on-create | dormant-until-activated > active-on-create | 0.95 | RU |
| `J0260` | sleeping-default > active-default | dormant-until-activated > active-on-create | 0.95 | RU |
| `J0863` | dormant-bot > active-on-create | dormant-until-activated > active-on-create | 0.95 | RU |
| `J0063` | inert-default > active-default | dormant-until-activated > active-on-create | 0.90 | RU |
| `J1101` | zero-grant-default > inherited-authority | dormant-until-activated > active-on-create | 0.90 | BP |
| `J0963` | separate-activation-event > ratification-cascade | dormant-until-activated > active-on-create | 0.75 | A |

## organising-surface — 5 judgments

**`plain-filesystem`  ⇄  `rendered-application`**

whether folders and files are the interface, or a rendered UI, dashboard or app is

<details><summary>absorbs 11 raw dimension names</summary>

`authoring-surface` · `discoverability` · `interaction-form` · `interface-mode` · `interface-stance` · `interface-substrate` · `navigation-design` · `operation-surfacing` · `organising-surface` · `surface-role-split` · `which-primitives-get-a-human-surface`

</details>

| Judgment | Extractor's original poles | Mapped to | Conf | Prov |
|---|---|---|---|---|
| `J0205` | folders > dashboards | plain-filesystem > rendered-application | 0.90 | A |
| `J0977` | folders > required-ui | plain-filesystem > rendered-application | 0.90 | A |
| `J1038` | folders > dashboards | plain-filesystem > rendered-application | 0.90 | A |
| `J0689` | file-tree-interface > application-ui | plain-filesystem > rendered-application | 0.85 | A |
| `J0560` | plain-text-root > application-root | plain-filesystem > rendered-application | 0.75 | A |

## schema-strictness — 4 judgments

**`closed-world-schema`  ⇄  `open-extensible-schema`**

whether a schema rejects everything it does not name, or tolerates unknown keys for forward compatibility

<details><summary>absorbs 10 raw dimension names</summary>

`completeness-vs-validity` · `schema-closure` · `schema-conformance-vs-expressive-convenience` · `schema-specialization` · `schema-strictness` · `schema-unification` · `schema-uniformity` · `serialization-consistency-vs-schema-fit` · `strictness-vs-extensibility` · `timestamp-strictness`

</details>

| Judgment | Extractor's original poles | Mapped to | Conf | Prov |
|---|---|---|---|---|
| `J1061` | closed-world > open-extensibility | closed-world-schema > open-extensible-schema | 0.95 | BP |
| `J1138` | closed-world-schema > open-extensibility | closed-world-schema > open-extensible-schema | 0.95 | RU |
| `J1112` | opaque-payload > typed-payload | open-extensible-schema > closed-world-schema | 0.70 | RU |
| `J1208` | strict-utc-instants > permissive-iso-datetime | closed-world-schema > open-extensible-schema ⚠ | 0.50 | BP |

## extension-discipline — 4 judgments

**`namespaced-bounded-extension`  ⇄  `free-key-extension`**

whether extension points must be namespaced and bounded, or records may add arbitrary keys wherever they like

<details><summary>absorbs 7 raw dimension names</summary>

`extension-discipline` · `extension-policy` · `file-header-convention` · `metadata-burden` · `metadata-discipline` · `metadata-standardization` · `namespace-shape`

</details>

| Judgment | Extractor's original poles | Mapped to | Conf | Prov |
|---|---|---|---|---|
| `J1062` | namespaced-extension > free-key-extension | namespaced-bounded-extension > free-key-extension | 0.95 | A |
| `J0826` | bounded-extensibility > open-extensibility | namespaced-bounded-extension > free-key-extension | 0.80 | A |
| `J1063` | loose-key-namespace > reverse-dns-namespace | free-key-extension > namespaced-bounded-extension | 0.80 | RU |
| `J1206` | closed-core-namespaced-extensions > open-additional-properties | namespaced-bounded-extension > free-key-extension | 0.60 | BP |

## credit-reach — 3 judgments

**`full-lineage-credit`  ⇄  `bounded-self-credit`**

how far back credit is carried: every upstream influence named, or credit stopped at the immediate author

<details><summary>absorbs 13 raw dimension names</summary>

`adult-role` · `agency-attribution` · `agency-representation` · `agenthood-attribution` · `attribution-to-others` · `credit-boundary` · `frame-accountability` · `other-minds-attribution` · `ownership-attribution` · `ownership-entity` · `participant-model` · `role-allocation` · `whose-actions-are-material`

</details>

| Judgment | Extractor's original poles | Mapped to | Conf | Prov |
|---|---|---|---|---|
| `J0663` | attribution-first > unattributed-extension | full-lineage-credit > bounded-self-credit | 0.70 | A |
| `J0195` | single-name-credit > full-lineage-credit | bounded-self-credit > full-lineage-credit ⚠ | 0.55 | BP |
| `J0412` | service-as-participant > service-as-tool | full-lineage-credit > bounded-self-credit ⚠ | 0.50 | RU |

## source-admissibility — 2 judgments

**`repo-internal-source`  ⇄  `outside-source-admitted`**

whether only material already inside the tree may be cited as backing, or outside artifacts and services count

<details><summary>absorbs 9 raw dimension names</summary>

`admissible-material` · `citation-admission-bar` · `evidence-selection` · `evidence-type` · `learning-material` · `reference-anchoring` · `role-of-retrieval` · `source-scrutiny` · `source-selection`

</details>

| Judgment | Extractor's original poles | Mapped to | Conf | Prov |
|---|---|---|---|---|
| `J0766` | internal-provenance > external-citation | repo-internal-source > outside-source-admitted | 0.65 | RU |
| `J0352` | external-artifact-source > yawn-only-source | outside-source-admitted > repo-internal-source ⚠ | 0.50 | RU |

---

## UNMAPPED — 38 judgments that fit no canonical axis

These were left out of the preference graph rather than forced onto an approximate axis. They still
appear in `JUDGMENTS.md`; they just cannot participate in cycle detection.

| Judgment | Original poles | Where |
|---|---|---|
| `J0069` | curated-trending > api-query | `automation/yawn.bot.rising-radar.yawn:sources` |
| `J0103` | partial-causal-order > total-global-order | `core/turn.yawn:causality.total_global_order_required` |
| `J0237` | consequence-priority > effort-priority | `core/inquiry-selection.yawn:selection_passes` |
| `J0275` | first-class-desire > precursor-desire | `core/motivation-and-purpose.yawn:desire.first_class` |
| `J0276` | worked-example > abstract-contract | `core/objective-holon.yawn:links` |
| `J0280` | short-play > long-drill | `dave/number-sense/model.yawn:assumptions` |
| `J0281` | household-objects > printed-worksheets | `dave/prenumerical-thinking/model.yawn:assumptions` |
| `J0422` | maintain-objective > attain-objective | `examples/dave-good-dad-objective-holon.yawn:ratified_objective.mode` |
| `J0513` | scope-first-order > gate-first-order | `question-packets/orientation-nine.yawn:questions` |
| `J0563` | embodied-scope > informational-scope | `observations/lived-agency.yawn:interfaces_in_scope` |
| `J0570` | lacuna-reduction-priority > decision-impact-priority | `q-space/protocol-v1.yawn:frontier_score` |
| `J0571` | permission-risk-primacy > cost-primacy | `q-space/protocol-v1.yawn:frontier_score` |
| `J0646` | manual-replay-evidence > scheduled-run-evidence | `records/yawn.bot-verification-2026-07-01.yawn:run_context` |
| `J0694` | mit-permissive > restrictive-license | `references/ownership-and-license.yawn:license` |
| `J0695` | corporate-copyright > individual-copyright | `references/ownership-and-license.yawn:copyright_holder` |
| `J0706` | personal-authorship > corporate-byline | `references/interception.yawn:principal` |
| `J0720` | public-facing-output > internal-reference-store | `references/node.yawn:receives` |
| `J0726` | product-anchored-research > theory-anchored-research | `references/interception.yawn:connections` |
| `J0887` | forward-effect-record > terminal-log | `templates/access-record.yawn:next_move_effect` |
| `J0888` | expected-signal > falsifier | `templates/proof-receipt.yawn:expected_signal` |
| `J0897` | semantic-folder-names > numbered-folder-prefixes | `migrations/2026-08-17-canonical-extension.yawn:scope.legacy_roots_retired` |
| `J0899` | replacement-count > rule-group-count | `tests/canonical-extension-v1.test.mjs` |
| `J0926` | extension-as-repo-identity > product-name-as-repo-identity | `yawn.yawn:title` |
| `J0928` | brand-fidelity-in-paths > path-safe-sanitization | `automation/yawn.bot.daily.yawn` |
| `J0929` | subject-first-filenames > date-first-filenames | `records/cold-start-proof-2026-07-11.yawn` |
| `J0931` | corporate-copyright-holder > individual-copyright-holder | `references/ownership-and-license.yawn:copyright_holder` |
| `J0946` | person-namespace > concept-only-namespace | `dave/node.yawn` |
| `J0951` | source-only-history > generated-artifacts-tracked | `templates/proof-receipt.yawn` |
| `J1007` | immediate-safety > authority-consent | `core/inquiry-selection.yawn:selection_passes.hard_gates.priority` |
| `J1008` | immediate-safety > proof-integrity | `core/inquiry-selection.yawn:selection_passes.hard_gates.priority` |
| `J1009` | privacy-egress > provenance-integrity | `core/inquiry-selection.yawn:selection_passes.hard_gates.priority` |
| `J1010` | movement-criticality > relationship-primacy | `core/inquiry-selection.yawn:selection_passes.semantic_priority.priority` |
| `J1011` | information-value > proof-gap | `core/inquiry-selection.yawn:selection_passes.semantic_priority.priority` |
| `J1014` | accessibility-requirement > accepted-order-preference | `core/inquiry-selection.yawn:selection_passes.interaction_fit.considerations` |
| `J1030` | signal-first > orient-first | `yawn.yawn:root_loop` |
| `J1031` | orient-first > signal-first | `core/co-orientation-loop.yawn:loop` |
| `J1046` | style-review > build-validation | `automation/yawn.ai.funnel-bridge.yawn:loop` |
| `J1070` | null-gate-always > gate-linked-exclusion | `schemas/inquiry-selection-receipt.v0.1.schema.json:$defs.Exclusion.properties.reasonCode.enum` |

---

**Provenance key** — `A` authored (written down as a preference; the author's). 
`BP` behaviour-proven (the extraction's reading, but a test, validator or recorded outcome confirms 
the behaviour — the behaviour is established, the intent is not attributed). 
`RU` reading-unconfirmed (the extraction's inference only; **not** the author's judgment).
