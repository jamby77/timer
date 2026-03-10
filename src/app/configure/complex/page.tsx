'use client'

import { useMemo, useState } from 'react'
import { Clock, FileText, Layers, MoveLeft, Play, Save } from 'lucide-react'
import { useRouter } from 'next/navigation'

import type { ComplexConfig, PredefinedStyle } from '@/types/configure'

import { storage } from '@/lib/configure/storage'
import { formatDuration, generateComplexTimerName, processTimerConfig } from '@/lib/configure/utils'
import { TimerType } from '@/lib/enums'
import { cn } from '@/lib/utils'

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
import { ComplexFieldsForm } from '@/components/configure/components/complex-fields-form/ComplexFieldsForm'
import { PhaseSummary } from '@/components/configure/components/complex-fields-form/components/PhaseSummary'
import { FormErrors } from '@/components/configure/components/shared/FormErrors'
import { PageContainer } from '@/components/PageContainer'

const calculateDuration = (config: Partial<ComplexConfig>) => {
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
        return total
      default:
        return total
    }
  }, 0)
}

export default function ConfigureComplexTimerPage() {
  const router = useRouter()
  const [config, setConfig] = useState<Partial<ComplexConfig>>({
    type: TimerType.COMPLEX,
    name: 'Complex Timer (0 phases, 0s)',
    phases: [],
    autoAdvance: true,
  })
  const [errors, setErrors] = useState<string[]>([])

  const updateConfig = (updates: Partial<ComplexConfig>) => {
    const newConfig = { ...config, ...updates }
    // Auto-generate a name if it's currently a generated name or empty
    const shouldUpdateName = !config.name || config.name === generateComplexTimerName(config)
    if (shouldUpdateName && (updates.phases || updates.type)) {
      newConfig.name = generateComplexTimerName(newConfig)
    }
    setConfig(newConfig)
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

    // Navigate to the timer page
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

      // Optionally, you could show a success message or navigate.
      // For now, we'll just log it
    } catch (error) {
      console.error('Failed to save preset:', error)
      setErrors(['Failed to save preset. Please try again.'])
    }
  }

  const totalDuration = useMemo(() => {
    return calculateDuration(config)
  }, [config])

  const hasErrors = !!errors.length
  return (
    <PageContainer>
      <div className="mx-auto max-w-4xl space-y-6 px-2 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <MoveLeft />
          </Button>
          <div className="flex-1">
            <h1 className="text-foreground text-xl font-bold">Complex Timer Configuration</h1>
            <p className="text-muted-foreground mt-2">
              Create multi-phase timers that combine different timer types in sequence
            </p>
          </div>
        </div>

        {/* Form Errors */}
        <FormErrors errors={errors} />

        {/* Phase Configuration */}
        <Card className={cn({ 'border-destructive': hasErrors })}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5" />
              Phase Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ComplexFieldsForm config={config} onChange={updateConfig} />
          </CardContent>
        </Card>

        {/* Phase Summary */}
        {config.phases && config.phases.length > 0 && (
          <Card className={cn({ 'border-destructive': hasErrors })}>
            <CardHeader>
              <CardTitle>Phase Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <PhaseSummary phases={config.phases || []} />
            </CardContent>
          </Card>
        )}

        {/* Timer Name */}
        <Card className={cn({ 'border-destructive': hasErrors })}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers size={20} />
              Timer Name
            </CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>

        {/* Actions */}
        <Card className={cn({ 'border-destructive': hasErrors })}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers size={20} />
              Timer Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FieldGroup className="grid grid-cols-1 gap-4 md:grid-cols-2">
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

            <div className="flex flex-col justify-end gap-3 border-t pt-4 sm:flex-row">
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
