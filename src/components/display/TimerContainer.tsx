'use client'

import { ReactNode, useEffect } from 'react'

import { cn } from '@/lib/utils'

export const TimerContainer = ({
  children,
  fullscreen = false,
}: {
  children: ReactNode
  fullscreen?: boolean
}) => {
  useEffect(() => {
    const root = document.documentElement

    if (fullscreen) {
      root.dataset.fullscreen = 'true'
    } else {
      delete root.dataset.fullscreen
    }

    return () => {
      delete root.dataset.fullscreen
    }
  }, [fullscreen])

  return (
    <div
      className={cn('flex max-h-screen w-full flex-col items-center gap-6 overflow-y-auto pb-8', {
        'fixed inset-0 z-9999 max-h-none items-stretch gap-0 overflow-hidden p-0': fullscreen,
      })}
    >
      {children}
    </div>
  )
}
