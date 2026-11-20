'use client'

import { X } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'

import type { TimerPickerTime } from '@/lib/timer'

import { secondsToTimerPickerTime, timerPickerTimeToSeconds } from '@/lib/timer'
import { cn } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import { TimePickerInput } from '@/components/ui/time-picker-input'

interface TimePickerProps {
  clearLabel?: string
  max?: number
  min?: number
  value?: number
  onTimeChange?: (seconds: number) => void
}

export const TimePicker = ({ value = 0, min, max, onTimeChange, clearLabel }: TimePickerProps) => {
  const minuteRef = useRef<HTMLInputElement>(null)
  const hourRef = useRef<HTMLInputElement>(null)
  const secondRef = useRef<HTMLInputElement>(null)
  const [time, setTime] = useState<TimerPickerTime>(() => secondsToTimerPickerTime(value))

  // Update time when value changes
  useEffect(() => {
    setTime(secondsToTimerPickerTime(value))
  }, [value])

  // Validate and clamp time within min/max bounds
  const validateTime = (newTime: TimerPickerTime): TimerPickerTime => {
    let clampedSeconds = timerPickerTimeToSeconds(newTime)

    if (min !== undefined && clampedSeconds < min) {
      clampedSeconds = min
    }
    if (max !== undefined && clampedSeconds > max) {
      clampedSeconds = max
    }

    return secondsToTimerPickerTime(clampedSeconds)
  }

  // Handle time changes with validation
  const handleTimeChange = (newTime: TimerPickerTime) => {
    const validatedTime = validateTime(newTime)
    setTime(validatedTime)
    onTimeChange?.(timerPickerTimeToSeconds(validatedTime))
  }

  return (
    <div
      className={cn(
        'border-input flex w-fit! grow-0 items-center justify-start',
        'overflow-hidden rounded-lg border shadow-sm',
        'focus-within:ring-ring focus-within:ring-1 focus-within:outline-none'
      )}
    >
      <div className="p-0">
        <TimePickerInput
          picker="hours"
          aria-label="Hours"
          time={time}
          setTime={handleTimeChange}
          ref={hourRef}
          onRightFocus={() => minuteRef.current?.focus()}
          className="border-0 bg-transparent p-0 text-center focus:bg-transparent focus:ring-0 focus:outline-none"
        />
      </div>
      <div className="h-9 px-1 text-2xl">:</div>
      <div className="p-0">
        <TimePickerInput
          picker="minutes"
          aria-label="Minutes"
          time={time}
          setTime={handleTimeChange}
          ref={minuteRef}
          onLeftFocus={() => hourRef.current?.focus()}
          onRightFocus={() => secondRef.current?.focus()}
          className="border-0 bg-transparent p-0 text-center focus:bg-transparent focus:ring-0 focus:outline-none"
        />
      </div>
      <div className="h-9 px-1 text-2xl">:</div>
      <div className="p-0">
        <TimePickerInput
          picker="seconds"
          aria-label="Seconds"
          time={time}
          setTime={handleTimeChange}
          ref={secondRef}
          onLeftFocus={() => minuteRef.current?.focus()}
          className="border-0 bg-transparent p-0 text-center focus:bg-transparent focus:ring-0 focus:outline-none"
        />
      </div>
      {clearLabel && (
        <Button
          type="button"
          variant="ghost"
          aria-label={clearLabel}
          title={clearLabel}
          className="border-input bg-destructive/20 text-destructive hover:bg-destructive/30 hover:text-destructive h-auto w-11 shrink-0 self-stretch ml-1 rounded-md border p-0 focus-visible:ring-inset max-sm:min-h-11"
          disabled={!value}
          onClick={() => handleTimeChange(secondsToTimerPickerTime(0))}
        >
          <X aria-hidden="true" />
        </Button>
      )}
    </div>
  )
}

TimePicker.displayName = 'TimePicker'
