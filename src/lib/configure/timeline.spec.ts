import { describe, expect, it } from 'vitest'

import type { PhaseConfig } from '@/types/configure'

import { TimerType, WorkRestMode } from '@/types/configure'

import { buildTimeline } from './timeline'

const base = { id: 'timer', name: 'Timer' }
const countdown = { ...base, type: TimerType.COUNTDOWN, duration: 3605 } as const
const interval = {
  ...base,
  type: TimerType.INTERVAL,
  intervals: 3,
  workDuration: 30,
  restDuration: 10,
} as const
const phases = (...configs: PhaseConfig[]) =>
  configs.map((config, order) => ({
    config,
    order,
    name: config.name,
    type: config.type,
    id: String(order),
  }))

describe('Complex timeline', () => {
  it.each([
    [true, 110],
    [false, 120],
  ] as const)('respects skipLastRest=%s', (skipLastRest, total) => {
    expect(buildTimeline({ phases: phases({ ...interval, skipLastRest }) }).finish).toBe(total)
  })
  it('uses playback order and counts each pre-start once, including zero-rest intervals', () => {
    const draft = phases(
      { ...countdown, countdownBeforeStart: 3 },
      { ...interval, restDuration: 0, countdownBeforeStart: 5 }
    )
    const timeline = buildTimeline({ phases: draft.reverse(), countdownBeforeStart: 10 })
    expect(timeline.entries.map((entry) => [entry.readyAt, entry.start])).toEqual([
      [0, 10],
      [3615, 3620],
    ])
    expect(timeline.finish).toBe(3710)
  })
  it('starts each pass at its own time and continues after the final pass', () => {
    const draft = phases(...Array.from({ length: 3 }, () => ({ ...countdown, duration: 60 })))
    const repeat = { id: 'repeat', phaseIds: ['0', '1'], count: 4 }
    const timeline = buildTimeline({ phases: draft, repeatGroups: [repeat] })
    expect(
      timeline.entries.filter(({ phase }) => phase.id === '0').map(({ start }) => start)
    ).toEqual([0, 120, 240, 360])
    expect(timeline.entries.at(-1)?.start).toBe(480)
    expect(timeline.finish).toBe(540)
    expect(buildTimeline({ phases: draft, repeatGroups: [{ ...repeat, count: 3 }] }).finish).toBe(
      420
    )
  })
  it('keeps later durations when a transition is manual', () => {
    const timeline = buildTimeline({ phases: phases(countdown, interval), autoAdvance: false })
    expect(timeline.entries[1]).toMatchObject({ start: undefined, duration: 110 })
    expect(timeline.finish).toBeUndefined()
  })
  it.each([
    { ...base, type: TimerType.STOPWATCH } as const,
    {
      ...base,
      type: TimerType.WORKREST,
      restMode: WorkRestMode.RATIO,
      ratio: 2,
      maxWorkTime: 30,
      maxRounds: 2,
    } as const,
  ])('leaves time after a self-paced phase unknown', (config) => {
    const timeline = buildTimeline({ phases: phases(config, countdown) })
    expect(timeline.entries[1].start).toBeUndefined()
    expect(timeline.finish).toBeUndefined()
  })
  it('uses the automatic stop of a capped Stopwatch', () => {
    expect(
      buildTimeline({
        phases: phases({ ...base, type: TimerType.STOPWATCH, timeLimit: 60 }, countdown),
      }).finish
    ).toBe(3665)
  })
})
