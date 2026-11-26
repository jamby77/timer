import { describe, expect, it } from 'vitest'

import type { IntervalConfig } from '@/types/configure'

import { TimerType } from '@/types/configure'
import { TimerConfigHash } from '@/lib/timer/TimerConfigHash'

import { normalizeRoundNames } from './round-names'
import { validateTimerConfig } from './utils'

const base: IntervalConfig = {
  id: 'circuit',
  type: TimerType.INTERVAL,
  name: 'Circuit',
  workDuration: 45,
  restDuration: 15,
  intervals: 3,
}

describe('round names', () => {
  it('keeps names in their numbered positions and drops unused trailing positions', () => {
    expect(normalizeRoundNames(['  ', ' Bike ', '', 'Carry'], 3)).toEqual(['', 'Bike'])
    expect(normalizeRoundNames(['  ', ' Bike '], 1)).toBeUndefined()
    expect(normalizeRoundNames(undefined, 20)).toBeUndefined()
  })
  it('preserves the identity of unnamed intervals and distinguishes named presets and their phases', () => {
    const id = TimerConfigHash.generateTimerId.bind(TimerConfigHash)
    const named = { ...base, roundNames: ['', 'Bike'] }
    expect(id(base)).toBe(id({ ...base, roundNames: [' ', ''] }))
    expect(id(named)).toBe(id({ ...base, roundNames: ['', ' Bike ', '', 'Outside'] }))
    expect(id(named)).not.toBe(id({ ...base, roundNames: ['Bike'] }))
    const complex = (config: IntervalConfig) => ({
      id: 'multi',
      type: TimerType.COMPLEX as const,
      name: 'Multi',
      phases: [{ id: 'phase', name: 'Phase', order: 0, type: config.type, config }],
    })
    expect(id(complex(base))).not.toBe(id(complex(named)))
  })
  it('validates stored names including unnamed interior rounds', () => {
    expect(validateTimerConfig({ ...base, roundNames: ['', 'Bike'] })).toEqual([])
    expect(
      validateTimerConfig({ ...base, roundNames: [null] } as unknown as IntervalConfig)
    ).not.toEqual([])
  })
})
