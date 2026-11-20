import { ReactNode } from 'react'

import { TimerState } from '@/lib/enums'

import { PauseButton, ResetButton, StartButton, StopButton } from '@/components/ui/timer-buttons'
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
    <TimerControls secondary={phaseControls}>
      {playButton}
      <StopButton
        onClick={onReset}
        disabled={!isRunning && state !== TimerState.Paused}
        title="Stop"
        label="Stop timer"
      />
    </TimerControls>
  )
}

export default TimerButton
