import type { StopwatchConfig } from '@/types/configure'

import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

interface StopwatchFieldsProps {
  config: Partial<StopwatchConfig>
  onChange: (updates: Partial<StopwatchConfig>) => void
}

export const StopwatchFields = ({ config, onChange }: StopwatchFieldsProps) => {
  const placeholderMessage = 'Time limit reached'
  return (
    <FieldGroup>
      <Field>
        <FieldLabel htmlFor="timeLimit">Time Limit (seconds, optional)</FieldLabel>
        <Input
          id="timeLimit"
          name="timeLimit"
          type="number"
          min="1"
          max="86400"
          value={config.timeLimit || ''}
          onChange={(e) => onChange({ timeLimit: parseInt(e.target.value) || undefined })}
          placeholder="Leave empty for no limit"
        />
      </Field>

      <Field>
        <FieldLabel htmlFor="completionMessage">Completion Message (optional)</FieldLabel>
        <Input
          id="completionMessage"
          name="completionMessage"
          type="text"
          value={config.completionMessage || placeholderMessage}
          onChange={(e) => onChange({ completionMessage: e.target.value })}
          placeholder={placeholderMessage}
        />
      </Field>
    </FieldGroup>
  )
}
