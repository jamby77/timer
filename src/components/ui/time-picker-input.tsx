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
      onKeyDown,
      picker,
      onLeftFocus,
      onRightFocus,
      ...props
    },
    ref
  ) => {
    const [flag, setFlag] = useState<boolean>(false)

    /**
     * allow the user to enter the second digit within 2 seconds
     * otherwise start again with entering first digit
     */
    useEffect(() => {
      if (flag) {
        const timer = setTimeout(() => {
          setFlag(false)
        }, 2000)

        return () => clearTimeout(timer)
      }
    }, [flag])

    const calculatedValue = useMemo(() => {
      return getTimeByType(time, picker)
    }, [time, picker])

    const calculateNewValue = (key: string) => {
      return !flag ? '0' + key : calculatedValue.slice(1, 2) + key
    }

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Tab') return
      e.preventDefault()
      if (e.key === 'ArrowRight') onRightFocus?.()
      if (e.key === 'ArrowLeft') onLeftFocus?.()
      if (['ArrowUp', 'ArrowDown'].includes(e.key)) {
        const step = e.key === 'ArrowUp' ? 1 : -1
        const newValue = getValidArrowTime(calculatedValue, step, picker)
        if (flag) setFlag(false)
        const newTime = setTimeByType(time, newValue, picker)
        setTime(newTime)
      }
      if (e.key >= '0' && e.key <= '9') {
        const newValue = calculateNewValue(e.key)
        if (flag) onRightFocus?.()
        setFlag((prev) => !prev)
        const newTime = setTimeByType(time, newValue, picker)
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
        onChange={(e) => {
          e.preventDefault()
          onChange?.(e)
        }}
        type={type}
        inputMode="decimal"
        onKeyDown={(e) => {
          onKeyDown?.(e)
          handleKeyDown(e)
        }}
        {...props}
      />
    )
  }
)

TimePickerInput.displayName = 'TimePickerInput'

export { TimePickerInput }
