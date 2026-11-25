'use client'

import { useState } from 'react'
import { Plus, Repeat2 } from 'lucide-react'

import type { ComplexConfig, ComplexPhase, PhaseRepeatGroup } from '@/types/configure'

import { repeatGroupError } from '@/lib/configure/phase-sequence'
import { TimerConfigHash } from '@/lib/timer/TimerConfigHash'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from '@/components/ui/field'
import { ComplexPhaseAdd } from '@/components/configure/components/complex-fields-form/components/ComplexPhaseAdd'
import { CountdownSelector } from '@/components/configure/components/shared/CountdownSelector'
import { SoundField } from '@/components/configure/components/shared/SoundField'
import { SwitchField } from '@/components/configure/components/shared/SwitchField'
import { TimePicker } from '@/components/configure/components/shared/TimePicker'
import { ComplexPhaseEdit } from './components/ComplexPhaseEdit'
import { EditablePhaseList } from './components/EditablePhaseList'
import { RepeatGroupEditor } from './components/RepeatGroupEditor'

interface ComplexFieldsProps {
  config: Partial<ComplexConfig>
  onChange: (updates: Partial<ComplexConfig>) => void
}

function uniqueId(base: string, existing: { id: string }[]) {
  const used = new Set(existing.map((item) => item.id))
  let id = base
  let suffix = 2
  while (used.has(id)) id = `${base}-${suffix++}`
  return id
}

export const ComplexFieldsForm = ({ config, onChange }: ComplexFieldsProps) => {
  const phases = [...(config.phases ?? [])].sort((a, b) => a.order - b.order)
  const groups = config.repeatGroups ?? []
  const groupByPhase = new Map(
    groups.flatMap((group) => group.phaseIds.map((id) => [id, group] as const))
  )
  const ungrouped = phases.find((phase) => !groupByPhase.has(phase.id))
  const [repeatDraft, setRepeatDraft] = useState<PhaseRepeatGroup | null>(null)
  const [phaseError, setPhaseError] = useState<string>()

  const updatePhases = (nextPhases: ComplexPhase[], nextGroups = groups) => {
    const ordered = nextPhases.map((phase, order) => ({ ...phase, order }))
    const error = repeatGroupError(ordered, nextGroups)
    setPhaseError(error)
    if (!error) onChange({ phases: ordered, repeatGroups: nextGroups })
  }

  const insertPhase = (draft: Omit<ComplexPhase, 'order'>, atStart = false) => {
    const phase = { ...draft, id: uniqueId(draft.id, phases), order: 0 }
    updatePhases(atStart ? [phase, ...phases] : [...phases, phase])
  }

  const [isAddingPhase, setIsAddingPhase] = useState(false)
  const [editPhaseId, setEditPhaseId] = useState<string | null>(null)

  const editingPhase = editPhaseId ? phases.find((p) => p.id === editPhaseId) : undefined

  const removePhase = (phaseId: string) => {
    const nextGroups = groups
      .map((group) => ({
        ...group,
        phaseIds: group.phaseIds.filter((id) => id !== phaseId),
      }))
      .filter((group) => group.phaseIds.length > 0)
    updatePhases(
      phases.filter((phase) => phase.id !== phaseId),
      nextGroups
    )
  }

  const duplicatePhase = (phase: ComplexPhase) => {
    const copiedConfig = { ...phase.config, name: `Copy of ${phase.config.name}` }
    insertPhase({
      ...phase,
      config: copiedConfig,
      name: `Copy of ${phase.name}`,
      id: `phase-${TimerConfigHash.generateTimerId(copiedConfig)}`,
    })
  }

  const movePhase = (index: number, step: -1 | 1) => {
    const neighbor = phases[index + step]
    if (!neighbor) return
    const current = phases[index]
    const group = groupByPhase.get(current.id)
    const neighborGroup = groupByPhase.get(neighbor.id)
    const next = [...phases]
    if (group === neighborGroup) {
      next[index] = neighbor
      next[index + step] = current
      const nextGroups = groups.map((existing) =>
        existing === group
          ? {
              ...existing,
              phaseIds: next
                .filter((phase) => groupByPhase.get(phase.id) === group)
                .map((phase) => phase.id),
            }
          : existing
      )
      updatePhases(next, nextGroups)
    } else {
      const size = group?.phaseIds.length ?? 1
      const start = step === 1 ? index - size + 1 : index
      const moved = next.splice(start, size)
      next.splice(start + step * (neighborGroup?.phaseIds.length ?? 1), 0, ...moved)
      updatePhases(next)
    }
  }

  const savePhase = (phaseId: string, draft: Omit<ComplexPhase, 'order'>) => {
    const updatedPhases = phases.map((phase) =>
      phase.id === phaseId
        ? {
            ...phase,
            name: draft.name,
            type: draft.type,
            config: draft.config,
          }
        : phase
    )
    onChange({ phases: updatedPhases })
  }

  if (isAddingPhase) {
    return (
      <ComplexPhaseAdd
        onCancel={() => setIsAddingPhase(false)}
        phasesCount={phases.length}
        onAddAtStart={(draft) => insertPhase(draft, true)}
        onAddAtEnd={(draft) => insertPhase(draft)}
      />
    )
  }

  if (editingPhase) {
    return (
      <ComplexPhaseEdit
        onCancel={() => {
          setEditPhaseId(null)
        }}
        phase={editingPhase}
        onSave={savePhase}
      />
    )
  }

  if (repeatDraft) {
    return (
      <RepeatGroupEditor
        phases={phases}
        groups={groups}
        group={repeatDraft}
        onCancel={() => setRepeatDraft(null)}
        onApply={(repeatGroups) => {
          onChange({ repeatGroups })
          setPhaseError(undefined)
          setRepeatDraft(null)
        }}
      />
    )
  }

  return (
    <FieldGroup className="space-y-4">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-end gap-1 sm:gap-2">
          <h3 className="mr-auto text-sm sm:text-base">Timer Phases</h3>
          {ungrouped && (
            <Button
              type="button"
              variant="outline"
              className="min-h-11 max-sm:px-2"
              onClick={() => {
                setRepeatDraft({
                  id: uniqueId(`repeat-${ungrouped.id}`, groups),
                  phaseIds: [ungrouped.id],
                  count: 2,
                })
              }}
            >
              <Repeat2 className="max-sm:hidden" /> Repeat
            </Button>
          )}
          <Button
            onClick={() => {
              setIsAddingPhase(true)
            }}
            variant="outline"
            className="max-sm:min-h-11 max-sm:px-2"
          >
            <Plus size={16} className="max-sm:hidden" />
            Add Phase
          </Button>
        </div>

        {phases.length === 0 && (
          <div className="bg-muted rounded-md p-4 text-center">
            <p className="text-muted-foreground text-sm">
              No phases added yet. Click &quot;Add Phase&quot; to create your first phase.
            </p>
          </div>
        )}

        {phaseError && (
          <p role="alert" className="text-destructive text-sm">
            {phaseError}
          </p>
        )}
        <EditablePhaseList
          phases={phases}
          groupByPhase={groupByPhase}
          onMove={movePhase}
          onEdit={setEditPhaseId}
          onDuplicate={duplicatePhase}
          onRemove={removePhase}
          onEditGroup={setRepeatDraft}
          onUngroup={(group) => {
            setPhaseError(undefined)
            onChange({ repeatGroups: groups.filter((existing) => existing.id !== group.id) })
          }}
        />

        {phases.length > 0 && (
          <Card className="border-dashed">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Complex Timer Options</CardTitle>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <SwitchField
                  title="Auto-advance phases"
                  description="Automatically move to next phase when current completes"
                  checked={config.autoAdvance ?? true}
                  onCheckedChange={(autoAdvance) => onChange({ autoAdvance })}
                />

                <Field orientation="vertical">
                  <FieldLabel htmlFor="countdownBeforeStart">Pre-start countdown</FieldLabel>
                  <div className="sm:max-w-48">
                    <CountdownSelector
                      countdown={config.countdownBeforeStart}
                      onChange={(e) => {
                        const next = parseInt(e.target.value, 10)
                        onChange({ countdownBeforeStart: next > 0 ? next : undefined })
                      }}
                    />
                  </div>
                </Field>

                <SoundField sound={config.sound} onChange={(sound) => onChange({ sound })} />

                <FieldSet className="min-w-0 gap-2">
                  <FieldLegend variant="label" className="mb-2">
                    <label htmlFor="overallLimitSeconds">Overall Time Limit</label>
                  </FieldLegend>
                  <TimePicker
                    secondsInputId="overallLimitSeconds"
                    clearLabel="Clear overall time limit"
                    value={config.overallTimeLimit || 0}
                    onTimeChange={(value) =>
                      onChange({ overallTimeLimit: value > 0 ? value : undefined })
                    }
                    min={0}
                  />
                  <FieldDescription>Leave at 00:00:00 for no overall time limit.</FieldDescription>
                </FieldSet>
              </FieldGroup>
            </CardContent>
          </Card>
        )}
      </div>
    </FieldGroup>
  )
}
