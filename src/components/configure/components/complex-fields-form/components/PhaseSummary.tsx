import React from 'react'

import type { ComplexPhase } from '@/types/configure'

import {
  isCountdownConfig,
  isIntervalConfig,
  isStopwatchConfig,
  isWorkRestConfig,
} from '@/types/configure'
import { TIMER_TYPE_LABELS } from '@/lib/enums'
import { TIMER_TYPE_ICONS } from '@/lib/timer-type-icons'

interface PhaseSummaryProps {
  phases: ComplexPhase[]
}

export const PhaseSummary = ({ phases }: PhaseSummaryProps) => {
  return (
    <div className="space-y-2">
      {phases.map((phase, index) => {
        const Icon = TIMER_TYPE_ICONS[phase.type]
        const c = phase.config
        return (
          <div key={phase.id} className="flex items-center gap-3 rounded-lg border p-3 max-sm:items-start">
            <div className="bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-full">
              <span className="text-sm font-medium">{index + 1}</span>
            </div>
            <Icon className="text-muted-foreground size-4 shrink-0 max-sm:hidden" aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <div className="wrap-anywhere font-medium">{phase.name}</div>
              <div className="text-muted-foreground text-sm">
                <Icon className="mr-1 inline-block size-4 align-text-bottom sm:hidden" aria-hidden="true" />
                {TIMER_TYPE_LABELS[phase.type]}
                {isCountdownConfig(c) && <span> - {c.duration}s</span>}
                {isIntervalConfig(c) && (
                  <span>
                    {' '}
                    - {c.workDuration}s work / {c.restDuration}s rest × {c.intervals}
                  </span>
                )}
                {isStopwatchConfig(c) && c.timeLimit && <span> - {c.timeLimit}s limit</span>}
                {isWorkRestConfig(c) && (
                  <span>
                    {' '}
                    - {c.maxWorkTime}s max work / {c.maxRounds} rounds
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
