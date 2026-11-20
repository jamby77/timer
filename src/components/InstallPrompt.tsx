'use client'

import { useEffect, useState } from 'react'
import { Plus, Share, X } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { ClientOnly } from '@/components/ClientOnly'

type BeforeInstallPromptOutcome = 'accepted' | 'dismissed'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: BeforeInstallPromptOutcome }>
}

const DISMISSAL_STORAGE_KEY = 'pwa-install-dismissed'
const DISMISSAL_COUNT_STORAGE_KEY = 'pwa-install-dismiss-count'
const PERMANENT_DISMISSAL_STORAGE_KEY = 'pwa-install-permanently-dismissed'
const INSTALL_COMPLETED_STORAGE_KEY = 'pwa-install-completed'
const DISMISSAL_DURATION_MS = 30 * 24 * 60 * 60 * 1000 // 30 days

const readPreferences = () => {
  try {
    const storedCount = Number(localStorage.getItem(DISMISSAL_COUNT_STORAGE_KEY))
    const dismissCount = Number.isSafeInteger(storedCount) && storedCount > 0 ? storedCount : 0
    const dismissedTime = Number.parseInt(localStorage.getItem(DISMISSAL_STORAGE_KEY) ?? '', 10)
    const isVisible =
      localStorage.getItem(INSTALL_COMPLETED_STORAGE_KEY) !== 'true' &&
      localStorage.getItem(PERMANENT_DISMISSAL_STORAGE_KEY) !== 'true' &&
      (Number.isNaN(dismissedTime) || Date.now() - dismissedTime >= DISMISSAL_DURATION_MS)
    return { dismissCount, isVisible }
  } catch (error) {
    console.error('Failed to load install prompt preferences:', error)
    return { dismissCount: 0, isVisible: true }
  }
}

const standaloneMode = () =>
  window.matchMedia('(display-mode: standalone)').matches ||
  (window.navigator as unknown as Record<string, unknown>).standalone === true

export const InstallPrompt = () => (
  <ClientOnly>
    <InstallPromptContent />
  </ClientOnly>
)

const InstallPromptContent = () => {
  const [isIOS] = useState(
    () =>
      typeof window !== 'undefined' &&
      /iPad|iPhone|iPod/.test(navigator.userAgent) &&
      !(window as unknown as Record<string, unknown>).MSStream
  )
  const [isStandalone, setIsStandalone] = useState(standaloneMode)
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [preferences] = useState(readPreferences)
  const [isVisible, setIsVisible] = useState(preferences.isVisible)
  const [dismissCount, setDismissCount] = useState(preferences.dismissCount)

  useEffect(() => {
    const recordInstallation = () => {
      setIsVisible(false)
      setDeferredPrompt(null)
      try {
        localStorage.setItem(INSTALL_COMPLETED_STORAGE_KEY, 'true')
      } catch (error) {
        console.error('Failed to save installation status:', error)
      }
    }

    const refreshPreferences = () => {
      const next = readPreferences()
      setDismissCount(next.dismissCount)
      setIsVisible(next.isVisible)
    }

    const storageHandler = (event: StorageEvent) => {
      if (event.storageArea !== localStorage) return
      if (
        event.key === null ||
        [
          DISMISSAL_STORAGE_KEY,
          DISMISSAL_COUNT_STORAGE_KEY,
          PERMANENT_DISMISSAL_STORAGE_KEY,
          INSTALL_COMPLETED_STORAGE_KEY,
        ].includes(event.key)
      ) {
        refreshPreferences()
      }
    }

    if (standaloneMode()) {
      try {
        localStorage.setItem(INSTALL_COMPLETED_STORAGE_KEY, 'true')
      } catch (error) {
        console.error('Failed to save installation status:', error)
      }
    }

    const beforeInstallPromptHandler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }

    const appInstalledHandler = () => {
      recordInstallation()
      setIsStandalone(true)
    }

    const displayModeMediaQuery = window.matchMedia('(display-mode: standalone)')
    const displayModeChangeHandler = (event: MediaQueryListEvent) => {
      setIsStandalone(event.matches)
      if (event.matches) recordInstallation()
    }

    window.addEventListener('beforeinstallprompt', beforeInstallPromptHandler)
    window.addEventListener('appinstalled', appInstalledHandler)
    window.addEventListener('storage', storageHandler)
    displayModeMediaQuery.addEventListener('change', displayModeChangeHandler)

    return () => {
      window.removeEventListener('beforeinstallprompt', beforeInstallPromptHandler)
      window.removeEventListener('appinstalled', appInstalledHandler)
      window.removeEventListener('storage', storageHandler)
      displayModeMediaQuery.removeEventListener('change', displayModeChangeHandler)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    const installPrompt = deferredPrompt
    setDeferredPrompt(null)
    try {
      await installPrompt.prompt()
      await installPrompt.userChoice
    } catch (error) {
      console.error('Failed to request installation:', error)
      toast.error('Installation could not be completed. Please try again when prompted.')
    }
  }

  const handleDismiss = () => {
    const nextCount = Math.min(dismissCount + 1, 3)
    setDismissCount(nextCount)
    setIsVisible(false)
    try {
      localStorage.setItem(DISMISSAL_STORAGE_KEY, Date.now().toString())
      localStorage.setItem(DISMISSAL_COUNT_STORAGE_KEY, nextCount.toString())
    } catch (error) {
      console.error('Failed to save install prompt dismissal:', error)
    }
  }

  const handlePermanentDismiss = () => {
    setIsVisible(false)
    try {
      localStorage.setItem(PERMANENT_DISMISSAL_STORAGE_KEY, 'true')
    } catch (error) {
      console.error('Failed to save permanent install prompt dismissal:', error)
    }
  }

  if (isStandalone || !isVisible) {
    return null // Don't show install button if already installed or dismissed
  }

  if (!isIOS && !deferredPrompt) {
    return null
  }

  return (
    <div data-install-banner="" className="bg-background/80 max-sm:bg-background fixed top-16 right-0 z-50 w-screen space-y-2 px-4 py-2 max-sm:static max-sm:-mt-4 max-sm:shrink-0 max-sm:border-b [[data-fullscreen=true]_&]:hidden">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Install App</h3>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleDismiss}
          className="h-6 w-6 p-0 max-sm:size-11"
          aria-label="Dismiss install prompt"
        >
          <X className="size-4" />
        </Button>
      </div>
      <div className="flex items-start gap-2">
        {isIOS && (
          <p className="text-muted-foreground text-xs max-sm:text-sm">
            To install this app on your iOS device, tap the share button
            <Share className="inline-block size-6 px-1" role="img" aria-label="share icon" />
            and then &quot;Add to Home Screen&quot;
            <Plus className="inline-block size-6 px-1" role="img" aria-label="plus icon" />.
          </p>
        )}
        {!isIOS && (
          <Button
            size="sm"
            variant="outline"
            className="max-sm:min-h-11 max-sm:w-full"
            onClick={handleInstallClick}
          >
            Install
          </Button>
        )}
      </div>
      {dismissCount >= 3 && (
        <Button
          size="sm"
          variant="ghost"
          className="max-sm:min-h-11 max-sm:w-full"
          onClick={handlePermanentDismiss}
        >
          Never show again
        </Button>
      )}
    </div>
  )
}
