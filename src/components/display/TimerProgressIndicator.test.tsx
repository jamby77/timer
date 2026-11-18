import { cleanup, render } from '@testing-library/react'
import { afterEach, expect, it } from 'vitest'

import { TimerProgressIndicator } from './TimerProgressIndicator'

afterEach(cleanup)

it('exposes the current timer percentage as progress changes', () => {
  const props = { isRunning: true, isRest: false, isVisible: true, minTime: 0, maxTime: 60 }
  const view = render(<TimerProgressIndicator {...props} progress={0} />)

  for (const progress of [0, 45, 100]) {
    view.rerender(<TimerProgressIndicator {...props} progress={progress} />)
    const bar = view.getByRole('progressbar', { name: 'Timer progress' })
    expect(bar.getAttribute('aria-valuenow')).toBe(String(progress))
  }
})
