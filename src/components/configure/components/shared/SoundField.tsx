import type { AnyTimerConfig, SoundConfig } from '@/types/configure'
import { TimerType } from '@/types/configure'
import { SwitchField } from './SwitchField'

function hasTimedPeriod(config: Partial<AnyTimerConfig>): boolean {
  switch (config.type) {
    case TimerType.COMPLEX:
      return config.phases?.some(phase => hasTimedPeriod(phase.config)) ?? false
    case TimerType.STOPWATCH:
      return Boolean(config.timeLimit)
    case TimerType.WORKREST:
      return Boolean(config.maxWorkTime || config.fixedRestDuration || config.ratio)
    default:
      return config.type === TimerType.COUNTDOWN || config.type === TimerType.INTERVAL
  }
}

interface SoundFieldProps {
  config: Partial<AnyTimerConfig>
  onChange: (sound: SoundConfig) => void
}

export function SoundField({ config, onChange }: SoundFieldProps) {
  const { sound } = config
  return (
    <div className="grid gap-2">
      <SwitchField
        title="Sounds"
        description="Enable audio cues for countdown and transitions"
        checked={sound?.enabled ?? false}
        onCheckedChange={(enabled) => onChange({ ...sound, enabled, volume: sound?.volume ?? 0.7 })}
      />
      {sound?.enabled && hasTimedPeriod(config) && (
        <SwitchField
          title="10s warning"
          description="Double beep with 10s left."
          checked={sound.tenSecondWarning ?? false}
          onCheckedChange={tenSecondWarning => onChange({ ...sound, tenSecondWarning })}
        />
      )}
    </div>
  )
}
