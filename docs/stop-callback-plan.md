# Stop Callback Support

Status checked against the working branch on 2026-11-16.
Callback wiring is implemented. Stop and phase-navigation checks now cover the cases below;
Work/Rest round completion and final-phase stop checks are covered below.

## Implemented

- [x] Accept an optional `onStop` callback in useTimer, useStopwatch,
  useIntervalTimer, and useWorkRestTimer.
- [x] Invoke the callback from the hooks' stop/reset actions.
- [x] Expose and forward `onStop` in Timer, Stopwatch, Interval, and WorkRestTimer.
- [x] Pass callbacks from ComplexTimer to each supported child timer type.
- [x] Stop ends the entire workout, independently of auto-advance, and restores navigation.
- [x] Show a stopped-workout screen with Restart workout returning to the first phase idle.
- [x] Stop during a pre-start countdown ends the entire complex workout.
- [x] Retain natural-completion callbacks and phase advancement handling.

## Remaining verification

Verified in Chromium on 2026-11-16 using `e2e/complex-stop.spec.ts`.

- [x] Verify Stop ends the entire workout with auto-advance enabled for all four timer types.
  Work/Rest coverage includes both running and paused work.
- [x] Verify Countdown, Stopwatch, and Interval Stop end the workout without auto-advance.
- [x] Verify paused Work/Rest Stop ends the workout without auto-advance.
- [x] Verify final Countdown, Stopwatch, and Interval Stop restore navigation and leave fullscreen.
- [x] Verify final Work/Rest stop behavior.
- [x] Verify natural completion across the configured countdown/Tabata workout and final cooldown.
  Natural transitions now start the next timer automatically. Four browser tests cover startup
  of each child timer type. Work/Rest now advances only after its configured round count.
  Natural and skipped rest completion are verified with auto-advance enabled and disabled.
- [x] Verify Work/Rest Restart from running and paused states inside a complex timer.
  Restart resets the round and elapsed time, starts work again, and retains the configured
  ratio, rest mode, rest duration, maximum rounds, and work limit.
- [x] Verify standalone Work/Rest Restart from rest returns to a fresh work round.
- [x] Verify Work/Rest Stop rest inside a complex timer.
  Stop ends the entire workout; Finish work / Start rest transitions within the current phase.

## Implementation references

- `src/hooks/useTimer.ts`
- `src/hooks/useStopwatch.ts`
- `src/hooks/useIntervalTimer.ts`
- `src/hooks/useWorkRestTimer.ts`
- `src/components/display/Timer.tsx`
- `src/components/display/Stopwatch.tsx`
- `src/components/display/Interval.tsx`
- `src/components/display/WorkRestTimer.tsx`
- `src/components/display/ComplexTimer.tsx`

## Fixes from runtime verification

- Remove each timer's active registration when it unmounts so an old phase cannot keep navigation hidden.
- Clear complex running state when selecting another phase, which starts idle.
- Enable Stop work while paused and route it to the work-stop action.
- Browser checks cover whole-workout Stop, restarting after Stop, paused and pre-start Stop,
  and skipping active phases. Tests use a localhost production server.

## Work/Rest restart follow-up (2026-11-16)

Restart previously reset configuration to defaults and called startWork through a callback
that still captured the running/paused phase, leaving the timer idle. A dedicated restart
action now resets and starts atomically. Reset restores the saved configuration.

Validation: 23 hook tests and 50 Chromium browser checks pass, including four new
Work/Rest restart checks covering standalone and complex timers while running or paused.
The standalone checks also verify fixed-duration rest after restart and restarting from rest.

## Separate Work/Rest controls

Finish work / Start rest, Skip rest, and Restart appear beneath the round count,
above the digits. Finish work records elapsed work and starts the configured rest without
calling the workout Stop callback. It works from running and paused work. The bottom
Stop button ends the timer in both standalone and complex workouts.

Four Chromium checks cover fixed and ratio rest from running/paused work, skipping rest
into round 2, restarting, and stopping the whole workout during rest.

## Work/Rest round completion (2026-11-16)

- Complete Work/Rest only when the final configured rest finishes or is skipped.
- Keep intermediate rounds within the current complex phase. Natural rest still waits
  for Start work; Skip rest starts the next work round immediately.
- Do not start an extra work round when skipping the final rest.
- Restore navigation on standalone/final-phase completion and keep the displayed round
  at the configured maximum. Start begins a fresh session afterward.

Validation: production build, 23 hook tests, and 65 distinct Chromium checks passed across
the regression and focused follow-up runs. Eight new completion cases cover standalone,
complex, final-phase, and disabled-auto-advance behavior with natural and skipped rests.

## Configured Work/Rest time limit (2026-11-16)

- [x] Apply the configured maximum work duration to the work stopwatch, retaining
  the existing maximum as the fallback and upper bound.
- [x] Automatically record completed work and start fixed or ratio-based rest at the limit.
- [x] Keep automatic work completion separate from the whole-workout Stop callback.
- [x] Preserve pause/resume and restart behavior, and record manually finished paused work once.

Validation: production build, TypeScript, 25 Chromium hook tests, and 70 Playwright checks
pass. New browser cases cover automatic fixed/ratio rest in standalone and complex timers,
plus pausing and restarting the work limit. Complex advancement still waits for the final rest.
