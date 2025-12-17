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

  const progressStyle: CSSProperties = {
    ['--progress-indicator-color' as any]: indicatorColor,
  }

  return (
    <div className={cn('mb-4 flex items-center gap-2', !isVisible && 'invisible', className)}>
      <span className="text-muted-foreground textbase tabular-nums">{formatTime(minTime)}</span>
      <Progress value={clampedProgress} className="flex-1" style={progressStyle} />
      <span className="text-muted-foreground text-base tabular-nums">{formatTime(maxTime)}</span>
    </div>
  )
}
