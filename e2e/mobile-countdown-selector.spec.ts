import { expect, test } from 'playwright/test'

test.use({ viewport: { width: 320, height: 640 }, isMobile: true, hasTouch: true })

for (const type of ['Countdown', 'Complex']) {
  test(`pre-start countdown fills the field and supports touch and keyboard in ${type} setup`, async ({ page }) => {
    await page.goto('/configure')
    await page.getByRole('heading', { name: type, exact: true }).tap()
    if (type === 'Complex') {
      await page.getByRole('button', { name: 'Add Phase', exact: true }).tap()
      await page.getByLabel('Phase name').fill('Warmup')
      await page.getByRole('button', { name: 'Add', exact: true }).tap()
    }

    const select = page.getByRole('combobox', { name: 'Countdown', exact: true })
    await select.scrollIntoViewIfNeeded()
    const box = (await select.boundingBox())!
    const field = (await select.locator('xpath=ancestor::*[@data-slot="field"][1]').boundingBox())!
    expect(box.height).toBeGreaterThanOrEqual(44)
    expect(box.width).toBeCloseTo(field.width, 0)
    await page.touchscreen.tap(box.x + box.width - 3, box.y + 3)
    await expect(select).toBeFocused()
    await select.press('Escape')
    await select.press('Home')
    await select.press('ArrowDown')
    await expect(select).toHaveValue('3')
    await select.press('Home')
    await expect(select).toHaveValue('0')
  })
}
