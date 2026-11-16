# Stop Callback Support

Status checked against the current code on `main` on 2026-11-16.
Callback wiring is implemented. Stop and phase-navigation checks now cover the cases below;
natural completion and the remaining Work/Rest cases still need verification.

## Implemented

- [x] Accept an optional `onStop` callback in useTimer, useStopwatch,
  useIntervalTimer, and useWorkRestTimer.
- [x] Invoke the callback from the hooks' stop/reset actions.
- [x] Expose and forward `onStop` in Timer, Stopwatch, Interval, and WorkRestTimer.
- [x] Pass callbacks from ComplexTimer to each supported child timer type.
- [x] Advance to the next phase on stop when auto-advance is enabled.
  An omitted autoAdvance setting defaults to enabled.
- [x] Clear the complex timer's running state on stop when auto-advance is disabled.
- [x] Retain natural-completion callbacks and phase advancement handling.

## Remaining verification

Verified in Chromium on 2026-11-16 using `e2e/complex-stop.spec.ts`.

- [x] Verify Stop advances exactly one phase with auto-advance enabled for all four timer types.
  Work/Rest coverage includes both running and paused work.
- [x] Verify Countdown, Stopwatch, and Interval Stop stay on the current phase without auto-advance.
- [ ] Verify Work/Rest stop behavior without auto-advance.
- [x] Verify final Countdown, Stopwatch, and Interval Stop restore navigation and leave fullscreen.
- [ ] Verify final Work/Rest stop behavior.
- [ ] Verify natural completion still advances correctly and finishes the last phase.
- [ ] Verify Work/Rest Stop work, Stop rest, and reset behavior inside a complex timer.
  Stop work invokes onStop before transitioning to rest, so verify that advancing the
  complex phase at this point matches the intended behavior.

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
- Fifteen browser checks cover Stop behavior above and skipping active phases for all four types.
  Tests used the running localhost development server via a temporary configuration because
  the initial run against the configured 127.0.0.1 address stalled before hydration.
