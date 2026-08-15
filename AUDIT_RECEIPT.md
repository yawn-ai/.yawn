# Orientation Passage and Spiral handoff audit receipt

- Audited at: 2026-08-14 America/Denver
- Repository: `yawn-ai/.yawn`
- Audited `origin/main`: `9a4c433920b832737045919921998c6b9c89ec85`
- Working branch: `codex/orientation-spiral-protocol`
- Handoff ZIP SHA-256: `f73511e4b99014a946cbbc2c2793b43ec48f7edf703b013c1947ce882dd36a65`
- Bundle manifest: all nine declared files match SHA-256 and byte count; JSON, YAML/`.yawn`, and JavaScript syntax validation passed.
- Ontology pressure test SHA-256: `9fed86ce8eb021f736f3c992d6cbca5c59d9dc0761eaf4f5034ad62048b1f5c5` (`55,844` bytes).
- The pressure test's internal citation handles are preserved as source context but are not treated as durable public citations.

## Observed current state

- `README.md` and Working Draft 0.2 already distinguished Reality, World horizon, Field, Arena, Yawn, Turn, events, transition, proof, replay, and a rebuildable rendering layer.
- State remains the substrate; desire is attributed directional evidence; targets are optional and scoped.
- The repository has an executable `agency-holarchy.v0.2` aggregate, V1 state/event modules, semantic reference validation, and an additive contracts package.
- The attached pressure test exposed an important name collision: older records used `projection` both for a rendering and for what an Agent puts into an Arena.
- Missing from `main`: executable acquisition-style Observation, separate Intention/Projection/Consequence records, the Move-as-subset rule, a public View contract, and conformance proof for those distinctions.
- No open pull requests were present at audit time. Recent PR #4 published the ontology hub and agency holarchy.

## Handoff reconciliation

- The bundle's additive RFC approach fits the current protocol and will not replace `@yawn/contracts` V1 or Agency Holarchy 0.2.
- The human-facing Orientation Spiral remains a View of `signal → orientation → choice → move → proof → update`, not a fourth canonical loop.
- YAWN.bot is an attributed agent/overlay, never the center of the spiral.
- Relationship offers do not create relationship consent or canonical shared state.
- Observation is a situated acquisition event, separate from the attributed statement or object acquired; recursive depth remains derived from typed edges.
- Intention is what an Agent means or endorses. Projection is what it actually expresses or attempts in the same Arena. Consequence is what the Arena and reality return.
- Every Move is a Projection; not every Projection is a Move. Intention alone grants no authority.
- Rendering is named `View`; `public-view.v1` remains proposed until Dave accepts it.
- The compact constitutional loop remains stable while Orientation Passage V1 makes the fuller human passage executable.

## Dependency audit

The supplied conservative scanner inspected 5 source files. It reported no candidate-unused packages and no ambiguous dynamic imports. No dependency change is justified by this audit.

## Mutation and proof boundary

- Authorized now: repository edits, local tests, commit, push, and draft pull request requested by Dave in this task.
- Not authorized: merge, deployment, database mutation, paid model calls, email, publication of private source bodies, or promotion of AI-proposed testimony to accepted Dave testimony.
- Required proof: schema validation; source/target and actor integrity; recursive-observation integrity; Intention/Projection/Move/Consequence separation; authority denial; public redaction; deterministic snapshot hash; and all existing protocol tests.

## Planned change boundary

PR A only: RFCs 0002–0005, the constitutional orientation record,
Orientation Passage V1, Public View V1, the public page template, the handoff
proposal, examples, generated contract types, semantic validation, and tests.
No application code, merge, database mutation, or deployment.

## Local verification

- Root conformance: 43 tests passed, 0 failed.
- Orientation Passage V1: schema, attribution, source hash, same-Arena,
  Move-subset, authority, and Proof checks passed.
- Public View V1: redaction, typed references, relationship-offer boundary, and
  deterministic semantic snapshot hash checks passed.
- Hub validation: 22 linked documents passed.
- Static public surfaces: 4 HTML routes, `sitemap.xml`, and 23 YAML/`.yawn`
  surfaces parsed safely.
- `@yawn/contracts`: generated types match the schema, TypeScript check passed,
  and package dry-run passed.
- `origin/main` remained `9a4c433920b832737045919921998c6b9c89ec85`
  after the final fetch; the branch merge-base is the same commit.
