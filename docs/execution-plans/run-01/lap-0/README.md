# Run 01 · Lap 0 — architecture truth map

Status: proposal (draft PR https://github.com/yawn-ai/.yawn/pull/30), recorded 2026-09-05 by `agent:anthropic:claude-code` (Claude Fable 5.1) as the primary builder for YAWN Execution Run 01. Nothing here is ratified; the reviewer challenges it; Dave rules on the decision packet. Lap 1 has not started.

Purpose of the lap, as amended by Dave: establish where the product actually runs, where its authoritative state comes from, what already works, what is unsafe or contradictory, and the smallest next change that lets Dave entrust something to it.

The brief this lap audits is [`../../theory-carries-builder-run-01-v0.3.md`](../../theory-carries-builder-run-01-v0.3.md) as it stands on PR #29 (`54ef77f`). The lap corrects the brief where the repositories disagree with it; it does not force the repositories to match the brief.

## Read in this order
1. [`FINDINGS.yaml`](FINDINGS.yaml) — the single source: pinned references, every finding with citations, tag, evidence class, resolution, and blank reviewer fields.
2. [`CONTRADICTION_REGISTER.md`](CONTRADICTION_REGISTER.md) — the findings in consequence order.
3. [`DECISION_PACKET.md`](DECISION_PACKET.md) — the five decisions only Dave can make, each with a default.
4. [`IMPLEMENTATION_PLAN.md`](IMPLEMENTATION_PLAN.md) — Lap 1 in detail; Laps 2–8 as outlines.
5. [`SOURCE_OF_TRUTH_MAP.md`](SOURCE_OF_TRUTH_MAP.md), [`ARCHITECTURE_MAP.md`](ARCHITECTURE_MAP.md), [`DATA_AND_AUTHORITY_FLOW.md`](DATA_AND_AUTHORITY_FLOW.md), [`COMPATIBILITY_MIGRATION_PLAN.md`](COMPATIBILITY_MIGRATION_PLAN.md) — the evidence views.
6. [`TEST_ENVIRONMENT_RECEIPT.md`](TEST_ENVIRONMENT_RECEIPT.md) and [`RUN_RECEIPT.yawn`](RUN_RECEIPT.yawn) — what was run, with exit codes, and every write this lap performed.

## The one-paragraph answer
The operational product is `yawn-ai/yawn.bot` (main = production at the inspected sha). The brief was written against `yawn-ai/yawn.ai`, which holds the older voice, answer, expression, and feedback mechanisms; those are lineage and reuse, not the build target. The "failing temporal-header PR" sits on a third, dormant repository whose main already fails to build. On yawn.bot, a sentence typed at `/new` never becomes an addressable Yawn and is never read back; that is the first slice. Before it can be built with a green baseline, Dave must rule on the runtime, on the record that was pushed straight to an unprotected main and broke the product's contract gate, and on a read-only look at which migrations the live database applied.
