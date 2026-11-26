import { Minus, Plus } from 'lucide-react'

import type { IntervalConfig } from '@/types/configure'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { TimePicker } from '@/components/configure/components/shared/TimePicker'
import { RoundNamesField } from './RoundNamesField'

interface IntervalFieldsProps {
  config: Partial<IntervalConfig>
  onChange: (updates: Partial<IntervalConfig>) => void
}

export const IntervalFields = ({ config, onChange }: IntervalFieldsProps) => {
  const intervals = config.intervals ?? 0
  const minIntervals = 1
  const maxIntervals = 1000
  const workPlaceholder = 'Work'
  const restPlaceholder = 'Rest'
  return (
    <FieldGroup>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="workDuration">Work Duration</FieldLabel>
          <TimePicker
            min={1}
            secondsInputId="workDuration"
            value={config.workDuration || 0}
            onTimeChange={(seconds) => onChange({ workDuration: seconds })}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="restDuration">Rest Duration</FieldLabel>
          <TimePicker
            min={0}
            secondsInputId="restDuration"
            value={config.restDuration || 0}
            onTimeChange={(seconds) => onChange({ restDuration: seconds })}
          />
        </Field>
      </div>

      <Field>
        <FieldLabel htmlFor="intervals">Number of Intervals</FieldLabel>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-11 shrink-0 sm:hidden"
            aria-label="Decrease interval count"
            disabled={intervals <= minIntervals}
            onClick={() => onChange({ intervals: Math.min(maxIntervals, intervals - 1) })}
          >
            <Minus />
          </Button>
          <Input
            id="intervals"
            name="intervals"
            type="number"
            inputMode="numeric"
            min={minIntervals}
            max={maxIntervals}
            className="min-w-0 max-sm:min-h-11 max-sm:text-center"
            value={intervals || ''}
            onChange={(e) => onChange({ intervals: parseInt(e.target.value) || 0 })}
            placeholder="8"
            required
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-11 shrink-0 sm:hidden"
            aria-label="Increase interval count"
            disabled={intervals >= maxIntervals}
            onClick={() => onChange({ intervals: Math.max(minIntervals, intervals + 1) })}
          >
            <Plus />
          </Button>
        </div>
      </Field>

      <RoundNamesField
        count={intervals >= minIntervals && intervals <= maxIntervals ? intervals : 0}
        names={config.roundNames}
        workLabel={config.workLabel?.trim() || workPlaceholder}
        onChange={(roundNames) => onChange({ roundNames })}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="workLabel">Work Label</FieldLabel>
          <Input
            className="max-sm:min-h-11"
            id="workLabel"
            name="workLabel"
            type="text"
            defaultValue={config.workLabel || workPlaceholder}
            onChange={(e) => onChange({ workLabel: e.target.value })}
            placeholder={workPlaceholder}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="restLabel">Rest Label</FieldLabel>
          <Input
            className="max-sm:min-h-11"
            id="restLabel"
            name="restLabel"
            type="text"
            defaultValue={config.restLabel || restPlaceholder}
            onChange={(e) => onChange({ restLabel: e.target.value })}
            placeholder={restPlaceholder}
          />
        </Field>
      </div>
      <FieldLabel
        htmlFor="skipLastRest"
        className="min-h-11 w-full cursor-pointer items-center gap-3 rounded-md border px-3"
      >
        <Checkbox
          id="skipLastRest"
          name="skipLastRest"
          checked={config.skipLastRest ?? true}
          onCheckedChange={(state) => onChange({ skipLastRest: state === true })}
        />
        Skip last rest period
      </FieldLabel>
    </FieldGroup>
  )
}
