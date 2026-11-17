import { expect, test } from 'playwright/test'

import type { Page } from 'playwright/test'

async function openWorkout(
  page: Page,
  options: {
    type?: string
    limit?: number
    duration?: number
    restDuration?: number
    preStart?: number
    secondPhase?: boolean
    autoAdvance?: boolean
  } = {}
) {
  const {
    type = 'COUNTDOWN',
    limit = 1,
    duration = 30,
    restDuration = 1,
    preStart = 0,
    secondPhase = false,
    autoAdvance = true,
  } = options
  await page.addInitScript(
    ({ type, limit, duration, restDuration, preStart, secondPhase, autoAdvance }) => {
      const phase = {
        id: 'first',
        name: 'First phase',
        order: 0,
        type,
        config: {
          id: 'first',
          type,
          duration,
          timeLimit: duration,
          workDuration: duration,
          restDuration,
          intervals: 2,
          maxWorkTime: duration,
          maxRounds: 2,
          restMode: 'fixed',
          fixedRestDuration: restDuration,
          countdownBeforeStart: preStart,
          sound: { enabled: false, volume: 0 },
        },
      }
      localStorage.setItem(
        'timer_overall',
        JSON.stringify({
          id: 'overall',
          name: 'Overall workout',
          type: 'COMPLEX',
          overallTimeLimit: limit || undefined,
          autoAdvance,
          phases: [
            phase,
            ...(secondPhase
              ? [
                  {
                    ...phase,
                    id: 'second',
                    name: 'Second phase',
                    order: 1,
                    config: { ...phase.config, duration: 30 },
                  },
                ]
              : []),
          ],
        })
      )
    },
    { type, limit, duration, restDuration, preStart, secondPhase, autoAdvance }
  )
  await page.goto('/?id=overall')
}
const timer = (page: Page) => page.locator('[data-timer-state]')
const prompt = (page: Page) => page.getByRole('dialog', { name: 'Time Limit Reached' })
const overall = (page: Page) => page.getByLabel('Overall workout time')

for (const type of ['COUNTDOWN', 'STOPWATCH', 'INTERVAL', 'WORKREST']) {
  test(`${type} excludes pauses and End stops the entire workout`, async ({ page }) => {
    await openWorkout(page, { type })
    const suffix = type === 'INTERVAL' ? 'intervals' : type === 'WORKREST' ? 'work' : 'timer'
    await page.getByRole('button', { name: `Start ${suffix}`, exact: true }).click()
    await expect(timer(page)).toHaveAttribute('data-timer-state', 'running')
    await page.getByRole('button', { name: `Pause ${suffix}`, exact: true }).click()
    const time = await overall(page).textContent()
    await page.waitForTimeout(1200)
    await expect(overall(page)).toHaveText(time!)
    await expect(prompt(page)).toBeHidden()
    const resume = ['INTERVAL', 'WORKREST'].includes(type) ? 'Resume' : 'Start'
    await page.getByRole('button', { name: `${resume} ${suffix}`, exact: true }).click()
    await expect(prompt(page)).toBeVisible()
    await page.getByRole('button', { name: 'End Workout', exact: true }).click()
    await expect(page.getByRole('status')).toHaveText('Workout stopped')
    await expect(page.getByRole('navigation')).toBeVisible()
    await page.getByRole('button', { name: 'Restart workout', exact: true }).click()
    await expect(overall(page)).toContainText('00:00 / 00:01')
    await expect(timer(page)).toHaveAttribute('data-timer-state', 'idle')
  })
}

for (const width of [440, 956]) {
  test(`Continue keeps timing and restart resets the limit at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: width === 440 ? 956 : 440 })
    await openWorkout(page)
    await page.getByRole('button', { name: 'Start timer', exact: true }).click()
    await expect(prompt(page)).toBeVisible()
    await expect(timer(page)).toHaveAttribute('data-timer-state', 'running')
    await page.getByRole('button', { name: 'Continue Workout', exact: true }).click()
    await page.waitForTimeout(1200)
    await expect(prompt(page)).toBeHidden()
    await expect(overall(page)).toContainText('Limit reached')
    const header = await overall(page).boundingBox()
    expect(header!.x).toBeGreaterThanOrEqual(0)
    expect(header!.x + header!.width).toBeLessThanOrEqual(width)
    await page.getByRole('button', { name: 'Restart from first phase', exact: true }).click()
    await expect(overall(page)).toContainText('00:00 / 00:01')
    await page.getByRole('button', { name: 'Start timer', exact: true }).click()
    await expect(prompt(page)).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(prompt(page)).toBeHidden()
    await page.waitForTimeout(1100)
    await expect(prompt(page)).toBeHidden()
  })
}

test('excludes pre-start and retains elapsed time across automatic phases', async ({ page }) => {
  await openWorkout(page, { limit: 2, duration: 1, preStart: 2, secondPhase: true })
  await page.getByRole('button', { name: 'Start timer', exact: true }).click()
  await page.waitForTimeout(1200)
  await expect(overall(page)).toContainText('00:00 / 00:02')
  await expect(prompt(page)).toBeHidden()
  await expect(page.getByText('Second phase', { exact: true })).toBeVisible()
  await expect(prompt(page)).toBeVisible({ timeout: 7000 })
  await expect(timer(page)).toHaveAttribute('data-timer-state', 'running')
})

test('natural completion closes a pending prompt and wins at the limit', async ({ page }) => {
  await openWorkout(page, { limit: 1, duration: 1 })
  await page.getByRole('button', { name: 'Start timer', exact: true }).click()
  await expect(timer(page)).toHaveAttribute('data-timer-state', 'completed')
  await expect(prompt(page)).toBeHidden()
  await expect(page.getByRole('navigation')).toBeVisible()
})

test('no limit adds no UI and reload resets a limited workout', async ({ page }) => {
  await openWorkout(page, { limit: 0 })
  await page.getByRole('button', { name: 'Start timer', exact: true }).click()
  await expect(overall(page)).toHaveCount(0)
  await expect(prompt(page)).toBeHidden()
  await openWorkout(page)
  await page.getByRole('button', { name: 'Start timer', exact: true }).click()
  await expect(prompt(page)).toBeVisible()
  await page.reload()
  await expect(prompt(page)).toBeHidden()
  await expect(overall(page)).toContainText('00:00 / 00:01')
  await expect(page.getByRole('navigation')).toBeVisible()
})

for (const type of ['STOPWATCH', 'INTERVAL', 'WORKREST']) {
  test(`${type} excludes the pre-start countdown`, async ({ page }) => {
    await openWorkout(page, { type, preStart: 2 })
    const suffix = type === 'INTERVAL' ? 'intervals' : type === 'WORKREST' ? 'work' : 'timer'
    await page.getByRole('button', { name: `Start ${suffix}`, exact: true }).click()
    await page.waitForTimeout(1200)
    await expect(overall(page)).toContainText('00:00 / 00:01')
    await expect(prompt(page)).toBeHidden()
    await expect(prompt(page)).toBeVisible({ timeout: 4000 })
  })
}

for (const type of ['INTERVAL', 'WORKREST']) {
  test(`${type} counts rest time and preserves elapsed time on phase restart`, async ({ page }) => {
    await openWorkout(page, { type, limit: 4, duration: 1, restDuration: 5 })
    const suffix = type === 'INTERVAL' ? 'intervals' : 'work'
    await page.getByRole('button', { name: `Start ${suffix}`, exact: true }).click()
    await expect(overall(page)).toContainText('00:02 / 00:04')
    const restartName = type === 'INTERVAL' ? 'Restart intervals' : 'Restart'
    await page.getByRole('button', { name: restartName, exact: true }).click()
    await expect(overall(page)).not.toContainText('00:00 /')
    await expect(prompt(page)).toBeVisible({ timeout: 4000 })
  })
}

test('manual phase navigation keeps elapsed time and excludes waiting', async ({ page }) => {
  await openWorkout(page, { limit: 3, secondPhase: true, autoAdvance: false })
  await page.getByRole('button', { name: 'Start timer', exact: true }).click()
  await expect(overall(page)).toContainText('00:01 / 00:03')
  await page.getByRole('button', { name: 'Go to next phase', exact: true }).click()
  await page.waitForTimeout(1200)
  await expect(overall(page)).toContainText('00:01 / 00:03')
  await page.getByRole('button', { name: 'Go to previous phase', exact: true }).click()
  await expect(overall(page)).toContainText('00:01 / 00:03')
  await page.getByRole('button', { name: 'Start timer', exact: true }).click()
  await expect(prompt(page)).toBeVisible()
})

test('natural completion dismisses an unanswered prompt', async ({ page }) => {
  await openWorkout(page, { limit: 1, duration: 3 })
  await page.getByRole('button', { name: 'Start timer', exact: true }).click()
  await expect(prompt(page)).toBeVisible()
  await expect(timer(page)).toHaveAttribute('data-timer-state', 'completed')
  await expect(prompt(page)).toBeHidden()
})

test('opening a different workout starts with a fresh budget', async ({ page }) => {
  await openWorkout(page)
  await page.getByRole('button', { name: 'Start timer', exact: true }).click()
  await expect(prompt(page)).toBeVisible()
  await page.evaluate(() => {
    const config = JSON.parse(localStorage.getItem('timer_overall')!)
    localStorage.setItem(
      'timer_other',
      JSON.stringify({ ...config, id: 'other', overallTimeLimit: 10 })
    )
  })
  await page.goto('/?id=other')
  await expect(overall(page)).toContainText('00:00 / 00:10')
  await expect(prompt(page)).toBeHidden()
  await expect(timer(page)).toHaveAttribute('data-timer-state', 'idle')
})
