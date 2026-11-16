import { ReactNode } from 'react'

interface TimerControlsProps {
  children: ReactNode
  secondary?: ReactNode
}

export function TimerControls({ children, secondary }: TimerControlsProps) {
  return (
    <div className="timer-controls">
      <div className="timer-controls-secondary">{secondary}</div>
      <div className="timer-controls-primary">{children}</div>
    </div>
  )
}
