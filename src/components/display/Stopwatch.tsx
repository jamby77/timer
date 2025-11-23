'use client'

import { useCallback } from 'react'

import { formatTime, getStatusMessage, TimerState, useStopwatch } from '@/lib/timer'
import { useLapHistory } from '@/lib/timer/useLapHistory'

import { TimerContainer } from '@/components/display/TimerContainer'
import { LapHistory } from './LapHistory'
import TimerButton from './TimerButton'
import { TimerCard } from './TimerCard'

interface StopwatchProps {
  /** Label for the stopwatch */
  label?: string
  /** Maximum time in seconds the stopwatch will run (default: 1 year) */
  timeLimit?: number
  /** Optional callback when stopwatch state changes */
  onStateChange?: (state: TimerState) => void
  /** Optional message to show when timer completes */
  completionMessage?: string
}

export function Stopwatch({
  label = 'Stopwatch',
  timeLimit = 0,
  onStateChange,
  completionMessage,
}: StopwatchProps) {
  const { laps, addLap, clearHistory, bestLap, lastLap } = useLapHistory()

  const handleStateChange = useCallback(
    (newState: TimerState) => {
      onStateChange?.(newState)
    },
    [onStateChange]
  )

  const handleStop = useCallback(
    (elapsedTime: number) => {
      addLap(elapsedTime)
    },
    [addLap]
  )

  const { time, state, start, pause, reset, restart } = useStopwatch({
    timeLimitMs: timeLimit * 1000,
    onStateChange: handleStateChange,
    onStop: handleStop,
  })

  const handleReset = useCallback(() => {
    // Save the current elapsed time as a lap before resetting
    if (time > 0) {
      addLap(time)
    }
    reset()
  }, [time, reset, addLap])

  const handleRestart = useCallback(() => {
    restart()
  }, [restart])

  const status = getStatusMessage(state, completionMessage)
  const timeLimitDisplay = timeLimit ? `(Cap: ${formatTime(timeLimit * 1000)})` : undefined

  return (
    <TimerContainer>
      <TimerCard label={label} state={state} time={formatTime(time)} subtitle={timeLimitDisplay}>
        <TimerButton
          state={state}
          onStart={start}
          onPause={pause}
          onReset={handleReset}
          onRestart={handleRestart}
        />
      </TimerCard>
      <LapHistory laps={laps} onClearHistory={clearHistory} bestLap={bestLap} lastLap={lastLap} />
    </TimerContainer>
  )
}
