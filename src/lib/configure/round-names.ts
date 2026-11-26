import type { AnyTimerConfig } from '@/types/configure'

import { isIntervalConfig } from '@/types/configure'

export function normalizeRoundNames(names: string[] | undefined, count: number) {
  if (!names?.length) return undefined
  const result = names.slice(0, Math.max(0, count)).map((name) => name.trim())
  while (result.length && !result[result.length - 1]) result.pop()
  return result.length ? result : undefined
}

export function normalizeDraftRoundNames<T extends AnyTimerConfig>(config: T): T {
  if (!isIntervalConfig(config) || !config.roundNames) return config
  return { ...config, roundNames: normalizeRoundNames(config.roundNames, config.intervals) }
}
