# Source-of-truth map — Run 01 · Lap 0

A view of [`FINDINGS.yaml`](FINDINGS.yaml). Four ownership questions, answered separately, because they have different answers. Then each concern the brief names, with its owner today and its competitors.

## The four questions

| Question | Answer today | Evidence | Open |
|---|---|---|---|
| **Where does the application run?** | `yawn-ai/yawn.bot` at 87e84c4 serves https://yawn.bot (production deployment of that exact sha). `yawn-ai/yawn.ai` serves https://yawn.ai from a sha not on its main history. `yawn-ai/yawn` serves nothing current. | pins; F-000, F-021 | D-022 (yawn.ai = semantic, yawn.bot = operational) was opened and never ruled; recommendation: yawn.bot is the Lap 1 runtime |
| **Where are semantic contracts defined?** | `yawn-ai/.yawn` (public protocol; `core/`, `interface/`, `schemas/`, pinned into yawn.bot by `protocol/dot-yawn.lock.json`). The Run 01 contracts are on PR #29, unmerged. yawn.bot's `YAWNS/` network is the product's own record layer, validated by a contract test. | .yawn CI; yawn.bot `AGENTS.md` "door" §1; `npm run yawn:protocol-sync` | selecting the runtime does not settle N-026 (yawn.bot routes as Views over `yawn.ai/ontology/*` coordinates) |
| **Where is a person's authoritative state stored?** | For Dave: split. Private holarchy `dave.yawn` (local files: records, ledgers, thread, continuity loop) holds decisions, turns, needs, receipts. Supabase (canonical tree tables via `homebase-store.ts`) holds the product snapshot the owner pages render. Browser localStorage holds every `/new` draft. The signals table holds owner `/new` turns under one fixed coordinate that nothing reads back. | F-004, F-010, F-012; `owner-sidebar-state.ts` reads the filesystem | which migration tree the live project applied is unreadable from the repo (F-010) |
| **Which coordinates identify that state across projections?** | Product routes `/dave/<slug>/…` from `buildCanonicalRoute`; `src/domain/yawn-coordinate.ts` defines `yawn.company`/`yawn.bot` origins but is not on the `/new` flow; dave.yawn uses `dave/<path>` coordinates in records; PR #117 parses `<handle>/<path>` and derives ownership from the handle; Phaser mints `yawn.company/index/object/<id>` when nothing else exists. | ARCHITECTURE_MAP §1.4, §1.10; F-027 | N-026 |

## Concern by concern

| Concern (brief §29) | Owner today (repo:path) | Also claims it | Competing / stale | Finding |
|---|---|---|---|---|
| `/new` | bot `src/app/new/page.tsx` → imprint component → localStorage; owner signal append | ai `app/[slug]/new`, `app/[slug]/yawns/new` (lineage) | D-032 minimal seed (open); T-069 "New from anywhere" | F-004, F-033 |
| `/dave` | bot `src/app/dave/page.tsx` + `homebase-store.ts` (Supabase canonical tree) + filesystem sidebar counts | ai `app/[slug]/page.tsx` renders a Dave homebase behind an owner-principal gate | N-028 projection receipts pending | F-000 |
| username roots | bot `src/app/[companySlug]/[...coordinatePath]` (owner only); ~55 static segments shadow it | PR #117 `<handle>/<path>` ownership derivation | T-065 "any username is a root" | F-006, F-029 |
| nested Yawns | bot `findCanonicalYawnByRoute` over the in-memory snapshot; `yawns.parent_yawn_id` | — | no path creates a nested Yawn from `/new` | F-004 |
| canonical IDs | bot `q-space.ts` `stableIdSchema`; Supabase uuids; `short-id.ts` lossy display ids | dave.yawn record ids; PR #117 coordinate parsing | two coordinate namespaces (Phaser) | F-027 |
| questions and answers | bot browser ranker (`yawn-cognition-ranker.ts`) is what runs; Q-Space typed but in-memory by default; `/frontier` static | dave.yawn `QUESTION_RANK.yawn` (76), `rank.mjs` (D-035) | two frontier implementations | F-013 |
| voices and comments | **none in bot**; ai `lib/voices`, `surface-voice-generator`, orphaned voice UI | — | lineage only in the export | F-022–F-024, F-018 |
| expression publication | bot `api/expressions/stub` (stub) and hand-built public coordinates (`public-cognitive-coordinates.ts`); ai `expression-graph` via write-through | dave.yawn `Yawns/expressions/` (T-027) | — | F-025 (APR#inv-no-duplicate-pages PARTIAL) |
| feedback reintegration | bot `yawn-feedback.ts` → approval → Codex work order (DOM-target reports); ai `feedback-reintegration-graph` heuristics → artifacts | — | kernel skip (classification/consequence/proof) | F-025 |
| ranking | bot Q-Space literals; browser ranker; dave.yawn `rank.mjs` from records | — | D-035 "shown with components, never self-authorizing" | F-013 |
| Aperture selection | **none on main**; bot117 view switcher (private/public per view); `question-first-list.tsx` hard-coded | ai `view-switcher.tsx` closed enum | no registry | F-025 |
| presentation preferences | bot `yawn-projection-preferences.ts` (schema parity with `projection-preference.v1`, protected roots throw) — **PRESERVE** | dave.yawn accepted preference records | — | F-025 |
| visibility and grants | bot three vocabularies (F-009); RLS owner-only; dave.yawn provisioning realms (one accepted grant, one pending) | — | no grant object with expiry/revocation | F-007–F-009 |
| provider access | bot catalog + adapters; vault OpenAI-only; kill switch default-off | dave.yawn T-066 provider-as-record (no PR); #110 held | — | F-036 |
| effect authority | bot session gates, cron secrets, Resend key presence, two genuine `mutationAuthorized` readers | `YAWNS/Policies/PUBLIC_ZERO_MUTATION_POLICY` | fields elsewhere are declarations | F-014, F-015 |
| history / replay | bot `yawn-event-replay.ts` (no caller); signals list; recoherence replay entries | dave.yawn `runs.jsonl`, thread messages | `yawn_events` in both trees, read by nothing | F-012 |
| deletion and revocation | bot hard delete with protected set; vault secret delete RPC | lexicon "digital compost" doctrine | no tombstones | F-026 |

## What this means for the first slice

The first operational slice needs exactly one owner per row above, and today four rows have none that reaches a user: an addressable Yawn from `/new`, a read-back of what was expressed, a correction event tied to it, and a deny-by-default visibility decision the route, renderer, and record view all call. Everything else on this map can stay where it is for Lap 1.
