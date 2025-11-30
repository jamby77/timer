'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

import { AnyTimerConfig, TimerType } from '@/types/configure'
import { storage } from '@/lib/configure/storage'

import { Interval } from '@/components/display/Interval'
import { Stopwatch } from '@/components/display/Stopwatch'
import { Timer } from '@/components/display/Timer'
import { WorkRestTimer } from '@/components/display/WorkRestTimer'

export default function Home() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [timerConfig, setTimerConfig] = useState<AnyTimerConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  // Wait for component to mount to avoid hydration issues
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const id = searchParams.get('id')

    if (!id) {
      // No ID parameter, redirect to configure
      router.push('/configure')
      return
    }

    // Try to load timer with the given ID
    const timer = storage.getTimerConfig(id)

    if (!timer) {
      // Timer not found, redirect to configure
      router.push('/configure')
      return
    }

    // Timer found, set it as the config
    setTimerConfig(timer)
    setLoading(false)
  }, [searchParams, router, mounted])

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-10 p-4">
        <div className="text-muted-foreground">Loading timer...</div>
      </div>
    )
  }

  if (!timerConfig) {
    return null // Will redirect
  }

  // Render the appropriate timer based on type
  const renderTimer = () => {
    if (timerConfig.type === TimerType.COUNTDOWN) {
      return <Timer config={timerConfig} />
    }

    if (timerConfig.type === TimerType.STOPWATCH) {
      return <Stopwatch config={timerConfig} />
    }

    if (timerConfig.type === TimerType.INTERVAL) {
      return <Interval intervalConfig={timerConfig} />
    }

    if (timerConfig.type === TimerType.WORKREST) {
      return <WorkRestTimer config={timerConfig} />
    }

    // Complex timer or any other unimplemented type
    return (
      <div className="text-center">
        <h2 className="mb-4 text-2xl font-bold">Timer: {timerConfig.name || 'Untitled'}</h2>
        <p className="text-muted-foreground">
          Timer type {timerConfig.type} is not yet implemented in the display view.
        </p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-10 p-4">
      {renderTimer()}
    </div>
  )
}
