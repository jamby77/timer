'use client'

import { useCallback, useEffect } from 'react'

import type { ReactNode } from 'react'
import type { StopwatchConfig } from '@/types/configure'

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

import { TimerContainer } from '@/components/display/TimerContainer'
import { TimerProgressIndicator } from '@/components/display/TimerProgressIndicator'
import { LapHistory } from './LapHistory'
import TimerButton from './TimerButton'
import { TimerCard } from './TimerCard'

interface StopwatchProps {
  autoStart?: boolean
  header?: ReactNode
  phaseControls?: ReactNode
  config: StopwatchConfig
  /** Optional callback when stopwatch state changes */
  onStateChange?: (state: TimerState) => void
  /** Optional callback when the Stop button is clicked */
  onStop?: () => void
}

export function Stopwatch({
  config: { timeLimit = 0, name = 'Stopwatch', sound, countdownBeforeStart },
  onStateChange,
  header,
  phaseControls,
  autoStart = false,
  onStop,
}: StopwatchProps) {
  const { laps, addLap, clearHistory, bestLap, lastLap } = useLapHistory()
  const soundManager = useSoundManager(sound)

  const handleStateChange = useCallback(
    (newState: TimerState) => {
      onStateChange?.(newState)
    },
    [onStateChange]
  )

  const handleStop = useCallback(
    (elapsedTime: number) => {
      addLap(elapsedTime)
    },
    [addLap]
  )

  const { time, state, start, pause, reset, restart } = useStopwatch({
    timeLimitMs: timeLimit * 1000,
    onStateChange: handleStateChange,
    onAutoStop: handleStop,
    onStop,
  })

  const preStart = usePreStartCountdown({
    seconds: countdownBeforeStart,
    onComplete: () => {
      soundManager.reset()
      restart()
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
    if (time > 0) {
      addLap(time)
    }
    reset()
  }, [isPreStarting, preStart, time, reset, addLap, onStop])

  const handleRestart = useCallback(() => {
    if (preStart.isEnabled) {
      preStart.start()
      return
    }
    restart()
  }, [preStart, restart])

  const handleStart = useCallback(async () => {
    await soundManager.init()

    if (isPreStarting) {
      preStart.start()
      return
    }

    if (state === TimerState.Idle || state === TimerState.Completed) {
      if (preStart.isEnabled) {
        preStart.start()
        return
      }
    }

    start()
  }, [soundManager, start, preStart, isPreStarting, state])

  const handlePause = useCallback(() => {
    if (isPreStarting) {
      preStart.pause()
      return
    }
    pause()
  }, [isPreStarting, pause, preStart])
  const timeLimitDisplay = timeLimit ? `(Cap: ${formatTime(timeLimit * 1000)})` : undefined

  const minTime = 0
  const maxTime = timeLimit ? timeLimit * 1000 : 0
  const progress = timeLimit ? (time / (timeLimit * 1000)) * 100 : 0
  const isRest = state === TimerState.Paused

  const isAutoStarting = useAutoStart(autoStart, handleStart)

  return (
    <TimerContainer fullscreen={isActive || isAutoStarting}>
      <TimerCard
        isPreStarting={isPreStarting}
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
          onStart={handleStart}
          onPause={handlePause}
          onReset={handleReset}
          onRestart={handleRestart}
        />
      </TimerCard>
      {!isActive && (
        <LapHistory laps={laps} onClearHistory={clearHistory} bestLap={bestLap} lastLap={lastLap} />
      )}
    </TimerContainer>
  )
}
