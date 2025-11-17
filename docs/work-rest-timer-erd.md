# Work/Rest Timer - Engineering Requirements Document

## 1. System Overview

### 1.1 Purpose
This document defines the technical requirements and implementation specifications for a Work/Rest timer component 
that operates independently from the existing interval timer system.

### 1.2 Scope
- Standalone React hook for timer logic
- React component for UI presentation
- Integration with existing UI component library
- State management and data persistence
- Performance optimization for real-time updates

### 1.3 Dependencies
- React 19.2.0 (hooks, state management)
- TypeScript 5.9.3 (type safety)
- Existing components: Card, BaseButton, LapHistory
- Existing utilities: formatTime, icons

## 2. Architecture

### 2.1 Component Architecture
```
WorkRestTimer (Component)
├── useWorkRestTimer (Custom Hook)
│   ├── State Machine (TimerPhase)
│   ├── Timing Engine (Timer.ts)
│   └── Data Management
├── Card (Layout Container)
│   ├── Timer Display
│   ├── Progress Bar
│   └── Control Buttons
└── LapHistory (Data Display)
```

### 2.2 Data Flow
```
User Action → Hook State Update → Component Re-render → UI Update
     ↑                                                      ↓
Callback ← Event Handler ← DOM Interaction ← Button Click
```

### 2.3 State Machine
```typescript
enum TimerPhase {
  Idle = 'idle',
  Work = 'work',
  Rest = 'rest',
  Completed = 'completed',
}

type WorkRestTimerState = {
  phase: TimerPhase;
  ratio: number;           // Work/rest multiplier (stored as integer * 100)
  rounds: number;    // Count of completed work sessions
  isRunning: boolean;      // Active timing state
};

type WorkPhaseData = {
  state: TimerPhase.Work;
  startTime: number;       // DOMHighResTimeStamp when work started
  elapsed: number;         // Current elapsed time in milliseconds
  pausedAt?: number;       // When paused (for resume logic)
};

type RestPhaseData = {
  state: TimerPhase.Rest;
  duration: number;        // Calculated rest duration in milliseconds
  elapsed: number;         // Current elapsed rest time
  startTime: number;       // DOMHighResTimeStamp when rest started
};
```

## 3. Technical Specifications

### 3.1 Hook Interface

#### 3.1.1 State Structure
```typescript
interface WorkRestTimerState {
  phase: TimerPhase;
  ratio: number;           // Work/rest multiplier (stored as integer * 100)
  rounds: number;    // Count of completed work sessions
  state: TimerState;      // Active timing state
}

// Phase-specific data
interface WorkPhaseData {
  state: TimerPhase.Work;
  startTime: number;       // DOMHighResTimeStamp when work started
  elapsed: number;         // Current elapsed time in milliseconds
  pausedAt?: number;       // When paused (for resume logic)
}

interface RestPhaseData {
  state: TimerPhase.Rest;
  duration: number;        // Calculated rest duration in milliseconds
  elapsed: number;         // Current elapsed rest time
  startTime: number;       // DOMHighResTimeStamp when rest started
}
```

#### 3.1.2 Action Interface
```typescript
interface WorkRestTimerActions {
  // Work phase controls
  startWork: () => void;
  pauseWork: () => void;
  resumeWork: () => void;
  stopWork: () => void;
  
  // Rest phase controls
  skipRest: () => void;
  
  // Configuration
  adjustRatio: (delta: number) => void;  // delta = 1 for 0.01, -1 for -0.01
  resetRatio: () => void;
  
  // System controls
  reset: () => void;
  
  // Data access
  getWorkTime: () => number;     // Current work elapsed time
  getRestTimeLeft: () => number; // Current rest time remaining
  getProgress: () => number;     // Progress percentage (0-100)
}
```

#### 3.1.3 Hook Signature
```typescript
export const useWorkRestTimer = (): [
  WorkRestTimerState,
  WorkRestTimerActions
] => {
  // Implementation
};
```

### 3.2 Timing Engine

use `Timer.ts`

### 3.3 Data Structures

#### 3.3.1 Ratio Management
```typescript
interface RatioConfig {
  value: number;        // Actual ratio (e.g., 1.25)
  internal: number;     // Stored as integer (e.g., 125)
  min: number;          // 0.01 (internal: 1)
  max: number;          // 100.00 (internal: 10000)
  step: number;         // 0.01 (internal: 1)
}

// Conversion utilities
const ratioToInternal = (ratio: number): number => Math.floor(ratio * 100);
const internalToRatio = (internal: number): number => internal / 100;
```

#### 3.3.2 Lap Data Integration
```typescript
// Extend existing LapEntry interface for work/rest specific data
interface WorkRestLapEntry extends LapEntry {
  phase: TimerPhase.Work | TimerPhase.Rest;
  workDuration: number;
  restDuration: number;
  ratio: number;
  roundNumber: number;
}
```

### 3.4 Performance Requirements

#### 3.4.1 Rendering Performance
- **Frame Rate**: Maintain 15fps during work/rest phase
- **Memory**: < 1MB additional memory footprint
- **CPU**: < 1% CPU usage during active timing
- **Bundle Size**: < 10KB gzipped for new components

#### 3.4.2 Optimization Strategies
```typescript
// Memoized calculations to prevent unnecessary re-renders
const displayTime = useMemo(() => {
  return formatTime(phase.state === TimerPhase.Work ? phase.elapsed : getRestTimeLeft());
}, [phase.elapsed, phase.state]);

// Stable callbacks to prevent child re-renders
const startWork = useCallback(() => {
  // Implementation
}, [phase.state]);
```

## 4. Implementation Details

### 4.1 Core Hook Implementation

#### 4.1.1 State Management
```typescript
export const useWorkRestTimer = () => {
  const [state, setState] = useState<WorkRestTimerState>({
    phase: { state: TimerPhase.Idle },
    ratio: 100, // 1.0 stored as integer
    rounds: 0,
    state: TimerState.Idle,
  });
  
  const timerRef = useRef<Timer | null>(null);
  const lapHistory = useLapHistory();
  
  // Implementation details...
};
```

#### 4.1.2 Phase Transitions

```typescript
import { TimerState } from "./types";

const transitionToRest = useCallback((workDurationInSec: number) => {
  // TODO: use Timer.ts
  // const restDuration = Math.round(workDurationInSec * (state.ratio / 100));
  //
  // setState(prev => ({
  //   ...prev,
  //   phase: {
  //     state: 'rest',
  //     duration: restDuration,
  //     elapsed: 0,
  //     startTime: performance.now(),
  //   },
  //   state: TimerState.Running,
  // }));
  //
  // // Start rest countdown
  // timerRef.current?.start((delta) => {
  //   setState(prev => {
  //     if (prev.phase.state !== TimerPhase.Rest) return prev;
  //
  //     const newElapsed = prev.phase.elapsed + delta;
  //     if (newElapsed >= prev.phase.duration) {
  //       // Rest complete, transition to work
  //       return transitionToWork();
  //     }
  //
  //     return {
  //       ...prev,
  //       phase: {
  //         ...prev.phase,
  //         elapsed: newElapsed
  //       },
  //     };
  //   });
  // });
}, [state.ratio]);
```

### 4.2 Component Implementation

#### 4.2.1 Component Structure
```typescript
interface WorkRestTimerProps {
  className?: string;
  onSessionComplete?: (sessionData: WorkRestLapEntry) => void;
}

export const WorkRestTimer = ({
  className,
  onSessionComplete,
}: WorkRestTimerProps) => {
  const [state, actions] = useWorkRestTimer();
  const { laps, addLap, clearHistory } = useLapHistory();
  
  // Component implementation...
};
```

#### 4.2.2 UI State Mapping
```typescript
const getDisplayData = (state: WorkRestTimerState) => {
  switch (state.phase.state) {
    case 'work':
      return {
        time: formatTime(state.phase.elapsed),
        progress: (state.phase.elapsed / (99.99 * 60 * 1000)) * 100,
        label: 'WORK',
        isWork: true,
      };
    case 'rest':
      return {
        time: formatTime(state.phase.duration - state.phase.elapsed),
        progress: (state.phase.elapsed / state.phase.duration) * 100,
        label: 'REST',
        isWork: false,
      };
    default:
      return {
        time: '00:00',
        progress: 0,
        label: 'READY',
        isWork: false,
      };
  }
};
```

## 5. Integration Requirements

### 5.1 Component Integration
- **Card Component**: Reuse for layout and styling
- **BaseButton**: Use for all interactive elements
- **LapHistory**: Extend to show work/rest specific data
- **Icons**: Reuse existing Play/Pause/Stop/Skip icons


### 5.3 State Persistence
 for now ignore this

## 6. Testing Requirements

### 6.1 Unit Tests
```typescript
describe('useWorkRestTimer', () => {
  test('should start work phase from idle', () => {
    // Test state transition
  });
  
  test('should calculate rest duration correctly', () => {
    // Test ratio calculation
  });
  
  test('should handle ratio bounds', () => {
    // Test min/max ratio enforcement
  });
});
```

### 6.2 Integration Tests
```typescript
describe('WorkRestTimer Component', () => {
  test('should complete full work/rest cycle', () => {
    // Test user interaction flow
  });
  
  test('should handle pause/resume during work', () => {
    // Test pause functionality
  });
});
```


## 7. Constraints and Considerations

### 7.1 Technical Constraints
- **Browser Compatibility**: Modern browsers supporting requestAnimationFrame
- **Time Precision**: Sub-millisecond precision not required
- **Concurrent Timers**: Must not interfere with existing interval timer
- **Memory Management**: Proper cleanup of animation frames

### 7.2 Performance Considerations
- **Render Optimization**: Use React.useMemo for expensive calculations
- **Event Throttling**: Limit rapid ratio adjustments
- **Animation Cleanup**: Ensure requestAnimationFrame cleanup
- **State Updates**: Batch state updates to prevent re-render thrashing

### 7.3 Edge Cases
- **Tab Visibility**: Try to NOT Pause the timer when tab not visible (Page Visibility API)
- **System Sleep**: Handle system sleep/wake events
- **Browser Throttling**: Maintain accuracy when browser throttles background tabs
- **Time Limits**: Auto-stop at 99.99 minutes work limit

## 8. Deployment Requirements

### 8.1 Environment Requirements
- **Node.js**: >= 22.0.0 (build time)
- **React**: 19.2.0 (runtime)
- **TypeScript**: 5.9.3 (development)
- **Browser**: ES2020+ compatible

## 9. Success Metrics

### 9.1 Functional Metrics
- ✅ Timer accuracy within ±10ms over 1 hour
- ✅ Ratio calculation precision to 2 decimal places
- ✅ Zero memory leaks over 24 hour continuous use
- ✅ 15fps maintained during work phase

### 9.2 Non-Functional Metrics
- ✅ Bundle size increase < 10KB gzipped
- ✅ Component renders in < 16ms (15fps)
- ✅ Accessibility score 100% (Lighthouse)
- ✅ TypeScript coverage 100%

## 10. Future Considerations

### 10.1 Scalability
- **Multiple Timers**: Architecture should support concurrent timers
- **Plugin System**: Extensible for different timer types
- **State Management**: Migration to external state store if needed

### 10.2 Enhancement Path
- **Audio API**: Integration with Web Audio API for notifications
- **Web Workers**: Offload timing calculations for better performance
- **PWA Support**: Offline functionality and background sync
- **Analytics**: Usage tracking and performance monitoring
