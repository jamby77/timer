import type { AnyTimerConfig } from '@/types/configure'

import { TimerCategory, TimerType, WorkRestMode } from '@/types/configure'
import { TIMER_TYPE_LABELS } from '@/lib/enums'

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

// Validate timer configuration
export const validateTimerConfig = (config: AnyTimerConfig): string[] => {
  const errors: string[] = []

  if (!config.name || config.name.trim().length === 0) {
    errors.push('Timer name is required')
  }

  if (!config.id || config.id.trim().length === 0) {
    errors.push('Timer ID is required')
  }

  switch (config.type) {
    case TimerType.COUNTDOWN:
      if (!config.duration || config.duration <= 0) {
        errors.push('Duration must be greater than 0')
      }
      if (config.duration > 86400) {
        // 24 hours
        errors.push('Duration cannot exceed 24 hours')
      }
      break

    case TimerType.STOPWATCH:
      if (config.timeLimit && config.timeLimit <= 0) {
        errors.push('Time limit must be greater than 0')
      }
      if (config.timeLimit && config.timeLimit > 86400) {
        errors.push('Time limit cannot exceed 24 hours')
      }
      break

    case TimerType.INTERVAL:
      if (!config.workDuration || config.workDuration <= 0) {
        errors.push('Work duration must be greater than 0')
      }
      if (!config.restDuration || config.restDuration < 0) {
        errors.push('Rest duration must be 0 or greater')
      }
      if (!config.intervals || config.intervals <= 0) {
        errors.push('Number of intervals must be greater than 0')
      }
      if (config.intervals > 1000) {
        errors.push('Number of intervals cannot exceed 1000')
      }
      break

    case TimerType.WORKREST:
      if (!config.ratio || config.ratio <= 0) {
        errors.push('Work/rest ratio must be greater than 0')
      }
      if (!config.maxWorkTime || config.maxWorkTime <= 0) {
        errors.push('Maximum work time must be greater than 0')
      }
      if (!config.maxRounds || config.maxRounds <= 0) {
        errors.push('Maximum rounds must be greater than 0')
      }
      if (
        config.restMode === WorkRestMode.FIXED &&
        (!config.fixedRestDuration || config.fixedRestDuration <= 0)
      ) {
        errors.push('Fixed rest duration must be greater than 0')
      }
      break

    case TimerType.COMPLEX:
      if (!config.phases || config.phases.length === 0) {
        errors.push('Complex timer must have at least one phase')
      }
      if (config.phases.length > 20) {
        errors.push('Complex timer cannot have more than 20 phases')
      }
      // Validate each phase
      config.phases.forEach((phase, index) => {
        const phaseErrors = validateTimerConfig(phase.config)
        phaseErrors.forEach((error) => {
          errors.push(`Phase ${index + 1}: ${error}`)
        })
      })
      break
  }

  return errors
}

// Get timer type display name
export const getTimerTypeDisplayName = (type: TimerType): string => {
  return TIMER_TYPE_LABELS[type] || 'Unknown'
}

// Get timer category display name
export const getTimerCategoryDisplayName = (category: TimerCategory): string => {
  switch (category) {
    case TimerCategory.CARDIO:
      return 'Cardio'
    case TimerCategory.STRENGTH:
      return 'Strength'
    case TimerCategory.FLEXIBILITY:
      return 'Flexibility'
    case TimerCategory.SPORTS:
      return 'Sports'
    case TimerCategory.CUSTOM:
      return 'Custom'
    default:
      return 'Unknown'
  }
}

// Convert timer config to URL parameters
export const configToUrlParams = (config: AnyTimerConfig): string => {
  const params = new URLSearchParams()
  params.set('id', config.id)
  params.set('type', config.type)
  params.set('name', config.name)

  switch (config.type) {
    case TimerType.COUNTDOWN:
      params.set('duration', config.duration.toString())
      if (config.completionMessage) {
        params.set('completionMessage', config.completionMessage)
      }
      break

    case TimerType.STOPWATCH:
      if (config.timeLimit) {
        params.set('timeLimit', config.timeLimit.toString())
      }
      if (config.completionMessage) {
        params.set('completionMessage', config.completionMessage)
      }
      break

    case TimerType.INTERVAL:
      params.set('workDuration', config.workDuration.toString())
      params.set('restDuration', config.restDuration.toString())
      params.set('intervals', config.intervals.toString())
      if (config.workLabel) params.set('workLabel', config.workLabel)
      if (config.restLabel) params.set('restLabel', config.restLabel)
      if (config.skipLastRest) params.set('skipLastRest', 'true')
      if (config.countdownBeforeStart) {
        params.set('countdownBeforeStart', config.countdownBeforeStart.toString())
      }
      break

    case TimerType.WORKREST:
      params.set('ratio', config.ratio.toString())
      params.set('maxWorkTime', config.maxWorkTime.toString())
      params.set('maxRounds', config.maxRounds.toString())
      params.set('restMode', config.restMode)
      if (config.fixedRestDuration) {
        params.set('fixedRestDuration', config.fixedRestDuration.toString())
      }
      if (config.countdownBeforeStart) {
        params.set('countdownBeforeStart', config.countdownBeforeStart.toString())
      }
      break
  }

  return params.toString()
}

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
