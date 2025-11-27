import { vi } from 'vitest'

/**
 * Mock localStorage implementation for testing
 */
export const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    }),
    key: vi.fn((index: number) => {
      const keys = Object.keys(store)
      return keys[index] || null
    }),
    get length() {
      return Object.keys(store).length
    },
  }
})()

/**
 * Sets up global localStorage mock for tests
 */
export const setupLocalStorageMock = () => {
  vi.stubGlobal('localStorage', localStorageMock)
}
