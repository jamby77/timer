import { expect, test } from 'playwright/test'

import type { Page } from 'playwright/test'

async function openComplex(page: Page, type: string, autoAdvance: boolean, final = false) {
  const phase = (id: string, phaseType: string) => ({
    id,
    name: `Phase ${id}`,
    type: phaseType,
    order: Number(id),
    config: {
      id,
      name: `Timer ${id}`,
      type: phaseType,
      duration: 300,
      timeLimit: 300,
      workDuration: 300,
      restDuration: 60,
      intervals: 2,
      maxWorkTime: 300,
      maxRounds: 2,
      restMode: 'fixed',
      fixedRestDuration: 60,
      countdownBeforeStart: 0,
      sound: { enabled: false, volume: 0 },
    },
  })
  await page.addInitScript(
    (config) => localStorage.setItem('timer_stop-check', JSON.stringify(config)),
    {
      id: 'stop-check',
      name: 'Stop verification',
      type: 'COMPLEX',
      autoAdvance,
      phases: final
        ? [phase('1', type)]
        : [phase('1', type), phase('2', 'COUNTDOWN'), phase('3', 'COUNTDOWN')],
    }
  )
  await page.goto('/?id=stop-check')
  await expect(page.getByText('Phase 1', { exact: true })).toBeVisible()
  await page
    .getByRole('button', { name: /^Start/i })
    .first()
    .click()
  await expect(page.locator('html')).toHaveAttribute('data-fullscreen', 'true')
}

for (const type of ['COUNTDOWN', 'STOPWATCH', 'INTERVAL']) {
  test(`${type} Stop advances exactly one complex phase`, async ({ page }) => {
    await openComplex(page, type, true)
    await page.getByRole('button', { name: /^Stop/i }).first().click()
    await expect(page.getByText('Phase 2', { exact: true })).toBeVisible()
    await expect(page.getByRole('navigation')).toBeVisible()
  })

  test(`${type} Stop stays on the phase without auto-advance`, async ({ page }) => {
    await openComplex(page, type, false)
    await page.getByRole('button', { name: /^Stop/i }).first().click()
    await expect(page.getByRole('navigation')).toBeVisible()
    await expect(page.getByText('Phase 1', { exact: true })).toBeVisible()
  })

  test(`${type} final Stop restores navigation`, async ({ page }) => {
    await openComplex(page, type, true, true)
    await page.getByRole('button', { name: /^Stop/i }).first().click()
    await expect(page.getByRole('navigation')).toBeVisible()
    await expect(page.locator('html')).not.toHaveAttribute('data-fullscreen', 'true')
  })
}

test('paused Work/Rest Stop work advances the complex phase', async ({ page }) => {
  await openComplex(page, 'WORKREST', true)
  await page.getByRole('button', { name: 'Pause work', exact: true }).click()
  await page.getByRole('button', { name: 'Stop work', exact: true }).click()
  await expect(page.getByText('Phase 2', { exact: true })).toBeVisible()
})

for (const type of ['COUNTDOWN', 'STOPWATCH', 'INTERVAL', 'WORKREST']) {
  test(`${type} skipping an active phase clears its navigation lock`, async ({ page }) => {
    await openComplex(page, type, true)
    await page.getByRole('button', { name: 'Go to next phase', exact: true }).click()
    await expect(page.getByText('Phase 2', { exact: true })).toBeVisible()
    await expect(page.getByRole('navigation')).toBeVisible()
  })
}

test('running Work/Rest Stop work advances exactly one phase', async ({ page }) => {
  await openComplex(page, 'WORKREST', true)
  await page.getByRole('button', { name: 'Stop work', exact: true }).click()
  await expect(page.getByText('Phase 2', { exact: true })).toBeVisible()
  await expect(page.getByRole('navigation')).toBeVisible()
})
