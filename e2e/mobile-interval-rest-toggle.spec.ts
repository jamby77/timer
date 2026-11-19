import { expect, test } from 'playwright/test'

test.use({ viewport: { width: 320, height: 640 }, isMobile: true, hasTouch: true })

test('the entire skip-last-rest row supports touch and the checkbox supports Space', async ({ page }) => {
  await page.goto('/configure')
  await page.getByRole('heading', { name: 'Interval', exact: true }).tap()

  const row = page.locator('label').filter({ hasText: 'Skip last rest period' })
  const checkbox = page.getByRole('checkbox', { name: 'Skip last rest period' })
  await row.scrollIntoViewIfNeeded()
  const box = (await row.boundingBox())!
  expect(box.height).toBeGreaterThanOrEqual(44)
  expect(box.width).toBeGreaterThan(240)
  const initiallyChecked = await checkbox.isChecked()
  await row.tap({ position: { x: box.width - 4, y: 4 } })
  await expect(checkbox).toBeChecked({ checked: !initiallyChecked })
  await row.tap({ position: { x: 4, y: box.height - 4 } })
  await expect(checkbox).toBeChecked({ checked: initiallyChecked })
  await checkbox.press('Space')
  await expect(checkbox).toBeChecked({ checked: !initiallyChecked })
})
