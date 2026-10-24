# Import an Agent Skill without importing authority

A Skill supplies a reusable method. Runtime Profile 0.1 binds an exact method
to a game, and the host decides whether its required capabilities are currently
usable. Keep the original skill artifact and provenance; `.yawn` is a control
manifest, not a replacement archive for every script or resource.

1. Give the reviewed bundle a stable `skill:` reference, exact version and
   complete SHA-256 digest. Do not use `latest`, a branch name or an abbreviated
   digest as an immutable bundle pin.
2. Add the existing 0.1 `source`, `activation`, `trust`, `config` and
   `capabilities` fields. The document's `trust` value is a requirement/claim;
   a trusted registry must verify the exact artifact and configuration.
3. Translate requested tools and any `allowed-tools` metadata into capability
   requirements. Neither that metadata nor a script directory creates a grant.
4. Bind known capabilities to reviewed MCP/function registry identities. Keep
   endpoints, credentials and current grants outside the portable document.
5. Add a bounded host program listing the action kinds and method/capability
   selections it supports. Register the versioned handler in the host; a
   profile must never select an arbitrary module path or shell command.
6. Test the selected action through structural indexing, action-specific trust
   checks, private projection, current admission, and separate outcome proof.

Scripts require an explicitly registered sandbox-execution capability with
host-enforced filesystem, network and resource limits. A sentence telling the
agent to run `scripts/helper.py` is still source text until that capability is
admitted. Imported instructions cannot widen inherited boundaries or grants.

The current 0.1 skill grammar has no input/output/config-schema selectors,
action scope or explicit compatibility field. Validate those contracts in the
trusted host registry and its versioned handler. Do not quietly add proposed
0.2 fields to a 0.1 document. Evolve the profile only under a new explicit
version with compatibility fixtures.

Start with the [authoring template](../templates/runtime-profile.yawn),
[host integration guide](runtime-host-integration.md), and
[golden cases](../fixtures/runtime-action-golden.v0.1.json). Example fixture
digests and adoption events are synthetic and prove no installed skill or
production permission.
