import { PREDEFINED_STYLES } from '@/lib/configure/presets'
import { TIMER_TYPE_LABELS, TimerType } from '@/lib/enums'

export interface SettingsSection {
  key: string
  title: string
  type?: TimerType
}

export const phaseTypes = [
  TimerType.COUNTDOWN,
  TimerType.STOPWATCH,
  TimerType.INTERVAL,
  TimerType.WORKREST,
] as const

export function typeLabel(type: TimerType) {
  return type === TimerType.WORKREST ? 'Work/Rest' : TIMER_TYPE_LABELS[type]
}

export const sections: { title?: string; entries: SettingsSection[] }[] = [
  {
    entries: [
      { key: 'general', title: 'General' },
      { key: 'sound', title: 'Sound cues' },
    ],
  },
  {
    title: 'Timer types',
    entries: [...phaseTypes, TimerType.COMPLEX].map((type) => ({
      key: `timer:${type}`,
      title: typeLabel(type),
      type,
    })),
  },
  {
    title: 'Complex phases',
    entries: [
      { key: 'new-phase', title: 'New phase' },
      ...phaseTypes.map((type) => ({
        key: `phase:${type}`,
        title: `${typeLabel(type)} phase`,
        type,
      })),
    ],
  },
  {
    title: 'Built-in presets',
    entries: PREDEFINED_STYLES.map(({ name, config }) => ({
      key: `preset:${config.id}`,
      title: name,
      type: config.type,
    })),
  },
]
