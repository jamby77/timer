'use client'

import { useEffect, useState } from 'react'
import { Plus, Share } from 'lucide-react'

import { Button } from '@/components/ui/button'

export const InstallPrompt = () => {
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream)

    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches)
  }, [])

  if (isStandalone) {
    return null // Don't show install button if already installed
  }

  return (
    <div className="bg-background/80 fixed top-16 right-0 z-50 w-screen space-y-2 px-4 py-2">
      <h3 className="text-sm font-semibold">Install App</h3>
      <div className="flex items-start gap-2">
        {isIOS && (
          <p className="text-muted-foreground text-xs">
            To install this app on your iOS device, tap the share button
            <Share className="inline-block size-6 px-1" role="img" aria-label="share icon" />
            and then "Add to Home Screen"
            <Plus className="inline-block size-6 px-1" role="img" aria-label="plus icon" />.
          </p>
        )}
        {!isIOS && (
          <Button size="sm" variant="outline">
            Add to Home Screen
          </Button>
        )}
      </div>
    </div>
  )
}
