import { z } from 'zod'

import { createDefaultPhaseConfig } from './phase-defaults'
import type { SoundConfig } from '@/types/configure'
import { TimerType, WorkRestMode } from '@/types/configure'
import { PREDEFINED_STYLES } from './presets'
import { timerConfigSchema } from './utils'

const positiveTime = z.int().min(1).max(86400)
const direction = z.enum(['up', 'down'])
const phaseType = z.enum([TimerType.COUNTDOWN, TimerType.STOPWATCH, TimerType.INTERVAL, TimerType.WORKREST])
const soundSchema = z.object({
  enabled: z.boolean().default(false),
  volume: z.number().min(0).max(1).default(0.7),
  countdownBeeps: z.int().min(1).max(60).default(3),
  tenSecondWarning: z.boolean().default(false),
  startBeep: z.boolean().default(true),
  finishBeep: z.boolean().default(true),
  intervalStartBeep: z.boolean().default(true),
  intervalEndBeep: z.boolean().default(true),
})
const fields = {
  name: z.string(),
  sound: soundSchema,
  countdownBeforeStart: z.int().min(0).max(60),
  completionMessage: z.string(),
  duration: positiveTime,
  timeLimit: positiveTime,
  workDuration: z.int().positive().max(359999),
  restDuration: z.int().nonnegative().max(359999),
  intervals: z.int().min(1).max(1000),
  workDirection: direction,
  restDirection: direction,
  workLabel: z.string(),
  restLabel: z.string(),
  roundNames: z.array(z.string()).max(1000),
  skipLastRest: z.boolean(),
  maxWorkTime: positiveTime,
  maxRounds: z.int().min(1).max(100),
  restMode: z.enum(WorkRestMode),
  ratio: z.number().min(0.1).max(10),
  fixedRestDuration: positiveTime,
  autoContinue: z.boolean(),
  autoAdvance: z.boolean(),
  overallTimeLimit: z.int().positive().max(359999),
  repeatCount: z.int().min(2).max(100),
  phaseType,
}
type FieldName = keyof typeof fields
export type DefaultsFields = {
  [K in Exclude<FieldName, 'sound'>]?: z.output<(typeof fields)[K]>
} & { sound?: SoundConfig }

const timerFields: Record<TimerType, FieldName[]> = {
  [TimerType.COUNTDOWN]: ['name', 'duration'],
  [TimerType.STOPWATCH]: ['name', 'timeLimit'],
  [TimerType.INTERVAL]: [
    'name', 'intervals', 'workDuration', 'restDuration', 'workDirection', 'restDirection',
    'workLabel', 'restLabel', 'roundNames', 'skipLastRest',
  ],
  [TimerType.WORKREST]: ['name', 'restMode', 'ratio', 'fixedRestDuration', 'maxRounds', 'maxWorkTime', 'autoContinue'],
  [TimerType.COMPLEX]: ['name', 'autoAdvance', 'overallTimeLimit', 'repeatCount'],
}
const timerFactory: Record<TimerType, DefaultsFields> = {
  [TimerType.COUNTDOWN]: { name: '' },
  [TimerType.STOPWATCH]: { name: '' },
  [TimerType.INTERVAL]: {
    name: '', workDirection: 'down', restDirection: 'down', workLabel: 'Work', restLabel: 'Rest',
    roundNames: [], skipLastRest: true,
  },
  [TimerType.WORKREST]: { name: '', restMode: WorkRestMode.RATIO, ratio: 1, autoContinue: false },
  [TimerType.COMPLEX]: { name: '', autoAdvance: true, repeatCount: 2 },
}

interface Section {
  runnableType?: TimerType
  keys: FieldName[]
  factory: DefaultsFields
}

const sections = new Map<string, Section>([
  ['general', {
    keys: ['countdownBeforeStart', 'completionMessage'],
    factory: { countdownBeforeStart: 0, completionMessage: 'Time is up!' },
  }],
  ['sound', { keys: ['sound'], factory: { sound: soundSchema.parse({}) } }],
  ['new-phase', { keys: ['phaseType'], factory: { phaseType: TimerType.COUNTDOWN } }],
])

function registerSection(section: string, keys: FieldName[], values: DefaultsFields, runnableType?: TimerType) {
  const factory = Object.fromEntries(keys.filter(key => values[key] !== undefined).map(key => [key, values[key]]))
  sections.set(section, { keys, factory, runnableType })
}

for (const type of Object.values(TimerType)) {
  registerSection(`timer:${type}`, timerFields[type], timerFactory[type])
  if (type !== TimerType.COMPLEX) {
    registerSection(`phase:${type}`, timerFields[type], { ...timerFactory[type], ...createDefaultPhaseConfig('', type) }, type)
  }
}

for (const { config } of PREDEFINED_STYLES) {
  registerSection(`preset:${config.id}`, [...timerFields[config.type], 'countdownBeforeStart'], {
    ...timerFactory[config.type],
    ...config,
  }, config.type)
}

const clearable = new Set<FieldName>([
  'duration', 'timeLimit', 'workDuration', 'restDuration', 'intervals', 'fixedRestDuration',
  'ratio', 'maxRounds', 'maxWorkTime', 'overallTimeLimit',
])

function differences(definition: Section, values: unknown): DefaultsFields {
  if (!values || typeof values !== 'object' || Array.isArray(values)) throw new Error('Invalid defaults')
  const entries = []
  for (const key of definition.keys) {
    if (!Object.hasOwn(values, key)) continue
    const raw: unknown = Reflect.get(values, key)
    const value = raw == null && clearable.has(key) ? undefined : fields[key].parse(raw)
    if (JSON.stringify(value) !== JSON.stringify(definition.factory[key])) entries.push([key, value])
  }
  const overrides: DefaultsFields = Object.fromEntries(entries)
  const effective = { ...definition.factory, ...overrides }
  if (effective.restMode) {
    const inactive = effective.restMode === WorkRestMode.FIXED ? 'ratio' : 'fixedRestDuration'
    if (definition.factory[inactive] === undefined) delete overrides[inactive]
    else overrides[inactive] = undefined
    delete effective[inactive]
  }
  if (definition.runnableType) {
    timerConfigSchema.parse({ ...effective, type: definition.runnableType, id: 'defaults', name: effective.name || 'Automatic' })
  }
  return overrides
}

function storageKey(section: string) {
  return `personal_defaults_v1:${section}`
}

export function readOverrides(section: string): DefaultsFields {
  const definition = sections.get(section)
  if (!definition) return {}
  try {
    if (typeof localStorage === 'undefined') return {}
    const stored = localStorage.getItem(storageKey(section))
    return stored ? differences(definition, JSON.parse(stored)) : {}
  } catch {
    return {}
  }
}

export function readDefaults(section: string): DefaultsFields {
  return { ...structuredClone(sections.get(section)?.factory), ...readOverrides(section) }
}

export function saveDefaults(section: string, values: DefaultsFields): void {
  const definition = sections.get(section)
  if (!definition) throw new Error('Unknown defaults section')
  const overrides = differences(definition, values)
  localStorage.setItem(storageKey(section), JSON.stringify(overrides, (_, value) => value ?? null))
}
