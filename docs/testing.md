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
- Full `pnpm test:run`: not passing. Reported 16 failed story tests, 183 passed tests, and one
  unhandled browser-connection error; the run did not finish all 240 discovered tests.

The failing story cases were:

- `TimerTypeSelector`: Default.
- `LapHistory`: Many Laps Expanded.
- `TimerConfigForm`: Countdown, Interval, Stopwatch, Work Rest Ratio, Work Rest Fixed, Complex,
  Predefined Style, With Initial Data, Interactive, Form Validation, Valid Form Submission,
  Save As Predefined, Work Rest Mode Toggle, and Interval Field Validation.

The connection closed while running `ComplexFieldsForm.stories.tsx`. These results are retained
as follow-up work; the story tests have not been removed, skipped, or marked as passing.
