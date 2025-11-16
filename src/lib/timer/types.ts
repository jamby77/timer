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
