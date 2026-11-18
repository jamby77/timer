# Running tests

Use pnpm from the repository root.

| Command                                                       | Coverage                                                    |
| ------------------------------------------------------------- | ----------------------------------------------------------- |
| `pnpm test:unit --run`                                        | Configuration/storage and sound unit tests in Node          |
| `pnpm test:browser --run`                                     | Timer engines, React hooks, and component tests in Chromium |
| `pnpm test:run`                                               | Both projects plus Storybook interaction tests              |
| `pnpm exec playwright test`                                   | App-level E2E tests with a development server               |
| `pnpm exec playwright test --config playwright.pwa.config.ts` | Production-only PWA installation tests                      |

Omit `--run` from the unit/browser commands for watch mode. To select a file, append its path.
The main Vitest configuration reuses `vitest.unit.config.ts` for the Node project. Library
configuration and sound tests run there; timer-engine tests run with native browser animation
frames alongside the hooks and components. Playwright E2E files belong exclusively to Playwright.
Storybook stories remain in the Storybook project.

## Run app tests against a local production build

Run `pnpm build && pnpm start --port 3025` in one terminal. Once the server is
ready, run the following command in another terminal:

```sh
PLAYWRIGHT_BASE_URL=http://localhost:3025 pnpm exec playwright test --workers 4 --retries 0
```

With `PLAYWRIGHT_BASE_URL` set, the app suite uses the running server. Omit it
to let Playwright manage the development server.

## App regression suite verification on 2026-11-18

All 179 app E2E tests across 26 files passed with four parallel workers against
the production app on `http://localhost:3025`.
Lint and TypeScript checks also passed. The separate production-only PWA suite
and Vitest projects were not rerun for this test-fixture change.

The initial run was stopped after four overall-limit failures exposed missing
phase configuration names (20 passed and four were interrupted). Fixtures for
overall limits, interval controls, and Work/Rest completion and controls now
include required nested configuration IDs and names. Work/Rest fixtures supply
only the fields for their selected fixed-rest or ratio mode. Production
validation and all existing runtime assertions remain unchanged.

## Verification on 2026-11-17

- Node: 5 files, 66 tests passed.
- Chromium browser project: 8 files, 125 tests passed.
- Storybook: 13 files, 51 tests passed.
- Full `pnpm test:run`: 26 files, 242 tests passed, with no unhandled errors.
- `pnpm exec tsc --noEmit`: passed.

The Storybook failures are resolved without removing or skipping stories. Timer stories now
receive the application timer context. Form interactions use the current labels and keyboard
controls, and lap-history fixtures are deterministic. Complex phase editing no longer submits
and navigates away; edits use draft values and retain the saved timer type when reopened.
The phase story covers adding, editing, saving, reopening, cancelling, and pressing Enter.

The run still emits non-failing Node deprecation, Storybook annotation-provisioning, and PostCSS
warnings. App-level Playwright E2E tests remain separate and were not rerun for this change.


## Deterministic timer timing checks

`src/hooks/timer-timing.test.ts` covers the previously flaky Countdown resume and
Work/Rest rest-progress cases with a controlled monotonic clock and animation
frames. It exercises the real timer classes and hooks; only the scheduling
boundary is replaced for this test file.

Countdown runs for 200 ms, pauses for 10 seconds, resumes for 200 ms, and then
completes after the remaining 4600 ms. Assertions check exact remaining and active
elapsed time, and a single completion callback. Work/Rest runs for 500 ms and
checks rest progress at 0%, 40%, and 80%, then the completed round.

Cleanup unmounts hooks before restoring the real clock and checks for pending
frames and timeouts. The tests no longer depend on a 200 ms real sleep finishing
within 250 ms, or rest progress staying below an arbitrary 20% threshold while
the browser is busy. Other browser tests retain real scheduling coverage.


## Optional time limits and picker bounds

`TimePicker.test.tsx` verifies that minimum/maximum bounds apply to both the
visible value and the value delivered to the form. It also covers clearing
optional Complex, Stopwatch, and Work/Rest time limits. Zero means an absent
optional limit; required countdown/work durations still clamp to their minimum.
The Interval Field Validation story rejects an invalid initial duration and
verifies that editing it produces a valid, clamped submission.

`e2e/optional-overall-limit.spec.ts` configures a complex workout through the UI,
saves a limited preset, clears the limit, saves a separate unlimited preset,
reopens it after reload, and starts it without an overall-limit prompt. It also
checks that the original limited preset remains unchanged.


`e2e/optional-limits.spec.ts` also saves and reloads cleared Stopwatch and Work/Rest
limits, confirms the original limited presets remain unchanged, and verifies
that the displayed Countdown minimum (1 second) and Stopwatch maximum (24 hours)
match the persisted values. Work/Rest validation accepts an absent work limit
in both fixed-rest and ratio modes, while still rejecting an explicit zero.


## Leading-zero time entry

`TimePicker.test.tsx` covers typing `05` into seconds, minutes, and hours when a
required duration clamps the initial `0` to one second. The second digit uses
the original entry rather than the clamped display, preserving the intended
time and the other fields. Maximum bounds still apply to the completed entry.
Timeout, blur, and arrow-key checks verify that subsequent input starts fresh.

`e2e/time-picker-entry.spec.ts` verifies saved and reopened Countdown values of
5 seconds, 5 minutes, and 5 hours, and a fixed Work/Rest rest duration of 5 seconds.
Four component regressions failed before the fix. Afterward, all 268 tests passed;
lint, TypeScript, the production build, and React Doctor (100/100) also passed.
Production browser verification passed all 18 checks, including the new digit-entry
cases and existing preset and optional-limit persistence flows.
