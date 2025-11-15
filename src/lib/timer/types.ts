export enum TimerState {
  Idle = "idle",
  Running = "running",
  Paused = "paused",
  Completed = "completed",
}

export interface TimerOptions {
  onTick?: (time: number) => void;
  onComplete?: () => void;
  onStateChange?: (state: TimerState) => void;
  debug?: boolean;
}

export interface TimerControls {
  start: () => void;
  pause: () => void;
  reset: () => void;
  getState: () => TimerState;
  getTime: () => number;
}
