'use client'

import { useCallback, useEffect } from 'react'
import { toast } from 'sonner'

import type { ReactNode } from 'react'

import { CountdownConfig } from '@/types/configure'
import { TimerState } from '@/lib/enums'
import { formatTime } from '@/lib/timer'
import {
  useAutoStart,
  useLapHistory,
  usePreStartCountdown,
  useSoundManager,
  useTimer,
  useWakeLock,
} from '@/hooks'

import { TimerContainer } from '@/components/display/TimerContainer'
import { TimerProgressIndicator } from '@/components/display/TimerProgressIndicator'
import { LapHistory } from './LapHistory'
import TimerButton from './TimerButton'
import { TimerCard } from './TimerCard'

interface TimerProps {
  autoStart?: boolean
  header?: ReactNode
  phaseControls?: ReactNode
  config: CountdownConfig
  /** Optional callback when timer state changes */
  onStateChange?: (state: TimerState) => void
  /** Optional callback when the Stop button is clicked */
  onStop?: () => void
}

export const Timer = ({
  config: { duration, completionMessage, name = 'Timer', sound, countdownBeforeStart },
  onStateChange,
  header,
  phaseControls,
  autoStart = false,
  onStop,
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

  const { time, state, totalElapsedTime, start, pause, reset, restart } = useTimer(
    duration * 1000,
    {
      onStateChange: handleStateChange,
      onComplete: handleComplete,
      onStop,
    }
  )

  const preStart = usePreStartCountdown({
    seconds: countdownBeforeStart,
    onComplete: () => {
      soundManager.reset()
      restart()
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
  const isActive = isRunning || state === TimerState.Paused || isPreStarting

  // Keep screen awake while timer is running
  useWakeLock(isRunning)
  const handleReset = () => {
    if (isPreStarting) {
      preStart.reset()
      onStop?.()
      return
    }
    // Save the total elapsed time as a lap before resetting
    if (totalElapsedTime > 0) {
      addLap(totalElapsedTime)
    }
    reset()
  }

  const handleRestart = () => {
    if (preStart.isEnabled) {
      preStart.start()
      return
    }
    restart()
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

  const durationMs = duration * 1000
  const minTime = 0
  const maxTime = durationMs
  const elapsed = durationMs - time
  const progress = durationMs > 0 ? (elapsed / durationMs) * 100 : 0
  const isPaused = state === TimerState.Paused
  const showProgress = !isPreStarting && (isRunning || isPaused)

  const isAutoStarting = useAutoStart(autoStart, handleStart)

  return (
    <TimerContainer fullscreen={isActive || isAutoStarting}>
      <TimerCard
        header={header}
        label={name}
        hideLabel={Boolean(header)}
        state={isPreStarting ? preStart.state : state}
        time={isPreStarting ? String(preStart.secondsLeft) : formatTime(time)}
        isWork={isActive || isAutoStarting}
        fullscreen={isActive || isAutoStarting}
      >
        <TimerProgressIndicator
          progress={progress}
          isRunning={isRunning}
          isRest={isPaused}
          isVisible={showProgress}
          minTime={minTime}
          maxTime={maxTime}
        />
        <TimerButton
          phaseControls={phaseControls}
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
