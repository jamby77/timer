import { z } from 'zod'

import type { AnyTimerConfig } from '@/types/configure'

import { TimerType, WorkRestMode } from '@/types/configure'
import { TimerConfigHash } from '@/lib/timer/TimerConfigHash'

import { repeatGroupError } from './phase-sequence'

const maxUrlLength = 2000
const maxDecodedBytes = 64 * 1024
const tooLarge = 'Timer too large to share by link'
const invalid = 'Invalid timer link'
const hashPrefix = '#timer='

const optionalFlag = z.boolean().optional()
const positiveTime = z.int().positive().max(86400)
const direction = z.enum(['up', 'down']).optional()
const base = z.object({
  name: z.string().min(1),
  countdownBeforeStart: z.int().min(0).max(60).optional(),
  completionMessage: z.string().optional(),
  sound: z
    .object({
      enabled: z.boolean(),
      volume: z.number().min(0).max(1),
      countdownBeeps: z.int().min(1).max(60).optional(),
      startBeep: optionalFlag,
      finishBeep: optionalFlag,
      intervalStartBeep: optionalFlag,
      intervalEndBeep: optionalFlag,
      tenSecondWarning: optionalFlag,
      tick: optionalFlag,
      tickEverySeconds: z.int().positive().optional(),
    })
    .optional(),
})
const workRest = base.extend({
  type: z.literal(TimerType.WORKREST),
  maxRounds: z.int().min(1).max(1000),
  maxWorkTime: positiveTime.optional(),
  autoContinue: optionalFlag,
})
const simple = z.discriminatedUnion('type', [
  base.extend({ type: z.literal(TimerType.COUNTDOWN), duration: positiveTime }),
  base.extend({ type: z.literal(TimerType.STOPWATCH), timeLimit: positiveTime.optional() }),
  base.extend({
    type: z.literal(TimerType.INTERVAL),
    intervals: z.int().min(1).max(1000),
    workDuration: z.int().positive().max(359999),
    restDuration: z.int().nonnegative().max(359999),
    workDirection: direction,
    restDirection: direction,
    roundNames: z.array(z.string()).max(1000).optional(),
    workLabel: z.string().optional(),
    restLabel: z.string().optional(),
    skipLastRest: optionalFlag,
  }),
  z.discriminatedUnion('restMode', [
    workRest.extend({
      restMode: z.literal(WorkRestMode.FIXED),
      fixedRestDuration: positiveTime,
      ratio: z.never().optional(),
    }),
    workRest.extend({
      restMode: z.literal(WorkRestMode.RATIO),
      ratio: z.number().min(0.1).max(10),
      fixedRestDuration: z.never().optional(),
    }),
  ]),
])
const complex = base.extend({
  type: z.literal(TimerType.COMPLEX),
  phases: z
    .array(
      z.object({
        id: z.string().min(1),
        name: z.string().min(1),
        order: z.int().nonnegative(),
        type: z.enum(TimerType),
        config: simple,
      })
    )
    .min(1)
    .max(1000),
  repeatGroups: z
    .array(
      z.object({
        id: z.string().min(1),
        phaseIds: z.array(z.string()).min(1).max(1000),
        count: z.int().min(2).max(100),
      })
    )
    .max(500)
    .optional(),
  overallTimeLimit: z.int().positive().max(359999).optional(),
  autoAdvance: optionalFlag,
})
const definition = z.discriminatedUnion('type', [simple, complex])
const envelope = z.object({ v: z.literal(1), config: definition })

function canonicalConfig(config: z.output<typeof definition>): AnyTimerConfig {
  if (config.type !== TimerType.COMPLEX) return { ...config, id: 'shared' }
  const ordered = [...config.phases].sort((a, b) => a.order - b.order)
  const ids = new Map(ordered.map((phase, index) => [phase.id, 'phase-' + (index + 1)]))
  if (ids.size !== ordered.length || repeatGroupError(ordered, config.repeatGroups ?? [])) {
    throw new Error(invalid)
  }
  const phases = ordered.map((phase, order) => {
    if (phase.type !== phase.config.type) throw new Error(invalid)
    const id = ids.get(phase.id)!
    return { ...phase, id, order, config: { ...phase.config, id } }
  })
  const repeatGroups = config.repeatGroups?.map((group, index) => ({
    id: 'group-' + (index + 1),
    count: group.count,
    phaseIds: group.phaseIds.map((id) => ids.get(id)!),
  }))
  return { ...config, id: 'shared', phases, repeatGroups }
}

export async function createShareUrl(config: AnyTimerConfig, origin: string): Promise<string> {
  const canonical = canonicalConfig(definition.parse(config))
  const payload = new Blob([JSON.stringify({ v: 1, config: canonical })])
  if (payload.size > maxDecodedBytes) throw new Error(tooLarge)
  const compressed = payload.stream().pipeThrough(new CompressionStream('gzip'))
  const bytes = new Uint8Array(await new Response(compressed).arrayBuffer())
  if (bytes.length > maxUrlLength) throw new Error(tooLarge)
  const encoded = btoa(String.fromCharCode(...bytes))
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replace(/=+$/, '')
  const url = new URL('/share', origin)
  url.hash = hashPrefix + encoded
  if (url.href.length > maxUrlLength) throw new Error(tooLarge)
  return url.href
}

export async function readShareHash(hash: string): Promise<AnyTimerConfig> {
  if (hash.length > maxUrlLength || !hash.startsWith(hashPrefix)) throw new Error(invalid)
  const encoded = hash.slice(hashPrefix.length)
  if (!/^[A-Za-z0-9_-]+$/.test(encoded)) throw new Error(invalid)
  const binary = atob(encoded.replaceAll('-', '+').replaceAll('_', '/'))
  const compressed = Uint8Array.from(binary, (char) => char.charCodeAt(0))
  const reader = new Blob([compressed])
    .stream()
    .pipeThrough(new DecompressionStream('gzip'))
    .getReader()
  const decoder = new TextDecoder('utf-8', { fatal: true })
  let size = 0
  let json = ''
  try {
    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      size += value.byteLength
      if (size > maxDecodedBytes) throw new Error(tooLarge)
      json += decoder.decode(value, { stream: true })
    }
    json += decoder.decode()
  } finally {
    await reader.cancel().catch(() => {})
  }
  const { config } = envelope.parse(JSON.parse(json))
  const canonical = canonicalConfig(config)
  return { ...canonical, id: TimerConfigHash.generateTimerId(canonical) }
}
