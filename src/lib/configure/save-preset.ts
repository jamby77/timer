import type { AnyTimerConfig, PredefinedStyle } from '@/types/configure'

import { storage } from './storage'
import { getConfigSummary, validateTimerConfig } from './utils'

export function saveTimerPreset(config: AnyTimerConfig): PredefinedStyle<AnyTimerConfig> {
  const errors = validateTimerConfig(config)
  if (errors.length) throw new Error(errors.join('\n'))

  const preset: PredefinedStyle<AnyTimerConfig> = {
    id: `custom-${crypto.randomUUID()}`,
    name: config.name,
    description: getConfigSummary(config),
    isBuiltIn: false,
    config,
  }
  storage.storePreset(preset)
  return preset
}
