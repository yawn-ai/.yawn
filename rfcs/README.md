# YAWN RFC process

Starting with this bootstrap draft, an RFC is required for a new normative concept, a breaking serialization
change, a compatibility promise, a governance change, or a semantic change that
affects authority, privacy, proof, identity, or replay.

## Lifecycle

```text
idea → draft → review → accepted | rejected | deferred → implemented → verified
```

Create `rfcs/NNNN-short-name.md` from the sections below:

1. Summary and status
2. Current state and lacuna
3. Proposed semantics and invariants
4. Alternatives and counterexamples
5. Authority, privacy, safety, and human-agency effects
6. Compatibility and migration
7. Schemas, examples, and conformance tests
8. Evidence, open questions, and falsifiers
9. Decision and implementation receipt

Draft RFCs are proposals. An accepted RFC records who authorized it and links
the implementing commit. Acceptance of a concept does not make every current
implementation conformant.

Small fixes that do not change meaning can use an ordinary pull request. When
in doubt, open an issue before assigning an RFC number.

## Current RFCs

- [RFC 0001: Agency Holarchy Working Draft 0.2](0001-agency-holarchy-working-draft.md) — proposed
- [RFC 0002: Inquiry Aperture — One Question Face](0002-inquiry-aperture-one-question-face.md) — proposed / owner review required
- [RFC 0003: Objective holons and Yawn.bot lifecycle](0003-objective-holon-and-yawn-bot-lifecycle.md) — proposed
