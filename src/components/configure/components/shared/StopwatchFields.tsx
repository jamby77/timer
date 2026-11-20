import type { StopwatchConfig } from '@/types/configure'

import { FieldLegend, FieldSet } from '@/components/ui/field'
import { TimePicker } from '@/components/configure/components/shared/TimePicker'

interface StopwatchFieldsProps {
  config: Partial<StopwatchConfig>
  onChange: (updates: Partial<StopwatchConfig>) => void
}

export const StopwatchFields = ({ config, onChange }: StopwatchFieldsProps) => {
  return (
    <FieldSet className="min-w-0 gap-2">
      <FieldLegend variant="label">Time Limit (optional)</FieldLegend>
      <TimePicker
        clearLabel="Clear limit"
        max={86400}
        min={0}
        value={config.timeLimit || 0}
        onTimeChange={(seconds) => onChange({ timeLimit: seconds > 0 ? seconds : undefined })}
      />
    </FieldSet>
  )
}
