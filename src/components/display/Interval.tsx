'use client'

import { useCallback, useEffect } from 'react'

import type { ReactNode } from 'react'
import type { IntervalConfig } from '@/types/configure'

import { TimerState } from '@/lib/enums'
import { formatTime } from '@/lib/timer'
import {
  useAutoStart,
  useIntervalTimer,
  useLapHistory,
  usePreStartCountdown,
  useSoundManager,
  useWakeLock,
} from '@/hooks'

import {
  PauseButton,
  ResetButton,
  SkipButton,
  StartButton,
  StopButton,
} from '@/components/ui/timer-buttons'
import { TimerContainer } from '@/components/display/TimerContainer'
import { TimerProgressIndicator } from '@/components/display/TimerProgressIndicator'
import { LapHistory } from './LapHistory'
import { TimerCard } from './TimerCard'
import { TimerControls } from './TimerControls'

interface IntervalProps {
  autoStart?: boolean
  header?: ReactNode
  phaseControls?: ReactNode
  /** Configuration for the interval timer */
  intervalConfig: IntervalConfig
  /** Optional callback when the full interval sequence completes */
  onComplete?: () => void
  /** Optional callback when the Stop button is clicked */
  onStop?: () => void
  /** Optional callback when timer state changes */
  onStateChange?: (state: TimerState) => void
}

export function Interval({
  intervalConfig: { sound, ...intervalConfig },
  onComplete,
  onStop,
  header,
  phaseControls,
  autoStart = false,
  onStateChange,
}: IntervalProps) {
  const { laps, lastLap, bestLap, addLap, clearHistory } = useLapHistory()
  const soundManager = useSoundManager(sound)
  const addLapCallback = useCallback(
    (elapsedTime: number) => {
      // Add a lap with the actual elapsed time
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
    onSequenceComplete: onComplete,
    onStop,
    onStateChange: onStateChange,
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
    reset(false)
    if (preStart.isEnabled) {
      preStart.start()
      return
    }
    start()
  }, [preStart, reset, start])

  const handleStop = useCallback(() => {
    if (preStart.isActive) {
      preStart.reset()
      onStop?.()
      return
    }
    // Record current lap if timer is running and we're in a work step
    if (timerState === TimerState.Running && currentStep?.isWork) {
      const elapsed = currentStep.duration - timeLeft
      addLap(elapsed)
    }
    // Stop and reset the timer
    reset()
  }, [preStart, timerState, currentStep, timeLeft, reset, addLap, onStop])

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
  const isActive = isRunning || timerState === TimerState.Paused || isPreStarting

  // Keep screen awake while interval timer is running
  useWakeLock(isRunning || preStart.state === TimerState.Running)

  const handlePause = useCallback(() => {
    if (isPreStarting) {
      preStart.pause()
      return
    }
    pause()
  }, [isPreStarting, pause, preStart])

  const endsWithRest = timerState === TimerState.Completed && intervalConfig.skipLastRest === false
  const isWorkStep = currentStep?.isWork ?? !endsWithRest
  const maxTime = (isWorkStep ? intervalConfig.workDuration : intervalConfig.restDuration) * 1000
  const progress = maxTime > 0 ? ((maxTime - timeLeft) / maxTime) * 100 : 0

  const getCurrentIntervalInfo = () => {
    const workSteps =
      timerState === TimerState.Completed
        ? intervalConfig.intervals
        : Math.ceil((currentStepIndex + 1) / 2)
    return `${workSteps} of ${intervalConfig.intervals} rounds`
  }

  const showPlayButton = isPreStarting
    ? preStart.state !== TimerState.Running
    : timerState === TimerState.Idle ||
      timerState === TimerState.Completed ||
      timerState === TimerState.Paused

  const isAutoStarting = useAutoStart(autoStart, handleStart)

  return (
    <TimerContainer fullscreen={isActive || isAutoStarting}>
      <TimerCard
        isPreStarting={isPreStarting}
        header={header}
        headerControls={
          <div className="mt-3 flex items-center justify-center gap-3 [&>button]:min-h-11 [&>button]:h-auto [&>button]:py-1 max-[400px]:gap-2 max-[400px]:[&>button]:px-3 max-[400px]:[&>button]:whitespace-normal max-[400px]:[&_svg]:hidden">
            <SkipButton
              onClick={skipCurrentStep}
              disabled={timerState !== TimerState.Running}
              text="Skip"
              title="Skip current interval"
              label="Skip current interval"
            />
            <ResetButton
              text="Restart"
              onClick={handleRestart}
              title="Restart intervals"
              label="Restart intervals"
            />
          </div>
        }
        label={
          [header ? undefined : intervalConfig.name, currentStep?.label]
            .filter(Boolean)
            .join(' · ') || 'Interval Timer'
        }
        state={isPreStarting ? preStart.state : timerState}
        time={isPreStarting ? String(preStart.secondsLeft) : formatTime(timeLeft)}
        subtitle={getCurrentIntervalInfo()}
        isWork={isPreStarting ? undefined : currentStep?.isWork}
        fullscreen={isActive || isAutoStarting}
      >
        <TimerProgressIndicator
          key={currentStepIndex}
          progress={progress}
          isRunning={isWorkStep}
          isRest={!isWorkStep}
          isVisible={!isPreStarting}
          minTime={0}
          maxTime={maxTime}
        />
        <TimerControls secondary={phaseControls}>
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
          <StopButton
            onClick={handleStop}
            disabled={!isActive}
            title="Stop intervals"
            label="Stop intervals"
          />
        </TimerControls>
      </TimerCard>
      {!isActive && (
        <LapHistory laps={laps} onClearHistory={clearHistory} bestLap={bestLap} lastLap={lastLap} />
      )}
    </TimerContainer>
  )
}
