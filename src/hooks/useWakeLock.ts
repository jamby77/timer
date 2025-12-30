import { useCallback, useEffect, useRef } from 'react'

/**
 * Hook to manage screen wake lock to prevent the screen from turning off
 */
export const useWakeLock = (isActive: boolean) => {
  const wakeLockRef = useRef<WakeLockSentinel | null>(null)

  const requestWakeLock = useCallback(async () => {
    try {
      if ('wakeLock' in navigator && !wakeLockRef.current) {
        wakeLockRef.current = await navigator.wakeLock.request('screen')
        console.log('Wake lock acquired')
      }
    } catch (err) {
      console.log('Wake lock failed:', err)
    }
  }, [])

  const releaseWakeLock = useCallback(async () => {
    if (wakeLockRef.current) {
      await wakeLockRef.current.release()
      wakeLockRef.current = null
      console.log('Wake lock released')
    }
  }, [])

  // Manage wake lock based on isActive
  useEffect(() => {
    if (isActive) {
      void requestWakeLock()
    } else {
      void releaseWakeLock()
    }

    // Cleanup on unmounting
    return () => {
      void releaseWakeLock()
    }
  }, [isActive, requestWakeLock, releaseWakeLock])

  // Re-acquire wake lock when the document becomes visible again
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isActive) {
        void requestWakeLock()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [isActive, requestWakeLock])
}
