'use client'

import React, { useEffect, useRef, useState } from 'react'

import { secondsToTimerPickerTime, TimerPickerTime, timerPickerTimeToSeconds } from '@/lib/timer'

import { Label } from '@/components/ui/label'
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
    <div className="flex items-end gap-2">
      <div className="grid place-items-center gap-1 text-center">
        <Label htmlFor="hours" className="text-xs">
          Hours
        </Label>
        <TimePickerInput
          picker="hours"
          time={time}
          setTime={setTime}
          ref={hourRef}
          onRightFocus={() => minuteRef.current?.focus()}
        />
      </div>
      <div className="grid gap-1 text-center">
        <Label htmlFor="minutes" className="text-xs">
          Minutes
        </Label>
        <TimePickerInput
          picker="minutes"
          time={time}
          setTime={setTime}
          ref={minuteRef}
          onLeftFocus={() => hourRef.current?.focus()}
          onRightFocus={() => secondRef.current?.focus()}
        />
      </div>
      <div className="grid gap-1 text-center">
        <Label htmlFor="seconds" className="text-xs">
          Seconds
        </Label>
        <TimePickerInput
          picker="seconds"
          time={time}
          setTime={setTime}
          ref={secondRef}
          onLeftFocus={() => minuteRef.current?.focus()}
        />
      </div>
    </div>
  )
}

TimePicker.displayName = 'TimePicker'
