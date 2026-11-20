'use client'

import { useCallback, useEffect, useRef } from 'react'

import type { ReactNode } from 'react'
import type { WorkRestConfig } from '@/types/configure'

import { formatDuration } from '@/lib/configure/utils'
import { TimerPhase, TimerState, WorkRestMode } from '@/lib/enums'
import { getDisplayData } from '@/lib/timer/displayUtils'
import {
  useAutoStart,
  useLapHistory,
  usePreStartCountdown,
  useSoundManager,
  useWakeLock,
  useWorkRestTimer,
} from '@/hooks'

import {
  PauseButton,
  ResetButton,
  SkipButton,
  StartButton,
  StopButton,
} from '@/components/ui/timer-buttons'
import { TimerProgressIndicator } from '@/components/display/TimerProgressIndicator'
import { LapHistory } from './LapHistory'
import { TimerCard } from './TimerCard'
import { TimerContainer } from './TimerContainer'
import { TimerControls } from './TimerControls'

interface WorkRestTimerProps {
  autoStart?: boolean
  header?: ReactNode
  phaseControls?: ReactNode
  config: WorkRestConfig
  /** Optional callback invoked when a full work/rest cycle completes */
  onPhaseComplete?: () => void
  /** Optional callback when the Stop button is clicked */
  onStop?: () => void
  /** Optional callback when timer state changes */
  onStateChange?: (state: TimerState) => void
}

export function WorkRestTimer({
  config: { sound, ...config },
  onPhaseComplete,
  onStop,
  header,
  phaseControls,
  autoStart = false,
  onStateChange,
}: WorkRestTimerProps) {
  const { laps, lastLap, bestLap, addLap, clearHistory } = useLapHistory()
  const soundManager = useSoundManager(sound)

  const lastCompletedRoundsRef = useRef(0)

  const [state, actions] = useWorkRestTimer({
    config,
    onLapRecorded: addLap,
    onStop,
    onStateChange,
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

  useEffect(() => {
    if (!onPhaseComplete) return
    if (state.phase !== TimerPhase.Completed) return
    if (state.rounds <= lastCompletedRoundsRef.current) return
    lastCompletedRoundsRef.current = state.rounds
    onPhaseComplete()
  }, [onPhaseComplete, state.phase, state.rounds])

  useEffect(() => {
    if (state.rounds === 0) {
      lastCompletedRoundsRef.current = 0
    }
  }, [state.rounds])

  const handleRestart = useCallback(async () => {
    await soundManager.init()
    soundManager.reset()
    if (preStart.isEnabled) {
      actions.reset()
      preStart.start()
      return
    }
    actions.restart()
  }, [actions, soundManager, preStart])

  const isRestPhase = state.phase === TimerPhase.Rest
  const isIdlePhase = state.phase === TimerPhase.Idle
  const isCompletedPhase = state.phase === TimerPhase.Completed
  const isWorkPhase = state.phase === TimerPhase.Work
  const isRunningState = state.state === TimerState.Running
  const isPausedState = state.state === TimerState.Paused

  // Keep screen awake while work/rest timer is running
  useWakeLock(isRunningState || preStart.state === TimerState.Running)

  const isPreStarting = preStart.isActive
  const isPreStartRunning = preStart.state === TimerState.Running
  const isPreStartPaused = preStart.state === TimerState.Paused

  const showStartButton = isPreStarting
    ? isPreStartPaused
    : isIdlePhase || isCompletedPhase || isPausedState
  const showStopButton = isPreStarting ? true : isWorkPhase
  const showPauseButton = isPreStarting ? isPreStartRunning : isWorkPhase && isRunningState

  const fullscreen = (!isIdlePhase && !isCompletedPhase) || isPreStarting

  const handleStop = useCallback(() => {
    if (isPreStarting) {
      preStart.reset()
      onStop?.()
      return
    }
    actions.stopExecution()
  }, [isPreStarting, preStart, actions, onStop])

  const handleSkipRest = useCallback(() => {
    actions.skipRest()
  }, [actions])

  const handleStart = useCallback(async () => {
    await soundManager.init()

    if (isPreStarting) {
      preStart.start()
      return
    }

    if (isCompletedPhase) {
      if (preStart.isEnabled) {
        actions.reset()
        preStart.start()
      } else {
        actions.restart()
      }
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
  }, [soundManager, actions, isIdlePhase, isCompletedPhase, preStart, isPreStarting])

  const progress = actions.getProgress()
  const { isWork, time } = getDisplayData(state)
  const restSetting =
    state.restMode === WorkRestMode.FIXED && state.fixedRestDuration
      ? `${formatDuration(state.fixedRestDuration, { exact: true })} fixed rest`
      : `r ${(state.ratio / 100).toFixed(2)}x`
  const displayTime = isPreStarting ? String(preStart.secondsLeft) : time
  const displayState = isPreStarting ? preStart.state : state.state
  const displayIsWork = isPreStarting ? undefined : isWork

  const minTime = 0
  const maxTime = (() => {
    if (!isRestPhase) return 0
    if (!Number.isFinite(progress) || progress <= 0) {
      return state.currentTime
    }
    const denom = 1 - progress / 100
    if (denom <= 0) return state.currentTime
    return Math.round(state.currentTime / denom)
  })()

  const isVisible = isRestPhase && !isPreStarting

  const isAutoStarting = useAutoStart(autoStart, handleStart)

  return (
    <TimerContainer fullscreen={fullscreen || isAutoStarting}>
      <TimerCard
        isPreStarting={isPreStarting}
        header={header}
        headerControls={
          <div className="mt-3 flex items-center justify-center gap-3 [&>button]:size-11">
            {isRestPhase ? (
              <SkipButton onClick={handleSkipRest} title="Skip rest" label="Skip rest" />
            ) : (
              <SkipButton
                onClick={actions.finishWork}
                disabled={!isWorkPhase || isPreStarting}
                title="Finish work / Start rest"
                label="Finish work / Start rest"
              />
            )}
            <ResetButton
              onClick={handleRestart}
              title="Restart"
              label="Restart"
              disabled={isIdlePhase && state.rounds === 0}
            />
          </div>
        }
        label={[header ? undefined : config.name, `WORK/REST (${restSetting})`]
          .filter(Boolean)
          .join(' · ')}
        state={displayState}
        time={displayTime}
        subtitle={`Round ${Math.min(state.rounds + 1, state.maxRounds)} of ${state.maxRounds}`}
        isWork={displayIsWork}
        fullscreen={fullscreen || isAutoStarting}
      >
        <TimerProgressIndicator
          progress={progress}
          isRunning={false}
          isRest={true}
          isVisible={isVisible}
          minTime={minTime}
          maxTime={maxTime}
        />

        {/* Main Control Buttons */}
        <TimerControls secondary={phaseControls}>
          {showStartButton && (
            <>
              <StartButton
                onClick={handleStart}
                title={
                  isPreStarting
                    ? 'Resume countdown'
                    : `${isIdlePhase || isCompletedPhase ? 'Start' : 'Resume'} work`
                }
                label={
                  isPreStarting
                    ? 'Resume countdown'
                    : `${isIdlePhase || isCompletedPhase ? 'Start' : 'Resume'} work`
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
              disabled={(isIdlePhase || isCompletedPhase) && !isPreStarting}
              onClick={handleStop}
              title="Stop work"
              label="Stop work"
            />
          )}

          {isRestPhase && (
            <>
              <StopButton onClick={handleStop} title="Stop rest" label="Stop rest" />
            </>
          )}
        </TimerControls>
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
