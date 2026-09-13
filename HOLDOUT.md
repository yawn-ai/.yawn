# HOLDOUT — can this repository's stated judgments be predicted from the rest of it?

The protocol was written to `HOLDOUT_METHOD.md` and committed **before** selection, prediction and
scoring. Nothing in it was revised after a number was visible. The result below is reported as it came out.

## Question

If a reader who has never opened file F can predict F's stated preferences from the other 174 files,
those preferences are largely restatements of a house line. If prediction fails, they carry real
per-file information.

## Result

| | |
|---|---|
| Held-out files | 20 |
| Actual STATED judgments in them | 155 |
| Predictions made | 91 |
| MATCH — same chosen **and** same rejected pole | **27** |
| PARTIAL — right chosen pole, wrong rejected pole | 12 (never counted as a match) |
| MISS | 52 |

**Precision 0.297  ·  Recall 0.174  ·  F1 0.220**

Had PARTIAL been counted generously as a match — it was not — precision would be 0.429 and recall 0.252.

## What it means

**The house pattern is learnable; the thinking is not.** The aggregate hides a sharp split:

| File | Actual | Predicted | Matched | Recall |
|---|---:|---:|---:|---:|
| `observations/node.yawn` | 1 | 2 | 1 | 1.00 |
| `migrations/node.yawn` | 6 | 5 | 4 | 0.67 |
| `question-packets/basic.yawn` | 5 | 5 | 3 | 0.60 |
| `agents/yawn.bot.yawn` | 2 | 7 | 1 | 0.50 |
| `fixtures/node.yawn` | 2 | 5 | 1 | 0.50 |
| `dave/number-sense/model.yawn` | 9 | 4 | 3 | 0.33 |
| `declaration-of-agency/node.yawn` | 3 | 3 | 1 | 0.33 |
| `examples/relationship-commitment-conversation.yawn` | 3 | 6 | 1 | 0.33 |
| `scripts/node.yawn` | 6 | 3 | 2 | 0.33 |
| `agency-declaration/node.yawn` | 4 | 3 | 1 | 0.25 |
| `questions/what-is-this.yawn` | 8 | 4 | 2 | 0.25 |
| `interface/objective-compiler.yawn` | 10 | 6 | 2 | 0.20 |
| `shape/orientation-shape.yawn` | 12 | 5 | 2 | 0.17 |
| `q-space/node.yawn` | 10 | 5 | 1 | 0.10 |
| `schemas/node.yawn` | 12 | 4 | 1 | 0.08 |
| `readme.yawn` | 34 | 6 | 1 | 0.03 |
| `database/feedback-intake.yawn` | 1 | 4 | 0 | 0.00 |
| `feedback/email-intake.yawn` | 1 | 4 | 0 | 0.00 |
| `references/RELATIONSHIP_FIRST_RESEARCH_BRAID.yawn` | 23 | 6 | 0 | 0.00 |
| `start/how-to-use-yawn.yawn` | 3 | 4 | 0 | 0.00 |

Small formulaic `node.yawn` cards predict well — `observations/node.yawn` 1.00, `migrations/node.yawn`
0.67, `question-packets/basic.yawn` 0.60. The substantive documents do not — `readme.yawn` 0.03,
`references/RELATIONSHIP_FIRST_RESEARCH_BRAID.yawn` 0.00. The convention is real and reproducible,
and it stops exactly where the actual reasoning starts.

## Limits of this result — read before quoting the number

**The answer key is an extraction, not ground truth.** The 'actual' judgments are this project's own
output. Low recall can mean the content is genuinely file-specific, *or* that the extractor's
particular carving and pole-framing is what's unpredictable. `readme.yawn` shows this plainly: 34
actual judgments against 6 attempted predictions, so its 0.03 recall is substantially a granularity
mismatch rather than demonstrated ignorance.

**Precision is the sounder half.** ~70% of specific claims about what a file states were simply
wrong, and that does not depend on how finely the answer key was carved.

**Load is uneven, and this was recorded before scoring.** `readme.yawn` holds 34 of the 155 and
`RELATIONSHIP_FIRST_RESEARCH_BRAID.yawn` another 23, so aggregate recall is dominated by two files.
That is why per-file scores are above.

## Integrity checks

**Leak check — my detector was wrong twice before it was right.** The first pass reported nothing.
The second reported 16 own-target reads and I nearly voided the run. Reading the actual commands,
every hit was either a `cat > predictions-N.json <<'JSON'` heredoc — a predictor *writing its own
answers*, which contain the target filenames — or `grep -rn "readme.yawn" tests/ lib/ docs/`,
searching other files for references. The third pass strips heredoc bodies and excludes quoted grep
patterns, and finds **zero predictors read their own answer key**. The agents were honest; the check
was not. It is reported here because a verification step that fails silently is worse than none.

**Three genuine cross-group reads did occur** — `predict:g1` read `schemas/node.yawn`, `predict:g3`
read `readme.yawn` and `database/feedback-intake.yawn`. These violate the protocol's letter (it
forbade all 20 files to everyone) but cannot inflate any score, because each predictor is graded only
on its own five files and none read any of those. `predict:g3` gained slightly more corpus context
than allowed, which is disclosed rather than corrected.

**Scoring was cross-graded**: scorer *s* graded a different predictor's group, so nobody marked their
own work. Matching required both poles to agree; ties broke downward.

**One deviation, checked, no effect.** Python's `glob` skips hidden directories, so `.github/node.yawn`
and `.github/ISSUE_TEMPLATE/node.yawn` were absent from the eligibility population. Both carry 0
STATED judgments and were never eligible under the committed rule, so the draw stands unaltered.
