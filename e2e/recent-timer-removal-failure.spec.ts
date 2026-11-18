import { expect, test } from 'playwright/test'

test('failed recent-history write preserves the timer and allows removal retry', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('/configure')
  await page.getByRole('heading', { name: 'Countdown', exact: true }).click()
  await page.getByLabel(/Timer Name/).fill('Remove after retry')
  await page.locator('input[name=seconds]').fill('30')
  await page.getByRole('button', { name: 'Start Timer', exact: true }).click()
  await expect(page).toHaveURL(/\/\?id=/)
  const id = new URL(page.url()).searchParams.get('id')!
  await page.goto('/configure')
  const card = page.locator('[data-slot=card]').filter({ has: page.getByRole('heading', { name: 'Remove after retry', exact: true }) })
  const before = await page.evaluate(id => ({ history: localStorage.getItem('recent_timers'), config: localStorage.getItem(`timer_${id}`) }), id)
  await page.evaluate(() => {
    const original = Storage.prototype.setItem
    Storage.prototype.setItem = function (key, value) {
      if (key === 'recent_timers') {
        Storage.prototype.setItem = original
        throw new DOMException('Storage unavailable', 'QuotaExceededError')
      }
      return original.call(this, key, value)
    }
  })
  await card.getByRole('button', { name: 'Remove timer', exact: true }).click()
  await expect(page.getByText('Failed to remove timer. Please try again.', { exact: true })).toBeVisible()
  await expect(card).toBeVisible()
  expect(await page.evaluate(id => ({ history: localStorage.getItem('recent_timers'), config: localStorage.getItem(`timer_${id}`) }), id)).toEqual(before)
  expect(errors).toEqual([])
  await page.reload()
  await expect(card).toBeVisible()
  await card.getByRole('button', { name: 'Remove timer', exact: true }).click()
  await expect(card).toHaveCount(0)
  await page.reload()
  await expect(card).toHaveCount(0)
  expect(await page.evaluate(id => localStorage.getItem(`timer_${id}`), id)).toBeNull()
  expect(errors).toEqual([])
})
