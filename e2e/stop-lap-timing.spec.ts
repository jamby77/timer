import { expect, test } from 'playwright/test'

test.use({ viewport: { width: 320, height: 640 }, isMobile: true, hasTouch: true })

for (const type of ['COUNTDOWN', 'STOPWATCH']) {
  test(type + ' saves the elapsed time at Stop', async ({ page }) => {
    await page.clock.install({ time: new Date('2026-01-01T12:00:00Z') })
    await page.clock.pauseAt(new Date('2026-01-01T12:01:00Z'))
    await page.addInitScript(
      (type) =>
        localStorage.setItem(
          'timer_split',
          JSON.stringify({
            id: 'split',
            name: 'Tap timing',
            type,
            duration: 10,
            timeLimit: 10,
          })
        ),
      type
    )
    await page.goto('/?id=split')
    const button = (name: string) => page.getByRole('button', { name, exact: true })
    const advanceWithoutFrames = async (ms: number) =>
      page.clock.setSystemTime((await page.evaluate(() => Date.now())) + ms)
    const history = button('Expand lap history')

    await button('Start timer').tap()
    await advanceWithoutFrames(2370)
    await button('Stop timer').tap()
    await expect(history).toContainText('00:02.37', { timeout: 1500 })

    await button('Start timer').tap()
    await advanceWithoutFrames(1320)
    await button('Pause timer').tap()
    await advanceWithoutFrames(5000)
    await button('Stop timer').tap()
    await expect(history).toContainText('00:01.32')

    await button('Start timer').tap()
    await advanceWithoutFrames(15000)
    await button('Stop timer').tap()
    await expect(history).toContainText('00:10.00')
  })
}

for (const [scenario, elapsed, laps] of [
  ['running', 2370, ['00:02.37']],
  ['paused', 1320, ['00:01.32']],
  ['during rest', 3500, ['00:03.00']],
  ['in the next round', 6270, ['00:01.27', '00:03.00']],
  ['after the last round', 12000, ['00:03.00', '00:03.00']],
] as const) {
  test('Interval saves work laps when stopped ' + scenario, async ({ page }) => {
    await page.clock.install({ time: new Date('2026-01-01T12:00:00Z') })
    await page.clock.pauseAt(new Date('2026-01-01T12:01:00Z'))
    await page.addInitScript(() =>
      localStorage.setItem(
        'timer_rounds',
        JSON.stringify({
          id: 'rounds',
          name: 'Rounds',
          type: 'INTERVAL',
          workDuration: 3,
          restDuration: 2,
          intervals: 2,
          skipLastRest: true,
        })
      )
    )
    await page.goto('/?id=rounds')
    const button = (name: string) => page.getByRole('button', { name, exact: true })
    await button('Start intervals').tap()
    const startedAt = await page.evaluate(() => Date.now())
    await page.clock.setSystemTime(startedAt + elapsed)
    if (scenario === 'paused') {
      await button('Pause intervals').tap()
      await page.clock.setSystemTime(startedAt + elapsed + 20000)
    }
    await button('Stop intervals').tap()
    await expect(button('Expand lap history')).toContainText('Last lap' + laps[0], {
      timeout: 1500,
    })
    await button('Expand lap history').tap()
    await expect(page.getByText(/^Lap \d+$/)).toHaveCount(laps.length - 1)
    if (laps.length === 2)
      await expect(page.getByText('Lap 1').locator('..')).toContainText(laps[1])
    await expect(button('Start intervals')).toBeVisible()
  })
}
