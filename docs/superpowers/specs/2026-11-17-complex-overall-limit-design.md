# Complex workout overall time limit

Status: approved and implemented on 2026-11-17, following PR #24.

## Intent

Make the existing Overall Time Limit configuration effective during complex
workouts. The configuration currently persists a limit in seconds, but the
runtime never reads it.

## Approaches

- Soft limit with a Continue / End prompt: follows the existing runtime plan and
  lets the user finish a workout that runs long. Recommended first increment.
- Automatic stop: simpler, but unexpectedly ends an existing workout configured
  with what the plan describes as a soft limit.
- Configurable prompt / continue / stop modes: described in the expanded plan,
  but requires new settings and storage validation. Defer to a later increment.

## Proposed behavior

- Count active running time across all phases, including interval rest periods.
  Exclude pauses, pre-start countdowns, idle time, and waiting between phases.
- Keep elapsed time across Previous / Next navigation and individual phase
  restarts. Restart workout resets elapsed time and the limit acknowledgement.
- Display elapsed / limit information inside the existing timer header without
  reducing the timer digits or hiding phase controls.
- At the limit, show one accessible dialog: Time Limit Reached, elapsed time,
  configured limit, Continue Workout, and End Workout.
- Keep the workout running behind the prompt so transitions and timing remain
  accurate. Continue closes the prompt and acknowledges the limit for this run.
  Escape or other dismissal also means Continue. This behavior was approved with the design.
- End Workout uses the existing whole-workout Stop path, restores navigation,
  and makes Restart workout available.
- Natural workout completion closes a pending prompt and takes priority over
  presenting a new prompt at the same instant.
- No configured limit means no extra display or interruption.
- Reload starts an idle workout with a fresh elapsed-time budget, matching the
  current timer reload behavior.

## Scope and validation

Use a monotonic elapsed-time accumulator, driven by actual child running state,
with cleanup on configuration replacement and unmount. Preserve current phase
startup, sound, fullscreen, and navigation behavior.

Tests must cover accumulated time across phase transitions, paused-time exclusion,
pre-start exclusion, Continue appearing only once, End stopping the whole workout,
restart resetting the budget, natural completion at the limit, no-limit workouts,
and configuration replacement. Exercise Countdown, Stopwatch, Interval, and
Work/Rest phases in Playwright, including portrait and landscape layouts.

Automatic behavior selection, warning sounds, and persisting an in-progress
workout after reload are outside this increment.
