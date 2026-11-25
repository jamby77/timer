import { expect, test } from 'playwright/test'

test.use({ viewport: { width: 320, height: 640 }, isMobile: true, hasTouch: true })

test('preview follows draft edits, supports touch and keyboard, and stays within the phone', async ({
  page,
}) => {
  await page.addInitScript(() => {
    const phases = [
      { type: 'COUNTDOWN', name: 'Warmup', duration: 60 },
      {
        type: 'INTERVAL',
        name: 'Intervals',
        intervals: 3,
        workDuration: 30,
        restDuration: 10,
        skipLastRest: true,
      },
      { type: 'COUNTDOWN', name: 'Cooldown', duration: 60 },
    ].map((config, order) => ({
      ...config,
      id: ['legacy', 'legacy', 'legacy-1'][order],
      order,
      config: { ...config, id: String(order) },
    }))
    localStorage.setItem(
      'preset_timeline',
      JSON.stringify({
        id: 'timeline',
        name: 'Circuit',
        description: '',
        isBuiltIn: false,
        config: { id: 'circuit', name: 'Circuit', type: 'COMPLEX', phases },
      })
    )
  })
  await page.goto('/configure/complex?preset=timeline')
  const preview = page.getByRole('tab', { name: 'Preview' })
  await expect(page.getByRole('tab', { name: 'Summary' })).toHaveAttribute('aria-selected', 'true')
  await preview.tap()
  const panel = page.getByRole('tabpanel', { name: 'Preview' })
  const rounds = panel.getByRole('button', { name: /Intervals/ })
  await expect(rounds).toHaveAttribute('aria-expanded', 'false')
  await rounds.tap()
  await expect(panel.getByText('Rest', { exact: true })).toHaveCount(2)
  await expect(panel.getByText('Finish').locator('..')).toHaveText('3:50Finish')
  await rounds.press('Enter')
  await expect(rounds).toHaveAttribute('aria-expanded', 'false')
  await page.getByRole('button', { name: 'Edit phase' }).nth(1).tap()
  await page.getByRole('checkbox', { name: 'Skip last rest period' }).uncheck()
  await page.getByLabel('Phase name').fill('UnbrokenLongPhaseNameThatHasToWrapOnANarrowPhone')
  await page.getByRole('button', { name: 'Save', exact: true }).tap()
  await expect(panel.getByText('Finish').locator('..')).toHaveText('4:00Finish')
  await panel.getByRole('button', { name: /UnbrokenLongPhaseName/ }).tap()
  await expect(panel.getByText('Rest', { exact: true })).toHaveCount(3)
  await page.getByRole('switch', { name: 'Auto-advance phases' }).click()
  await expect(panel.getByText('Finish').locator('..')).toHaveText('—Finish')
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320)
  await page.reload()
  await preview.tap()
  await expect(rounds).toBeVisible()
  await expect(panel.getByText('Finish').locator('..')).toHaveText('3:50Finish')
})

test('repeated phases have independently expandable passes with their start times', async ({
  page,
}) => {
  await page.addInitScript(() => {
    const phases = ['Work', 'Rest', 'Cooldown'].map((name, order) => ({
      id: String(order),
      name,
      order,
      type: 'COUNTDOWN',
      config: { id: String(order), name, type: 'COUNTDOWN', duration: 60 },
    }))
    localStorage.setItem(
      'preset_passes',
      JSON.stringify({
        id: 'passes',
        name: 'Repeated phases',
        description: '',
        isBuiltIn: false,
        config: {
          id: 'passes',
          type: 'COMPLEX',
          name: 'Repeated phases',
          phases,
          repeatGroups: [{ id: 'block', phaseIds: ['0', '1'], count: 4 }],
        },
      })
    )
  })
  await page.goto('/configure/complex?preset=passes')
  const summary = page.getByRole('tabpanel', { name: 'Summary' })
  await expect(summary.getByRole('heading', { name: 'Repeat ×4' })).toBeVisible()
  await expect(summary.getByText('Work', { exact: true })).toHaveCount(1)
  await expect(page.locator('input[value="9 phases"]')).toBeVisible()
  await page.getByRole('tab', { name: 'Preview' }).tap()
  const panel = page.getByRole('tabpanel', { name: 'Preview' })
  const group = panel.getByRole('button', { name: /Repeat ×4/ })
  await expect(group).toHaveAttribute('aria-expanded', 'false')
  await expect(panel.getByText('Finish').locator('..')).toHaveText('9:00Finish')
  await group.tap()
  const third = panel.getByRole('button', { name: /Pass 3 of 4/ })
  await expect(third).toHaveText('4:00Pass 3 of 4')
  await expect(panel.getByText('Work', { exact: true })).toHaveCount(0)
  await third.press('Enter')
  await expect(panel.getByText('Work', { exact: true }).locator('..')).toHaveText('4:00Work1m')
  await expect(panel.getByText('Rest', { exact: true }).locator('..')).toHaveText('5:00Rest1m')
  await expect(panel.getByText('Cooldown', { exact: true }).locator('..')).toHaveText(
    '8:00Cooldown1m'
  )
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320)
})
