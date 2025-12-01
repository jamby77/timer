'use client'

import React, { useEffect, useRef, useState } from 'react'

import { secondsToTimerPickerTime, TimerPickerTime, timerPickerTimeToSeconds } from '@/lib/timer'
import { cn } from '@/lib/utils'

import { TimePickerInput } from '@/components/ui/time-picker-input'

interface TimePickerProps {
  max?: number
  min?: number
  initialSeconds?: number
  onTimeChange?: (seconds: number) => void
}

export const TimePicker = ({ initialSeconds = 0, min, max, onTimeChange }: TimePickerProps) => {
  const minuteRef = useRef<HTMLInputElement>(null)
  const hourRef = useRef<HTMLInputElement>(null)
  const secondRef = useRef<HTMLInputElement>(null)

  const [time, setTime] = useState<TimerPickerTime>(() => secondsToTimerPickerTime(initialSeconds))

  // Update time when initialSeconds changes
  useEffect(() => {
    console.log('update on initialSeconds')
    setTime(secondsToTimerPickerTime(initialSeconds))
  }, [])

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
    onTimeChange?.(timerPickerTimeToSeconds(newTime))
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
          time={time}
          setTime={handleTimeChange}
          ref={secondRef}
          onLeftFocus={() => minuteRef.current?.focus()}
          className="border-0 bg-transparent p-0 text-center focus:bg-transparent focus:ring-0 focus:outline-none"
        />
      </div>
    </div>
  )
}

TimePicker.displayName = 'TimePicker'
