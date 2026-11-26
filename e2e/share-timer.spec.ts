import { expect, test } from 'playwright/test'

import type { Page } from 'playwright/test'

const phone = { viewport: { width: 320, height: 640 }, isMobile: true, hasTouch: true }
test.use(phone)

function tabata(page: Page) {
  return page.getByRole('group', { name: 'Tabata', exact: true })
}

async function storedPresets(page: Page) {
  return page.evaluate(() =>
    Object.keys(localStorage)
      .filter((key) => key.startsWith('preset_'))
      .map((key) => JSON.parse(localStorage.getItem(key)!))
  )
}

test('native sharing sends just the link and a fresh recipient starts the customized preset', async ({
  page,
  browser,
}) => {
  const calls: ShareData[] = []
  await page.exposeFunction('recordShare', (payload: ShareData) => calls.push(payload))
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'share', {
      value: (payload: ShareData) => Reflect.get(window, 'recordShare')(payload),
    })
    localStorage.setItem(
      'personal_defaults_v1:preset:tabata-standard',
      JSON.stringify({
        workLabel: 'Sprint',
        workDuration: 25,
        countdownBeforeStart: 5,
      })
    )
  })
  await page.goto('/configure?tab=presets')
  await tabata(page).getByRole('button', { name: /share/i }).tap()
  await expect.poll(() => calls.length).toBe(1)
  const url = calls[0].url!
  expect(calls[0]).toEqual({ url })
  expect(url).toMatch(/^https?:\/\/[^/]+\/share#timer=.+/)
  await expect(page).toHaveURL(/\/configure\?tab=presets$/)

  const recipient = await browser.newContext(phone)
  try {
    const imported = await recipient.newPage()
    await imported.goto(url)
    await expect(imported.getByRole('heading', { name: 'Tabata' })).toBeVisible()
    for (const value of ['Sprint', '25s', '5s']) {
      await expect(imported.getByText(value, { exact: true })).toBeVisible()
    }
    expect(await storedPresets(imported)).toEqual([])
    expect(await imported.evaluate(() => localStorage.getItem('recent_timers'))).toBeNull()
    await imported.getByRole('button', { name: 'Start', exact: true }).tap()
    await expect(imported).toHaveURL(/\/\?id=/)
    await expect(imported.getByText('Get ready', { exact: true })).toBeVisible()
    await expect(imported.getByText('Tabata · Sprint', { exact: true })).toBeVisible({
      timeout: 9000,
    })
  } finally {
    await recipient.close()
  }
})

test('clipboard link saves alongside a same-name preset and reopens after reload', async ({
  page,
  context,
  browser,
}) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.addInitScript(() => Object.defineProperty(navigator, 'share', { value: undefined }))
  await page.goto('/configure?tab=presets')
  await tabata(page).getByRole('button', { name: /share/i }).tap()
  await expect(page.getByText(/link copied/i)).toBeVisible()
  const url = await page.evaluate(() => navigator.clipboard.readText())
  expect(url).toMatch(/^https?:\/\/[^/]+\/share#timer=.+/)
  await expect(page).toHaveURL(/\/configure\?tab=presets$/)

  const recipient = await browser.newContext(phone)
  try {
    const imported = await recipient.newPage()
    await imported.goto(url)
    await expect(imported.getByRole('heading', { name: 'Tabata' })).toBeVisible()
    const original = {
      id: 'existing',
      name: 'Tabata',
      description: '30s countdown',
      isBuiltIn: false,
      config: { id: 'original', name: 'Tabata', type: 'COUNTDOWN', duration: 30 },
    }
    await imported.evaluate(
      (value) => localStorage.setItem('preset_existing', JSON.stringify(value)),
      original
    )
    await imported.getByRole('button', { name: 'Save to presets' }).tap()
    await expect(imported.getByRole('status')).toContainText(/saved/i)
    const presets = await storedPresets(imported)
    expect(presets).toHaveLength(2)
    expect(presets).toContainEqual(original)
    const saved = presets.find((preset) => preset.id !== original.id)
    expect(saved.config).toMatchObject({
      type: 'INTERVAL',
      workDuration: 20,
      restDuration: 10,
      intervals: 8,
    })
    await imported.goto(new URL('/configure?tab=presets', url).href)
    await imported.reload()
    const savedCard = imported
      .getByRole('group', { name: saved.name, exact: true })
      .filter({ hasText: '8 rounds' })
      .filter({ hasNotText: 'Built-in' })
    await savedCard.getByRole('heading').tap()
    await expect(imported.getByLabel('Number of Intervals')).toHaveValue('8')
    await expect(imported.getByLabel('Pre-start countdown', { exact: true })).toHaveValue('10')
  } finally {
    await recipient.close()
  }
})

test('malformed share links show a way back to New', async ({ page }) => {
  await page.goto('/share#timer=broken')
  await expect(page.getByRole('alert').filter({ hasText: /invalid|unsupported/i })).toBeVisible()
  expect(await storedPresets(page)).toEqual([])
  await page.getByRole('link', { name: /back to new/i }).tap()
  await expect(page.getByRole('tab', { name: 'New', exact: true })).toHaveAttribute(
    'aria-selected',
    'true'
  )
})

test('a saved preset stays in place after cancellation and offers manual copy when clipboard access fails', async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: () => Promise.reject(new DOMException('Cancelled', 'AbortError')),
    })
    localStorage.setItem(
      'preset_saved',
      JSON.stringify({
        id: 'saved',
        name: 'Warmup',
        description: '5m countdown',
        isBuiltIn: false,
        config: { id: 'warmup', name: 'Warmup', type: 'COUNTDOWN', duration: 300 },
      })
    )
  })
  await page.goto('/configure?tab=presets')
  const card = page.getByRole('group', { name: 'Warmup', exact: true })
  const share = card.getByRole('button', { name: 'Share', exact: true })
  await share.tap()
  await expect(page).toHaveURL(/\/configure\?tab=presets$/)
  await expect(card.getByLabel('Copy link')).toHaveCount(0)
  await page.evaluate(() => {
    Object.defineProperty(navigator, 'share', { value: undefined })
    Object.defineProperty(navigator.clipboard, 'writeText', {
      value: () => Promise.reject(new DOMException('Denied', 'NotAllowedError')),
    })
  })
  await share.tap()
  const input = card.getByLabel('Copy link')
  await expect(input).toBeVisible()
  await page.goto(await input.inputValue())
  await expect(page.getByRole('heading', { name: 'Warmup' })).toBeVisible()
  await expect(page.getByText('5m', { exact: true })).toBeVisible()
})
