import React from 'react'

import type { ComplexPhase } from '@/types/configure'

import {
  isCountdownConfig,
  isIntervalConfig,
  isStopwatchConfig,
  isWorkRestConfig,
} from '@/types/configure'
import { TIMER_TYPE_ICONS, TIMER_TYPE_LABELS } from '@/lib/enums'

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
          <div key={phase.id} className="flex items-center gap-3 rounded-lg border p-3">
            <div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-full">
              <span className="text-sm font-medium">{index + 1}</span>
            </div>
            <Icon className="text-muted-foreground h-4 w-4" />
            <div className="flex-1">
              <div className="font-medium">{phase.name}</div>
              <div className="text-muted-foreground text-sm">
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
