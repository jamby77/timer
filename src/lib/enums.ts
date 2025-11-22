// Timer-related enums
export enum TimerType {
  COUNTDOWN = "COUNTDOWN",
  STOPWATCH = "STOPWATCH", 
  INTERVAL = "INTERVAL",
  WORKREST = "WORKREST",
  COMPLEX = "COMPLEX",
}

export enum TimerState {
  Idle = "idle",
  Running = "running",
  Paused = "paused",
  Completed = "completed",
}

export enum TimerPhase {
  Idle = "idle",
  Work = "work",
  Rest = "rest",
  Completed = "completed",
}

export enum StepState {
  Start = "start",
  Pause = "pause",
  Resume = "resume",
  Complete = "complete",
  Skip = "skip",
}

// Configuration-related enums
export enum WorkRestMode {
  RATIO = "ratio",
  FIXED = "fixed",
}

export enum TimerCategory {
  CARDIO = "cardio",
  STRENGTH = "strength",
  FLEXIBILITY = "flexibility",
  SPORTS = "sports",
  CUSTOM = "custom",
}
