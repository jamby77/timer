import { useId } from 'react'

import { FieldLabel } from '@/components/ui/field'
import { Switch } from '@/components/ui/switch'
import type { SoundConfig } from '@/types/configure'

interface SoundFieldProps {
  sound?: SoundConfig
  onChange: (sound: SoundConfig) => void
}

export function SoundField({ sound, onChange }: SoundFieldProps) {
  const id = useId()

  return (
    <FieldLabel htmlFor={id} className="min-h-11 w-full cursor-pointer items-center gap-3 rounded-md border px-3 py-2">
      <span className="flex flex-1 flex-col gap-1">
        <span id={`${id}-title`}>Sounds</span>
        <span id={`${id}-description`} className="text-muted-foreground text-sm font-normal">
          Enable audio cues for countdown and transitions
        </span>
      </span>
      <Switch
        id={id}
        aria-labelledby={`${id}-title`}
        aria-describedby={`${id}-description`}
        checked={sound?.enabled ?? false}
        onCheckedChange={(enabled) => onChange({ ...sound, enabled, volume: sound?.volume ?? 0.7 })}
      />
    </FieldLabel>
  )
}
