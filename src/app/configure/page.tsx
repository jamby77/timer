'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import { AnyTimerConfig, PredefinedStyle, RecentTimer, TimerType } from '@/types/configure'
import { PREDEFINED_STYLES } from '@/lib/configure/presets'
import { storage } from '@/lib/configure/storage'
import { TimerConfigHash } from '@/lib/timer/TimerConfigHash'

import { PredefinedStyles } from '@/components/configure/PredefinedStyles'
import { RecentTimers } from '@/components/configure/RecentTimers'
import { TimerConfig } from '@/components/configure/TimerConfig'
import { TimerTypeSelector } from '@/components/configure/TimerTypeSelector'
import { PageContainer } from '@/components/PageContainer'

export default function ConfigurePage() {
  const [recentTimers, setRecentTimers] = useState<RecentTimer[]>([])
  const [selectedTimer, setSelectedTimer] = useState<TimerType | null>(null)
  const [selectedPredefined, setSelectedPredefined] =
    useState<PredefinedStyle<AnyTimerConfig> | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Load recent timers on mount
    const timers = storage.getRecentTimers()
    setRecentTimers(timers)
  }, [])

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

    // Store timer configuration and add to recent timers
    storage.storeTimerConfig(finalConfig)
    storage.addRecentTimer(finalConfig)
    setRecentTimers(storage.getRecentTimers())

    // Navigate to appropriate timer page
    switch (finalConfig.type) {
      case TimerType.COUNTDOWN:
        router.push(`/?id=${finalConfig.id}`)
        break
      case TimerType.STOPWATCH:
        router.push(`/?id=${finalConfig.id}`)
        break
      case TimerType.INTERVAL:
        router.push(`/?id=${finalConfig.id}`)
        break
      case TimerType.WORKREST:
        router.push(`/?id=${finalConfig.id}`)
        break
      case TimerType.COMPLEX:
        router.push(`/?id=${finalConfig.id}`)
        break
    }
  }

  const handleRemoveTimer = (timerId: string) => {
    storage.removeTimer(timerId)
    setRecentTimers(storage.getRecentTimers())
  }

  const handleToggleSelectedTimer = (timer: TimerType) => {
    if (selectedTimer === timer) {
      setSelectedTimer(null)
    } else {
      setSelectedTimer(timer)
    }
  }

  return (
    <PageContainer>
      <div className="mx-auto max-w-7xl space-y-2 px-4 sm:px-6 md:space-y-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-foreground text-3xl font-bold">Configure Timer</h1>
          <p className="text-muted-foreground mt-2">Create custom timers or choose from a preset</p>
        </div>

        {/* Recent Timers Section */}
        <RecentTimers
          timers={recentTimers}
          onStartTimer={handleStartTimer}
          onRemoveTimer={handleRemoveTimer}
        />

        {/* Main Content Area */}
        <div className="lg:grid lg:grid-cols-12 lg:gap-6">
          {/* Main Column - Timer Type Selection */}
          <div className="space-y-6 lg:col-span-8">
            <TimerTypeSelector
              selectedTimer={selectedTimer}
              onTimerSelect={handleToggleSelectedTimer}
            />

            {/* Configuration Form - appears below timer type when selected */}
            {(selectedTimer || selectedPredefined) && (
              <TimerConfig
                open={true}
                onOpenChange={() => {}}
                type={selectedTimer || selectedPredefined?.config.type || TimerType.COUNTDOWN}
                initialConfig={selectedPredefined?.config}
                isPredefined={!!selectedPredefined}
                onStartTimer={(config) => handleStartTimer(config, !!selectedPredefined)}
                onSaveAsPredefined={(config) => {
                  // TODO: Implement save as predefined functionality
                  console.log('Save as predefined:', config)
                }}
              />
            )}
          </div>

          {/* Sidebar - Predefined Styles */}
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-8">
              <PredefinedStyles
                styles={PREDEFINED_STYLES}
                onSelectStyle={setSelectedPredefined}
                onStartTimer={(config) => handleStartTimer(config, true)}
              />
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  )
}
