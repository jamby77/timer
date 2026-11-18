import { expect, test } from 'playwright/test'

for (const mode of ['Countdown', 'Complex', 'preset']) {
  test(`${mode} reports a failed timer write and retries without losing settings`, async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    await page.goto(mode === 'Complex' ? '/configure/complex' : '/configure')
    if (mode === 'Complex') {
      await page.getByRole('button', { name: 'Add Phase', exact: true }).click()
      await page.getByLabel('Phase name').fill('Keep this phase')
      await page.getByRole('button', { name: 'Add', exact: true }).click()
      await page.getByLabel('Timer Name*', { exact: true }).fill('Keep this workout')
    } else if (mode === 'Countdown') {
      await page.getByRole('heading', { name: 'Countdown', exact: true }).click()
      await page.getByLabel(/Timer Name/).fill('Keep this timer')
      await page.locator('input[name=seconds]').fill('30')
    }
    await page.evaluate(() => {
      const original = Storage.prototype.setItem
      Storage.prototype.setItem = function (key, value) {
        if (key.startsWith('timer_')) {
          Storage.prototype.setItem = original
          throw new DOMException('Quota exceeded', 'QuotaExceededError')
        }
        return original.call(this, key, value)
      }
    })
    const start = mode === 'preset'
      ? page.getByRole('button').filter({ has: page.getByRole('heading', { name: 'Tabata', exact: true }) }).getByRole('button', { name: 'Start', exact: true })
      : page.getByRole('button', { name: 'Start Timer', exact: true })
    await start.click()
    await expect(page.getByText('Failed to start timer. Please try again.', { exact: true })).toBeVisible()
    await expect(page).toHaveURL(mode === 'Complex' ? /\/configure\/complex$/ : /\/configure$/)
    expect(errors).toEqual([])
    expect(await page.evaluate(() => localStorage.getItem('recent_timers'))).toBeNull()
    if (mode === 'Countdown') {
      await expect(page.getByLabel(/Timer Name/)).toHaveValue('Keep this timer')
      await expect(page.locator('input[name=seconds]')).toHaveValue('30')
    }
    if (mode === 'Complex') await expect(page.getByLabel('Timer Name*', { exact: true })).toHaveValue('Keep this workout')
    await start.click()
    await expect(page).toHaveURL(/\/\?id=/)
    const config = await page.evaluate(() => {
      const id = new URL(location.href).searchParams.get('id')!
      return JSON.parse(localStorage.getItem(`timer_${id}`)!)
    })
    if (mode === 'Countdown') expect(config).toMatchObject({ name: 'Keep this timer', duration: 30 })
    if (mode === 'Complex') expect(config.phases[0].name).toBe('Keep this phase')
    if (mode === 'preset') expect(config.intervals).toBe(8)
    await page.getByRole('button', { name: mode === 'preset' ? 'Start intervals' : 'Start timer', exact: true }).click()
    await expect(page.locator('[data-timer-state]')).toHaveAttribute('data-timer-state', 'running')
  })
}
