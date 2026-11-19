import { expect, test } from 'playwright/test'

test('capped Stopwatch exposes progress from zero through pause and completion', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('timer_progress', JSON.stringify({
      id: 'progress', name: 'Four-second Stopwatch', type: 'STOPWATCH', timeLimit: 4,
    }))
  })
  await page.goto('/?id=progress')
  const bar = page.getByRole('progressbar', { name: 'Timer progress', exact: true })
  const start = page.getByRole('button', { name: 'Start timer', exact: true })
  await expect(bar).toHaveAttribute('aria-valuenow', '0')
  await page.clock.install()
  await start.click()
  await expect.poll(async () => Number(await bar.getAttribute('aria-valuenow'))).toBeGreaterThan(10)
  await page.getByRole('button', { name: 'Pause timer', exact: true }).click()
  const paused = await bar.getAttribute('aria-valuenow')
  expect(Number(paused)).toBeLessThan(100)
  await page.clock.fastForward(5000)
  await expect(bar).toHaveAttribute('aria-valuenow', paused!)
  await start.click()
  await expect(page.locator('[data-timer-state]')).toHaveAttribute('data-timer-state', 'completed')
  await expect(bar).toHaveAttribute('aria-valuenow', '100')
})
