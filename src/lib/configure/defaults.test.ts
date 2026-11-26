import { beforeEach, describe, expect, it, vi } from 'vitest'

import { localStorageMock, setupLocalStorageMock } from '@/testing/mocks'
import { TimerType, WorkRestMode } from '@/types/configure'
import { readDefaults, readOverrides, saveDefaults } from './defaults'

setupLocalStorageMock()

beforeEach(() => {
  localStorage.clear()
  vi.clearAllMocks()
})

describe('personal defaults', () => {
  it('keeps the factories for timers, phases and starters independent', () => {
    expect(readDefaults('general')).toEqual({ countdownBeforeStart: 0, completionMessage: 'Time is up!' })
    expect(readDefaults('sound').sound).toMatchObject({ enabled: false, volume: 0.7, countdownBeeps: 3 })
    expect(readDefaults('timer:COMPLEX')).toMatchObject({ autoAdvance: true, repeatCount: 2 })
    expect(readDefaults('new-phase')).toEqual({ phaseType: TimerType.COUNTDOWN })
    expect(readDefaults('timer:INTERVAL').workDuration).toBeUndefined()
    expect(readDefaults('phase:INTERVAL')).toMatchObject({ intervals: 3, workDuration: 30, restDuration: 10 })
    expect(readDefaults('preset:emom-10min')).toMatchObject({ intervals: 10, restDuration: 0, skipLastRest: false, countdownBeforeStart: 10 })
    expect(readDefaults('phase:WORKREST')).toMatchObject({ maxRounds: 5, ratio: 2, restMode: WorkRestMode.RATIO })
    expect(readDefaults('phase:COUNTDOWN')).toEqual({ duration: 60, name: '' })
    expect(readDefaults('timer:COUNTDOWN')).toEqual({ name: '' })
  })

  it('round trips every untouched section without changing runtime configuration', () => {
    const sections = [
      'general', 'sound', 'new-phase',
      ...Object.values(TimerType).map(type => `timer:${type}`),
      ...Object.values(TimerType).filter(type => type !== TimerType.COMPLEX).map(type => `phase:${type}`),
      'preset:tabata-standard', 'preset:emom-10min', 'preset:workrest-1to1-ratio',
    ]
    for (const section of sections) {
      const initial = readDefaults(section)
      saveDefaults(section, initial)
      expect(readOverrides(section), section).toEqual({})
      expect(readDefaults(section), section).toEqual(initial)
    }
  })

  it('stores only edits, including clearing an existing optional value', () => {
    const section = 'phase:WORKREST'
    saveDefaults(section, { ...readDefaults(section), maxWorkTime: undefined, maxRounds: 6 })
    expect(readOverrides(section)).toStrictEqual({ maxWorkTime: undefined, maxRounds: 6 })
    expect(readDefaults(section).maxWorkTime).toBeUndefined()
    expect(readDefaults('preset:workrest-1to1-ratio').maxWorkTime).toBe(1800)
    saveDefaults(section, { ...readDefaults(section), maxWorkTime: 300, maxRounds: 5 })
    expect(readOverrides(section)).toEqual({})
  })

  it('returns independent values for mutable settings', () => {
    const section = 'timer:INTERVAL'
    readDefaults(section).roundNames?.push('Modified')
    expect(readDefaults(section).roundNames).toEqual([])
    saveDefaults(section, { roundNames: ['Sprint'] })
    readDefaults(section).roundNames?.push('Modified')
    expect(readDefaults(section).roundNames).toEqual(['Sprint'])
  })

  it('isolates invalid data and ignores unowned fields', () => {
    const section = 'timer:INTERVAL'
    saveDefaults(section, { intervals: 5, countdownBeforeStart: 17 })
    expect(readOverrides(section)).toEqual({ intervals: 5 })
    const key = localStorage.key(0)!
    localStorage.setItem(key, JSON.stringify({ intervals: -4, id: 'bad', duration: 1 }))
    expect(readOverrides(section)).toEqual({})
    localStorage.setItem(key, 'invalid json')
    expect(readDefaults(section)).toMatchObject({ skipLastRest: true })
    expect(() => saveDefaults(section, { intervals: 1001 })).toThrow()
  })

  it('requires runnable phases and starter presets, while new timer forms can start blank', () => {
    expect(() => saveDefaults('phase:COUNTDOWN', { duration: undefined })).toThrow()
    expect(() => saveDefaults('preset:emom-10min', { intervals: undefined })).toThrow()
    expect(() => saveDefaults('phase:WORKREST', { restMode: WorkRestMode.FIXED })).toThrow()
    expect(() => saveDefaults('timer:WORKREST', { restMode: WorkRestMode.FIXED })).not.toThrow()
    const section = 'preset:workrest-1to1-ratio'
    saveDefaults(section, { restMode: WorkRestMode.FIXED, fixedRestDuration: 15, countdownBeforeStart: 0 })
    expect(readOverrides(section)).toStrictEqual({
      restMode: WorkRestMode.FIXED, fixedRestDuration: 15, ratio: undefined, countdownBeforeStart: 0,
    })
    const key = localStorageMock.setItem.mock.lastCall![0]
    localStorage.setItem(key, JSON.stringify({ maxRounds: null }))
    expect(readOverrides(section)).toEqual({})
  })

  it('retains the last saved edit when storage refuses a write', () => {
    saveDefaults('general', { countdownBeforeStart: 4 })
    localStorageMock.setItem.mockImplementationOnce(() => { throw new Error('Quota exceeded') })
    expect(() => saveDefaults('general', { countdownBeforeStart: 5 })).toThrow('Quota exceeded')
    expect(readOverrides('general')).toEqual({ countdownBeforeStart: 4 })
    localStorageMock.getItem.mockImplementationOnce(() => { throw new Error('Unavailable') })
    expect(readDefaults('general').countdownBeforeStart).toBe(0)
  })
})
