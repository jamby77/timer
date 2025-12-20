import { TimerType, WorkRestMode } from '@/lib/enums'

// Re-export enums for backward compatibility
export { TimerType, WorkRestMode }

export interface SoundConfig {
  enabled: boolean
  volume: number
  countdownBeeps?: number
  startBeep?: boolean
  finishBeep?: boolean
  intervalStartBeep?: boolean
  intervalEndBeep?: boolean
  tick?: boolean
  tickEverySeconds?: number
}

// Timer configuration base interface
export interface TimerConfig {
  id: string
  name: string
  type: TimerType
  createdAt?: Date
  countdownBeforeStart?: number // seconds
  lastUsed?: Date
  completionMessage?: string
  sound?: SoundConfig
}

// Specific timer type configurations
export interface CountdownConfig extends TimerConfig {
  type: TimerType.COUNTDOWN
  duration: number // seconds
}

export interface StopwatchConfig extends TimerConfig {
  type: TimerType.STOPWATCH
  timeLimit?: number // seconds (optional)
}

export interface IntervalConfig extends TimerConfig {
  type: TimerType.INTERVAL
  workDuration: number // seconds
  restDuration: number // seconds
  intervals: number
  workLabel?: string
  restLabel?: string
  skipLastRest?: boolean
}

// Base WorkRest configuration without ratio/fixedRestDuration
interface BaseWorkRestConfig extends TimerConfig {
  type: TimerType.WORKREST
  maxWorkTime: number // seconds
  maxRounds: number
  restMode: WorkRestMode
  countdownBeforeStart?: number // seconds
}

// WorkRest configuration using ratio
export interface WorkRestRatioConfig extends BaseWorkRestConfig {
  restMode: WorkRestMode.RATIO
  ratio: number // work/rest ratio (e.g., 2.0 for 2:1)
  fixedRestDuration?: never // explicitly disallow
}

// WorkRest configuration using fixed duration
export interface WorkRestFixedConfig extends BaseWorkRestConfig {
  restMode: WorkRestMode.FIXED
  fixedRestDuration: number // seconds
  ratio?: never // explicitly disallow
}

// Union type for WorkRest configurations
export type WorkRestConfig = WorkRestRatioConfig | WorkRestFixedConfig

export interface ComplexPhase {
  id: string
  name: string
  type: TimerType
  config: CountdownConfig | StopwatchConfig | IntervalConfig | WorkRestConfig
  order: number
}

export interface ComplexConfig extends TimerConfig {
  type: TimerType.COMPLEX
  phases: ComplexPhase[]
  overallTimeLimit?: number // seconds (optional)
  autoAdvance?: boolean // automatically move to next phase
}

// Union type for all timer configurations
export type AnyTimerConfig =
  | CountdownConfig
  | StopwatchConfig
  | IntervalConfig
  | WorkRestConfig
  | ComplexConfig

// Predefined timer style
export interface PredefinedStyle<T extends AnyTimerConfig> {
  id: string
  name: string
  description: string
  isBuiltIn: boolean
  config: T
}

// Recent timer entry
export interface RecentTimer {
  id: string
  config: AnyTimerConfig
  startedAt: Date
}

/**
 * Props for RecentTimers component
 *
 * @property {RecentTimer[]} timers - List of recent timers
 * @property {(config: AnyTimerConfig, isPredefined?: boolean) => void} onStartTimer - Callback when a timer is started
 * @property {(timerId: string) => void} onRemoveTimer - Callback when a timer is removed
 */
export interface RecentTimersProps {
  /** List of recent timers */
  timers: RecentTimer[]
  onStartTimer: (config: AnyTimerConfig, isPredefined?: boolean) => void
  onRemoveTimer: (timerId: string) => void
}

export interface TimerTypeSelectorProps {
  selectedTimer: TimerType | null
  onTimerSelect: (type: TimerType) => void
}

export interface PredefinedStylesProps {
  styles: PredefinedStyle<AnyTimerConfig>[]
  onSelectStyle: (style: PredefinedStyle<AnyTimerConfig>) => void
  onStartTimer: (config: AnyTimerConfig) => void
}

export interface TimerConfigFormProps {
  type: TimerType
  initialConfig?: AnyTimerConfig
  isPredefined?: boolean
  onStartTimer: (config: AnyTimerConfig) => void
  onSaveAsPredefined?: (config: AnyTimerConfig) => void
  onSave?: (config: AnyTimerConfig) => void
  onCancel?: () => void
}

// Storage types
export interface StorageManager {
  getRecentTimers: () => RecentTimer[]
  addRecentTimer: (config: AnyTimerConfig) => void
  removeTimer: (timerId: string) => void
  clearRecentTimers: () => void
  getTimerConfig: (timerId: string) => AnyTimerConfig | null
  storeTimerConfig: (config: AnyTimerConfig) => string
  getAllStoredTimers: () => Array<{ id: string; config: AnyTimerConfig }>
}
