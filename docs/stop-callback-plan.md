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
- [ ] Verify Work/Rest Stop work, Stop rest, and reset behavior inside a complex timer.
  Stop work now unmounts the child timer and ends the entire workout; Stop rest remains to be checked.

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
