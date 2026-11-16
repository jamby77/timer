import { expect, test } from 'playwright/test'

import type { Page } from 'playwright/test'

async function expectViewportFilled(page: Page) {
  const dimensions = await page.evaluate(() => {
    const card = document.querySelector('[data-timer-state]')!
    const bounds = card.getBoundingClientRect()
    return {
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: bounds.height,
      viewportWidth: innerWidth,
      viewportHeight: innerHeight,
    }
  })
  expect(dimensions.x).toBe(0)
  expect(dimensions.y).toBe(0)
  expect(dimensions.width).toBe(dimensions.viewportWidth)
  expect(dimensions.height).toBe(dimensions.viewportHeight)
  for (const button of await page.locator('main button').all()) {
    await expect(button).toBeInViewport({ ratio: 1 })
  }
}

for (const viewport of [
  { width: 956, height: 440 },
  { width: 390, height: 844 },
]) {
  for (const type of ['COUNTDOWN', 'STOPWATCH', 'INTERVAL', 'WORKREST']) {
    test(`${type} fills ${viewport.width}x${viewport.height} while running and paused`, async ({
      page,
    }) => {
      await page.setViewportSize(viewport)
      await page.addInitScript((type) => {
        localStorage.setItem(
          'timer_layout',
          JSON.stringify({
            id: 'layout',
            name: 'Workout',
            type: 'COMPLEX',
            phases: [
              {
                id: 'phase',
                name: 'Current phase',
                order: 0,
                type,
                config: {
                  id: 'child',
                  name: 'Current phase',
                  type,
                  duration: 60,
                  timeLimit: 60,
                  workDuration: 20,
                  restDuration: 10,
                  intervals: 8,
                  maxWorkTime: 60,
                  maxRounds: 2,
                  restMode: 'ratio',
                  ratio: 2,
                },
              },
            ],
          })
        )
      }, type)
      await page.goto('/?id=layout')
      await page
        .getByRole('button', { name: /^Start/ })
        .first()
        .click()
      await expect(page.getByRole('button', { name: /^Pause/ })).toBeVisible()
      await expectViewportFilled(page)
      await expect(
        page.locator('[data-slot="card-header"]').getByText('Current phase', { exact: true })
      ).toBeVisible()
      await page.getByRole('button', { name: /^Pause/ }).click()
      await expect(page.getByRole('button', { name: /^Pause/ })).toBeHidden()
      await expectViewportFilled(page)
    })
  }
}
