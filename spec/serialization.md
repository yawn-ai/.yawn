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
`.ion`, `.yon`, and `.ywn` are invalid YAWN schema aliases. They frequently appear as
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

## Declarative runtime profiles

A document MAY declare the opt-in
[`yawn.runtime-profile.v0.1`](runtime-profile.md) profile. Its fields are
declarative data with versioned semantics. They are not embedded source code
and do not turn the legacy full template into a universal runtime schema.

An implementation MUST NOT execute arbitrary commands, YAML tags, module
paths, or scripts merely because they occur in a record. A code-enforced field
requires a trusted, recognized semantic handler. Unknown handlers MUST leave
dependent configuration unresolved; they MUST NOT silently become model
advice. Skill, tool, connector, and secret references do not grant authority to
use their targets.

The reference runtime-profile parser accepts only the documented data subset;
it is not a general YAML processor. Canonical JSON is an unambiguous authoring
and interchange option. A host must reject duplicate keys and unsupported
syntax rather than interpreting them differently at separate ingestion points.

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

Runtime Profile 0.1 uses top-level `primary_parent_id` for explicit ancestry.
Existing executable modules retain their own versioned field names. Migration
is an explicit operation selected by source version, not a permissive alias
search:

| Source version | Source field | Runtime-profile output |
| --- | --- | --- |
| `agency-holarchy.v0.2` | `primaryParentYawnRef` | `primary_parent_id` |
| Human `0.2-draft` | `primary_parent_yawn_ref` or `context.primary_parent_yawn_ref` | `primary_parent_id` |
| `yawn.app-legacy.v0` | `primary_parent`, `parent_coordinate`, or their forms under `context` | `primary_parent_id` |

Conflicting supplied parent representations MUST be rejected. Equivalent
values may be normalized with a migration warning. A migration MUST NOT infer
parent identity from a path, URL, slash address, title, or lateral link. The
adapter needs a stable ID, or a host-verified identity mapping. Older templates
that place structural data elsewhere require an explicit extraction step; a
field with a familiar name is not enough to select a source grammar.

See [Runtime Profile migration](runtime-profile.md#compatibility-and-migration)
for the bounded compatibility contract. Agency Holarchy 0.2 schemas and
runtime behavior are unchanged by the new profile.

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
