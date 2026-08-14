# Serialization and compatibility

Status: **Working Draft 0.2**

`.yawn` is the human-readable serialization. JSON is the canonical interchange
form for executable schemas in this repository. A unified document schema is
still being specified; implementations MUST NOT describe either the legacy
`templates/full.yawn` shape or `yawn-contracts-v1.schema.json` as the one
complete `.yawn` schema.

## Safe YAML profile

Portable `.yawn` documents SHOULD use a conservative YAML 1.2 subset:

- UTF-8 text;
- maps, sequences, strings, numbers, booleans, and `null`;
- spaces for indentation;
- no executable tags, custom constructors, merge keys, or object references;
- explicit quoting for ambiguous date-like or boolean-like strings; and
- comments for human guidance, never for canonical state.

Parsers MUST treat content as data and MUST NOT execute commands embedded in a
`.yawn` document.

## Envelope

New protocol records SHOULD declare:

```yaml
spec_version: "0.2-draft"
kind: "yawn"
id: "yawn:example"
revision: 1
```

Stable IDs use an implementation-owned namespace such as `yawn:`, `arena:`,
`turn:`, `event:`, or a URI. IDs do not encode mutable titles, filesystem paths,
or secrets.

Timestamps use RFC 3339 in UTC when possible. When a source gives only a date,
interval, sequence, or uncertain time, preserve that precision rather than
inventing a timestamp.

## References

References use stable IDs for semantic identity. Relative paths MAY locate
portable files but do not establish identity on their own. External references
record URI, media type, retrieval time when relevant, attribution, and an
optional integrity hash.

## Extensions

Public schemas use a namespaced `extensions` object. Extension keys SHOULD be
reverse-domain or URI-like names owned by the producer. Unknown extensions are
preserved on round trip and ignored unless understood; they MUST NOT silently
change core truth, authority, privacy, or event semantics.

Provider-specific model, pricing, and usage receipts belong in extensions or
control-plane profiles, not the provider-neutral ontology.

## Canonical JSON and hashes

Where content-addressing or replay hashes are required, implementations use the
repository's deterministic canonical JSON procedure before hashing. Hash
algorithms are recorded alongside the digest. Presentation order and comments
do not affect semantic hashes; ordered event arrays do.

## Events and unknown fields

Canonical event streams are append-only. Corrections append a superseding or
compensating event and preserve the original. A materialized state records the
event cursor or causal frontier from which it was reduced.

Normative schemas currently reject unknown core fields with
`additionalProperties: false`. The `extensions` object is the forward-compatible
escape hatch. Implementations MUST preserve unknown namespaced extensions even
when they cannot interpret them.

## Migration

Every breaking schema change requires:

- a version change;
- a migration note and, where practical, a deterministic migrator;
- valid and invalid fixtures;
- replay and provenance tests;
- compatibility impact in an RFC or ADR; and
- a deprecation period for stable contracts.

Legacy `current`, `possible`, and `desired` fields remain readable at system
boundaries. Canonical v1 state keeps attributed snapshots, desire, target,
transition intent, transition result, proof, and update separate.
