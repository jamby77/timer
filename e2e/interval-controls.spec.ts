import { expect, test } from 'playwright/test'

for (const viewport of [
  { width: 320, height: 640 },
  { width: 440, height: 956 },
  { width: 956, height: 440 },
]) {
  test(`interval controls skip and restart within the complex phase at ${viewport.width}px`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport)
    await page.addInitScript(() => {
      localStorage.setItem(
        'timer_interval-controls',
        JSON.stringify({
          id: 'interval-controls',
          name: 'Workout',
          type: 'COMPLEX',
          autoAdvance: true,
          phases: ['COUNTDOWN', 'INTERVAL', 'COUNTDOWN'].map((type, order) => ({
            id: String(order),
            name: type === 'INTERVAL' ? 'Tabata' : 'Countdown',
            order,
            type,
            config: {
              id: String(order),
              name: type === 'INTERVAL' ? 'Tabata' : 'Countdown',
              type,
              duration: 60,
              workDuration: 30,
              restDuration: 20,
              intervals: 8,
              countdownBeforeStart: 0,
              sound: { enabled: false, volume: 0 },
            },
          })),
        })
      )
    })
    await page.goto('/?id=interval-controls')
    await page.getByRole('button', { name: 'Go to next phase', exact: true }).click()
    await page.getByRole('button', { name: 'Start intervals', exact: true }).click()
    const header = page.locator('[data-slot="card-header"]')
    const skip = header.getByRole('button', { name: 'Skip current interval', exact: true })
    await expect(skip).toHaveText('Skip current interval')
    const restart = header.getByRole('button', { name: 'Restart intervals', exact: true })
    await expect(header.getByText('1 of 8 rounds', { exact: true })).toBeVisible()
    const rounds = await header.getByText('1 of 8 rounds', { exact: true }).boundingBox()
    const skipBounds = await skip.boundingBox()
    const digits = await page.locator('[data-slot="card-content"]').boundingBox()
    expect(skipBounds!.y).toBeGreaterThanOrEqual(rounds!.y + rounds!.height)
    expect(skipBounds!.y + skipBounds!.height).toBeLessThanOrEqual(digits!.y)
    await skip.click()
    await expect(header.getByText('Rest', { exact: true })).toBeVisible()
    await expect(header.getByText('1 of 8 rounds', { exact: true })).toBeVisible()
    await skip.click()
    await expect(header.getByText('Work', { exact: true })).toBeVisible()
    await expect(header.getByText('2 of 8 rounds', { exact: true })).toBeVisible()
    await restart.click()
    await expect(header.getByText('1 of 8 rounds', { exact: true })).toBeVisible()
    await expect(header.getByText('Work', { exact: true })).toBeVisible()
    await expect(header.getByText('Phase 2/3', { exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Pause intervals', exact: true })).toBeVisible()
    await expect(page.getByText('Timer stopped', { exact: true })).toBeHidden()
  })
}
