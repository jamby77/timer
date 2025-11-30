'use client'

import { useState } from 'react'
import { Plus, GripVertical, Trash2, Edit, ChevronDown, ChevronUp } from 'lucide-react'

import type { AnyTimerConfig, ComplexConfig, ComplexPhase } from '@/types/configure'

// Type for phase configurations (excluding ComplexConfig to prevent nesting)
type PhaseTimerConfig = Exclude<AnyTimerConfig, ComplexConfig>

import { TimerType, TIMER_TYPE_LABELS } from '@/lib/enums'

import { FieldGroup } from '@/components/ui/field'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'

interface ComplexFieldsProps {
  config: Partial<ComplexConfig>
  onChange: (updates: Partial<ComplexConfig>) => void
}

export const ComplexFields = ({ config, onChange }: ComplexFieldsProps) => {
  const phases = config.phases || []
  const [editingPhaseId, setEditingPhaseId] = useState<string | null>(null)

  const addPhase = () => {
    const newPhase: ComplexPhase = {
      id: `phase-${Date.now()}`,
      name: `Phase ${phases.length + 1}`,
      type: TimerType.COUNTDOWN,
      config: {
        type: TimerType.COUNTDOWN,
        duration: 60,
        name: `Phase ${phases.length + 1}`,
        id: `phase-${Date.now()}`,
      },
      order: phases.length,
    }

    onChange({
      phases: [...phases, newPhase],
    })
  }

  const updatePhase = (phaseId: string, updates: Partial<ComplexPhase>) => {
    const updatedPhases = phases.map((phase) =>
      phase.id === phaseId ? { ...phase, ...updates } : phase
    )
    onChange({ phases: updatedPhases })
  }

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

  const updatePhaseConfig = (phaseId: string, configUpdates: Partial<PhaseTimerConfig>) => {
    const updatedPhases = phases.map((phase) =>
      phase.id === phaseId
        ? { ...phase, config: { ...phase.config, ...configUpdates } }
        : phase
    )
    onChange({ phases: updatedPhases })
  }

  return (
    <FieldGroup className="space-y-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-base font-medium">Timer Phases</Label>
          <Button onClick={addPhase} size="sm" variant="outline">
            <Plus className="mr-2 h-4 w-4" />
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
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <GripVertical className="text-muted-foreground h-4 w-4" />
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
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => movePhase(phase.id, 'down')}
                    size="sm"
                    variant="ghost"
                    disabled={index === phases.length - 1}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => setEditingPhaseId(editingPhaseId === phase.id ? null : phase.id)}
                    size="sm"
                    variant="ghost"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => removePhase(phase.id)}
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor={`phase-name-${phase.id}`}>Phase Name</Label>
                    <Input
                      id={`phase-name-${phase.id}`}
                      value={phase.name}
                      onChange={(e) => updatePhase(phase.id, { name: e.target.value })}
                      placeholder="Enter phase name"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`phase-type-${phase.id}`}>Timer Type</Label>
                    <Select
                      value={phase.type}
                      onValueChange={(value: TimerType) => {
                        const newType = value as TimerType
                        let newConfig: AnyTimerConfig

                        switch (newType) {
                          case TimerType.COUNTDOWN:
                            newConfig = {
                              type: TimerType.COUNTDOWN,
                              duration: 60,
                              name: phase.name,
                              id: phase.id,
                            }
                            break
                          case TimerType.STOPWATCH:
                            newConfig = {
                              type: TimerType.STOPWATCH,
                              name: phase.name,
                              id: phase.id,
                            }
                            break
                          case TimerType.INTERVAL:
                            newConfig = {
                              type: TimerType.INTERVAL,
                              workDuration: 30,
                              restDuration: 10,
                              intervals: 3,
                              name: phase.name,
                              id: phase.id,
                            }
                            break
                          case TimerType.WORKREST:
                            newConfig = {
                              type: TimerType.WORKREST,
                              maxWorkTime: 300,
                              maxRounds: 5,
                              restMode: 'ratio' as any,
                              ratio: 2,
                              name: phase.name,
                              id: phase.id,
                            }
                            break
                          default:
                            newConfig = {
                              type: TimerType.COUNTDOWN,
                              duration: 60,
                              name: phase.name,
                              id: phase.id,
                            }
                        }

                        updatePhase(phase.id, { type: newType, config: newConfig })
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(TIMER_TYPE_LABELS)
                          .filter(([type]) => type !== 'COMPLEX')
                          .map(([type, label]) => (
                            <SelectItem key={type} value={type}>
                              {label}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {editingPhaseId === phase.id && (
                  <div className="border-t pt-3">
                    <Label className="text-sm font-medium">Phase Configuration</Label>
                    <div className="mt-2 space-y-2">
                      {phase.type === TimerType.COUNTDOWN && (
                        <div>
                          <Label htmlFor={`phase-duration-${phase.id}`}>Duration (seconds)</Label>
                          <Input
                            id={`phase-duration-${phase.id}`}
                            type="number"
                            value={(phase.config as any).duration || 60}
                            onChange={(e) =>
                              updatePhaseConfig(phase.id, { duration: parseInt(e.target.value) || 60 })
                            }
                            min="1"
                          />
                        </div>
                      )}

                      {phase.type === TimerType.STOPWATCH && (
                        <div>
                          <Label htmlFor={`phase-timelimit-${phase.id}`}>Time Limit (seconds, optional)</Label>
                          <Input
                            id={`phase-timelimit-${phase.id}`}
                            type="number"
                            value={(phase.config as any).timeLimit || ''}
                            onChange={(e) =>
                              updatePhaseConfig(phase.id, {
                                timeLimit: e.target.value ? parseInt(e.target.value) : undefined,
                              })
                            }
                            min="1"
                            placeholder="No limit"
                          />
                        </div>
                      )}

                      {phase.type === TimerType.INTERVAL && (
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <Label htmlFor={`phase-work-${phase.id}`}>Work (s)</Label>
                            <Input
                              id={`phase-work-${phase.id}`}
                              type="number"
                              value={(phase.config as any).workDuration || 30}
                              onChange={(e) =>
                                updatePhaseConfig(phase.id, { workDuration: parseInt(e.target.value) || 30 })
                              }
                              min="1"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`phase-rest-${phase.id}`}>Rest (s)</Label>
                            <Input
                              id={`phase-rest-${phase.id}`}
                              type="number"
                              value={(phase.config as any).restDuration || 10}
                              onChange={(e) =>
                                updatePhaseConfig(phase.id, { restDuration: parseInt(e.target.value) || 10 })
                              }
                              min="1"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`phase-intervals-${phase.id}`}>Intervals</Label>
                            <Input
                              id={`phase-intervals-${phase.id}`}
                              type="number"
                              value={(phase.config as any).intervals || 3}
                              onChange={(e) =>
                                updatePhaseConfig(phase.id, { intervals: parseInt(e.target.value) || 3 })
                              }
                              min="1"
                            />
                          </div>
                        </div>
                      )}

                      {phase.type === TimerType.WORKREST && (
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label htmlFor={`phase-maxwork-${phase.id}`}>Max Work (s)</Label>
                            <Input
                              id={`phase-maxwork-${phase.id}`}
                              type="number"
                              value={(phase.config as any).maxWorkTime || 300}
                              onChange={(e) =>
                                updatePhaseConfig(phase.id, { maxWorkTime: parseInt(e.target.value) || 300 })
                              }
                              min="1"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`phase-rounds-${phase.id}`}>Max Rounds</Label>
                            <Input
                              id={`phase-rounds-${phase.id}`}
                              type="number"
                              value={(phase.config as any).maxRounds || 5}
                              onChange={(e) =>
                                updatePhaseConfig(phase.id, { maxRounds: parseInt(e.target.value) || 5 })
                              }
                              min="1"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {phases.length > 0 && (
          <Card className="border-dashed">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Complex Timer Options</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-advance" className="text-sm font-medium">Auto-advance phases</Label>
                  <p className="text-muted-foreground text-xs">
                    Automatically move to next phase when current completes
                  </p>
                </div>
                <Checkbox
                  id="auto-advance"
                  checked={config.autoAdvance ?? true}
                  onCheckedChange={(checked) => onChange({ autoAdvance: Boolean(checked) })}
                />
              </div>

              <div>
                <Label htmlFor="overall-timelimit">Overall Time Limit (seconds, optional)</Label>
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
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </FieldGroup>
  )
}
