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

    const select = page.getByRole('combobox', { name: 'Pre-start countdown', exact: true })
    const durations = await select.locator('option').evaluateAll(options =>
      options.map(option => Number((option as HTMLOptionElement).value))
    )
    expect(durations.slice(0, 4)).toEqual([0, 3, 5, 10])
    expect(durations.sort((a, b) => a - b)).toEqual(Array.from({ length: 61 }, (_, i) => i))
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

test('Complex uses the workout countdown before the first phase only', async ({ page }) => {
  await page.goto('/configure')
  await page.getByRole('heading', { name: 'Complex', exact: true }).tap()
  for (const name of ['Warmup', 'Recovery']) {
    await page.getByRole('button', { name: 'Add Phase', exact: true }).tap()
    await page.getByLabel('Phase name').fill(name)
    if (name === 'Warmup') {
      await page.getByLabel('Seconds', { exact: true }).pressSequentially('01')
      await page.getByLabel('Minutes', { exact: true }).pressSequentially('00')
    }
    await page.getByRole('button', { name: name === 'Warmup' ? 'Add' : 'Add at the end', exact: true }).tap()
  }
  await page.getByRole('combobox', { name: 'Pre-start countdown', exact: true }).selectOption('3')
  await page.getByRole('button', { name: 'Start Timer', exact: true }).tap()
  await page.getByRole('button', { name: 'Start timer', exact: true }).tap()
  const timer = page.locator('[data-timer-state]')
  await expect(timer.getByText('3', { exact: true })).toBeVisible({ timeout: 900 })
  await expect(timer.getByText('Recovery', { exact: true })).toBeVisible({ timeout: 6000 })
  await expect(timer).toHaveAttribute('data-timer-state', 'running')
  await expect(timer.getByRole('progressbar')).toBeVisible({ timeout: 900 })
})
