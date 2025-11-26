import { describe, expect, it } from 'vitest'

import {
  CountdownConfig,
  IntervalConfig,
  TimerType,
  WorkRestConfig,
  WorkRestMode,
} from '@/types/configure'

import { createPredefinedStyle, getPredefinedStyleById, PREDEFINED_STYLES } from './presets'

describe('presets', () => {
  it('returns array of predefined styles', () => {
    const styles = PREDEFINED_STYLES
    expect(Array.isArray(styles)).toBe(true)

    styles.forEach((style: any) => {
      expect(style).toHaveProperty('id')
      expect(style).toHaveProperty('name')
      expect(style).toHaveProperty('description')
      expect(style).toHaveProperty('isBuiltIn')
      expect(style).toHaveProperty('config')
    })
  })

  describe('getPredefinedStyleById', () => {
    it('returns style by ID', () => {
      const firstStyle = PREDEFINED_STYLES[0]

      const found = getPredefinedStyleById(firstStyle.id)
      expect(found).toEqual(firstStyle)
    })

    it('returns undefined for non-existent ID', () => {
      const found = getPredefinedStyleById('non-existent-id')
      expect(found).toBeUndefined()
    })
  })

  describe('getPredefinedStyles', () => {
    it('returns all predefined styles', () => {
      const styles = PREDEFINED_STYLES

      expect(styles).toHaveLength(3)
      expect(styles.every((style: any) => style.isBuiltIn)).toBe(true)
    })
  })

  describe('createPredefinedStyle', () => {
    it('creates predefined style from config', () => {
      const config = {
        name: 'Custom Timer',
        type: TimerType.COUNTDOWN,
        duration: 300,
        completionMessage: 'Done!',
      } as CountdownConfig

      const style = createPredefinedStyle<CountdownConfig>(
        'custom-timer',
        'Custom Timer',
        'A custom countdown timer',
        config
      )

      expect(style.id).toBeTruthy()
      expect(style.name).toBe('Custom Timer')
      expect(style.description).toBe('A custom countdown timer')
      expect(style.isBuiltIn).toBe(false)
      expect(style.config.name).toBe('Custom Timer')
      expect(style.config.type).toBe(TimerType.COUNTDOWN)
      expect(style.config.duration).toBe(300)
      expect(style.config.id).toBe('custom-timer')
      expect(style.config.createdAt).toBeInstanceOf(Date)
      expect(style.config.lastUsed).toBeInstanceOf(Date)
    })

    it('generates unique ID for style', () => {
      const config1 = {
        name: 'Custom Timer',
        type: TimerType.COUNTDOWN,
        duration: 300,
      } as Omit<CountdownConfig, 'id' | 'createdAt' | 'lastUsed'>

      const config2 = {
        name: 'Custom Timer 2',
        type: TimerType.COUNTDOWN,
        duration: 300,
      } as Omit<CountdownConfig, 'id' | 'createdAt' | 'lastUsed'>

      const style1 = createPredefinedStyle<CountdownConfig>(
        'timer-1',
        'Timer 1',
        'Description 1',
        config1
      )

      const style2 = createPredefinedStyle<CountdownConfig>(
        'timer-2',
        'Timer 2',
        'Description 2',
        config2
      )

      expect(style1.id).not.toBe(style2.id)
    })

    it('handles interval timer config', () => {
      const config = {
        name: 'Custom Interval',
        type: TimerType.INTERVAL,
        workDuration: 45,
        restDuration: 15,
        intervals: 6,
        workLabel: 'Work',
        restLabel: 'Rest',
        skipLastRest: false,
      } as Omit<IntervalConfig, 'id' | 'createdAt' | 'lastUsed'>

      const style = createPredefinedStyle<IntervalConfig>(
        'custom-interval',
        'Custom Interval',
        'A custom interval timer',
        config
      )

      expect(style.config.type).toBe(TimerType.INTERVAL)
      expect(style.config.workDuration).toBe(45)
      expect(style.config.restDuration).toBe(15)
      expect(style.config.intervals).toBe(6)
    })

    it('handles work/rest timer config', () => {
      const config = {
        name: 'Custom Work/Rest',
        type: TimerType.WORKREST,
        ratio: 3.0,
        maxWorkTime: 600,
        maxRounds: 12,
        restMode: WorkRestMode.RATIO,
      } as Omit<WorkRestConfig, 'id' | 'createdAt' | 'lastUsed'>

      const style = createPredefinedStyle<WorkRestConfig>(
        'custom-workrest',
        'Custom Work/Rest',
        'A custom work/rest timer',
        config
      )

      expect(style.config.type).toBe(TimerType.WORKREST)
      expect(style.config.ratio).toBe(3.0)
      expect(style.config.maxWorkTime).toBe(600)
      expect(style.config.maxRounds).toBe(12)
      expect(style.config.restMode).toBe('ratio')
    })
  })

  describe('PREDEFINED_STYLES', () => {
    it('contains all expected timer types', () => {
      const types = new Set(PREDEFINED_STYLES.map((style) => style.config.type))

      expect(types.has(TimerType.INTERVAL)).toBe(true)
      expect(types.has(TimerType.WORKREST)).toBe(true)
    })

    it('has correct number of predefined styles', () => {
      expect(PREDEFINED_STYLES).toHaveLength(3)
    })

    it('all built-in styles are marked as built-in', () => {
      PREDEFINED_STYLES.forEach((style) => {
        expect(style.isBuiltIn).toBe(true)
      })
    })

    it('Tabata config is correct', () => {
      const tabata = PREDEFINED_STYLES.find((style) => style.name === 'Tabata')
      expect(tabata).toBeTruthy()
      expect(tabata?.config.type).toBe(TimerType.INTERVAL)
      expect((tabata?.config as IntervalConfig).workDuration).toBe(20)
      expect((tabata?.config as IntervalConfig).restDuration).toBe(10)
      expect((tabata?.config as IntervalConfig).intervals).toBe(8)
      expect((tabata?.config as IntervalConfig).skipLastRest).toBe(true)
    })

    it('EMOM config is correct', () => {
      const emom = PREDEFINED_STYLES.find((style) => style.name === 'EMOM (10 min)')
      expect(emom).toBeTruthy()
      expect(emom?.config.type).toBe(TimerType.INTERVAL)
      expect((emom?.config as IntervalConfig).workDuration).toBe(60)
      expect((emom?.config as IntervalConfig).restDuration).toBe(0)
      expect((emom?.config as IntervalConfig).intervals).toBe(10)
    })

    it('Work/Rest Ratio config is correct', () => {
      const ratio = PREDEFINED_STYLES.find((style) => style.name === 'Work/Rest (1:1 ratio)')
      expect(ratio).toBeTruthy()
      expect(ratio?.config.type).toBe(TimerType.WORKREST)
      expect((ratio?.config as WorkRestConfig).ratio).toBe(1.0)
      expect((ratio?.config as WorkRestConfig).restMode).toBe('ratio')
    })
  })
})
