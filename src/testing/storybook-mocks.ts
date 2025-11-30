import { TimerType } from '@/types/configure'

import { createMockTimerConfig } from './utils'

/**
 * Mock predefined styles for Storybook stories (no Vitest dependencies)
 */
export const mockStyles = [
  {
    id: 'style-1',
    name: 'Tabata',
    description: 'High-intensity interval training protocol',
    isBuiltIn: true,
    config: createMockTimerConfig('Tabata', TimerType.INTERVAL),
  },
  {
    id: 'style-2',
    name: 'EMOM',
    description: 'Every minute on the minute - 10 minutes',
    isBuiltIn: true,
    config: createMockTimerConfig('EMOM', TimerType.INTERVAL),
  },
  {
    id: 'style-3',
    name: 'Work/Rest Ratio',
    description: 'Work/rest timer with equal work and rest periods',
    isBuiltIn: true,
    config: createMockTimerConfig('Work/Rest Ratio', TimerType.WORKREST),
  },
  {
    id: 'style-4',
    name: 'Countdown',
    description: 'Simple 5-minute countdown',
    isBuiltIn: true,
    config: createMockTimerConfig('Countdown', TimerType.COUNTDOWN),
  },
  {
    id: 'style-5',
    name: 'Stopwatch',
    description: '10-minute limited stopwatch',
    isBuiltIn: true,
    config: createMockTimerConfig('Stopwatch', TimerType.STOPWATCH),
  },
]
