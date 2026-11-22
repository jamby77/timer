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
