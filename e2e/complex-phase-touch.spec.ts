import { expect, test } from 'playwright/test'

test.use({ viewport: { width: 320, height: 640 }, isMobile: true, hasTouch: true })

test('phase actions fit and work by touch on a narrow phone', async ({ page }) => {
  await page.goto('/configure/complex')
  await page.getByRole('button', { name: 'Add Phase', exact: true }).tap()
  await page.getByLabel('Phase name').fill('Warmup')
  const add = page.getByRole('button', { name: 'Add', exact: true })
  expect((await add.boundingBox())!.height).toBeGreaterThanOrEqual(44)
  await add.tap()

  const phases = page.locator('[data-slot=card]:has(> [data-slot=card-footer] > button[aria-label="Edit phase"])')
  const titles = phases.locator('[data-slot=card-title]')
  const action = (index: number, name: string) => phases.nth(index).getByRole('button', { name, exact: true })
  for (const name of ['Move phase up', 'Move phase down', 'Edit phase', 'Duplicate phase', 'Remove phase']) {
    const box = (await action(0, name).boundingBox())!
    expect(box.width).toBeGreaterThanOrEqual(44)
    expect(box.height).toBeGreaterThanOrEqual(44)
    expect(box.x).toBeGreaterThanOrEqual(0)
    expect(box.x + box.width).toBeLessThanOrEqual(320)
  }

  await action(0, 'Duplicate phase').tap()
  await action(1, 'Edit phase').tap()
  await page.getByLabel('Phase name').fill('Cooldown')
  const save = page.getByRole('button', { name: 'Save', exact: true })
  expect((await save.boundingBox())!.height).toBeGreaterThanOrEqual(44)
  await save.tap()
  await expect(titles).toContainText(['Warmup', 'Cooldown'])
  await action(1, 'Move phase up').tap()
  await expect(titles).toContainText(['Cooldown', 'Warmup'])
  await action(0, 'Move phase down').tap()
  await expect(titles).toContainText(['Warmup', 'Cooldown'])
  await action(1, 'Remove phase').tap()
  await expect(titles).toHaveCount(1)
  await expect(titles).toContainText('Warmup')
})

test('auto-advance toggles from its description, row edge, and keyboard', async ({ page }) => {
  await page.goto('/configure/complex')
  await page.getByRole('button', { name: 'Add Phase', exact: true }).tap()
  await page.getByLabel('Phase name').fill('Warmup')
  await page.getByRole('button', { name: 'Add', exact: true }).tap()

  const toggle = page.getByRole('switch', { name: 'Auto-advance phases' })
  const sounds = page.getByRole('switch', { name: 'Sounds' })
  await expect(toggle).toBeChecked()
  await page.getByText('Automatically move to next phase when current completes').tap()
  await expect(toggle).not.toBeChecked()

  const row = page.locator('label').filter({ has: toggle })
  const bounds = (await row.boundingBox())!
  expect(bounds.height).toBeGreaterThanOrEqual(44)
  expect(bounds.x + bounds.width).toBeLessThanOrEqual(320)
  await row.tap({ position: { x: bounds.width - 4, y: 4 } })
  await expect(toggle).toBeChecked()
  await toggle.press('Space')
  await expect(toggle).not.toBeChecked()
  await expect(sounds).not.toBeChecked()
})
