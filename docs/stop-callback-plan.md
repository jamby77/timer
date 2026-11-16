# Stop Callback Support

Status checked against the working branch on 2026-11-16.
Callback wiring is implemented. Stop and phase-navigation checks now cover the cases below;
natural completion and the remaining Work/Rest cases still need verification.

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
- [ ] Verify final Work/Rest stop behavior.
- [x] Verify natural completion across the configured countdown/Tabata workout and final cooldown.
  Natural transitions now start the next timer automatically. Four browser tests cover startup
  of each child timer type. Natural completion of Work/Rest phases remains to be checked.
- [x] Verify Work/Rest Restart from running and paused states inside a complex timer.
  Restart resets the round and elapsed time, starts work again, and retains the configured
  ratio, rest mode, rest duration, maximum rounds, and work limit.
- [x] Verify standalone Work/Rest Restart from rest returns to a fresh work round.
- [ ] Verify Work/Rest Stop rest inside a complex timer.
  Stop work now unmounts the child timer and ends the entire workout.

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
