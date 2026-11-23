'use client'

import type { CSSProperties } from 'react'

import { formatTime } from '@/lib/timer'
import { cn } from '@/lib/utils'

import { Progress } from '@/components/ui/progress'

interface TimerProgressIndicatorProps {
  progress: number
  isRunning: boolean
  isRest: boolean
  isVisible: boolean
  minTime: number
  maxTime: number
  className?: string
}

export const TimerProgressIndicator = ({
  progress,
  isRunning,
  isRest,
  isVisible,
  minTime,
  maxTime,
  className,
}: TimerProgressIndicatorProps) => {
  const clampedProgress = Number.isFinite(progress) ? Math.max(0, Math.min(100, progress)) : 0

  const indicatorColor = isRunning
    ? 'var(--tm-pr-work-bg)'
    : isRest
      ? 'var(--tm-pr-rest-bg)'
      : 'var(--tm-pr-work-bg)'

  const progressStyle = {
    '--progress-indicator-color': indicatorColor,
  } as CSSProperties

  return (
    <div className={cn('mb-3 grid grid-cols-2 items-center gap-y-1', !isVisible && 'invisible', className)}>
      <span className="text-foreground text-base tabular-nums">{formatTime(minTime)}</span>
      <Progress
        aria-label="Timer progress"
        value={clampedProgress}
        className="col-span-2 row-start-2 h-4 w-full border border-(--progress-indicator-color) bg-background"
        style={progressStyle}
      />
      <span className="text-foreground col-start-2 row-start-1 text-right text-base tabular-nums">{formatTime(maxTime)}</span>
    </div>
  )
}
