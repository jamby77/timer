'use client'

import React, { useCallback, useEffect, useState } from 'react'
import cx from 'clsx'

import { getStatusMessage } from '@/lib/timer'
import { getDisplayData } from '@/lib/timer/displayUtils'
import { TimerPhase, TimerState } from '@/lib/timer/types'
import { useLapHistory } from '@/lib/timer/useLapHistory'
import { useWorkRestTimer } from '@/lib/timer/useWorkRestTimer'

import {
  BaseButton,
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
}

export function WorkRestTimer({ className }: WorkRestTimerProps) {
  const { laps, addLap, clearHistory } = useLapHistory()
  const [ratioInteger, setRatioInteger] = useState<string>('1')
  const [ratioDecimal, setRatioDecimal] = useState<string>('00')

  const [state, actions] = useWorkRestTimer({
    onLapRecorded: addLap,
  })

  // Sync ratio inputs with state when hook ratio changes
  const syncRatioInputs = useCallback(() => {
    const ratio = state.ratio / 100
    const integer = Math.floor(ratio).toString()
    const decimal = Math.round((ratio - Math.floor(ratio)) * 100)
      .toString()
      .padStart(2, '0')
    setRatioInteger(integer)
    setRatioDecimal(decimal)
  }, [state.ratio])

  // Sync inputs when hook state changes
  useEffect(() => {
    syncRatioInputs()
  }, [state.ratio, syncRatioInputs])

  // Update inputs when ratio changes from external sources
  const handleRatioInputChange = useCallback(
    (integer: string, decimal: string) => {
      const newRatio = parseFloat(`${integer}.${decimal.padEnd(2, '0')}`)
      if (!isNaN(newRatio) && newRatio >= 0.01 && newRatio <= 100) {
        actions.setRatio(newRatio)
      }
    },
    [actions.setRatio]
  )

  const handleIntegerChange = useCallback(
    (value: string) => {
      // Validate input
      if (value === '' || value === '-') {
        setRatioInteger('0')
        return
      }

      const intValue = parseInt(value) || 0
      if (intValue >= 0 && intValue <= 100) {
        setRatioInteger(value)
        handleRatioInputChange(value, ratioDecimal)
      }
    },
    [ratioDecimal, handleRatioInputChange]
  )

  const handleDecimalChange = useCallback(
    (value: string) => {
      // Validate input - only allow 2 digits
      if (value === '' || value === '-') {
        setRatioDecimal('00')
        return
      }

      const decValue = value.slice(0, 2)
      setRatioDecimal(decValue)
      handleRatioInputChange(ratioInteger, decValue)
    },
    [ratioInteger, handleRatioInputChange]
  )

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

  const handleAdjustRatio = useCallback(
    (delta: number) => {
      actions.adjustRatio(delta)
      // Remove manual sync - useEffect will handle it
    },
    [actions.adjustRatio]
  )

  const handleResetRatio = useCallback(() => {
    actions.resetRatio()
    // Remove manual state setting - useEffect will handle sync
  }, [actions.resetRatio])

  const status = getStatusMessage(state.state)

  const displayData = getDisplayData(state, actions.getProgress)
  const currentRatio = (state.ratio / 100).toFixed(2)

  return (
    <div className={cx('flex flex-col items-center gap-8', className)}>
      <TimerCard
        label={`WORK/REST (r ${currentRatio}x)`}
        status={status}
        time={displayData.time}
        subtitle={`Round: ${state.rounds + 1}`}
        currentStep={{ isWork: displayData.isWork } as any}
      >
        <div
          className={cx('mb-4 h-2 w-full rounded-full bg-gray-200', {
            invisible: state.phase === TimerPhase.Idle,
          })}
        >
          <div
            className={cx('h-2 rounded-full transition-all duration-100', {
              'bg-emerald-700': displayData.isWork,
              'bg-rose-700': !displayData.isWork && state.phase !== TimerPhase.Idle,
            })}
            style={{ width: `${displayData.progress}%` }}
          />
        </div>

        {/* Main Control Buttons */}
        <div className="mb-4 flex gap-4">
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

        {/* Ratio Controls */}
        <div className="mb-4 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Ratio:</label>
            <div className="flex items-center gap-1">
              <label className="sr-only">Ratio integer part</label>
              <input
                type="number"
                min="0"
                max="100"
                value={ratioInteger}
                onChange={(e) => handleIntegerChange(e.target.value)}
                disabled={state.phase !== TimerPhase.Idle}
                aria-label="Ratio integer part"
                className="w-12 rounded border border-gray-300 px-1 py-1 text-center focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100 disabled:text-gray-500"
              />
              <span className="text-gray-500">.</span>
              <label className="sr-only">Ratio decimal part</label>
              <input
                type="number"
                min="0"
                max="99"
                value={ratioDecimal}
                onChange={(e) => handleDecimalChange(e.target.value)}
                disabled={state.phase !== TimerPhase.Idle}
                aria-label="Ratio decimal part"
                className="w-12 rounded border border-gray-300 px-1 py-1 text-center focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100 disabled:text-gray-500"
              />
              <span className="text-sm text-gray-700">x</span>
            </div>
          </div>

          {/* Quick Adjustment Buttons */}
          <div className="flex justify-center gap-2">
            <BaseButton
              onClick={() => handleAdjustRatio(100)} // +1.0
              title="Increase ratio by 1.0"
              label="+1.0"
              disabled={state.phase !== TimerPhase.Idle}
              className="bg-gray-500 px-2 py-1 text-xs hover:bg-gray-600 disabled:bg-gray-300"
            >
              +1.0
            </BaseButton>
            <BaseButton
              onClick={() => handleAdjustRatio(1)} // +0.01
              title="Increase ratio by 0.01"
              label="+0.01"
              disabled={state.phase !== TimerPhase.Idle}
              className="bg-gray-500 px-2 py-1 text-xs hover:bg-gray-600 disabled:bg-gray-300"
            >
              +0.01
            </BaseButton>
            <BaseButton
              onClick={() => handleAdjustRatio(-1)} // -0.01
              title="Decrease ratio by 0.01"
              label="-0.01"
              disabled={state.phase !== TimerPhase.Idle}
              className="bg-gray-500 px-2 py-1 text-xs hover:bg-gray-600 disabled:bg-gray-300"
            >
              -0.01
            </BaseButton>
            <BaseButton
              onClick={() => handleAdjustRatio(-100)} // -1.0
              title="Decrease ratio by 1.0"
              label="-1.0"
              disabled={state.phase !== TimerPhase.Idle}
              className="bg-gray-500 px-2 py-1 text-xs hover:bg-gray-600 disabled:bg-gray-300"
            >
              -1.0
            </BaseButton>
            <BaseButton
              onClick={handleResetRatio}
              title="Reset ratio to 1.0"
              label="Reset 1x"
              disabled={state.phase !== TimerPhase.Idle}
              className="bg-purple-700 px-2 py-1 text-xs hover:bg-purple-800 disabled:bg-gray-300"
            >
              Reset 1x
            </BaseButton>
          </div>
        </div>

        <LapHistory laps={laps} onClearHistory={clearHistory} />
      </TimerCard>
    </div>
  )
}
