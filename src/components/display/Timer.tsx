'use client'

import { useCallback } from 'react'
import { toast } from 'sonner'

import { CountdownConfig } from '@/types/configure'
import { formatTime, TimerState, useTimer } from '@/lib/timer'
import { useLapHistory } from '@/lib/timer/useLapHistory'

import { TimerContainer } from '@/components/display/TimerContainer'
import { LapHistory } from './LapHistory'
import TimerButton from './TimerButton'
import { TimerCard } from './TimerCard'

interface TimerProps {
  config: CountdownConfig
  /** Optional callback when timer state changes */
  onStateChange?: (state: TimerState) => void
}

export const Timer = ({
  config: { duration, completionMessage, name = 'Timer' },
  onStateChange,
}: TimerProps) => {
  const { laps, addLap, clearHistory, lastLap, bestLap } = useLapHistory()

  const handleStateChange = useCallback(
    (newState: TimerState, elapsed: number) => {
      // When timer completes, record the full duration as a lap
      if (newState === TimerState.Completed && elapsed > 0) {
        addLap(duration * 1000)
      }
      onStateChange?.(newState)
    },
    [duration, addLap, onStateChange]
  )
  const handleComplete = useCallback(() => {
    toast.success('Timer finished', {
      description: completionMessage,
    })
  }, [completionMessage])

  const { time, state, totalElapsedTime, start, pause, reset, restart } = useTimer(
    duration * 1000,
    {
      onStateChange: handleStateChange,
      onComplete: handleComplete,
    }
  )
  const handleReset = () => {
    // Save the total elapsed time as a lap before resetting
    if (totalElapsedTime > 0) {
      addLap(totalElapsedTime)
    }
    reset()
  }

  const handleRestart = () => {
    restart()
  }

  return (
    <TimerContainer>
      <TimerCard label={name} state={state} time={formatTime(time)}>
        <TimerButton
          state={state}
          onStart={start}
          onPause={pause}
          onReset={handleReset}
          onRestart={handleRestart}
        />
      </TimerCard>
      <LapHistory laps={laps} onClearHistory={clearHistory} lastLap={lastLap} bestLap={bestLap} />
    </TimerContainer>
  )
}
