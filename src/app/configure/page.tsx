'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { AnyTimerConfig, PredefinedStyle, RecentTimer, TimerType } from '@/types/configure'
import { getStarterPresets } from '@/lib/configure/new-timer'
import { saveTimerPreset } from '@/lib/configure/save-preset'
import { storage } from '@/lib/configure/storage'
import { validateTimerConfig } from '@/lib/configure/utils'
import { TimerConfigHash } from '@/lib/timer/TimerConfigHash'

import { ClientOnly } from '@/components/ClientOnly'
import { PredefinedStyles } from '@/components/configure/PredefinedStyles'
import { RecentTimers } from '@/components/configure/RecentTimers'
import { TimerConfig } from '@/components/configure/TimerConfig'
import { TimerTypeSelector } from '@/components/configure/TimerTypeSelector'
import { PageContainer } from '@/components/PageContainer'

export default function ConfigurePage() {
  return (
    <ClientOnly>
      <ConfigurePageContent />
    </ClientOnly>
  )
}

function ConfigurePageContent() {
  const [recentTimers, setRecentTimers] = useState<RecentTimer[]>(() => storage.getRecentTimers())
  const [selectedTimer, setSelectedTimer] = useState<TimerType | null>(null)
  const [selectedPredefined, setSelectedPredefined] =
    useState<PredefinedStyle<AnyTimerConfig> | null>(null)
  const router = useRouter()
  const [starterPresets, setStarterPresets] = useState(getStarterPresets)
  useEffect(() => {
    const refresh = () => setStarterPresets(getStarterPresets())
    window.addEventListener('storage', refresh)
    return () => window.removeEventListener('storage', refresh)
  }, [])
  const [customPresets, setCustomPresets] = useState<PredefinedStyle<AnyTimerConfig>[]>(() =>
    storage
      .getAllPresets()
      .map(({ config }) => config)
      .filter((preset) => validateTimerConfig(preset.config).length === 0)
  )

  const handleStartTimer = (config: AnyTimerConfig, isPredefined: boolean = false) => {
    let finalConfig: AnyTimerConfig

    if (isPredefined) {
      // For predefined configs: copy and add runtime timestamps
      finalConfig = {
        ...config,
        id: TimerConfigHash.generateTimerId(config),
        createdAt: new Date(),
        lastUsed: new Date(),
      }
    } else {
      // For custom configs: ensure ID exists
      finalConfig = {
        ...config,
        id: config.id || TimerConfigHash.generateTimerId(config),
        createdAt: config.createdAt || new Date(),
        lastUsed: new Date(),
      }
    }

    try {
      storage.storeTimerConfig(finalConfig)
    } catch {
      toast.error('Failed to start timer. Please try again.')
      return
    }
    storage.addRecentTimer(finalConfig)
    setRecentTimers(storage.getRecentTimers())

    // Navigate to appropriate timer page
    router.push(`/?id=${finalConfig.id}`)
  }

  const handleSavePreset = (config: AnyTimerConfig) => {
    try {
      saveTimerPreset(config)
      setCustomPresets(
        storage
          .getAllPresets()
          .map(({ config }) => config)
          .filter((preset) => validateTimerConfig(preset.config).length === 0)
      )
      toast.success('Preset saved.')
    } catch {
      toast.error('Failed to save preset. Please try again.')
    }
  }

  const handleSelectPreset = (preset: PredefinedStyle<AnyTimerConfig>) => {
    if (preset.config.type === TimerType.COMPLEX) {
      router.push(`/configure/complex?preset=${encodeURIComponent(preset.id)}`)
      return
    }
    setSelectedPredefined(preset)
  }

  const handleRemoveTimer = (timerId: string) => {
    try {
      storage.removeTimer(timerId)
      setRecentTimers(storage.getRecentTimers())
    } catch {
      toast.error('Failed to remove timer. Please try again.')
    }
  }

  const handleToggleSelectedTimer = (timer: TimerType) => {
    if (timer === TimerType.COMPLEX) {
      router.push('/configure/complex')
      return
    }
    if (selectedTimer === timer) {
      setSelectedTimer(null)
    } else {
      setSelectedTimer(timer)
    }
  }
  if (selectedTimer || selectedPredefined) {
    /* Configuration Form - appears when "timer type" is selected */
    return (
      <TimerConfig
        type={selectedTimer || selectedPredefined?.config.type || TimerType.COUNTDOWN}
        initialConfig={selectedPredefined?.config}
        isPredefined={!!selectedPredefined}
        onStartTimer={(config) => handleStartTimer(config, !!selectedPredefined)}
        onSaveAsPredefined={handleSavePreset}
        onCancel={() => {
          setSelectedTimer(null)
          setSelectedPredefined(null)
        }}
      />
    )
  }

  return (
    <PageContainer>
      <div className="mx-auto max-w-7xl space-y-2 px-0 md:space-y-6 md:px-6">
        {/* Recent Timers Section */}
        <div>
          <h5 className="text-muted-foreground invisible text-center text-base sm:block">
            Recent Timers
          </h5>
          <RecentTimers
            timers={recentTimers}
            onStartTimer={handleStartTimer}
            onRemoveTimer={handleRemoveTimer}
          />
        </div>
        <div className="space-y-2">
          <h1 className="text-foreground text-center text-xl uppercase">Configure Timer</h1>
          <p className="text-muted-foreground text-center">
            Create custom timers or choose from a preset
          </p>
        </div>

        {/* Main Content Area */}
        <div className="lg:grid lg:grid-cols-12 lg:gap-6">
          {/* Main Column - Timer Type Selection */}
          <div className="space-y-2 md:space-y-6 lg:col-span-8">
            <TimerTypeSelector
              selectedTimer={selectedTimer}
              onTimerSelect={handleToggleSelectedTimer}
            />
          </div>

          {/* Sidebar - Predefined Styles */}
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-8">
              <PredefinedStyles
                styles={[...starterPresets, ...customPresets]}
                onSelectStyle={handleSelectPreset}
                onStartTimer={(config) => handleStartTimer(config, true)}
              />
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  )
}
