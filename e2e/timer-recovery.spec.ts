import { expect, test } from 'playwright/test'

test.use({ viewport: { width: 320, height: 640 }, isMobile: true, hasTouch: true })

for (const type of ['COUNTDOWN', 'STOPWATCH', 'INTERVAL', 'WORKREST', 'COMPLEX']) {
  test(`${type} resumes its saved position and discards on request`, async ({ page }) => {
    await page.addInitScript((type) => {
      const config = {
        id: 'recovery',
        name: 'Strength',
        type,
        duration: 45,
        timeLimit: 45,
        intervals: 3,
        workDuration: 45,
        restDuration: 25,
        maxRounds: 3,
        maxWorkTime: 45,
        restMode: 'fixed',
        fixedRestDuration: 25,
      }
      const timer =
        type === 'COMPLEX'
          ? {
              id: 'recovery',
              name: 'Circuit',
              type,
              overallTimeLimit: 120,
              phases: ['COUNTDOWN', 'INTERVAL'].map((kind, order) => ({
                id: String(order),
                name: order ? 'Strength' : 'Warmup',
                type: kind,
                order,
                config: { ...config, type: kind },
              })),
            }
          : config
      localStorage.setItem('timer_recovery', JSON.stringify(timer))
    }, type)
    const button = (name: string) => page.getByRole('button', { name, exact: true })
    const header = page.locator('[data-slot=card-header]')
    const digits = page.locator('[data-slot=card-content]')
    await page.goto('/?id=recovery')
    const interval = type === 'INTERVAL' || type === 'COMPLEX'
    if (type === 'COMPLEX') await button('Go to next phase').tap()
    await button(
      interval ? 'Start intervals' : type === 'WORKREST' ? 'Start work' : 'Start timer'
    ).tap()
    if (interval) {
      for (let i = 0; i < 3; i++) await button('Skip current interval').tap()
      await expect(header).toContainText('2 of 3 rounds')
    } else if (type === 'WORKREST') {
      await expect(digits).not.toHaveText('00:00.00')
      await button('Finish work / Start rest').tap()
      await button('Skip rest').tap()
      await expect(header).toContainText('Work · Round 2 of 3')
      await expect(digits).toContainText('00:01')
      await button('Finish work / Start rest').tap()
      await expect(header).toContainText('Rest · Round 2 of 3')
    }
    const seconds = type === 'STOPWATCH' ? '00:01' : type === 'COUNTDOWN' ? '00:43' : '00:23'
    await expect(digits).toContainText(seconds)
    if (type !== 'WORKREST') await button(interval ? 'Pause intervals' : 'Pause timer').tap()
    await page.reload()
    await expect(page.getByRole('heading', { name: 'Resume timer?' })).toBeVisible()
    await page.reload()
    await button('Resume').tap()
    await expect(page.locator('[data-timer-state]')).toHaveAttribute('data-timer-state', 'running')
    await expect(digits).toContainText(seconds)
    if (interval) {
      await expect(header).toContainText('Rest')
      await expect(header).toContainText('2 of 3 rounds')
    }
    if (type === 'COMPLEX') {
      await expect(header).toContainText('Phase 2/2')
      await expect(header.getByLabel('Overall timer time')).not.toContainText('00:00 /')
    }
    if (type === 'WORKREST') await expect(header).toContainText('Rest · Round 2 of 3')
    await page.reload()
    await button('Discard').tap()
    await expect(page.locator('[data-timer-state]')).toHaveAttribute('data-timer-state', 'idle')
    await page.reload()
    await expect(page.locator('[data-timer-state]')).toHaveAttribute('data-timer-state', 'idle')
    if (type === 'COMPLEX') await expect(header).toContainText('Phase 1/2')
  })
}

test('pre-start resumes from the interrupted countdown and completion clears recovery', async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem(
      'timer_prep',
      JSON.stringify({
        id: 'prep',
        type: 'COUNTDOWN',
        name: 'Ready',
        duration: 1,
        countdownBeforeStart: 5,
      })
    )
  )
  await page.goto('/?id=prep')
  await page.getByRole('button', { name: 'Start timer', exact: true }).tap()
  const digits = page.locator('[data-slot=card-content]')
  await expect(digits).toHaveText('3')
  await page.reload()
  await page.getByRole('button', { name: 'Resume', exact: true }).tap()
  await expect(page.getByText('Get ready', { exact: true })).toBeVisible()
  await expect(digits).toHaveText('3')
  await expect(page.getByText('Complete', { exact: true })).toBeVisible({ timeout: 6000 })
  await page.reload()
  await expect(page.locator('[data-timer-state]')).toHaveAttribute('data-timer-state', 'idle')
})

for (const type of ['COUNTDOWN', 'STOPWATCH', 'COMPLEX']) {
  test(type + ' recovers time elapsed since the last display update', async ({ page }) => {
    await page.clock.install({ time: new Date('2026-01-01T12:00:00Z') })
    await page.clock.pauseAt(new Date('2026-01-01T12:01:00Z'))
    await page.addInitScript(type => {
      const phase = { id: 'work', name: 'Work', type: 'COUNTDOWN', duration: 20 }
      const config = type === 'COMPLEX'
        ? { type, overallTimeLimit: 60, phases: [{ ...phase, config: phase, order: 0 }] }
        : { ...phase, type, timeLimit: 20 }
      localStorage.setItem('timer_live', JSON.stringify({ ...config, id: 'live', name: 'Timing' }))
    }, type)
    await page.goto('/?id=live')
    const button = (name: string) => page.getByRole('button', { name, exact: true })
    await button('Start timer').tap()
    await expect(page.locator('[data-timer-state]')).toHaveAttribute('data-timer-state', 'running')
    await page.clock.setSystemTime((await page.evaluate(() => Date.now())) + 7500)
    await page.reload()
    const seconds = type === 'STOPWATCH' ? '00:07' : '00:12'
    await expect(page.getByRole('region', { name: 'Resume timer?' })).toContainText(seconds, { timeout: 1500 })
    await page.clock.runFor(5000)
    await button('Resume').tap()
    await page.clock.runFor(150)
    await expect(page.locator('[data-slot=card-content]')).toContainText(seconds)
    if (type === 'COMPLEX') await expect(page.getByLabel('Overall timer time')).toContainText('00:07 /')
  })
}

for (const scenario of ['running', 'paused', 'expired']) {
  test('pre-start countdown recovery between frames: ' + scenario, async ({ page }) => {
    await page.clock.install({ time: new Date('2026-01-01T12:00:00Z') })
    await page.clock.pauseAt(new Date('2026-01-01T12:01:00Z'))
    await page.addInitScript(() => localStorage.setItem('timer_ready', JSON.stringify({
      id: 'ready', type: 'COUNTDOWN', name: 'Warmup', duration: 20, countdownBeforeStart: 5,
    })))
    await page.goto('/?id=ready')
    const button = (name: string) => page.getByRole('button', { name, exact: true })
    const ready = page.getByText('Get ready', { exact: true })
    await button('Start timer').tap()
    await expect(ready).toBeVisible()
    const started = await page.evaluate(() => Date.now())
    await page.clock.setSystemTime(started + (scenario === 'expired' ? 6000 : 3200))
    if (scenario === 'paused') {
      await button('Pause timer').tap()
      await page.clock.setSystemTime(started + 12000)
    }
    await page.reload()
    await page.clock.runFor(5000)
    await button('Resume').tap()
    if (scenario !== 'expired') {
      await expect(page.locator('[data-slot=card-content]')).toHaveText('2', { timeout: 1500 })
      await page.clock.runFor(1750)
      await expect(ready).toBeVisible()
    }
    await page.clock.runFor(150)
    await expect(ready).toBeHidden({ timeout: 1500 })
    await expect(page.locator('[data-timer-state]')).toHaveAttribute('data-timer-state', 'running')
  })
}
