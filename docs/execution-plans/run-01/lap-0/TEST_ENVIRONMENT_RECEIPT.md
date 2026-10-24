# Test-environment receipt — Run 01 · Lap 0

Every row is a command that was actually run on 2026-09-05, with the runner's own exit code captured directly (never through `tail`/`head`). Environment label says what the shell could reach. No command in this lap could send mail, call a paid provider, or write to a database: no `.env*` file was present in any worktree, and `RESEND_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `CRON_SECRET`, `ANTHROPIC_API_KEY`, `OPENAI_API_KEY` were unset in every test shell (`secrets_in_env=0` checked before the yawn.bot run). `NEXT_TELEMETRY_DISABLED=1`, `CI=1`. Node v24.11.1 throughout. Logs are kept in the private session scratchpad and summarized here; exact lines quoted where a finding depends on them.

## Preflight (what each command could touch)
| command family | target | credentials reachable | mail / paid model | database | other scripts |
|---|---|---|---|---|---|
| `run-loop.mjs --write` (dave.yawn) | local files only | none | none | none | spawns a Windows toast via PowerShell when the needs-you count changes; does not call `surface-sync.mjs` (which fetches yawn.bot) |
| yawn.bot `npm ci`, `typecheck`, `lint`, `test` (vitest jsdom), `yawn:check` | worktree only | none | none | none | `assets:nestville-west` (rewrites a tracked manifest) |
| yawn.bot `npm run build` | worktree; Next build | none | none | none | runs `assets:nestville-west` first |
| yawn.bot `npm run e2e:receipt` | Playwright against its own dev server on `127.0.0.1:3121` (`PLAYWRIGHT_PORT=3121`, `PLAYWRIGHT_BASE_URL` unset) | none; the config sets `NESTHEADS_DEV_DAVE_FALLBACK=true` for that local server only | none | none | Next dev server |
| yawn.ai `npm ci --ignore-scripts`, `tsc --noEmit`, `vitest run` | blob-less clone; root package only | none | none | none | `prepare` (husky) skipped by `--ignore-scripts` |
| yawn `npm ci --ignore-scripts`, `next build`, `tsc --noEmit` | blob-less clone `web/` | none | none | none (the failing prerender is the finding) | none |
| .yawn `npm test`, `validate-hub-links.mjs`, `contracts npm run check` | worktree | none | none | none | ajv validators |

## yawn-ai/yawn.bot @ 87e84c4 (fresh worktree, real `npm ci`, 962 packages in 33 s)
| step | command | exit | result | note |
|---|---|---|---|---|
| 1 | `npm run typecheck` (before manifest) | 2 | 1 error: cannot find `../generated/nestville-west-runtime-assets-manifest.json` | F-041 |
| 2 | `npm run lint` | 0 | clean | |
| 3 | `npm test` (before manifest; includes one temporary repro file) | 1 | Test Files 5 failed / 412 passed (417); Tests 2 failed / 2091 passed (2093) | 4 files fail on the manifest import; 2 tests fail in `yawn-contract-network` |
| 4 | `npm run yawn:check` | 1 | Test Files 1 failed / 3 passed; Tests 2 failed / 35 passed (37) | F-040: six contract errors on `YAWNS/Sessions/YAWNBOT_INTELLIGENCE_CONTAINER_CLARIFICATION_2026_09_03.yawn` |
| 5 | `npm run assets:nestville-west` | 0 | manifest generated; tracked `public/nestheads/runtime/nestville-west/v1/manifest.json` modified (reverted afterwards, not committed) | |
| 6 | `npm run typecheck` (after manifest, with the temporary repro file present) | 2 | 3 errors, all in the temporary file (`NODE_ENV` read-only assignment) | product code: 0 errors |
| 7 | focused re-run: `nestville-west-map`, `worker-load-gauge`, `yawn-interface-account-control`, `yawn-interface-level-card`, `yawn-contract-network` | 1 | 4 files pass; `yawn-contract-network` 2 failed / 25 passed | confirms F-040 is real, F-041 is setup |
| 8 | repro `tests/unit/lap0-access-repro.test.ts` (temporary, deleted) | 0 | 6/6 passed | F-005, F-006, F-007 reproduced at function level |
| 9 | `npm run build` (first attempt, temporary file present) | 1 | compiled; failed on the temporary file's type errors | superseded by row 11 |
| 10 | `npm run e2e:receipt` on port 3121 (137 specs, 18.1 min; receipt `automation-artifacts/e2e-receipts/2026-09-05T22-41-58-581Z/receipt.json`, git head 87e84c4) | 1 | 111 passed, 26 unexpected, 0 flaky | this run overlapped the yawn.ai typecheck (≈3 GB); one failure carried `ERR_NO_BUFFER_SPACE`, one `ERR_CONNECTION_RESET`, 11 timeouts — contaminated, superseded by row 10b |
| 10b | `npm run e2e:receipt -- --last-failed` on an idle machine (26 specs, 6.7 min; receipt `…/2026-09-05T23-00-41-157Z/receipt.json`) | 1 | **18 failed, 8 passed** | error kinds: 9 element(s) not found, 5 toHaveAttribute, 5 toBeVisible, 2 click timeouts, 1 strict-mode locator, 1 toContain — assertion failures, not environment noise. F-042 |
| 11 | `npm run build` (temporary file removed; manifest step included) | 0 | `✓ Compiled successfully`; tracked manifest reverted afterwards | |
| 12 | `npm run typecheck` (final, temporary file removed, manifest present) | 0 | 0 errors | the clean baseline claim for main 87e84c4 is: typecheck 0 · lint 0 · unit 2 failed (contract network, F-040) · e2e 18 failed (F-042) |

Specs still failing on the idle rerun (file:line, spec title truncated): `dave-council-settlement.spec.ts:56`; one private-relationship spec (name withheld here; in the private receipt); `friends.spec.ts:34`; `interface-field.spec.ts:3`, `:633` (signed-out root and `/dave` public mission), `:1192` (owner New Yawn deconstructs sources); `v1-happy-path.spec.ts:3` (V1 happy path), `:2050` (logging out shows the signed-out header); `yawn-bubble-pathing.spec.ts:3`; `yawn-coordinate-frame.spec.ts:41` (`/new` questions), `:75` (`/dave` through the frame), `:190`; `yawn-holarchy-field.spec.ts:4`, `:77`; `yawn-index-auth-state.spec.ts:419` (public `/new` cognition ranker), `:580` (authenticated development owner observation); `yawn-moves.spec.ts:13`; `yawn-patterns-type.spec.ts:294`. Not diagnosed in this lap; the first slice starts by diagnosing the `/new`, `/dave`, coordinate-frame, and auth-state ones.

Contract-network errors on main (row 4, verbatim from the assertion diff):
```
YAWNS/Sessions/YAWNBOT_INTELLIGENCE_CONTAINER_CLARIFICATION_2026_09_03.yawn is missing a stable coordinate.
… is missing Agent Orientation Elevation.
… is missing the You are here first-answer invariant.
… is missing the visible-inference role invariant.
… must declare mutationAuthorized: false in frontmatter.
… must declare externalEffectsAuthorized: false in frontmatter.
```

## yawn.bot PR #117 @ d3239eb (existing worktree, existing node_modules)
| step | command | exit | result |
|---|---|---|---|
| 1 | repro `tests/unit/lap0-record-access-repro.test.ts` (temporary, deleted) | 0 | 1/1 passed: anonymous `read_view` and `download_record` on the static public view allowed; private denied (F-008) |

## yawn-ai/yawn.ai @ b3333db (blob-less clone; `--ignore-scripts` environment — not an unqualified baseline)
| step | command | exit | result |
|---|---|---|---|
| 1 | `npm ci --no-audit --no-fund --ignore-scripts` (root only; `mcp-server/` NOT_INSTALLED) | 0 | 746 packages in 37 s |
| 2 | `npx tsc --noEmit` | STOPPED (TYPECHECK_TIMEOUT) | no output after 16 min at ~3 GB working set; stopped by hand at 22:50:46Z under the lap's ten-minute cap for this repository; the brief's drift claims rest on S3's static file:line evidence (F-023), not on a typecheck |
| 3 | `npx vitest run` | 0 | Test Files 20 passed (20); Tests 129 passed (129) — in the `--ignore-scripts` environment |

## yawn-ai/yawn (blob-less clone, `web/`, `--ignore-scripts`)
| step | ref | command | exit | result |
|---|---|---|---|---|
| 1 | main 21b973c | `npm ci --ignore-scripts` | 0 | |
| 2 | main 21b973c | `npx next build` | 1 | `✓ Compiled successfully`; `Skipping validation of types`; `Skipping linting`; `Error occurred prerendering page "/yawns"`; `ReferenceError: taskSupabaseClient is not defined` |
| 3 | main 21b973c | `npx tsc --noEmit` | 2 | 153 errors |
| 4 | pr1-head 9468bf2 | `npx next build` | 1 | identical failure |
| 5 | pr1-head 9468bf2 | `npx tsc --noEmit` | 2 | 153 errors; diff against main's error set: empty |
Config: `web/next.config.js` `typescript.ignoreBuildErrors: true`, `eslint.ignoreDuringBuilds: true`. Conclusion in F-001.

## yawn-ai/.yawn @ 467facb + this branch (worktree `proposal/run-01-lap-0`)
| step | command | exit | result |
|---|---|---|---|
| 1 | `npm ci` | 0 | 5 packages |
| 2 | `npm test` (six validators + node tests) | 0 | 9 tests pass |
| 3 | `node scripts/validate-hub-links.mjs` (after adding the docs/README pointer) | 0 | 24 hub documents validated |
| 4 | `contracts: npm ci && npm run check`; `git diff --exit-code -- contracts/src/generated.ts` | 0 / 0 | type generation current (a CRLF-only working-copy change was discarded) |
| 5 | `python scripts/validate-public-surfaces.py` | NOT RUN | Python is not installed on this machine; CI runs it; this branch adds no file in that validator's list |

## dave.yawn (private; recorded here as commands only)
| step | command | exit | result |
|---|---|---|---|
| 1 | `node Yawns/continuity-loop/run-loop.mjs .` (dry, no `--write`) | 0 | level D; 366 records; 1 pre-existing problem (`schema_version_missing` on one 2026-08-28 record); next sequence 308 |
| 2 | append turn (single process, id allocated from a fresh read) | 0 | `T-074` allocated after `T-073`; one occurrence verified |
| 3 | `run-loop.mjs . --write` and receipt append | PENDING (end of lap) | |
