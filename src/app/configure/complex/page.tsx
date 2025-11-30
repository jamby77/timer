'use client'

import { useMemo, useState } from 'react'
import { ArrowLeft, Clock, FileText, Layers, Play, Save } from 'lucide-react'
import { useRouter } from 'next/navigation'

import type { ComplexConfig, PredefinedStyle } from '@/types/configure'

import { storage } from '@/lib/configure/storage'
import { formatDuration, processTimerConfig } from '@/lib/configure/utils'
import { TIMER_TYPE_ICONS, TIMER_TYPE_LABELS, TimerType } from '@/lib/enums'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldGroup } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from '@/components/ui/input-group'
import { Label } from '@/components/ui/label'
import { ComplexFields } from '@/components/configure/components/ComplexFields'
import { FormErrors } from '@/components/configure/components/FormErrors'
import { PageContainer } from '@/components/PageContainer'

export default function ConfigureComplexTimerPage() {
  const router = useRouter()
  const [config, setConfig] = useState<Partial<ComplexConfig>>({
    type: TimerType.COMPLEX,
    name: '',
    phases: [],
    autoAdvance: true,
  })
  const [errors, setErrors] = useState<string[]>([])

  const updateConfig = (updates: Partial<ComplexConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }))
    setErrors([])
  }

  const handleStartTimer = () => {
    const { config: fullConfig, errors } = processTimerConfig(config)
    if (errors.length > 0) {
      setErrors(errors)
      return
    }

    if (!fullConfig) {
      return
    }

    setErrors([])

    // Store timer configuration and add to recent timers
    storage.storeTimerConfig(fullConfig)
    storage.addRecentTimer(fullConfig)

    // Navigate to timer page
    router.push(`/?id=${fullConfig.id}`)
  }

  const handleSaveAsPreset = () => {
    const { config: fullConfig, errors } = processTimerConfig(config)
    if (errors.length > 0) {
      setErrors(errors)
      return
    }

    if (!fullConfig) return

    // Create a PredefinedStyle from the complex timer config
    const preset: PredefinedStyle<ComplexConfig> = {
      id: `preset-${Date.now()}`,
      name: fullConfig.name || 'Custom Complex Timer',
      description: `Complex timer with ${fullConfig.phases.length} phases`,
      isBuiltIn: false,
      config: fullConfig,
    }

    try {
      // Store the preset using the storage method
      storage.storePreset(preset)
      console.log('Successfully saved preset:', preset)

      // Optionally, you could show a success message or navigate
      // For now, we'll just log it
    } catch (error) {
      console.error('Failed to save preset:', error)
      setErrors(['Failed to save preset. Please try again.'])
    }
  }

  const totalDuration = useMemo(() => {
    if (!config.phases || config.phases.length === 0) return 0

    return config.phases.reduce((total, phase) => {
      switch (phase.config.type) {
        case TimerType.COUNTDOWN:
          return total + (phase.config as any).duration
        case TimerType.INTERVAL:
          const workDuration = (phase.config as any).workDuration || 0
          const restDuration = (phase.config as any).restDuration || 0
          const intervals = (phase.config as any).intervals || 1
          return total + (workDuration + restDuration) * intervals - restDuration
        case TimerType.STOPWATCH:
          return total + ((phase.config as any).timeLimit || 0)
        case TimerType.WORKREST:
          // This is complex to calculate, return 0 for now
          return total + 0
        default:
          return total
      }
    }, 0)
  }, [config])

  return (
    <PageContainer>
      <div className="mx-auto max-w-4xl space-y-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={4} />
            Back
          </Button>
          <div className="flex-1">
            <h1 className="text-foreground text-3xl font-bold">Complex Timer Configuration</h1>
            <p className="text-muted-foreground mt-2">
              Create multi-phase timers that combine different timer types in sequence
            </p>
          </div>
        </div>

        {/* Timer Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers size={20} />
              Timer Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FieldGroup className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Field>
                <Label htmlFor="timer-name">Timer Name*</Label>
                <Input
                  id="timer-name"
                  value={config.name || ''}
                  onChange={(e) => updateConfig({ name: e.target.value })}
                  placeholder="Enter timer name"
                  required
                />
              </Field>
              <Field>
                <Label>Total Phases</Label>
                <InputGroup>
                  <InputGroupAddon>
                    <InputGroupText>
                      <FileText size={16} />
                    </InputGroupText>
                  </InputGroupAddon>
                  <InputGroupInput
                    value={`${config.phases?.length || 0} phases`}
                    readOnly
                    className="bg-muted"
                  />
                </InputGroup>
              </Field>
              <Field>
                <Label>Estimated Duration</Label>
                <InputGroup>
                  <InputGroupAddon>
                    <InputGroupText>
                      <Clock size={16} />
                    </InputGroupText>
                  </InputGroupAddon>
                  <InputGroupInput
                    value={formatDuration(totalDuration)}
                    readOnly
                    className="bg-muted"
                  />
                </InputGroup>
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>

        {/* Form Errors */}
        <FormErrors errors={errors} />

        {/* Phase Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5" />
              Phase Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ComplexFields config={config} onChange={updateConfig} />
          </CardContent>
        </Card>

        {/* Phase Summary */}
        {config.phases && config.phases.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Phase Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {config.phases.map((phase, index) => {
                  const Icon = TIMER_TYPE_ICONS[phase.type]
                  return (
                    <div key={phase.id} className="flex items-center gap-3 rounded-lg border p-3">
                      <div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-full">
                        <span className="text-sm font-medium">{index + 1}</span>
                      </div>
                      <Icon className="text-muted-foreground h-4 w-4" />
                      <div className="flex-1">
                        <div className="font-medium">{phase.name}</div>
                        <div className="text-muted-foreground text-sm">
                          {TIMER_TYPE_LABELS[phase.type]}
                          {phase.type === TimerType.COUNTDOWN && (
                            <span> - {(phase.config as any).duration}s</span>
                          )}
                          {phase.type === TimerType.INTERVAL && (
                            <span>
                              {' '}
                              - {(phase.config as any).workDuration}s work /{' '}
                              {(phase.config as any).restDuration}s rest ×{' '}
                              {(phase.config as any).intervals}
                            </span>
                          )}
                          {phase.type === TimerType.STOPWATCH &&
                            (phase.config as any).timeLimit && (
                              <span> - {(phase.config as any).timeLimit}s limit</span>
                            )}
                          {phase.type === TimerType.WORKREST && (
                            <span>
                              {' '}
                              - {(phase.config as any).maxWorkTime}s max work /{' '}
                              {(phase.config as any).maxRounds} rounds
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col justify-end gap-3 sm:flex-row">
              <Button
                variant="outline"
                onClick={handleSaveAsPreset}
                className="flex items-center gap-2"
                disabled={!config.name || !config.phases || config.phases.length === 0}
              >
                <Save className="h-4 w-4" />
                Save as Preset
              </Button>
              <Button
                onClick={handleStartTimer}
                className="flex items-center gap-2"
                disabled={!config.name || !config.phases || config.phases.length === 0}
              >
                <Play size={16} className="fill-tm-play stroke-card" />
                Start Timer
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  )
}
