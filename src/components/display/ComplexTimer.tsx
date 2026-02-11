'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTimerContext } from '@/contexts/TimerContext'

import type {
  AnyTimerConfig,
  ComplexConfig,
  CountdownConfig,
  IntervalConfig,
  StopwatchConfig,
  WorkRestConfig,
} from '@/types/configure'

import { TimerState, TimerType } from '@/lib/enums'

import { Button } from '@/components/ui/button'
import { Interval } from '@/components/display/Interval'
import { Stopwatch } from '@/components/display/Stopwatch'
import { Timer } from '@/components/display/Timer'
import { WorkRestTimer } from '@/components/display/WorkRestTimer'

interface ComplexTimerProps {
  config: ComplexConfig
}

export function ComplexTimer({ config }: ComplexTimerProps) {
  const { setTimerActive } = useTimerContext()
  const phases = useMemo(() => {
    return [...(config.phases ?? [])].sort((a, b) => a.order - b.order)
  }, [config.phases])

  const [phaseIndex, setPhaseIndex] = useState(0)
  const [isComplexRunning, setIsComplexRunning] = useState(false)
  const lastAutoAdvancedPhaseIdRef = useRef<string | null>(null)

  // Update context when complex timer state changes
  useEffect(() => {
    setTimerActive(isComplexRunning)
  }, [isComplexRunning, setTimerActive])

  useEffect(() => {
    setPhaseIndex(0)
    lastAutoAdvancedPhaseIdRef.current = null
  }, [config.id])

  const goToPhase = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(index, phases.length - 1))
      setPhaseIndex(clamped)
      lastAutoAdvancedPhaseIdRef.current = null
    },
    [phases.length]
  )

  const goToNextPhase = useCallback(() => {
    setPhaseIndex((prev) => Math.min(prev + 1, phases.length - 1))
    lastAutoAdvancedPhaseIdRef.current = null
  }, [phases.length])

  const goToPrevPhase = useCallback(() => {
    setPhaseIndex((prev) => Math.max(prev - 1, 0))
    lastAutoAdvancedPhaseIdRef.current = null
  }, [])

  const handlePhaseComplete = useCallback(
    (phaseId: string) => {
      const autoAdvance = config.autoAdvance ?? true
      
      // Check if this is the last phase FIRST
      if (isLast) {
        setIsComplexRunning(false)
        return // Complex timer finished
      }
      
      if (!autoAdvance) {
        return
      }

      if (lastAutoAdvancedPhaseIdRef.current === phaseId) {
        return
      }
      lastAutoAdvancedPhaseIdRef.current = phaseId

      goToNextPhase()
    },
    [config.autoAdvance, goToNextPhase, isLast]
  )

  if (!phases.length) {
    return (
      <div className="text-center">
        <h2 className="mb-4 text-2xl font-bold">{config.name || 'Complex timer'}</h2>
        <p className="text-muted-foreground">This complex timer has no phases.</p>
      </div>
    )
  }

  const currentPhase = phases[phaseIndex]
  const isFirst = phaseIndex === 0
  const isLast = phaseIndex === phases.length - 1

  const renderPhaseTimer = (timerConfig: AnyTimerConfig) => {
    switch (timerConfig.type) {
      case TimerType.COUNTDOWN:
        return (
          <Timer
            key={`${config.id}-${currentPhase.id}`}
            config={timerConfig as CountdownConfig}
            onStateChange={(state) => {
              setIsComplexRunning(state === TimerState.Running || state === TimerState.Paused)
              if (state === TimerState.Completed) {
                handlePhaseComplete(currentPhase.id)
              }
            }}
            onStop={() => {
              if (config.autoAdvance ?? true) {
                // Auto-advancing: don't set running to false to prevent flicker
                goToNextPhase()
              } else {
                // Manual stop: set running to false
                setIsComplexRunning(false)
              }
            }}
          />
        )
      case TimerType.STOPWATCH:
        return (
          <Stopwatch
            key={`${config.id}-${currentPhase.id}`}
            config={timerConfig as StopwatchConfig}
            onStateChange={(state) => {
              setIsComplexRunning(state === TimerState.Running || state === TimerState.Paused)
              if (state === TimerState.Completed) {
                handlePhaseComplete(currentPhase.id)
              }
            }}
            onStop={() => {
              if (config.autoAdvance ?? true) {
                // Auto-advancing: don't set running to false to prevent flicker
                goToNextPhase()
              } else {
                // Manual stop: set running to false
                setIsComplexRunning(false)
              }
            }}
          />
        )
      case TimerType.INTERVAL:
        return (
          <Interval
            key={`${config.id}-${currentPhase.id}`}
            intervalConfig={timerConfig as IntervalConfig}
            onComplete={() => handlePhaseComplete(currentPhase.id)}
            onStateChange={(state) => {
              setIsComplexRunning(state === TimerState.Running || state === TimerState.Paused)
            }}
            onStop={() => {
              if (config.autoAdvance ?? true) {
                // Auto-advancing: don't set running to false to prevent flicker
                goToNextPhase()
              } else {
                // Manual stop: set running to false
                setIsComplexRunning(false)
              }
            }}
          />
        )
      case TimerType.WORKREST:
        return (
          <WorkRestTimer
            key={`${config.id}-${currentPhase.id}`}
            config={timerConfig as WorkRestConfig}
            onPhaseComplete={() => handlePhaseComplete(currentPhase.id)}
            onStateChange={(state) => {
              setIsComplexRunning(state === TimerState.Running || state === TimerState.Paused)
            }}
            onStop={() => {
              if (config.autoAdvance ?? true) {
                // Auto-advancing: don't set running to false to prevent flicker
                goToNextPhase()
              } else {
                // Manual stop: set running to false
                setIsComplexRunning(false)
              }
            }}
          />
        )
      default:
        return (
          <div className="text-center">
            <h2 className="mb-4 text-2xl font-bold">{currentPhase.name}</h2>
            <p className="text-muted-foreground">
              Timer type {timerConfig.type} is not supported inside a complex timer.
            </p>
          </div>
        )
    }
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold">{config.name || 'Complex timer'}</div>
            <div className="text-muted-foreground truncate text-xs">{currentPhase.name}</div>
          </div>
          <div className="text-muted-foreground shrink-0 text-xs">
            Phase {phaseIndex + 1}/{phases.length}
          </div>
        </div>

        <div className="flex items-center justify-between gap-2">
          <Button variant="outline" size="sm" disabled={isFirst} onClick={goToPrevPhase}>
            Previous
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={isFirst} onClick={() => goToPhase(0)}>
              Restart
            </Button>
            <Button variant="outline" size="sm" disabled={isLast} onClick={goToNextPhase}>
              Next
            </Button>
          </div>
        </div>
      </div>

      {renderPhaseTimer(currentPhase.config as AnyTimerConfig)}
    </div>
  )
}
