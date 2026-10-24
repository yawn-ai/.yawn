# Runtime Profile

Status: **Working Draft 0.1**

Profile: `yawn.runtime-profile.v0.1`

Design proposal: [RFC 0006](../rfcs/0006-runtime-profile-v0.1.md)

A runtime profile is portable, declarative configuration for one Yawn. It can
describe model instructions, versioned skills, capability requirements,
adopted rules, execution limits, verification, privacy, and provenance. A host
derives effective configuration from an explicit primary-parent chain.

Configuration is separate from effect authority. A resolved profile neither
grants permission nor proves that an action occurred or succeeded. Current
grants, capability admission, dispatch, receipts, and outcome proof remain
separate contracts.

This is an additive experiment, not the universal schema for all `.yawn`
documents. Existing v1 contracts and Agency Holarchy 0.2 remain unchanged.

The additive [Runtime Action host contract](runtime-host-contract.md) provides
two-stage structural/action resolution, separate identities, dynamic host
checks, private disclosure and golden conformance. It preserves this 0.1
grammar and the existing all-or-nothing resolver as a compatibility baseline.

## Implementation boundary

The repository provides a [JSON Schema](../schemas/runtime-profile.v0.1.schema.json),
[fixtures](../fixtures/runtime-profile.v0.1.json), and a
[reference resolver](../lib/runtime-profile-v0.1.mjs) and
[rule-event reducer](../lib/runtime-rule-events-v0.1.mjs). The implementation
parses the supported data subset, validates the profile, normalizes supported
ancestry forms, computes semantic hashes, checks lifecycle transitions, and
resolves effective configuration. It calls host-supplied trust checks and
returns `resolved` or `held` with issues and dependencies.

The resolver does not execute handlers or tools. The repository does not ship a
runtime-profile execution adapter, a trusted skill registry, an adoption-event
store, or a final dispatch fence. It does not claim live YAWN.bot integration.
Passing reference tests establishes only the behavior those tests exercise.

A host must independently:

- authenticate profiles and resolve stable IDs without substituting a path or
  title for identity;
- verify adoption references against authorized, current event history;
- verify skill content, versions, digests, and trust policy;
- bind recognized semantic handlers and capabilities to trusted registries;
- enforce applicable boundaries, limits, verification, and privacy;
- filter model context and participant explanations to permitted information;
- recheck current grants, rule/configuration revisions, and cancellation at
  final dispatch admission; and
- record exact configuration and applicability dependencies with execution
  receipts, then evaluate consequences through separate evidence and proof.

## Minimal profile

```yaml
record_shape: spec-version
spec_version: yawn.runtime-profile.v0.1
kind: yawn
id: yawn:shop
revision: 1
primary_parent_id: null
runtime: {}
provenance:
  source_refs: [source:shop]
```

`id` names the Yawn. `revision` is its optimistic concurrency revision.
`primary_parent_id` is a stable parent ID or `null` for an explicit root. It is
never inferred from filenames, slash addresses, arena nesting, URLs, lateral
links, or similarity. The optional `record_shape` marker helps document
discovery; `spec_version` selects the schema and semantics.

See the [commented template](../templates/runtime-profile.yawn) for authoring
and the fixtures for a three-level scheduling example. The schema is the
source for exact required fields and enums.

## Configuration sections

| Section | Meaning | Authority boundary |
| --- | --- | --- |
| `runtime.instructions` | Attributed model instructions | Advice to the model; never a grant or executable handler |
| `runtime.skills` | Versioned, digest-pinned Agent Skill references, activation, trust, and capability requirements | Availability does not authorize use or prove trust |
| `runtime.capabilities` | Stable capability IDs and MCP/function registry bindings | Host binding and current grants remain required |
| `runtime.rules` | Typed, scoped, versioned rule declarations and lifecycle state | Only adopted, host-verified rules may govern |
| `runtime.execution` | Compatible numeric upper limits and stop semantics | Host must enforce counters, time, cancellation, and final admission |
| `runtime.verification` | Required checks with enforcement modes | A declared check is not a successful check |
| `runtime.privacy` | Permitted model context, default-deny egress, and no inline secrets | Host must apply disclosure policy to every consumer |
| `provenance` | Source references behind configuration | Attribution is not authority |
| `lateral_relations` | Related records useful for evidence or coordination | Never an additional governing ancestry path |

Skills identify an Agent Skill bundle with a source reference, semantic
version, and SHA-256 digest. `auto`, `manual`, and `disabled` activation are
configuration choices. A `reviewed` or `local` trust label in an imported
document is a claim to verify, not a host trust decision. Enabled skills need
the host's explicit verification before resolution succeeds.

Capability bindings are declarative MCP tool or registered function
descriptors. A function handler name cannot cause a module import; an MCP
server reference cannot cause a connection. Each binding requires
`current_grant_required`. Capability identity and effect classification come
from the host registry, not from model output or a tool's self-description.
The resolver requires strict `true` from the synchronous host callback
`verifyCapability(capability, profile)` for each effective capability. The
callback must verify its ID, effect, and complete binding. This verifies a
configuration reference, not permission to invoke it. Trust callbacks receive
frozen data snapshots.

Privacy 0.1 intentionally defines only restrictive settings: model context is
`permitted_only`, egress defaults to `deny`, and inline secrets are `forbidden`.
Those declarations are not an access-control implementation. Keep secret
values outside portable configuration and provide authorized handles through
the host.

Execution limits use integer counts for model calls, retries, and concurrency;
`max_paid_cost_microusd` uses millionths of one US dollar, and `timeout_ms` uses
milliseconds. Calls, retries, and cost can be zero. Concurrency and timeout,
when present, must be positive. Omitted limits do not imply an unlimited grant;
the host still applies its own operational and authorization limits.

## Rule lifecycle and adoption

A rule has a stable ID, revision, type, state, statement, scope, enforcement
mode, and source references. An adopted rule also references its adoption
event. `source_refs` locate supporting material; `adoption_ref` identifies an
authority claim that the host must verify. Neither is verified by the mere
presence of a string.

```text
propose → adopt → supersede
               → retire
```

`proposed` rules do not govern. Adoption requires an authorized event and an
expected revision/configuration identity. Supersession preserves the prior
rule and identifies its replacement; retirement ends applicability without
erasing history. Superseded and retired rules MUST NOT reappear as governing
configuration through a legacy selector or evidence link.

Lifecycle mutations use an expected rule revision; adoption and supersession
also bind the reviewed meaning and scope hashes. A stale expected value MUST
be rejected. Concurrent amendments cannot be resolved by
sorting event IDs and silently choosing authority. Hosts must commit an
authorized event and its resulting state atomically according to their own
storage contract; pure lifecycle validation does not supply that transaction.

The [reference `reduceRuleEvents(events, { authorize })` reducer](../lib/runtime-rule-events-v0.1.mjs) consumes
`propose_rule`, `adopt_rule`, `supersede_rule`, and `retire_rule` events in
supplied causal order. It preserves history and current retired tombstones.
Adoption and supersession create an adoption reference from the authorized
event ID. Supersession installs a new revision of the same rule ID while
preserving the prior revision in history. The synchronous host authorization
callback must return strict `true` for governing changes. Any replay error
holds the result and returns no usable current rules.

`ruleMeaningHash(rule)` covers the type, statement, and enforcement including
handler parameters. `ruleScopeHash(rule)` covers descendant applicability and
the sorted action set. These review hashes differ from a full profile hash.
The reducer preserves event input order rather than sorting IDs. Invalid event
collections throw `RuleEventError`; malformed or unauthorized event records
produce a held replay with errors. Retired identities cannot be reproposed.

The reference resolver requires strict `true` from the host's
`verifyAdoption(rule, profile)` callback for every effective adopted rule. A
schema-valid adopted state alone is insufficient. A source document,
conversation answer, inferred norm, instruction, or model recommendation MUST
NOT become a governing rule without an explicit adoption process.

## Composition along explicit ancestry

Resolution follows the root-to-target primary-parent chain. Missing parents,
cycles, contradictory identities, invalid profiles, unverified adopted rules,
unverified enabled skills or capability bindings, and unsupported governing
handlers produce `held`.
A host MUST NOT treat a partial result as complete governing context.

| Configuration | Composition in 0.1 |
| --- | --- |
| Model instructions | Retain ordered instructions and origin provenance |
| Default rules | Nearest applicable adopted value for the same rule ID, type, and action scope |
| Boundaries | Accumulate every applicable adopted boundary |
| Permission requirements | Accumulate applicable requirements; create no grants |
| Verification requirements | Accumulate applicable required checks |
| Preferences | Nearest applicable adopted value for the same rule ID, type, and action scope, as model guidance |
| Skills | Nearest configuration for each stable skill ID; local disablement is explicit |
| Capabilities | Preserve stable bindings; a conflicting binding for the same ID holds resolution |
| Compatible numeric upper limits | Minimum of the declared limits with the same unit and meaning |
| Privacy | Preserve the profile's restrictive settings; no implicit widening |
| Lateral relations | Evidence/coordination only; no rule inheritance |

Scope determines whether a rule applies to descendants and which action kinds
it addresses. Hosts must evaluate action applicability at admission; a
configuration containing a rule is not proof that every action has been
checked against it. Ancestor dependencies must include relevant empty rule
scopes so that adding a new boundary can invalidate an earlier decision.

A child cannot relax a parent boundary by declaring a same-named default or
preference. A higher local execution budget cannot raise a lower inherited
budget. A child skill may require more capability, but that requirement
creates no permission. Lateral evidence can change a recommendation without
becoming governing configuration.

Same-ID adopted rules with incompatible composition types hold resolution.
Default and preference specialization must retain the same action set
(independent of its order), or resolution is held. The local declaration may
change whether it applies to further descendants; that does not silently
change the inherited rule's action scope or remove an inherited requirement.

## Enforcement modes

Each rule or verification check declares the nature of enforcement:

| Mode | Meaning |
| --- | --- |
| `code` | A recognized, versioned semantic handler is required |
| `model` | Guidance supplied to the model; not deterministic enforcement |
| `human` | An attributed review requirement for the host to obtain |
| `evidence` | Evidence-only context; not an executable guard |

Unknown code handlers MUST hold dependent configuration. They MUST NOT fall
back to model advice or be advertised as enforced. Listing a handler in
`supportedHandlers` asserts that the host recognizes it; the reference
resolver does not implement or execute that handler. A host claiming code
enforcement needs a failing-case test through its actual admission path.
Handler parameters and skill configuration remain JSON data; a trusted host
must validate them against the recognized version's parameter contract before
using them.

Human review cannot be replaced by an unrecorded model judgment. Evidence
cannot create permission. A successfully resolved model instruction cannot
redirect the grant target, dispatch destination, principal, or applicable
boundaries.

## Revisions, dependencies, and final admission

Semantic profile hashes use the reference canonical JSON procedure. Formatting,
comments, and mapping-key order do not change semantic identity; operational
field changes do. Ordered arrays retain their meaning and order. The reference
conservatively hashes every accepted data field, including titles, provenance,
and revisions; this can invalidate more decisions than a narrower operational
projection would. The effective semantic revision incorporates configuration
and ancestry dependencies rather than relying on a display title alone.

The resolver returns configuration with origin provenance, a semantic revision,
and dependencies for the consulted profiles. Hosts must bind a recommendation
or proposed move to this identity and retain decision-specific applicability
dependencies. If a relevant revision, grant, rule, skill digest, or binding
changes before dispatch, the host must reconsider the proposal.

`fenced_admission` describes a host obligation: check current authority and
relevant revisions within the protected operation that admits an effect. A
prior resolver call, approval screen, or model recommendation is not that
fence. A stop received after admission may request cancellation where the
adapter supports it; it cannot prove that an external effect was undone.

The effective configuration may contain private governing material. A host
must enforce it while projecting only permitted explanations and model
context. The reference result is internal configuration, not a safe public
Rules view.

## Compatibility and migration

Runtime Profile 0.1 uses `primary_parent_id`. Migration is selected explicitly
by source version:

| Source version | Recognized source ancestry |
| --- | --- |
| `agency-holarchy.v0.2` | `primaryParentYawnRef` |
| Human `0.2-draft` | `primary_parent_yawn_ref` or `context.primary_parent_yawn_ref` |
| `yawn.app-legacy.v0` | `primary_parent`, `parent_coordinate`, or their forms under `context` |

The helper normalizes ancestry, not an entire legacy document. A caller still
constructs and validates the new profile and preserves migration provenance.
Conflicting representations are errors. Equivalent supplied values may
normalize with a warning; output uses only `primary_parent_id`. Unsupported
source versions are errors. There is no unversioned, ever-growing alias list.

A coordinate may be migrated only after the host establishes its stable
identity; the adapter accepts a `yawn:` identity and does not discover a parent
from a route. Root aliases support an explicitly extracted source object; they
do not authorize recursively searching arbitrary input. The `protocol_context`
field in the legacy full template and `yawn` object in the Objective Holon
module require explicit extraction into the declared source grammar.
Historical schemas, templates, and executable behavior retain their versioned
spellings.

## Conformance and next proof

Run the [developer checks](../docs/development.md) and inspect the fixtures.
Reference conformance covers supported parsing, validation, ancestry conflict
rejection, lifecycle checks, hashes, and deterministic composition. It does
not establish universal policy evaluation, authenticated registry binding,
multi-principal privacy, concurrency in a host event store, or safe external
execution.

The next integration proof is one real host adapter: adopt a scoped rule,
resolve a scheduling child, preserve a parent customer-contact boundary,
change the configuration or revoke permission after recommendation, and
demonstrate that fenced admission prevents dispatch. Record the exact
configuration identity and separate artifact completion, delivery, and outcome
evidence. Until that exists, those claims remain host obligations.
