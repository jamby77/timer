import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { TimerState } from '@/lib/enums'

import { TimerManager } from './TimerManager'

const clampCountdownSeconds = (seconds?: number): number => {
  if (seconds === undefined) return 0
  if (!Number.isFinite(seconds)) return 0
  return Math.max(0, Math.min(60, Math.floor(seconds)))
}

interface UsePreStartCountdownOptions {
  seconds?: number
  onComplete?: () => void
}

export const usePreStartCountdown = ({ seconds, onComplete }: UsePreStartCountdownOptions) => {
  const countdownSeconds = useMemo(() => clampCountdownSeconds(seconds), [seconds])
  const durationMs = countdownSeconds * 1000

  const [state, setState] = useState<TimerState>(TimerState.Idle)
  const [timeLeftMs, setTimeLeftMs] = useState(durationMs)

  const managerRef = useRef<TimerManager | null>(null)
  const onCompleteRef = useRef(onComplete)

  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  useEffect(() => {
    managerRef.current?.reset()
    managerRef.current = null

    setState(TimerState.Idle)
    setTimeLeftMs(durationMs)

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
        setTimeLeftMs(time)
      },
      onSequenceComplete: () => {
        managerRef.current?.reset()
        onCompleteRef.current?.()
        setState(TimerState.Idle)
        setTimeLeftMs(durationMs)
      },
    })

    return () => {
      managerRef.current?.reset()
      managerRef.current = null
    }
  }, [durationMs])

  const start = useCallback(() => {
    if (durationMs <= 0) {
      onCompleteRef.current?.()
      return
    }

    managerRef.current?.start()
    setState(TimerState.Running)
  }, [durationMs])

  const pause = useCallback(() => {
    managerRef.current?.pause()
    setState(TimerState.Paused)
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
