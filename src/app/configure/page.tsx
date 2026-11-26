'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'

import { AnyTimerConfig, PredefinedStyle, RecentTimer, TimerType } from '@/types/configure'
import { getStarterPresets } from '@/lib/configure/new-timer'
import { saveTimerPreset } from '@/lib/configure/save-preset'
import { storage } from '@/lib/configure/storage'
import { validateTimerConfig } from '@/lib/configure/utils'
import { TimerConfigHash } from '@/lib/timer/TimerConfigHash'

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ClientOnly } from '@/components/ClientOnly'
import { PredefinedStyles } from '@/components/configure/PredefinedStyles'
import { RecentTimers } from '@/components/configure/RecentTimers'
import { TimerConfig } from '@/components/configure/TimerConfig'
import { TimerTypeSelector } from '@/components/configure/TimerTypeSelector'
import { PageContainer } from '@/components/PageContainer'

export default function ConfigurePage() {
  return (
    <Suspense fallback={null}>
      <ClientOnly>
        <ConfigurePageContent />
      </ClientOnly>
    </Suspense>
  )
}

function ConfigurePageContent() {
  const [recentTimers, setRecentTimers] = useState<RecentTimer[]>(() => storage.getRecentTimers())
  const [selectedTimer, setSelectedTimer] = useState<TimerType | null>(null)
  const [selectedPredefined, setSelectedPredefined] =
    useState<PredefinedStyle<AnyTimerConfig> | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const setupTab = searchParams.get('tab') === 'presets' ? 'presets' : 'new'

  function changeTab(value: string) {
    const url = new URL(window.location.href)
    if (value === 'presets') url.searchParams.set('tab', value)
    else url.searchParams.delete('tab')
    window.history.replaceState(null, '', url)
  }

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
          <h5 className={recentTimers.length ? "mb-2 px-2 text-base font-semibold sm:invisible sm:mb-0" : "invisible text-base"}>
            Recent timers
          </h5>
          <RecentTimers
            timers={recentTimers}
            onStartTimer={handleStartTimer}
            onRemoveTimer={handleRemoveTimer}
          />
        </div>
        <Tabs value={setupTab} onValueChange={changeTab} className="bg-background mx-2 overflow-hidden rounded-lg border">
          <TabsList aria-label="Timer setup" className="flex h-auto rounded-none p-0">
            {(['New', 'Presets'] as const).map(label => (
              <TabsTrigger
                key={label}
                value={label.toLowerCase()}
                className="min-h-11 flex-1 rounded-none border-b border-t-2 border-t-muted font-semibold last:border-l focus-visible:-outline-offset-2 focus-visible:outline-2 data-[state=active]:border-b-transparent data-[state=active]:shadow-none"
              >
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value="new" className="mt-0 p-2 md:p-6">
            <TimerTypeSelector selectedTimer={selectedTimer} onTimerSelect={handleToggleSelectedTimer} />
          </TabsContent>
          <TabsContent value="presets" className="mt-0 p-2 md:p-6">
            <PredefinedStyles
              styles={[...starterPresets, ...customPresets]}
              onSelectStyle={handleSelectPreset}
              onStartTimer={(config) => handleStartTimer(config, true)}
            />
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  )
}
