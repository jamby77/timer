import { describe, expect, it } from 'vitest'

import { AnyTimerConfig, TimerType, WorkRestMode } from '@/types/configure'
import { TimerConfigHash } from './TimerConfigHash'

const configs: AnyTimerConfig[] = [
  { id: 'countdown', name: 'Timer', type: TimerType.COUNTDOWN, duration: 30 },
  { id: 'stopwatch', name: 'Timer', type: TimerType.STOPWATCH },
  { id: 'interval', name: 'Timer', type: TimerType.INTERVAL, workDuration: 20, restDuration: 10, intervals: 2 },
  { id: 'workrest', name: 'Timer', type: TimerType.WORKREST, restMode: WorkRestMode.RATIO, ratio: 2, maxRounds: 2 },
  { id: 'complex', name: 'Timer', type: TimerType.COMPLEX, phases: [{ id: 'phase', name: 'Work', type: TimerType.COUNTDOWN, order: 0, config: { id: 'child', name: 'Work', type: TimerType.COUNTDOWN, duration: 30 } }] },
]

describe.each(configs)('$type identity', config => {
  it.each([
    { countdownBeforeStart: 3 },
    { completionMessage: 'Finished!' },
    { sound: { enabled: true, volume: 0.5 } },
  ])('distinguishes shared settings %j', updates => {
    expect(TimerConfigHash.configsEqual(config, { ...config, ...updates })).toBe(false)
  })

  it('ignores IDs and timestamps', () => {
    expect(TimerConfigHash.configsEqual(config, {
      ...config, id: 'other', createdAt: new Date(), lastUsed: new Date(),
    })).toBe(true)
  })
})

it.each([
  { enabled: false }, { volume: 0.9 }, { countdownBeeps: 2 }, { startBeep: false },
  { finishBeep: false }, { intervalStartBeep: false }, { intervalEndBeep: false },
  { tick: true }, { tickEverySeconds: 5 },
])('distinguishes sound options %j', update => {
  const config = { ...configs[0], sound: { enabled: true, volume: 0.5 } }
  expect(TimerConfigHash.configsEqual(config, { ...config, sound: { ...config.sound, ...update } })).toBe(false)
})

it('normalizes sound property order', () => {
  expect(TimerConfigHash.configsEqual(
    { ...configs[0], sound: { enabled: true, volume: 0.5, tick: true } },
    { ...configs[0], sound: { tick: true, volume: 0.5, enabled: true } },
  )).toBe(true)
})

it('includes nested phase settings and uses the runtime auto-advance default', () => {
  const config = configs[4]
  if (config.type !== TimerType.COMPLEX) throw new Error('Expected complex timer')
  expect(TimerConfigHash.configsEqual(config, { ...config, autoAdvance: true })).toBe(true)
  expect(TimerConfigHash.configsEqual(config, { ...config, autoAdvance: false })).toBe(false)
  expect(TimerConfigHash.configsEqual(config, {
    ...config, phases: config.phases.map(phase => ({ ...phase, config: { ...phase.config, countdownBeforeStart: 3 } })),
  })).toBe(false)
})

it('uses the runtime final-rest default for interval identity', () => {
  const config = configs[2]
  if (config.type !== TimerType.INTERVAL) throw new Error('Expected interval timer')
  expect(TimerConfigHash.configsEqual(config, { ...config, skipLastRest: true })).toBe(true)
  expect(TimerConfigHash.configsEqual(config, { ...config, skipLastRest: false })).toBe(false)
})
