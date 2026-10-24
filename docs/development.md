# Build with Runtime Profile 0.1

Runtime Profile 0.1 is an opt-in Working Draft with a pure reference resolver.
Use it to experiment with explicit ancestry and inspectable configuration.
Its output is an internal configuration result; executing effects still needs
a host admission path.

For action-specific integration, use the additive
[Runtime Action host contract](../spec/runtime-host-contract.md) and
[host integration guide](runtime-host-integration.md). The original 0.1
interfaces below remain unchanged. `npm run test:runtime-action` compares the
committed language-neutral golden outputs, issues and digests offline.

## Install and check the repository

Use Node.js 22 or a current Node.js LTS release:

```bash
git clone https://github.com/yawn-ai/.yawn.git yawn-protocol
cd yawn-protocol
npm ci
npm test
```

The stable contracts package has its own checks:

```bash
cd contracts
npm ci
npm run check
```

The root suite includes the profile's reference checks. See
[`package.json`](../package.json) for exact scripts and
[`tests/`](../tests/) for the behavior under test. Local results apply to the
tested commit; hosted CI and consuming applications are separate evidence.

For the runtime-profile data and schema check alone:

```bash
npm run validate:runtime-profile
npm run validate:runtime-profile -- path/to/profile.yawn
```

With no path, this checks the fixture profiles and authoring template. Pass a
path to check your own profile. The command runs
[`scripts/validate-runtime-profile-v0.1.mjs`](../scripts/validate-runtime-profile-v0.1.mjs);
it establishes supported data syntax and shape, not adoption, trust, authority,
effective resolution, or execution.

## Start with one profile

Copy [`templates/runtime-profile.yawn`](../templates/runtime-profile.yawn) or
read [`fixtures/runtime-profile.v0.1.json`](../fixtures/runtime-profile.v0.1.json).
The latter contains `{ "profiles": [...] }` for a shop, scheduling work, and a
draft task. Each element validates against the
[single-profile schema](../schemas/runtime-profile.v0.1.schema.json).

```js
import { readFile } from "node:fs/promises";
import {
  parseRuntimeProfile,
  resolveRuntimeConfig,
  semanticProfileHash,
} from "./lib/runtime-profile-v0.1.mjs";

const profile = parseRuntimeProfile(
  await readFile("templates/runtime-profile.yawn", "utf8"),
);
console.log(semanticProfileHash(profile));

const result = resolveRuntimeConfig(profile.id, [profile], {
  supportedHandlers: [],
  verifyAdoption: () => false,
  verifySkill: () => false,
  verifyCapability: () => false,
});
console.log(result.status, result.issues);
```

This template contains proposed guidance and no adopted rule or enabled skill.
For real adopted rules, `verifyAdoption(rule, profile)` must check the host's
authorized event history and return strict `true`. Enabled skills similarly
need strict `true` from `verifySkill(skill, profile)` after registry, version,
digest, and trust checks. Do not replace these checks with acceptance of a
string reference or trust label from the input.

Every effective capability also needs strict `true` from
`verifyCapability(capability, profile)`, after the host verifies the stable
capability ID, effect classification, and complete binding against its trusted
registry. Verifying a capability binding does not grant use of that capability.
The resolver passes frozen data snapshots to trust callbacks.

`parseRuntimeProfile` supports a conservative data subset rather than all
YAML. Canonical JSON is also accepted. Unsupported syntax and duplicate keys
must fail, and neither parsing path executes content. See
[serialization](../spec/serialization.md) before introducing another parser.

## Resolve the scheduling hierarchy

Load all fixture profiles, choose the draft task's stable ID, and pass those
profiles to `resolveRuntimeConfig`. Supply the host's verified adoption and
skill checks, capability-registry verification, and its explicit list of
supported semantic handler IDs.
`supportedHandlers` declares host support; it does not load handler code.

The result has `status`, `issues`, `config`, `semantic_revision`, and
`dependencies`. Continue only when `status === "resolved"`. Even then, use the
configuration as an input to admission; the resolver returns no grant and
dispatches nothing.

Inspect origin provenance when explaining inherited defaults, boundaries, or
skills. Filter explanations and model context through the host's disclosure
policy before sharing them. A raw resolver result is not a public Rules view.

## Migrate one declared source grammar

`normalizePrimaryParent(record, { sourceVersion })` requires an explicit
source version. It accepts only the ancestry forms listed in the
[migration contract](../spec/runtime-profile.md#compatibility-and-migration).
Conflicting representations fail. This helper does not convert a whole
Agency Holarchy document, map titles to stable IDs, or authenticate parentage.

Extract historical nested fields deliberately, preserve the original source,
construct the new profile, and validate it before resolving. Do not silently
rewrite old executable schemas or reinterpret paths as parent IDs.

## Replay rule lifecycle events

[`lib/runtime-rule-events-v0.1.mjs`](../lib/runtime-rule-events-v0.1.mjs) exports
`reduceRuleEvents`, `ruleMeaningHash`, `ruleScopeHash`, and `RuleEventError`.
Submit events in causal order. Adoption and supersession need the expected
rule revision and the hashes of the exact operational meaning and scope that
were reviewed. Governing changes need synchronous strict `true` from the
host's `authorize({ event, rule, replacement })` callback; the `authorized_by`
string is attribution, not proof of authority.

The result contains `status`, `rules`, `history`, and `errors`. On replay
errors, `status` is `held` and `rules` is empty; retain history for inspection
and do not use a partial replay as governance. An invalid event collection
throws `RuleEventError`. The reducer does not supply an event store or atomic
concurrency control. See the [lifecycle specification](../spec/runtime-profile.md#rule-lifecycle-and-adoption)
and [tests](../tests/runtime-rule-events-v0.1.test.mjs) before binding it to a
host's authorized transaction path.

## Connect a host carefully

Classify every field as model guidance, code enforcement, human review, or
evidence. A claim of code enforcement needs a failing-case test through the
host's actual handler and admission path. The reference resolver checks
recognition; it does not run predicates.

The host owns authenticated event history, trusted skill and capability
registries, permitted-context projection, required review, privacy, current
grants, and budget accounting. Its final dispatch fence must reconsider
relevant revisions and revocation after a recommendation has been shown.
Record configuration identity and action-specific dependencies with receipts;
record outcome evidence separately from attempt or delivery.

No runtime-profile execution adapter ships here. Start an integration with one
bounded capability and prove the complete path before describing the host as
enforcing the profile. The [specification](../spec/runtime-profile.md) and
[RFC 0006](../rfcs/0006-runtime-profile-v0.1.md) list the remaining obligations.
