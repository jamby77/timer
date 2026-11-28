import { expect, test } from 'playwright/test'

import type { Page } from 'playwright/test'

async function openTimer(page: Page, type: string, recover = false) {
  await page.addInitScript(
    ({ type, recover }) => {
      const NativeAudioContext = window.AudioContext
      let attempts = 0
      class UnavailableAudioContext extends NativeAudioContext {
        constructor(options?: AudioContextOptions) {
          attempts++
          if (!recover || attempts === 1) throw new Error('Audio device unavailable')
          super(options)
        }
      }
      window.AudioContext = UnavailableAudioContext
      const samples: number[] = []
      Object.assign(window, { recoveredSamples: samples })
      const create = NativeAudioContext.prototype.createBufferSource
      NativeAudioContext.prototype.createBufferSource = function () {
        const osc = create.call(this)
        const start = osc.start.bind(osc)
        osc.start = (when = 0) => {
          samples.push(when)
          start(when)
        }
        return osc
      }
      localStorage.setItem(
        'timer_audio-fallback',
        JSON.stringify({
          id: 'audio-fallback',
          name: 'Audio fallback',
          type,
          duration: 2,
          timeLimit: 2,
          workDuration: 2,
          restDuration: 1,
          intervals: 1,
          maxWorkTime: 2,
          maxRounds: 1,
          restMode: 'fixed',
          fixedRestDuration: 1,
          countdownBeforeStart: 0,
          sound: { enabled: true, volume: 0.3, countdownBeeps: 1 },
        })
      )
    },
    { type, recover }
  )
  await page.goto('/?id=audio-fallback')
}

for (const type of ['COUNTDOWN', 'STOPWATCH', 'INTERVAL', 'WORKREST']) {
  test(`${type} runs to completion when audio-context creation fails`, async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(error.message))
    await openTimer(page, type)
    const suffix = type === 'INTERVAL' ? 'intervals' : type === 'WORKREST' ? 'work' : 'timer'
    await page.getByRole('button', { name: `Start ${suffix}`, exact: true }).click()
    await expect(page.locator('[data-timer-state]')).toHaveAttribute('data-timer-state', 'running')
    await expect(page.locator('[data-timer-state]')).toHaveAttribute(
      'data-timer-state',
      'completed',
      { timeout: 6000 }
    )
    expect(errors).toEqual([])
  })
}

test('a later Start retries audio initialization and restores sound', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await openTimer(page, 'COUNTDOWN', true)
  await page.getByRole('button', { name: 'Start timer', exact: true }).click()
  await expect(page.locator('[data-timer-state]')).toHaveAttribute('data-timer-state', 'running')
  await page.getByRole('button', { name: 'Stop timer', exact: true }).click()
  await page.getByRole('button', { name: 'End', exact: true }).click()
  expect(
    await page.evaluate(
      () => (window as unknown as { recoveredSamples: number[] }).recoveredSamples.length
    )
  ).toBe(0)
  await page.waitForTimeout(1100)
  await page.getByRole('button', { name: 'Start timer', exact: true }).click()
  await expect
    .poll(() =>
      page.evaluate(
        () => (window as unknown as { recoveredSamples: number[] }).recoveredSamples.length
      )
    )
    .toBe(1)
  await expect(page.locator('[data-timer-state]')).toHaveAttribute('data-timer-state', 'running')
  await expect(page.locator('[data-timer-state]')).toHaveAttribute(
    'data-timer-state',
    'completed',
    { timeout: 4000 }
  )
  expect(errors).toEqual([])
})
