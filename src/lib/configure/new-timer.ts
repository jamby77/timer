import { TimerType, WorkRestMode, type AnyTimerConfig, type PhaseConfig } from '@/types/configure'
import { readOverrides } from './defaults'
import { PREDEFINED_STYLES } from './presets'
import { generateTimerName } from './utils'
import { createDefaultPhaseConfig } from './phase-defaults'

export function createTimerDraft(type: TimerType): AnyTimerConfig {
  const general = readOverrides('general')
  const settings = readOverrides(`timer:${type}`)
  delete settings.repeatCount
  const config = {
    ...(type === TimerType.WORKREST && { restMode: WorkRestMode.RATIO, ratio: 1 }),
    ...(type === TimerType.COMPLEX && { phases: [], autoAdvance: true }),
    ...(type === TimerType.COMPLEX ? { countdownBeforeStart: general.countdownBeforeStart } : general),
    ...readOverrides('sound'),
    ...settings,
    type,
  } as AnyTimerConfig
  config.name ||= generateTimerName(config)
  return config
}

export function createPhaseDraft(id: string, type: TimerType): PhaseConfig {
  return {
    ...createDefaultPhaseConfig(id, type),
    ...readOverrides(`phase:${type}`),
  } as PhaseConfig
}

export function getStarterPresets() {
  const shared = { ...readOverrides('general'), ...readOverrides('sound') }
  return PREDEFINED_STYLES.map((preset) => {
    const overrides = readOverrides(`preset:${preset.config.id}`)
    const config = { ...shared, ...preset.config, ...overrides } as AnyTimerConfig
    config.name ||= generateTimerName(config)
    return {
      ...preset,
      description: Object.keys(overrides).length ? '' : preset.description,
      config,
    }
  })
}
