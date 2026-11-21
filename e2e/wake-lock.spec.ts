import { expect, test } from 'playwright/test'

test.use({ viewport: { width: 320, height: 640 }, isMobile: true, hasTouch: true })

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() =>
    localStorage.setItem(
      'timer_awake',
      JSON.stringify({
        id: 'awake',
        type: 'COUNTDOWN',
        name: 'Workout',
        duration: 60,
      })
    )
  )
})

test('a denied wake lock plays the fallback until the timer pauses', async ({ page }) => {
  const consoleErrors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text())
  })
  await page.addInitScript(() =>
    Object.defineProperty(navigator, 'wakeLock', {
      value: {
        request: async () => {
          throw new DOMException('Denied', 'NotAllowedError')
        },
      },
    })
  )
  await page.goto('/?id=awake')
  await page.getByRole('button', { name: 'Start timer', exact: true }).tap()
  const video = page.locator('video')
  await expect
    .poll(() => video.evaluate((el) => (el as HTMLVideoElement).currentTime))
    .toBeGreaterThan(0.1)
  expect(consoleErrors).toEqual([])
  await expect(page.getByRole('button', { name: 'Open issues overlay' })).toHaveCount(0)
  await page.getByRole('button', { name: 'Pause timer', exact: true }).tap()
  await expect(video).toHaveCount(0)
})

test('a running workout reacquires a released lock when the page becomes visible', async ({
  page,
}) => {
  await page.addInitScript(() => {
    const locks: { released: boolean; release: () => Promise<void> }[] = []
    Object.assign(window, { locks })
    Object.defineProperty(navigator, 'wakeLock', {
      value: {
        request: async () => {
          const lock = Object.assign(new EventTarget(), {
            released: false,
            async release() {
              this.released = true
              lock.dispatchEvent(new Event('release'))
            },
          })
          locks.push(lock)
          return lock
        },
      },
    })
  })
  await page.goto('/?id=awake')
  await page.getByRole('button', { name: 'Start timer', exact: true }).tap()
  await page.evaluate(async () => {
    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'hidden' })
    document.dispatchEvent(new Event('visibilitychange'))
    await (window as unknown as { locks: WakeLockSentinel[] }).locks[0].release()
    Reflect.deleteProperty(document, 'visibilityState')
    document.dispatchEvent(new Event('visibilitychange'))
  })
  await page.getByRole('button', { name: 'Stop timer', exact: true }).tap()
  expect(
    await page.evaluate(() =>
      (window as unknown as { locks: WakeLockSentinel[] }).locks.map((lock) => lock.released)
    )
  ).toEqual([true, true])
})

for (const type of ['COUNTDOWN', 'STOPWATCH', 'INTERVAL', 'WORKREST', 'COMPLEX']) {
  test(`${type} keeps the screen-awake fallback active during pre-start until paused`, async ({
    page,
  }) => {
    await page.addInitScript((type) => {
      Object.defineProperty(navigator, 'wakeLock', { value: undefined })
      const phase = {
        id: 'prep',
        name: 'Warmup',
        type: type === 'COMPLEX' ? 'COUNTDOWN' : type,
        duration: 60,
        workDuration: 20,
        restDuration: 10,
        intervals: 2,
        restMode: 'fixed',
        fixedRestDuration: 10,
        maxRounds: 2,
      }
      const config =
        type === 'COMPLEX' ? { type, phases: [{ ...phase, config: phase, order: 0 }] } : phase
      localStorage.setItem(
        'timer_prep',
        JSON.stringify({
          ...config,
          id: 'prep',
          name: 'Workout',
          countdownBeforeStart: 60,
        })
      )
    }, type)
    await page.goto('/?id=prep')
    await page.getByRole('button', { name: /^Start / }).tap()
    await expect(page.locator('video')).toHaveCount(1, { timeout: 2000 })
    await page.getByRole('button', { name: /^Pause / }).tap()
    await expect(page.locator('video')).toHaveCount(0)
  })
}
