# Timer Sound System (Web)

## Goals
Provide configurable, synthesized sound cues for timer execution across:
- Mobile browsers: iOS Safari, Android Chrome
- Desktop browsers: Chrome, Safari, Firefox

Sounds are generated in code (Web Audio API) rather than shipping audio files.

## Non-goals
- Playing native OS “system sounds” (not available to the web sandbox)
- Guaranteed playback while the app is backgrounded / screen is locked on mobile
- MIDI playback (out of scope; would require a synth/soundfont approach)

## Constraints and Platform Notes

### Autoplay / user gesture requirement
Modern browsers require a user gesture (tap/click) before audio output starts.

- `AudioContext` often starts in `suspended` state.
- The app must call a dedicated `unlock()`/`resume()` from a user gesture.

Recommended UX:
- First press of “Start” (or an explicit “Enable sound” button) should attempt to unlock audio.
- If audio is disabled in the config, do not unlock.

### iOS silent mode
On iOS, web audio is typically affected by the hardware mute switch / silent mode.
This is expected behavior.

### Background/lock screen behavior
When the page goes to background, browsers may:
- Suspend the `AudioContext`
- Throttle timers / animation frames
- Prevent reliable audio playback

The sound system is designed for **foreground execution**.

## High-Level Architecture

### Overview
The sound system is split into three layers:

1. **SoundEngine**: low-level Web Audio utilities (AudioContext, master gain, primitives)
2. **Sound Library (Cues)**: preset sound “recipes” (countdown, start, finish, tick, interval)
3. **SoundManager**: integration layer mapping timer events/state changes to sound cues

This keeps UI components and timer logic free from Web Audio concerns.

### Suggested module locations
- `src/lib/sound/SoundEngine.ts`
- `src/lib/sound/cues.ts`
- `src/lib/sound/SoundManager.ts`

## SoundEngine

### Responsibilities
- Create and own a single `AudioContext`
- Expose `unlock()` / `resume()` for user-gesture initialization
- Own a master `GainNode` for volume + mute
- Provide primitive helpers:
  - `playTone({ frequencyHz, durationMs, type, gain, whenMs? })`
  - `playClick({ durationMs, gain })`

### Notes
- SoundEngine must be a singleton per tab (or use a React context singleton) to avoid multiple `AudioContext` instances.
- A short envelope (attack/decay) is important to avoid clicks.

## Sound Library (Cues)
Cues are composable functions that call SoundEngine primitives.

### Required cues
- Countdown beeps (3, 2, 1)
- Started beep
- Finished beep
- Interval start beep
- Interval end beep
- Tick sound (metronome)

### Suggested defaults (tunable)
- Countdown:
  - 3: ~660Hz, short
  - 2: ~660Hz, short
  - 1: ~880Hz, short
- Start: ~880Hz, medium
- Finish: two-tone “ta-da” (e.g. 660Hz then 990Hz)
- Interval start/end: distinct pitch separation
- Tick: very short click (fast decay)

## SoundManager

### Responsibilities
- Hold effective sound settings (enabled, volume, per-cue toggles)
- Ensure SoundEngine is unlocked before playback
- Subscribe to timer events and map them to cues
- De-duplicate events (especially ticks and countdown)

### Event sources in this codebase

#### Countdown/Stopwatch timers
- `Timer` / `useTimer`:
  - `onTick(timeLeftMs, totalElapsedMs)`
  - `onStateChange(state, totalElapsedMs)`
  - `onComplete(totalElapsedMs)`

#### Interval timers
- `TimerManager` / `useIntervalTimer`:
  - Step events:
    - `TimerStep.onStart()`
    - `TimerStep.onComplete()`
    - `TimerStep.onStepStateChange(StepState, data)`
  - Manager-level tick:
    - `onTick(timeLeftMs, totalElapsedMs, step)`
  - Sequence completion:
    - `onSequenceComplete()`

#### Work/Rest timers
- `useWorkRestTimer` transitions phases (`Idle` → `Work` → `Rest` → `Idle`) and uses:
  - `Stopwatch.onTick(elapsedMs)` during Work
  - `Timer.onTick(timeLeftMs)` during Rest
  - `Timer.onComplete()` when Rest completes

### Mapping rules (default behavior)

#### Started
- On transition to a running state:
  - Countdown Timer: `TimerState.Running` from `Idle`
  - Interval Timer: first `StepState.Start` (or timer manager `start()` call)

#### Finished
- Countdown Timer: `Timer.onComplete`
- Interval Timer: `onSequenceComplete`
- Work/Rest Timer:
  - Work stop action (manual) is *not* “finished” by default
  - Rest completion can optionally be “finish” (configurable)

#### Interval start/end
- On step start: play interval-start cue
- On step complete: play interval-end cue

#### Countdown 3-2-1
- Use tick callbacks, but only fire when crossing whole-second boundaries.
- Play only for seconds in set `{3,2,1}`.
- Track last fired second to avoid repeated beeps (ticks are ~100ms).

#### Tick (metronome)
- Tick sound should run at **1Hz** by default (once per second).
- On `onTick`, only play when `Math.floor(timeLeftMs / 1000)` changes.

## Configuration model
Sound settings must be part of:
- **Common timer config** (applies to all timer types)
- **Interval timer config** (may override or extend common settings)

### Proposed shared sound config type
Add to `src/types/configure.ts`:

- `sound?: SoundConfig`

Where:
- `enabled: boolean`
- `volume: number` (0..1)
- Per-cue toggles:
  - `countdownBeeps?: boolean`
  - `startBeep?: boolean`
  - `finishBeep?: boolean`
  - `intervalStartBeep?: boolean`
  - `intervalEndBeep?: boolean`
  - `tick?: boolean`
- Optional tick config:
  - `tickHz?: number` (default 1)

### Common vs interval
- `TimerConfig` gets `sound?: SoundConfig`
- `IntervalConfig` may additionally allow:
  - `soundOverrides?: Partial<SoundConfig>` (optional)

If `soundOverrides` exists, SoundManager merges:
- Effective config = `{...commonSound, ...intervalOverrides}`

### Defaults
- `enabled`: false by default (to avoid surprise sound + autoplay friction)
- `volume`: 0.7
- `countdownBeeps`: true
- `startBeep`: true
- `finishBeep`: true
- `intervalStartBeep`: true
- `intervalEndBeep`: true
- `tick`: false

## UI/UX integration (configuration page)
- Add a “Sound” section to the common fields.
- For interval timers, optionally show extra toggles if you want interval-specific overrides.
- On timer execution pages, show a small “Sound unlocked/locked” status when enabled.

## Implementation strategy

### Phase 1 (core)
- Implement SoundEngine + cue library
- Implement SoundManager mapping for:
  - countdown beeps
  - start/finish beeps
  - interval start/end
  - 1Hz tick (if enabled)

### Phase 2 (polish)
- Add configuration UI fields and persist in stored configs
- Add per-timer enable/mute controls
- Add a tiny in-app “test sound” button in config UI (calls unlock + plays a preview cue)

## Testing / verification

### Unit tests
Prefer pure-function tests for:
- countdown second-boundary detection
- tick de-duplication
- config merge logic

### Manual verification checklist
- iOS Safari:
  - Enable sound, press Start, confirm start beep plays
  - Countdown beeps fire at 3/2/1 exactly once
  - Finish beep plays
- Android Chrome:
  - Same as above
- Desktop (Chrome/Safari/Firefox):
  - Ensure AudioContext unlock works
  - Ensure volume/mute behaves

## Open questions
- Should tick be based on time-left seconds (countdown) or elapsed seconds (stopwatch/work)?
- For Work/Rest timers: should “rest start” and “rest end” reuse interval cues or have distinct cues?
