import { TimerConfigHash } from "@/lib/timer/TimerConfigHash";
import {
  AnyTimerConfig,
  CountdownConfig,
  IntervalConfig,
  PredefinedStyle,
  StopwatchConfig,
  TimerCategory,
  TimerType,
  WorkRestConfig,
  WorkRestMode,
} from "@/types/configure";

// Define timer configurations separately for maintainability
const TABATA_CONFIG: IntervalConfig = {
  id: "tabata-standard",
  name: "Tabata",
  type: TimerType.INTERVAL,
  workDuration: 20,
  restDuration: 10,
  intervals: 8,
  workLabel: "Work",
  restLabel: "Rest",
  skipLastRest: true,
  countdownBeforeStart: 5,
  // Note: createdAt and lastUsed will be set when timer is actually used
} as IntervalConfig;

const EMOM_CONFIG: IntervalConfig = {
  id: "emom-10min",
  name: "EMOM (10 min)",
  type: TimerType.INTERVAL,
  workDuration: 60,
  restDuration: 0,
  intervals: 10,
  workLabel: "Work",
  restLabel: "Rest",
  skipLastRest: false,
  countdownBeforeStart: 10,
  // Note: createdAt and lastUsed will be set when timer is actually used
} as IntervalConfig;

const E2MOM_CONFIG: IntervalConfig = {
  id: "e2mom-5rounds",
  name: "E2MOM (5 rounds)",
  type: TimerType.INTERVAL,
  workDuration: 60,
  restDuration: 60,
  intervals: 5,
  workLabel: "Work",
  restLabel: "Rest",
  skipLastRest: false,
  countdownBeforeStart: 10,
  // Note: createdAt and lastUsed will be set when timer is actually used
} as IntervalConfig;

const HIIT_CONFIG: IntervalConfig = {
  id: "hiit-standard",
  name: "HIIT",
  type: TimerType.INTERVAL,
  workDuration: 30,
  restDuration: 30,
  intervals: 10,
  workLabel: "Work",
  restLabel: "Rest",
  skipLastRest: false,
  countdownBeforeStart: 5,
  // Note: createdAt and lastUsed will be set when timer is actually used
} as IntervalConfig;

const COUNTDOWN_5MIN_CONFIG: CountdownConfig = {
  id: "countdown-5min",
  name: "Countdown (5 min)",
  type: TimerType.COUNTDOWN,
  duration: 300,
  completionMessage: "Time is up!",
  // Note: createdAt and lastUsed will be set when timer is actually used
} as CountdownConfig;

const STOPWATCH_10MIN_CONFIG: StopwatchConfig = {
  id: "stopwatch-10min",
  name: "Stopwatch (10 min limit)",
  type: TimerType.STOPWATCH,
  timeLimit: 600,
  completionMessage: "Time limit reached",
  // Note: createdAt and lastUsed will be set when timer is actually used
} as StopwatchConfig;

const WORKREST_RATIO_CONFIG: WorkRestConfig = {
  id: "workrest-1to1-ratio",
  name: "Work/Rest (1:1 ratio)",
  type: TimerType.WORKREST,
  ratio: 1.0,
  maxWorkTime: 1800,
  maxRounds: 20,
  restMode: WorkRestMode.RATIO,
  countdownBeforeStart: 3,
  // Note: createdAt and lastUsed will be set when timer is actually used
} as WorkRestConfig;

const WORKREST_FIXED_CONFIG: WorkRestConfig = {
  id: "workrest-fixed-rest",
  name: "Work/Rest (Fixed 30s rest)",
  type: TimerType.WORKREST,
  ratio: 2.0, // Default ratio, but overridden by fixed mode
  maxWorkTime: 1800,
  maxRounds: 15,
  restMode: WorkRestMode.FIXED,
  fixedRestDuration: 30, // Always 30 seconds rest
  countdownBeforeStart: 5,
  // Note: createdAt and lastUsed will be set when timer is actually used
} as WorkRestConfig;

export const PREDEFINED_STYLES: PredefinedStyle[] = [
  {
    id: TimerConfigHash.generateTimerId(TABATA_CONFIG),
    name: "Tabata",
    description: "High-intensity interval training protocol",
    category: TimerCategory.CARDIO,
    isBuiltIn: true,
    config: TABATA_CONFIG,
  },
  {
    id: TimerConfigHash.generateTimerId(EMOM_CONFIG),
    name: "EMOM (10 min)",
    description: "Every Minute On The Minute - 10 minutes",
    category: TimerCategory.CARDIO,
    isBuiltIn: true,
    config: EMOM_CONFIG,
  },
  {
    id: TimerConfigHash.generateTimerId(E2MOM_CONFIG),
    name: "E2MOM (5 rounds)",
    description: "Every 2 Minutes On The Minute - 5 rounds",
    category: TimerCategory.STRENGTH,
    isBuiltIn: true,
    config: E2MOM_CONFIG,
  },
  {
    id: TimerConfigHash.generateTimerId(HIIT_CONFIG),
    name: "HIIT",
    description: "High-intensity interval training",
    category: TimerCategory.CARDIO,
    isBuiltIn: true,
    config: HIIT_CONFIG,
  },
  {
    id: TimerConfigHash.generateTimerId(COUNTDOWN_5MIN_CONFIG),
    name: "Countdown (5 min)",
    description: "Simple 5-minute countdown timer",
    category: TimerCategory.FLEXIBILITY,
    isBuiltIn: true,
    config: COUNTDOWN_5MIN_CONFIG,
  },
  {
    id: TimerConfigHash.generateTimerId(STOPWATCH_10MIN_CONFIG),
    name: "Stopwatch (10 min limit)",
    description: "Count-up timer with 10-minute limit",
    category: TimerCategory.CARDIO,
    isBuiltIn: true,
    config: STOPWATCH_10MIN_CONFIG,
  },
  {
    id: TimerConfigHash.generateTimerId(WORKREST_RATIO_CONFIG),
    name: "Work/Rest (1:1 ratio)",
    description: "Work/rest timer with equal work and rest periods",
    category: TimerCategory.STRENGTH,
    isBuiltIn: true,
    config: WORKREST_RATIO_CONFIG,
  },
  {
    id: TimerConfigHash.generateTimerId(WORKREST_FIXED_CONFIG),
    name: "Work/Rest (Fixed 30s rest)",
    description: "Work/rest timer with fixed 30-second rest periods",
    category: TimerCategory.STRENGTH,
    isBuiltIn: true,
    config: WORKREST_FIXED_CONFIG,
  },
];

// Helper functions
export const getPredefinedStyles = (): PredefinedStyle[] => {
  return PREDEFINED_STYLES;
};

export const getPredefinedStyleById = (id: string): PredefinedStyle | undefined => {
  return PREDEFINED_STYLES.find((style) => style.id === id);
};

export const getPredefinedStylesByCategory = (category: TimerCategory): PredefinedStyle[] => {
  return PREDEFINED_STYLES.filter((style) => style.category === category);
};

// Helper function to create a predefined style with generated ID
export const createPredefinedStyle = (
  id: string,
  name: string,
  description: string,
  category: TimerCategory,
  config: Omit<AnyTimerConfig, "id" | "createdAt" | "lastUsed">,
): PredefinedStyle => {
  const fullConfig: AnyTimerConfig = {
    ...config,
    id, // Include the provided ID
    createdAt: new Date(),
    lastUsed: new Date(),
  } as AnyTimerConfig;

  return {
    id: TimerConfigHash.generateTimerId(fullConfig),
    name,
    description,
    category,
    config: fullConfig,
    isBuiltIn: false, // User-created style
  };
};
