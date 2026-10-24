# Contradiction register — Run 01 · Lap 0

A view of [`FINDINGS.yaml`](FINDINGS.yaml), ordered by consequence, not by document order. The YAML is the record; this table is the reading order. Tags follow the brief's truth posture (PRESERVE · CORRECT · CHALLENGE · UNKNOWN · TEST · DEFER). "Blocks" names the lap that cannot start until the row is resolved. The reviewer adds `gpt_status` / `gpt_note` in the YAML or new `G-NNN` entries; Fable's rows are not overwritten.

## Access and identity

| id | finding | tag | evidence | resolution | blocks |
|---|---|---|---|---|---|
| F-005 | development Dave-owner fallback is on by default outside production; also promotes an authenticated user with no resolved identity; every local "owner-gated" proof rests on it | CHALLENGE | REPRODUCED (vitest) | DEFERRED → Lap 1 makes it opt-in | 1 |
| F-006 | ownership is the username literal `dave`; one owner identity exists | CHALLENGE | REPRODUCED | DEFERRED → Lap 1 is honestly Dave-only | 1 |
| F-009 | three visibility vocabularies; derived contract defaults to participant-world / root-public (contract says private) | CHALLENGE | SUSPICIOUS_PATTERN | DEFERRED → one deny-by-default decision function in Lap 1 | 1 |
| F-008 | PR #117 static `public` view readable and downloadable by anyone for any coordinate; exposes coordinate + owner handle today; adds a third vocabulary | TEST | REPRODUCED in the PR worktree | DEFERRED → key the public view to the coordinate before a store lands | — |
| F-007 | `canRenderYawnVisibility` fail-open on an absent contract; world entities never persist one; client-side over RLS-scoped data | TEST | REPRODUCED at function level | DEFERRED | — |
| F-011 | signal writes use the service-role client; the only gate is the owner session | TEST | REACHABLE_BEHAVIOR | DEFERRED | — |
| F-015 | anonymous `POST /api/yawn-network/applications` writes a row and sends mail (intended intake) | TEST | REACHABLE_BEHAVIOR | DEFERRED | — |
| F-020 | service-role client on four owner-gated reads | UNKNOWN | UNKNOWN_DEPLOYMENT_CONDITION | UNKNOWN | — |

## Authoritative state

| id | finding | tag | evidence | resolution | blocks |
|---|---|---|---|---|---|
| F-000 | the brief targets yawn.ai; the product runs in yawn.bot; the header PR sits on a dormant third repo; D-022 never ruled | CHALLENGE | observation | **RULING_REQUIRED** — recommended yawn.bot; does not settle N-026 | 1 |
| F-040 | deployed main sha was a direct push to an unprotected main by the org account, outside the plane, and fails `yawn:check` (six contract errors on one backfilled record) | CHALLENGE | REPRODUCED | **RULING_REQUIRED** — sanction or protect; repair or revert | 1 |
| F-010 | two migration trees; runtime reads the canonical tree; which the live project applied is unreadable from the repo (N-011, N-016 pending) | UNKNOWN | UNKNOWN_DEPLOYMENT_CONDITION | **RULING_REQUIRED** — read-only `schema_migrations` look | 1 |
| F-021 | yawn.ai production sha is not on its main history | UNKNOWN | observation | UNKNOWN | — |

## First useful interaction

| id | finding | tag | evidence | resolution | blocks |
|---|---|---|---|---|---|
| F-004 | `/new` keeps the text in the browser; the owner's copy is appended under a fixed coordinate nothing reads back; no Yawn is minted; visitors write nothing | CHALLENGE (to brief §25) | REACHABLE_BEHAVIOR | RESOLVED — this is the Lap 1 gap | 1 |
| F-033 | first-minute Yawn has prior records (D-032 seed, T-069) and one undecided shape question | PRESERVE | observation | RULING_REQUIRED with a stated default (seed; packet collapses to a line) | 1 |
| F-013 | questions exist twice; Q-Space in-memory by default with literal scores; `/frontier` static | CORRECT | observation | DEFERRED — Lap 1 needs no ranker | — |

## Continuity

| id | finding | tag | evidence | resolution | blocks |
|---|---|---|---|---|---|
| F-012 | replay function has no caller; `yawn_events` read by nothing; no per-Yawn history surface; no effective time anywhere | CORRECT | observation | DEFERRED → Lap 7 | — |
| F-003 | N-023 / T-064 still ask Dave to press #109 (merged 2026-09-03) | CORRECT | observation | RESOLVED in the receipt; only Dave closes | — |
| F-041 | typecheck and four suites need the generated asset manifest | CORRECT | REPRODUCED | RESOLVED | — |
| F-026 | hard delete, no tombstones; doctrine recorded, nothing ruled | DEFER | observation | DEFERRED | — |
| F-036 | provider binding held (#110), provider-as-record unstarted (T-066), vault OpenAI-only | DEFER | observation | DEFERRED → Lap 8 | — |
| F-001 | `yawn-ai/yawn#1` fails on a baseline prerender error; base and head identical; types and lint skipped | CORRECT | REPRODUCED (base vs head) | RESOLVED — unevaluable, not repaired | — |

## Presentation and reuse

| id | finding | tag | evidence | resolution | blocks |
|---|---|---|---|---|---|
| F-025 | contract-vs-code on yawn.bot main: 19 implemented / 52 partial / 88 absent / 9 contradicted of 168 | CORRECT | observation | DEFERRED — mapped to laps | — |
| F-022 | yawn.ai legacy server paths are reachable from live routes; the voice UI is orphaned; the classifier subgraph has no path | CORRECT | observation | RESOLVED | — |
| F-023 | the brief's nine drift claims about yawn.ai confirmed at file:line (IFS labels live in the optional type layer) | PRESERVE | observation | RESOLVED | — |
| F-024 | reusable neutral contracts from yawn.ai; psychologizing already isolated in optional metadata plus three required fields | PRESERVE | proposal | DEFERRED → Lap 3 | — |
| F-027 | Phaser mints `yawn.company/...` coordinates for an undefined domain; no Phaser tests | DEFER | observation | DEFERRED | — |
| F-029 | ~55 static route segments shadow the username root | DEFER | observation | DEFERRED | — |

## Terminology and guidance

| id | finding | tag | evidence | resolution | blocks |
|---|---|---|---|---|---|
| F-017 | GPT review authorized in chat; no agent record; review authorization ≠ runtime role or merge authority | UNKNOWN | observation | RULING_REQUIRED with a stated default (accept as attributed review) | — |
| F-014 | `mutationAuthorized` fields are declarations except in two readers | CORRECT | observation | RESOLVED | — |
| F-016 | brief assigns the register to both Fable and GPT | CORRECT | observation | RESOLVED by amendment | — |
| F-002 | yawn.ai AGENTS.md says `.claude/` is absent; it exists | CORRECT | observation | RESOLVED | — |
| F-018 | voice lineage only in the unmined export | UNKNOWN | observation | UNKNOWN, not a blocker | — |
| F-019 | lexicon lacks Yawnbot, voice, perspective, lens, move | DEFER | observation | DEFERRED | — |
| F-028 | required contract list duplicated between validator and test | DEFER | observation | DEFERRED | — |

## What the brief's Lap 0 list asked to resolve or defer

| item | outcome |
|---|---|
| optional targets vs objective-required promotion | DEFERRED: yawn.bot has no objective type on the traced path; contract-level; COMPATIBILITY_MIGRATION_PLAN proposes the rule |
| stale AGENTS.md / .claude guidance | RESOLVED for yawn.ai (F-002); yawn.bot's door is accurate |
| Agent vs lens/module naming | RESOLVED for yawn.ai (`AgentType` panel, F-023); no such pattern on yawn.bot main |
| actual /new, /dave, nested-Yawn ownership | RESOLVED (SOURCE_OF_TRUTH_MAP) |
| voice, answer, expression, feedback, move data flows | RESOLVED (DATA_AND_AUTHORITY_FLOW T-VOICE, T-QSPACE, T-EVT) |
| View registry and preference resolution | RESOLVED as ABSENT except projection preferences (F-025) |
| visibility, invitation, RLS, provider, export, effect grants | RESOLVED as three vocabularies + no grant object (F-009, F-025) |
| canonical event/replay source | RESOLVED: signals are the only live log; replay unwired (F-012) |
| temporal-header build failure | RESOLVED: baseline failure on a dormant repo (F-001) |
