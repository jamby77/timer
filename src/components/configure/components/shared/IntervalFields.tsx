import { useId } from 'react'
import { Check, Minus, Plus } from 'lucide-react'

import type { ClockDirection, IntervalConfig } from '@/types/configure'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { TimePicker } from '@/components/configure/components/shared/TimePicker'
import { RoundNamesField } from './RoundNamesField'

function ClockDirectionField({
  label,
  value = 'down',
  onChange,
}: {
  label: string
  value?: ClockDirection
  onChange: (value: ClockDirection) => void
}) {
  const name = useId()
  return (
    <fieldset aria-label={label} className="flex gap-1 rounded-lg border p-[3px]">
      {(['up', 'down'] as const).map((direction) => (
        <label
          key={direction}
          className="has-checked:bg-secondary has-focus-visible:ring-ring relative flex min-h-11 flex-1 cursor-pointer items-center justify-center gap-1 rounded-md text-sm font-medium has-focus-visible:ring-2"
        >
          <input
            type="radio"
            name={name}
            value={direction}
            checked={value === direction}
            onChange={() => onChange(direction)}
            className="sr-only"
          />
          {value === direction && <Check aria-hidden="true" className="size-4" />}
          Count {direction}
        </label>
      ))}
    </fieldset>
  )
}

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
          <ClockDirectionField
            label="Work clock direction"
            value={config.workDirection}
            onChange={(workDirection) => onChange({ workDirection })}
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
          {(config.restDuration ?? 0) > 0 && (
            <ClockDirectionField
              label="Rest clock direction"
              value={config.restDirection}
              onChange={(restDirection) => onChange({ restDirection })}
            />
          )}
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
