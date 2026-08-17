# Serialization and compatibility

Status: **Working Draft 0.2**

`.yawn` is the human-readable serialization. JSON is the canonical interchange
form for executable schemas in this repository. A unified document schema is
still being specified; implementations MUST NOT describe either the legacy
`templates/full.yawn` shape or `yawn-contracts-v1.schema.json` as the one
complete `.yawn` schema.

## Canonical name and extension

The product name is **YAWN** and the human-readable record extension is
**`.yawn`**.

<!-- yawn-invalid-alias-guard:start -->
`.ion` and `.yon` are invalid YAWN schema aliases. They frequently appear as
speech-to-text or model-transcription substitutions, but implementations MUST
NOT accept them as alternate extensions, compatibility formats, or distinct
ontologies.
<!-- yawn-invalid-alias-guard:end -->

When the surrounding interaction has already established YAWN as the referent,
an ingestion boundary SHOULD normalize the known substitutions before creating
a filename, stable ID, schema selection, or record. The boundary SHOULD preserve
the raw input, normalized value, applied rule, context basis, and reviewer when
the correction affects provenance.

Normalization MUST be context-gated. Similar ordinary language—such as a
chemical term or a genuine personal name—MUST NOT be silently rewritten merely
because its spelling resembles a known substitution. If the referent is
ambiguous, creation pauses and the ambiguity remains visible.

The executable reference behavior is defined in
[`core/canonical-extension.yawn`](../core/canonical-extension.yawn) and
[`lib/canonical-extension-v1.mjs`](../lib/canonical-extension-v1.mjs).

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

A normalization correction changes neither the stable ID nor any typed
relationship. If a transcription error also affected identity or topology, that
is a separate proposed structural change with its own source and authority.

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

`yawn.observation-state.v1` uses deterministic canonical JSON as its executable
interchange bytes. JSON is a YAML 1.2 subset, so those bytes may be stored as
`observation.yawn` without a second parser-specific representation. Human YAML
templates remain available for authoring. A deterministic export embeds the
semantic state hash and may embed a separate resolved preference hash; the
preference hash never changes the semantic Observation hash.

Serializing or downloading a record is a materialized View. It is not the
ontology's Agent-to-Arena Projection unless an Agent actually expresses or
attempts that record into an Arena.

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

The 2026-08-17 canonical-extension migration is narrower than a schema-version
migration: it retires invalid lexical aliases and a historical repository layer
without changing accepted v1 semantic identity. Its receipt preserves the old
source commit and maps each retired path to current canonical targets.
