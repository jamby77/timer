import type { AnyTimerConfig } from '@/types/configure'

import { WorkRestMode } from '@/types/configure'

export class TimerConfigHash {
  /**
   * Generate a consistent hash from timer configuration
   */
  static generateTimerId(config: AnyTimerConfig): string {
    // Create a normalized string representation of the config
    const normalizedConfig = this.normalizeConfig(config)
    const configString = JSON.stringify(normalizedConfig)

    // Simple hash function (can be replaced with a more robust one if needed)
    let hash = 0
    for (let i = 0; i < configString.length; i++) {
      const char = configString.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // Convert to 32-bit integer
    }

    // Convert to positive hex string and add prefix
    return `timer_${Math.abs(hash).toString(16)}`
  }

  /**
   * Normalize config for consistent hashing
   */
  private static normalizeConfig(config: AnyTimerConfig): any {
    const normalized: any = {
      type: config.type,
      name: config.name.trim().toLowerCase(),
    }

    switch (config.type) {
      case 'COUNTDOWN':
        normalized.duration = config.duration
        if (config.completionMessage) {
          normalized.completionMessage = config.completionMessage.trim()
        }
        break

      case 'STOPWATCH':
        if (config.timeLimit) {
          normalized.timeLimit = config.timeLimit
        }
        if (config.completionMessage) {
          normalized.completionMessage = config.completionMessage.trim()
        }
        break

      case 'INTERVAL':
        normalized.workDuration = config.workDuration
        normalized.restDuration = config.restDuration
        normalized.intervals = config.intervals
        normalized.skipLastRest = config.skipLastRest || false
        if (config.workLabel) {
          normalized.workLabel = config.workLabel.trim()
        }
        if (config.restLabel) {
          normalized.restLabel = config.restLabel.trim()
        }
        if (config.countdownBeforeStart) {
          normalized.countdownBeforeStart = config.countdownBeforeStart
        }
        break

      case 'WORKREST':
        normalized.ratio = config.ratio
        normalized.maxWorkTime = config.maxWorkTime
        normalized.maxRounds = config.maxRounds
        normalized.restMode = config.restMode
        if (config.restMode === WorkRestMode.FIXED && config.fixedRestDuration) {
          normalized.fixedRestDuration = config.fixedRestDuration
        }
        if (config.countdownBeforeStart) {
          normalized.countdownBeforeStart = config.countdownBeforeStart
        }
        break

      case 'COMPLEX':
        normalized.phases = config.phases.map((phase) => ({
          name: phase.name.trim(),
          type: phase.type,
          order: phase.order,
          config: this.normalizeConfig(phase.config),
        }))
        if (config.overallTimeLimit) {
          normalized.overallTimeLimit = config.overallTimeLimit
        }
        normalized.autoAdvance = config.autoAdvance || false
        break
    }

    return normalized
  }

  /**
   * Compare two configs for equality (ignoring timestamps and IDs)
   */
  static configsEqual(config1: AnyTimerConfig, config2: AnyTimerConfig): boolean {
    const hash1 = this.generateTimerId(config1)
    const hash2 = this.generateTimerId(config2)
    return hash1 === hash2
  }
}
