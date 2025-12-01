import type { CountdownConfig } from '@/types/configure'

import { Field, FieldGroup, FieldLabel, FieldSet } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { TimePicker } from '@/components/configure/components/TimePicker'

interface CountdownFieldsProps {
  config: Partial<CountdownConfig>
  onChange: (updates: Partial<CountdownConfig>) => void
}

export const CountdownFields = ({ config, onChange }: CountdownFieldsProps) => {
  return (
    <FieldGroup>
      <FieldSet>
        <Field orientation="responsive">
          <FieldLabel htmlFor="duration">
            Duration <span className="text-muted-foreground text-xs">(HH:MM:SS)</span>
          </FieldLabel>
          <TimePicker
            max={86400}
            min={1}
            initialSeconds={config.duration || 0}
            onTimeChange={(seconds) => onChange({ duration: seconds })}
          />
        </Field>
      </FieldSet>
    </FieldGroup>
  )
}
