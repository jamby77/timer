import { useEffect, useState } from 'react'

import type { SoundConfig } from '@/types/configure'

import { SoundManager } from '@/lib/sound/SoundManager'

export const useSoundManager = (config?: SoundConfig) => {
  const [manager] = useState(() => new SoundManager(config))

  useEffect(() => {
    manager.setConfig(config)
    const clearWarning = () => manager.clearWarningObservation()
    document.addEventListener('visibilitychange', clearWarning)
    return () => {
      document.removeEventListener('visibilitychange', clearWarning)
      manager.reset()
    }
  }, [config, manager])

  return manager
}
