'use client'

import React, { useCallback } from 'react'
import cx from 'clsx'

import type { WorkRestTimerConfig } from '@/lib/timer/types'

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
  config?: WorkRestTimerConfig // Timer-specific configuration only
}

export function WorkRestTimer({ config = {} }: WorkRestTimerProps) {
  const { laps, lastLap, bestLap, addLap, clearHistory } = useLapHistory()

  const [state, actions] = useWorkRestTimer({
    config,
    onLapRecorded: addLap,
  })

  const handleRestart = useCallback(() => {
    actions.reset()
    actions.startWork()
  }, [actions])

  const isRestPhase = state.phase === TimerPhase.Rest
  const showProgress = isRestPhase
  const isIdlePhase = state.phase === TimerPhase.Idle
  const isWorkPhase = state.phase === TimerPhase.Work
  const isRunningState = state.state === TimerState.Running
  const isPausedState = state.state === TimerState.Paused

  const showStartButton = isIdlePhase || isPausedState
  const showStopButton = isWorkPhase
  const showPauseButton = showStopButton && isRunningState

  const handleStop = useCallback(() => {
    if (showPauseButton) {
      actions.stopWork()
    } else if (isRestPhase) {
      actions.stopRest()
    }
  }, [state.phase, actions, showPauseButton])

  const handleSkipRest = useCallback(() => {
    actions.skipRest()
  }, [actions])

  const progress = actions.getProgress()
  const { isWork, time } = getDisplayData(state)
  const currentRatio = (state.ratio / 100).toFixed(2)

  return (
    <TimerContainer>
      <TimerCard
        label={`WORK/REST (r ${currentRatio}x)`}
        state={state.state}
        time={time}
        subtitle={`Round: ${state.rounds + 1}`}
        isWork={isWork}
      >
        <Progress
          value={progress}
          className={cx('mb-4 [--progress-indicator-color:var(--tm-pr-rest-bg)]', {
            invisible: !showProgress,
          })}
        />

        {/* Main Control Buttons */}
        <div className="flex items-center justify-center gap-4">
          {showStartButton && (
            <>
              <StartButton
                onClick={isIdlePhase ? actions.startWork : actions.resumeWork}
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
        <LapHistory laps={laps} lastLap={lastLap} bestLap={bestLap} onClearHistory={clearHistory} />
      </TimerCard>
    </TimerContainer>
  )
}
