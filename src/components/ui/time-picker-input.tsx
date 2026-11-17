import React, { forwardRef, useEffect, useMemo, useState } from 'react'

import type { InputHTMLAttributes, KeyboardEvent } from 'react'

import {
  createDefaultTime,
  getTimeByType,
  getValidArrowTime,
  setTimeByType,
  TimePickerType,
  TimerPickerTime,
} from '@/lib/timer'
import { cn } from '@/lib/utils'

import { Input } from '@/components/ui/input'

export interface TimePickerInputProps extends InputHTMLAttributes<HTMLInputElement> {
  picker: TimePickerType
  time: TimerPickerTime
  setTime: (time: TimerPickerTime) => void
  onRightFocus?: () => void
  onLeftFocus?: () => void
}

const TimePickerInput = forwardRef<HTMLInputElement, TimePickerInputProps>(
  (
    {
      className,
      type = 'tel',
      value,
      id,
      name,
      time = createDefaultTime(),
      setTime,
      onChange,
      onInput,
      onKeyDown,
      onBlur,
      picker,
      onLeftFocus,
      onRightFocus,
      ...props
    },
    ref
  ) => {
    const [pendingEntry, setPendingEntry] = useState<{
      digit: string
      time: TimerPickerTime
    } | null>(null)

    useEffect(() => {
      if (pendingEntry) {
        const timer = setTimeout(() => {
          setPendingEntry(null)
        }, 2000)

        return () => clearTimeout(timer)
      }
    }, [pendingEntry])

    const calculatedValue = useMemo(() => {
      return getTimeByType(time, picker)
    }, [time, picker])

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.defaultPrevented) return
      if (e.metaKey || e.ctrlKey || e.altKey || ['Tab', 'Backspace', 'Delete'].includes(e.key)) {
        setPendingEntry(null)
        return
      }
      e.preventDefault()
      if (e.key === 'ArrowRight') onRightFocus?.()
      if (e.key === 'ArrowLeft') onLeftFocus?.()
      if (['ArrowUp', 'ArrowDown'].includes(e.key)) {
        const step = e.key === 'ArrowUp' ? 1 : -1
        const newValue = getValidArrowTime(calculatedValue, step, picker)
        setPendingEntry(null)
        const newTime = setTimeByType(time, newValue, picker)
        setTime(newTime)
      }
      if (e.key >= '0' && e.key <= '9') {
        const newValue = pendingEntry ? pendingEntry.digit + e.key : '0' + e.key
        const newTime = setTimeByType(pendingEntry?.time ?? time, newValue, picker)
        if (pendingEntry) onRightFocus?.()
        setPendingEntry(pendingEntry ? null : { digit: e.key, time: { ...time } })
        setTime(newTime)
      }
    }

    return (
      <Input
        ref={ref}
        id={id || picker}
        name={name || picker}
        className={cn(
          'focus:bg-accent focus:text-accent-foreground w-10 text-center font-mono text-base tabular-nums caret-transparent [&::-webkit-inner-spin-button]:appearance-none',
          className
        )}
        value={value || calculatedValue}
        onChange={onChange}
        onInput={(e) => {
          setPendingEntry(null)
          if (/^\d*$/.test(e.currentTarget.value)) {
            setTime(setTimeByType(time, e.currentTarget.value || '0', picker))
          }
          onInput?.(e)
        }}
        type={type}
        inputMode="decimal"
        onKeyDown={(e) => {
          onKeyDown?.(e)
          handleKeyDown(e)
        }}
        onBlur={(event) => {
          setPendingEntry(null)
          onBlur?.(event)
        }}
        {...props}
      />
    )
  }
)

TimePickerInput.displayName = 'TimePickerInput'

export { TimePickerInput }
