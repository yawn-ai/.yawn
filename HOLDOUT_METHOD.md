# HOLDOUT PROTOCOL — committed BEFORE selection, BEFORE prediction, BEFORE scoring
# Written at the point where the extraction corpus existed but no holdout had been chosen
# and no predictor had been run. Nothing below may be revised after seeing a score.

## Question
Are the STATED judgments in this inventory predictable from the rest of the corpus?
If a fresh reader who has never opened file F can predict F's stated preferences from the
other 174 files, then those judgments are largely restatements of a house line rather than
independent choices. If prediction fails, the stated judgments carry real per-file information.

## Scope
STATED judgments only. REVEALED judgments are excluded: they are extractor inferences
(see provenance rules), not authored text, so "predicting" them would score the extractor
against itself.

## Selection rule (fixed now)
- Population: .yawn files that yielded >= 1 STATED judgment in the completed extraction.
- Stratify by top-level directory; allocate proportionally; take 20 files total.
- Deterministic ordering: sha256(path), ascending, take the first k per stratum.
  No reroll. The first draw is the draw.
- The selected list is written to holdout-files.txt and is not changed afterwards.

## Information the predictor MAY see
- The full judgment index for the OTHER 174 files (STATED and REVEALED).
- For each held-out file: its path only, plus its `id:`, `title:`, `kind:` and `status:`
  lines. Nothing else. That is enough to know what the file is for, not what it says.
- The repository's directory structure and the non-held-out files in full.

## Information the predictor MAY NOT see
- The body of any held-out file.
- Any extracted judgment anchored to a held-out file.
The predictor is instructed not to open the held-out files. COMPLIANCE IS VERIFIED, not
trusted: after the run, its transcript is grepped for reads of the held-out paths, and any
leak is reported and the affected file dropped from scoring.

## Prediction format
For each held-out file, the predictor emits 0..N predicted STATED judgments as
chosen / rejected / difference, plus a confidence. Predicting nothing for a file is allowed
and is not penalised beyond the recall it costs.

## Scoring (fixed now)
A prediction matches an actual STATED judgment when an independent scorer judges that both
name the same chosen pole AND the same rejected pole for the same file. Same topic is not a
match. Same chosen pole with a different rejected pole is not a match — it is logged as
PARTIAL and reported separately, never folded into the headline number.
- precision = matched predictions / total predictions
- recall    = matched actuals / total actual STATED judgments in held-out files
- Scoring is done by an agent that sees predictions and actuals but did not produce either.

## Reporting
The score is reported as-is, whatever it is, including if it is bad or if the result is
uninformative. No re-running with a different holdout. No dropping a stratum that scored
badly. If the protocol breaks (e.g. leak), that is reported as the result.

---

# EXECUTION LOG (append-only; written after selection, before any prediction or score)

## Draw executed
Population: 150 .yawn files carrying >= 1 STATED judgment.
Selected: 20 files, carrying 155 actual STATED judgments between them.
Predictor index: 964 judgments. 285 judgments were withheld because they touch a held-out
file — stricter than "judgments anchored to the file", to close cross-reference leakage.
Selection written to holdout-files.txt and holdout-selection.json. Not revised.

## Deviation found and checked — NO effect on the draw
The population was computed with Python glob, which silently skips hidden directories. Two
files were therefore absent from the eligibility population:
    .github/node.yawn
    .github/ISSUE_TEMPLATE/node.yawn
Checked before running any prediction: both carry 0 STATED judgments (7 and 2 REVEALED
judgments respectively). Under the committed rule "files that yielded >= 1 STATED judgment"
neither was ever eligible, so their absence changed nothing. The draw stands unaltered.
Recorded here rather than silently corrected. Had either carried a STATED judgment, the
correct action would have been to redraw — fixing an implementation error against a
pre-committed spec before any outcome is observed is not tuning to a result — and that
redraw would have been logged here with the same prominence.

## Known limitation of this holdout, stated before scoring
The 20 files are very unevenly loaded: readme.yawn carries 34 of the 155 stated judgments
and RELATIONSHIP_FIRST_RESEARCH_BRAID.yawn carries 23, while six files carry 1-3 each.
Aggregate recall will therefore be dominated by two files. Per-file scores are reported
alongside the aggregate so this cannot hide inside a single number.
