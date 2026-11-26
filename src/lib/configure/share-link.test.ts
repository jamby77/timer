import { describe, expect, it } from 'vitest'
import { gunzipSync, gzipSync } from 'node:zlib'

import type { AnyTimerConfig, ComplexConfig } from '@/types/configure'

import { TimerType, WorkRestMode } from '@/types/configure'

import { createShareUrl, readShareHash } from './share-link'

const origin = 'https://timer.example'
const base = { id: 'private-id', name: 'Élan 🏃', lastUsed: new Date(), createdAt: new Date() }
const sound = {
  enabled: true,
  volume: 0.3,
  tenSecondWarning: true,
  countdownBeeps: 3,
  startBeep: false,
  finishBeep: true,
  intervalStartBeep: true,
  intervalEndBeep: false,
  tick: true,
  tickEverySeconds: 2,
}
const interval = {
  ...base,
  type: TimerType.INTERVAL as const,
  workDuration: 20,
  restDuration: 0,
  intervals: 3,
  skipLastRest: false,
  workDirection: 'up' as const,
  restDirection: 'down' as const,
  workLabel: 'Lift',
  restLabel: 'Reset',
  roundNames: ['Left', '', 'Right'],
  countdownBeforeStart: 10,
  sound,
  completionMessage: 'Done!',
}
const phases = ['First', 'Second'].map((name, order) => ({
  id: 'private-phase-' + order,
  name,
  order,
  type: TimerType.INTERVAL,
  config: interval,
}))
const complex: ComplexConfig = {
  ...base,
  type: TimerType.COMPLEX,
  phases: [...phases].reverse(),
  autoAdvance: false,
  overallTimeLimit: 480,
  repeatGroups: [{ id: 'private-group', phaseIds: phases.map((p) => p.id), count: 3 }],
}
const examples: AnyTimerConfig[] = [
  { ...base, type: TimerType.COUNTDOWN, duration: 30 },
  { ...base, type: TimerType.STOPWATCH },
  { ...base, type: TimerType.STOPWATCH, timeLimit: 3600 },
  interval,
  { ...base, type: TimerType.WORKREST, restMode: WorkRestMode.RATIO, ratio: 1.5, maxRounds: 4 },
  {
    ...base,
    type: TimerType.WORKREST,
    restMode: WorkRestMode.FIXED,
    fixedRestDuration: 15,
    maxRounds: 3,
    maxWorkTime: 45,
    autoContinue: true,
  },
]
function hashOf(data: unknown) {
  return '#timer=' + gzipSync(JSON.stringify(data)).toString('base64url')
}
function payloadOf(url: string) {
  return gunzipSync(Buffer.from(new URL(url).hash.slice(7), 'base64url')).toString()
}
describe('shared timer links', () => {
  it.each(examples)('round trips $type with its runnable settings', async (config) => {
    const url = new URL(await createShareUrl(config, origin))
    expect(url.pathname).toBe('/share')
    expect(url.search).toBe('')
    const result = await readShareHash(url.hash)
    expect(result).toEqual({
      ...config,
      id: expect.stringMatching(/^timer_/),
      createdAt: undefined,
      lastUsed: undefined,
    })
    expect(payloadOf(url.href)).not.toMatch(/private-|lastUsed|createdAt/)
  })

  it('keeps phase order, repeats and nested settings without sharing local identifiers', async () => {
    const url = await createShareUrl(complex, origin)
    const result = await readShareHash(new URL(url).hash)
    expect(result.type).toBe(TimerType.COMPLEX)
    if (result.type !== TimerType.COMPLEX) throw Error()
    expect(result.phases.map((p) => p.name)).toEqual(['First', 'Second'])
    expect(result.repeatGroups?.[0]).toMatchObject({
      phaseIds: result.phases.map((p) => p.id),
      count: 3,
    })
    expect(result.phases[1].config).toMatchObject({
      sound,
      completionMessage: 'Done!',
      workDirection: 'up',
    })
    expect(result).toMatchObject({ autoAdvance: false, overallTimeLimit: 480 })
    expect(payloadOf(url)).not.toMatch(/private-|lastUsed|createdAt/)
  })

  it('rejects unsupported versions, corrupt links and non-runnable fields', async () => {
    for (const hash of [
      '',
      '#timer=!',
      '#timer=YWJj',
      hashOf({ v: 0, config: interval }),
      hashOf({ v: 2, config: interval }),
      hashOf({ v: 1, config: { ...interval, sound: { ...sound, enabled: 1 } } }),
      hashOf({ v: 1, config: { ...interval, intervals: 0 } }),
      hashOf({
        v: 1,
        config: { ...complex, phases: [{ ...phases[0], type: TimerType.COUNTDOWN }] },
      }),
    ])
      await expect(readShareHash(hash)).rejects.toThrow()
  })

  it('rejects repeat groups that expand past the execution limit', async () => {
    const many = Array.from({ length: 11 }, (_, i) => ({ ...phases[0], id: String(i), order: i }))
    const config = {
      ...complex,
      phases: many,
      repeatGroups: [{ id: 'g', phaseIds: many.map((p) => p.id), count: 100 }],
    }
    await expect(readShareHash(hashOf({ v: 1, config }))).rejects.toThrow()
  })

  it('bounds both the complete outgoing URL and decompressed input', async () => {
    const longOrigin = 'https://' + ('a'.repeat(50) + '.').repeat(37) + 'test'
    await expect(createShareUrl(interval, longOrigin)).rejects.toThrow(
      'Timer too large to share by link'
    )
    const config = { ...interval, completionMessage: 'x'.repeat(100_000) }
    await expect(createShareUrl(config, origin)).rejects.toThrow('Timer too large to share by link')
    await expect(readShareHash(hashOf({ v: 1, config }))).rejects.toThrow()
    await expect(readShareHash('#timer=' + 'A'.repeat(2000))).rejects.toThrow()
  })
})
