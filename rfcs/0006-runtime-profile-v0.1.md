# RFC 0006: Runtime Profile 0.1

- Status: proposed; additive reference implementation
- Date: 2026-10-24
- Authors: AI-assisted engineering contribution for maintainer review
- Decision authority: founding maintainer

## Summary

Add the opt-in `yawn.runtime-profile.v0.1` schema and a reference resolver for
portable Yawn configuration. The profile declares instructions, versioned
skills, capability requirements, adopted rules, execution limits, verification,
privacy, and provenance. Resolution follows explicit primary-parent ancestry.

The proposal preserves three distinct contracts: configuration describes how
the Yawn works; current runtime grants authorize effects; events, receipts,
observations, and proof record what happened and what is supported. A resolved
configuration never creates permission.

## Current state and lacuna

Stable v1 modules preserve authority and evidence boundaries. Agency Holarchy
0.2 models explicit parentage; human templates use additional historical
ancestry spellings. No existing module provides one portable runtime
configuration profile or shared rule-composition procedure. Reading a norm,
linking evidence, or loading a skill can otherwise be mistaken for adoption
or effect authority.

This RFC supplies a bounded protocol/reference slice. It does not implement
the separate YAWN.bot application, change its protocol pins, or claim a live
execution integration.

## Proposed semantics and invariants

The [Runtime Profile specification](../spec/runtime-profile.md) defines the
complete draft behavior:

1. New profiles use `primary_parent_id`; ancestry is explicit and acyclic.
2. Only adopted rules verified by the host may govern. Proposed, superseded,
   and retired rules remain inspectable history.
3. Defaults specialize at the nearest applicable descendant with the same ID,
   type, and action scope; incompatible types or scopes hold resolution.
   Boundaries and requirements accumulate; compatible numeric upper limits
   take the minimum.
4. Lateral relations contribute permitted evidence or coordination, never
   implicit governance.
5. Skills are versioned and digest-pinned. Availability and required
   capabilities create no grants.
6. Code enforcement requires a recognized semantic handler. Unknown handlers
   hold resolution rather than silently becoming model guidance.
7. Source documents, answered norms, tool metadata, and model output cannot
   adopt rules or rewrite authority.
8. Lifecycle changes use expected revisions, with adoption and supersession
   bound to reviewed meaning and scope hashes; stale amendments fail rather
   than selecting authority by event-ID ordering.
9. The host must fence current grants and configuration identity at final
   dispatch admission and preserve exact dependencies in receipts.

The reference implementation covers parsing, validation, migration, lifecycle
checks, hashing, and composition. Host callbacks are trust boundaries; they
are not authenticated event stores or skill registries supplied by this RFC.

## Alternatives and counterexamples

| Alternative | Reason not chosen |
| --- | --- |
| Arbitrary YAML commands or dynamic module imports | Portable data must not become an implicit execution path |
| Treat a source norm or model instruction as an adopted rule | Relevance and interpretation cannot substitute for governance |
| Resolve every link as inheritance | Lateral evidence does not establish a coordinating authority path |
| Let the child overwrite every parent field | Boundaries and budgets have different composition rules from defaults |
| Create grants from skill requirements or tool metadata | Capability requirements describe a need, not a grantor's decision |
| Rewrite Agency Holarchy 0.2 in place | Existing executable contracts need versioned compatibility |
| Claim a complete policy engine now | The reference has no execution adapter, authenticated registry, or dispatch fence |

## Authority, privacy, safety, and human agency

Adoption requires an authorized process external to imported configuration.
The reference resolver demands positive host verification of effective
adoption, enabled skill references, and every effective capability's ID,
effect, and complete binding. The host maintains trusted capability
registries, enforces supported predicates, obtains required human review, and
checks current grants at admission.

Private governing configuration can constrain behavior without being visible
to every participant. Hosts must separately project permitted model context
and explanations. Inline secrets are forbidden by the profile. Source text
remains attributed data even when it contains instructions to act.

No profile can authorize its own adoption or its own effects. No receipt can
prove success merely by recording an attempt.

## Compatibility and migration

The change is additive and opt-in. It does not replace v1 or existing draft
schemas. Versioned ancestry migration recognizes Agency Holarchy 0.2's
`primaryParentYawnRef`, human `0.2-draft`'s `primary_parent_yawn_ref` at root or
under `context`, and `yawn.app-legacy.v0`'s `primary_parent` / `parent_coordinate`
at root or under `context`. Conflicting parent
representations fail. Equivalent aliases may produce a warning and one
canonical output field. Unsupported source versions fail.

Migration normalizes explicit ancestry only. A host must supply verified
stable identity, extract nested historical fields deliberately, construct a
new profile, and preserve provenance. The legacy full and Objective Holon
templates keep their declared shapes with migration notes.

## Schemas, examples, and conformance tests

- [Runtime-profile schema](../schemas/runtime-profile.v0.1.schema.json)
- [Scheduling hierarchy fixture](../fixtures/runtime-profile.v0.1.json)
- [Runtime-profile template](../templates/runtime-profile.yawn)
- [Reference implementation](../lib/runtime-profile-v0.1.mjs)
- [Rule lifecycle reducer](../lib/runtime-rule-events-v0.1.mjs)
- [Developer checks and integration boundary](../docs/development.md)

Acceptance evidence should cover duplicate/unsafe parser inputs, conflicting
aliases, missing/cyclic ancestry, proposed and retired rules, unsupported
handlers, unverified adoption and skills, conflicting bindings, boundary and
budget composition, stable semantic hashes, and stale lifecycle revisions.
Tests must also demonstrate that resolved configuration never returns a grant.

## Evidence, open questions, and falsifiers

This proposal was informed by the maintainer-provided engineering brief
“`.yawn` as the Authoritative Portable Configuration for Yawn Skills and Runtime
Behavior.” Its research snapshots and application claims are design input,
not independently verified runtime evidence or authority to alter another
repository.

Open work includes authenticated adoption-store integration, host registry
binding, decision-specific applicability, private explanation projection,
multi-principal authority, and one real fenced execution adapter. A host that
can dispatch after relevant revocation, import governance through lateral
evidence, or claim unsupported handlers as enforced fails the intended
integration contract even if its input validates.

Field use may show that the current rule types, scope grammar, or composition
operators are insufficient. That should trigger versioned revision, not an
unannounced expansion into a universal policy language.

## Decision and implementation receipt

The RFC remains proposed. Merging reference artifacts makes the draft
available for experiments; it does not ratify a stable universal format or
certify any consuming application. Maintainer acceptance and host integration
evidence must be recorded separately with the relevant commit and tests.
