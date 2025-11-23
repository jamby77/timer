import { TimerPhase, TimerState, TimerType } from '@/lib/enums'
import { type TimerStep } from '@/lib/timer/TimerManager'

// Re-export enums for backward compatibility
export { TimerType, TimerState, TimerPhase }

export interface WorkRestTimerState {
  phase: TimerPhase
  ratio: number // Work/rest multiplier (stored as integer * 100)
  rounds: number // Count of completed work sessions
  maxRounds: number // Maximum rounds for this session (capped at MAX_ROUNDS)
  state: TimerState // Active timing state
  currentTime: number // Current time in milliseconds (work elapsed or rest remaining)
}

export interface WorkRestTimerActions {
  // Work phase controls
  startWork: () => void
  pauseWork: () => void
  resumeWork: () => void
  stopWork: () => void

  // Rest phase controls
  skipRest: () => void
  stopRest: () => void

  // Configuration
  adjustRatio: (delta: number) => void // delta = 1 for 0.01, -1 for -0.01
  setRatio: (ratio: number) => void
  resetRatio: () => void
  setMaxRounds: (maxRounds: number) => void // Set max rounds (capped at MAX_ROUNDS)

  // System controls
  reset: () => void
  stopExecution: () => void // Stop entire session and return to idle
  getProgress: () => number // Progress percentage (0-100)
}

export interface WorkRestTimerOptions {
  onLapRecorded?: (time: number) => void // Callback for lap recording
}

export interface TimerOptions {
  onTick?: (time: number, totalElapsedTime: number) => void
  onComplete?: (totalElapsedTime: number) => void
  onStateChange?: (state: TimerState, totalElapsedTime: number) => void
  debug?: boolean
}

export interface TimerControls {
  start: () => void
  pause: () => void
  reset: () => void
  getState: () => TimerState
  getTime: () => number
}

export interface IntervalConfig {
  /** Work duration in seconds */
  workDuration: number
  /** Rest duration in seconds */
  restDuration: number
  /** Number of intervals to complete */
  intervals: number
  /** Label for work periods */
  workLabel?: string
  /** Label for rest periods */
  restLabel?: string
  /** Whether to skip the last rest period */
  skipLastRest?: boolean
  onWorkStepComplete?: (time: number) => void
  onStepChange?: (step: TimerStep | null, stepIndex: number) => void
  onSequenceComplete?: () => void
}
