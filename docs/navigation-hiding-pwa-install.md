# Navigation Hiding and PWA Install Prompt

Status checked against the current code on `main` on 2026-11-16.
Checked items reflect source inspection. Runtime verification remains pending.

## Navigation hiding

### Implemented

- [x] Provide shared isAnyTimerActive state through TimerContext and TimerProvider.
- [x] Update active state from Countdown, Stopwatch, Interval, and Work/Rest hooks.
- [x] Track complex timer activity in ComplexTimer.
- [x] Hide Navigation when the shared active state is true.
- [x] Treat running and paused states as active, and idle/completed states as inactive.

### Remaining verification

- [ ] Verify navigation hides during running and paused states for every timer type.
- [ ] Verify navigation returns after stop, reset, and natural completion.
- [ ] Verify complex phase transitions and final-phase stopping/completion.
- [ ] Verify refresh and multiple-tab behavior, as requested in the original plan.

Implementation references are `src/contexts/TimerContext.tsx`, `src/app/layout.tsx`,
`src/components/Navigation.tsx`, the timer hooks, and `src/components/display/ComplexTimer.tsx`.

## PWA install prompt

### Implemented

- [x] Provide an X button to dismiss the prompt.
- [x] Persist the dismissal timestamp under `pwa-install-dismissed` in localStorage.
- [x] Suppress the prompt for 30 days after dismissal.
- [x] Re-evaluate expiry when the component mounts, allowing eligible prompts to reappear.
- [x] Suppress the prompt in standalone mode.
- [x] Show iOS installation instructions or a browser-provided installation action.
- [x] Handle appinstalled and display-mode changes in component state.

### Remaining from the original expanded design

- [ ] Persist a dismissal count.
- [ ] Offer Never show again after three dismissals.
- [ ] Persist and respect a permanentlyDismissed flag.
- [ ] Persist successful installation as installCompleted and consult it on later visits.
  The current implementation handles installation in component state and checks standalone
  mode, but does not persist the proposed installation flag.

The original proposed storage model included lastShown, dismissCount,
permanentlyDismissed, and installCompleted. Only a dismissal timestamp is currently stored.
The original document marked the entire feature complete, but the expanded flow above
remains unimplemented.

### Remaining verification

- [ ] Verify dismissal survives reload and suppresses the prompt for 30 days.
- [ ] Verify an expired dismissal permits the prompt on a subsequent mount.
- [ ] Verify standalone mode and successful browser installation hide the prompt.
- [ ] Verify the iOS instructions and browser installation flow on supported devices.

Implementation reference: `src/components/InstallPrompt.tsx`.
