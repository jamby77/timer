import { expect, it } from 'vitest'

import type { ComplexConfig } from '@/types/configure'

import { TimerType } from '@/types/configure'
import { TimerConfigHash } from '@/lib/timer/TimerConfigHash'

import { phaseSequence, repeatGroupError } from './phase-sequence'
import { estimateComplexDuration, validateTimerConfig } from './utils'

const phases = ['Row', 'Rest', 'Bike', 'Rest', 'Cooldown'].map((name, i) => ({
  id: String(i),
  name,
  order: i,
  type: TimerType.COUNTDOWN,
  config: {
    name,
    id: String(i),
    type: TimerType.COUNTDOWN as const,
    duration: [45, 15, 45, 15, 60][i],
  },
}))
const group = { id: 'group', phaseIds: ['0', '1', '2', '3'], count: 4 }
const circuit: ComplexConfig = {
  id: 'circuit',
  name: 'Circuit',
  type: TimerType.COMPLEX,
  phases,
  repeatGroups: [group],
}

it('uses saved order, repeats members as a block, and reaches cooldown once', () => {
  const sequence = phaseSequence({ ...circuit, phases: [...phases].reverse() })
  expect(sequence.map((p) => p.id).join('')).toBe('01230123012301234')
  expect(sequence.map((p) => p.pass)).toEqual([
    1,
    1,
    1,
    1,
    2,
    2,
    2,
    2,
    3,
    3,
    3,
    3,
    4,
    4,
    4,
    4,
    undefined,
  ])
  expect(estimateComplexDuration(circuit)).toBe(540)
  expect(validateTimerConfig(circuit)).toEqual([])
})

it('hashes repeat structure independently of generated IDs and group list order', () => {
  const flat = { ...circuit, repeatGroups: undefined }
  expect(TimerConfigHash.configsEqual(flat, { ...flat, repeatGroups: [] })).toBe(true)
  expect(TimerConfigHash.configsEqual(flat, circuit)).toBe(false)
  expect(
    TimerConfigHash.configsEqual(circuit, { ...circuit, repeatGroups: [{ ...group, id: 'new' }] })
  ).toBe(true)
  const groups = [
    { ...group, phaseIds: ['1'], count: 3 },
    { id: 'other', phaseIds: ['3'], count: 2 },
  ]
  expect(
    TimerConfigHash.configsEqual(
      { ...circuit, repeatGroups: groups },
      { ...circuit, repeatGroups: [...groups].reverse() }
    )
  ).toBe(true)
})

it.each([
  [{ ...group, count: 101 }],
  [{ ...group, count: 1 }],
  [{ ...group, phaseIds: [] }],
  [{ ...group, phaseIds: ['0', '2'] }],
  [{ ...group, phaseIds: ['5'] }],
  [{ ...group, phaseIds: ['1', '0'] }],
  [group, { id: 'second', phaseIds: ['1'], count: 2 }],
])('rejects invalid groups at the storage boundary', (...groups) => {
  expect(validateTimerConfig({ ...circuit, repeatGroups: groups })).not.toEqual([])
})

it('bounds the execution count before expansion', () => {
  const many = Array.from({ length: 11 }, (_, i) => ({ ...phases[0], order: i, id: String(i) }))
  expect(
    repeatGroupError(many, [{ ...group, phaseIds: many.map((p) => p.id), count: 100 }])
  ).toBeTruthy()
})
