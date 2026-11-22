import { useInitialProgress, useSaveProgress } from '@/contexts/TimerRecovery'
import { useCallback, useMemo, useState } from 'react'

import { LapEntry } from '@/types'

export const useLapHistory = () => {
  const saved = useInitialProgress('laps')
  const [laps, setLaps] = useState<LapEntry[]>(saved ?? [])
  useSaveProgress('laps', laps)

  const lastLap = useMemo(() => laps[laps.length - 1], [laps])
  const bestLap = useMemo(() => {
    if (laps.length === 0) return null
    return laps.reduce((best, lap) => {
      if (!best) return lap
      return lap.lapTime < best.lapTime ? lap : best
    })
  }, [laps])

  const addLap = useCallback((time: number) => {
    const now = Date.now()
    setLaps((prev) => [
      ...prev,
      {
        id: `lap-${now}-${Math.random()}`,
        lapTime: time,
        timestamp: now,
      },
    ])
  }, [])

  const clearHistory = useCallback(() => {
    setLaps([])
  }, [])

  return {
    laps,
    addLap,
    clearHistory,
    lastLap,
    bestLap,
  }
}
