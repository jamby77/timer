import { beforeEach, expect, it } from 'vitest'

import { setupLocalStorageMock } from '@/testing/mocks'
import { TimerType, WorkRestMode } from '@/types/configure'
import { readDefaults, saveDefaults } from './defaults'
import { createPhaseDraft, createTimerDraft, getStarterPresets } from './new-timer'
import { PREDEFINED_STYLES } from './presets'
import { validateTimerConfig } from './utils'

setupLocalStorageMock()
beforeEach(() => localStorage.clear())

it('keeps untouched starters identical and separate from standalone settings', () => {
  saveDefaults('timer:INTERVAL', { workDuration: 45, restDuration: 15, intervals: 5 })
  expect(getStarterPresets()).toEqual(PREDEFINED_STYLES)
  expect(createTimerDraft(TimerType.INTERVAL).name).toBe('Interval (45s work / 15s rest × 5)')
})

it('applies shared sound and pre-start to the parent and keeps phase values independent', () => {
  saveDefaults('general', { countdownBeforeStart: 5, completionMessage: 'Done' })
  saveDefaults('sound', { sound: { enabled: true, volume: 0.4 } })
  saveDefaults('timer:COMPLEX', { name: 'Circuits', repeatCount: 4 })
  const complex = createTimerDraft(TimerType.COMPLEX)
  expect(complex).toMatchObject({
    name: 'Circuits', countdownBeforeStart: 5, sound: { enabled: true, volume: 0.4 }, phases: [],
  })
  expect(complex).not.toHaveProperty('repeatCount')
  const phase = createPhaseDraft('test', TimerType.COUNTDOWN)
  expect(phase).toMatchObject({ duration: 60, id: 'test' })
  expect(phase).not.toHaveProperty('sound')
  expect(phase).not.toHaveProperty('countdownBeforeStart')
  expect(getStarterPresets()[0].config.countdownBeforeStart).toBe(10)
})

it('applies fixed rest and clears a factory work limit when starting a built-in', () => {
  const key = 'preset:workrest-1to1-ratio'
  saveDefaults(key, {
    ...readDefaults(key), restMode: WorkRestMode.FIXED, ratio: undefined,
    fixedRestDuration: 25, maxWorkTime: undefined, countdownBeforeStart: 0,
  })
  const starter = getStarterPresets().find(({ config }) => config.type === TimerType.WORKREST)!
  expect(starter.config).toMatchObject({ restMode: WorkRestMode.FIXED, fixedRestDuration: 25 })
  expect(starter.config).toHaveProperty('maxWorkTime', undefined)
  expect(starter.config.countdownBeforeStart).toBe(0)
  expect(validateTimerConfig(starter.config)).toEqual([])
})

it('generates a usable name for a starter set to Automatic', () => {
  saveDefaults('preset:tabata-standard', { name: '' })
  const { config } = getStarterPresets()[0]
  expect(config.name).toBe('Interval (20s work / 10s rest × 8)')
  expect(validateTimerConfig(config)).toEqual([])
})
