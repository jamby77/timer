import { expect, test } from 'playwright/test'

import type { Page } from 'playwright/test'

const types = ['COUNTDOWN', 'STOPWATCH', 'INTERVAL', 'WORKREST', 'COMPLEX']

async function openTimer(page: Page, type: string, duration = 60) {
  await page.addInitScript(
    ({ type, duration }) => {
      const config = {
        id: 'navigation',
        name: 'Navigation verification',
        type,
        duration,
        timeLimit: duration,
        workDuration: duration,
        restDuration: 1,
        intervals: 1,
        skipLastRest: true,
        maxWorkTime: duration,
        maxRounds: 1,
        restMode: 'fixed',
        fixedRestDuration: 1,
        countdownBeforeStart: 0,
        sound: { enabled: false, volume: 0 },
      }
      localStorage.setItem(
        'timer_navigation',
        JSON.stringify(
          type === 'COMPLEX'
            ? {
                id: 'navigation',
                name: 'Navigation workout',
                type,
                autoAdvance: true,
                phases: [0, 1].map((order) => ({
                  id: String(order),
                  name: `Phase ${order + 1}`,
                  order,
                  type: 'COUNTDOWN',
                  config: { ...config, type: 'COUNTDOWN' },
                })),
              }
            : config
        )
      )
    },
    { type, duration }
  )
  await page.goto('/?id=navigation')
  await expect(page.getByRole('navigation')).toBeVisible()
}

function controls(page: Page, type: string) {
  const suffix = type === 'INTERVAL' ? 'intervals' : type === 'WORKREST' ? 'work' : 'timer'
  return {
    start: page.getByRole('button', { name: `Start ${suffix}`, exact: true }),
    pause: page.getByRole('button', { name: `Pause ${suffix}`, exact: true }),
    stop: page.getByRole('button', { name: `Stop ${suffix}`, exact: true }),
  }
}

for (const type of types) {
  test(`${type} navigation hides while running and paused and returns on Stop`, async ({
    page,
  }) => {
    await openTimer(page, type)
    const { start, pause, stop } = controls(page, type)
    await start.click()
    await expect(page.getByRole('navigation')).toBeHidden()
    await pause.click()
    await expect(page.getByRole('navigation')).toBeHidden()
    await stop.click()
    await page.getByRole('button', { name: 'End', exact: true }).click()
    await expect(page.getByRole('navigation')).toBeVisible()
    if (type === 'COMPLEX') {
      await expect(page.getByRole('status')).toHaveText('Timer stopped')
      await page.getByRole('button', { name: 'Restart timer', exact: true }).click()
      await expect(page.getByRole('navigation')).toBeVisible()
    }
    await start.click()
    await expect(page.getByRole('navigation')).toBeHidden()
    await stop.click()
    await page.getByRole('button', { name: 'End', exact: true }).click()
    await expect(page.getByRole('navigation')).toBeVisible()
  })

  test(`${type} navigation returns after natural completion`, async ({ page }) => {
    await openTimer(page, type, 2)
    await controls(page, type).start.click()
    await expect(page.getByRole('navigation')).toBeHidden()
    if (type === 'COMPLEX') {
      await expect(page.getByText('Phase 2/2', { exact: true })).toBeVisible()
      await expect(page.getByRole('navigation')).toBeHidden()
    }
    await expect(page.locator('[data-timer-state]')).toHaveAttribute(
      'data-timer-state',
      'completed',
      { timeout: 6000 }
    )
    await expect(page.getByRole('navigation')).toBeVisible()
  })

  test(`${type} recovery choices and activity stay independent across tabs`, async ({
    page,
    context,
  }) => {
    await openTimer(page, type)
    await controls(page, type).start.click()
    const other = await context.newPage()
    await other.goto('/?id=navigation')
    await expect(other.getByRole('navigation')).toBeVisible()
    await expect(page.getByRole('navigation')).toBeHidden()
    await controls(other, type).start.click()
    await controls(other, type).pause.click()
    await expect(other.getByRole('navigation')).toBeHidden()
    await page.reload()
    await expect(page.getByRole('navigation')).toBeVisible()
    await page.getByRole('button', { name: 'Resume', exact: true }).click()
    await expect(page.locator('[data-timer-state]')).toHaveAttribute('data-timer-state', 'running')
    await expect(other.getByRole('navigation')).toBeHidden()
    await other.reload()
    await expect(other.getByRole('navigation')).toBeVisible()
    await other.getByRole('button', { name: 'Discard', exact: true }).click()
    await expect(other.locator('[data-timer-state]')).toHaveAttribute('data-timer-state', 'idle')
  })
}

test.describe('phone navigation', () => {
  test.use({ viewport: { width: 320, height: 640 }, isMobile: true, hasTouch: true })

  test('header controls support edge taps and identify the active section', async ({ page }) => {
    await openTimer(page, 'COUNTDOWN')
    const nav = page.getByRole('navigation')
    const run = nav.getByRole('link', { name: 'Run' })
    const create = nav.getByRole('link', { name: 'New' })
    const theme = nav.getByRole('button', { name: /toggle theme/i })
    for (const control of [run, create, theme]) {
      const box = (await control.boundingBox())!
      expect(box.width).toBeGreaterThanOrEqual(44)
      expect(box.height).toBeGreaterThanOrEqual(44)
    }
    await expect(run).toHaveAttribute('aria-current', 'page')
    const themeName = await theme.innerText()
    await theme.tap({ position: { x: 3, y: 3 } })
    await expect(theme).not.toHaveText(themeName)
    await create.tap({ position: { x: 3, y: 3 } })
    await expect(create).toHaveAttribute('aria-current', 'page')
    await page.getByRole('heading', { name: 'Complex', exact: true }).tap()
    await expect(page).toHaveURL(/\/configure\/complex/)
    await expect(create).toHaveAttribute('aria-current', 'location')
    await run.tap({ position: { x: 3, y: 3 } })
    await expect(page).not.toHaveURL(/\/configure\/complex/)
  })
})
