'use client'

import { useCallback } from 'react'

import { StopwatchConfig } from '@/types/configure'
import { formatTime, getStatusMessage, TimerState, useStopwatch } from '@/lib/timer'
import { useLapHistory } from '@/lib/timer/useLapHistory'

import { TimerContainer } from '@/components/display/TimerContainer'
import { LapHistory } from './LapHistory'
import TimerButton from './TimerButton'
import { TimerCard } from './TimerCard'

interface StopwatchProps {
  config: StopwatchConfig
  /** Optional callback when stopwatch state changes */
  onStateChange?: (state: TimerState) => void
}

export function Stopwatch({
  config: { timeLimit = 0, completionMessage, name = 'Stopwatch' },
  onStateChange,
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
      <TimerCard
        label={name}
        isWork={state === TimerState.Running}
        state={state}
        time={formatTime(time)}
        subtitle={timeLimitDisplay}
      >
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
