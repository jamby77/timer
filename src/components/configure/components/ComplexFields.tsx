'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Edit, GripVertical, Plus, Trash2 } from 'lucide-react'

import type { ComplexConfig, ComplexPhase } from '@/types/configure'

import { TIMER_TYPE_LABELS } from '@/lib/enums'
import { cn } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { ComplexPhaseDialog } from './ComplexPhaseDialog'

interface ComplexFieldsProps {
  config: Partial<ComplexConfig>
  onChange: (updates: Partial<ComplexConfig>) => void
}

export const ComplexFields = ({ config, onChange }: ComplexFieldsProps) => {
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

  return (
    <FieldGroup className="space-y-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3>Timer Phases</h3>
          <Button
            onClick={() => {
              setIsAddingPhase(true)
            }}
            size="lg"
            variant="outline"
          >
            <Plus size={16} className="mr-2" />
            Add Phase
          </Button>
        </div>

        {isAddingPhase && (
          <ComplexPhaseDialog
            mode="add"
            onOpenChange={setIsAddingPhase}
            phasesCount={phases.length}
            onAddAtStart={insertPhaseAtStart}
            onAddAtEnd={insertPhaseAtEnd}
          />
        )}
        {editingPhase && (
          <ComplexPhaseDialog
            mode="edit"
            onOpenChange={(open) => {
              if (!open) {
                setEditPhaseId(null)
              }
            }}
            phasesCount={phases.length}
            phase={editingPhase}
            onSave={savePhase}
          />
        )}

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
                <GripVertical className="text-muted-foreground" size={16} />
                <CardTitle className="text-sm">{phase.name}</CardTitle>
                <span className="text-muted-foreground text-xs">
                  ({TIMER_TYPE_LABELS[phase.type]})
                </span>
                <div className="ml-auto flex items-center gap-1">
                  <Button
                    onClick={() => movePhase(phase.id, 'up')}
                    size="sm"
                    variant="ghost"
                    disabled={index === 0}
                    className={cn('disabled:cursor-not-allowed disabled:opacity-50')}
                    aria-label="Move phase up"
                  >
                    <ChevronUp size={32} />
                  </Button>
                  <Button
                    onClick={() => movePhase(phase.id, 'down')}
                    size="sm"
                    variant="ghost"
                    disabled={index === phases.length - 1}
                    aria-label="Move phase down"
                  >
                    <ChevronDown size={32} />
                  </Button>
                  <Button
                    onClick={() => setEditPhaseId(phase.id)}
                    size="sm"
                    variant="ghost"
                    aria-label="Edit phase"
                  >
                    <Edit size={32} />
                  </Button>
                  <Button
                    onClick={() => removePhase(phase.id)}
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                    aria-label="Remove phase"
                  >
                    <Trash2 size={32} />
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}

        {phases.length > 0 && (
          <Card className="border-dashed">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Complex Timer Options</CardTitle>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Field orientation="responsive">
                  <Checkbox
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

                <Field>
                  <FieldLabel htmlFor="overall-timelimit">
                    Overall Time Limit (seconds, optional)
                  </FieldLabel>
                  <Input
                    id="overall-timelimit"
                    type="number"
                    value={config.overallTimeLimit || ''}
                    onChange={(e) =>
                      onChange({
                        overallTimeLimit: e.target.value ? parseInt(e.target.value) : undefined,
                      })
                    }
                    min="1"
                    placeholder="No limit"
                  />
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>
        )}
      </div>
    </FieldGroup>
  )
}
