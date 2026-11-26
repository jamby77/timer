'use client'

import { Flag } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

import type { ReactNode } from 'react'
import type { StopwatchConfig } from '@/types/configure'

import { formatDuration } from '@/lib/configure/utils'
import { TimerState } from '@/lib/enums'
import { formatTime } from '@/lib/timer'
import {
  useAutoStart,
  useLapHistory,
  usePreStartCountdown,
  useSoundManager,
  useStopwatch,
  useWakeLock,
} from '@/hooks'

import { useInitialProgress, useSaveProgress } from '@/contexts/TimerRecovery'
import { BaseButton } from '@/components/ui/timer-buttons/BaseButton'
import { TimerContainer } from '@/components/display/TimerContainer'
import { TimerProgressIndicator } from '@/components/display/TimerProgressIndicator'
import { LapHistory } from './LapHistory'
import TimerButton from './TimerButton'
import { TimerCard } from './TimerCard'

interface StopwatchProps {
  startsAt?: number
  autoStart?: boolean
  statusHint?: ReactNode
  header?: ReactNode
  phaseControls?: ReactNode
  config: StopwatchConfig
  /** Optional callback when stopwatch state changes */
  onStateChange?: (state: TimerState, endedAt?: number) => void
  /** Optional callback when the Stop button is clicked */
  onStop?: () => void
}

export function Stopwatch({
  config: { timeLimit = 0, name = 'Stopwatch', sound, countdownBeforeStart },
  onStateChange,
  statusHint,
  header,
  phaseControls,
  startsAt,
  autoStart = startsAt !== undefined,
  onStop,
}: StopwatchProps) {
  const { laps, addSplit, clearHistory, bestLap, lastLap } = useLapHistory()
  const savedStart = useInitialProgress('splitStart')
  const [runStart, setRunStart] = useState(savedStart ?? laps.length)
  useSaveProgress('splitStart', runStart)
  const soundManager = useSoundManager(sound)

  const handleStateChange = useCallback(
    (newState: TimerState, endedAt?: number) => {
      onStateChange?.(newState, endedAt)
    },
    [onStateChange]
  )

  const handleStop = useCallback(
    (elapsedTime: number) => {
      addSplit(elapsedTime, runStart)
    },
    [addSplit, runStart]
  )

  const { time, state, start, pause, reset, restart, getElapsedTime } = useStopwatch({
    timeLimitMs: timeLimit * 1000,
    onStateChange: handleStateChange,
    onAutoStop: handleStop,
    onStop,
  })

  const preStart = usePreStartCountdown({
    seconds: countdownBeforeStart,
    onComplete: (endedAt) => {
      soundManager.reset()
      restart(endedAt)
    },
  })

  useEffect(() => {
    if (preStart.isActive) {
      soundManager.syncPreStartCountdown(preStart.timeLeftMs)
      return
    }
    soundManager.syncStopwatch(state, time)
  }, [soundManager, state, time, preStart.isActive, preStart.timeLeftMs])

  const isRunning = state === TimerState.Running
  const isPreStarting = preStart.isActive
  const isActive = isRunning || state === TimerState.Paused || isPreStarting

  // Keep the screen awake while stopwatch is running
  useWakeLock(isRunning || preStart.state === TimerState.Running)

  const handleReset = useCallback(() => {
    if (isPreStarting) {
      preStart.reset()
      onStop?.()
      return
    }
    // Save the current elapsed time as a lap before resetting
    const elapsed = getElapsedTime()
    if (elapsed > 0) {
      addSplit(elapsed, runStart)
    }
    reset()
  }, [isPreStarting, preStart, getElapsedTime, reset, addSplit, runStart, onStop])

  const handleRestart = useCallback(() => {
    setRunStart(laps.length)
    if (preStart.isEnabled) {
      preStart.start()
      return
    }
    restart()
  }, [laps.length, preStart, restart])

  const handleStart = useCallback(async (startsAt?: number) => {
    await soundManager.init()

    if (isPreStarting) {
      preStart.start(startsAt)
      return
    }

    if (state === TimerState.Idle || state === TimerState.Completed) {
      setRunStart(laps.length)
      if (preStart.isEnabled) {
        preStart.start(startsAt)
        return
      }
    }

    start(startsAt)
  }, [soundManager, start, preStart, isPreStarting, state, laps.length])

  const handlePause = useCallback(() => {
    if (isPreStarting) {
      preStart.pause()
      return
    }
    pause()
  }, [isPreStarting, pause, preStart])
  const timeLimitDisplay = timeLimit ? `${formatDuration(timeLimit, { exact: true })} limit` : undefined

  const minTime = 0
  const maxTime = timeLimit ? timeLimit * 1000 : 0
  const progress = timeLimit ? (time / (timeLimit * 1000)) * 100 : 0
  const isRest = state === TimerState.Paused

  const isAutoStarting = useAutoStart(autoStart, handleStart, startsAt)

  return (
    <TimerContainer fullscreen={isActive || isAutoStarting}>
      <TimerCard
        isPreStarting={isPreStarting}
        statusHint={statusHint}
        runningStatus={laps.length > runStart && lastLap?.split
          ? `Lap ${lastLap.split.number} · ${formatTime(lastLap.lapTime)}`
          : undefined}
        headerControls={!isPreStarting && (isRunning || state === TimerState.Paused) && (
          <div className="stopwatch-lap mt-3 flex justify-center">
            <BaseButton
              label="Lap"
              disabled={!isRunning}
              onClick={() => addSplit(getElapsedTime(), runStart)}
              className="bg-tm-skip hover:bg-tm-skip/80 focus:ring-tm-skip h-11 w-auto min-w-[5.375rem] px-4 max-[400px]:min-w-[3.3125rem] max-[400px]:px-3"
            >
              <Flag aria-hidden="true" className="size-5 max-[400px]:hidden" />
              Lap
            </BaseButton>
          </div>
        )}
        header={header}
        label={name}
        hideLabel={Boolean(header)}
        isWork={isActive || isAutoStarting}
        state={isPreStarting ? preStart.state : state}
        time={isPreStarting ? String(preStart.secondsLeft) : formatTime(time)}
        subtitle={timeLimitDisplay}
        fullscreen={isActive || isAutoStarting}
      >
        {maxTime > minTime && (
          <TimerProgressIndicator
            progress={progress}
            isRunning={isRunning}
            isRest={isRest}
            isVisible={!isPreStarting}
            minTime={minTime}
            maxTime={maxTime}
          />
        )}
        <TimerButton
          phaseControls={phaseControls}
          state={isPreStarting ? preStart.state : state}
          onStart={() => handleStart()}
          onPause={handlePause}
          onReset={handleReset}
          onRestart={handleRestart}
        />
      </TimerCard>
      {!isActive && (
        <LapHistory showSplits laps={laps} onClearHistory={clearHistory} bestLap={bestLap} lastLap={lastLap} />
      )}
    </TimerContainer>
  )
}
