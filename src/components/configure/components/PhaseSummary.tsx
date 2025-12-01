import type { ComplexPhase } from '@/types/configure'

import { TIMER_TYPE_ICONS, TIMER_TYPE_LABELS, TimerType } from '@/lib/enums'

interface PhaseSummaryProps {
  phases: ComplexPhase[]
}

export const PhaseSummary = ({ phases }: PhaseSummaryProps) => {
  return (
    <div className="space-y-2">
      {phases.map((phase, index) => {
        const Icon = TIMER_TYPE_ICONS[phase.type]
        return (
          <div key={phase.id} className="flex items-center gap-3 rounded-lg border p-3">
            <div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-full">
              <span className="text-sm font-medium">{index + 1}</span>
            </div>
            <Icon className="text-muted-foreground h-4 w-4" />
            <div className="flex-1">
              <div className="font-medium">{phase.name}</div>
              <div className="text-muted-foreground text-sm">
                {TIMER_TYPE_LABELS[phase.type]}
                {phase.type === TimerType.COUNTDOWN && (
                  <span> - {(phase.config as any).duration}s</span>
                )}
                {phase.type === TimerType.INTERVAL && (
                  <span>
                    {' '}
                    - {(phase.config as any).workDuration}s work /{' '}
                    {(phase.config as any).restDuration}s rest ×{' '}
                    {(phase.config as any).intervals}
                  </span>
                )}
                {phase.type === TimerType.STOPWATCH &&
                  (phase.config as any).timeLimit && (
                    <span> - {(phase.config as any).timeLimit}s limit</span>
                  )}
                {phase.type === TimerType.WORKREST && (
                  <span>
                    {' '}
                    - {(phase.config as any).maxWorkTime}s max work /{' '}
                    {(phase.config as any).maxRounds} rounds
                  </span>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
