import { AnyTimerConfig, PredefinedStyle, RecentTimer, StorageManager } from '@/types/configure';





class LocalTimerStorage implements StorageManager {
  private readonly RECENT_TIMERS_KEY = 'recent_timers'
  private readonly TIMER_PREFIX = 'timer_'
  private readonly PRESET_PREFIX = 'preset_'
  private readonly MAX_RECENT_TIMERS = 10

  /**
   * Get all recent timers from localStorage
   */
  getRecentTimers(): RecentTimer[] {
    try {
      const stored = localStorage.getItem(this.RECENT_TIMERS_KEY)
      if (!stored) return []

      const timers = JSON.parse(stored)
      return timers.map((timer: any) => ({
        ...timer,
        startedAt: new Date(timer.startedAt),
        config: {
          ...timer.config,
          createdAt: new Date(timer.config.createdAt),
          lastUsed: new Date(timer.config.lastUsed),
        },
      }))
    } catch (error) {
      console.error('Failed to load recent timers:', error)
      return []
    }
  }

  /**
   * Add a timer to recent timers list
   */
  addRecentTimer(config: AnyTimerConfig): void {
    try {
      const timers = this.getRecentTimers()

      // Remove existing timer with same ID if it exists
      const filteredTimers = timers.filter((timer) => timer.config.id !== config.id)

      // Add new timer at the beginning
      const newTimer: RecentTimer = {
        id: config.id,
        config,
        startedAt: new Date(),
      }

      const updatedTimers = [newTimer, ...filteredTimers].slice(0, this.MAX_RECENT_TIMERS)

      localStorage.setItem(this.RECENT_TIMERS_KEY, JSON.stringify(updatedTimers))
    } catch (error) {
      console.error('Failed to add recent timer:', error)
    }
  }

  /**
   * Remove a specific timer from recent timers
   */
  removeTimer(timerId: string): void {
    try {
      const timers = this.getRecentTimers()
      const filteredTimers = timers.filter((timer) => timer.id !== timerId)
      localStorage.setItem(this.RECENT_TIMERS_KEY, JSON.stringify(filteredTimers))

      // Also remove from individual storage
      localStorage.removeItem(this.TIMER_PREFIX + timerId)
    } catch (error) {
      console.error('Failed to remove timer:', error)
    }
  }

  /**
   * Clear all recent timers
   */
  clearRecentTimers(): void {
    try {
      localStorage.removeItem(this.RECENT_TIMERS_KEY)
    } catch (error) {
      console.error('Failed to clear recent timers:', error)
    }
  }

  /**
   * Get a specific timer configuration by ID
   */
  getTimerConfig(timerId: string): AnyTimerConfig | null {
    try {
      const stored = localStorage.getItem(this.TIMER_PREFIX + timerId)
      if (!stored) return null

      const config = JSON.parse(stored)
      return {
        ...config,
        createdAt: new Date(config.createdAt),
        lastUsed: new Date(config.lastUsed),
      }
    } catch (error) {
      console.error('Failed to load timer config:', error)
      return null
    }
  }

  /**
   * Store a timer configuration with its ID
   */
  storeTimerConfig(config: AnyTimerConfig): string {
    try {
      localStorage.setItem(this.TIMER_PREFIX + config.id, JSON.stringify(config))
      return config.id
    } catch (error) {
      console.error('Failed to store timer config:', error)
      throw error
    }
  }

  /**
   * Store a timer preset configuration
   */
  storePreset<T extends AnyTimerConfig>(config: PredefinedStyle<T>): string {
    try {
      const preset = {
        ...config,
        isPreset: true,
        createdAt: new Date(),
      }
      localStorage.setItem(this.PRESET_PREFIX + config.id, JSON.stringify(preset))
      return config.id
    } catch (error) {
      console.error('Failed to store preset:', error)
      throw error
    }
  }

  /**
   * Get all stored preset configurations
   */
  getAllPresets<T extends AnyTimerConfig>(): Array<{ id: string; config: PredefinedStyle<T> }> {
    try {
      const presets: Array<{ id: string; config: PredefinedStyle<T> }> = []

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key?.startsWith(this.PRESET_PREFIX)) {
          const presetId = key.replace(this.PRESET_PREFIX, '')
          const stored = localStorage.getItem(key)
          if (stored) {
            const config = JSON.parse(stored)
            presets.push({
              id: presetId,
              config: {
                ...config,
                createdAt: new Date(config.createdAt),
                lastUsed: config.lastUsed ? new Date(config.lastUsed) : undefined,
              },
            })
          }
        }
      }

      return presets
    } catch (error) {
      console.error('Failed to load presets:', error)
      return []
    }
  }

  /**
   * Get a specific preset by ID
   */
  getPreset<T extends AnyTimerConfig>(presetId: string): PredefinedStyle<T> | null {
    try {
      const stored = localStorage.getItem(this.PRESET_PREFIX + presetId)
      if (!stored) return null

      const config = JSON.parse(stored)
      return {
        ...config,
        createdAt: new Date(config.createdAt),
        lastUsed: config.lastUsed ? new Date(config.lastUsed) : undefined,
      }
    } catch (error) {
      console.error('Failed to load preset:', error)
      return null
    }
  }

  /**
   * Remove a preset by ID
   */
  removePreset(presetId: string): void {
    try {
      localStorage.removeItem(this.PRESET_PREFIX + presetId)
    } catch (error) {
      console.error('Failed to remove preset:', error)
      throw error
    }
  }

  /**
   * Get all stored timer configurations
   */
  getAllStoredTimers(): Array<{ id: string; config: AnyTimerConfig }> {
    try {
      const timers: Array<{ id: string; config: AnyTimerConfig }> = []

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key?.startsWith(this.TIMER_PREFIX)) {
          const timerId = key.replace(this.TIMER_PREFIX, '')
          const config = this.getTimerConfig(timerId)
          if (config) {
            timers.push({ id: timerId, config })
          }
        }
      }

      return timers
    } catch (error) {
      console.error('Failed to get all stored timers:', error)
      return []
    }
  }

  /**
   * Clean up old stored timers (older than 24 hours), but preserve recent timers
   */
  cleanupOldTimers(): void {
    try {
      const now = new Date()
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

      // Get all stored timer configs
      const allStoredTimers = this.getAllStoredTimers()

      // Clean up old timers
      allStoredTimers.forEach(({ id, config }) => {
        if (config.createdAt ? config.createdAt < oneDayAgo : false) {
          localStorage.removeItem(this.TIMER_PREFIX + id)
        }
      })
    } catch (error) {
      console.error('Failed to cleanup old timers:', error)
    }
  }
}

// Export singleton instance
export const storage = new LocalTimerStorage()
