import { useEffect, useRef } from 'react'

import type { SoundConfig } from '@/types/configure'

import { SoundManager } from './SoundManager'

export const useSoundManager = (config?: SoundConfig) => {
  const manager = useRef<SoundManager | null>(null)

  if (manager.current === null) {
    manager.current = new SoundManager()
  }
  useEffect(() => {
    manager.current?.setConfig(config)
    return () => {
      manager.current?.reset()
    }
  }, [config])

  return manager.current
}
