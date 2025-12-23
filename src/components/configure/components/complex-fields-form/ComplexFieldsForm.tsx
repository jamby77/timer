'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, CopyPlus, Edit, GripVertical, Plus, Trash2 } from 'lucide-react'

import type { ComplexConfig, ComplexPhase } from '@/types/configure'

import { TIMER_TYPE_LABELS } from '@/lib/enums'
import { TimerConfigHash } from '@/lib/timer/TimerConfigHash'
import { cn } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Switch } from '@/components/ui/switch'
import { ComplexPhaseAdd } from '@/components/configure/components/complex-fields-form/components/ComplexPhaseAdd'
import { CountdownSelector } from '@/components/configure/components/shared/CountdownSelector'
import { TimePicker } from '@/components/configure/components/shared/TimePicker'
import { ComplexPhaseEdit } from './components/ComplexPhaseEdit'

interface ComplexFieldsProps {
  config: Partial<ComplexConfig>
  onChange: (updates: Partial<ComplexConfig>) => void
}

export const ComplexFieldsForm = ({ config, onChange }: ComplexFieldsProps) => {
  const phases = config.phases || []

  const [isAddingPhase, setIsAddingPhase] = useState(false)
  const [editPhaseId, setEditPhaseId] = useState<string | null>(null)

  const editingPhase = editPhaseId ? phases.find((p) => p.id === editPhaseId) : undefined

  const removePhase = (phaseId: string) => {
    const updatedPhases = phases
      .filter((phase) => phase.id !== phaseId)
      .map((phase, index) => ({ ...phase, order: index }))
    onChange({ phases: updatedPhases })
  }
  const duplicatePhase = (phaseId: string) => {
    const phaseToDuplicate = phases.find((phase) => phase.id === phaseId)
    if (!phaseToDuplicate) return
    const config = { ...phaseToDuplicate.config }
    config.name = `Copy of ${config.name}`
    console.log(config)
    const newId = `phase-${TimerConfigHash.generateTimerId(config)}`
    const newName = `Copy of ${phaseToDuplicate.name}`
    const newPhase: ComplexPhase = {
      ...phaseToDuplicate,
      config,
      name: newName,
      id: newId,
      order: phases.length,
    }
    const updatedPhases = [...phases, newPhase]
    onChange({ phases: updatedPhases })
  }

  const movePhase = (phaseId: string, direction: 'up' | 'down') => {
    const currentIndex = phases.findIndex((phase) => phase.id === phaseId)
    if (currentIndex === -1) return

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    if (newIndex < 0 || newIndex >= phases.length) return

    const updatedPhases = [...phases]
    const [movedPhase] = updatedPhases.splice(currentIndex, 1)
    updatedPhases.splice(newIndex, 0, movedPhase)

    const reorderedPhases = updatedPhases.map((phase, index) => ({
      ...phase,
      order: index,
    }))

    onChange({ phases: reorderedPhases })
  }

  const insertPhaseAtStart = (draft: Omit<ComplexPhase, 'order'>) => {
    const newPhase: ComplexPhase = { ...draft, order: 0 }
    const updatedPhases = [newPhase, ...phases].map((phase, index) => ({
      ...phase,
      order: index,
    }))
    onChange({ phases: updatedPhases })
  }

  const insertPhaseAtEnd = (draft: Omit<ComplexPhase, 'order'>) => {
    const newPhase: ComplexPhase = { ...draft, order: phases.length }
    const updatedPhases = [...phases, newPhase].map((phase, index) => ({
      ...phase,
      order: index,
    }))
    onChange({ phases: updatedPhases })
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
        onAddAtStart={insertPhaseAtStart}
        onAddAtEnd={insertPhaseAtEnd}
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

  return (
    <FieldGroup className="space-y-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3>Timer Phases</h3>
          <Button
            onClick={() => {
              setIsAddingPhase(true)
            }}
            variant="outline"
          >
            <Plus size={16} className="mr-2" />
            Add Phase
          </Button>
        </div>

        {phases.length === 0 && (
          <div className="bg-muted rounded-md p-4 text-center">
            <p className="text-muted-foreground text-sm">
              No phases added yet. Click "Add Phase" to create your first phase.
            </p>
          </div>
        )}

        {phases.map((phase, index) => (
          <Card key={phase.id} className="relative">
            <CardHeader>
              <div className="flex items-center gap-2">
                <GripVertical className="text-muted-foreground size-5" />
                <CardTitle className="truncate text-sm">
                  {phase.name}{' '}
                  <span className="text-muted-foreground hidden text-xs sm:inline">
                    ({TIMER_TYPE_LABELS[phase.type]})
                  </span>
                </CardTitle>
              </div>
              <CardAction>
                <Button
                  onClick={() => movePhase(phase.id, 'up')}
                  size="sm"
                  variant="ghost"
                  disabled={index === 0}
                  className={cn('disabled:cursor-not-allowed disabled:opacity-50')}
                  aria-label="Move phase up"
                >
                  <ChevronUp />
                </Button>
                <Button
                  onClick={() => movePhase(phase.id, 'down')}
                  size="sm"
                  variant="ghost"
                  disabled={index === phases.length - 1}
                  aria-label="Move phase down"
                >
                  <ChevronDown />
                </Button>
              </CardAction>
            </CardHeader>
            <CardFooter className="flex items-center justify-start gap-1">
              <Button
                onClick={() => setEditPhaseId(phase.id)}
                variant="ghost"
                aria-label="Edit phase"
              >
                <Edit />
              </Button>
              <Button
                onClick={() => duplicatePhase(phase.id)}
                variant="ghost"
                aria-label="Duplicate phase"
              >
                <CopyPlus />
              </Button>
              <Button
                onClick={() => removePhase(phase.id)}
                variant="ghost"
                className="text-destructive hover:text-destructive"
                aria-label="Remove phase"
              >
                <Trash2 />
              </Button>
            </CardFooter>
          </Card>
        ))}

        {phases.length > 0 && (
          <Card className="border-dashed">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Complex Timer Options</CardTitle>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Field orientation="horizontal">
                  <Switch
                    id="auto-advance"
                    checked={config.autoAdvance ?? true}
                    onCheckedChange={(checked) => onChange({ autoAdvance: Boolean(checked) })}
                  />
                  <FieldContent>
                    <FieldLabel htmlFor="auto-advance">Auto-advance phases</FieldLabel>
                    <FieldDescription>
                      Automatically move to next phase when current completes
                    </FieldDescription>
                  </FieldContent>
                </Field>

                <Field orientation="vertical">
                  <FieldLabel htmlFor="countdownBeforeStart">Countdown</FieldLabel>
                  <div className="max-w-48">
                    <CountdownSelector
                      countdown={config.countdownBeforeStart}
                      onChange={(e) => {
                        const next = parseInt(e.target.value, 10)
                        onChange({ countdownBeforeStart: next > 0 ? next : undefined })
                      }}
                    />
                  </div>
                </Field>

                <Field orientation="horizontal">
                  <Switch
                    id="sound-enabled"
                    checked={config.sound?.enabled ?? false}
                    onCheckedChange={(checked) =>
                      onChange({
                        sound: {
                          ...(config.sound ?? { enabled: false, volume: 0.7 }),
                          enabled: Boolean(checked),
                          volume: config.sound?.volume ?? 0.7,
                        },
                      })
                    }
                  />
                  <FieldContent>
                    <FieldLabel htmlFor="sound-enabled">Sounds</FieldLabel>
                    <FieldDescription>
                      Enable audio cues for countdown and transitions
                    </FieldDescription>
                  </FieldContent>
                </Field>

                <Field>
                  <FieldLabel>
                    <TimePicker
                      initialSeconds={config.overallTimeLimit || 0}
                      onTimeChange={(value) =>
                        onChange({
                          overallTimeLimit: value,
                        })
                      }
                      min={1}
                    />
                    Overall Time Limit
                  </FieldLabel>
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>
        )}
      </div>
    </FieldGroup>
  )
}
