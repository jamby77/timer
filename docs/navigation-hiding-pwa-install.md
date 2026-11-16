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
- [x] Sync dismissal, permanent dismissal, installation status, and dismissal count
  across open tabs using localStorage events. Refresh preferences when storage is cleared.

### Remaining from the original expanded design

- [x] Persist a dismissal count, capped at the three-dismissal threshold.
- [x] Offer Never show again when the prompt returns after three dismissals.
- [x] Persist and respect permanent dismissal using `pwa-install-permanently-dismissed`.
- [x] Persist successful installation under `pwa-install-completed` and consult it on later visits.
  Record browser appinstalled events and standalone mode, including display-mode changes.
  Dismissing the browser installation dialog does not set the flag.

The original proposed storage model included lastShown, dismissCount,
permanentlyDismissed, and installCompleted. Dismissal timestamp, count, permanent dismissal, and installation completion are stored in separate keys.
The expanded storage flow is now implemented. Device-level installation verification remains pending.

### Remaining verification

- [x] Verify dismissal survives reload and suppresses the prompt for 30 days.
  Reload is covered by the production browser checks; expiry timing by component tests.
- [x] Verify an expired dismissal permits the prompt on a subsequent mount (component test).
- [x] Verify standalone mode and successful browser installation hide the prompt.
  Standalone detection and installation events are simulated, not actual device installs.
- [ ] Verify the iOS instructions and browser installation flow on supported devices.

Implementation reference: `src/components/InstallPrompt.tsx`.

## Dismissal verification (2026-11-16)

Three focused Chromium component tests pass for the three-dismissal threshold, permanent
dismissal across remounts, legacy timestamp-only records, 30-day suppression and expiry,
and malformed count recovery. The repository browser test configuration failed during
dependency scanning, so these checks used a temporary configuration scoped to the component.

## Installation persistence verification (2026-11-16)

Six focused Chromium component tests pass, including the existing dismissal checks plus
installation-event persistence across remounts, existing standalone installations, and
browser install-dialog dismissal. Installation events and standalone detection were simulated;
actual device installation remains unverified.

## Cross-tab preference verification (2026-11-16)

Four production Chromium checks cover temporary/permanent dismissal and installation status
across two open tabs and reloads, dismissal-count updates, preference resets, and unrelated
storage changes. All six existing install-prompt component tests also pass.

Run `pnpm exec playwright test --config playwright.pwa.config.ts`. This builds the production
app and starts an isolated server on port 3007 (`PLAYWRIGHT_PWA_PORT` overrides the port).
Production-only tests are excluded from the normal development-server test configuration.
Browser installation events are simulated; supported-device installation remains unverified.
