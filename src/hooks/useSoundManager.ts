import { useEffect, useState } from 'react'

import type { SoundConfig } from '@/types/configure'

import { SoundManager } from '@/lib/sound/SoundManager'

export const useSoundManager = (config?: SoundConfig) => {
  const [manager] = useState(() => new SoundManager(config))

  useEffect(() => {
    manager.setConfig(config)
    return () => {
      manager.reset()
    }
  }, [config, manager])

  return manager
}
