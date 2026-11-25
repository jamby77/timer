import type { ComplexConfig } from '@/types/configure'

import { isStopwatchConfig } from '@/types/configure'
import { clampCountdownSeconds } from '@/lib/timer/utils'

import { phaseSequence } from './phase-sequence'
import { exactPhaseDuration } from './utils'

export function buildTimeline(config: Partial<ComplexConfig>) {
  let elapsed: number | undefined = 0
  const phases = phaseSequence(config)
  const entries = phases.map((phase, index) => {
    const child = phase.config
    const ready = clampCountdownSeconds(
      index === 0
        ? (config.countdownBeforeStart ?? child.countdownBeforeStart)
        : child.countdownBeforeStart
    )
    const readyAt = elapsed
    const start = elapsed === undefined ? undefined : elapsed + ready
    const duration = isStopwatchConfig(child)
      ? child.timeLimit || undefined
      : exactPhaseDuration(child)
    const manual = config.autoAdvance === false && index < phases.length - 1
    elapsed = start === undefined || duration === undefined || manual ? undefined : start + duration
    return { phase, ready, readyAt, start, duration, manual }
  })
  return { entries, finish: elapsed }
}
