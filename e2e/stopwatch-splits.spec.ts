import { expect, test } from 'playwright/test'

test.use({ viewport: { width: 320, height: 640 }, isMobile: true, hasTouch: true })

test('Lap excludes pauses, recovers its baseline and records the final split once', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-01-01T12:00:00Z') })
  await page.clock.pauseAt(new Date('2026-01-01T12:01:00Z'))
  await page.addInitScript(() => localStorage.setItem('timer_split', JSON.stringify({
    id: 'split', name: 'Track repeats', type: 'STOPWATCH', timeLimit: 60,
  })))
  await page.goto('/?id=split')
  const button = (name: string) => page.getByRole('button', { name, exact: true })
  const lap = button('Lap')
  await button('Start timer').tap()
  await page.clock.fastForward(20400)
  await lap.tap()
  await expect(page.getByRole('status')).toHaveText('Lap 1 · 00:20.40')
  const before = await lap.boundingBox()
  await button('Pause timer').tap()
  await expect(lap).toBeDisabled()
  expect(await lap.boundingBox()).toEqual(before)
  await page.clock.fastForward(10000)
  await button('Resume timer').tap()
  await page.clock.fastForward(19600)
  await lap.press('Enter')
  await expect(page.getByRole('status')).toHaveText('Lap 2 · 00:19.60')
  await page.reload()
  await button('Resume').tap()
  await expect(page.getByRole('status')).toHaveText('Lap 2 · 00:19.60')
  await page.clock.fastForward(20000)
  await expect(button('Expand lap history')).toContainText('Lap 2 - 00:19:60')
  await button('Expand lap history').tap()
  await expect(page.getByText('Best', { exact: true }).locator('..')).toContainText('Lap 2 - 00:19:60')
  const rows = page.getByRole('table').getByRole('row')
  await expect(rows).toHaveCount(4)
  await expect(rows.nth(1)).toHaveText('300:20.0001:00.00')
  await expect(rows.nth(2)).toHaveText('200:19.6000:40.00')
  await button('Restart timer').tap()
  await page.clock.runFor(1200)
  await lap.tap()
  await button('Stop timer').tap()
  await button('Expand lap history').tap()
  await expect(page.getByRole('table', { name: 'Run 2' }).getByRole('row')).toHaveCount(2)
  await expect(page.getByRole('table', { name: 'Run 2' })).toContainText('100:01.2000:01.20')
})

test('Complex Stopwatch keeps Lap above the digits in both orientations', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-01-01T12:00:00Z') })
  await page.clock.pauseAt(new Date('2026-01-01T12:01:00Z'))
  await page.addInitScript(() => {
    const config = { id: 's', name: 'Sprint', type: 'STOPWATCH', timeLimit: 60, countdownBeforeStart: 3 }
    localStorage.setItem('timer_complex', JSON.stringify({
      id: 'complex', name: 'Circuit', type: 'COMPLEX', phases: [
        { id: 's', name: 'Sprint', order: 0, type: config.type, config },
        { id: 'r', name: 'Rest', order: 1, type: 'COUNTDOWN', config: { id: 'r', name: 'Rest', type: 'COUNTDOWN', duration: 30 } },
      ],
    }))
  })
  await page.goto('/?id=complex')
  const button = (name: string) => page.getByRole('button', { name, exact: true })
  await button('Start timer').tap()
  await expect(button('Lap')).toBeHidden()
  await page.clock.runFor(4000)
  for (const [width, height] of [[320, 640], [667, 375]]) {
    await page.setViewportSize({ width, height })
    const lap = (await button('Lap').boundingBox())!
    const digits = (await page.locator('[data-slot=card-content] .font-mono').boundingBox())!
    expect(lap.height).toBeGreaterThanOrEqual(44)
    expect(Math.abs(lap.x + lap.width / 2 - width / 2)).toBeLessThan(1)
    expect(lap.y + lap.height).toBeLessThanOrEqual(digits.y)
    await page.clock.fastForward(1000)
    await button('Lap').tap()
    await expect(page.getByRole('status')).toContainText('Lap ')
    await expect(button('Go to next phase')).toBeInViewport()
    await expect(page.getByText('Phase 1/2')).toBeVisible()
  }
})

test('a single stopwatch lap has no best-lap summary', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('timer_one', JSON.stringify({
    id: 'one', name: 'Single lap', type: 'STOPWATCH',
  })))
  await page.goto('/?id=one')
  await page.getByRole('button', { name: 'Start timer' }).tap()
  await page.getByRole('button', { name: 'Stop timer' }).tap()
  const expand = page.getByRole('button', { name: 'Expand lap history' })
  await expect(expand).toContainText('Last lap')
  await expect(expand).not.toContainText('Best')
  await expand.tap()
  await expect(page.getByRole('table').getByRole('row')).toHaveCount(2)
  await expect(page.getByText('Best', { exact: true })).toHaveCount(0)
})
