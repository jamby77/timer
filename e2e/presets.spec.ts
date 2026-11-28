import { expect, test } from 'playwright/test'

import type { Page } from 'playwright/test'

async function presets(page: Page) {
  return page.evaluate(() =>
    Object.keys(localStorage)
      .filter((key) => key.startsWith('preset_'))
      .map((key) => JSON.parse(localStorage.getItem(key)!))
  )
}

for (const type of ['Countdown', 'Stopwatch', 'Interval', 'Work/Rest Ratio']) {
  test(`${type}: save, reload, reopen, customize and start without changing source`, async ({
    page,
  }) => {
    await page.goto('/configure')
    await page.waitForLoadState('networkidle')
    await page.getByRole('heading', { name: type, exact: true }).click()
    const name = `Saved ${type}`
    if (type === 'Work/Rest Ratio') {
      await page.getByRole('radio', { name: 'Fixed rest' }).click()
      await page.locator('input[name=seconds]').nth(0).pressSequentially('15')
      await page.locator('input[name=minutes]').nth(1).pressSequentially('2')
      await page.getByLabel('Max rounds').selectOption('4')
    } else {
      await page.locator('input[name=seconds]').first().pressSequentially('45')
      if (type === 'Interval') {
        await page.locator('input[name=seconds]').nth(1).pressSequentially('15')
        await page.getByLabel('Number of Intervals').fill('6')
        await page.getByLabel('Work Label', { exact: true }).fill('Push')
        await page.getByLabel('Rest Label', { exact: true }).fill('Recover')
        await page.getByRole('checkbox', { name: 'Skip last rest period' }).check()
      }
    }
    await page.getByLabel(/Timer Name/).fill(name)
    await page.getByLabel('Completion Message').fill('Finished!')
    await page.getByLabel('Pre-start countdown', { exact: true }).selectOption('3')
    await page.getByRole('switch', { name: 'Sounds' }).check()
    await page.getByRole('button', { name: 'Save as Preset' }).click()
    await expect(page.getByText('Preset saved.', { exact: true })).toBeVisible()
    await expect(page).toHaveURL(/\/configure$/)
    const saved = await presets(page)
    expect(saved).toHaveLength(1)
    expect(saved[0]).toMatchObject({
      name,
      isBuiltIn: false,
      config: {
        name,
        completionMessage: 'Finished!',
        countdownBeforeStart: 3,
        sound: { enabled: true },
      },
    })
    expect(await page.evaluate(() => localStorage.getItem('recent_timers'))).toBeNull()
    await page.reload()
    await page.getByRole('tab', { name: 'Presets', exact: true }).click()
    await page.getByRole('heading', { name, exact: true }).click()
    await expect(page.getByLabel(/Timer Name/)).toHaveValue(name)
    await expect(page.getByLabel('Completion Message')).toHaveValue('Finished!')
    await expect(page.getByLabel('Pre-start countdown', { exact: true })).toHaveValue('3')
    await expect(page.getByRole('switch', { name: 'Sounds' })).toBeChecked()
    if (type === 'Work/Rest Ratio') {
      await expect(page.getByLabel('Max rounds')).toHaveValue('4')
      await expect(page.getByLabel('Max rounds').locator('option:checked')).toHaveText('4')
      await expect(page.getByRole('radio', { name: 'Fixed rest' })).toBeChecked()
      await expect(page.locator('input[name=seconds]').first()).toHaveValue('15')
      await expect(page.locator('input[name=minutes]').nth(1)).toHaveValue('02')
    } else {
      await expect(page.locator('input[name=seconds]').first()).toHaveValue('45')
      if (type === 'Interval') {
        await expect(page.getByLabel('Number of Intervals')).toHaveValue('6')
        await expect(page.getByLabel('Work Label', { exact: true })).toHaveValue('Push')
        await expect(page.getByLabel('Rest Label', { exact: true })).toHaveValue('Recover')
        await expect(page.getByRole('checkbox', { name: 'Skip last rest period' })).toBeChecked()
      }
    }
    await page.getByLabel(/Timer Name/).fill(`${name} adjusted`)
    await page.getByRole('button', { name: 'Start Timer', exact: true }).click()
    await expect(page).toHaveURL(/\/\?id=/)
    expect(await presets(page)).toEqual(saved)
  })
}

test('save a built-in copy without modifying Tabata', async ({ page }) => {
  await page.goto('/configure?tab=presets')
  await page.waitForLoadState('networkidle')
  await page.getByRole('heading', { name: 'Tabata', exact: true }).click()
  await page.getByLabel(/Timer Name/).fill('My Tabata')
  await page.getByLabel('Number of Intervals').fill('5')
  await page.getByRole('button', { name: 'Save as Preset' }).click()
  await expect(page.getByText('Preset saved.', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Cancel', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'My Tabata', exact: true })).toBeVisible()
  await page.getByRole('heading', { name: 'Tabata', exact: true }).click()
  await expect(page.getByLabel('Number of Intervals')).toHaveValue('8')
  await page.getByRole('button', { name: 'Cancel', exact: true }).click()
  await page
    .getByRole('group', { name: 'My Tabata', exact: true })
    .getByRole('button', { name: 'Start', exact: true })
    .click()
  await expect(page).toHaveURL(/\/\?id=/)
})

test('complex preset reloads phases and can be saved again', async ({ page }) => {
  await page.goto('/configure/complex')
  await page.getByRole('button', { name: 'Add Phase', exact: true }).click()
  await page.getByLabel('Phase name').fill('Saved warmup')
  await page.getByRole('button', { name: 'Add', exact: true }).click()
  await page.getByLabel('Timer Name*', { exact: true }).fill('Saved workout')
  await page.getByRole('button', { name: 'Save as Preset' }).click()
  await expect(page.getByText('Preset saved.', { exact: true })).toBeVisible()
  await page.goto('/configure')
  await page.waitForLoadState('networkidle')
  await page.reload()
  await page.getByRole('tab', { name: 'Presets', exact: true }).click()
  await page.getByRole('heading', { name: 'Saved workout', exact: true }).click()
  await expect(page).toHaveURL(/\/configure\/complex\?preset=/)
  await page.getByRole('button', { name: 'Edit phase' }).click()
  await expect(page.getByLabel('Phase name')).toHaveValue('Saved warmup')
  await expect(page.locator('input[name=minutes]')).toHaveValue('01')
  await page.getByLabel('Phase name').fill('Modified warmup')
  await page.getByRole('button', { name: 'Save', exact: true }).click()
  await page.getByRole('button', { name: 'Save as Preset' }).click()
  await expect(page.getByText('Preset saved.', { exact: true })).toBeVisible()
  const saved = await presets(page)
  expect(saved).toHaveLength(2)
  expect(saved.map((p) => p.config.phases[0].name).sort()).toEqual([
    'Modified warmup',
    'Saved warmup',
  ])
})

test('invalid input and storage failure do not save or lose the draft', async ({ page }) => {
  await page.goto('/configure')
  await page.waitForLoadState('networkidle')
  await page.getByRole('heading', { name: 'Countdown', exact: true }).click()
  await page.getByLabel(/Timer Name/).fill('Keep my draft')
  await expect(page.getByRole('button', { name: 'Save as Preset' })).toBeDisabled()
  expect(await presets(page)).toHaveLength(0)
  await page.locator('input[name=seconds]').pressSequentially('30')
  await page.evaluate(() => {
    const original = Storage.prototype.setItem
    Storage.prototype.setItem = function (key, value) {
      if (key.startsWith('preset_')) throw new DOMException('Quota exceeded', 'QuotaExceededError')
      return original.call(this, key, value)
    }
  })
  await page.getByRole('button', { name: 'Save as Preset' }).click()
  await expect(
    page.getByText('Failed to save preset. Please try again.', { exact: true })
  ).toBeVisible()
  await expect(page.getByLabel(/Timer Name/)).toHaveValue('Keep my draft')
  await expect(page.locator('input[name=seconds]')).toHaveValue('30')
  await expect(page).toHaveURL(/\/configure$/)
  expect(await presets(page)).toHaveLength(0)
})

test('missing complex preset has a clear error', async ({ page }) => {
  await page.goto('/configure/complex?preset=missing')
  await expect(page.getByText('Preset not found or invalid.', { exact: true })).toBeVisible()
})

test('malformed saved presets are ignored and invalid links show an error', async ({ page }) => {
  await page.goto('/configure')
  await page.evaluate(() =>
    localStorage.setItem(
      'preset_broken',
      JSON.stringify({
        id: 'broken',
        name: 'Broken preset',
        description: 'Invalid',
        isBuiltIn: false,
        config: { id: 'broken', name: 'Broken preset', type: 'COMPLEX' },
      })
    )
  )
  await page.reload()
  await page.getByRole('tab', { name: 'Presets', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Tabata', exact: true })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Broken preset', exact: true })).toHaveCount(0)
  await page.goto('/configure/complex?preset=broken')
  await expect(page.getByText('Preset not found or invalid.', { exact: true })).toBeVisible()
})

test('a corrupt preset does not hide valid presets after reload', async ({ page }) => {
  await page.goto('/configure')
  await page.getByRole('heading', { name: 'Countdown', exact: true }).click()
  await page.getByLabel(/Timer Name/).fill('Still available')
  await page.locator('input[name=seconds]').fill('30')
  await page.getByRole('button', { name: 'Save as Preset' }).click()
  await expect(page.getByText('Preset saved.', { exact: true })).toBeVisible()
  const saved = await presets(page)
  await page.evaluate(() => localStorage.setItem('preset_broken', '{broken'))
  await page.reload()
  await page.getByRole('tab', { name: 'Presets', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Tabata', exact: true })).toBeVisible()
  await page.getByRole('heading', { name: 'Still available', exact: true }).click()
  await expect(page.locator('input[name=seconds]')).toHaveValue('30')
  await page.getByRole('button', { name: 'Start Timer', exact: true }).click()
  await page.getByRole('button', { name: 'Start timer', exact: true }).click()
  await expect(page.locator('[data-timer-state]')).toHaveAttribute('data-timer-state', 'running')
  expect(await page.evaluate(() => localStorage.getItem('preset_broken'))).toBe('{broken')
  const stored = await page.evaluate(() =>
    Object.keys(localStorage).filter(key => key.startsWith('preset_') && key !== 'preset_broken')
      .map(key => JSON.parse(localStorage.getItem(key)!))
  )
  expect(stored).toEqual(saved)
})

test('malformed recent history does not hide usable timers after reload', async ({ page }) => {
  await page.goto('/configure')
  await page.getByRole('heading', { name: 'Countdown', exact: true }).click()
  await page.getByLabel(/Timer Name/).fill('Recovered recent timer')
  await page.locator('input[name=seconds]').fill('30')
  await page.getByRole('button', { name: 'Start Timer', exact: true }).click()
  await expect(page).toHaveURL(/\/\?id=/)
  const stored = await page.evaluate(() => {
    const history = JSON.parse(localStorage.getItem('recent_timers')!)
    const mixed = JSON.stringify([
      null,
      ...history,
      { id: 'broken', startedAt: new Date().toISOString(), config: { id: 'broken', name: 'Broken recent timer', type: 'COMPLEX' } },
    ])
    localStorage.setItem('recent_timers', mixed)
    return mixed
  })
  await page.goto('/configure')
  await page.reload()
  const card = page.locator('[data-slot=card]').filter({ has: page.getByRole('heading', { name: 'Recovered recent timer', exact: true }) })
  await expect(card).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Broken recent timer', exact: true })).toHaveCount(0)
  await page.getByRole('tab', { name: 'Presets', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Tabata', exact: true })).toBeVisible()
  expect(await page.evaluate(() => localStorage.getItem('recent_timers'))).toBe(stored)
  await card.getByRole('button', { name: 'Start Recovered recent timer', exact: true }).click()
  await page.getByRole('button', { name: 'Start timer', exact: true }).click()
  await expect(page.locator('[data-timer-state]')).toHaveAttribute('data-timer-state', 'running')
  await page.getByRole('button', { name: 'Stop timer', exact: true }).click()
  await page.getByRole('button', { name: 'End', exact: true }).click()
  await page.goto('/configure')
  await card.getByRole('button', { name: 'Remove timer', exact: true }).click()
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Recovered recent timer', exact: true })).toHaveCount(0)
})

test.describe('mobile preset cards', () => {
  test.use({ viewport: { width: 320, height: 640 }, isMobile: true, hasTouch: true })

  test('preset Start opens the timer by edge tap and keyboard', async ({ page }) => {
    for (const action of ['tap', 'Enter', 'Space']) {
      await page.goto('/configure?tab=presets')
      const card = page.getByRole('group', { name: 'Tabata', exact: true })
      const start = card.getByRole('button', { name: 'Start', exact: true })
      const bounds = (await start.boundingBox())!
      const description = (await card.locator('[data-slot=card-description]').boundingBox())!
      const share = (await card.getByRole('button', { name: /share/i }).boundingBox())!
      expect(bounds.x).toBeCloseTo(description.x)
      expect(bounds.x + bounds.width).toBeLessThan(share.x)
      expect(share.x + share.width).toBeCloseTo(description.x + description.width)
      expect(share.y).toBeCloseTo(bounds.y)
      expect(share.height).toBeGreaterThanOrEqual(44)
      expect(bounds.height).toBeGreaterThanOrEqual(44)
      if (action === 'tap') {
        await start.tap({ position: { x: bounds.width - 2, y: bounds.height / 2 } })
      } else {
        await start.press(action)
      }
      await expect(page).toHaveURL(/\/\?id=/)
      await expect(page.locator('[data-slot=card-header]')).toContainText('Tabata')
    }
  })

  test('a saved preset with a long unbroken name fits and reopens by touch', async ({ page }) => {
    const name = 'Strength · SingleLegRomanianDeadliftWithContralateralReach'
    await page.goto('/configure')
    await page.getByRole('heading', { name: 'Countdown', exact: true }).tap()
    await page.getByLabel(/Timer Name/).fill(name)
    await page.getByLabel('Seconds', { exact: true }).pressSequentially('45')
    await page.getByRole('button', { name: 'Save as Preset' }).tap()
    await expect(page.getByText('Preset saved.', { exact: true })).toBeVisible()
    await page.reload()
    await page.getByRole('tab', { name: 'Presets', exact: true }).click()

    const savedCard = page.getByRole('group', { name, exact: true })
    await expect(savedCard.getByText('45s countdown', { exact: true })).toHaveCount(1)
    const tabata = page.getByRole('group', { name: 'Tabata', exact: true })
    await expect(tabata.getByText('20 seconds on, 10 seconds off', { exact: true })).toBeVisible()
    await expect(tabata.getByText('8 rounds: 20s work / 10s rest', { exact: true })).toBeVisible()
    const title = savedCard.getByRole('heading', { name, exact: true })
    await title.scrollIntoViewIfNeeded()
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320)
    expect(await title.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true)
    await title.tap()
    await expect(page.getByLabel(/Timer Name/)).toHaveValue(name)
    await expect(page.getByLabel('Seconds', { exact: true })).toHaveValue('45')
  })
})
