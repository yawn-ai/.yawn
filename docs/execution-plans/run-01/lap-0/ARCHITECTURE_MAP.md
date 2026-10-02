# Architecture map — Run 01 · Lap 0

A view of [`FINDINGS.yaml`](FINDINGS.yaml). Every claim carries a pinned reference; `bot` = `yawn-ai/yawn.bot@87e84c4` (main, deployed), `bot117` = PR #117 head `d3239eb` (open, not main), `ai` = `yawn-ai/yawn.ai@b3333db`, `yawn` = `yawn-ai/yawn@21b973c`. Main, open PR, and deployed states are never merged into one word "current".

Status of this document: proposal. It is evidence for a ruling, not a ruling.

## 0. The three applications

| | yawn.bot | yawn.ai | yawn |
|---|---|---|---|
| Serves | https://yawn.bot | https://yawn.ai | nothing current |
| Inspected / main / deployed | 87e84c4 = main = production (2026-09-03) | b3333db = main (2026-08-17); production 81df681 (2026-08-28, not on main history) | 21b973c = main = last production (2025-07-04) |
| Framework | Next.js app router under `src/app`, domain under `src/domain`, adapters under `src/adapters` | Next.js app router under `app/`, `lib/`, `components/`, plus a large `mcp-server/` package | Next.js under `web/` |
| Tests | 416 files (vitest jsdom + Playwright); `npm run yawn:check` contract suites; `npm run e2e:receipt` writes a JSON receipt | vitest (29 under `tests/`, 4 under `__tests__`) | none found |
| Governance | merge control plane (`/ontology/merge`, PR body `YAWN-Bot:` header), `YAWNS/` record network validated by a contract test | `YAWNS/` network (184 files) with its own AGENTS.md; auto-merge, dev-gate, quality workflows | none |
| Role in Run 01 | **provisional Lap 1 runtime** (F-000) | lineage of the voice / answer / expression / feedback mechanisms; reuse candidates (F-022 – F-024) | dormant; one-page post-mortem (F-001, appendix) |

## 1. yawn.bot — the operational path

Traced for one owner (Dave) and, where different, an anonymous visitor. Seven-state ladder per capability: code present · entry path · enabled in the inspected config · executed · deployed · authorization verified · user value. Values below are what the code and the local run show; "deployed" is true only because the inspected sha is the production deployment; "user value" is unknown everywhere.

### 1.1 Arrive
- `/` — `bot:src/app/page.tsx:33-45`. `requireDaveSession()` is non-blocking; anonymous and owner render the same public home with different props. Owner sidebar counts come from the **local filesystem** (`bot:src/lib/owner-sidebar-state.ts:20-30`, `HOMEBASE_OPEN_DECISIONS_PATH`, absent ⇒ 0), not Supabase.
- `/dave` — `bot:src/app/dave/page.tsx:78-94`. Anonymous ⇒ public mission component; owner ⇒ `loadDaveCanonicalSnapshot(session.id)` + priority queue.
- Session — `bot:src/lib/auth/require-dave.ts:25-53`. With Supabase unconfigured, or no user, or a user with no resolved identity, and the fallback allowed, the visitor becomes the Dave owner session. Fallback allowed = `NESTHEADS_DEV_DAVE_FALLBACK` (unset ⇒ `NODE_ENV !== "production"`; set ⇒ literal `"true"`) ∧ `NODE_ENV !== "production"` ∧ `VERCEL !== "1"`. Reproduced (F-005).
- Owner = `role === "owner" && username === "dave"`; the identity resolver emits exactly one owner identity (F-006).

### 1.2 Express (`/new`)
- `bot:src/app/new/page.tsx:38-49` mounts the imprint UI; `?view=advanced` mounts the umwelt programming surface (localStorage only, no model call).
- Typed text → `window.localStorage["yawn:new:chat-aperture:v1"]`, capped at 40 turns / 30 sources, older silently dropped (`bot:src/components/bot/new-yawn-imprint.tsx:28-30,138-195`).
- If `hasSession`: fire-and-forget `POST /api/yawn-signals/append` with the verbatim `sourceText`, schema `yawn.new-chat-source.v1`, visibility `private_owner`, **coordinate hard-coded to `dave/operating-map/cognition-ranker`** (`:252-268`). Route gate `requireDaveSession()`; actor set server-side as `user:<username>`; insert into `yawn_signal_records` with the service-role client (`bot:src/lib/yawn-signals/store.ts:62-83`); missing table degrades to `pending_store`.
- No model adapter is reachable from `/new`. The first question is chosen in the browser by `compileYawnCognitionEntry` + `selectNextQuestion` (`bot:src/domain/yawn-cognition-ranker.ts`); the "orienting" delay is three timers.
- **No Yawn is minted**: no coordinate, no route, no row in `yawns`. Anonymous visitors write nothing (F-004).

### 1.3 Symbolize / question
- Deterministic browser ranker (above) is what actually runs.
- Q-Space (`bot:src/domain/q-space.ts`, `bot:src/lib/q-space/*`, `bot:src/app/api/q-space/**`) is enabled by default (`Q_SPACE_V1_ENABLED`), persistence off by default (in-memory state lost on restart), paid compute off; ranker literals in `bot:src/lib/q-space/q-space-intelligence-provider.ts:208-218`; reachable from `/q-space` and the consent redirect, **not from `/new`** (F-013).
- `/frontier` is static editorial content (`bot:src/domain/yawn-frontier.ts`).

### 1.4 View
- Addressing: `buildCanonicalRoute` (`bot:src/lib/yawn-canonical/homebase-store.ts:388-410`) from slug/parent chain → `/dave/<slug>/…`; `bot:src/domain/yawn-coordinate.ts` exists but is not on the `/new` flow.
- Re-open: `bot:src/app/dave/[...yawnPath]/page.tsx:47-49,103,155` → `findCanonicalYawnByRoute(snapshot, segments)` in memory. Owner only. Company route `bot:src/app/[companySlug]/[...coordinatePath]/page.tsx` also owner only. **There is no anonymous read path to a Yawn.**
- Loader reads ten tables, all created in the canonical tree `bot:supabase-canonical/supabase/migrations/20260813032939_yawn_canonical_homebase_v1.sql`, through the user-scoped server client (RLS enforced). `yawns` and `yawn_events` are also defined in the other tree (F-010).

### 1.5 Correct
| Path | Route | Gate | Table (tree) | Append or mutate |
|---|---|---|---|---|
| signals | `api/yawn-signals/append` | `requireDaveSession` | `yawn_signal_records` (canonical) | append |
| Q-Space answer | `api/q-space/roots/[rootId]/answers` | `requireNestheadsSession` + trusted origin + JSON type | `yawn_answer_events` via RPC when persistence on (`bot:supabase/migrations/20260716064409_q_space_v1.sql`) | append |
| feedback | `api/yawn-feedback` | `requireDaveSession` + `ensureDaveProfile` + zod | `yawn_feedback_events` (main tree) | event row |
| recohere create | `api/yawn-spaces/[spaceId]/recohere` | session + owned space | `yawn_recoherence_events` | append |
| recohere apply | `…/recohere/[eventId]/apply` | same | **UPDATE** `yawn_recoherence_events` + INSERT `yawn_replay_entries` | the one mutation found |
| edit a `/new` expression | — | — | — | none; localStorage overwritten, no prior version |

### 1.6 Return / replay
- `replayYawnEvents` (`bot:src/domain/yawn-event-replay.ts:15-29`) — hash-chained, deterministic ordering — **has no caller** outside tests. `yawn_events` is read by nothing.
- Only history surface: the correction flywheel lists signals for the exact coordinate `dave/operating-map` (`bot:src/components/yawn-canonical/dave-correction-flywheel.tsx:72`, `store.ts:96` uses `.eq`). `/new` writes under `dave/operating-map/cognition-ranker`, so **`/new` turns are never rendered back** (F-004, F-012).
- No per-Yawn timeline component exists.

### 1.7 Enforcement
- Every write above is gated by a session function; below the gate the signal store uses the service-role client. `mutationAuthorized` / `externalEffectsAuthorized` are genuine checks in two places (`bot:src/app/api/lacuna-matata/daily-image/route.ts:40`, `bot:src/app/api/nestheads/threads/route.ts:69`) and declarations everywhere else (F-014).
- Anonymous routes with effects: only `POST /api/yawn-network/applications` (row + mail, same-origin check + rate limit) (F-015).
- Model calls: `areYawnCaptureModelCallsEnabled` default-off; `api/fable/turn` owner-gated, rate-limited, idempotency-cached. Mail: blocked without `RESEND_API_KEY`. Crons: `CRON_SECRET`/`YAWN_DAILY_EMAIL_SECRET`.

### 1.8 Visibility and provisioning (three vocabularies)
| Module | Vocabulary | Default |
|---|---|---|
| `bot:src/domain/yawn-visibility.ts` | `full / summary_only / hidden` × `owner / participant / anonymous` | derived contract falls through to participant-world; root public |
| `bot:src/domain/yawn-provisioning.ts` | groups (`public_anonymous`, `authenticated_participant`, `authenticated_owner`, `automation_readonly`, …) × capabilities × CTAs | per-capability deny; publishing requires approval |
| `bot117:src/domain/yawn-record-access.ts` | `private / participants / public` × `read_view / download_record / add_view` | deny-by-default; static two-view list with a `public` view any anonymous viewer may read and download (F-008) |
`canRenderYawnVisibility` returns true for an absent contract; world entities never persist one; client-side only (F-007). RLS: every canonical table select-only for the owner; `yawn_signal_records` and network tables locked (service role); `revoke all … from anon` (S2 §4).

### 1.9 Providers and effects
Catalog `gpt-5.6-sol-ultra | claude-fable-5`, no paid default; Fable adapters hard-code the model id; per-owner vault is OpenAI-only by CHECK constraint (F-036). Crons: scheduler hourly, daily image, daily email.

### 1.10 Game world
`bot:src/components/world/nestville-west-phaser.ts` reads `yawnId`/`coordinatePath`, falls back to `yawn.company/index/object/<id>` (F-027). No Phaser tests.

### 1.11 Guidance
`AGENTS.md` 2026-08-26 (the "door" boot sequence; accurate), `CLAUDE.md` 2026-08-18, `README.md` 2026-08-13, `docs/project-brain.md` 2026-09-02, no `.claude/`.

## 2. yawn.ai — lineage mechanisms

Entry points inspected: every `app/**/route.ts` and `page.tsx`, `middleware.ts`, nine `vercel.json` crons (coherence check every 5 min, coherence scan every 5 min, heartbeat every minute, optimize-yawns nightly, sync-yawn-jobs, trademark trial, system health, attention campaign, agent activity scan). No worker or queue consumer references a target; LangGraph builders are per-module, not string-keyed registries.

| Mechanism | Path to a live entry | Note |
|---|---|---|
| `lib/agents/feed/surface-voice-generator.ts` (+ `lib/voices/control-level-detector.ts`, `voice-card-config.ts`) | `app/api/triggers/surface/route.ts` (1 hop, no flag) | forces position/counter pairs with `protected_need`, `bias_tag`, `emotion` (`:92-105,154`); keyword control levels |
| `lib/agents/feed/voice-classifier-subgraph.ts` | barrel only; barrel has zero importers | no execution path found within the inspected entry points and configuration |
| `lib/agents/feed/feedback-reintegration-graph.ts` | `app/api/feedback/ui`, `app/api/yawns/[id]/recohere` | `includes('but')` ⇒ objection, `includes('?')` ⇒ confusion (`:83-99`); direct insert into `yawn_voices` (`:242-244`) |
| `lib/agents/answer-agent/*` | `app/api/yawn/[yawnId]/answer` | processing-failure branch returns `coherence_delta: 0.01` |
| `lib/agents/expression/*` | synthesize-expression route; `lib/yawn/coherence-write-through` (≥ 8 routes) | one "single coherent statement (1–3 sentences)" |
| `components/feed/surface-phase-container.tsx`, `cards/voice-card.tsx` | `TriggerYawnContainer` is exported and never imported | **orphaned UI**; acknowledgment gate `:79,198-205`; slider "feeds the self-model" `voice-card.tsx:12` |
| `components/yawn/view-switcher.tsx`, `components/shared/visibility-dropdown.tsx`, `participants-dropdown.tsx`, `lib/yawn/visibility-access.ts` | `app/[slug]/page.tsx`, `app/yawns/[yawnId]/page.tsx`, `app/[slug]/feed/page.tsx` | closed `ViewMode` union (`:8`), `?view=` navigation with full reload (`:96-98`); visibility default `'public'` (`:32`) |
| `components/yawn/dave-canonical-homebase.tsx`, `agent-conversation-panel.tsx` | `app/[slug]/page.tsx:76-85` behind `slug === 'dave'` ∧ owner principal ∧ `view !== 'public'` | `AgentType` = `outcome|tension|model|experiment|coherence` (`:9,39-89`) |

Whether these routes see real traffic is unknown. Reusable, framework-neutral contracts and the psychologizing seam are in F-024.

## 3. yawn (dormant) — post-mortem appendix

- Repo created 2025-07; "YAWN – Your AI Workspace Network"; `web/` Next 15.3.3; `next.config.js` sets `ignoreBuildErrors: true` and `ignoreDuringBuilds: true`.
- PR #1 (2026-09-05, two files: `web/components/UnifiedHeader.tsx`, `web/components/YawnTemporalHeaderMeta.tsx`) was opened against this repo as the "temporal-header implementation". Its companion ontology is on `.yawn` PR #29.
- Local comparison under identical conditions (node v24.11.1, `npm ci --ignore-scripts`, no env): base and head both compile, both skip types and lint, both fail prerendering `/yawns` with `ReferenceError: taskSupabaseClient is not defined`; `tsc --noEmit` reports 153 errors on both, identical set.
- Conclusion (F-001): the deployment failure is the repository's baseline, not the header. Nothing establishes that the header works: no runtime, browser, or replay-source test exists, and the repo has no relationship to either live product. Not repaired.

## 4. Protocol repository (`.yawn`)

PR #29 (`proposal/temporal-yawnbot-header`, head 54ef77f, MERGEABLE, CI green) carries the brief, six `interface/*-v0.1.yawn` contracts, six clarification records, and `core/projection-and-aperture.yawn` draft-0.5 (adds `aperture_preset`, `effective_projection`, `perspective_field`, `publication`, four `known_views`, a `runtime_boundary` block, ~16 invariants). CI: six validators + node tests, hub-link check, public-surface YAML/HTML parse, contracts type-gen diff. Green protocol CI is not product proof. Contract-vs-code counts against yawn.bot main are in F-025.
