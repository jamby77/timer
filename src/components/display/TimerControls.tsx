import { useLayoutEffect, useRef, useState } from 'react'

import type { ReactNode } from 'react'

import { StopButton } from '@/components/ui/timer-buttons'

interface TimerControlsProps {
  children: ReactNode
  secondary?: ReactNode
  onStop: () => void
  stopLabel: string
  stopDisabled: boolean
  paused: boolean
}

export function TimerControls({
  children,
  secondary,
  onStop,
  stopLabel,
  stopDisabled,
  paused,
}: TimerControlsProps) {
  const [confirming, setConfirming] = useState(false)
  const safeChoice = useRef<HTMLButtonElement>(null)
  const primary = useRef<HTMLDivElement>(null)
  const restoreFocus = useRef(false)

  useLayoutEffect(() => {
    if (confirming) safeChoice.current?.focus({ preventScroll: true })
    else if (restoreFocus.current) {
      primary.current
        ?.querySelector<HTMLButtonElement>('button:last-child')
        ?.focus({ preventScroll: true })
      restoreFocus.current = false
    }
  }, [confirming])

  function dismiss() {
    restoreFocus.current = true
    setConfirming(false)
  }

  if (confirming) {
    return (
      <div
        role="group"
        aria-label="End timer?"
        className="flex h-11 items-center gap-2 px-3 text-sm font-semibold"
        onKeyDown={(event) => {
          if (event.key === 'Escape') dismiss()
        }}
      >
        <span className="mr-auto">End timer?</span>
        <button
          type="button"
          className="h-11 rounded-full border border-current px-3"
          onClick={() => {
            setConfirming(false)
            onStop()
          }}
        >
          End
        </button>
        <button
          type="button"
          ref={safeChoice}
          className="bg-foreground text-background h-11 rounded-full px-3"
          onClick={dismiss}
        >
          {paused ? 'Stay paused' : 'Keep going'}
        </button>
      </div>
    )
  }

  return (
    <div className="timer-controls px-3">
      <div className="timer-controls-secondary">{secondary}</div>
      <div className="timer-controls-primary" ref={primary}>
        {children}
        <StopButton
          onClick={() => setConfirming(true)}
          disabled={stopDisabled}
          title={stopLabel}
          label={stopLabel}
        />
      </div>
    </div>
  )
}
