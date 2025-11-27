import { ComponentType } from 'react'
import { ClockAlert, ClockArrowDown, ClockPlus, Timer, TimerReset } from 'lucide-react'

// Timer-related enums
export enum TimerType {
  COUNTDOWN = 'COUNTDOWN',
  STOPWATCH = 'STOPWATCH',
  INTERVAL = 'INTERVAL',
  WORKREST = 'WORKREST',
  COMPLEX = 'COMPLEX',
}

export enum TimerState {
  Idle = 'idle',
  Running = 'running',
  Paused = 'paused',
  Completed = 'completed',
}

export enum TimerPhase {
  Idle = 'idle',
  Work = 'work',
  Rest = 'rest',
  Completed = 'completed',
}

export enum StepState {
  Start = 'start',
  Pause = 'pause',
  Resume = 'resume',
  Complete = 'complete',
  Skip = 'skip',
}

// Configuration-related enums
export enum WorkRestMode {
  RATIO = 'ratio',
  FIXED = 'fixed',
}

// Timer type labels for UI display
export const TIMER_TYPE_LABELS: Record<TimerType, string> = {
  [TimerType.COUNTDOWN]: 'Countdown',
  [TimerType.STOPWATCH]: 'Stopwatch',
  [TimerType.INTERVAL]: 'Interval',
  [TimerType.WORKREST]: 'Work/Rest Ratio',
  [TimerType.COMPLEX]: 'Complex',
}

// Timer type icons for UI display
export const TIMER_TYPE_ICONS: Record<TimerType, ComponentType<any>> = {
  [TimerType.COUNTDOWN]: ClockArrowDown,
  [TimerType.STOPWATCH]: Timer,
  [TimerType.INTERVAL]: TimerReset,
  [TimerType.WORKREST]: ClockPlus,
  [TimerType.COMPLEX]: ClockAlert,
}

// Theme-related enums
export enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
  SYSTEM = 'system',
}

export const THEME_LABELS: Record<Theme, string> = {
  [Theme.LIGHT]: 'Light',
  [Theme.DARK]: 'Dark',
  [Theme.SYSTEM]: 'System',
}
