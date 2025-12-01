import { z } from 'zod'

import type { AnyTimerConfig, ComplexConfig } from '@/types/configure'

import { TimerType, WorkRestMode } from '@/types/configure'
import { TIMER_TYPE_LABELS } from '@/lib/enums'
import { TimerConfigHash } from '@/lib/timer/TimerConfigHash'


// Zod schemas for timer configuration validation

// Base timer config schema
const baseTimerConfigSchema = z.object({
  id: z.string().min(1, 'Timer ID is required'),
  name: z.string().min(1, 'Timer name is required'),
  type: z.enum(TimerType),
  createdAt: z.date().optional(),
  countdownBeforeStart: z.number().int().min(0).optional(),
  lastUsed: z.date().optional(),
})

// Countdown timer schema
const countdownConfigSchema = baseTimerConfigSchema.extend({
  type: z.literal(TimerType.COUNTDOWN),
  duration: z
    .number()
    .int()
    .min(1, 'Duration must be greater than 0')
    .max(86400, 'Duration cannot exceed 24 hours'),
  completionMessage: z.string().optional(),
})

// Stopwatch timer schema
const stopwatchConfigSchema = baseTimerConfigSchema.extend({
  type: z.literal(TimerType.STOPWATCH),
  timeLimit: z
    .number()
    .int()
    .min(1, 'Time limit must be greater than 0')
    .max(86400, 'Time limit cannot exceed 24 hours')
    .optional(),
  completionMessage: z.string().optional(),
})

// Interval timer schema
const intervalConfigSchema = baseTimerConfigSchema.extend({
  type: z.literal(TimerType.INTERVAL),
  workDuration: z.number().int().min(1, 'Work duration must be greater than 0'),
  restDuration: z.number().int().min(0, 'Rest duration must be 0 or greater'),
  intervals: z
    .number()
    .int()
    .min(1, 'Number of intervals must be greater than 0')
    .max(1000, 'Number of intervals cannot exceed 1000'),
  workLabel: z.string().optional(),
  restLabel: z.string().optional(),
  skipLastRest: z.boolean().optional(),
})

// WorkRest ratio config schema
const workRestRatioConfigSchema = baseTimerConfigSchema.extend({
  type: z.literal(TimerType.WORKREST),
  maxWorkTime: z.number().int().min(1, 'Maximum work time must be greater than 0'),
  maxRounds: z.number().int().min(1, 'Maximum rounds must be greater than 0'),
  restMode: z.literal(WorkRestMode.RATIO),
  ratio: z.number().min(0.1, 'Work/rest ratio must be greater than 0'),
  fixedRestDuration: z.never().optional(),
})

// WorkRest fixed config schema
const workRestFixedConfigSchema = baseTimerConfigSchema.extend({
  type: z.literal(TimerType.WORKREST),
  maxWorkTime: z.number().int().min(1, 'Maximum work time must be greater than 0'),
  maxRounds: z.number().int().min(1, 'Maximum rounds must be greater than 0'),
  restMode: z.literal(WorkRestMode.FIXED),
  fixedRestDuration: z.number().int().min(1, 'Fixed rest duration must be greater than 0'),
  ratio: z.never().optional(),
})

// WorkRest union schema
const workRestConfigSchema = z.discriminatedUnion('restMode', [
  workRestRatioConfigSchema,
  workRestFixedConfigSchema,
])

// Declare anyTimerConfigSchema first with explicit type to avoid circular reference issues
const anyTimerConfigSchema = z.discriminatedUnion('type', [
  countdownConfigSchema,
  stopwatchConfigSchema,
  intervalConfigSchema,
  workRestConfigSchema,
  // Complex config will be added after it's defined
]) as any

// Complex phase schema (can now reference anyTimerConfigSchema)
const complexPhaseSchema = z.object({
  id: z.string().min(1, 'Phase ID is required'),
  name: z.string().min(1, 'Phase name is required'),
  type: z.enum(TimerType),
  config: z.lazy(() => anyTimerConfigSchema),
  order: z.number().int().min(0, 'Phase order must be 0 or greater'),
})

// Complex timer schema
const complexConfigSchema = baseTimerConfigSchema.extend({
  type: z.literal(TimerType.COMPLEX),
  phases: z.array(complexPhaseSchema).min(1, 'Complex timer must have at least one phase'),
  overallTimeLimit: z.number().int().min(1).optional(),
  autoAdvance: z.boolean().optional(),
})

// Now properly create the final union schema with complex config included
const finalAnyTimerConfigSchema = z.discriminatedUnion('type', [
  countdownConfigSchema,
  stopwatchConfigSchema,
  intervalConfigSchema,
  workRestConfigSchema,
  complexConfigSchema,
])

// Type inference from schemas
export type TimerConfigSchema = z.infer<typeof finalAnyTimerConfigSchema>

// Export the main schema for use in validation
export const timerConfigSchema = finalAnyTimerConfigSchema

// Configuration summary generator
export const getConfigSummary = (config: AnyTimerConfig): string => {
  switch (config.type) {
    case TimerType.COUNTDOWN:
      return `${formatDuration(config.duration)} countdown`
    case TimerType.STOPWATCH:
      return config.timeLimit
        ? `Stopwatch with ${formatDuration(config.timeLimit)} limit`
        : 'Open-ended stopwatch'
    case TimerType.INTERVAL:
      return `${config.intervals} rounds: ${formatDuration(config.workDuration)} work / ${formatDuration(config.restDuration)} rest`
    case TimerType.WORKREST:
      if (config.restMode === WorkRestMode.FIXED) {
        return `Work/rest with ${formatDuration(config.fixedRestDuration!)} fixed rest`
      }
      return `Work/rest with ${config.ratio}:1 ratio`
    case TimerType.COMPLEX:
      return `${config.phases.length} phase complex timer`
    default:
      return 'Unknown timer type'
  }
}

// Format duration in seconds to human-readable format
export const formatDuration = (seconds: number): string => {
  if (seconds < 60) {
    return `${seconds}s`
  }

  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  if (minutes < 60) {
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`
  }

  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
}

// Format relative time
export const formatRelativeTime = (date: Date): string => {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return 'just now'

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`

  return date.toLocaleDateString()
}

// Validate timer configuration using Zod schemas
export const validateTimerConfig = (config: AnyTimerConfig): string[] => {
  const result = timerConfigSchema.safeParse(config)

  if (result.success) {
    return []
  }

  // Extract error messages from Zod error
  const errors: string[] = []
  result.error.issues.forEach((issue) => {
    // Create readable error messages from Zod issues
    const path = issue.path.length > 0 ? `${issue.path.join('.')}: ` : ''
    errors.push(`${path}${issue.message}`)
  })

  return errors
}

// Get timer type display name
export const getTimerTypeDisplayName = (type: TimerType): string => {
  return TIMER_TYPE_LABELS[type] || 'Unknown'
}

// Get timer category display name

// Deep clone timer configuration
export const cloneTimerConfig = (config: AnyTimerConfig): AnyTimerConfig => {
  const cloned = JSON.parse(JSON.stringify(config))
  // Convert date strings back to Date objects
  if (cloned.createdAt) {
    cloned.createdAt = new Date(cloned.createdAt)
  }
  if (cloned.lastUsed) {
    cloned.lastUsed = new Date(cloned.lastUsed)
  }
  return cloned
}

export const processTimerConfig = (config: Partial<AnyTimerConfig>) => {
  const fullConfig = {
    ...config,
    type: TimerType.COMPLEX,
    createdAt: new Date(),
    lastUsed: new Date(),
  } as ComplexConfig

  fullConfig.id = TimerConfigHash.generateTimerId(fullConfig)

  const validationErrors = validateTimerConfig(fullConfig)

  return { config: fullConfig, errors: validationErrors }
}

// Helper function to generate complex timer names
export const generateComplexTimerName = (config: Partial<ComplexConfig>): string => {
  const phaseCount = config.phases?.length || 0
  const totalDuration = config.phases?.reduce((total, phase) => {
    switch (phase.config.type) {
      case TimerType.COUNTDOWN:
        return total + (phase.config as any).duration
      case TimerType.INTERVAL:
        const workDuration = (phase.config as any).workDuration || 0
        const restDuration = (phase.config as any).restDuration || 0
        const intervals = (phase.config as any).intervals || 1
        return total + (workDuration + restDuration) * intervals - restDuration
      case TimerType.STOPWATCH:
        return total + ((phase.config as any).timeLimit || 0)
      case TimerType.WORKREST:
        return total + 0 // Complex to calculate, skip for now
      default:
        return total
    }
  }, 0) || 0

  return `Complex Timer (${phaseCount} phases, ${formatDuration(totalDuration)})`
}

// Helper function to generate timer names for individual timer types
export const generateTimerName = (config: AnyTimerConfig): string => {
  switch (config.type) {
    case TimerType.COUNTDOWN:
      const duration = (config as any).duration
      return duration ? `Countdown (${formatDuration(duration)})` : 'Countdown'
    case TimerType.STOPWATCH:
      const timeLimit = (config as any).timeLimit
      if (timeLimit) {
        return `Stopwatch (cap. ${formatDuration(timeLimit)})`
      }
      return 'Stopwatch'
    case TimerType.INTERVAL:
      const intervalConfig = config as any
      const workDuration = intervalConfig.workDuration || 0
      const restDuration = intervalConfig.restDuration || 0
      const intervals = intervalConfig.intervals || 0
      if (workDuration && restDuration && intervals) {
        return `Interval (${workDuration}s work / ${restDuration}s rest × ${intervals})`
      }
      return 'Interval'
    case TimerType.WORKREST:
      const workRestConfig = config as any
      const maxWorkTime = workRestConfig.maxWorkTime || 0
      const maxRounds = workRestConfig.maxRounds || 0
      if (maxWorkTime && maxRounds) {
        return `Work/Rest (${formatDuration(maxWorkTime)} max work / ${maxRounds} rounds)`
      }
      return 'Work/Rest'
    case TimerType.COMPLEX:
      return generateComplexTimerName(config as ComplexConfig)
    default:
      return 'Timer'
  }
}
