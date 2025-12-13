'use client'

import { useCallback, useEffect } from 'react'

import { StopwatchConfig } from '@/types/configure'
import { useSoundManager } from '@/lib/sound/useSoundManager'
import { formatTime, TimerState, useStopwatch } from '@/lib/timer'
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
  config: { timeLimit = 0, name = 'Stopwatch', sound },
  onStateChange,
}: StopwatchProps) {
  const { laps, addLap, clearHistory, bestLap, lastLap } = useLapHistory()
  const soundManager = useSoundManager(sound)

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

  useEffect(() => {
    soundManager.syncStopwatch(state, time)
  }, [soundManager, state, time])

  const isRunning = state === TimerState.Running

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

  const handleStart = useCallback(async () => {
    await soundManager.init()
    start()
  }, [soundManager, start])
  const timeLimitDisplay = timeLimit ? `(Cap: ${formatTime(timeLimit * 1000)})` : undefined

  return (
    <TimerContainer fullscreen={isRunning}>
      <TimerCard
        label={name}
        isWork={isRunning}
        state={state}
        time={formatTime(time)}
        subtitle={timeLimitDisplay}
        fullscreen={isRunning}
      >
        <TimerButton
          state={state}
          onStart={handleStart}
          onPause={pause}
          onReset={handleReset}
          onRestart={handleRestart}
        />
      </TimerCard>
      {!isRunning && (
        <LapHistory laps={laps} onClearHistory={clearHistory} bestLap={bestLap} lastLap={lastLap} />
      )}
    </TimerContainer>
  )
}
