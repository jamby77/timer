import { useEffect, useRef } from 'react'

import type { SoundConfig } from '@/types/configure'

import { SoundManager } from '@/lib/sound/SoundManager'

export const useSoundManager = (config?: SoundConfig) => {
  const manager = useRef<SoundManager | null>(null)

  if (manager.current === null) {
    manager.current = new SoundManager(config)
  }
  useEffect(() => {
    manager.current?.setConfig(config)
    return () => {
      manager.current?.reset()
    }
  }, [config])

  return manager.current
}
