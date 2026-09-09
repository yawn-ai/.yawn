# Data and authority flow — Run 01 · Lap 0

A view of [`FINDINGS.yaml`](FINDINGS.yaml). One trace per block, fixed columns so two versions diff cleanly. `bot` = yawn.bot@87e84c4 (main, deployed); `bot117` = PR #117 head d3239eb (open); `ai` = yawn.ai@b3333db. "authority check" names the function that actually blocks, or `none`. A payload field such as `mutationAuthorized: false` is a declaration, not a check (F-014).

Invariant refs point at `core/projection-and-aperture.yawn` (draft-0.5 on `.yawn` PR #29): `inv:aperture-only-narrows`, `inv:default-private`, `inv:replay-never-widens`, `inv:feedback-not-truth`, `inv:no-separate-truth-stores`.

---

## T-NEW · a person types one sentence at `/new`
repo: bot · entry: `GET /new` then form submit

| step | file:line | actor | reads | writes | authority check | notes |
|---|---|---|---|---|---|---|
| 1 | `src/app/new/page.tsx:38-49` | server | session (non-blocking) | — | `requireDaveSession()` → boolean only | anonymous and owner get the same UI |
| 2 | `src/components/bot/new-yawn-imprint.tsx:127-136,138-195` | browser | typed text | `localStorage["yawn:new:chat-aperture:v1"]` (40 turns / 30 sources cap) | none | verbatim `sourceText` kept in the turn; older text dropped silently |
| 3 | `src/domain/yawn-cognition-ranker.ts` via imprint `:149-163` | browser | the text | — | none | deterministic first question; no model call; timers `:197-201` are cosmetic |
| 4 | imprint `:203-212,252-268` | browser | `hasSession` | `POST /api/yawn-signals/append` (fire-and-forget) | client-side `hasSession` | coordinate hard-coded `dave/operating-map/cognition-ranker`; `visibility: "private_owner"` |
| 5 | `src/app/api/yawn-signals/append/route.ts:18-45` | server | session | — | **`requireDaveSession()`** (`require-dave.ts:66` owner literal) | actor set server-side `user:<username>`; coordinate regex-validated |
| 6 | `src/lib/yawn-signals/store.ts:62-83` | server (service role) | env | INSERT `yawn_signal_records` (canonical tree) | none below the route (RLS bypassed) | 42P01 ⇒ `pending_store`; time = DB `recorded_at` |
| terminal | a row nothing reads back (reader lists `dave/operating-map` exactly, `store.ts:96`) | | | | | **no Yawn minted; no route; anonymous writes nothing** |

invariant_refs: `inv:default-private` (visibility is declared, not decided); `inv:no-separate-truth-stores` (localStorage is a second store the server never sees). Findings: F-004, F-005, F-006, F-011.

---

## T-DAVE · the owner opens `/dave` and one nested Yawn
repo: bot · entry: `GET /dave`, `GET /dave/<slug>/…`

| step | file:line | actor | reads | writes | authority check | notes |
|---|---|---|---|---|---|---|
| 1 | `src/app/dave/page.tsx:78-84` | server | session | — | `requireDaveSession()` | anonymous ⇒ public mission; `?panel=` anonymous ⇒ access boundary |
| 2 | `src/lib/auth/require-dave.ts:25-53` | server | env, cookies, Supabase user | — | fallback policy (`development-fallback-policy.ts:13`) | locally with no Supabase env: anyone is Dave (F-005) |
| 3 | `src/lib/yawn-canonical/homebase-store.ts:144,149-279` | server (user-scoped client) | 10 canonical-tree tables | — | Supabase RLS `owner_id = auth.uid()` (select only) | admin client not used on this path |
| 4 | `src/lib/owner-sidebar-state.ts:20-30` | server | local filesystem paths | — | `isDaveOwnerSession` | counts absent ⇒ 0; not Supabase |
| 5 | `src/app/dave/[...yawnPath]/page.tsx:47-49,103,155` | server | snapshot | — | `requireDaveSession()` | `findCanonicalYawnByRoute` in memory |
| terminal | rendered owner page | | | | | **no anonymous read path to any Yawn** |

invariant_refs: `inv:aperture-only-narrows` (nothing to narrow: one owner view). Findings: F-005, F-010.

---

## T-VIS · a viewer's right to see a record or entity
repo: bot (three deciders) and bot117 (a fourth)

| step | file:line | actor | reads | writes | authority check | notes |
|---|---|---|---|---|---|---|
| 1 | `src/domain/yawn-visibility.ts:64-83` | server/browser | record metadata | — | `deriveYawnVisibilityContract` | falls through to participant-world; root public (APR#default-owner-private CONTRADICTED) |
| 2 | `src/domain/yawn-world-actors.ts:47-56,62` | browser | entity.metadata.visibility | — | `canRenderYawnVisibility` | **absent contract ⇒ true**; world entities never persist one (`supabase-repository.ts:565`); reproduced (F-007) |
| 3 | `src/domain/yawn-provisioning.ts:87-120` | server | session group | — | `decideYawnProvisioning` per capability | publishing in `hardBoundaryCapabilities` ⇒ approval (PRESERVE) |
| 4 | bot117 `src/domain/yawn-record-access.ts:180-231`; `src/lib/yawn-record/coordinate-record-access.ts:46-70`; `src/app/api/yawn-record/route.ts:31,49,57` | server | coordinate (query), session username | — | `isCoordinateOwner` derived server-side for private views; **static `public` view allowed to `public_anonymous` for any coordinate** | reproduced (F-008); exposes coordinate + owner handle + boilerplate today |
| 5 | Supabase | — | — | — | RLS: canonical tables select-only owner; signals and network tables locked; `revoke all from anon` | the real floor for stored data |
| terminal | four different answers to "may this viewer see this" | | | | | **no single deny-by-default decision function** (F-009) |

invariant_refs: `inv:default-private`, `inv:aperture-only-narrows`. Findings: F-007, F-008, F-009.

---

## T-EVT · events, signals, replay
repo: bot

| step | file:line | actor | reads | writes | authority check | notes |
|---|---|---|---|---|---|---|
| 1 | `src/app/api/yawn-signals/append/route.ts` → `store.ts:65-83` | server | — | `yawn_signal_records` (append) | `requireDaveSession` | kinds `dialogue_turn | vote | acceptance | mail_message`, untyped payload (PF#reactions CONTRADICTED) |
| 2 | `src/app/api/yawn-signals/route.ts:10-22` | server | `yawn_signal_records` by exact coordinate, limit ≤ 200 | — | `requireDaveSession` | the only reader |
| 3 | `src/domain/yawn-event-replay.ts:15-29` | — | `ReplayableYawnEvent[]` | — | none (no viewer parameter) | hash-chain verifier; **no caller outside tests** |
| 4 | `yawn_events` | — | — | — | — | defined in both migration trees; read by nothing |
| 5 | `src/app/api/yawn-spaces/[spaceId]/recohere/[eventId]/apply/route.ts:55-76` | server | space ownership | UPDATE `yawn_recoherence_events`, INSERT `yawn_replay_entries` | `resolveYawnSpacePersistenceContext` + `ensureOwnedYawnSpace` | the one row mutation found |
| terminal | signals are the only live event log | | | | | no `effectiveTime` anywhere (TH CONTRADICTED); no per-Yawn timeline (F-012) |

invariant_refs: `inv:replay-never-widens` (untestable: replay takes no viewer). Findings: F-011, F-012, F-026.

---

## T-QSPACE · a question is asked and answered through Q-Space
repo: bot · entry: `/q-space`, `/auth/yawn-consent` redirect

| step | file:line | actor | reads | writes | authority check | notes |
|---|---|---|---|---|---|---|
| 1 | `src/lib/q-space/config.ts:1-20` | server | env | — | — | `Q_SPACE_V1_ENABLED` default true; persistence default false; paid compute default false |
| 2 | `src/app/api/q-space/roots/[rootId]/questions|frontier` | server | in-memory state (`q-space-service.ts:65-69`) | in-memory | `requireNestheadsSession` | state lost on restart unless persistence on |
| 3 | `src/lib/q-space/q-space-intelligence-provider.ts:208-218` | server | candidates | — | — | eleven inputs collapse into one rank from literals (CORE#distinct-quantities CONTRADICTED) |
| 4 | `src/app/api/q-space/roots/[rootId]/answers/route.ts:19-25` | server | body | RPC `q_space_record_answer_v1` → `yawn_answer_events` when persistence on | `requireNestheadsSession` + trusted origin + JSON type | `answerEventV1Schema` has body/fingerprint only: no `asserted_by`, `perspective_ref`, `epistemic_status` (PF#answer-candidate ABSENT) |
| 5 | `src/domain/q-space.ts:57-68` | — | — | proof events (`weakens`, `inconclusive`) | — | **PRESERVE**: a proof primitive that does not assume success |
| terminal | a recommendation id, no dissent shown | | | | | not reachable from `/new` (F-013) |

---

## T-MERGE · a change reaches production
repo: bot · entry: GitHub PR → merge plane → Vercel

| step | file:line | actor | reads | writes | authority check | notes |
|---|---|---|---|---|---|---|
| 1 | PR body first line `YAWN-Bot: yawn.bot/<slug>` | author | — | — | plane ignores PRs without it | protocol repo PRs are outside the plane (N-030) |
| 2 | `.github/workflows/ontology-merge.yml`; `src/lib/yawn-merge/*` | Actions | PR state, checks, Vercel preview | email to the owner; optional staging alias (needs `VERCEL_TOKEN`, N-031) | required checks green ∧ not draft ∧ preview exists | drafts never email |
| 3 | `/ontology/merge` | owner | plane state via admin or server client | merge press | `requireDaveSession` + GitHub | the press is the effect |
| 4 | `tests/unit/yawn-contract-network.test.ts` (in `npm run yawn:check`) | CI | `YAWNS/**` | — | contract invariants (coordinate, Agent Orientation Elevation, effect booleans) | **red on main 87e84c4** for `YAWNS/Sessions/YAWNBOT_INTELLIGENCE_CONTAINER_CLARIFICATION_2026_09_03.yawn` (six errors) — see TEST_ENVIRONMENT_RECEIPT and F-040 |
| terminal | production = main head | | | | | the gate the plane relies on is failing on the deployed sha |

---

## T-VOICE · yawn.ai's voice pipeline (lineage; not in yawn.bot)
repo: ai · entry: `POST /api/triggers/surface`

| step | file:line | actor | reads | writes | authority check | notes |
|---|---|---|---|---|---|---|
| 1 | `app/api/triggers/surface/route.ts` | server | yawn context | — | (route-level, not audited for RLS here) | no env flag |
| 2 | `lib/agents/feed/surface-voice-generator.ts:92-105,123,154` | model | context | voice pairs (2–5), each `position` + `counter` with `protected_need`, `bias_tag`, `emotion` | none | forced opposition; keyword control level (`lib/voices/control-level-detector.ts:28-131`) |
| 3 | `components/feed/surface-phase-container.tsx:79,198-205`, `cards/voice-card.tsx:12,117` | browser | pairs | acknowledgments, −5..+5 slider "feeds the self-model" | — | **orphaned**: parent `TriggerYawnContainer` is never imported |
| 4 | `lib/agents/feed/feedback-reintegration-graph.ts:83-99,199-215,242-244` | server | feedback text | INSERT `yawn_voices`; move/variant artifacts | none found | `includes('but')`, `includes('?')` heuristics; direct writes (`inv:feedback-not-truth` violated) |
| 5 | `lib/agents/answer-agent/answer-processor.ts` (catch branch) | server | public answer | coherence delta +0.01 on failure | — | failure earns credit |
| terminal | artifacts written from unclassified feedback | | | | | reuse only the neutral types (F-024) |
