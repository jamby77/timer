'use client'

import { ReactNode, useEffect } from 'react'

import { cn } from '@/lib/utils'

export const TimerContainer = ({
  children,
  header,
  fullscreen = false,
}: {
  children: ReactNode
  header?: ReactNode
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
      {header && <div className="bg-background text-foreground w-full shrink-0 p-3">{header}</div>}
      {fullscreen && header ? <div className="min-h-0 flex-1">{children}</div> : children}
    </div>
  )
}
