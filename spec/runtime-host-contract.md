# Runtime Action Host Contract

Status: **Experimental host contract 0.1**, additive to Runtime Profile 0.1.

Contract ID: `yawn.runtime-action.v0.1`. The [reference module](../lib/runtime-action-v0.1.mjs)
does not change the existing parser, schema, resolver, or rule lifecycle. In
particular, this document does not introduce Runtime Profile 0.2 fields.

## Two stages

`buildRuntimeIndex(targetId, profiles)` returns `indexed` or `held`. An index
contains the explicit root-to-target ancestry, original profile snapshots,
composed configuration, and revisions. It is structural data, not accepted
governance, authenticated registry state, or permission to run.

Missing parents, cycles, invalid profiles, duplicate identities, incompatible
same-ID rule composition, and conflicting inherited capability bindings MUST
hold structural indexing. Lateral links MUST NOT import governing rules.
Unknown skill, tool, or semantic-handler support is deferred to the action
projection. An unsupported optional email component therefore does not hold
an unrelated comparison action.

`resolveForAction(index, action, host)` validates the index against its source
profiles again and returns `resolved` or `held`. A held result exposes no
usable configuration or action revision. A resolved result is a synchronous
preflight at the supplied host snapshot. It is never dispatch admission.

All input data is bounded to 1 MiB, 50,000 values, depth 64, and at most 100
profile documents. Inputs MUST be ordinary JSON data. Accessors, custom
prototypes, named/sparse arrays, unsafe prototype/merge keys, cycles, and
nonfinite values are rejected before interpretation. The existing individual
profile parser's stricter limits continue to apply when parsing documents.

## Bounded registered programs

An action descriptor has this exact form; `resource_refs` and `input_digest`
are optional:

```json
{
  "id": "action:comparison-1",
  "kind": "movement.compare",
  "program_id": "yawn.movement.compare@1",
  "skill_ids": ["draft-schedule"],
  "capability_ids": [],
  "resource_refs": ["schedule:shop"],
  "input_digest": "sha256:1111111111111111111111111111111111111111111111111111111111111111"
}
```

The host supplies a trusted `programs` registry, never loaded from a profile:

```json
{
  "id": "yawn.movement.compare@1",
  "handler": "yawn.movement.compare@1",
  "actions": ["movement.compare"],
  "skill_ids": ["draft-schedule"],
  "capability_ids": ["research.read"]
}
```

The program names a registered semantic, not a module path or arbitrary
workflow language. Its action kinds and skill/capability sets are allowed
selections. A selected skill's capability requirements are added to the action
and MUST also be allowed by the program. Required procedure steps remain part
of that versioned host handler's contract. There is no shell, dynamic import,
inline executable code, or credential field.

## Normative composition

Let `A(y)` be the explicit root-to-target ancestry. A rule applies to action
`a` only when it is adopted, its adoption is host-verified, its descendant
scope includes the target, and its `actions` set is omitted or includes
`a.kind`. Runtime Profile 0.1 has no validity-window or actor/resource-selector
grammar; hosts MUST NOT pretend those fields already exist.

For each action, hard boundaries, permission requirements, and verification
requirements accumulate over applicable ancestors. A child MUST NOT overwrite
an inherited hard requirement. Defaults and preferences select the nearest
applicable declaration with the same stable ID, type, and compatible action
set. Same-ID type or action-set conflicts retain the existing 0.1 hold behavior.

Numeric upper limits compose by minimum only when their units and meanings
match: integer calls, retries and concurrency; cost in millionths of a US
dollar; timeout in milliseconds. A child cannot raise an inherited limit.
Omitted limits create no spending or execution authority.

Instructions retain their order and provenance. Skills use the nearest
configuration for each stable skill ID, including explicit local disablement.
Only selected enabled skills and their required capabilities enter the action
projection. Profile-level required verification checks remain required for
every action because 0.1 has no check applicability selector.

Privacy 0.1 permits only `permitted_only`, default-deny egress, and forbidden
inline secrets. Inheriting those constants cannot widen disclosure. A future
richer privacy language needs an explicit restrictive meet; it MUST NOT
silently inherit the current assignment implementation as a widening rule.

Hard admission rules with `model` or `evidence` enforcement MUST hold this
bounded host path. Code checks need supported handlers; human checks need an
explicit host evaluation. The host's synchronous `evaluateRule(rule, action)`
must return strict `true`; model confidence cannot satisfy this check.

## Trusted host checks and dynamic dependencies

The host provides `supportedHandlers`, `programs`, and these synchronous checks:

| Callback | Required evidence |
| --- | --- |
| `verifyAdoption(rule, profile)` | Authorized current adoption of this exact rule meaning, scope, revision, event and source profile |
| `verifySkill(skill, profile)` | Exact bundle/version/digest, configuration contract and required trust treatment |
| `verifyCapability(capability, profile)` | Stable capability ID, effect classification and complete trusted provider binding |
| `evaluateRule(rule, action)` | Applicable code predicate or recorded human admission check |
| `checkGrant(action, capabilities)` | Current exact authority for the selected effects, resources, input and principal |
| `checkBudget(action, limits)` | Current compatible host/profile limits and available budget |
| `checkCancellation(action)` | Current noncancelled state |

Checks receive frozen snapshots and must be side-effect-free. Only strict
`true` succeeds. Missing checks, exceptions, promises, and truthy strings hold.
`checkGrant` is required whenever capabilities are selected; budget and
cancellation checks are required for every action.

The host must supply this exact dynamic snapshot:

```json
{
  "grants_revision": "grants:current-snapshot",
  "budget_revision": "budget:current-snapshot",
  "cancellation_epoch": 0
}
```

These values are dependencies, never proof of authority. Copying a grant
revision into a source document cannot satisfy `checkGrant`. A production host
must authenticate these snapshots and check that they are current inside its
final admission transaction. It must additionally bind registry/tool-schema,
principal, resource and any host-specific policy revisions to its admission
receipt. A boolean callback does not implement a registry or event store.

Before an external effect, the host MUST atomically recheck relevant
configuration, current authority, budget and cancellation, reserve the required
resources, and admit the exact registered handler. This repository dispatches
nothing and implements no database fence. A stop after admission requests
cancellation where supported; it cannot prove that an effect was undone.

## Three identities

| Field | Exact reference meaning |
| --- | --- |
| `document_hash` | Canonical hash of the full root-to-target source profile array, including display/provenance data |
| `operational_revision` | Hash of all structurally composed runtime configuration, excluding source attribution and profile-origin concurrency revisions |
| `action_revision` | Hash of the selected program/action, relevant operational configuration, consulted action-rule scopes and dynamic snapshot |

Operational projection removes metadata only at defined record boundaries.
Arbitrary skill configuration and handler parameters are hashed in full, even
when their keys happen to be `title` or `source_refs`. Rule revisions and
adoption references remain operational. Array order remains significant.

A title/source edit can change only the document hash. An unrelated optional
binding can change the operational revision while leaving an action revision
unchanged. A new applicable boundary changes a consulted ancestor's previously
empty rule-scope dependency. Current grant/budget/stop changes affect action
identity even when source profiles are unchanged.

## Disclosure and blockers

Raw indexes and action results contain private governing configuration and
MUST remain internal. `projectRuntimeDisclosure(result, {canDisclose, audience})`
defaults to denying every record. The host must return strict `true` for each
complete record it permits. It can obtain a participant explanation or model
context without weakening the separately enforced private rule. Denied rule
text, IDs and source references do not appear in the projected record arrays.
Held projections expose generic issue codes, not private component IDs.

`describeRuntimeBlockers(results)` reports `no_eligible_action` and possible
amendment/authority/goal/method/hold paths. It always reports `impossible:false`.
Lack of an eligible tested method does not prove a goal impossible.

## Conformance boundary

The [golden corpus](../fixtures/runtime-action-golden.v0.1.json) commits exact
JSON outputs, issue codes and SHA-256 digests. A second host must reproduce
them from the same synthetic trusted snapshots. The
[synthetic fixture adapter](../lib/runtime-action-conformance-v0.1.mjs) is test
support only and MUST NOT be used as a production authority source.

Run `npm run test:runtime-action`. No case contacts a live model, tool, database,
grant service or external recipient. Passing this corpus establishes reference
interoperability for the enumerated cases. It does not prove production host
integration, authentication, privacy policy completeness, concurrent admission,
delivery, or outcome success.
