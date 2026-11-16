# Stop Callback Support

Status checked against the current code on `main` on 2026-11-16.
Callback wiring is implemented. Behavioral verification remains pending.

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

These checks have not been run as part of this status update.

- [ ] Verify Stop advances exactly one phase with auto-advance enabled for each timer type.
- [ ] Verify Stop stays on the current phase with auto-advance disabled.
- [ ] Verify stopping the final phase leaves the timer inactive and restores navigation.
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
