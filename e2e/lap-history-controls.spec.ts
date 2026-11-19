import { expect, test } from 'playwright/test'

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('timer_laps', JSON.stringify({
      id: 'laps', name: 'Lap history check', type: 'COUNTDOWN', duration: 1,
    }))
  })
  await page.goto('/?id=laps')
  await page.getByRole('button', { name: 'Start timer', exact: true }).click()
})

test('lap history can be expanded, collapsed and cleared by keyboard', async ({ page }) => {
  const expand = page.getByRole('button', { name: 'Expand lap history' })
  const collapse = page.getByRole('button', { name: 'Collapse lap history' })
  await expect(expand).toHaveAttribute('aria-expanded', 'false')
  await expand.press('Enter')
  await expect(collapse).toHaveAttribute('aria-expanded', 'true')
  await collapse.press('Space')
  await expect(expand).toHaveAttribute('aria-expanded', 'false')
  await expand.press('Enter')
  await page.keyboard.press('Tab')
  const clear = page.getByRole('button', { name: 'Clear', exact: true })
  await expect(clear).toBeFocused()
  await clear.press('Enter')
  await expect(page.getByText('Last lap', { exact: true })).toBeHidden()
  await expect(clear).toBeHidden()
  await expect(expand).toBeHidden()
  await expect(collapse).toBeHidden()
})

test.describe('phone touch controls', () => {
  test.use({ viewport: { width: 320, height: 640 }, isMobile: true, hasTouch: true })

  test('tap targets fit the viewport and clear independently', async ({ page }) => {
    const expand = page.getByRole('button', { name: 'Expand lap history' })
    const collapse = page.getByRole('button', { name: 'Collapse lap history' })
    const clear = page.getByRole('button', { name: 'Clear', exact: true })
    await expand.tap()
    for (const control of [collapse, clear]) {
      const box = (await control.boundingBox())!
      expect(box.height).toBeGreaterThanOrEqual(44)
      expect(box.width).toBeGreaterThanOrEqual(44)
      expect(box.x).toBeGreaterThanOrEqual(0)
      expect(box.x + box.width).toBeLessThanOrEqual(320)
    }
    await collapse.tap()
    await expand.tap()
    await clear.tap()
    await expect(clear).toBeHidden()
    await expect(expand).toBeHidden()
    await expect(collapse).toBeHidden()
  })
})
