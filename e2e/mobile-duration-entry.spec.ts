import { expect, test } from 'playwright/test'

test.use({ viewport: { width: 320, height: 640 }, isMobile: true, hasTouch: true })

test('work and rest durations fit and can be set independently by touch', async ({ page }) => {
  await page.goto('/configure')
  await page.getByRole('heading', { name: 'Interval', exact: true }).tap()
  const segments = page.locator('input[name=hours], input[name=minutes], input[name=seconds]')
  await expect(segments).toHaveCount(6)
  for (const segment of await segments.all()) {
    const box = (await segment.boundingBox())!
    expect(box.width).toBeGreaterThanOrEqual(44)
    expect(box.height).toBeGreaterThanOrEqual(44)
    expect(box.x).toBeGreaterThanOrEqual(0)
    expect(box.x + box.width).toBeLessThanOrEqual(320)
    await expect(segment).toHaveAttribute('inputmode', 'numeric')
    await segment.tap()
    await expect(segment).toBeFocused()
  }
  const seconds = page.locator('input[name=seconds]')
  await seconds.first().tap()
  await seconds.first().pressSequentially('45')
  await seconds.last().tap()
  await seconds.last().pressSequentially('15')
  await expect(seconds.first()).toHaveValue('45')
  await expect(seconds.last()).toHaveValue('15')
})
