'use client'

import { useCallback, useEffect } from 'react'
import cx from 'clsx'

import type { IntervalConfig } from '@/types/configure'

import { useSoundManager } from '@/lib/sound/useSoundManager'
import { formatTime } from '@/lib/timer'
import { TimerState } from '@/lib/timer/types'
import { useIntervalTimer } from '@/lib/timer/useIntervalTimer'
import { useLapHistory } from '@/lib/timer/useLapHistory'

import { Progress } from '@/components/ui/progress'
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

  useEffect(() => {
    soundManager.syncInterval(timerState, timeLeft, currentStep?.isWork ?? null, currentStepIndex)
  }, [soundManager, timerState, timeLeft, currentStep?.isWork, currentStepIndex])

  const handleRestart = useCallback(() => {
    reset()
    start()
  }, [reset, start])

  const handleStop = useCallback(() => {
    // Record current lap if timer is running and we're in a work step
    if (timerState === TimerState.Running && currentStep?.isWork) {
      const elapsed = currentStep.duration - timeLeft
      addLap(elapsed)
    }
    // Stop and reset the timer
    reset()
  }, [timerState, currentStep, timeLeft, reset, addLap])

  const handleStart = useCallback(() => {
    void (async () => {
      await soundManager.init()
      start()
    })()
  }, [soundManager, start])

  const isRunning = timerState === TimerState.Running

  const getProgress = () => {
    if (!currentStep) return 0
    const totalDuration = currentStep.duration
    const elapsed = totalDuration - timeLeft
    return (elapsed / totalDuration) * 100
  }

  const getCurrentIntervalInfo = () => {
    const workSteps = Math.ceil((currentStepIndex + 1) / 2)
    return `${workSteps}/${intervalConfig.intervals}`
  }

  const showPlayButton =
    timerState === TimerState.Idle ||
    timerState === TimerState.Completed ||
    timerState === TimerState.Paused

  return (
    <TimerContainer fullscreen={isRunning}>
      <TimerCard
        label={currentStep?.label || 'Interval Timer'}
        state={timerState}
        time={formatTime(timeLeft)}
        subtitle={currentStep ? `${getCurrentIntervalInfo()}` : undefined}
        isWork={currentStep?.isWork}
        fullscreen={isRunning}
      >
        <Progress
          value={getProgress()}
          className={cx('mb-4', {
            invisible: !currentStep || isRunning,
            '[--progress-indicator-color:var(--tm-pr-work-bg)]': currentStep?.isWork,
            '[--progress-indicator-color:var(--tm-pr-rest-bg)]': !currentStep?.isWork,
          })}
        />
        <div className="flex items-center justify-center gap-4">
          {showPlayButton ? (
            <StartButton
              onClick={handleStart}
              title={timerState === TimerState.Paused ? 'Resume intervals' : 'Start intervals'}
              label={timerState === TimerState.Paused ? 'Resume intervals' : 'Start intervals'}
            />
          ) : (
            <PauseButton onClick={pause} title="Pause intervals" label="Pause intervals" />
          )}
          <SkipButton
            onClick={skipCurrentStep}
            disabled={timerState !== TimerState.Running}
            title="Skip current interval"
            label="Skip current interval"
          />
          <StopButton
            onClick={handleStop}
            disabled={timerState !== TimerState.Running}
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
      {!isRunning && (
        <LapHistory laps={laps} onClearHistory={clearHistory} bestLap={bestLap} lastLap={lastLap} />
      )}
    </TimerContainer>
  )
}
