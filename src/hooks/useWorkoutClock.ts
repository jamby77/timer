import { useCallback, useEffect, useRef, useState } from 'react'

export function useWorkoutClock(limitSeconds?: number) {
  const enabled = Boolean(limitSeconds && limitSeconds > 0)
  const clock = useRef({ elapsed: 0, startedAt: null as number | null })
  const [elapsedMs, setElapsedMs] = useState(0)
  const [acknowledged, setAcknowledged] = useState(false)

  const readElapsed = useCallback(() => {
    const { elapsed, startedAt } = clock.current
    return elapsed + (startedAt === null ? 0 : performance.now() - startedAt)
  }, [])

  const setRunning = useCallback(
    (running: boolean) => {
      if (!enabled) return
      if (running && clock.current.startedAt === null) {
        clock.current.startedAt = performance.now()
      } else if (!running && clock.current.startedAt !== null) {
        clock.current.elapsed = readElapsed()
        clock.current.startedAt = null
        setElapsedMs(clock.current.elapsed)
      }
    },
    [enabled, readElapsed]
  )

  useEffect(() => {
    if (!enabled) return
    const interval = setInterval(() => setElapsedMs(readElapsed()), 100)
    return () => clearInterval(interval)
  }, [enabled, readElapsed])

  const acknowledge = useCallback(() => setAcknowledged(true), [])
  const finish = useCallback(() => {
    setRunning(false)
    acknowledge()
  }, [setRunning, acknowledge])
  const reset = useCallback(() => {
    clock.current = { elapsed: 0, startedAt: null }
    setElapsedMs(0)
    setAcknowledged(false)
  }, [])

  return {
    elapsedMs,
    promptOpen: enabled && elapsedMs >= limitSeconds! * 1000 && !acknowledged,
    setRunning,
    acknowledge,
    finish,
    reset,
  }
}
