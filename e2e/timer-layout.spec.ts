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
      const pausedLabel = page.getByText('Paused', { exact: true })
      await expect(pausedLabel).toBeHidden()
      await page.getByRole('button', { name: /^Pause/ }).click()
      await expect(pausedLabel).toBeInViewport({ ratio: 1 })
      await expect(page.getByRole('button', { name: /^Pause/ })).toBeHidden()
      await expectViewportFilled(page)
      await page.getByRole('button', { name: /^Resume/ }).click()
      await expect(pausedLabel).toBeHidden()
    })
  }
}

test('a narrow portrait phone shows a two-line phase title between the timer name and phase count', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 640 })
  await page.addInitScript(() => {
    localStorage.setItem(
      'timer_mobility',
      JSON.stringify({
        id: 'mobility',
        type: 'COMPLEX',
        name: 'Mobility',
        phases: [
          {
            id: 'shoulders',
            name: 'Shoulder mobility',
            order: 0,
            type: 'COUNTDOWN',
            config: { id: 'child', name: 'Shoulders', type: 'COUNTDOWN', duration: 60 },
          },
        ],
      })
    )
  })
  await page.goto('/?id=mobility')
  await page.getByRole('button', { name: 'Start timer', exact: true }).click()
  const header = page.locator('[data-slot="card-header"]')
  const title = header.getByText('Shoulder mobility', { exact: true })
  for (const action of ['Pause timer', 'Resume timer']) {
    const lines = await title.evaluate((element) => {
      const range = document.createRange()
      range.selectNodeContents(element)
      return Array.from(range.getClientRects(), (rect) => rect.toJSON())
    })
    expect(lines).toHaveLength(2)
    expect(lines[1].top).toBeGreaterThan(lines[0].top)
    const left = (await header.getByText('Mobility', { exact: true }).boundingBox())!
    const right = (await header.getByText('Phase 1/1', { exact: true }).boundingBox())!
    for (const line of lines) {
      expect(line.left).toBeGreaterThanOrEqual(left.x + left.width)
      expect(line.right).toBeLessThanOrEqual(right.x)
    }
    await expectViewportFilled(page)
    await page.getByRole('button', { name: action, exact: true }).click()
  }
})
