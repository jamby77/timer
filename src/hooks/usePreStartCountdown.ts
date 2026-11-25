import { useInitialProgress, useSaveProgress } from '@/contexts/TimerRecovery'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { TimerState } from '@/lib/enums'
import { TimerManager } from '@/lib/timer/TimerManager'

import { clampCountdownSeconds } from '@/lib/timer/utils'

interface UsePreStartCountdownOptions {
  seconds?: number
  onComplete?: (endedAt: number) => void
}

export const usePreStartCountdown = ({ seconds, onComplete }: UsePreStartCountdownOptions) => {
  const countdownSeconds = useMemo(() => clampCountdownSeconds(seconds), [seconds])
  const durationMs = countdownSeconds * 1000

  const saved = useInitialProgress('prestart')
  const [state, setState] = useState<TimerState>(saved !== undefined ? TimerState.Running : TimerState.Idle)
  const [timeLeftMs, setTimeLeftMs] = useState(saved ?? durationMs)

  const [previousDuration, setPreviousDuration] = useState(durationMs)
  if (previousDuration !== durationMs) {
    setPreviousDuration(durationMs)
    setState(TimerState.Idle)
    setTimeLeftMs(durationMs)
  }

  const managerRef = useRef<TimerManager | null>(null)
  const onCompleteRef = useRef(onComplete)
  useSaveProgress('prestart', () => managerRef.current?.getRemainingTime())

  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  useEffect(() => {
    let disposed = false
    managerRef.current?.reset()
    managerRef.current = null

    if (durationMs <= 0) {
      return
    }

    managerRef.current = new TimerManager({
      steps: [
        {
          id: 'prestart',
          label: 'STARTING',
          duration: durationMs,
        },
      ],
      repeat: 1,
      onTick: (time) => {
        if (disposed) return
        setTimeLeftMs(time)
      },
      onSequenceComplete: (endedAt) => {
        if (disposed) return
        managerRef.current?.reset()
        onCompleteRef.current?.(endedAt)
        setState(TimerState.Idle)
        setTimeLeftMs(durationMs)
      },
    })

    if (saved !== undefined) {
      managerRef.current.resumeFrom(0, saved)
    }
    return () => {
      disposed = true
      managerRef.current?.reset()
      managerRef.current = null
    }
  }, [durationMs, saved])

  const start = useCallback((startsAt = Date.now()) => {
    if (durationMs <= 0) {
      onCompleteRef.current?.(startsAt)
      return
    }

    managerRef.current?.start(startsAt)
    setState(TimerState.Running)
  }, [durationMs])

  const pause = useCallback(() => {
    if (managerRef.current?.pause()) setState(TimerState.Paused)
  }, [])

  const reset = useCallback(() => {
    managerRef.current?.reset()
    setState(TimerState.Idle)
    setTimeLeftMs(durationMs)
  }, [durationMs])

  const secondsLeft = useMemo(() => {
    if (durationMs <= 0) return 0
    return Math.ceil(timeLeftMs / 1000)
  }, [durationMs, timeLeftMs])

  const isActive = state === TimerState.Running || state === TimerState.Paused

  return {
    isEnabled: countdownSeconds > 0,
    isActive,
    countdownSeconds,
    durationMs,
    state,
    timeLeftMs,
    secondsLeft,
    start,
    pause,
    reset,
  } as const
}
