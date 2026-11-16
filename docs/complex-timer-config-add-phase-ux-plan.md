# Complex Timer Display and Timer Labels

Status checked against the current code on `main` on 2026-11-16.
Checked items reflect source inspection. Runtime and visual verification remain pending.

## Complex timer display

- [x] Show the complex timer name, current phase name, and phase position in the header.
- [x] Provide a Next button to skip to the next phase, disabled on the last phase.
- [x] Provide Previous and Restart controls.
- [x] Keep phase information and skip controls accessible while the child timer is fullscreen.
  Pass the phase header into the child TimerContainer and reserve space above the timer card.
- [x] Verify phase names and skipping across all four supported child timer types while running.
  Chromium checks on 2026-11-16 covered 390px and 1280px widths, Next, last-phase disabling,
  Previous, and Restart. Wake-lock permission was denied and the existing fallback ran.

## Timer labels

- [x] Display configured names for Countdown and Stopwatch.
- [x] Display interval progress as `x of y rounds`.
- [x] Display the configured Work/Rest timer name alongside the WORK/REST ratio label.
- [x] Keep the Interval timer name visible alongside its current work/rest label.
- [ ] Verify labels and round progress in idle, running, paused, and completed states.

## Related features

- [x] Implement navigation hiding while timers are running or paused.
- [x] Implement a persistent 30-day PWA install prompt dismissal.
- [ ] Complete the expanded PWA dismissal flow and runtime verification described in
  [Navigation Hiding and PWA Install Prompt](navigation-hiding-pwa-install.md).

## Implementation references

- `src/components/display/ComplexTimer.tsx`
- `src/components/display/TimerContainer.tsx`
- `src/components/display/Timer.tsx`
- `src/components/display/Stopwatch.tsx`
- `src/components/display/Interval.tsx`
- `src/components/display/WorkRestTimer.tsx`
