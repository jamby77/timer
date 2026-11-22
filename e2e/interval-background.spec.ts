import { expect, test } from 'playwright/test'

test.use({ viewport: { width: 320, height: 640 }, isMobile: true, hasTouch: true })

for (const { state, gap, round, phase, seconds } of [
  { state: 'running', gap: 6000, round: 2, phase: 'Work', seconds: '00:01' },
  { state: 'running', gap: 8000, round: 2, phase: 'Rest', seconds: '00:01' },
  { state: 'completed', gap: 14000, round: 3, phase: 'Complete', seconds: '00:00.00' },
  { state: 'paused', gap: 14000, round: 1, phase: 'Paused', seconds: '00:02' },
]) {
  test(`Interval returns to ${phase} in round ${round} after a frozen page`, async ({
    page,
    context,
  }) => {
    await page.clock.install({ time: new Date('2026-01-01T12:00:00Z') })
    await page.clock.pauseAt(new Date('2026-01-01T12:01:00Z'))
    await page.addInitScript(() =>
      localStorage.setItem(
        'timer_background',
        JSON.stringify({
          id: 'background',
          type: 'INTERVAL',
          name: 'Background check',
          workDuration: 3,
          restDuration: 2,
          intervals: 3,
          skipLastRest: true,
          sound: { enabled: false, volume: 0 },
        })
      )
    )
    await page.goto('/?id=background')
    const header = page.locator('[data-slot="card-header"]')
    const digits = page.locator('[data-slot="card-content"]')
    await page.getByRole('button', { name: 'Start intervals', exact: true }).tap()
    await page.clock.runFor(200)
    if (state === 'paused')
      await page.getByRole('button', { name: 'Pause intervals', exact: true }).tap()
    const session = await context.newCDPSession(page)
    const leftAt = await page.evaluate(() => Date.now())
    await session.send('Page.setWebLifecycleState', { state: 'frozen' })
    try {
      await page.clock.setSystemTime(leftAt + gap)
    } finally {
      await session.send('Page.setWebLifecycleState', { state: 'active' })
    }
    await page.clock.runFor(120)
    await expect(page.locator('[data-timer-state]')).toHaveAttribute('data-timer-state', state)
    await expect(header).toContainText(`${round} of 3 rounds`)
    await expect(header).toContainText(phase)
    await expect(digits).toContainText(seconds)
  })
}
