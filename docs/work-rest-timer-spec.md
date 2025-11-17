# Work/Rest Timer Feature Specification

## Overview
A new timer component that combines stopwatch functionality for work periods with countdown rest periods, using a configurable work-to-rest ratio.

## Core Requirements

### Work Timer (Stopwatch Mode)
- **Function**: Counts up from 0:00
- **Default (maximum) Limit**: 99:99 minutes (99 minutes 59 seconds)
- **Display**: Shows elapsed time in MM:SS.MS format
- **Controls**: Start, Pause, Stop buttons
- **Behavior**: 
  - Start begins counting up
  - Pause freezes current elapsed time
  - Stop ends work phase, records time as lap, calculates rest duration

### Work/Rest Ratio
- **Default Value**: 1.0
- **Adjustment**: Increment/decrement by 0.01
- **Display**: Show current ratio (e.g., "1.00x", "1.25x")
- **Controls**: 
  - Increase button (+1.0)
  - Increase button (+0.01)
  - Decrease button (-1.0)
  - Decrease button (-0.01)
  - Or 2 number inputs, one for integer part, one for decimal part with validation
  - Reset to 1.0 button
- **Restrictions**: 
  - Minimum ratio: 0.01
  - Maximum ratio: 100.0
  - Can only be adjusted when timer is idle

### Rest Timer (Countdown Mode)
- **Function**: Counts down from calculated duration
- **Duration Formula**: `Rest Time = Work Time × Ratio`
- **Example**: Work 1:00 with ratio 2.0 → Rest 2:00
- **Display**: Shows remaining time in MM:SS.MS format
- **Controls**: Only Skip/Stop buttons (no pause)
- **Behavior**:
  - Auto-starts when work phase ends, give short delay to allow user to see work time, something like 100ms
  - Cannot be paused (must complete or be skipped)
  - Skip ends rest phase immediately
  - Stop ends rest phase and resets to idle

## User Interface

### Display Layout
```
┌──────────────────────────────┐
│        WORK/REST (r 1.00x)   │
│         Status Message       │
│                              │
│        00:00 (elapsed)       │
│                              │
│     Interval: 1/∞            │
├──────────────────────────────┤
│ [Start] [Pause] [Stop]       │
│ [+0.01] [-0.01] [Reset 1x]   │
│ [Skip Rest]                  │
└──────────────────────────────┘
```

### Control States
- **Idle**: Start, Ratio controls enabled
- **Work Running**: Pause, Stop, Ratio controls enabled
- **Work Paused**: Resume, Stop, Ratio controls enabled
- **Rest Running**: Skip Rest, Stop enabled (ratio controls disabled)
- **Completed**: Start, Ratio controls enabled

### Visual Indicators
- **Work Phase**: Green background (emerald-400)
- **Rest Phase**: Red background (rose-300)
- **Idle**: Transparent background
- **Progress Bar**: 
  - Work: Shows progress toward 99.99 min limit
  - Rest: Shows countdown progress

## Technical Implementation

### Architecture
- **New Hook**: `useWorkRestTimer` custom hook
- **New Component**: `WorkRestTimer` component
- **Reuse Existing**: `Card`, `BaseButton`, `LapHistory` components
- **State Management**: Local React state (no external store needed)

### Hook Interface
```typescript
interface WorkRestTimerState {
  phase: TimerPhase        // 'idle' | 'work' | 'rest' | 'completed' // use Enum
  elapsedTime: number      // milliseconds
  timeLeft: number         // milliseconds (for rest phase)
  ratio: number            // work/rest multiplier
  state: TimerState
  workSessions: number     // count of completed work sessions
}

interface WorkRestTimerActions {
  startWork: () => void
  pauseWork: () => void
  stopWork: () => void
  resumeWork: () => void
  skipRest: () => void
  adjustRatio: (delta: number) => void
  resetRatio: () => void
  reset: () => void
}
```

### Data Flow
1. **Work Phase**: 
   - use Timer.ts to track time
   - Updates display with elapsed time
   - Enforces 99.99 min limit

2. **Stop Work**:
   - Calculate `restDuration = elapsedTime × ratio`
   - Record work session as lap
   - Transition to rest phase

3. **Rest Phase**:
   - Countdown from calculated duration, use Timer.ts to track time
   - Auto-transition to work phase with short delay when complete
   - Allow skipping to next work phase

### Edge Cases
- **Work Time Limit**: At 99.99 min, auto-stop and calculate rest, max stop is also 99.99 min, if calculated rest becomes bigger than 99.99 min, limit rest duration to 99.99 min
- **Zero Work Time**: If stopped immediately, rest duration is 0
- **Ratio Changes**: not possible after timer is started
- **Page Navigation**: Timer state preserved, continues running
- **Browser Tab**: Timer pauses when tab inactive, resumes on return

## Integration Points

### Existing Components
- **Card**: Reuse for layout and visual styling
- **LapHistory**: Record work sessions with timestamps
- **BaseButton**: Reuse for all control buttons
- **Icons**: Use existing Play/Pause/Stop/Skip icons

### Settings (Future)
- Default ratio configuration
- Work time limit configuration
- Auto-start next session option
- Sound notifications

## Testing Requirements

### Unit Tests
- Hook state transitions
- Ratio calculations (edge cases with floating point)
- Time formatting functions
- Lap recording functionality

### Integration Tests
- Full work/rest cycle
- Button interactions in different states
- Ratio adjustment during work phase
- Skip rest functionality

### User Experience Tests
- Responsive design on mobile/desktop
- Accessibility (keyboard navigation, screen reader)
- Performance (smooth 10ms updates during work phase)

## Success Criteria

### Functional
- ✅ Work timer counts up accurately
- ✅ Rest timer calculated correctly using ratio
- ✅ All controls work in appropriate states
- ✅ Lap history records work sessions
- ✅ Ratio adjustment works as specified

### Non-Functional
- ✅ Smooth UI updates (60fps during work phase)
- ✅ Responsive design works on all screen sizes
- ✅ Accessibility compliance (WCAG 2.1 AA)
- ✅ No memory leaks (proper cleanup of timers)
- ✅ Consistent styling with existing components

## Future Enhancements

### Version 2.0
- Audio notifications for phase transitions
- Vibration feedback on mobile devices
- Custom work time limits per session
- Preset ratios (1:1, 1:2, 1:3, etc.)
- Statistics and analytics dashboard

### Version 3.0
- Multiple timer profiles
- Cloud sync of lap history
- Integration with fitness trackers
- Social sharing of workout sessions
- Advanced scheduling features
