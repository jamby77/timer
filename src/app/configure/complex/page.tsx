'use client'

import { Suspense, useMemo, useState } from 'react'
import { Clock, FileText, Layers, Play, Save } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'

import type { ComplexConfig } from '@/types/configure'

import {
  isComplexConfig,
  isCountdownConfig,
  isIntervalConfig,
  isStopwatchConfig,
} from '@/types/configure'
import { saveTimerPreset } from '@/lib/configure/save-preset'
import { storage } from '@/lib/configure/storage'
import {
  formatDuration,
  generateComplexTimerName,
  processTimerConfig,
  validateTimerConfig,
} from '@/lib/configure/utils'
import { TimerType } from '@/lib/enums'
import { cn } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import { SetupBackButton } from '@/components/configure/components/shared/SetupBackButton'
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
import { ClientOnly } from '@/components/ClientOnly'
import { ComplexFieldsForm } from '@/components/configure/components/complex-fields-form/ComplexFieldsForm'
import { PhaseSummary } from '@/components/configure/components/complex-fields-form/components/PhaseSummary'
import { FormErrors } from '@/components/configure/components/shared/FormErrors'
import { PageContainer } from '@/components/PageContainer'

const calculateDuration = (config: Partial<ComplexConfig>) => {
  if (!config.phases || config.phases.length === 0) return 0

  return config.phases.reduce((total, phase) => {
    const c = phase.config
    if (isCountdownConfig(c)) return total + c.duration
    if (isIntervalConfig(c)) {
      return total + (c.workDuration + c.restDuration) * c.intervals - c.restDuration
    }
    if (isStopwatchConfig(c)) return total + (c.timeLimit || 0)
    return total
  }, 0)
}

export default function ConfigureComplexTimerPage() {
  return (
    <Suspense fallback={null}>
      <ClientOnly>
        <ComplexPresetLoader />
      </ClientOnly>
    </Suspense>
  )
}

function ComplexPresetLoader() {
  const presetId = useSearchParams().get('preset')
  return <ConfigureComplexTimer key={presetId ?? 'new'} presetId={presetId} />
}

function ConfigureComplexTimer({ presetId }: { presetId: string | null }) {
  const router = useRouter()
  const [initial] = useState(() => {
    const empty: Partial<ComplexConfig> = {
      type: TimerType.COMPLEX,
      name: 'Complex Timer (0 phases, 0s)',
      phases: [],
      autoAdvance: true,
    }
    if (!presetId) return { config: empty, errors: [] as string[] }
    const preset = storage.getPreset(presetId)
    if (!preset || !isComplexConfig(preset.config) || validateTimerConfig(preset.config).length) {
      return { config: empty, errors: ['Preset not found or invalid.'] }
    }
    return { config: preset.config, errors: [] as string[] }
  })
  const [config, setConfig] = useState<Partial<ComplexConfig>>(initial.config)
  const [errors, setErrors] = useState<string[]>(initial.errors)

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

    try {
      storage.storeTimerConfig(fullConfig)
    } catch {
      toast.error('Failed to start timer. Please try again.')
      return
    }
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

    try {
      saveTimerPreset(fullConfig)
      setErrors([])
      toast.success('Preset saved.')
    } catch {
      toast.error('Failed to save preset. Please try again.')
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
          <SetupBackButton onClick={() => router.back()} />
          <div className="flex-1">
            <h1 className="text-foreground text-xl font-bold">Complex Timer Configuration</h1>
            <p className="text-muted-foreground mt-2">
              Create multi-phase timers that combine different timer types in sequence
            </p>
          </div>
        </div>

        {/* Form Errors */}
        <FormErrors errors={errors} />

        <Field>
          <Label htmlFor="timer-name">Timer Name*</Label>
          <Input
            id="timer-name"
            className="max-sm:min-h-11"
            value={config.name || ''}
            onChange={(e) => updateConfig({ name: e.target.value })}
            placeholder="Enter timer name"
            required
          />
        </Field>

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

            <div className="flex flex-col justify-end gap-3 border-t pt-4 sm:flex-row max-sm:*:min-h-11">
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
