import { setupLocalStorageMock } from '@/testing/mocks'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { AnyTimerConfig, CountdownConfig, TimerType } from '@/types/configure'

import { storage } from './storage'

// Setup global mocks
setupLocalStorageMock()

describe('Storage Utilities', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
    vi.clearAllMocks()
  })

  describe('getRecentTimers', () => {
    it('returns empty array when no timers exist', () => {
      const timers = storage.getRecentTimers()
      expect(timers).toEqual([])
    })

    it('returns timers from localStorage', () => {
      const testTimer: AnyTimerConfig = {
        id: 'test-timer',
        name: 'Test Timer',
        type: TimerType.COUNTDOWN,
        duration: 300,
        createdAt: new Date('2023-01-01'),
        lastUsed: new Date('2023-01-01'),
      }

      // Manually add to localStorage
      const recentTimer = {
        id: 'test-timer',
        config: testTimer,
        startedAt: new Date('2023-01-01'),
      }

      localStorage.setItem('recent_timers', JSON.stringify([recentTimer]))

      const timers = storage.getRecentTimers()
      expect(timers).toHaveLength(1)
      expect(timers[0].config.name).toBe('Test Timer')
      expect(timers[0].config.type).toBe(TimerType.COUNTDOWN)
    })

    it('handles corrupted localStorage data', () => {
      localStorage.setItem('recent_timers', 'invalid json')

      const timers = storage.getRecentTimers()
      expect(timers).toEqual([])
    })
  })

  describe('addRecentTimer', () => {
    it('adds timer to recent timers', () => {
      const testTimer: AnyTimerConfig = {
        id: 'test-timer',
        name: 'Test Timer',
        type: TimerType.COUNTDOWN,
        duration: 300,
        createdAt: new Date(),
        lastUsed: new Date(),
      }

      storage.addRecentTimer(testTimer)

      const timers = storage.getRecentTimers()
      expect(timers).toHaveLength(1)
      expect(timers[0].config.name).toBe('Test Timer')
      expect(timers[0].startedAt).toBeInstanceOf(Date)
    })

    it('adds timer to beginning of list', () => {
      const timer1: AnyTimerConfig = {
        id: 'timer-1',
        name: 'Timer 1',
        type: TimerType.COUNTDOWN,
        duration: 300,
        createdAt: new Date(),
        lastUsed: new Date(),
      }

      const timer2: AnyTimerConfig = {
        id: 'timer-2',
        name: 'Timer 2',
        type: TimerType.INTERVAL,
        workDuration: 20,
        restDuration: 10,
        intervals: 8,
        createdAt: new Date(),
        lastUsed: new Date(),
      }

      storage.addRecentTimer(timer1)
      storage.addRecentTimer(timer2)

      const timers = storage.getRecentTimers()
      expect(timers).toHaveLength(2)
      expect(timers[0].config.name).toBe('Timer 2') // Most recent first
      expect(timers[1].config.name).toBe('Timer 1')
    })

    it('replaces existing timer with same ID', () => {
      const timer1: AnyTimerConfig = {
        id: 'same-id',
        name: 'Original Timer',
        type: TimerType.COUNTDOWN,
        duration: 300,
        createdAt: new Date(),
        lastUsed: new Date(),
      }

      const timer2: AnyTimerConfig = {
        id: 'same-id',
        name: 'Updated Timer',
        type: TimerType.COUNTDOWN,
        duration: 600,
        createdAt: new Date(),
        lastUsed: new Date(),
      }

      storage.addRecentTimer(timer1)
      storage.addRecentTimer(timer2)

      const timers = storage.getRecentTimers()
      expect(timers).toHaveLength(1)
      expect(timers[0].config.name).toBe('Updated Timer')
      expect((timers[0].config as CountdownConfig).duration).toBe(600)
    })

    it('limits number of recent timers', () => {
      // Add more than the maximum (20) timers
      for (let i = 0; i < 25; i++) {
        const timer: AnyTimerConfig = {
          id: `timer-${i}`,
          name: `Timer ${i}`,
          type: TimerType.COUNTDOWN,
          duration: 300,
          createdAt: new Date(),
          lastUsed: new Date(),
        }
        storage.addRecentTimer(timer)
      }

      const timers = storage.getRecentTimers()
      expect(timers).toHaveLength(20)
      expect(timers[0].config.name).toBe('Timer 24') // Most recent
      expect(timers[19].config.name).toBe('Timer 5') // Oldest kept
    })
  })

  describe('removeTimer', () => {
    it('removes timer by ID', () => {
      const timer1: AnyTimerConfig = {
        id: 'timer-1',
        name: 'Timer 1',
        type: TimerType.COUNTDOWN,
        duration: 300,
        createdAt: new Date(),
        lastUsed: new Date(),
      }

      const timer2: AnyTimerConfig = {
        id: 'timer-2',
        name: 'Timer 2',
        type: TimerType.INTERVAL,
        workDuration: 20,
        restDuration: 10,
        intervals: 8,
        createdAt: new Date(),
        lastUsed: new Date(),
      }

      storage.addRecentTimer(timer1)
      storage.addRecentTimer(timer2)

      storage.removeTimer('timer-1')

      const timers = storage.getRecentTimers()
      expect(timers).toHaveLength(1)
      expect(timers[0].config.name).toBe('Timer 2')
    })

    it('removes individual timer storage', () => {
      const timer: AnyTimerConfig = {
        id: 'test-timer',
        name: 'Test Timer',
        type: TimerType.COUNTDOWN,
        duration: 300,
        createdAt: new Date(),
        lastUsed: new Date(),
      }

      storage.addRecentTimer(timer)
      storage.removeTimer('test-timer')

      expect(localStorage.getItem('timer_test-timer')).toBeNull()
    })

    it('handles removing non-existent timer', () => {
      storage.removeTimer('non-existent')

      const timers = storage.getRecentTimers()
      expect(timers).toEqual([])
    })
  })

  describe('clearRecentTimers', () => {
    it('clears all recent timers', () => {
      const timer1: AnyTimerConfig = {
        id: 'timer-1',
        name: 'Timer 1',
        type: TimerType.COUNTDOWN,
        duration: 300,
        createdAt: new Date(),
        lastUsed: new Date(),
      }

      const timer2: AnyTimerConfig = {
        id: 'timer-2',
        name: 'Timer 2',
        type: TimerType.INTERVAL,
        workDuration: 20,
        restDuration: 10,
        intervals: 8,
        createdAt: new Date(),
        lastUsed: new Date(),
      }

      storage.addRecentTimer(timer1)
      storage.addRecentTimer(timer2)

      storage.clearRecentTimers()

      const timers = storage.getRecentTimers()
      expect(timers).toEqual([])
    })
  })

  describe('getTimerConfig', () => {
    it('retrieves stored timer config', () => {
      const timer: AnyTimerConfig = {
        id: 'test-timer',
        name: 'Test Timer',
        type: TimerType.COUNTDOWN,
        duration: 300,
        createdAt: new Date('2023-01-01'),
        lastUsed: new Date('2023-01-01'),
      }

      storage.storeTimerConfig(timer)

      const retrieved = storage.getTimerConfig('test-timer')
      expect(retrieved).toEqual(timer)
      expect(retrieved?.createdAt).toBeInstanceOf(Date)
      expect(retrieved?.lastUsed).toBeInstanceOf(Date)
    })

    it('returns null for non-existent timer', () => {
      const retrieved = storage.getTimerConfig('non-existent')
      expect(retrieved).toBeNull()
    })

    it('handles corrupted timer data', () => {
      localStorage.setItem('timer_corrupted', 'invalid json')

      const retrieved = storage.getTimerConfig('corrupted')
      expect(retrieved).toBeNull()
    })
  })

  describe('storeTimerConfig', () => {
    it('stores timer config and returns ID', () => {
      const timer: AnyTimerConfig = {
        id: 'test-timer',
        name: 'Test Timer',
        type: TimerType.COUNTDOWN,
        duration: 300,
        createdAt: new Date(),
        lastUsed: new Date(),
      }

      const id = storage.storeTimerConfig(timer)
      expect(id).toBe('test-timer')

      const stored = localStorage.getItem('timer_test-timer')
      expect(stored).toBeTruthy()

      const parsed = JSON.parse(stored!)
      expect(parsed.name).toBe('Test Timer')
    })
  })

  describe('getAllStoredTimers', () => {
    it('retrieves all stored timers', () => {
      const timer1: AnyTimerConfig = {
        id: 'timer-1',
        name: 'Timer 1',
        type: TimerType.COUNTDOWN,
        duration: 300,
        createdAt: new Date(),
        lastUsed: new Date(),
      }

      const timer2: AnyTimerConfig = {
        id: 'timer-2',
        name: 'Timer 2',
        type: TimerType.INTERVAL,
        workDuration: 20,
        restDuration: 10,
        intervals: 8,
        createdAt: new Date(),
        lastUsed: new Date(),
      }

      storage.storeTimerConfig(timer1)
      storage.storeTimerConfig(timer2)

      const allTimers = storage.getAllStoredTimers()
      expect(allTimers).toHaveLength(2)
      expect(allTimers[0].id).toBe('timer-1')
      expect(allTimers[1].id).toBe('timer-2')
    })

    it('ignores non-timer localStorage items', () => {
      localStorage.setItem('other-item', 'some data')
      localStorage.setItem(
        'timer_valid',
        JSON.stringify({
          id: 'valid',
          name: 'Valid Timer',
          type: TimerType.COUNTDOWN,
          duration: 300,
          createdAt: new Date(),
          lastUsed: new Date(),
        })
      )

      const allTimers = storage.getAllStoredTimers()
      expect(allTimers).toHaveLength(1)
      expect(allTimers[0].id).toBe('valid')
    })
  })

  describe('cleanupOldTimers', () => {
    it('keeps recent timers', () => {
      const recentTimer: AnyTimerConfig = {
        id: 'recent-timer',
        name: 'Recent Timer',
        type: TimerType.COUNTDOWN,
        duration: 300,
        createdAt: new Date(),
        lastUsed: new Date(),
      }

      storage.addRecentTimer(recentTimer)
      storage.cleanupOldTimers()

      const timers = storage.getRecentTimers()
      expect(timers).toHaveLength(1)
    })

    it('keeps built-in timers', () => {
      const builtInTimer: AnyTimerConfig = {
        id: 'tabata-standard',
        name: 'Tabata (built-in)',
        type: TimerType.INTERVAL,
        workDuration: 20,
        restDuration: 10,
        intervals: 8,
        createdAt: new Date(),
        lastUsed: new Date(),
      }

      storage.addRecentTimer(builtInTimer)
      storage.cleanupOldTimers()

      const timers = storage.getRecentTimers()
      expect(timers).toHaveLength(1)
    })
  })
})
