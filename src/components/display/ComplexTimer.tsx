'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTimerContext } from '@/contexts/TimerContext'
import { RotateCcw, SkipBack, SkipForward } from 'lucide-react'

import type {
  ComplexConfig,
  CountdownConfig,
  IntervalConfig,
  PhaseConfig,
  StopwatchConfig,
  WorkRestConfig,
} from '@/types/configure'

import { TimerState, TimerType } from '@/lib/enums'
import { formatTime } from '@/lib/timer'
import { useWorkoutClock } from '@/hooks/useWorkoutClock'

import { Button } from '@/components/ui/button'
import { Interval } from '@/components/display/Interval'
import { Stopwatch } from '@/components/display/Stopwatch'
import { Timer } from '@/components/display/Timer'
import { WorkRestTimer } from '@/components/display/WorkRestTimer'
import { WorkoutLimitDialog } from './WorkoutLimitDialog'

interface ComplexTimerProps {
  config: ComplexConfig
}

export function ComplexTimer({ config }: ComplexTimerProps) {
  return <ComplexTimerSession key={config.id} config={config} />
}

function ComplexTimerSession({ config }: ComplexTimerProps) {
  const { setTimerActive } = useTimerContext()
  const phases = useMemo(() => {
    return [...(config.phases ?? [])].sort((a, b) => a.order - b.order)
  }, [config.phases])

  const {
    elapsedMs,
    promptOpen,
    setRunning,
    acknowledge,
    finish,
    reset: resetClock,
  } = useWorkoutClock(config.overallTimeLimit)
  const [phaseIndex, setPhaseIndex] = useState(0)
  const [phaseRun, setPhaseRun] = useState(0)
  const [isStopped, setIsStopped] = useState(false)
  const [autoStartPhase, setAutoStartPhase] = useState(false)
  const [isComplexRunning, setIsComplexRunning] = useState(false)
  const lastAutoAdvancedPhaseIdRef = useRef<string | null>(null)

  const currentPhase = phases[phaseIndex]
  const phaseConfig = useMemo(
    () => (config.sound ? { ...currentPhase.config, sound: config.sound } : currentPhase.config),
    [config.sound, currentPhase.config]
  )
  const isFirst = phaseIndex === 0
  const isLast = phaseIndex === phases.length - 1

  // Register timer state changes with context
  // Note: This useEffect is necessary for side effects (context registration)
  // React Doctor flags this as derived state, but context updates require useEffect
  useEffect(() => {
    setTimerActive(isComplexRunning)
  }, [isComplexRunning, setTimerActive])

  const goToPhase = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(index, phases.length - 1))
      resetClock()
      setIsComplexRunning(false)
      setAutoStartPhase(false)
      setPhaseIndex(clamped)
      setPhaseRun((run) => run + 1)
      lastAutoAdvancedPhaseIdRef.current = null
    },
    [phases.length, resetClock]
  )

  const goToNextPhase = useCallback(() => {
    setRunning(false)
    setIsComplexRunning(false)
    setAutoStartPhase(false)
    setPhaseIndex((prev) => Math.min(prev + 1, phases.length - 1))
    lastAutoAdvancedPhaseIdRef.current = null
  }, [phases.length, setRunning])

  const goToPrevPhase = useCallback(() => {
    setRunning(false)
    setIsComplexRunning(false)
    setAutoStartPhase(false)
    setPhaseIndex((prev) => Math.max(prev - 1, 0))
    lastAutoAdvancedPhaseIdRef.current = null
  }, [setRunning])

  const handlePhaseComplete = useCallback(
    (phaseId: string) => {
      setRunning(false)
      const autoAdvance = config.autoAdvance ?? true

      // Check if this is the last phase FIRST
      if (isLast) {
        finish()
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
      setAutoStartPhase(true)
    },
    [config.autoAdvance, goToNextPhase, isLast, setRunning, finish]
  )

  const handlePhaseStop = useCallback(() => {
    finish()
    setAutoStartPhase(false)
    setIsComplexRunning(false)
    setIsStopped(true)
  }, [finish])

  const handlePhaseStateChange = useCallback(
    (state: TimerState) => {
      setRunning(state === TimerState.Running)
      setIsComplexRunning(state === TimerState.Running || state === TimerState.Paused)
      if (state === TimerState.Completed) {
        handlePhaseComplete(currentPhase.id)
      }
    },
    [handlePhaseComplete, currentPhase.id, setRunning]
  )

  const handlePhaseStateChangeNoComplete = useCallback(
    (state: TimerState) => {
      setRunning(state === TimerState.Running)
      setIsComplexRunning(state === TimerState.Running || state === TimerState.Paused)
    },
    [setRunning]
  )

  const phaseHeader = (
    <div className="grid h-11 w-full grid-cols-3 items-start gap-x-3 pt-3">
      <div className="min-w-0 text-left">
        <div className="truncate text-base leading-5 opacity-75" title={config.name}>
          {config.name || 'Complex timer'}
        </div>
        {Boolean(config.overallTimeLimit) && (
          <div
            aria-label="Overall workout time"
            className="truncate text-xs leading-3 tabular-nums"
            title={
              elapsedMs >= config.overallTimeLimit! * 1000
                ? 'Overall time limit reached'
                : 'Overall workout time'
            }
          >
            {formatTime(elapsedMs).split('.')[0]} /{' '}
            {formatTime(config.overallTimeLimit! * 1000).split('.')[0]}
            {elapsedMs >= config.overallTimeLimit! * 1000 && <span> · Limit reached</span>}
          </div>
        )}
      </div>
      <div
        className="truncate text-center text-xl leading-5 font-semibold"
        title={currentPhase.name}
      >
        {currentPhase.name}
      </div>
      <div className="text-right text-lg leading-5 opacity-75">
        Phase {phaseIndex + 1}/{phases.length}
      </div>
    </div>
  )

  const phaseControls = (
    <>
      <Button
        className="text-foreground"
        variant="outline"
        size="icon"
        disabled={isFirst}
        onClick={goToPrevPhase}
        aria-label="Go to previous phase"
        title="Previous phase"
      >
        <SkipBack />
      </Button>
      <Button
        className="text-foreground"
        variant="outline"
        size="icon"
        onClick={() => goToPhase(0)}
        aria-label="Restart from first phase"
        title="Restart workout"
      >
        <RotateCcw />
      </Button>
      <Button
        className="text-foreground"
        variant="outline"
        size="icon"
        disabled={isLast}
        onClick={goToNextPhase}
        aria-label="Go to next phase"
        title="Next phase"
      >
        <SkipForward />
      </Button>
    </>
  )

  const renderPhaseTimer = (timerConfig: PhaseConfig) => {
    const t = timerConfig.type
    switch (t) {
      case TimerType.COUNTDOWN:
        return (
          <Timer
            key={`${config.id}-${currentPhase.id}-${phaseRun}`}
            header={phaseHeader}
            phaseControls={phaseControls}
            autoStart={autoStartPhase}
            config={timerConfig as CountdownConfig}
            onStateChange={handlePhaseStateChange}
            onStop={handlePhaseStop}
          />
        )
      case TimerType.STOPWATCH:
        return (
          <Stopwatch
            key={`${config.id}-${currentPhase.id}-${phaseRun}`}
            header={phaseHeader}
            phaseControls={phaseControls}
            autoStart={autoStartPhase}
            config={timerConfig as StopwatchConfig}
            onStateChange={handlePhaseStateChange}
            onStop={handlePhaseStop}
          />
        )
      case TimerType.INTERVAL:
        return (
          <Interval
            key={`${config.id}-${currentPhase.id}-${phaseRun}`}
            header={phaseHeader}
            phaseControls={phaseControls}
            autoStart={autoStartPhase}
            intervalConfig={timerConfig as IntervalConfig}
            onComplete={() => handlePhaseComplete(currentPhase.id)}
            onStateChange={handlePhaseStateChangeNoComplete}
            onStop={handlePhaseStop}
          />
        )
      case TimerType.WORKREST:
        return (
          <WorkRestTimer
            key={`${config.id}-${currentPhase.id}-${phaseRun}`}
            header={phaseHeader}
            phaseControls={phaseControls}
            autoStart={autoStartPhase}
            config={timerConfig as WorkRestConfig}
            onPhaseComplete={() => handlePhaseComplete(currentPhase.id)}
            onStateChange={handlePhaseStateChangeNoComplete}
            onStop={handlePhaseStop}
          />
        )
      default:
        return (
          <div className="text-center">
            <h2 className="mb-4 text-2xl font-bold">{currentPhase.name}</h2>
            <p className="text-muted-foreground">
              Timer type {t} is not supported inside a complex timer.
            </p>
          </div>
        )
    }
  }

  if (isStopped) {
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <h2 className="text-2xl font-semibold">{config.name || 'Complex timer'}</h2>
        <p role="status">Workout stopped</p>
        <Button
          onClick={() => {
            goToPhase(0)
            setIsStopped(false)
          }}
        >
          Restart workout
        </Button>
      </div>
    )
  }

  return (
    <>
      {renderPhaseTimer(phaseConfig)}
      {Boolean(config.overallTimeLimit) && (
        <WorkoutLimitDialog
          open={promptOpen}
          elapsedMs={elapsedMs}
          limitSeconds={config.overallTimeLimit!}
          onContinue={acknowledge}
          onEnd={handlePhaseStop}
        />
      )}
    </>
  )
}
