import type { AnyTimerConfig, ComplexConfig } from '@/types/configure'

import { TimerType, WorkRestMode } from '@/types/configure'

export type PhaseTimerConfig = Exclude<AnyTimerConfig, ComplexConfig>

export const createDefaultPhaseConfig = (
  phaseId: string,
  timerType: TimerType
): PhaseTimerConfig => {
  const baseConfig = {
    name: '',
    id: phaseId,
    createdAt: new Date(),
    lastUsed: new Date(),
  }

  switch (timerType) {
    case TimerType.COUNTDOWN:
      return {
        ...baseConfig,
        type: TimerType.COUNTDOWN,
        duration: 60,
      }
    case TimerType.STOPWATCH:
      return {
        ...baseConfig,
        type: TimerType.STOPWATCH,
      }
    case TimerType.INTERVAL:
      return {
        ...baseConfig,
        type: TimerType.INTERVAL,
        workDuration: 30,
        restDuration: 10,
        intervals: 3,
      }
    case TimerType.WORKREST:
      return {
        ...baseConfig,
        type: TimerType.WORKREST,
        maxWorkTime: 300,
        maxRounds: 5,
        restMode: WorkRestMode.RATIO,
        ratio: 2,
      }
    default:
      return {
        ...baseConfig,
        type: TimerType.COUNTDOWN,
        duration: 60,
      }
  }
}
