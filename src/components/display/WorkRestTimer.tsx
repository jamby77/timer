'use client'

import React, { useCallback, useEffect } from 'react'
import cx from 'clsx'

import type { WorkRestConfig } from '@/types/configure'

import { TimerState as BaseTimerState } from '@/lib/timer'
import { getDisplayData } from '@/lib/timer/displayUtils'
import { TimerPhase, TimerState } from '@/lib/timer/types'
import { useLapHistory, usePreStartCountdown, useSoundManager, useWorkRestTimer } from '@/hooks'

import { Progress } from '@/components/ui/progress'
import {
  PauseButton,
  ResetButton,
  SkipButton,
  StartButton,
  StopButton,
} from '@/components/ui/timer-buttons'
import { LapHistory } from './LapHistory'
import { TimerCard } from './TimerCard'
import { TimerContainer } from './TimerContainer'

interface WorkRestTimerProps {
  config: WorkRestConfig
}

export function WorkRestTimer({ config: { sound, ...config } }: WorkRestTimerProps) {
  const { laps, lastLap, bestLap, addLap, clearHistory } = useLapHistory()
  const soundManager = useSoundManager(sound)

  const [state, actions] = useWorkRestTimer({
    config,
    onLapRecorded: addLap,
  })

  const preStart = usePreStartCountdown({
    seconds: config.countdownBeforeStart,
    onComplete: () => {
      soundManager.reset()
      actions.startWork()
    },
  })

  useEffect(() => {
    if (preStart.isActive) {
      soundManager.syncPreStartCountdown(preStart.timeLeftMs)
      return
    }
    soundManager.syncWorkRest(state.state, state.phase, state.currentTime, state.rounds)
  }, [
    soundManager,
    state.state,
    state.phase,
    state.currentTime,
    state.rounds,
    preStart.isActive,
    preStart.timeLeftMs,
  ])

  const handleRestart = useCallback(async () => {
    actions.reset()
    await soundManager.init()
    if (preStart.isEnabled) {
      preStart.start()
      return
    }
    actions.startWork()
  }, [actions, soundManager, preStart])

  const isRestPhase = state.phase === TimerPhase.Rest
  const showProgress = isRestPhase
  const isIdlePhase = state.phase === TimerPhase.Idle
  const isWorkPhase = state.phase === TimerPhase.Work
  const isRunningState = state.state === TimerState.Running
  const isPausedState = state.state === TimerState.Paused

  const isPreStarting = preStart.isActive
  const isPreStartRunning = preStart.state === BaseTimerState.Running
  const isPreStartPaused = preStart.state === BaseTimerState.Paused

  const showStartButton = isPreStarting ? isPreStartPaused : isIdlePhase || isPausedState
  const showStopButton = isPreStarting ? true : isWorkPhase
  const showPauseButton = isPreStarting ? isPreStartRunning : isWorkPhase && isRunningState

  const fullscreen = (!isIdlePhase && !isPausedState) || isPreStarting

  const handleStop = useCallback(() => {
    if (isPreStarting) {
      preStart.reset()
      return
    }
    if (showPauseButton) {
      actions.stopWork()
    } else if (isRestPhase) {
      actions.stopRest()
    }
  }, [isPreStarting, preStart, showPauseButton, actions, isRestPhase])

  const handleSkipRest = useCallback(() => {
    actions.skipRest()
  }, [actions])

  const handleStart = useCallback(async () => {
    await soundManager.init()

    if (isPreStarting) {
      preStart.start()
      return
    }

    if (isIdlePhase) {
      if (preStart.isEnabled) {
        preStart.start()
        return
      }
      actions.startWork()
      return
    }

    actions.resumeWork()
  }, [soundManager, actions, isIdlePhase, preStart, isPreStarting])

  const progress = actions.getProgress()
  const { isWork, time } = getDisplayData(state)
  const currentRatio = (state.ratio / 100).toFixed(2)
  const displayTime = isPreStarting ? String(preStart.secondsLeft) : time
  const displayState = isPreStarting ? preStart.state : state.state
  const displayIsWork = isPreStarting ? undefined : isWork

  return (
    <TimerContainer fullscreen={fullscreen}>
      <TimerCard
        label={`WORK/REST (r ${currentRatio}x)`}
        state={displayState}
        time={displayTime}
        subtitle={`Round: ${state.rounds + 1}`}
        isWork={displayIsWork}
        fullscreen={fullscreen}
      >
        <Progress
          value={progress}
          className={cx('mb-4 [--progress-indicator-color:var(--tm-pr-rest-bg)]', {
            invisible: !showProgress || fullscreen,
          })}
        />

        {/* Main Control Buttons */}
        <div className="flex items-center justify-center gap-4">
          {showStartButton && (
            <>
              <StartButton
                onClick={handleStart}
                title={
                  isPreStarting ? 'Resume countdown' : `${isIdlePhase ? 'Start' : 'Resume'} work`
                }
                label={
                  isPreStarting ? 'Resume countdown' : `${isIdlePhase ? 'Start' : 'Resume'} work`
                }
              />
            </>
          )}
          {showPauseButton && (
            <PauseButton
              onClick={isPreStarting ? preStart.pause : actions.pauseWork}
              title={isPreStarting ? 'Pause countdown' : 'Pause work'}
              label={isPreStarting ? 'Pause countdown' : 'Pause work'}
            />
          )}

          {(showStopButton || showStartButton) && (
            <StopButton
              disabled={showStartButton && !isPreStarting}
              onClick={handleStop}
              title="Stop work"
              label="Stop work"
            />
          )}

          {isRestPhase && (
            <>
              <SkipButton onClick={handleSkipRest} title="Skip rest" label="Skip rest" />
              <StopButton onClick={handleStop} title="Stop rest" label="Stop rest" />
            </>
          )}

          <ResetButton
            onClick={handleRestart}
            title="Restart"
            label="Restart"
            disabled={isIdlePhase}
          />
        </div>
        {!fullscreen && (
          <LapHistory
            laps={laps}
            lastLap={lastLap}
            bestLap={bestLap}
            onClearHistory={clearHistory}
          />
        )}
      </TimerCard>
    </TimerContainer>
  )
}
