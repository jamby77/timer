# Save Timer Presets Implementation Plan

**Goal:** Save the current timer configuration locally, show it alongside built-in presets,
and allow it to be reopened, adjusted, and started after reload.

**Design:** Reuse LocalTimerStorage and the existing Presets cards. Saving creates a new custom
snapshot with a unique ID; it never overwrites the source preset or starts a timer. Keep the
editor open and show a success toast; failures show an error and retain the draft. Complex
presets open in the existing complex editor through a preset query parameter. No backend,
preset management UI, or unrelated timer behavior changes.

**Architecture:** A shared saveTimerPreset(config) helper validates and stores all settings.
The configuration landing page loads built-in and stored presets. Both editors use the helper.
Complex preset loading restores nested configuration dates so validation still works.

**Constraints:** pnpm, Next.js 16, existing localStorage keys, no new dependencies or production
comments. Implement inline in the current checkout on codex/save-timer-presets. Commit/push
only when requested.

## Tasks

- [x] Add Playwright regressions for all four standalone types: save without starting, success
      feedback, reload, reopen settings, edit, start, and preserve the original preset.
- [x] Add cases for copying a built-in preset, complex phase persistence/reopening, invalid input,
      and failed storage writes retaining the draft. Run against existing code and observe failures.
- [x] Create src/lib/configure/save-preset.ts with saveTimerPreset(config: AnyTimerConfig), returning
      the stored PredefinedStyle. Validate with validateTimerConfig; generate a UUID preset ID.
- [x] Update src/app/configure/page.tsx to load stored presets, refresh after saving, show toast
      feedback, and route complex preset selection to /configure/complex?preset=<id>.
- [x] Update src/app/configure/complex/page.tsx to load selected presets within a Suspense boundary,
      share save behavior and feedback, and report unavailable presets without replacing a draft.
- [x] Restore nested phase timestamps when reading stored presets. Verify saved complex presets
      can be validated and saved again. Ensure Work/Rest rounds are visibly selected on reopen.
- [x] Run focused Playwright tests, all Vitest projects, TypeScript, production build, and React
      Doctor; record outcomes here.

## Review focus

- Every configured setting survives a localStorage round trip, including sound and pre-start.
- Selecting and editing a built-in/custom preset never mutates the saved source.
- Storage denial must not claim success, navigate away, or lose user input.
- Nested complex phase timestamps must remain valid after reload.
- Missing or malformed preset links must not crash the editor.

## Verification

Completed on 2026-11-17.

- Observed the initial save test fail because no preset or success feedback was produced.
- Observed malformed preset data crash the list, then added validation before display.
- Nine Playwright cases pass against both the development app and production build.
- All 242 Vitest tests pass across 26 files.
- TypeScript and the production build pass.
- React Doctor reported no issues in the changed tracked files.
- Full unrelated Playwright suites were not rerun.

The local development server rejects JavaScript requests through 127.0.0.1 with HTTP 403;
verification used a temporary Playwright configuration pointing to localhost instead. The
production checks used localhost:3008. Temporary configuration and browser artifacts were
moved out of the repository.

Implementation branch: codex/save-timer-presets.

## Corrupt preset isolation follow-up (2026-11-18)

- [x] Reproduce malformed JSON and nested phase data hiding all custom presets.
- [x] Load each preset through the existing guarded single-preset reader, preserving
      valid entries and leaving stored data untouched.
- [x] Verify valid presets before and after a corrupt entry still load with restored dates.
- [x] Verify a saved Countdown remains visible, reopens with its duration, and starts
      after reload with a corrupt preset present; built-in presets remain available.

Validation: 280 Vitest tests, all 10 preset Playwright checks against the production app,
lint, TypeScript, and production build passed. The new unit regressions first reproduced
both failure cases. Invalid-schema entries were already skipped and remain covered.
