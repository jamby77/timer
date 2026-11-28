import { ReactNode } from 'react'

import { TimerState } from '@/lib/enums'

import { PauseButton, ResetButton, StartButton } from '@/components/ui/timer-buttons'
import { TimerControls } from './TimerControls'

interface TimerButtonProps {
  phaseControls?: ReactNode
  state: TimerState
  onStart: () => void
  onPause: () => void
  onReset: () => void
  onRestart: () => void
}

function TimerButton({
  phaseControls,
  state,
  onStart,
  onPause,
  onReset,
  onRestart,
}: TimerButtonProps) {
  const isRunning = state === TimerState.Running
  const isCompleted = state === TimerState.Completed

  let playButton: ReactNode
  if (isCompleted) {
    playButton = <ResetButton onClick={onRestart} title="Restart timer" label="Restart timer" />
  } else if (isRunning) {
    playButton = <PauseButton onClick={onPause} title="Pause" label="Pause timer" />
  } else {
    const action = state === TimerState.Paused ? 'Resume' : 'Start'
    playButton = <StartButton onClick={onStart} title={action} label={`${action} timer`} />
  }

  return (
    <TimerControls
      key={state}
      secondary={phaseControls}
      onStop={onReset}
      stopLabel="Stop timer"
      stopDisabled={!isRunning && state !== TimerState.Paused}
      paused={state === TimerState.Paused}
    >
      {playButton}
    </TimerControls>
  )
}

export default TimerButton
