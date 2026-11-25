import { useState } from 'react'

import type { ComplexPhase, PhaseRepeatGroup } from '@/types/configure'

import { repeatGroupError } from '@/lib/configure/phase-sequence'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { NativeSelect } from '@/components/ui/native-select'

interface RepeatGroupEditorProps {
  phases: ComplexPhase[]
  groups: PhaseRepeatGroup[]
  group: PhaseRepeatGroup
  onApply: (groups: PhaseRepeatGroup[]) => void
  onCancel: () => void
}

export function RepeatGroupEditor({
  phases,
  groups,
  group,
  onApply,
  onCancel,
}: RepeatGroupEditorProps) {
  const [from, setFrom] = useState(phases.findIndex((phase) => phase.id === group.phaseIds[0]))
  const [through, setThrough] = useState(
    phases.findIndex((phase) => phase.id === group.phaseIds.at(-1))
  )
  const [times, setTimes] = useState(String(group.count))
  const otherGroups = groups.filter((existing) => existing.id !== group.id)
  const occupied = new Set(otherGroups.flatMap((existing) => existing.phaseIds))
  const nextOccupied = phases.findIndex((phase, index) => index >= from && occupied.has(phase.id))
  const lastAvailable = nextOccupied === -1 ? phases.length - 1 : nextOccupied - 1
  const updated = {
    ...group,
    phaseIds: phases.slice(from, through + 1).map((phase) => phase.id),
    count: Number(times),
  }
  const proposedGroups = [...otherGroups, updated]
  const error = repeatGroupError(phases, proposedGroups)

  function changeFrom(next: number) {
    setFrom(next)
    if (through < next || phases.slice(next, through + 1).some((phase) => occupied.has(phase.id))) {
      setThrough(next)
    }
  }

  return (
    <form
      className="space-y-4"
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        if (!error) onApply(proposedGroups)
      }}
    >
      <h3 className="font-semibold">Repeat phases</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="min-w-0 space-y-1">
          <Label htmlFor="repeat-from">From</Label>
          <NativeSelect
            id="repeat-from"
            className="min-h-11"
            value={from}
            onChange={(event) => changeFrom(Number(event.target.value))}
          >
            {phases.map((phase, index) => (
              <option key={phase.id} value={index} disabled={occupied.has(phase.id)}>
                {index + 1} · {phase.name}
              </option>
            ))}
          </NativeSelect>
        </div>
        <div className="min-w-0 space-y-1">
          <Label htmlFor="repeat-through">Through</Label>
          <NativeSelect
            id="repeat-through"
            className="min-h-11"
            value={through}
            onChange={(event) => setThrough(Number(event.target.value))}
          >
            {phases.map((phase, index) => (
              <option key={phase.id} value={index} disabled={index < from || index > lastAvailable}>
                {index + 1} · {phase.name}
              </option>
            ))}
          </NativeSelect>
        </div>
      </div>
      <div className="space-y-1">
        <Label htmlFor="repeat-times">Times</Label>
        <Input
          id="repeat-times"
          className="min-h-11 sm:max-w-32"
          type="number"
          inputMode="numeric"
          min={2}
          max={100}
          step={1}
          value={times}
          onChange={(event) => setTimes(event.target.value)}
        />
      </div>
      {error && (
        <p role="alert" className="text-destructive text-sm">
          {error}
        </p>
      )}
      <div className="flex gap-2">
        <Button className="min-h-11" type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button className="min-h-11" type="submit" disabled={!!error}>
          Apply
        </Button>
      </div>
    </form>
  )
}
