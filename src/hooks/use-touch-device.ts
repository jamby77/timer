import { useEffect, useState } from 'react'

import { isTouchDevice } from '@/lib/device-utils'

/**
 * Custom hook that detects if the current device has touch capabilities
 * @returns {boolean} True if the device has touch capabilities, false otherwise
 */
export function useTouchDevice(): boolean {
  const [touchDevice, setTouchDevice] = useState(false)

  useEffect(() => {
    // Initial check
    setTouchDevice(isTouchDevice())

    // Handle window resize in case of device rotation or window resizing
    const handleResize = () => {
      setTouchDevice(isTouchDevice())
    }

    function onFirstTouch() {
      setTouchDevice(true)
    }

    window.addEventListener('resize', handleResize)

    window.addEventListener('touchstart', onFirstTouch, {
      once: true,
    })
    // Cleanup
    return () => {
      window.removeEventListener('touchstart', onFirstTouch)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return touchDevice
}
