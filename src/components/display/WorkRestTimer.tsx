'use client'

import React, { useCallback, useEffect } from 'react'
import cx from 'clsx'

import type { WorkRestConfig } from '@/types/configure'

import { useSoundManager } from '@/lib/sound/useSoundManager'
import { getDisplayData } from '@/lib/timer/displayUtils'
import { TimerPhase, TimerState } from '@/lib/timer/types'
import { useLapHistory } from '@/lib/timer/useLapHistory'
import { useWorkRestTimer } from '@/lib/timer/useWorkRestTimer'

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

  useEffect(() => {
    soundManager.syncWorkRest(state.state, state.phase, state.currentTime, state.rounds)
  }, [soundManager, state.state, state.phase, state.currentTime, state.rounds])

  const handleRestart = useCallback(async () => {
    actions.reset()
    await soundManager.init()
    actions.startWork()
  }, [actions, soundManager])

  const isRestPhase = state.phase === TimerPhase.Rest
  const showProgress = isRestPhase
  const isIdlePhase = state.phase === TimerPhase.Idle
  const isWorkPhase = state.phase === TimerPhase.Work
  const isRunningState = state.state === TimerState.Running
  const isPausedState = state.state === TimerState.Paused

  const showStartButton = isIdlePhase || isPausedState
  const showStopButton = isWorkPhase
  const showPauseButton = showStopButton && isRunningState

  const fullscreen = !isIdlePhase && !isPausedState

  const handleStop = useCallback(() => {
    if (showPauseButton) {
      actions.stopWork()
    } else if (isRestPhase) {
      actions.stopRest()
    }
  }, [state.phase, actions, showPauseButton, isRestPhase])

  const handleSkipRest = useCallback(() => {
    actions.skipRest()
  }, [actions])

  const handleStart = useCallback(async () => {
    await soundManager.init()

    if (isIdlePhase) {
      actions.startWork()
      return
    }

    actions.resumeWork()
  }, [soundManager, actions, isIdlePhase])

  const progress = actions.getProgress()
  const { isWork, time } = getDisplayData(state)
  const currentRatio = (state.ratio / 100).toFixed(2)

  return (
    <TimerContainer fullscreen={fullscreen}>
      <TimerCard
        label={`WORK/REST (r ${currentRatio}x)`}
        state={state.state}
        time={time}
        subtitle={`Round: ${state.rounds + 1}`}
        isWork={isWork}
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
                title={`${isIdlePhase ? 'Start' : 'Resume'} work`}
                label={`${isIdlePhase ? 'Start' : 'Resume'} work`}
              />
            </>
          )}
          {showPauseButton && (
            <PauseButton onClick={actions.pauseWork} title="Pause work" label="Pause work" />
          )}

          {(showStopButton || showStartButton) && (
            <StopButton
              disabled={showStartButton}
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
