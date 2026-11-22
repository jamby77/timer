import { expect, test } from 'playwright/test'

test.use({ viewport: { width: 320, height: 640 }, isMobile: true, hasTouch: true })

for (const type of ['STOPWATCH', 'COUNTDOWN', 'WORKREST']) {
  test(type + ' pauses at the tap between display updates', async ({ page }) => {
    await page.clock.install({ time: new Date('2026-01-01T12:00:00Z') })
    await page.clock.pauseAt(new Date('2026-01-01T12:01:00Z'))
    await page.addInitScript(
      (type) =>
        localStorage.setItem(
          'timer_pause',
          JSON.stringify({
            id: 'pause',
            name: 'Pause check',
            type,
            duration: 10,
            timeLimit: 10,
            restMode: 'fixed',
            fixedRestDuration: 2,
            maxRounds: 2,
            maxWorkTime: 10,
          })
        ),
      type
    )
    await page.goto('/?id=pause')
    const action = (label: string) => page.getByRole('button', { name: label, exact: true })
    const target = type === 'WORKREST' ? 'work' : 'timer'
    await action('Start ' + target).tap()
    const startedAt = await page.evaluate(() => Date.now())
    await page.clock.setSystemTime(startedAt + 2500)
    await action('Pause ' + target).tap()
    const digits = page.locator('[data-slot="card-content"]')
    const paused = type === 'COUNTDOWN' ? '00:07.50' : '00:02.50'
    await expect(digits).toHaveText(paused, { timeout: 1500 })
    await page.clock.runFor(3000)
    await expect(digits).toHaveText(paused)
    await action('Resume ' + target).tap()
    await page.clock.runFor(1200)
    await expect(digits).toContainText(type === 'COUNTDOWN' ? '00:06' : '00:03')
  })
}
