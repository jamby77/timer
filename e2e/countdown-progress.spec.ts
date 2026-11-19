import { expect, test } from 'playwright/test'

test('Countdown exposes its elapsed percentage before, during, and after a run', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('timer_progress', JSON.stringify({
      id: 'progress', name: 'Progress check', type: 'COUNTDOWN', duration: 4,
    }))
  })
  await page.goto('/?id=progress')
  const bar = page.getByRole('progressbar', { name: 'Timer progress', exact: true })
  await expect(bar).toHaveAttribute('aria-valuenow', '0')
  await page.getByRole('button', { name: 'Start timer', exact: true }).click()
  await expect.poll(() => bar.evaluate(element => {
    const percentage = Number(element.getAttribute('aria-valuenow'))
    const display = document.querySelector('[data-slot=card-content]')?.textContent
    const digits = display?.match(/00:(\d{2})\.(\d{2})/)
    if (!digits || percentage < 25 || percentage > 75) return false
    const remainingSeconds = Number(digits[1]) + Number(digits[2]) / 100
    const expectedPercentage = (4 - remainingSeconds) * 25
    return Math.abs(percentage - expectedPercentage) <= 0.26
  })).toBe(true)
  await expect(page.locator('[data-timer-state]')).toHaveAttribute('data-timer-state', 'completed')
  await expect(bar).toHaveAttribute('aria-valuenow', '100')
})
