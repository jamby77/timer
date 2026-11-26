# Workout timer improvements

**Goal.** Make X‑Timer easier to follow from across the room and faster to configure on a phone. Deliver each numbered item as a separately usable change to the existing PWA. The priorities below are proposals.

## Design review workflow

Work in the order below. Before implementing each feature, add its own design document under `docs/superpowers/specs/`, show its preview, and record the review decision here. Treat individually shippable items in sections 4 and 5 as separate features. Mark preview, approval, implementation and verification independently. For timer-screen changes, compare the digits and controls against the current layout at the same viewport and timer state.

## 1. Show the next Complex phase

- [x] Prepare the [Up Next design and phone previews](../specs/2026-11-25-up-next.md). Compare digit and footer geometry with the current screen.
- [x] Approve the design before implementation.

- [x] In `src/components/display/ComplexTimer.tsx`, derive the next phase from the current index and the saved phase order. Use the existing shared phase header. Display, for example, **Next: Tabata**. Include a compact duration when the duration is known. A cap on self-paced work is an upper bound, not an exact duration.
- [x] Keep the hint visible when running or paused and when waiting for manual advancement. Update it on Next, Previous, Restart, automatic advancement and recovery. Omit it on the final phase. Keep the same space for the current digits and controls across Pause and Resume.
- [x] Verify with Playwright using a three-phase timer, long names, a manual transition and a resumed session. Capture portrait at 320 px and a short landscape viewport. Check that the next name is distinguishable from the active phase and all controls remain reachable.

This can ship using existing configurations. It is the first PR.

## 2. Add a timeline preview

- [x] Prepare the [timeline design and interactive phone mockup](../specs/2026-11-25-timeline-preview.md).
- [x] Approve the timeline design before implementation.

- [x] Add **Preview** to Complex setup alongside the existing phase summary. Start with named phases and expand Interval rounds on demand. Show the pre-start countdown separately from timed work. Use existing duration formatting and the same interval sequencing rules as playback.
- [x] Verify three rounds of 30s work and 10s rest end at 2:00 with final rest included and 1:50 with it skipped. Check zero-rest EMOM and hour-long phases. For an open Stopwatch or manual Work/Rest, show the known duration or limit and mark subsequent start times as dependent on the user. Manual phase transitions can also introduce waits.
- [x] Keep large timetables collapsed by default. Editing a phase must update the preview immediately. Preview must work without starting, saving or playing sound.

## 3. Repeat a group of phases

- [x] Prepare the [repeat group design and phone previews](../specs/2026-11-25-repeat-phases.md).
- [x] Approve the repeat group design before implementation.

- [x] Add a single level of **Repeat** in the Complex editor. Select consecutive phases, set a count, and edit the group in one place. Example: Row 45s, Rest 15s, Bike 45s, Rest 15s, repeated four times, followed by a single cooldown. This also covers repeated Tabatas and recurring rests.
- [x] Store the group once. Define how an execution position identifies the phase and repetition before changing the runner. Use the same ordering for the preview, total estimate, Up Next, phase navigation, automatic advancement and background catch-up.
- [x] Extend the configuration types, storage validation, timer hash and recovery state together. Old flat timers must still load. Test entering and leaving the group in both directions, restarting inside it, pausing, reloading in repetition three, and reaching the cooldown exactly once. Bound repeat counts and expanded size.

## 4. Add focused training controls

The following items can ship independently.

- [x] Prepare the [named intervals design and 320 px phone previews](../specs/2026-11-26-named-intervals.md).
- [x] Approve the named intervals design.
- [x] Implement and verify named intervals.
- [x] Prepare the [clock direction design and phone previews](../specs/2026-11-26-clock-direction.md).
- [x] Approve the clock direction design.
- [x] Implement clock direction.
- [x] Verify clock direction in saved timers and during playback.
- [x] Prepare the [stopwatch splits design and phone previews](../specs/2026-11-26-stopwatch-splits.md).
- [x] Approve the stopwatch splits design.
- [x] Implement stopwatch splits.
- [x] Verify split timing, history and recovery.
- [x] Prepare the [10s warning sound and setup preview](../specs/2026-11-26-ten-second-warning.md).
- [x] Approve the 10s warning setup design.
- [x] Implement and verify the 10s warning.

| Item | First usable version | Acceptance check |
|---|---|---|
| Named intervals | Optional names per round in Interval and EMOM setup. Fall back to the existing Work and Rest labels. Use the names in the preview and running header. | Row → Bike → Run appears in order after skips, rest, pause and reload. Old presets retain their labels. |
| Clock direction | Choose elapsed or remaining time for a timed work or rest period. Allow independent directions on Interval. | A 30s work period can count up while a 15s rest counts down. Timing, progress, cues and completion still agree. |
| Stopwatch splits | Add **Lap** while running. Record the split since the previous mark and show the cumulative total. Use the current elapsed-time source and existing lap history. | Mark two splits around a pause. Exclude paused time, keep the total running, and verify Stop and capped completion record a final partial split only once. Recover the split baseline after reload. |
| Remaining-time cue | Add an optional **10s warning** under Sounds, off by default. Keep the existing race countdown, start and finish sounds. | Fire once when crossing the threshold during active timing. Check short periods, pause/resume, restart, skipped intervals and returning from the background without replaying missed warnings. |

## 5. Reduce repeated setup and make timers portable

- [x] Prepare the [Settings tab design and 320 px previews](../specs/2026-11-26-personal-defaults.md).
- [x] Approve the personal defaults design.
- [x] **Personal defaults.** Add Settings as the third top tab. Include shared settings, sound cues, and the existing starting values for standalone timers, Complex phases and built-in presets. Verify opening an existing preset, duplicating a phase and resuming a timer preserve their saved settings.
- [x] Preview [two recent timers side by side on a 320px phone](../specs/2026-11-26-compact-recents.md).
- [x] Approve the compact recent timer cards.
- [x] Implement and verify two visible cards in portrait, swipe navigation, Start and Remove.

- [x] Preview the [New and Presets setup tabs](../specs/2026-11-26-setup-tabs.md).
- [x] Approve and implement the setup tabs. Verify touch swipes and carousel position on both tabs at 320px.

- [x] Preview [sharing from Presets and opening a timer link at 320px](../specs/2026-11-26-share-link.md).
- [x] Approve the link sharing design.
- [x] **Share and import by link.** Compress a versioned timer definition, including Complex phases, repeat counts and cue settings, and encode it in the URL fragment. Measure the complete URL before sharing. If it exceeds the supported length, show “Timer too large to share by link.” On opening a link, bound the decoded size, validate the settings and show a preview with Start and Save. Verify in a fresh browser profile with valid, oversized, malformed and older links, and a timer whose name already exists.

## Later candidates and boundaries

- A paused timeline scrubber needs clear rules for moving across manual transitions, lap history, and already-played cues. Evaluate it after the preview and repeat model are in use. A stop confirmation can be evaluated separately against accidental stops during workouts.
- Exercise notes, optional spoken cues, a foreground metronome, custom cue selection, run-screen appearance, and a local day planner are feasible follow-ups. Prioritize them from actual use. Timing and audibility of new cues need an iPhone check with music playing.
- Beep Test, a possession clock and a two-player scoreboard are separate sports modes. If shuttle training becomes a use case, verify the chosen 15 m or 20 m pacing protocol before implementing it.
- Casting to another display, synchronized devices, heart-rate equipment, video overlays, AI input and controlling another app’s music need individual feasibility and product decisions. They are outside the first delivery sequence.

## Release checks

For each change, run the relevant unit and browser tests. For visual changes, attach screenshots from a 320 px phone and short landscape. For new saved fields, verify preset save/reopen, direct reload, and legacy configurations. For runner changes, verify foreground play, pause/resume, background catch-up and interrupted-session recovery. Start with Up Next and use it in a workout before expanding the header further.
