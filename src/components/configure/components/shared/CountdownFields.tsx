import type { CountdownConfig } from '@/types/configure'

import { Field, FieldGroup, FieldLabel, FieldSet } from '@/components/ui/field'
import { TimePicker } from '@/components/configure/components/shared/TimePicker'

interface CountdownFieldsProps {
  allowUnset?: boolean
  config: Partial<CountdownConfig>
  onChange: (updates: Partial<CountdownConfig>) => void
}

export const CountdownFields = ({ config, onChange, allowUnset = false }: CountdownFieldsProps) => {
  return (
    <FieldGroup>
      <FieldSet>
        <Field orientation="responsive">
          <FieldLabel htmlFor="duration">
            Duration <span className="text-muted-foreground text-xs">(HH:MM:SS)</span>
          </FieldLabel>
          <TimePicker
            max={86400}
            min={allowUnset ? 0 : 1}
            clearLabel={allowUnset ? 'Clear duration' : undefined}
            secondsInputId="duration"
            value={config.duration || 0}
            onTimeChange={(seconds) =>
              onChange({ duration: allowUnset && !seconds ? undefined : seconds })
            }
          />
        </Field>
      </FieldSet>
    </FieldGroup>
  )
}
