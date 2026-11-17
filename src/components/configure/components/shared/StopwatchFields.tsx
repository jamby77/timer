import type { StopwatchConfig } from '@/types/configure'

import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { TimePicker } from '@/components/configure/components/shared/TimePicker'

interface StopwatchFieldsProps {
  config: Partial<StopwatchConfig>
  onChange: (updates: Partial<StopwatchConfig>) => void
}

export const StopwatchFields = ({ config, onChange }: StopwatchFieldsProps) => {
  return (
    <FieldGroup>
      <Field>
        <FieldLabel htmlFor="timeLimit">Time Limit (seconds, optional)</FieldLabel>
        <TimePicker
          max={86400}
          min={0}
          value={config.timeLimit || 0}
          onTimeChange={(seconds) => onChange({ timeLimit: seconds > 0 ? seconds : undefined })}
        />
      </Field>
    </FieldGroup>
  )
}
