import { TimerType } from "@/lib/timer/types";

// Re-export TimerType for convenience
export { TimerType };

// Timer configuration base interface
export interface TimerConfig {
  id: string;
  name: string;
  type: TimerType;
  createdAt: Date;
  lastUsed: Date;
}

// Specific timer type configurations
export interface CountdownConfig extends TimerConfig {
  type: TimerType.COUNTDOWN;
  duration: number; // seconds
  completionMessage?: string;
}

export interface StopwatchConfig extends TimerConfig {
  type: TimerType.STOPWATCH;
  timeLimit?: number; // seconds (optional)
  completionMessage?: string;
}

export interface IntervalConfig extends TimerConfig {
  type: TimerType.INTERVAL;
  workDuration: number; // seconds
  restDuration: number; // seconds
  intervals: number;
  workLabel?: string;
  restLabel?: string;
  skipLastRest?: boolean;
  countdownBeforeStart?: number; // seconds
}

export enum WorkRestMode {
  RATIO = "ratio",
  FIXED = "fixed",
}

export interface WorkRestConfig extends TimerConfig {
  type: TimerType.WORKREST;
  ratio: number; // work/rest ratio (e.g., 2.0 for 2:1)
  maxWorkTime: number; // seconds
  maxRounds: number;
  restMode: WorkRestMode;
  fixedRestDuration?: number; // seconds (only used when restMode is FIXED)
  countdownBeforeStart?: number; // seconds
}

export interface ComplexPhase {
  id: string;
  name: string;
  type: TimerType;
  config: CountdownConfig | StopwatchConfig | IntervalConfig | WorkRestConfig;
  order: number;
}

export interface ComplexConfig extends TimerConfig {
  type: TimerType.COMPLEX;
  phases: ComplexPhase[];
  overallTimeLimit?: number; // seconds (optional)
  autoAdvance?: boolean; // automatically move to next phase
}

// Union type for all timer configurations
export type AnyTimerConfig =
  | CountdownConfig
  | StopwatchConfig
  | IntervalConfig
  | WorkRestConfig
  | ComplexConfig;

// Timer categories for organization
export enum TimerCategory {
  CARDIO = "cardio",
  STRENGTH = "strength",
  FLEXIBILITY = "flexibility",
  SPORTS = "sports",
  CUSTOM = "custom",
}

// Predefined timer style
export interface PredefinedStyle {
  id: string;
  name: string;
  description: string;
  category: TimerCategory;
  isBuiltIn: boolean;
  config: AnyTimerConfig;
}

// Recent timer entry
export interface RecentTimer {
  id: string;
  config: AnyTimerConfig;
  startedAt: Date;
}

// Component prop types
export interface RecentTimersProps {
  timers: RecentTimer[];
  onStartTimer: (config: AnyTimerConfig, isPredefined?: boolean) => void;
  onRemoveTimer: (timerId: string) => void;
  onClearAll: () => void;
}

export interface TimerTypeSelectorProps {
  selectedType: TimerType | null;
  onTypeSelect: (type: TimerType) => void;
}

export interface PredefinedStylesProps {
  styles: PredefinedStyle[];
  onSelectStyle: (style: PredefinedStyle) => void;
  onStartTimer: (config: AnyTimerConfig) => void;
}

export interface TimerConfigFormProps {
  type: TimerType;
  initialConfig?: AnyTimerConfig;
  isPredefined?: boolean;
  onStartTimer: (config: AnyTimerConfig) => void;
  onSaveAsPredefined?: (config: AnyTimerConfig) => void;
  onSave?: (config: AnyTimerConfig) => void;
}

// Storage types
export interface StorageManager {
  getRecentTimers: () => RecentTimer[];
  addRecentTimer: (config: AnyTimerConfig) => void;
  removeTimer: (timerId: string) => void;
  clearRecentTimers: () => void;
  getTimerConfig: (timerId: string) => AnyTimerConfig | null;
  storeTimerConfig: (config: AnyTimerConfig) => string;
  getAllStoredTimers: () => Array<{ id: string; config: AnyTimerConfig }>;
}
