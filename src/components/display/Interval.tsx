'use client'

import { useCallback, useEffect } from 'react'

import type { IntervalConfig } from '@/types/configure'

import { TimerState as BaseTimerState, formatTime } from '@/lib/timer'
import { TimerState } from '@/lib/timer/types'
import { useIntervalTimer, useLapHistory, usePreStartCountdown, useSoundManager } from '@/hooks'

import { TimerProgressIndicator } from '@/components/display/TimerProgressIndicator'
import {
  PauseButton,
  ResetButton,
  SkipButton,
  StartButton,
  StopButton,
} from '@/components/ui/timer-buttons'
import { TimerContainer } from '@/components/display/TimerContainer'
import { LapHistory } from './LapHistory'
import { TimerCard } from './TimerCard'

interface IntervalProps {
  /** Configuration for the interval timer */
  intervalConfig: IntervalConfig
}

export function Interval({ intervalConfig: { sound, ...intervalConfig } }: IntervalProps) {
  const { laps, lastLap, bestLap, addLap, clearHistory } = useLapHistory()
  const soundManager = useSoundManager(sound)
  const addLapCallback = useCallback(
    (elapsedTime: number) => {
      // Add lap with the actual elapsed time
      addLap(elapsedTime)
    },
    [addLap]
  )
  const {
    currentStep,
    currentStepIndex,
    timerState,
    timeLeft,
    start,
    reset,
    pause,
    skipCurrentStep,
  } = useIntervalTimer({
    ...intervalConfig,
    onWorkStepComplete: addLapCallback,
  })

  const preStart = usePreStartCountdown({
    seconds: intervalConfig.countdownBeforeStart,
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
    soundManager.syncInterval(timerState, timeLeft, currentStep?.isWork ?? null, currentStepIndex)
  }, [
    soundManager,
    timerState,
    timeLeft,
    currentStep?.isWork,
    currentStepIndex,
    preStart.isActive,
    preStart.timeLeftMs,
  ])

  const handleRestart = useCallback(() => {
    reset()
    if (preStart.isEnabled) {
      preStart.start()
      return
    }
    start()
  }, [preStart, reset, start])

  const handleStop = useCallback(() => {
    if (preStart.isActive) {
      preStart.reset()
      return
    }
    // Record current lap if timer is running and we're in a work step
    if (timerState === TimerState.Running && currentStep?.isWork) {
      const elapsed = currentStep.duration - timeLeft
      addLap(elapsed)
    }
    // Stop and reset the timer
    reset()
  }, [preStart, timerState, currentStep, timeLeft, reset, addLap])

  const handleStart = useCallback(() => {
    void (async () => {
      await soundManager.init()

      if (preStart.isActive) {
        preStart.start()
        return
      }

      if (timerState === TimerState.Idle || timerState === TimerState.Completed) {
        if (preStart.isEnabled) {
          preStart.start()
          return
        }
      }

      start()
    })()
  }, [soundManager, start, preStart, timerState])

  const isRunning = timerState === TimerState.Running
  const isPreStarting = preStart.isActive
  const isActive = isRunning || isPreStarting

  const handlePause = useCallback(() => {
    if (isPreStarting) {
      preStart.pause()
      return
    }
    pause()
  }, [isPreStarting, pause, preStart])

  const minTime = 0
  const maxTime = currentStep?.duration ?? 0
  const elapsed = currentStep ? currentStep.duration - timeLeft : 0
  const progress = maxTime > 0 ? (elapsed / maxTime) * 100 : 0
  const isVisible = !!currentStep && !isPreStarting && (timerState === TimerState.Running || timerState === TimerState.Paused)
  const isWorkStep = currentStep?.isWork ?? true

  const getCurrentIntervalInfo = () => {
    const workSteps = Math.ceil((currentStepIndex + 1) / 2)
    return `${workSteps}/${intervalConfig.intervals}`
  }

  const showPlayButton = isPreStarting
    ? preStart.state !== BaseTimerState.Running
    : timerState === TimerState.Idle ||
      timerState === TimerState.Completed ||
      timerState === TimerState.Paused

  return (
    <TimerContainer fullscreen={isActive}>
      <TimerCard
        label={currentStep?.label || 'Interval Timer'}
        state={isPreStarting ? preStart.state : timerState}
        time={isPreStarting ? String(preStart.secondsLeft) : formatTime(timeLeft)}
        subtitle={currentStep ? `${getCurrentIntervalInfo()}` : undefined}
        isWork={isPreStarting ? undefined : currentStep?.isWork}
        fullscreen={isActive}
      >
        <TimerProgressIndicator
          progress={progress}
          isRunning={isWorkStep}
          isRest={!isWorkStep}
          isVisible={isVisible}
          minTime={minTime}
          maxTime={maxTime}
        />
        <div className="flex items-center justify-center gap-4">
          {showPlayButton ? (
            <StartButton
              onClick={handleStart}
              title={
                isPreStarting
                  ? 'Resume countdown'
                  : timerState === TimerState.Paused
                    ? 'Resume intervals'
                    : 'Start intervals'
              }
              label={
                isPreStarting
                  ? 'Resume countdown'
                  : timerState === TimerState.Paused
                    ? 'Resume intervals'
                    : 'Start intervals'
              }
            />
          ) : (
            <PauseButton onClick={handlePause} title="Pause intervals" label="Pause intervals" />
          )}
          <SkipButton
            onClick={skipCurrentStep}
            disabled={timerState !== TimerState.Running}
            title="Skip current interval"
            label="Skip current interval"
          />
          <StopButton
            onClick={handleStop}
            disabled={!isActive}
            title="Stop intervals"
            label="Stop intervals"
          />
          <ResetButton
            onClick={handleRestart}
            title="Restart intervals"
            label="Restart intervals"
          />
        </div>
      </TimerCard>
      {!isActive && (
        <LapHistory laps={laps} onClearHistory={clearHistory} bestLap={bestLap} lastLap={lastLap} />
      )}
    </TimerContainer>
  )
}
