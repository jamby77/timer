import React from 'react'

import type { ComplexPhase } from '@/types/configure'

import {
  isCountdownConfig,
  isIntervalConfig,
  isStopwatchConfig,
  isWorkRestConfig,
} from '@/types/configure'
import { formatDuration } from '@/lib/configure/utils'
import { TIMER_TYPE_LABELS, WorkRestMode } from '@/lib/enums'
import { TIMER_TYPE_ICONS } from '@/lib/timer-type-icons'

interface PhaseSummaryProps {
  phases: ComplexPhase[]
}

const formatPhaseDuration = (seconds: number) => formatDuration(seconds, { exact: true })

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
                {isWorkRestConfig(c) ? 'Work/Rest' : TIMER_TYPE_LABELS[phase.type]}
                {isCountdownConfig(c) && <span> · {formatPhaseDuration(c.duration)}</span>}
                {isIntervalConfig(c) && (
                  <>
                    <div>
                      {c.intervals} {c.intervals === 1 ? 'round' : 'rounds'} ·{' '}
                      {c.skipLastRest === false ? 'Final rest included' : 'Final rest skipped'}
                    </div>
                    <div>{formatPhaseDuration(c.workDuration)} work / {formatPhaseDuration(c.restDuration)} rest</div>
                  </>
                )}
                {isStopwatchConfig(c) && (
                  <div>{c.timeLimit ? `${formatPhaseDuration(c.timeLimit)} time limit` : 'No time limit'}</div>
                )}
                {isWorkRestConfig(c) && (
                  <>
                    <div>
                      {c.maxRounds} {c.maxRounds === 1 ? 'round' : 'rounds'} ·{' '}
                      {c.maxWorkTime ? `${formatPhaseDuration(c.maxWorkTime)} work limit` : 'No work time limit'}
                    </div>
                    <div>
                      {c.restMode === WorkRestMode.FIXED
                        ? c.fixedRestDuration ? `${formatPhaseDuration(c.fixedRestDuration)} fixed rest` : 'Set rest duration'
                        : `Rest ${c.ratio ?? 1}× work time`}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
