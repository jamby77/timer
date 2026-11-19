import { expect, test } from 'playwright/test'

test.use({ viewport: { width: 320, height: 640 }, isMobile: true, hasTouch: true })

test('rest modes switch when tapped at the edge of each mobile option', async ({ page }) => {
  await page.goto('/configure')
  await page.getByRole('heading', { name: 'Work/Rest Ratio', exact: true }).tap()
  const group = page.getByRole('radiogroup', { name: 'Rest Mode' })
  for (const [name, field] of [['Fixed rest', 'Rest time'], ['Ratio-based', 'Work/Rest Ratio']]) {
    const option = group.locator('label').filter({ hasText: name })
    const box = (await option.boundingBox())!
    expect(box.height).toBeGreaterThanOrEqual(44)
    expect(box.width).toBeGreaterThanOrEqual(44)
    expect(box.x).toBeGreaterThanOrEqual(0)
    expect(box.x + box.width).toBeLessThanOrEqual(320)
    await option.tap({ position: { x: box.width - 5, y: 5 } })
    await expect(page.getByRole('radio', { name, exact: true })).toBeChecked()
    await expect(page.locator('label').filter({ hasText: field })).toBeVisible()
  }
  await group.getByRole('radio', { name: 'Ratio-based' }).focus()
  await page.keyboard.down('ArrowRight')
  await expect(group.getByRole('radio', { name: 'Fixed rest' })).toBeChecked()
  await page.keyboard.up('ArrowRight')
})
