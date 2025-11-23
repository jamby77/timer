import { AnyTimerConfig, TimerType, WorkRestMode } from '@/types/configure'

/**
 * Testing utility for waiting in async tests
 * @param ms - Milliseconds to wait
 * @returns Promise that resolves after the specified time
 */
export const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Creates a mock timer configuration for testing purposes
 * @param name - The name of the timer
 * @param type - The type of timer to create
 * @returns A mock timer configuration object
 */
export const createMockTimerConfig = (name: string, type: TimerType): AnyTimerConfig => {
  const baseConfig = {
    id: `timer-${name.toLowerCase()}`,
    name,
    createdAt: new Date(),
    lastUsed: new Date(),
  }

  switch (type) {
    case TimerType.COUNTDOWN:
      return {
        ...baseConfig,
        type,
        duration: 300,
        completionMessage: 'Time is up!',
      }

    case TimerType.STOPWATCH:
      return {
        ...baseConfig,
        type,
        timeLimit: 600,
      }

    case TimerType.INTERVAL:
      return {
        ...baseConfig,
        type,
        workDuration: 20,
        restDuration: 10,
        intervals: 8,
        workLabel: 'Work',
        restLabel: 'Rest',
        skipLastRest: true,
      }

    case TimerType.WORKREST:
      return {
        ...baseConfig,
        type,
        ratio: 2.0,
        maxWorkTime: 300,
        maxRounds: 10,
        restMode: WorkRestMode.RATIO,
      }

    case TimerType.COMPLEX:
      return {
        ...baseConfig,
        type,
        phases: [],
      }

    default:
      throw new Error(`Unsupported timer type: ${type}`)
  }
}

/**
 * Creates a mock countdown timer configuration
 * @returns A mock countdown timer configuration
 */
export const createMockCountdownConfig = (): AnyTimerConfig => {
  return createMockTimerConfig('Test Countdown', TimerType.COUNTDOWN)
}

/**
 * Creates a mock interval timer configuration
 * @returns A mock interval timer configuration
 */
export const createMockIntervalConfig = (): AnyTimerConfig => {
  return createMockTimerConfig('Test Interval', TimerType.INTERVAL)
}

/**
 * Creates a mock stopwatch configuration
 * @returns A mock stopwatch configuration
 */
export const createMockStopwatchConfig = (): AnyTimerConfig => {
  return createMockTimerConfig('Test Stopwatch', TimerType.STOPWATCH)
}

/**
 * Creates a mock work/rest timer configuration
 * @returns A mock work/rest timer configuration
 */
export const createMockWorkRestConfig = (): AnyTimerConfig => {
  return createMockTimerConfig('Test Work/Rest', TimerType.WORKREST)
}

/**
 * Utility to create mock date objects for consistent testing
 * @param dateString - Optional date string, defaults to current time
 * @returns A Date object
 */
export const createMockDate = (dateString?: string): Date => {
  return dateString ? new Date(dateString) : new Date()
}

/**
 * Creates a mock timer with custom timestamp
 * @param name - Timer name
 * @param type - Timer type
 * @param timestamp - Custom timestamp
 * @returns A mock timer configuration with custom timestamps
 */
export const createMockTimerWithTimestamp = (
  name: string,
  type: TimerType,
  timestamp: string
): AnyTimerConfig => {
  const mockDate = createMockDate(timestamp)
  const config = createMockTimerConfig(name, type)
  config.createdAt = mockDate
  config.lastUsed = mockDate
  return config
}
