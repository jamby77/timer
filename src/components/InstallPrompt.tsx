'use client'

import { useEffect, useState } from 'react'
import { Plus, Share } from 'lucide-react'

import { Button } from '@/components/ui/button'

type BeforeInstallPromptOutcome = 'accepted' | 'dismissed'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: BeforeInstallPromptOutcome }>
}

export const InstallPrompt = () => {
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream)

    const isStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true
    setIsStandalone(isStandaloneMode)

    const beforeInstallPromptHandler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }

    const appInstalledHandler = () => {
      setDeferredPrompt(null)
      setIsStandalone(true)
    }

    const displayModeMediaQuery = window.matchMedia('(display-mode: standalone)')
    const displayModeChangeHandler = (event: MediaQueryListEvent) => {
      setIsStandalone(event.matches)
    }

    window.addEventListener('beforeinstallprompt', beforeInstallPromptHandler)
    window.addEventListener('appinstalled', appInstalledHandler)
    displayModeMediaQuery.addEventListener('change', displayModeChangeHandler)

    return () => {
      window.removeEventListener('beforeinstallprompt', beforeInstallPromptHandler)
      window.removeEventListener('appinstalled', appInstalledHandler)
      displayModeMediaQuery.removeEventListener('change', displayModeChangeHandler)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    await deferredPrompt.prompt()
    await deferredPrompt.userChoice
    setDeferredPrompt(null)
  }

  if (isStandalone) {
    return null // Don't show install button if already installed
  }

  if (!isIOS && !deferredPrompt) {
    return null
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
          <Button size="sm" variant="outline" onClick={handleInstallClick}>
            Install
          </Button>
        )}
      </div>
    </div>
  )
}
