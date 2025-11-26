import {
  AnyTimerConfig,
  IntervalConfig,
  PredefinedStyle,
  TimerType,
  WorkRestConfig,
  WorkRestMode,
} from '@/types/configure'
import { TimerConfigHash } from '@/lib/timer/TimerConfigHash'

// Define timer configurations separately for maintainability
const TABATA_CONFIG: IntervalConfig = {
  id: 'tabata-standard',
  name: 'Tabata',
  type: TimerType.INTERVAL,
  workDuration: 20,
  restDuration: 10,
  intervals: 8,
  workLabel: 'Work',
  restLabel: 'Rest',
  skipLastRest: true,
  countdownBeforeStart: 10,
}

const EMOM_CONFIG: IntervalConfig = {
  id: 'emom-10min',
  name: 'EMOM (10 min)',
  type: TimerType.INTERVAL,
  workDuration: 60,
  restDuration: 0,
  intervals: 10,
  workLabel: 'Work',
  restLabel: 'Rest',
  skipLastRest: false,
  countdownBeforeStart: 10,
}

const WORKREST_RATIO_CONFIG: WorkRestConfig = {
  id: 'workrest-1to1-ratio',
  name: 'Work/Rest (1:1 ratio)',
  type: TimerType.WORKREST,
  ratio: 1.0,
  maxWorkTime: 1800,
  maxRounds: 20,
  restMode: WorkRestMode.RATIO,
  countdownBeforeStart: 10,
}

export const PREDEFINED_STYLES: PredefinedStyle<AnyTimerConfig>[] = [
  {
    id: TimerConfigHash.generateTimerId(TABATA_CONFIG),
    name: 'Tabata',
    description: '20 seconds on, 10 seconds off',
    isBuiltIn: true,
    config: TABATA_CONFIG,
  },
  {
    id: TimerConfigHash.generateTimerId(EMOM_CONFIG),
    name: 'EMOM (10 min)',
    description: 'Every Minute On The Minute - 10 minutes',
    isBuiltIn: true,
    config: EMOM_CONFIG,
  },
  {
    id: TimerConfigHash.generateTimerId(WORKREST_RATIO_CONFIG),
    name: 'Work/Rest (1:1 ratio)',
    description: 'Work/rest timer with equal work and rest periods',
    isBuiltIn: true,
    config: WORKREST_RATIO_CONFIG,
  },
]

export const getPredefinedStyleById = (id: string): PredefinedStyle<AnyTimerConfig> | undefined => {
  return PREDEFINED_STYLES.find((style) => style.id === id)
}

// Helper function to create a predefined style with generated ID
export const createPredefinedStyle = <T extends AnyTimerConfig>(
  id: string,
  name: string,
  description: string,
  config: Omit<T, 'id' | 'createdAt' | 'lastUsed'>
): PredefinedStyle<T> => {
  const fullConfig: T = {
    ...config,
    id, // Include the provided ID
    createdAt: new Date(),
    lastUsed: new Date(),
  } as T

  return {
    id: TimerConfigHash.generateTimerId(fullConfig),
    name,
    description,
    config: fullConfig,
    isBuiltIn: false, // User-created style
  }
}
