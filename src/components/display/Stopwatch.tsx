'use client'

import { useCallback, useEffect } from 'react'

import type { StopwatchConfig } from '@/types/configure'

import { formatTime, TimerState } from '@/lib/timer'
import { useLapHistory, usePreStartCountdown, useSoundManager, useStopwatch } from '@/hooks'

import { TimerContainer } from '@/components/display/TimerContainer'
import { LapHistory } from './LapHistory'
import TimerButton from './TimerButton'
import { TimerCard } from './TimerCard'

interface StopwatchProps {
  config: StopwatchConfig
  /** Optional callback when stopwatch state changes */
  onStateChange?: (state: TimerState) => void
}

export function Stopwatch({
  config: { timeLimit = 0, name = 'Stopwatch', sound, countdownBeforeStart },
  onStateChange,
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

  const { time, state, start, pause, reset } = useStopwatch({
    timeLimitMs: timeLimit * 1000,
    onStateChange: handleStateChange,
    onStop: handleStop,
  })

  const preStart = usePreStartCountdown({
    seconds: countdownBeforeStart,
    onComplete: () => {
      soundManager.reset()
      start()
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
  const isActive = isRunning || isPreStarting

  const handleReset = useCallback(() => {
    if (isPreStarting) {
      preStart.reset()
      return
    }
    // Save the current elapsed time as a lap before resetting
    if (time > 0) {
      addLap(time)
    }
    reset()
  }, [isPreStarting, preStart, time, reset, addLap])

  const handleRestart = useCallback(() => {
    reset()
    if (preStart.isEnabled) {
      preStart.start()
      return
    }
    start()
  }, [preStart, reset, start])

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

  return (
    <TimerContainer fullscreen={isActive}>
      <TimerCard
        label={name}
        isWork={isActive}
        state={isPreStarting ? preStart.state : state}
        time={isPreStarting ? String(preStart.secondsLeft) : formatTime(time)}
        subtitle={timeLimitDisplay}
        fullscreen={isActive}
      >
        <TimerButton
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
