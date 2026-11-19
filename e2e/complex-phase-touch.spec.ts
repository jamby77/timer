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

test('overall time limit fits all three touch targets below its title', async ({ page }) => {
  await page.goto('/configure/complex')
  await page.getByRole('button', { name: 'Add Phase', exact: true }).tap()
  await page.getByLabel('Phase name').fill('Warmup')
  await page.getByRole('button', { name: 'Add', exact: true }).tap()

  const limit = page.getByRole('group', { name: 'Overall Time Limit', exact: true })
  await limit.scrollIntoViewIfNeeded()
  const title = (await limit.locator('legend').boundingBox())!
  for (const [unit, value] of [['Hours', '01'], ['Minutes', '02'], ['Seconds', '03']]) {
    const input = limit.getByLabel(unit, { exact: true })
    const box = (await input.boundingBox())!
    expect(box.y).toBeGreaterThanOrEqual(title.y + title.height)
    expect(box.width).toBeGreaterThanOrEqual(44)
    expect(box.height).toBeGreaterThanOrEqual(44)
    expect(box.x + box.width).toBeLessThanOrEqual(320)
    await page.touchscreen.tap(box.x + box.width - 2, box.y + box.height / 2)
    await expect(input).toBeFocused()
    await input.pressSequentially(value)
    await expect(input).toHaveValue(value)
  }
})

test('phase names stay editable by touch and survive settings changes', async ({ page }) => {
  await page.goto('/configure/complex')
  await page.getByRole('button', { name: 'Add Phase', exact: true }).tap()
  const name = page.getByLabel('Phase name')
  const type = page.getByLabel('Phase type')
  const minutes = page.getByLabel('Minutes', { exact: true })
  await minutes.press('ArrowUp')
  await expect(name).toHaveValue('Countdown (2m)')
  await name.fill('Hill climb')
  await minutes.press('ArrowUp')
  await expect(name).toHaveValue('Hill climb')
  const box = (await name.boundingBox())!
  expect(box.height).toBeGreaterThanOrEqual(44)
  expect(box.y + box.height).toBeLessThanOrEqual((await type.boundingBox())!.y)
  await name.tap({ position: { x: box.width - 4, y: 4 } })
  await expect(name).toBeFocused()
  await page.getByRole('button', { name: 'Add', exact: true }).tap()

  const edit = page.getByRole('button', { name: 'Edit phase' })
  await edit.tap()
  await type.tap()
  await page.getByRole('option', { name: 'Stopwatch', exact: true }).tap()
  await expect(name).toHaveValue('Hill climb')
  await page.getByRole('button', { name: 'Save', exact: true }).tap()
  await edit.tap()
  await expect(name).toHaveValue('Hill climb')
  await expect(type).toHaveText('Stopwatch')
})

test('phase type menu supports edge taps and keyboard selection on a narrow phone', async ({ page }) => {
  await page.goto('/configure/complex')
  await page.getByRole('button', { name: 'Add Phase', exact: true }).tap()
  const type = page.getByRole('combobox', { name: 'Phase type' })
  const trigger = (await type.boundingBox())!
  expect(trigger.height).toBeGreaterThanOrEqual(44)
  await type.tap({ position: { x: trigger.width - 4, y: 4 } })
  const options = page.getByRole('option')
  await expect(options).toHaveCount(4)
  for (const option of await options.all()) {
    await expect(option).toBeInViewport({ ratio: 1 })
    expect(await option.evaluate((el) => el.clientHeight)).toBeGreaterThanOrEqual(44)
  }
  const interval = page.getByRole('option', { name: 'Interval', exact: true })
  await interval.tap({ position: { x: 4, y: 4 } })
  await expect(type).toHaveText('Interval')
  await expect(page.getByLabel('Number of Intervals')).toBeVisible()
  await type.press('Enter')
  await expect(interval).toBeFocused()
  await page.keyboard.press('Home')
  await expect(page.getByRole('option', { name: 'Countdown', exact: true })).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(type).toHaveText('Countdown')
})

test('long phase names remain readable beside their touch controls', async ({ page }) => {
  await page.goto('/configure/complex')
  await page.getByRole('button', { name: 'Add Phase', exact: true }).tap()
  const name = 'Run uphill at a steady pace then recover on the way down'
  await page.getByLabel('Phase name').fill(name)
  await page.getByRole('button', { name: 'Add', exact: true }).tap()
  const card = page.locator('[data-slot=card]').filter({
    has: page.getByRole('button', { name: 'Edit phase' }),
  }).last()
  const title = card.locator('[data-slot=card-title]')
  await expect(title).toContainText(name)
  expect(await title.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true)
  const edit = card.getByRole('button', { name: 'Edit phase' })
  const down = card.getByRole('button', { name: 'Move phase down' })
  const editBox = (await edit.boundingBox())!
  const downBox = (await down.boundingBox())!
  expect(downBox.y).toBe(editBox.y)
  expect(downBox.x + downBox.width).toBeLessThanOrEqual(320)
  await edit.tap()
  await expect(page.getByLabel('Phase name')).toHaveValue(name)
})

test('phase summary keeps long unbroken names and duration details inside the phone screen', async ({ page }) => {
  await page.goto('/configure/complex')
  await page.getByRole('button', { name: 'Add Phase', exact: true }).tap()
  const name = 'SingleLegRomanianDeadliftWithContralateralReach'
  await page.getByLabel('Phase name').fill(name)
  await page.getByRole('button', { name: 'Add', exact: true }).tap()
  const summary = page.locator('[data-slot=card]').filter({
    has: page.getByText('Phase Summary', { exact: true }),
  })
  const title = summary.getByText(name, { exact: true })
  await title.scrollIntoViewIfNeeded()
  const bounds = (await summary.boundingBox())!
  const titleBounds = (await title.boundingBox())!
  expect(titleBounds.x + titleBounds.width).toBeLessThanOrEqual(Math.min(320, bounds.x + bounds.width))
  expect(await title.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true)
  await expect(summary.getByText('Countdown - 60s', { exact: true })).toBeVisible()
})

test('interval estimate follows the final rest setting in a complex workout', async ({ page }) => {
  await page.goto('/configure/complex')
  await page.getByRole('button', { name: 'Add Phase', exact: true }).tap()
  await page.getByLabel('Phase type').tap()
  await page.getByRole('option', { name: 'Interval', exact: true }).tap()
  const skip = page.getByRole('checkbox', { name: 'Skip last rest period' })
  await expect(skip).toBeChecked()
  await skip.tap()
  await page.getByRole('button', { name: 'Add', exact: true }).tap()
  const estimate = page.getByLabel('Estimated Duration', { exact: true })
  const name = page.getByLabel('Timer Name*', { exact: true })
  const summary = page.locator('[data-slot=card]').filter({
    has: page.getByText('Phase Summary', { exact: true }),
  })
  await expect(summary).toContainText('3 rounds · Final rest included')
  await expect(summary).toContainText('30s work / 10s rest')
  await expect(estimate).toHaveValue('2m')
  await expect(name).toHaveValue(/, 2m\)$/)
  await page.getByRole('button', { name: 'Edit phase' }).tap()
  await skip.tap()
  await page.getByRole('button', { name: 'Save', exact: true }).tap()
  await expect(summary).toContainText('3 rounds · Final rest skipped')
  expect(await summary.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true)
  await expect(estimate).toHaveValue('1m 50s')
  await expect(name).toHaveValue(/, 1m 50s\)$/)
})

test('Work/Rest summary shows the chosen rest and optional work limit on a narrow phone', async ({ page }) => {
  await page.goto('/configure/complex')
  const button = (name: string) => page.getByRole('button', { name, exact: true })
  await button('Add Phase').tap()
  await page.getByLabel('Phase type').tap()
  await page.getByRole('option', { name: 'Work/Rest Ratio', exact: true }).tap()
  await button('Add').tap()
  const summary = page.locator('[data-slot=card]').filter({
    has: page.getByText('Phase Summary', { exact: true }),
  })
  await expect(summary).toContainText('5 rounds · 5m work limit')
  await expect(summary).toContainText('Rest 2× work time')
  await button('Edit phase').tap()
  await page.getByLabel('Minutes', { exact: true }).pressSequentially('00')
  await page.getByRole('radio', { name: 'Fixed rest' }).tap()
  await page.getByLabel('Seconds', { exact: true }).first().pressSequentially('15')
  await page.getByLabel('Max rounds').selectOption('1')
  await button('Save').tap()
  await expect(summary).toContainText('1 round · No work time limit')
  await expect(summary).toContainText('15s fixed rest')
  await expect(summary).not.toContainText('Rest 2× work time')
  expect(await summary.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true)
})

test('Stopwatch summary shows the exact limit and updates when cleared on a narrow phone', async ({ page }) => {
  await page.goto('/configure/complex')
  const button = (name: string) => page.getByRole('button', { name, exact: true })
  await button('Add Phase').tap()
  await page.getByLabel('Phase type').tap()
  await page.getByRole('option', { name: 'Stopwatch', exact: true }).tap()
  for (const [field, value] of [['Hours', '01'], ['Minutes', '02'], ['Seconds', '05']]) {
    await page.getByLabel(field, { exact: true }).pressSequentially(value)
  }
  await button('Add').tap()
  const summary = page.locator('[data-slot=card]').filter({
    has: page.getByText('Phase Summary', { exact: true }),
  })
  await expect(summary.getByText('1h 2m 5s time limit', { exact: true })).toBeVisible()
  await button('Edit phase').tap()
  for (const field of ['Hours', 'Minutes', 'Seconds']) {
    await page.getByLabel(field, { exact: true }).pressSequentially('00')
  }
  await button('Save').tap()
  await expect(summary.getByText('No time limit', { exact: true })).toBeVisible()
  await expect(summary).not.toContainText('1h 2m 5s')
})
