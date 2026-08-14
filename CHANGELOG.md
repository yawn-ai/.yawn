# Changelog

All notable public protocol and repository changes are recorded here. Stable
modules follow semantic versioning; draft ontology releases use explicit draft
labels and do not imply compatibility.

## [Unreleased]

### Added

- Unified documentation hub and deployable GitHub Pages landing page
- Working Draft 0.2 ontology for world, field, arena, Yawn, turn, transition,
  projection, and replay
- Executable Agency Holarchy draft schema, fixture, and conformance tests
- Holarchy, routing, nine-question, serialization, and projection specifications
- Nested agent-arena, open-turn, and structural-change templates and examples
- Governance, security, conduct, support, citation, roadmap, RFC, ADR, and
  maintainer surfaces
- Least-privilege continuous integration for both existing v1 modules and the
  new draft

### Changed

- Made `README.md` the concise human front door and `readme.yawn` the repository
  orientation record, removing the unsupported canonical/mirror claim
- Declared the existing contracts package and state substrate as parallel v1
  modules while their future unification remains explicit work
- Clarified that authorized events update canonical state and that proof changes
  what a system may claim about outcomes

### Preserved

- `@yawn/contracts` v1 and the state-substrate v1 schemas introduced in the
  2026-08-13 canonical-contract and state-substrate integrations
- Historical `.ion` bridge, research locks, records, feedback route, and
  Declaration of Agency

## 2026-08-13 — State substrate v1

- Added attributed state, event, desire, optional target, transition intent,
  transition result, update, and living snapshot contracts.
- Added deterministic authorized-event reduction and conformance fixtures.

## 2026-08-13 — Contracts v1

- Published the constitutional runtime contract, generated TypeScript types,
  source atoms, authority grants, proof receipts, and import receipts.

Earlier repository history is preserved in Git and the numbered research
bridge. A backfilled release chronology is a [roadmap](ROADMAP.md) item.
