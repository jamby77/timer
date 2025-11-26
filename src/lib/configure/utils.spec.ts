import { describe, expect, it } from 'vitest'
import type {
  ComplexConfig,
  CountdownConfig,
  IntervalConfig,
  StopwatchConfig,
  WorkRestConfig,
} from '@/types/configure'

import { TimerType } from '@/types/configure'
import { TimerConfigHash } from '@/lib/timer/TimerConfigHash'

import {
  cloneTimerConfig,
  configToUrlParams,
  formatDuration,
  formatRelativeTime,
  getConfigSummary,
  getTimerTypeDisplayName,
  validateTimerConfig,
} from './utils'

describe('utils', () => {
  describe('formatDuration', () => {
    it('formats seconds correctly', () => {
      expect(formatDuration(30)).toBe('30s')
      expect(formatDuration(59)).toBe('59s')
    })

    it('formats minutes and seconds correctly', () => {
      expect(formatDuration(60)).toBe('1m')
      expect(formatDuration(90)).toBe('1m 30s')
      expect(formatDuration(125)).toBe('2m 5s')
    })

    it('formats hours and minutes correctly', () => {
      expect(formatDuration(3600)).toBe('1h')
      expect(formatDuration(3900)).toBe('1h 5m')
      expect(formatDuration(7200)).toBe('2h')
    })

    it('handles zero duration', () => {
      expect(formatDuration(0)).toBe('0s')
    })
  })

  describe('formatRelativeTime', () => {
    it('formats recent times correctly', () => {
      const now = new Date()
      const oneMinuteAgo = new Date(now.getTime() - 60000)
      const fiveMinutesAgo = new Date(now.getTime() - 300000)
      const twoHoursAgo = new Date(now.getTime() - 7200000)
      const twoDaysAgo = new Date(now.getTime() - 172800000)

      expect(formatRelativeTime(oneMinuteAgo)).toBe('1 minute ago')
      expect(formatRelativeTime(fiveMinutesAgo)).toBe('5 minutes ago')
      expect(formatRelativeTime(twoHoursAgo)).toBe('2 hours ago')
      expect(formatRelativeTime(twoDaysAgo)).toBe('2 days ago')
    })

    it('formats very recent times as "just now"', () => {
      const now = new Date()
      const thirtySecondsAgo = new Date(now.getTime() - 30000)

      expect(formatRelativeTime(thirtySecondsAgo)).toBe('just now')
    })

    it('formats old times as date', () => {
      const oldDate = new Date('2023-01-01')
      const result = formatRelativeTime(oldDate)

      expect(result).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/)
    })
  })

  describe('getConfigSummary', () => {
    it('summarizes countdown timers', () => {
      const config = {
        id: 'test',
        name: 'Test Timer',
        type: TimerType.COUNTDOWN,
        duration: 300,
        completionMessage: 'Done!',
        createdAt: new Date(),
        lastUsed: new Date(),
      } as CountdownConfig

      expect(getConfigSummary(config)).toBe('5m countdown')
    })

    it('summarizes stopwatch timers', () => {
      const configWithLimit = {
        id: 'test',
        name: 'Test Timer',
        type: TimerType.STOPWATCH,
        timeLimit: 600,
        createdAt: new Date(),
        lastUsed: new Date(),
      } as StopwatchConfig

      const configWithoutLimit = {
        id: 'test',
        name: 'Test Timer',
        type: TimerType.STOPWATCH,
        createdAt: new Date(),
        lastUsed: new Date(),
      } as StopwatchConfig

      expect(getConfigSummary(configWithLimit)).toBe('Stopwatch with 10m limit')
      expect(getConfigSummary(configWithoutLimit)).toBe('Open-ended stopwatch')
    })

    it('summarizes interval timers', () => {
      const config = {
        id: 'test',
        name: 'Test Timer',
        type: TimerType.INTERVAL,
        workDuration: 20,
        restDuration: 10,
        intervals: 8,
        createdAt: new Date(),
        lastUsed: new Date(),
      } as IntervalConfig

      expect(getConfigSummary(config)).toBe('8 rounds: 20s work / 10s rest')
    })

    it('summarizes work/rest timers', () => {
      const ratioConfig = {
        id: 'test',
        name: 'Test Timer',
        type: TimerType.WORKREST,
        ratio: 2.0,
        maxWorkTime: 300,
        maxRounds: 10,
        restMode: 'ratio',
        createdAt: new Date(),
        lastUsed: new Date(),
      } as WorkRestConfig

      const fixedConfig = {
        id: 'test',
        name: 'Test Timer',
        type: TimerType.WORKREST,
        maxWorkTime: 300,
        maxRounds: 10,
        restMode: 'fixed',
        fixedRestDuration: 30,
        createdAt: new Date(),
        lastUsed: new Date(),
      } as WorkRestConfig

      expect(getConfigSummary(ratioConfig)).toBe('Work/rest with 2:1 ratio')
      expect(getConfigSummary(fixedConfig)).toBe('Work/rest with 30s fixed rest')
    })

    it('summarizes complex timers', () => {
      const config = {
        id: 'test',
        name: 'Test Timer',
        type: TimerType.COMPLEX,
        phases: [
          { id: '1', name: 'Phase 1', type: TimerType.COUNTDOWN, config: {}, order: 1 },
          { id: '2', name: 'Phase 2', type: TimerType.INTERVAL, config: {}, order: 2 },
        ],
        createdAt: new Date(),
        lastUsed: new Date(),
      } as ComplexConfig

      expect(getConfigSummary(config)).toBe('2 phase complex timer')
    })
  })

  describe('validateTimerConfig', () => {
    it('validates countdown timers', () => {
      const validConfig = {
        id: 'test',
        name: 'Test Timer',
        type: TimerType.COUNTDOWN,
        duration: 300,
        createdAt: new Date(),
        lastUsed: new Date(),
      } as CountdownConfig

      const invalidConfig = {
        id: '',
        name: '',
        type: TimerType.COUNTDOWN,
        duration: -1,
        createdAt: new Date(),
        lastUsed: new Date(),
      } as CountdownConfig

      expect(validateTimerConfig(validConfig)).toHaveLength(0)
      expect(validateTimerConfig(invalidConfig)).toContain('Timer name is required')
      expect(validateTimerConfig(invalidConfig)).toContain('Timer ID is required')
      expect(validateTimerConfig(invalidConfig)).toContain('Duration must be greater than 0')
    })

    it('validates interval timers', () => {
      const validConfig = {
        id: 'test',
        name: 'Test Timer',
        type: TimerType.INTERVAL,
        workDuration: 20,
        restDuration: 10,
        intervals: 8,
        createdAt: new Date(),
        lastUsed: new Date(),
      } as IntervalConfig

      const invalidConfig = {
        id: 'test',
        name: 'Test Timer',
        type: TimerType.INTERVAL,
        workDuration: -1,
        restDuration: -1,
        intervals: 0,
        createdAt: new Date(),
        lastUsed: new Date(),
      } as IntervalConfig

      expect(validateTimerConfig(validConfig)).toHaveLength(0)
      expect(validateTimerConfig(invalidConfig)).toContain('Work duration must be greater than 0')
      expect(validateTimerConfig(invalidConfig)).toContain('Rest duration must be 0 or greater')
      expect(validateTimerConfig(invalidConfig)).toContain(
        'Number of intervals must be greater than 0'
      )
    })

    it('validates work/rest timers', () => {
      const validConfig = {
        id: 'test',
        name: 'Test Timer',
        type: TimerType.WORKREST,
        ratio: 2.0,
        maxWorkTime: 300,
        maxRounds: 10,
        restMode: 'ratio',
        createdAt: new Date(),
        lastUsed: new Date(),
      } as WorkRestConfig

      const invalidFixedConfig = {
        id: 'test',
        name: 'Test Timer',
        type: TimerType.WORKREST,
        maxWorkTime: 300,
        maxRounds: 10,
        restMode: 'fixed',
        fixedRestDuration: -1,
        createdAt: new Date(),
        lastUsed: new Date(),
      } as WorkRestConfig

      expect(validateTimerConfig(validConfig)).toHaveLength(0)
      expect(validateTimerConfig(invalidFixedConfig)).toContain(
        'Fixed rest duration must be greater than 0'
      )
    })
  })

  describe('getTimerTypeDisplayName', () => {
    it('returns correct display names', () => {
      expect(getTimerTypeDisplayName(TimerType.COUNTDOWN)).toBe('Countdown')
      expect(getTimerTypeDisplayName(TimerType.STOPWATCH)).toBe('Stopwatch')
      expect(getTimerTypeDisplayName(TimerType.INTERVAL)).toBe('Interval')
      expect(getTimerTypeDisplayName(TimerType.WORKREST)).toBe('Work/Rest')
      expect(getTimerTypeDisplayName(TimerType.COMPLEX)).toBe('Complex')
    })
  })

  describe('TimerConfigHash.generateTimerId', () => {
    it('generates consistent IDs for same config', () => {
      const config = {
        id: 'test',
        name: 'Test Timer',
        type: TimerType.COUNTDOWN,
        duration: 300,
        createdAt: new Date(),
        lastUsed: new Date(),
      } as CountdownConfig

      const id1 = TimerConfigHash.generateTimerId(config)
      const id2 = TimerConfigHash.generateTimerId(config)

      expect(id1).toBe(id2)
      expect(id1).toMatch(/^timer_[a-f0-9]+$/)
    })

    it('generates different IDs for different configs', () => {
      const config1 = {
        id: 'test',
        name: 'Test Timer 1',
        type: TimerType.COUNTDOWN,
        duration: 300,
        createdAt: new Date('2023-01-01T00:00:00Z'),
        lastUsed: new Date('2023-01-01T00:00:00Z'),
      } as CountdownConfig

      const config2 = {
        id: 'test',
        name: 'Test Timer 2',
        type: TimerType.COUNTDOWN,
        duration: 300,
        createdAt: new Date('2023-01-01T00:00:00Z'),
        lastUsed: new Date('2023-01-01T00:00:00Z'),
      } as CountdownConfig

      const id1 = TimerConfigHash.generateTimerId(config1)
      const id2 = TimerConfigHash.generateTimerId(config2)

      expect(id1).not.toBe(id2)
    })
  })

  describe('configToUrlParams', () => {
    it('converts countdown config to URL params', () => {
      const config = {
        id: 'test',
        name: 'Test Timer',
        type: TimerType.COUNTDOWN,
        duration: 300,
        completionMessage: 'Done!',
        createdAt: new Date(),
        lastUsed: new Date(),
      } as CountdownConfig

      const params = configToUrlParams(config)
      expect(params).toContain('id=test')
      expect(params).toContain('name=Test+Timer')
      expect(params).toContain('type=COUNTDOWN')
      expect(params).toContain('duration=300')
      expect(params).toContain('completionMessage=Done%21')
    })

    it('converts interval config to URL params', () => {
      const config = {
        id: 'test',
        name: 'Test Timer',
        type: TimerType.INTERVAL,
        workDuration: 20,
        restDuration: 10,
        intervals: 8,
        workLabel: 'Work',
        restLabel: 'Rest',
        skipLastRest: true,
        createdAt: new Date(),
        lastUsed: new Date(),
      } as IntervalConfig

      const params = configToUrlParams(config)
      expect(params).toContain('workDuration=20')
      expect(params).toContain('restDuration=10')
      expect(params).toContain('intervals=8')
      expect(params).toContain('workLabel=Work')
      expect(params).toContain('restLabel=Rest')
      expect(params).toContain('skipLastRest=true')
    })
  })

  describe('cloneTimerConfig', () => {
    it('creates deep copy of timer config', () => {
      const originalConfig = {
        id: 'test',
        name: 'Test Timer',
        type: TimerType.INTERVAL,
        workDuration: 20,
        restDuration: 10,
        intervals: 8,
        createdAt: new Date(),
        lastUsed: new Date(),
      } as IntervalConfig

      const clonedConfig = cloneTimerConfig(originalConfig)

      expect(clonedConfig).toEqual(originalConfig)
      expect(clonedConfig).not.toBe(originalConfig)

      // Modify original and ensure clone is unaffected
      ;(originalConfig as IntervalConfig).workDuration = 30
      expect((clonedConfig as IntervalConfig).workDuration).toBe(20)
    })
  })
})
