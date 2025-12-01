import { TimerState } from '@/lib/enums'

/**
 * Format time (seconds or milliseconds) to MM:SS.MS format (with 2-digit milliseconds)
 */
export const formatTime = (time: number): string => {
  const totalSeconds = Math.floor(time / 1000)
  const milliseconds = Math.round((time % 1000) / 10) // Convert to 2-digit (0-99)
  const mins = Math.floor(totalSeconds / 60)
  const secs = totalSeconds % 60
  const msStr = milliseconds.toString().padStart(2, '0').slice(0, 2)
  let minStr = mins.toString().padStart(2, '0')
  let secStr = secs.toString().padStart(2, '0')
  return `${minStr}:${secStr}.${msStr}`
}

export const parseTimeToMs = (timeString: string): number => {
  const [minutes, seconds] = timeString.split(':').map(Number)
  return (minutes * 60 + seconds) * 1000
}

export function getStatusMessage(state: TimerState, completionMessage?: string): string {
  switch (state) {
    case TimerState.Running:
      return 'Running...'
    case TimerState.Paused:
      return 'Paused'
    case TimerState.Completed:
      return completionMessage || 'Completed'
    case TimerState.Idle:
    default:
      return 'Ready'
  }
}

/**
 * regular expression to check for valid hour format (01-99)
 */
export function isValidHour(value: string) {
  return /^(0[0-9]|[1-9][0-9])$/.test(value)
}

/**
 * regular expression to check for valid minute format (00-59)
 */
export function isValidMinuteOrSecond(value: string) {
  return /^[0-5][0-9]$/.test(value)
}

type GetValidNumberConfig = { max: number; min?: number; loop?: boolean }

export function getValidNumber(
  value: string,
  { max, min = 0, loop = false }: GetValidNumberConfig
) {
  let numericValue = parseInt(value, 10)

  if (!isNaN(numericValue)) {
    if (!loop) {
      if (numericValue > max) numericValue = max
      if (numericValue < min) numericValue = min
    } else {
      if (numericValue > max) numericValue = min
      if (numericValue < min) numericValue = max
    }
    return numericValue.toString().padStart(2, '0')
  }

  return '00'
}

export function getValidHour(value: string) {
  if (isValidHour(value)) return value
  return getValidNumber(value, { max: 99 })
}

export function getValidMinuteOrSecond(value: string) {
  if (isValidMinuteOrSecond(value)) return value
  return getValidNumber(value, { max: 59 })
}

type GetValidArrowNumberConfig = {
  min: number
  max: number
  step: number
}

export function getValidArrowNumber(value: string, { min, max, step }: GetValidArrowNumberConfig) {
  let numericValue = parseInt(value, 10)
  if (!isNaN(numericValue)) {
    numericValue += step
    return getValidNumber(String(numericValue), { min, max, loop: true })
  }
  return '00'
}

export function getValidArrowHour(value: string, step: number) {
  return getValidArrowNumber(value, { min: 0, max: 99, step })
}

export function getValidArrowMinuteOrSecond(value: string, step: number) {
  return getValidArrowNumber(value, { min: 0, max: 59, step })
}

export type TimePickerType = 'minutes' | 'seconds' | 'hours'

export interface TimerPickerTime {
  hours: number // 0-99
  minutes: number // 0-59
  seconds: number // 0-59
}

// Custom time utility functions for TimerPickerTime
export function getTimeByType(time: TimerPickerTime, type: TimePickerType): string {
  switch (type) {
    case 'minutes':
      return getValidMinuteOrSecond(String(time.minutes))
    case 'seconds':
      return getValidMinuteOrSecond(String(time.seconds))
    case 'hours':
      return getValidHour(String(time.hours))
    default:
      return '00'
  }
}

export function setTimeByType(time: TimerPickerTime, value: string, type: TimePickerType): TimerPickerTime {
  const newTime = { ...time }
  const numericValue = parseInt(value, 10)

  switch (type) {
    case 'minutes':
      newTime.minutes = Math.min(59, Math.max(0, numericValue))
      break
    case 'seconds':
      newTime.seconds = Math.min(59, Math.max(0, numericValue))
      break
    case 'hours':
      newTime.hours = Math.min(99, Math.max(0, numericValue))
      break
  }

  return newTime
}

export function getValidArrowTime(
  currentValue: string,
  step: number,
  type: TimePickerType
): string {
  switch (type) {
    case 'minutes':
      return getValidArrowMinuteOrSecond(currentValue, step)
    case 'seconds':
      return getValidArrowMinuteOrSecond(currentValue, step)
    case 'hours':
      return getValidArrowHour(currentValue, step)
    default:
      return '00'
  }
}

export function createDefaultTime(): TimerPickerTime {
  return {
    hours: 0,
    minutes: 0,
    seconds: 0,
  }
}

export function secondsToTimerPickerTime(seconds: number): TimerPickerTime {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60
  
  return {
    hours: Math.min(99, hours), // Cap at 99 as per TimerPickerTime interface
    minutes,
    seconds: remainingSeconds,
  }
}

export function timerPickerTimeToSeconds(time: TimerPickerTime): number {
  return time.hours * 3600 + time.minutes * 60 + time.seconds
}

export function getArrowByType(value: string, step: number, type: TimePickerType) {
  switch (type) {
    case 'minutes':
      return getValidArrowMinuteOrSecond(value, step)
    case 'seconds':
      return getValidArrowMinuteOrSecond(value, step)
    case 'hours':
      return getValidArrowHour(value, step)
    default:
      return '00'
  }
}
