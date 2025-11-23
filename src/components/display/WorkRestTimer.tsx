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

interface WorkRestTimerProps {
  className?: string
  config?: WorkRestTimerConfig // Timer-specific configuration only
}

export function WorkRestTimer({ className, config = {} }: WorkRestTimerProps) {
  const { laps, lastLap, bestLap, addLap, clearHistory } = useLapHistory()

  const [state, actions] = useWorkRestTimer({
    config,
    onLapRecorded: addLap,
  })

  const handleRestart = useCallback(() => {
    actions.reset()
    actions.startWork()
  }, [actions])

  const handleStop = useCallback(() => {
    if (state.phase === TimerPhase.Work && state.state === TimerState.Running) {
      actions.stopWork()
    } else if (state.phase === TimerPhase.Rest) {
      actions.stopRest()
    }
  }, [state.phase, state.state, actions])

  const handleSkipRest = useCallback(() => {
    actions.skipRest()
  }, [actions])

  const progress = actions.getProgress()
  const { isWork, time } = getDisplayData(state)
  const currentRatio = (state.ratio / 100).toFixed(2)

  const showProgress = state.phase === TimerPhase.Rest
  return (
    <div className={cx('flex flex-col items-center gap-8', className)}>
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
          {state.phase === TimerPhase.Idle || state.state === TimerState.Paused ? (
            <StartButton
              onClick={state.phase === TimerPhase.Idle ? actions.startWork : actions.resumeWork}
              title={state.phase === TimerPhase.Idle ? 'Start work' : 'Resume work'}
              label={state.phase === TimerPhase.Idle ? 'Start work' : 'Resume work'}
            />
          ) : state.phase === TimerPhase.Work && state.state === TimerState.Running ? (
            <PauseButton onClick={actions.pauseWork} title="Pause work" label="Pause work" />
          ) : null}

          {state.phase === TimerPhase.Work && (
            <StopButton onClick={handleStop} title="Stop work" label="Stop work" />
          )}

          {state.phase === TimerPhase.Rest && (
            <>
              <SkipButton onClick={handleSkipRest} title="Skip rest" label="Skip rest" />
              <StopButton onClick={handleStop} title="Stop rest" label="Stop rest" />
            </>
          )}

          <ResetButton
            onClick={handleRestart}
            title="Restart"
            label="Restart"
            disabled={state.phase === TimerPhase.Idle}
          />
        </div>
        <LapHistory laps={laps} lastLap={lastLap} bestLap={bestLap} onClearHistory={clearHistory} />
      </TimerCard>
    </div>
  )
}
