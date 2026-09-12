# .yawn — read this first

An open protocol for inspectable orientation and agency, kept as plain-text
`.yawn` records with an executable layer (schemas, validators, 130+ tests)
underneath. The records are the source; every page and index is a View.

You are an agent working inside a principal's space. You may read, orient,
mirror, infer, ask, and propose. You may not ratify, activate, spend, publish,
or raise your own authority. That is the whole posture; the rest is detail.

## Read in this order

1. `readme.yawn` — root orientation. `yawn.yawn` is the manifest; its link
   tables are generated (`scripts/generate-manifest.mjs`), so trust the tree
   over the manifest if they ever differ.
2. `core/proof-and-boundary.yawn` — the safety rails and the two gates:
   only authorized events update canonical state; only evidence upgrades a claim.
3. `agents/yawn.bot.yawn` — what a bot may do without authority and what is
   blocked without current exact authorization.
4. `core/entity-and-coupling.yawn` — who the entities are (Dave, yawn.bot, a
   third whose name is held) and what `/` between them means.
5. `records/yawn.bot-state.yawn` — the bot's honest state, the settled role,
   and `next_question`: the one highest-leverage open decision.

## Run before you push

```bash
npm ci && npm test          # validators first, then 130+ assertions; CI runs exactly this
node scripts/validate-hub-links.mjs
```

`npm run validate` runs every `scripts/validate-*.mjs` plus the manifest check.
If `generate-manifest.mjs` fails, run it with `--write`; it only appends.

## Rules that are tested, so they are real

- **Status is lifecycle only.** `status:` is one of `draft | active |
  superseded | archived | deleted`. Version goes in `spec_version:`,
  authority in `ratification_status:`, loop position in `loop_status:`.
  Existing off-enum values are grandfathered by file in
  `tests/status-vocabulary.test.mjs`; the ledger may only shrink.
- **`epistemic_status`** is `observed | reported | inferred | assumed |
  predicted | disputed | unknown`. Nuance goes in `epistemic_note:`.
- **`authored_by`** is `dave-human | agent-on-behalf | yawn.bot |
  unattributed`, and `agent-on-behalf` names the agent in `authored_via:`.
  Required under `decisions/`, `dave/`, and on the bot-state record. You are
  `agent-on-behalf`. Never write `dave-human` for something you produced.
- **Every template declares `record_shape:`**; `header` is canonical for new
  records. `templates/node.yawn` holds the registry.
- **A `proof:` block names something runnable** — a test, a validator, a
  record — and every path in it must exist (`scripts/validate-proof-refs.mjs`).
  Add `covers:` naming the top-level keys it actually tests, and `not_covered:`
  for claims it does not. A proof that covers a different claim than the one
  above it is worse than none.
- **Naming.** The product is `YAWN`; the extension is `.yawn`, lowercase.
  `.ion`, `.yon`, `.ywn` are invalid aliases and speech-to-text errors;
  `scripts/validate-canonical-extension.mjs` rejects them in tracked content
  outside a `yawn-invalid-alias-guard:start/end` block. If a spoken name
  collides with the guard, do not normalize and do not create: write it inside
  a guard block and open a decision (see `decisions/053`).
- **Folders carry `node.yawn`.** `dave/<slug>/` carries `model.yawn` and
  `index.html` instead, and `scripts/validate-mental-models.mjs` checks that
  the page mirrors the record.

## Provenance, in one paragraph

A STATED judgment is written in the repo as a preference. A REVEALED judgment
is a reading of what an artifact does. A revealed reading is not the author's
and does not become the author's by being plausible; it may be called
established only when a test, validator, or recorded outcome confirms the
behaviour — and even then the behaviour is established, not the intent.
`JUDGMENTS.md` carries 1249 of these with provenance tags; `TAXONOMY.md` is
the merge record behind it and can be argued with row by row; `HOLDOUT.md`
reports how predictable the stated judgments turned out to be (not very).

## Decisions

`decisions/` holds the questions Dave has not answered, one record each,
numbered by leverage (formula stated in every record). Each has options,
evidence on both sides by judgment id, an attributed recommendation with
`authority: none`, and an empty `choice:`. To ratify one, Dave fills
`choice.selected_by`, `choice.option_ref`, `choice.authority_ref`, changes the
governing record, adds the test named in `proof_needed`, and marks the decision
`superseded`. A bot never fills `choice:`. The top record is `next_question` in
`records/yawn.bot-state.yawn`; a chat surface that opens on a new entry should
show that question.

## The settled role

Dave's answer to "what am I to be?" is settled in
`core/entity-and-coupling.yawn` (steward of yawn.bot, with the why attached).
When that question resurfaces, answer from the record — "last time we checked…"
— and do not reopen it unless Dave corrects it. The open slot at the top of
Dave's list is the next question, not that one.

## Do not

- commit, push, open or merge a PR, deploy, publish, send, spend, or mutate an
  external store without current exact authorization for that specific act
- write `choice:` in a decision, `ratification_status: accepted`, or an
  activation receipt
- copy a `C:/Users/...` path into a new record; those are external and
  unverifiable (`validate-proof-refs.mjs` reports them and will not accept new ones)
- normalize a spoken name that hits the alias guard, or create a file under it
- claim a bot state the ledgers cannot show; the last observed run is in the
  state record with its source
