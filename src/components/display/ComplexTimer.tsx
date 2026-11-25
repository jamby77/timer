'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useInitialProgress, useSaveProgress } from '@/contexts/TimerRecovery'
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
import { phaseSequence } from '@/lib/configure/phase-sequence'
import { exactPhaseDuration, formatDuration } from '@/lib/configure/utils'
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
  const phases = useMemo(() => phaseSequence(config), [config])

  const {
    elapsedMs,
    promptOpen,
    setRunning,
    acknowledge,
    finish,
    reset: resetClock,
  } = useWorkoutClock(config.overallTimeLimit)
  const savedPhase = useInitialProgress('phaseIndex')
  const [phaseIndex, setPhaseIndex] = useState(savedPhase ?? 0)
  useSaveProgress('phaseIndex', phaseIndex)
  const [phaseRun, setPhaseRun] = useState(0)
  const [isStopped, setIsStopped] = useState(false)
  const [phaseStartsAt, setPhaseStartsAt] = useState<number>()
  const [isComplexRunning, setIsComplexRunning] = useState(false)
  const lastAutoAdvancedIndex = useRef<number | null>(null)

  const currentPhase = phases[phaseIndex]
  const occurrenceKey = JSON.stringify([currentPhase.id, phaseIndex, phaseRun])
  const position = `Phase ${phaseIndex + 1}/${phases.length}`
  const isFirst = phaseIndex === 0
  const phaseConfig = useMemo(
    () => ({
      ...currentPhase.config,
      sound: config.sound ?? currentPhase.config.sound,
      countdownBeforeStart: isFirst
        ? (config.countdownBeforeStart ?? currentPhase.config.countdownBeforeStart)
        : currentPhase.config.countdownBeforeStart,
    }),
    [currentPhase.config, config.sound, config.countdownBeforeStart, isFirst]
  )
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
      setPhaseStartsAt(undefined)
      setPhaseIndex(clamped)
      setPhaseRun((run) => run + 1)
      lastAutoAdvancedIndex.current = null
    },
    [phases.length, resetClock]
  )

  const goToNextPhase = useCallback(() => {
    setRunning(false)
    setIsComplexRunning(false)
    setPhaseStartsAt(undefined)
    setPhaseIndex((prev) => Math.min(prev + 1, phases.length - 1))
    lastAutoAdvancedIndex.current = null
  }, [phases.length, setRunning])

  const goToPrevPhase = useCallback(() => {
    setRunning(false)
    setIsComplexRunning(false)
    setPhaseStartsAt(undefined)
    setPhaseIndex((prev) => Math.max(prev - 1, 0))
    lastAutoAdvancedIndex.current = null
  }, [setRunning])

  const handlePhaseComplete = useCallback(
    (endedAt: number) => {
      setRunning(false, endedAt)
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

      if (lastAutoAdvancedIndex.current === phaseIndex) {
        return
      }
      lastAutoAdvancedIndex.current = phaseIndex

      setIsComplexRunning(false)
      setPhaseIndex(phaseIndex + 1)
      setPhaseStartsAt(endedAt)
    },
    [config.autoAdvance, phaseIndex, isLast, setRunning, finish]
  )

  const handlePhaseStop = useCallback(() => {
    finish()
    setPhaseStartsAt(undefined)
    setIsComplexRunning(false)
    setIsStopped(true)
  }, [finish])

  const handlePhaseStateChange = useCallback(
    (state: TimerState, at?: number) => {
      setRunning(state === TimerState.Running, at)
      setIsComplexRunning(state === TimerState.Running || state === TimerState.Paused)
      if (state === TimerState.Completed) {
        handlePhaseComplete(at ?? Date.now())
      }
    },
    [handlePhaseComplete, setRunning]
  )

  const handlePhaseStateChangeNoComplete = useCallback(
    (state: TimerState, at?: number) => {
      setRunning(state === TimerState.Running, at)
      setIsComplexRunning(state === TimerState.Running || state === TimerState.Paused)
    },
    [setRunning]
  )

  const nextPhase = phases[phaseIndex + 1]
  const duration = nextPhase && exactPhaseDuration(nextPhase.config)
  const statusHint = nextPhase && (
    <div className="@container min-w-0 flex-1 text-right text-[13px] font-medium opacity-80">
      <div className="flex h-5 flex-wrap justify-end gap-x-1 overflow-hidden leading-5 @max-[5rem]:sr-only">
        <span className="max-w-full truncate" title={nextPhase.name}>Next: {nextPhase.name}</span>
        {duration !== undefined && <span className="whitespace-nowrap">· {formatDuration(duration, { exact: true })}</span>}
      </div>
    </div>
  )
  const phaseHeader = (
    <div className="grid h-11 w-full grid-cols-3 items-start gap-x-3 pt-3 max-sm:portrait:h-auto max-sm:portrait:min-h-11 max-sm:portrait:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)_minmax(0,1fr)] max-sm:portrait:gap-x-1">
      <div className="min-w-0 text-left">
        <div className="truncate text-base leading-5 opacity-75" title={config.name}>
          {config.name || 'Complex timer'}
        </div>
        {Boolean(config.overallTimeLimit) && (
          <div
            aria-label="Overall timer time"
            className="truncate text-xs leading-3 tabular-nums"
            title={
              elapsedMs >= config.overallTimeLimit! * 1000
                ? 'Overall time limit reached'
                : 'Overall timer time'
            }
          >
            {formatTime(elapsedMs).split('.')[0]} /{' '}
            {formatTime(config.overallTimeLimit! * 1000).split('.')[0]}
            {elapsedMs >= config.overallTimeLimit! * 1000 && <span> · Limit reached</span>}
          </div>
        )}
      </div>
      <div
        className="truncate text-center text-xl leading-5 font-semibold max-sm:portrait:line-clamp-2 max-sm:portrait:wrap-anywhere max-sm:portrait:whitespace-normal"
        title={currentPhase.name}
      >
        {currentPhase.name}
      </div>
      <div className="grid text-right text-lg leading-5 opacity-75">
        {currentPhase.group ? (
          <>
            <span className="col-start-1 row-start-1">Rep {currentPhase.pass}/{currentPhase.group.count}</span>
            <span className="pointer-events-none col-start-1 row-start-1 opacity-0">{position}</span>
          </>
        ) : position}
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
        title="Restart timer"
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
            key={occurrenceKey}
            statusHint={statusHint}
            header={phaseHeader}
            phaseControls={phaseControls}
            startsAt={phaseStartsAt}
            config={timerConfig as CountdownConfig}
            onStateChange={handlePhaseStateChange}
            onStop={handlePhaseStop}
          />
        )
      case TimerType.STOPWATCH:
        return (
          <Stopwatch
            key={occurrenceKey}
            statusHint={statusHint}
            header={phaseHeader}
            phaseControls={phaseControls}
            startsAt={phaseStartsAt}
            config={timerConfig as StopwatchConfig}
            onStateChange={handlePhaseStateChange}
            onStop={handlePhaseStop}
          />
        )
      case TimerType.INTERVAL:
        return (
          <Interval
            key={occurrenceKey}
            statusHint={statusHint}
            header={phaseHeader}
            phaseControls={phaseControls}
            startsAt={phaseStartsAt}
            intervalConfig={timerConfig as IntervalConfig}
            onComplete={handlePhaseComplete}
            onStateChange={handlePhaseStateChangeNoComplete}
            onStop={handlePhaseStop}
          />
        )
      case TimerType.WORKREST:
        return (
          <WorkRestTimer
            key={occurrenceKey}
            statusHint={statusHint}
            header={phaseHeader}
            phaseControls={phaseControls}
            startsAt={phaseStartsAt}
            config={timerConfig as WorkRestConfig}
            onPhaseComplete={handlePhaseComplete}
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
      <div className="flex w-full max-w-xl flex-col items-center gap-4 py-12 text-center">
        <h2 className="max-w-full text-2xl font-semibold wrap-anywhere">{config.name || 'Complex timer'}</h2>
        <p role="status">Timer stopped</p>
        <Button
          className="max-sm:min-h-11 max-sm:w-full"
          onClick={() => {
            goToPhase(0)
            setIsStopped(false)
          }}
        >
          Restart timer
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
