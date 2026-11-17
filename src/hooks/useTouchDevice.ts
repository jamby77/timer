import { useSyncExternalStore } from 'react'

import { isTouchDevice } from '@/lib/device-utils'

let detectedTouch = false
const getSnapshot = () => detectedTouch || isTouchDevice()

const subscribe = (onChange: () => void) => {
  const onResize = () => {
    detectedTouch = false
    onChange()
  }
  const onTouch = () => {
    detectedTouch = true
    onChange()
  }
  window.addEventListener('resize', onResize)
  window.addEventListener('touchstart', onTouch)
  return () => {
    window.removeEventListener('resize', onResize)
    window.removeEventListener('touchstart', onTouch)
  }
}

export function useTouchDevice(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, () => false)
}
