'use client'

import { useEffect, useState } from 'react'
import { Plus, Share, X } from 'lucide-react'

import { Button } from '@/components/ui/button'

type BeforeInstallPromptOutcome = 'accepted' | 'dismissed'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: BeforeInstallPromptOutcome }>
}

const DISMISSAL_STORAGE_KEY = 'pwa-install-dismissed'
const DISMISSAL_DURATION_MS = 30 * 24 * 60 * 60 * 1000 // 30 days

export const InstallPrompt = () => {
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream)

    const isStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true
    setIsStandalone(isStandaloneMode)

    // Check if prompt was dismissed within the last 30 days
    const checkDismissalStatus = () => {
      const dismissedTimestamp = localStorage.getItem(DISMISSAL_STORAGE_KEY)
      if (dismissedTimestamp) {
        const dismissedTime = parseInt(dismissedTimestamp, 10)
        const now = Date.now()
        if (now - dismissedTime < DISMISSAL_DURATION_MS) {
          setIsVisible(false)
          return
        }
      }
      setIsVisible(true)
    }

    checkDismissalStatus()

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

  const handleDismiss = () => {
    // Store dismissal timestamp
    localStorage.setItem(DISMISSAL_STORAGE_KEY, Date.now().toString())
    setIsVisible(false)
  }

  if (isStandalone || !isVisible) {
    return null // Don't show install button if already installed or dismissed
  }

  if (!isIOS && !deferredPrompt) {
    return null
  }

  return (
    <div className="bg-background/80 fixed top-16 right-0 z-50 w-screen space-y-2 px-4 py-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Install App</h3>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleDismiss}
          className="h-6 w-6 p-0"
          aria-label="Dismiss install prompt"
        >
          <X className="size-4" />
        </Button>
      </div>
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
