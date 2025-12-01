'use client'

import React, { useEffect, useRef, useState } from 'react'

import { secondsToTimerPickerTime, TimerPickerTime, timerPickerTimeToSeconds } from '@/lib/timer'
import { cn } from '@/lib/utils'

import { TimePickerInput } from '@/components/ui/time-picker-input'

interface TimePickerProps {
  initialSeconds?: number
  onTimeChange?: (seconds: number) => void
}

export const TimePicker = ({ initialSeconds = 0, onTimeChange }: TimePickerProps) => {
  const minuteRef = useRef<HTMLInputElement>(null)
  const hourRef = useRef<HTMLInputElement>(null)
  const secondRef = useRef<HTMLInputElement>(null)

  const [time, setTime] = useState<TimerPickerTime>(() => secondsToTimerPickerTime(initialSeconds))

  // Update time when initialSeconds changes
  useEffect(() => {
    setTime(secondsToTimerPickerTime(initialSeconds))
  }, [initialSeconds])

  // Call onTimeChange whenever time changes
  useEffect(() => {
    onTimeChange?.(timerPickerTimeToSeconds(time))
  }, [time, onTimeChange])

  return (
    <div
      className={cn(
        'border-input flex w-fit grow-0 items-center justify-start overflow-hidden rounded-lg border shadow-sm',
        'focus-within:ring-ring focus-within:ring-1 focus-within:outline-none'
      )}
    >
      <div className="p-0">
        <TimePickerInput
          picker="hours"
          time={time}
          setTime={setTime}
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
          setTime={setTime}
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
          setTime={setTime}
          ref={secondRef}
          onLeftFocus={() => minuteRef.current?.focus()}
          className="border-0 bg-transparent p-0 text-center focus:bg-transparent focus:ring-0 focus:outline-none"
        />
      </div>
    </div>
  )
}

TimePicker.displayName = 'TimePicker'
