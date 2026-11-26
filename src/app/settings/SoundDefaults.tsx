import type { SoundConfig } from '@/types/configure'

import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

const cueLabels = {
  enabled: 'Sounds',
  tenSecondWarning: '10s warning',
  startBeep: 'Start cue',
  finishBeep: 'Finish cue',
  intervalStartBeep: 'Interval start cue',
  intervalEndBeep: 'Interval end cue',
}

export function SoundDefaults({
  sound,
  onChange,
}: {
  sound: SoundConfig
  onChange: (value: SoundConfig) => void
}) {
  function cue(key: keyof typeof cueLabels) {
    return (
      <label
        key={key}
        className="flex min-h-11 cursor-pointer items-center justify-between gap-3 border-b text-sm font-medium"
      >
        {cueLabels[key]}
        <Checkbox
          checked={sound[key] ?? false}
          onCheckedChange={(value) => onChange({ ...sound, [key]: value === true })}
        />
      </label>
    )
  }

  return (
    <>
      <div>
        {cue('enabled')}
        {cue('tenSecondWarning')}
      </div>
      <Field>
        <FieldLabel htmlFor="volume">Volume (%)</FieldLabel>
        <Input
          id="volume"
          className="min-h-11"
          type="number"
          min={0}
          max={100}
          step={1}
          required
          defaultValue={Math.round(sound.volume * 100)}
          onChange={(event) => onChange({ ...sound, volume: event.target.valueAsNumber / 100 })}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="countdownBeeps">Countdown beeps</FieldLabel>
        <Input
          id="countdownBeeps"
          className="min-h-11"
          type="number"
          min={1}
          max={60}
          step={1}
          required
          defaultValue={sound.countdownBeeps}
          onChange={(event) => onChange({ ...sound, countdownBeeps: event.target.valueAsNumber })}
        />
      </Field>
      <div>
        {cue('startBeep')}
        {cue('finishBeep')}
        {cue('intervalStartBeep')}
        {cue('intervalEndBeep')}
      </div>
    </>
  )
}
