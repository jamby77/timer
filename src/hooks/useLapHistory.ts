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

  const addSplit = useCallback((total: number, runStart: number) => {
    const timestamp = Date.now()
    const id = `lap-${timestamp}-${Math.random()}`
    setLaps(previous => {
      const count = Math.max(0, previous.length - runStart)
      const baseline = count ? previous.at(-1)?.split?.total ?? 0 : 0
      if (total <= baseline) return previous
      return [...previous, {
        id, timestamp, lapTime: total - baseline, split: { number: count + 1, total },
      }]
    })
  }, [])

  const clearHistory = useCallback(() => {
    setLaps([])
  }, [])

  return {
    laps,
    addLap,
    addSplit,
    clearHistory,
    lastLap,
    bestLap,
  }
}
