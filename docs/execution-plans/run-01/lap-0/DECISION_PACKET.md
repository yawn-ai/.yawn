# Decision packet — Run 01 · Lap 0

Only decisions the evidence could not settle. Each has a recommendation and a default that applies if no ruling arrives, so the absence of a ruling never silently becomes one. Rulings are Dave's; the reviewer may challenge the recommendations.

## D-1 · Where does Lap 1 build? (F-000, D-022, N-026)
Evidence: yawn.bot is the deployed operational application at the inspected sha, with the merge plane, the record network, 416 tests, and every ruling since 2026-08-18. yawn.ai holds the older mechanisms; its production sha is not on its main history. yawn is dormant.
Recommendation: yawn.bot. yawn.ai mechanisms are lineage; their neutral types are imported in Lap 3.
This does not decide N-026 or D-022 (semantic coordinates under `yawn.ai/ontology/*`, "one app two hosts"); those stay open and are not blocked by this.
Default if unruled: Lap 1 does not start.

## D-2 · Main is unprotected and its deployed sha fails the contract gate (F-040)
Evidence: a record was pushed directly to `yawn-ai/yawn.bot` main by the org account on 2026-09-03 with no PR; main has no branch protection; `npm run yawn:check` fails on that sha with six errors on one file.
Two rulings: (a) repair the record (add coordinate, Agent Orientation Elevation, the two invariants, the two effect booleans) or revert the commit; (b) whether direct pushes by the org account are sanctioned, and whether main gets branch protection with `yawn:check` required.
Recommendation: repair via a normal PR under `YAWN-Bot: yawn.bot/ontology/merge`; protect main with the contract suites required; record the org-account push policy explicitly.
Default if unruled: Lap 1 cannot claim a green baseline; it proceeds locally only.

## D-3 · Read the live project's applied migrations (F-010, N-011, N-016)
Evidence: two migration trees; the code reads the canonical tree; whether `yawn_signal_records` and the canonical tables exist in production is unknowable from the repo; N-016 says the signal-store migration is still to be applied via the dashboard.
Ask: one read-only look at `supabase_migrations.schema_migrations` (or the dashboard's migration list) under Dave's grant, names only. No apply.
Default if unruled: Lap 1 runs against local or `pending_store` and the receipt says so.

## D-4 · First-minute shape (F-033, D-032)
Open question in the records: does the minimal seed replace the nine-question packet on the draft screen, or does the packet collapse to a "0/9 answered" line?
Recommendation and default: the seed; the packet collapses to one line; a clear question in the sentence is held as a question, never turned into an interview.

## D-5 · GPT's review entry in the holarchy (F-017)
Evidence: review authorized in chat; the recorded reviewer role is Codex's; no `AgentSpace/Agents/gpt.yawn`.
Ask: is a durable agent record required before GPT's `gpt_status` / `G-NNN` entries count? Review authorization does not confer runtime access, merge authority, or the Codex identity either way.
Default if unruled: GPT's entries are accepted as attributed review only.

## Not asked (decided by default in the plan, reversible)
- The development fallback becomes opt-in (literal `true`) in Lap 1 — a local-workflow change, no production effect (COMPATIBILITY §5).
- Lap 1 is Dave-only; a second principal is Lap 2.
- Lap 0 artifacts live in `yawn-ai/.yawn` under `docs/execution-plans/run-01/lap-0/` on `proposal/run-01-lap-0`, cut from main and referencing PR #29 by sha.
