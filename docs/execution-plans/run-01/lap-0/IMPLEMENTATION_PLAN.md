# Implementation plan — Run 01 · Lap 1 in detail, Laps 2–8 as outlines

Status: proposal, not started. Lap 1 begins only after the reviewer's SUPPORT / CHALLENGE / BLOCK on this plan and Dave's rulings in [`DECISION_PACKET.md`](DECISION_PACKET.md). Repository for Lap 1: `yawn-ai/yawn.bot` (recommended in F-000; the alternative is costed at the end).

## Lap 1 — one concern, carried once

### Claim being tested
On the live product path, a person can express one concern in one sentence and get back: the original preserved with source and time; a provisional model; one question or an explicit hold with its reason visible; a way to correct that produces an attributed event; and, after leaving, a page that reconstructs all of it from the server rather than from the browser. Measured against the seven-state ladder, every step must reach "executed successfully" under a real session, and the receipt must say which steps did not.

### The chain and what exists for each step
| step | exists on main (F-…) | Lap 1 adds |
|---|---|---|
| express one concern | `/new` imprint UI; verbatim text kept client-side; owner signal append (F-004) | server `source_event` under a minted coordinate; the write result shown (persisted / pending) |
| source preserved | signals row with server-set actor and DB time (F-004) | typed payload with `asserted_by`, `epistemic_status: reported`, `source_text` verbatim, `client_ref` to the localStorage draft |
| provisional model | deterministic browser compile (F-004, F-013) | the compile output persisted as `model_proposal` with `asserted_by: system:cognition-ranker@<version>`, `epistemic_status: inferred` |
| question or hold, with reason | `selectNextQuestion` (deterministic) | persisted `question_selected` carrying the ranker's inputs as the visible reason; an explicit **Hold** control writing `hold` with a wake condition (free text, optional); when the sentence is itself a clear question, the UI says it is holding it as a question rather than manufacturing another (no model answer in Lap 1) |
| inspect and correct | none for `/new` text (F-004) | a **Correct** control on the source or the model that appends `correction` referencing the target event id; nothing is mutated |
| attributed event | append-only signals (F-011) | every write above is an event with actor, time, and target |
| leave and return | no route, no read-back (F-004, F-012) | route `/<handle>/yawns/<id>` (Dave: `/dave/yawns/<id>`) renders the events for that coordinate in order, from the server, through one deny-by-default visibility decision |

Aperture and provisioning stay independent: the route accepts `?view=` only to reorder or collapse what the visibility decision already allowed; changing the view never changes the decision; the three header controls (Now/Replay · Aperture · Provisioning) are rendered as three controls even where two are inert, so their independence is visible. Questions First is the default for this sparse Yawn and is one collapsed line; Dave may expand.

### Bounded file scope (yawn.bot)
- `src/lib/yawn-signals/store.ts`, `src/app/api/yawn-signals/append/route.ts` — kinds and payload schemas (COMPATIBILITY §1)
- `src/components/bot/new-yawn-imprint.tsx` — mint coordinate, write `source_event` / `model_proposal` / `question_selected`, Hold and Correct controls, show write result
- `src/app/[companySlug]/yawns/[id]/page.tsx` (new) and `src/app/dave/yawns/[id]/page.tsx` (thin alias) — read route
- `src/domain/yawn-visibility-decision.ts` (new) — `decideYawnVisibility` with adapters for the two existing shapes (COMPATIBILITY §4)
- `src/lib/env.ts` — fallback default flip (COMPATIBILITY §5); `.env.example` line
- one additive migration in `supabase-canonical/supabase/migrations/` only if the `kind` CHECK constraint requires it
- `YAWNS/Observations/…` and `YAWNS/Sessions/…` records per the product's own door; PR body header `YAWN-Bot: yawn.bot/new`
- no changes to Q-Space, `/frontier`, `yawn-world-actors.ts`, PR #117 files, providers, mail, crons

### Prerequisites named, not mocked
1. Ruling F-000 (runtime) — DECISION_PACKET D-1.
2. F-040 — a green `yawn:check` baseline on main (repair or revert the backfilled record; branch-protection decision) — D-2.
3. F-010 / N-016 — knowledge of whether `yawn_signal_records` exists in the live project; if it does not, the slice runs locally only and the receipt says `pending_store` — D-3.
4. F-033 — the first-minute shape default (seed; packet collapses to a line) unless Dave overrides — D-4.

### Tests (falsifiers)
| property | test | passes when |
|---|---|---|
| source fidelity | unit: append then list; e2e: type a sentence with quotes, unicode, and a newline, reload | the server row's `source_text` equals the typed text byte-for-byte; the page renders it from the server with localStorage cleared |
| correction event | unit: correct twice | two `correction` rows referencing the source id; the source row unchanged; order stable |
| access isolation | unit: `decideYawnVisibility` for anonymous, another owner-role username, a member, the owner; route test: anonymous GET `/dave/yawns/<id>` | deny, deny, deny, allow; 404-shaped denial that does not confirm existence |
| aperture independence | unit: same viewer, every `?view=` value | identical allow/deny; only ordering/collapse differs |
| resumption | e2e: express, hold, close the browser context, open a new one, sign in, open the route | source, model, question/hold, and corrections all present; no dependence on localStorage |
| fallback opt-in | unit (already reproduced in Lap 0) with the new default | unset ⇒ disabled |
| no new effect | grep + test | no mail, model, or cron path is reachable from the new route |
Plus the product's own gates: `npm run yawn:check`, `yawn:observe -- --check`, `yawn:impact`, `typecheck`, `lint`, focused vitest, `e2e:receipt` on a dedicated port, browser proof with zero console errors.

### Before / after
Before: a sentence at `/new` lives in the browser; the owner's copy is appended under a fixed coordinate that nothing reads; there is no page to return to. After: the same sentence has an address, an event history, a visible reason for the next question, a correction path, and a page that reconstructs it from the server for its owner only.

### Known failures to expect
- `pending_store` locally and possibly in production until the signals migration is confirmed applied (F-010).
- The slice is honestly Dave-only (F-006); a second principal is Lap 2.
- No model answer; a clear question is held, not answered (the answer path needs an attributed provider event, Lap 3/8).

### Rollback and restart
Rollback: `YAWN_FIRST_SLICE_ENABLED` unset; fallback-default revert. Restart: `RUN_RECEIPT.yawn` names the branch, the sha, the flag, and the four prerequisites; a fresh worker reads FINDINGS F-004 and this section and nothing else.

### PR shape
One PR, draft until the four prerequisites are met, body: claim tested · contracts preserved (`inv:default-private`, `inv:aperture-only-narrows`, append-only events) · before/after · compatibility impact (COMPATIBILITY §1–5) · tests · known failures · rollback · restart. Small enough to review in one sitting; if it exceeds ~600 lines of diff, split the read route from the write path.

## Laps 2–8 — dependency-aware outlines

| lap | goal | depends on | first evidence it must return |
|---|---|---|---|
| 2 registry, preferences, grants | an aperture registry adapter over `yawn-projection-preferences.ts` (PRESERVE); a grant object with subject, resource, level, expiry, revocation; PR #117's record views keyed to the coordinate's visibility (F-008) | Lap 1 decision function; D-2 baseline | one saved aperture at one declared scope; one grant issued and revoked with receipts; anonymous public view no longer an existence oracle |
| 3 Perspective Field compatibility layer | attributed answer candidates on the Lap 1 question (`asserted_by`, `perspective_ref`, `epistemic_status`); recognition / endorsement / preference as separate signals; reject-all valid; import the neutral yawn.ai types (F-024) | Lap 1 events; contract PF on PR #29 | one question with Dave's answer, one system hypothesis labeled inferred, one explicit unknown; no forced pair |
| 4 `/dave` root frontier | `/dave` shows 1–3 ranked next turns from records with visible components (D-035), largest lacuna, waiting/delegated states; the rank from `dave.yawn/rank.mjs` becomes the source, not a product ranker | Lap 1 read route; N-028 | the top turn on `/dave` equals `LOOP_STATE.turns.top[0]` with its components shown |
| 5 one local Yawn | question/answer/move frontier on one coordinate; hold with wake condition; advocate/challenger as labeled correlated outputs of one model; replay of rank changes | Laps 3–4 | a move citing its question, answers, evidence, constraint, authority |
| 6 publication and feedback | publish one low-risk expression bound to Yawn + revision + aperture + audience + question; ingest feedback as proposals with source and aperture; no direct mutation (F-025 kernel gap) | Lap 2 grants; Lap 3 candidates | one supportive-but-false and one critical-but-correct feedback handled as proposals; processing failure yields zero credit |
| 7 replay and resurfacing | wire `replayYawnEvents` with a viewer parameter; `effective_at`; per-Yawn timeline; relevance-triggered resurfacing of one older record | Lap 1 events; F-012 | an older distinction returns because a new event made it relevant, with its source intact |
| 8 embodiment, sensitive domains, provider swap | Yawnbot shell over the same events; health and relationship boundaries (privacy, uncertainty, consent, no impersonation); provider-as-record (T-066) and vault beyond OpenAI (F-036); Nestheads parity test | Laps 5–7 | provider swap preserves identity, preferences, grants, history, proof |

## The alternative: Lap 1 on yawn.ai
Cost: no local clone or merge plane; last commit 2026-08-17; production sha unknown relative to main (F-021); 153-error-free? unknown until its typecheck finishes; the voice UI is orphaned (F-022); the same first slice would have to be built beside a larger, older surface. Benefit: the answer/expression/feedback server paths already exist and are reachable. Uncertainty: whether anyone uses them. Recommendation stands: build the slice where the records, the plane, and the deployments are, and import yawn.ai's neutral types in Lap 3.
