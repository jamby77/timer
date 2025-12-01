'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Edit, GripVertical, Plus, Trash2 } from 'lucide-react'

import type { AnyTimerConfig, ComplexConfig, ComplexPhase } from '@/types/configure'

import { generateTimerName } from '@/lib/configure/utils'
import { TIMER_TYPE_LABELS, TimerType } from '@/lib/enums'
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
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CountdownFields } from '@/components/configure/components/CountdownFields'
import { IntervalFields } from '@/components/configure/components/IntervalFields'
import { StopwatchFields } from '@/components/configure/components/StopwatchFields'
import { WorkRestFields } from '@/components/configure/components/WorkRestFields'

// Type for phase configurations (excluding ComplexConfig to prevent nesting)
type PhaseTimerConfig = Exclude<AnyTimerConfig, ComplexConfig>

// Helper function to create default timer configurations for each type
const createDefaultPhaseConfig = (phaseId: string, timerType: TimerType): PhaseTimerConfig => {
  const baseConfig = {
    name: '',
    id: phaseId,
    createdAt: new Date(),
    lastUsed: new Date(),
  }

  switch (timerType) {
    case TimerType.COUNTDOWN:
      return {
        ...baseConfig,
        type: TimerType.COUNTDOWN,
        duration: 60,
      }
    case TimerType.STOPWATCH:
      return {
        ...baseConfig,
        type: TimerType.STOPWATCH,
      }
    case TimerType.INTERVAL:
      return {
        ...baseConfig,
        type: TimerType.INTERVAL,
        workDuration: 30,
        restDuration: 10,
        intervals: 3,
      }
    case TimerType.WORKREST:
      return {
        ...baseConfig,
        type: TimerType.WORKREST,
        maxWorkTime: 300,
        maxRounds: 5,
        restMode: 'ratio' as any,
        ratio: 2,
      }
    default:
      return {
        ...baseConfig,
        type: TimerType.COUNTDOWN,
        duration: 60,
      }
  }
}

interface ComplexFieldsProps {
  config: Partial<ComplexConfig>
  onChange: (updates: Partial<ComplexConfig>) => void
}

export const ComplexFields = ({ config, onChange }: ComplexFieldsProps) => {
  const phases = config.phases || []
  const [editingPhaseId, setEditingPhaseId] = useState<string | null>(null)

  const addPhase = () => {
    const phaseId = `phase-${Date.now()}`
    const defaultConfig = createDefaultPhaseConfig(phaseId, TimerType.COUNTDOWN)
    const newPhase: ComplexPhase = {
      id: phaseId,
      name: generateTimerName(defaultConfig),
      type: TimerType.COUNTDOWN,
      config: defaultConfig,
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
    const updatedPhases = phases.map((phase) => {
      if (phase.id === phaseId) {
        const newConfig = { ...phase.config, ...configUpdates } as PhaseTimerConfig
        const generatedName = generateTimerName(newConfig)
        // Only update name if it's currently a generated name or empty
        const shouldUpdateName = !phase.name || phase.name === generateTimerName(phase.config)

        return {
          ...phase,
          config: newConfig,
          ...(shouldUpdateName && { name: generatedName }),
        }
      }
      return phase
    })
    onChange({ phases: updatedPhases })
  }

  return (
    <FieldGroup className="space-y-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3>Timer Phases</h3>
          <Button onClick={addPhase} size="sm" variant="outline">
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
            <CardHeader className="pb-3">
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
                  >
                    <ChevronUp size={16} />
                  </Button>
                  <Button
                    onClick={() => movePhase(phase.id, 'down')}
                    size="sm"
                    variant="ghost"
                    disabled={index === phases.length - 1}
                  >
                    <ChevronDown size={16} />
                  </Button>
                  <Button
                    onClick={() => setEditingPhaseId(editingPhaseId === phase.id ? null : phase.id)}
                    size="sm"
                    variant="ghost"
                  >
                    <Edit size={16} />
                  </Button>
                  <Button
                    onClick={() => removePhase(phase.id)}
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor={`phase-type-${phase.id}`}>Timer Type</FieldLabel>
                  <Select
                    value={phase.type}
                    onValueChange={(value: TimerType) => {
                      const newType = value as TimerType
                      const newConfig = createDefaultPhaseConfig(phase.id, newType)
                      const generatedName = generateTimerName(newConfig)
                      // Only update name if it's currently a generated name or empty
                      const shouldUpdateName =
                        !phase.name || phase.name === generateTimerName(phase.config)
                      updatePhase(phase.id, {
                        type: newType,
                        config: newConfig,
                        ...(shouldUpdateName && { name: generatedName }),
                      })
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(TIMER_TYPE_LABELS)
                        .filter(([type]) => type !== 'COMPLEX')
                        .map(([type, FieldLabel]) => (
                          <SelectItem key={type} value={type}>
                            {FieldLabel}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </Field>

                {editingPhaseId === phase.id && (
                  <FieldGroup>
                    <FieldSet>
                      <FieldLegend>Phase Configuration</FieldLegend>
                      {phase.type === TimerType.COUNTDOWN && (
                        <CountdownFields
                          config={phase.config as any}
                          onChange={(updates) => updatePhaseConfig(phase.id, updates)}
                        />
                      )}

                      {phase.type === TimerType.STOPWATCH && (
                        <StopwatchFields
                          config={phase.config as any}
                          onChange={(updates) => updatePhaseConfig(phase.id, updates)}
                        />
                      )}

                      {phase.type === TimerType.INTERVAL && (
                        <IntervalFields
                          config={phase.config as any}
                          onChange={(updates) => updatePhaseConfig(phase.id, updates)}
                        />
                      )}

                      {phase.type === TimerType.WORKREST && (
                        <WorkRestFields
                          config={phase.config as any}
                          onChange={(updates) => updatePhaseConfig(phase.id, updates)}
                        />
                      )}
                    </FieldSet>
                  </FieldGroup>
                )}
                <FieldSeparator />
                {/* Generated Timer Name */}
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="phase-name">Timer Name</FieldLabel>
                    <Input
                      id="phase-name"
                      value={phase.name}
                      onChange={(e) => updatePhase(phase.id, { name: e.target.value })}
                      placeholder="Enter timer name"
                    />
                  </Field>
                </FieldGroup>
              </FieldGroup>
            </CardContent>
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
