'use client'

import { useCallback, useEffect } from 'react'
import { toast } from 'sonner'

import { CountdownConfig } from '@/types/configure'
import { formatTime, TimerState } from '@/lib/timer'
import { useLapHistory, usePreStartCountdown, useSoundManager, useTimer } from '@/hooks'

import { TimerContainer } from '@/components/display/TimerContainer'
import { LapHistory } from './LapHistory'
import TimerButton from './TimerButton'
import { TimerCard } from './TimerCard'

interface TimerProps {
  config: CountdownConfig
  /** Optional callback when timer state changes */
  onStateChange?: (state: TimerState) => void
}

export const Timer = ({
  config: { duration, completionMessage, name = 'Timer', sound, countdownBeforeStart },
  onStateChange,
}: TimerProps) => {
  const { laps, addLap, clearHistory, lastLap, bestLap } = useLapHistory()
  const soundManager = useSoundManager(sound)

  const handleStateChange = useCallback(
    (newState: TimerState, elapsed: number) => {
      // When a timer completes, record the full duration as a lap
      if (newState === TimerState.Completed && elapsed > 0) {
        addLap(duration * 1000)
      }
      onStateChange?.(newState)
    },
    [duration, addLap, onStateChange]
  )
  const handleComplete = useCallback(() => {
    toast.success('Timer finished', {
      description: completionMessage,
    })
  }, [completionMessage])

  const { time, state, totalElapsedTime, start, pause, reset } = useTimer(duration * 1000, {
    onStateChange: handleStateChange,
    onComplete: handleComplete,
  })

  const preStart = usePreStartCountdown({
    seconds: countdownBeforeStart,
    onComplete: () => {
      soundManager.reset()
      start()
    },
  })

  useEffect(() => {
    soundManager.syncCountdown(state, time)
  }, [soundManager, state, time])

  useEffect(() => {
    if (!preStart.isActive) return
    soundManager.syncPreStartCountdown(preStart.timeLeftMs)
  }, [soundManager, preStart.isActive, preStart.timeLeftMs])

  const isRunning = state === TimerState.Running
  const isPreStarting = preStart.isActive
  const isActive = isRunning || isPreStarting
  const handleReset = () => {
    if (isPreStarting) {
      preStart.reset()
      return
    }
    // Save the total elapsed time as a lap before resetting
    if (totalElapsedTime > 0) {
      addLap(totalElapsedTime)
    }
    reset()
  }

  const handleRestart = () => {
    reset()
    if (preStart.isEnabled) {
      preStart.start()
      return
    }
    start()
  }

  const handleStart = useCallback(async () => {
    await soundManager.init()

    if (isPreStarting) {
      preStart.start()
      return
    }

    if (state === TimerState.Idle) {
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

  return (
    <TimerContainer fullscreen={isActive}>
      <TimerCard
        label={name}
        state={isPreStarting ? preStart.state : state}
        time={isPreStarting ? String(preStart.secondsLeft) : formatTime(time)}
        isWork={isActive}
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
      {!isRunning && (
        <LapHistory laps={laps} onClearHistory={clearHistory} lastLap={lastLap} bestLap={bestLap} />
      )}
    </TimerContainer>
  )
}
