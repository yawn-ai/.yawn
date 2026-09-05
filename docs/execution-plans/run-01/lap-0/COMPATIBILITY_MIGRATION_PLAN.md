# Compatibility and migration plan — Run 01 · Lap 0

Scope: only what the first slice (IMPLEMENTATION_PLAN Lap 1) touches on `yawn-ai/yawn.bot`. Nothing here is executed in Lap 0. Rule throughout: old records stay readable through adapters; nothing is backfilled with richer meaning than it originally carried.

## 1. Signal records (`yawn_signal_records`)

Today: `SignalKind = dialogue_turn | vote | acceptance | mail_message`, untyped `payload`, exact-coordinate reads (`src/lib/yawn-signals/store.ts`).

Change: add versioned kinds `source_event`, `model_proposal`, `question_selected`, `hold`, `correction`, each with a zod payload schema (`yawn.source-event.v1` etc.) carrying `asserted_by`, `epistemic_status`, `source_ref` (for corrections and proposals), and `effective_at` when it differs from `recorded_at`.

Compatibility:
- Readers treat unknown kinds as opaque and keep them in order; existing four kinds are unchanged and never reinterpreted (a `vote` stays a vote; it is not promoted to "endorsement").
- The existing `/new` rows under `dave/operating-map/cognition-ranker` are left as they are; the correction flywheel keeps reading `dave/operating-map` exactly as before.
- If the table's `kind` column carries a CHECK constraint, one additive migration in the canonical tree widens it; no rows change. Whether the table exists in the live project is unknown (F-010, N-016); the code's `pending_store` degradation remains the fallback and the receipt must say which occurred.

## 2. The `/new` draft in the browser

Today: `localStorage["yawn:new:chat-aperture:v1"]`, capped, older text dropped.

Change: on the first successful server write the draft is imported as the `source_event` verbatim; the key is neither renamed nor cleared by Lap 1 (a later lap may retire it once the server read-back is proven). The cap stays; the receipt notes it as a known loss until the server copy exists.

## 3. Coordinates

Today: `/new` writes under one fixed Dave coordinate; product routes derive from slug/parent chains; PR #117 parses `<handle>/<path>`.

Change: Lap 1 mints `<owner-handle>/yawns/<id>` for the first slice, where `<id>` is the server-generated stable id (not the lossy 7-char display id). No existing coordinate is renamed. N-026 and D-022 (semantic coordinates under `yawn.ai/ontology/*`) are untouched; the minted coordinate is an operational address, and the record says so.

## 4. Visibility decision

Today: three vocabularies (F-009) and a fail-open renderer branch (F-007).

Change: one function, `decideYawnVisibility(record, viewer) → allow | deny(reason)`, deny by default, used by the new read route. Adapters map the two existing shapes into its input: `full/summary_only/hidden × role` and PR #117's `private/participants/public × capability` (if #117 has merged; otherwise the adapter is written against its domain module as a pending dependency). The three older modules are not deleted in Lap 1; `canRenderYawnVisibility`'s `!contract → true` branch is left in place and marked in the receipt because inverting it changes world rendering for owner-only data (F-007), which is a separate reviewable change.

## 5. Development fallback

Today: `NESTHEADS_DEV_DAVE_FALLBACK` unset ⇒ enabled outside production.

Change: unset ⇒ disabled; only the literal `true` enables. Impact: local developers must set the variable (Playwright already does in `playwright.config.ts`; `.env.example` gains the line). No production impact (double gate already blocks it there). The route `src/app/auth/development-dave/route.ts` keeps its weaker gate but only clears cookies.

## 6. Objective-required promotion vs optional targets

The brief's item. On the traced yawn.bot path no objective type is required to create anything; the yawn.ai lineage (`STATE_TARGET_ONTOLOGY`, promotion levels) is not present. Proposed rule for the contracts, not for Lap 1 code: a Yawn may exist with `target: null`; promotion to an objective is an explicit, attributed event; older records that assumed objectives stay valid as written. This is a `.yawn` proposal (RULING_REQUIRED) and blocks nothing in Lap 1.

## 7. What is never backfilled

- old `vote`/`acceptance` signals are not relabeled as recognition, endorsement, or evidence;
- yawn.ai `SurfaceVoice` rows with `protected_need`/`bias_tag` are not imported anywhere;
- no historical `effective_at` is invented for rows that only have `recorded_at`;
- deleted Yawns are not reconstructed as tombstones after the fact.

## 8. Rollback

Lap 1's new kinds, route, and decision function ship behind `YAWN_FIRST_SLICE_ENABLED` (default off). Rollback = unset the flag; rows already written remain valid signal records and are ignored by older readers. The fallback-default flip (§5) is a one-line revert.
