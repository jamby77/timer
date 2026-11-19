import { expect, test } from 'playwright/test'

test.use({ viewport: { width: 320, height: 640 }, isMobile: true, hasTouch: true })

test('interval count supports touch adjustments, direct entry and preset reload', async ({ page }) => {
  await page.goto('/configure')
  await page.getByRole('heading', { name: 'Interval', exact: true }).tap()
  const seconds = page.locator('input[name=seconds]')
  await seconds.first().pressSequentially('45')
  await seconds.last().pressSequentially('15')
  await page.getByLabel(/Timer Name/).fill('Twelve intervals')
  const count = page.getByLabel('Number of Intervals')
  const minus = page.getByRole('button', { name: 'Decrease interval count' })
  const plus = page.getByRole('button', { name: 'Increase interval count' })

  for (const control of [count, minus, plus]) {
    const box = (await control.boundingBox())!
    expect(box.height).toBeGreaterThanOrEqual(44)
    expect(box.width).toBeGreaterThanOrEqual(44)
    expect(box.x).toBeGreaterThanOrEqual(0)
    expect(box.x + box.width).toBeLessThanOrEqual(320)
  }
  await count.fill('')
  await plus.tap({ position: { x: 4, y: 4 } })
  await expect(count).toHaveValue('1')
  await expect(minus).toBeDisabled()
  await count.fill('999')
  await plus.tap()
  await expect(count).toHaveValue('1000')
  await expect(plus).toBeDisabled()
  await minus.tap()
  await expect(count).toHaveValue('999')
  await count.fill('13')
  await minus.tap({ position: { x: 4, y: 4 } })
  await expect(count).toHaveValue('12')
  await page.getByRole('button', { name: 'Save as Preset' }).tap()
  await expect(page.getByText('Preset saved.', { exact: true })).toBeVisible()
  await page.reload()
  await page.getByRole('heading', { name: 'Twelve intervals', exact: true }).tap()
  await expect(count).toHaveValue('12')
})
