import { X } from 'lucide-react'

import type { StopwatchConfig } from '@/types/configure'

import { Button } from '@/components/ui/button'
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
        max={86400}
        min={0}
        value={config.timeLimit || 0}
        onTimeChange={(seconds) => onChange({ timeLimit: seconds > 0 ? seconds : undefined })}
      >
        <Button
          type="button"
          variant="ghost"
          aria-label="Clear limit"
          title="Clear limit"
          className="border-input bg-destructive/20 text-destructive hover:bg-destructive/30 hover:text-destructive h-auto w-11 shrink-0 self-stretch ml-1 rounded-md border p-0 focus-visible:ring-inset max-sm:min-h-11"
          disabled={!config.timeLimit}
          onClick={() => onChange({ timeLimit: undefined })}
        >
          <X aria-hidden="true" />
        </Button>
      </TimePicker>
    </FieldSet>
  )
}
