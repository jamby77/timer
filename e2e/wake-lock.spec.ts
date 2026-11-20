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
