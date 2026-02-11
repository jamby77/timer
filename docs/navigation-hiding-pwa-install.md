# Navigation Hiding & PWA Install Prompt Improvements

## Overview
Two UX improvements: hide navigation during timer execution and
implement smart PWA install prompt behavior with dismiss functionality.

## 1. Navigation Hiding During Timer Execution

### Requirements
- When any timer is running (active state), hide the main navigation
- Navigation should reappear when timer is stopped or completed (paused should keep nav hidden)
- Applies to all timer types: Timer, Stopwatch, Interval, WorkRestTimer, ComplexTimer

### Implementation Approach

#### Option A: Global State Management
```typescript
// Create a global timer state context
const TimerContext = createContext({
  isAnyTimerRunning: false,
  setTimerRunning: (running: boolean) => {}
});

// Navigation component checks this state
const Navigation = () => {
  const { isAnyTimerRunning } = useContext(TimerContext);
  
  if (isAnyTimerRunning) return null;
  
  return (
    <nav className="navigation">
      {/* navigation content */}
    </nav>
  );
};
```

#### Option B: Component-level Prop Drilling
- Pass `hideNavigation` prop to layout from active timer components
- Use callback to notify parent components of timer state changes

#### Option C: URL-based Detection
- Check current route for timer patterns (`/timer/*`, `/complex/*`)
- Less ideal as it doesn't account for actual timer state

### Files to Modify
- `/src/app/layout.tsx` - Navigation visibility logic
- `/src/components/Navigation.tsx` - Conditional rendering
- `/src/components/display/*.tsx` - All timer components to emit state
- `/src/hooks/use*.ts` - All timer hooks to expose running state

## 2. PWA Install Prompt with Smart Dismiss

### Current Behavior
- iOS/macOS install prompt appears
- No dismiss option
- No persistence of user choice

### ✅ **Implemented**
2. **PWA Install Prompt with Smart Dismiss**
   - Added dismiss button with X icon to InstallPrompt component
   - Implemented localStorage timestamp storage for dismissal tracking
   - 30-day dismissal duration logic implemented
   - Component respects both standalone mode and dismissal status
   - Automatic re-show after 30 days if not installed

### Implementation Strategy

#### Storage Schema
```typescript
interface PWAInstallState {
  lastShown: timestamp;
  dismissCount: number;
  permanentlyDismissed: boolean;
  installCompleted: boolean;
}
```

#### Display Logic
```typescript
const shouldShowInstallPrompt = () => {
  const state = getPWAInstallState();
  
  // Don't show if already installed
  if (state.installCompleted) return false;
  
  // Don't show if permanently dismissed
  if (state.permanentlyDismissed) return false;
  
  // Don't show if dismissed within last 30 days
  if (state.lastShown && (Date.now() - state.lastShown) < 30 * 24 * 60 * 60 * 1000) {
    return false;
  }
  
  // Show if eligible for PWA and not recently dismissed
  return isPWAElegible();
};
```

#### UX Flow
1. **Initial Prompt**: Show install prompt with "Install" and "Dismiss" buttons
2. **Dismiss Action**: 
   - Store dismissal timestamp
   - Increment dismiss count
   - Hide prompt for 30 days
   - After 3 dismissals, offer "Never show again" option
3. **Install Action**: 
   - Trigger PWA install flow
   - Mark as installed if successful
4. **Permanent Dismiss**: 
   - Set `permanentlyDismissed = true`
   - Never show again



## Implementation Priority
1. **✅ Completed**: Navigation hiding (impacts all timer usage) - **IMPLEMENTED**
2. **✅ Completed**: PWA install prompt improvements with smart dismiss - **IMPLEMENTED**

## Testing Considerations
- Test navigation hiding across all timer types
- Test edge cases (browser refresh, multiple tabs)
