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
    if (fullscreen) root.dataset.fullscreen = 'true'
    else delete root.dataset.fullscreen
    return () => {
      delete root.dataset.fullscreen
    }
  }, [fullscreen])

  return (
    <div
      className={cn('mx-auto flex h-[calc(100dvh-6rem)] min-h-64 w-full max-w-5xl flex-col gap-2', {
        'bg-background fixed inset-0 z-9999 h-dvh min-h-0 max-w-none gap-0 overflow-hidden':
          fullscreen,
      })}
    >
      <div className="flex min-h-0 flex-1 flex-col gap-2">{children}</div>
    </div>
  )
}
