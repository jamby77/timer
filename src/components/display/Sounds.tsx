'use client'

import { useCallback, useRef } from 'react'

import { AirHorn } from '@/lib/sound/chatgpt'
import {
  playCountdownBeep,
  playFinishBeep,
  playIntervalEndBeep,
  playIntervalStartBeep,
  playStartBeep,
  playTick,
} from '@/lib/sound/cues'
import { SoundEngine } from '@/lib/sound/SoundEngine'

import { Button } from '@/components/ui/button'

export const Sounds = () => {
  const initRef = useRef(false)
  const initEngine = useCallback(async () => {
    if (initRef.current) {
      return
    }
    initRef.current = true
    const engine = SoundEngine.getInstance()
    engine.setEnabled(true)
    engine.setVolume(0.7)
    await engine.init()
  }, [])

  const handlePlayStart = useCallback(async () => {
    await initEngine()
    playStartBeep()
  }, [initEngine])

  const handlePlayFinish = useCallback(async () => {
    await initEngine()
    playFinishBeep()
  }, [initEngine])

  const handlePlayFinishGpt = useCallback(async () => {
    const horn = new AirHorn()
    if (horn.ctx.state === 'suspended') {
      await horn.ctx.resume()
    }
    horn.play()
  }, [initEngine])

  const handlePlayIntervalStart = useCallback(async () => {
    await initEngine()
    playIntervalStartBeep()
  }, [initEngine])

  const handlePlayIntervalEnd = useCallback(async () => {
    await initEngine()
    playIntervalEndBeep()
  }, [initEngine])

  const handlePlayTick = useCallback(async () => {
    await initEngine()
    playTick()
  }, [initEngine])

  const handlePlayCountdown = useCallback(async () => {
    await initEngine()
    playCountdownBeep(3)
    setTimeout(() => playCountdownBeep(2), 1000)
    setTimeout(() => playCountdownBeep(1), 2000)
  }, [initEngine])

  return (
    <div className="flex flex-wrap gap-2">
      <Button type="button" onClick={handlePlayStart}>
        Start
      </Button>
      <Button type="button" onClick={handlePlayFinish}>
        Finish
      </Button>
      <Button type="button" onClick={handlePlayFinishGpt}>
        Finish Chatgpt
      </Button>
      <Button type="button" onClick={handlePlayIntervalStart}>
        Interval start
      </Button>
      <Button type="button" onClick={handlePlayIntervalEnd}>
        Interval end
      </Button>
      <Button type="button" onClick={handlePlayCountdown}>
        Countdown (3-2-1)
      </Button>
      <Button type="button" onClick={handlePlayTick}>
        Tick
      </Button>
    </div>
  )
}
