import type { SoundConfig } from '@/types/configure'
import { SwitchField } from './SwitchField'

interface SoundFieldProps {
  sound?: SoundConfig
  onChange: (sound: SoundConfig) => void
}

export function SoundField({ sound, onChange }: SoundFieldProps) {
  return (
    <SwitchField
      title="Sounds"
      description="Enable audio cues for countdown and transitions"
      checked={sound?.enabled ?? false}
      onCheckedChange={(enabled) => onChange({ ...sound, enabled, volume: sound?.volume ?? 0.7 })}
    />
  )
}
