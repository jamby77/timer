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
