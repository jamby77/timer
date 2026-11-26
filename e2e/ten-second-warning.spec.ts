import { expect, test } from 'playwright/test'

test.use({ viewport: { width: 320, height: 640 }, isMobile: true, hasTouch: true })

test('10s warning is off by default and survives saving and reopening', async ({ page }) => {
  await page.goto('/configure')
  await page.getByRole('heading', { name: 'Countdown', exact: true }).tap()
  await page.locator('input[name=seconds]').pressSequentially('15')
  const sounds = page.getByRole('switch', { name: 'Sounds', exact: true })
  const warning = page.getByRole('switch', { name: '10s warning', exact: true })
  await expect(warning).toBeHidden()
  await sounds.tap()
  await expect(warning).not.toBeChecked()
  await page.getByText('Double beep with 10s left.').tap()
  await expect(warning).toBeChecked()
  await warning.press('Space')
  await expect(warning).not.toBeChecked()
  await warning.press('Space')
  await page.getByLabel(/Timer Name/).fill('Warning check')
  await page.getByRole('button', { name: 'Save as Preset' }).tap()
  await expect(page.getByText('Preset saved.', { exact: true })).toBeVisible()
  await page.reload()
  await page.getByRole('tab', { name: 'Presets', exact: true }).click()
  await page.getByRole('heading', { name: 'Warning check', exact: true }).tap()
  await expect(warning).toBeChecked()
})

for (const background of [false, true]) {
  test(
    background
      ? 'Returning from the background skips a missed warning'
      : 'Countdown plays the warning sample once across pause and resume',
    async ({ page }) => {
      await page.clock.install({ time: new Date('2026-01-01T12:00:00Z') })
      await page.clock.pauseAt(new Date('2026-01-01T12:01:00Z'))
      await page.addInitScript(() => {
        const cues: number[] = []
        Object.assign(window, { cueDurations: cues })
        const start = AudioBufferSourceNode.prototype.start
        AudioBufferSourceNode.prototype.start = function (...args) {
          if (this.buffer) cues.push(this.buffer.duration)
          return start.apply(this, args)
        }
        localStorage.setItem(
          'timer_warn',
          JSON.stringify({
            id: 'warn',
            name: 'Warning check',
            type: 'COUNTDOWN',
            duration: 12,
            sound: { enabled: true, volume: 0.7, tenSecondWarning: true },
          })
        )
      })
      await page.goto('/?id=warn')
      await page.getByRole('button', { name: 'Start timer' }).tap()
      await expect(page.locator('[data-timer-state]')).toHaveAttribute(
        'data-timer-state',
        'running'
      )
      if (background) {
        await page.evaluate(() => {
          Object.defineProperty(document, 'hidden', { configurable: true, value: true })
          document.dispatchEvent(new Event('visibilitychange'))
        })
      }
      await page.clock.runFor(2500)
      if (background) {
        await page.evaluate(() => {
          Reflect.deleteProperty(document, 'hidden')
          document.dispatchEvent(new Event('visibilitychange'))
        })
      }
      await page.getByRole('button', { name: 'Pause timer' }).tap()
      await page.clock.fastForward(3000)
      await page.getByRole('button', { name: 'Resume timer' }).tap()
      await page.clock.runFor(500)
      const cues = await page.evaluate(
        () => (window as unknown as { cueDurations: number[] }).cueDurations
      )
      expect(cues.filter((duration) => Math.abs(duration - 0.63) < 0.001)).toHaveLength(
        background ? 0 : 1
      )
    }
  )
}
