# Complex Overall Time Limit Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make the saved complex workout limit effective as a soft limit.
**Architecture:** A monotonic workout clock accumulates only child running time.
ComplexTimer owns the clock and acknowledgement; its existing Stop/restart paths
control the whole workout. A controlled dialog leaves phase timers running.
**Tech Stack:** React, TypeScript, Radix Dialog, Vitest, Playwright.
## Global constraints

Keep phase controls and digit sizing unchanged. Exclude pauses and pre-start.
Keep elapsed time across phase navigation/restarts; reset on workout restart.
No limit means no new UI. No production comments or new dependencies.

## Review focus

- Delayed ticks must catch up using monotonic time, not interval counts.
- Phase unmounts must stop the clock until the next actual Running signal.
- Natural final completion must close the prompt even after Continue.
- Fullscreen stacking must not hide the modal or intercept its controls.
- Configuration replacement/reload must create a fresh clock.

## Tasks

- [x] Add failing `useWorkoutClock.test.ts` tests for pause exclusion, accumulated
  runs, delayed ticks, acknowledgement, completion, reset, and absent limits.
- [x] Implement `useWorkoutClock(limitSeconds?: number)` with elapsedMs,
  promptOpen, setRunning(boolean), acknowledge(), finish(), and reset().
- [x] Run focused browser hook tests and confirm all pass.
- [x] Add failing Playwright tests in `e2e/complex-overall-limit.spec.ts` for all
  phase types, pre-start/pause exclusion, cross-phase accumulation, Continue,
  Escape, End, restart, final completion, no limit, reload, and viewport bounds.
- [x] Connect the clock to ComplexTimer child callbacks and navigation handlers.
  Show elapsed/limit within the existing header height. Add an accessible dialog
  above the fullscreen layer using the existing Dialog component.
- [x] Run browser checks, lint, TypeScript, relevant regression tests, and build.
  Record exact results below. Leave changes uncommitted for the user's workflow.

## Execution notes

Approved design on 2026-11-17. Implement inline as requested; no additional
approval round or automatic review. The repository requests reviews on demand.


## Verification results

- Clock tests first failed because the hook did not exist; then all five passed.
- Interval callback regression failed because callbacks were never invoked;
  direct notifications from state-changing actions now pass the regression.
- Initial app test failed because the overall time display was absent.
- Final full Vitest run: 253 tests in 28 files passed. The first full run had
  one existing real-time pause/resume tolerance failure while other work ran;
  the unchanged test passed in the full rerun without competing browser tests.
- Final production Playwright run: 81 passed, including 17 new overall-limit
  scenarios and existing phase restart, stop, navigation, and interval checks.
- Initial development checks were blocked by localhost/127.0.0.1 origin handling
  and the Next dev badge covering a mobile control; final checks used production.
- One new test initially clicked Restart during Work/Rest's idle gap; extending
  its rest fixture exercises restart during rest as intended.
- Lint, TypeScript, production build, and git diff whitespace checks passed.
- React Doctor: 100/100, no issues after replacing the initial callback effect
  with notifications from actual Interval state changes.
- Visual inspection at 440x956 and 956x440 confirmed dialog visibility. Digit
  font sizes were unchanged with/without the overall limit (102.857px and
  203.68px respectively). Screenshots saved under /tmp/overall-*.png.
- Production app left running at http://localhost:3011. Changes are uncommitted.
