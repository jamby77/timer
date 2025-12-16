'use client'

import { useEffect, useMemo, useState } from 'react'

import type { ComplexPhase } from '@/types/configure'

import { TimerType } from '@/types/configure'
import { generateTimerName } from '@/lib/configure/utils'
import { TIMER_TYPE_LABELS } from '@/lib/enums'
import { useMediaQuery } from '@/hooks/use-media-query'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
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
import { createDefaultPhaseConfig, PhaseTimerConfig } from './complex-phase-utils'

type PhaseDraft = Omit<ComplexPhase, 'order'>

interface ComplexPhaseDialogBaseProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  phasesCount: number
}

interface ComplexPhaseDialogAddProps extends ComplexPhaseDialogBaseProps {
  mode: 'add'
  onAddAtStart: (draft: PhaseDraft) => void
  onAddAtEnd: (draft: PhaseDraft) => void
}

interface ComplexPhaseDialogEditProps extends ComplexPhaseDialogBaseProps {
  mode: 'edit'
  phase: ComplexPhase
  onSave: (phaseId: string, draft: PhaseDraft) => void
}

type ComplexPhaseDialogProps = ComplexPhaseDialogAddProps | ComplexPhaseDialogEditProps

const createPhaseId = () => `phase-${Date.now()}`

export const ComplexPhaseDialog = (props: ComplexPhaseDialogProps) => {
  const isLaptop = useMediaQuery('(min-width: 1024px)')

  const [phaseId, setPhaseId] = useState<string>(() => createPhaseId())
  const [draftType, setDraftType] = useState<TimerType>(TimerType.COUNTDOWN)
  const [draftConfig, setDraftConfig] = useState<PhaseTimerConfig>(() =>
    createDefaultPhaseConfig(phaseId, TimerType.COUNTDOWN)
  )
  const [draftName, setDraftName] = useState<string>(() => generateTimerName(draftConfig as any))

  const generatedName = useMemo(() => generateTimerName(draftConfig as any), [draftConfig])

  useEffect(() => {
    if (!props.open) return

    if (props.mode === 'edit') {
      setPhaseId(props.phase.id)
      setDraftType(props.phase.type)
      setDraftConfig(props.phase.config as PhaseTimerConfig)
      setDraftName(props.phase.name)
      return
    }

    const newId = createPhaseId()
    const defaultConfig = createDefaultPhaseConfig(newId, TimerType.COUNTDOWN)
    setPhaseId(newId)
    setDraftType(TimerType.COUNTDOWN)
    setDraftConfig(defaultConfig)
    setDraftName(generateTimerName(defaultConfig as any))
  }, [props.open, props.mode, props.mode === 'edit' ? props.phase.id : undefined])

  const renderFields = () => {
    switch (draftType) {
      case TimerType.COUNTDOWN:
        return (
          <CountdownFields
            config={draftConfig as any}
            onChange={(updates) => handleConfigChange(updates)}
          />
        )
      case TimerType.STOPWATCH:
        return (
          <StopwatchFields
            config={draftConfig as any}
            onChange={(updates) => handleConfigChange(updates)}
          />
        )
      case TimerType.INTERVAL:
        return (
          <IntervalFields
            config={draftConfig as any}
            onChange={(updates) => handleConfigChange(updates)}
          />
        )
      case TimerType.WORKREST:
        return (
          <WorkRestFields
            config={draftConfig as any}
            onChange={(updates) => handleConfigChange(updates)}
          />
        )
      default:
        return null
    }
  }

  const handleConfigChange = (updates: Partial<PhaseTimerConfig>) => {
    setDraftConfig((prev) => {
      const next = { ...prev, ...updates } as PhaseTimerConfig
      const prevGenerated = generateTimerName(prev as any)
      const shouldUpdateName = !draftName || draftName === prevGenerated
      if (shouldUpdateName) {
        setDraftName(generateTimerName(next as any))
      }
      return next
    })
  }

  const handleTypeChange = (type: TimerType) => {
    const nextConfig = createDefaultPhaseConfig(phaseId, type)
    const prevGenerated = generateTimerName(draftConfig as any)
    const shouldUpdateName = !draftName || draftName === prevGenerated

    setDraftType(type)
    setDraftConfig(nextConfig)
    if (shouldUpdateName) {
      setDraftName(generateTimerName(nextConfig as any))
    }
  }

  const draft: PhaseDraft = {
    id: phaseId,
    name: draftName,
    type: draftType,
    config: draftConfig as any,
  }

  const close = () => props.onOpenChange(false)

  const handleAddAtStart = () => {
    if (props.mode !== 'add') return
    props.onAddAtStart(draft)
    close()
  }

  const handleAddAtEnd = () => {
    if (props.mode !== 'add') return
    props.onAddAtEnd(draft)
    close()
  }

  const handleSave = () => {
    if (props.mode !== 'edit') return
    props.onSave(props.phase.id, draft)
    close()
  }

  const title = props.mode === 'edit' ? 'Edit phase' : 'Add phase'

  const footerButtons = (() => {
    if (props.mode === 'edit') {
      return (
        <>
          <Button variant="outline" onClick={close}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </>
      )
    }

    if (props.phasesCount === 0) {
      return (
        <>
          <Button variant="outline" onClick={close}>
            Cancel
          </Button>
          <Button onClick={handleAddAtStart}>Add</Button>
        </>
      )
    }

    return (
      <>
        <Button variant="outline" onClick={close}>
          Cancel
        </Button>
        <Button variant="outline" onClick={handleAddAtStart}>
          Add at the start
        </Button>
        <Button onClick={handleAddAtEnd}>Add at the end</Button>
      </>
    )
  })()

  const body = (
    <div className="space-y-6">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="phase-type">Phase type</FieldLabel>
          <Select
            value={draftType}
            onValueChange={(value) => handleTypeChange(value as TimerType)}
          >
            <SelectTrigger id="phase-type">
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
        </Field>

        {renderFields()}

        <Field>
          <FieldLabel htmlFor="phase-name">Phase name</FieldLabel>
          <Input
            id="phase-name"
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
            placeholder={generatedName}
          />
        </Field>
      </FieldGroup>
    </div>
  )

  if (isLaptop) {
    return (
      <Dialog open={props.open} onOpenChange={props.onOpenChange} modal>
        <DialogContent className="overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          {body}
          <DialogFooter className="gap-2">{footerButtons}</DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={props.open} onOpenChange={props.onOpenChange}>
      <DrawerContent className="overflow-hidden">
        <DrawerHeader className="text-left sm:text-center">
          <DrawerTitle>{title}</DrawerTitle>
        </DrawerHeader>
        <div className="h-full overflow-hidden overflow-y-auto p-4">{body}</div>
        <div className="mt-auto flex flex-col gap-2 p-4">{footerButtons}</div>
      </DrawerContent>
    </Drawer>
  )
}
