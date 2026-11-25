import type { AnyTimerConfig, PredefinedStyle } from '@/types/configure'

import { storage } from './storage'
import { getConfigSummary, validateTimerConfig } from './utils'

export function saveTimerPreset(config: AnyTimerConfig): PredefinedStyle<AnyTimerConfig> {
  const errors = validateTimerConfig(config)
  if (errors.length) throw new Error(errors.join('\n'))

  const id =
    crypto.randomUUID?.() ??
    Array.from(crypto.getRandomValues(new Uint8Array(16)), (byte) =>
      byte.toString(16).padStart(2, '0')
    ).join('')
  const preset: PredefinedStyle<AnyTimerConfig> = {
    id: `custom-${id}`,
    name: config.name,
    description: getConfigSummary(config),
    isBuiltIn: false,
    config,
  }
  storage.storePreset(preset)
  return preset
}
