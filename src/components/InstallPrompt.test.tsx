import React from 'react'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { InstallPrompt } from './InstallPrompt'

const expiredTimestamp = () => String(Date.now() - 31 * 24 * 60 * 60 * 1000)

async function showPrompt() {
  render(<InstallPrompt />)
  fireEvent(window, new Event('beforeinstallprompt'))
}

beforeEach(() => localStorage.clear())
afterEach(cleanup)

describe('install prompt dismissal', () => {
  it('offers permanent dismissal after three temporary dismissals and remembers it', async () => {
    for (let count = 0; count < 3; count++) {
      await showPrompt()
      expect(screen.queryByText('Never show again')).toBeNull()
      fireEvent.click(await screen.findByRole('button', { name: 'Dismiss install prompt' }))
      expect(localStorage.getItem('pwa-install-dismiss-count')).toBe(String(count + 1))
      cleanup()
      localStorage.setItem('pwa-install-dismissed', expiredTimestamp())
    }
    await showPrompt()
    fireEvent.click(await screen.findByRole('button', { name: 'Never show again' }))
    expect(localStorage.getItem('pwa-install-permanently-dismissed')).toBe('true')
    cleanup()
    await showPrompt()
    expect(screen.queryByText('Install App')).toBeNull()
  })

  it('honors existing timestamp-only dismissals', async () => {
    localStorage.setItem('pwa-install-dismissed', String(Date.now()))
    await showPrompt()
    expect(screen.queryByText('Install App')).toBeNull()
    cleanup()
    localStorage.setItem('pwa-install-dismissed', expiredTimestamp())
    await showPrompt()
    expect(await screen.findByText('Install App')).toBeTruthy()
    expect(screen.queryByText('Never show again')).toBeNull()
  })

  it('recovers from a malformed dismissal count', async () => {
    localStorage.setItem('pwa-install-dismiss-count', 'invalid')
    await showPrompt()
    fireEvent.click(await screen.findByRole('button', { name: 'Dismiss install prompt' }))
    expect(localStorage.getItem('pwa-install-dismiss-count')).toBe('1')
  })
})
