import type { CountdownConfig } from '@/types/configure'

import { Field, FieldGroup, FieldLabel, FieldSet } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

interface CountdownFieldsProps {
  config: Partial<CountdownConfig>
  onChange: (updates: Partial<CountdownConfig>) => void
}

export const CountdownFields = ({ config, onChange }: CountdownFieldsProps) => {
  return (
    <FieldGroup>
      <FieldSet>
        <Field>
          <FieldLabel htmlFor="duration">Duration (seconds)</FieldLabel>
          <Input
            type="number"
            min="1"
            max="86400"
            value={config.duration || ''}
            onChange={(e) => onChange({ duration: parseInt(e.target.value) || 0 })}
            placeholder="300"
            required
            id="duration"
            name="duration"
          />
        </Field>
      </FieldSet>
    </FieldGroup>
  )
}
