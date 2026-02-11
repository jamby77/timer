# Plan: Add Stop Callback Support to Timer Components

## Overview
Add `onStop` callback support to all timer hooks and propagate it through the component hierarchy. 
This will allow ComplexTimer to detect when Stop buttons are clicked and advance phases accordingly 
when auto-advance is enabled.

## Affected Components
- Timer (uses `useTimer`)
- Stopwatch (uses `useStopwatch`)
- Interval (uses `useIntervalTimer`)
- WorkRestTimer (uses `useWorkRestTimer`)
- ComplexTimer (consumes the callbacks)

## Implementation Steps

### 1. Update Timer Hooks
Add `onStop?: () => void` parameter to each timer hook:

- `useTimer(options: { onStop?: () => void })`
- `useStopwatch(options: { onStop?: () => void })`
- `useIntervalTimer(options: { onStop?: () => void })`
- `useWorkRestTimer(options: { onStop?: () => void })`

Call `onStop()` when the respective stop/reset action is triggered by user interaction.

### 2. Update Timer Component Interfaces
Add `onStop?: () => void` prop to each timer component:

```typescript
interface TimerProps {
  config: CountdownConfig
  onStateChange?: (state: TimerState) => void
  onStop?: () => void  // NEW
}

interface StopwatchProps {
  config: StopwatchConfig
  onStateChange?: (state: TimerState) => void
  onStop?: () => void  // NEW
}

interface IntervalProps {
  intervalConfig: IntervalConfig
  onComplete?: () => void
  onStop?: () => void  // NEW
}

interface WorkRestTimerProps {
  config: WorkRestConfig
  onPhaseComplete?: () => void
  onStop?: () => void  // NEW
}
```

### 3. Wire Callbacks in Components
- Pass `onStop` prop to the respective hook in each component
- Call `onStop()` when Stop button is clicked (after internal stop logic)

### 4. Update ComplexTimer
- Pass `onStop` callback to each timer component in `renderPhaseTimer`
- In the callback, check `config.autoAdvance` and call `goToNextPhase()` if true

### 5. Testing
- Verify Stop button triggers advancement when auto-advance is enabled
- Ensure natural completion still works as before
- Test all timer types (countdown, stopwatch, interval, work-rest)

## Files to Modify
- `/src/hooks/useTimer.ts`
- `/src/hooks/useStopwatch.ts`
- `/src/hooks/useIntervalTimer.ts`
- `/src/hooks/useWorkRestTimer.ts`
- `/src/components/display/Timer.tsx`
- `/src/components/display/Stopwatch.tsx`
- `/src/components/display/Interval.tsx`
- `/src/components/display/WorkRestTimer.tsx`
- `/src/components/display/ComplexTimer.tsx`
