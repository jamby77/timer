import { TimerStep } from "@/lib/timer/TimerManager";

export enum TimerState {
  Idle = "idle",
  Running = "running",
  Paused = "paused",
  Completed = "completed",
}

export interface TimerOptions {
  onTick?: (time: number, totalElapsedTime: number) => void;
  onComplete?: (totalElapsedTime: number) => void;
  onStateChange?: (state: TimerState, totalElapsedTime: number) => void;
  debug?: boolean;
}

export interface TimerControls {
  start: () => void;
  pause: () => void;
  reset: () => void;
  getState: () => TimerState;
  getTime: () => number;
}

export interface IntervalConfig {
  /** Work duration in seconds */
  workDuration: number;
  /** Rest duration in seconds */
  restDuration: number;
  /** Number of intervals to complete */
  intervals: number;
  /** Label for work periods */
  workLabel?: string;
  /** Label for rest periods */
  restLabel?: string;
  /** Whether to skip the last rest period */
  skipLastRest?: boolean;
  onWorkStepComplete?: (time: number) => void;
  onStepChange?: (step: TimerStep, stepIndex: number) => void;
  onSequenceComplete?: () => void;
}
