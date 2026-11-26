import type { AnyTimerConfig } from '@/types/configure'

import { TimerType } from '@/types/configure'
import { SoundEngine } from '@/lib/sound/SoundEngine'

import { phaseSequence } from './phase-sequence'
import { storage } from './storage'

let pendingStart: { id: string; startsAt: number } | undefined

export function startSharedTimer(config: AnyTimerConfig) {
  const now = new Date()
  const local = { ...config, createdAt: now, lastUsed: now }
  storage.storeTimerConfig(local)
  storage.addRecentTimer(local)
  const firstPhase = config.type === TimerType.COMPLEX ? phaseSequence(config)[0] : undefined
  if ((config.sound ?? firstPhase?.config.sound)?.enabled) void SoundEngine.getInstance().init()
  pendingStart = { id: local.id, startsAt: now.getTime() }
  return '/?id=' + encodeURIComponent(local.id)
}

export function sharedStartTime(id: string | null) {
  return pendingStart && pendingStart.id === id ? pendingStart.startsAt : undefined
}

export function clearSharedStart(id: string | null) {
  if (pendingStart?.id === id) pendingStart = undefined
}
