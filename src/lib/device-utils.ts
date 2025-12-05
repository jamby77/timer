/**
 * Utility functions for device detection
 */
/**
 * Checks if the current device has touch capabilities
 * This can be used both in browser and server-side rendering (returns false on server)
 * @returns {boolean} True if the device has touch capabilities, false otherwise
 */
export function isTouchDevice(): boolean {
  if (typeof window === 'undefined') {
    return false
  }

  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    (navigator as any).msMaxTouchPoints > 0
  )
}
