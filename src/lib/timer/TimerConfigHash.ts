import type { AnyTimerConfig } from '@/types/configure'

import { WorkRestMode } from '@/types/configure'
import { normalizeRoundNames } from '@/lib/configure/round-names'

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
  private static normalizeConfig(config: AnyTimerConfig): Record<string, unknown> {
    const normalized: Record<string, unknown> = {
      type: config.type,
      name: config.name.trim().toLowerCase(),
    }

    if (config.countdownBeforeStart) {
      normalized.countdownBeforeStart = config.countdownBeforeStart
    }
    if (config.completionMessage) {
      normalized.completionMessage = config.completionMessage.trim()
    }
    if (config.sound) {
      normalized.sound = {
        enabled: config.sound.enabled,
        volume: config.sound.volume,
        countdownBeeps: config.sound.countdownBeeps,
        startBeep: config.sound.startBeep,
        finishBeep: config.sound.finishBeep,
        intervalStartBeep: config.sound.intervalStartBeep,
        intervalEndBeep: config.sound.intervalEndBeep,
        tick: config.sound.tick,
        tickEverySeconds: config.sound.tickEverySeconds,
      }
    }

    switch (config.type) {
      case 'COUNTDOWN':
        normalized.duration = config.duration
        break

      case 'STOPWATCH':
        if (config.timeLimit) {
          normalized.timeLimit = config.timeLimit
        }
        break

      case 'INTERVAL': {
        const names = normalizeRoundNames(config.roundNames, config.intervals)
        if (names) normalized.roundNames = names
        if (config.workDirection === 'up') normalized.workDirection = 'up'
        if (config.restDirection === 'up') normalized.restDirection = 'up'
        normalized.workDuration = config.workDuration
        normalized.restDuration = config.restDuration
        normalized.intervals = config.intervals
        normalized.skipLastRest = config.skipLastRest ?? true
        if (config.workLabel) {
          normalized.workLabel = config.workLabel.trim()
        }
        if (config.restLabel) {
          normalized.restLabel = config.restLabel.trim()
        }
        break
      }

      case 'WORKREST':
        if (config.autoContinue) normalized.autoContinue = true
        normalized.ratio = config.ratio
        normalized.maxWorkTime = config.maxWorkTime
        normalized.maxRounds = config.maxRounds
        normalized.restMode = config.restMode
        if (config.restMode === WorkRestMode.FIXED && config.fixedRestDuration) {
          normalized.fixedRestDuration = config.fixedRestDuration
        }
        break

      case 'COMPLEX':
        normalized.phases = config.phases.map((phase) => ({
          name: phase.name.trim(),
          type: phase.type,
          order: phase.order,
          config: this.normalizeConfig(phase.config),
        }))
        if (config.repeatGroups?.length) {
          const positions = new Map(config.phases.map((phase, i) => [phase.id, i]))
          normalized.repeatGroups = config.repeatGroups.map(group => ({
            phases: group.phaseIds.map(id => positions.get(id)),
            count: group.count,
          })).sort((a, b) => (a.phases[0] ?? 0) - (b.phases[0] ?? 0))
        }
        if (config.overallTimeLimit) {
          normalized.overallTimeLimit = config.overallTimeLimit
        }
        normalized.autoAdvance = config.autoAdvance ?? true
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
