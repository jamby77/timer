'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

import { AnyTimerConfig, TimerType } from '@/types/configure'
import { storage } from '@/lib/configure/storage'

import { TimerRecovery } from '@/contexts/TimerRecovery'
import { ClientOnly } from '@/components/ClientOnly'
import { ComplexTimer } from '@/components/display/ComplexTimer'
import { Interval } from '@/components/display/Interval'
import { Stopwatch } from '@/components/display/Stopwatch'
import { Timer } from '@/components/display/Timer'
import { WorkRestTimer } from '@/components/display/WorkRestTimer'
import { InstallPrompt } from '@/components/InstallPrompt'

export const Body = () => {
  const id = useSearchParams().get('id')
  return (
    <ClientOnly fallback={<LoadingTimer />}>
      <TimerSession key={id} id={id} />
    </ClientOnly>
  )
}

const LoadingTimer = () => (
  <div className="flex min-h-screen flex-col items-center justify-center gap-10 p-4">
    <div className="text-muted-foreground">Loading timer...</div>
  </div>
)

const TimerSession = ({ id }: { id: string | null }) => {
  const router = useRouter()
  const [timerConfig] = useState<AnyTimerConfig | null>(() =>
    id ? storage.getTimerConfig(id) : null
  )
  const showInstallPrompt = process.env.NODE_ENV === 'production'

  useEffect(() => {
    if (!timerConfig) router.replace('/configure')
  }, [router, timerConfig])

  if (!timerConfig) return <LoadingTimer />

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

    if (timerConfig.type === TimerType.COMPLEX) {
      return <ComplexTimer config={timerConfig} />
    }

    // Complex timer or any other unimplemented type
    return (
      <div className="text-center">
        <p className="text-muted-foreground">
          This timer type is not yet implemented in the display view.
        </p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col items-center justify-center gap-10 p-4 max-sm:has-[[data-install-banner]]:h-[calc(100dvh-4rem)] max-sm:has-[[data-install-banner]]:justify-start max-sm:gap-3">
      {showInstallPrompt && <InstallPrompt />}
      <TimerRecovery config={timerConfig}>{renderTimer()}</TimerRecovery>
    </div>
  )
}

export default Body
