import { expect, test } from 'playwright/test'

import type { Page } from 'playwright/test'

async function openComplex(
  page: Page,
  type: string,
  autoAdvance: boolean,
  final = false,
  preStart = 0,
  name = 'Stop verification'
) {
  const phase = (id: string, phaseType: string) => ({
    id,
    name: `Phase ${id}`,
    type: phaseType,
    order: Number(id),
    config: {
      id,
      name: `Timer ${id}`,
      type: phaseType,
      duration: 300,
      timeLimit: 300,
      workDuration: 300,
      restDuration: 60,
      intervals: 2,
      maxWorkTime: 300,
      maxRounds: 2,
      restMode: 'fixed',
      fixedRestDuration: 60,
      countdownBeforeStart: preStart,
      sound: { enabled: false, volume: 0 },
    },
  })
  await page.addInitScript(
    (config) => localStorage.setItem('timer_stop-check', JSON.stringify(config)),
    {
      id: 'stop-check',
      name,
      type: 'COMPLEX',
      autoAdvance,
      phases: final
        ? [phase('1', type)]
        : [phase('1', type), phase('2', 'COUNTDOWN'), phase('3', 'COUNTDOWN')],
    }
  )
  await page.goto('/?id=stop-check')
  await expect(page.getByText('Phase 1', { exact: true })).toBeVisible()
  await page
    .getByRole('button', { name: /^Start/i })
    .first()
    .click()
  await expect(page.locator('html')).toHaveAttribute('data-fullscreen', 'true')
}

for (const type of ['COUNTDOWN', 'STOPWATCH', 'INTERVAL', 'WORKREST']) {
  test(`${type} Stop ends the entire complex workout`, async ({ page }) => {
    await openComplex(page, type, true)
    await page.getByRole('button', { name: /^Stop/i }).first().click()
    await page.getByRole('button', { name: 'End', exact: true }).click()
    await expect(page.getByRole('status')).toHaveText('Timer stopped')
    await expect(page.getByRole('navigation')).toBeVisible()
  })

  test(`${type} Stop ends the workout without auto-advance`, async ({ page }) => {
    await openComplex(page, type, false)
    await page.getByRole('button', { name: /^Stop/i }).first().click()
    await page.getByRole('button', { name: 'End', exact: true }).click()
    await expect(page.getByRole('navigation')).toBeVisible()
    await expect(page.getByRole('status')).toHaveText('Timer stopped')
  })

  test(`${type} final Stop restores navigation`, async ({ page }) => {
    await openComplex(page, type, true, true)
    await page.getByRole('button', { name: /^Stop/i }).first().click()
    await page.getByRole('button', { name: 'End', exact: true }).click()
    await expect(page.getByRole('navigation')).toBeVisible()
    await expect(page.locator('html')).not.toHaveAttribute('data-fullscreen', 'true')
  })
}

test('paused Work/Rest Stop work ends the complex workout', async ({ page }) => {
  await openComplex(page, 'WORKREST', true)
  await page.getByRole('button', { name: 'Pause work', exact: true }).click()
  await page.getByRole('button', { name: 'Stop work', exact: true }).click()
  await page.getByRole('button', { name: 'End', exact: true }).click()
  await expect(page.getByRole('status')).toHaveText('Timer stopped')
})

for (const type of ['COUNTDOWN', 'STOPWATCH', 'INTERVAL', 'WORKREST']) {
  test(`${type} skipping an active phase clears its navigation lock`, async ({ page }) => {
    await openComplex(page, type, true)
    await page.getByRole('button', { name: 'Go to next phase', exact: true }).click()
    await expect(page.getByText('Phase 2', { exact: true })).toBeVisible()
    await expect(page.getByRole('navigation')).toBeVisible()
  })
}

test('running Work/Rest Stop work ends the entire workout', async ({ page }) => {
  await openComplex(page, 'WORKREST', true)
  await page.getByRole('button', { name: 'Stop work', exact: true }).click()
  await page.getByRole('button', { name: 'End', exact: true }).click()
  await expect(page.getByRole('status')).toHaveText('Timer stopped')
  await expect(page.getByRole('navigation')).toBeVisible()
})

test('Restart after Stop returns to the first phase without starting it', async ({ page }) => {
  await openComplex(page, 'COUNTDOWN', true)
  await page.getByRole('button', { name: 'Go to next phase', exact: true }).click()
  await page
    .getByRole('button', { name: /^Start/i })
    .first()
    .click()
  await page.getByRole('button', { name: /^Stop/i }).first().click()
  await page.getByRole('button', { name: 'End', exact: true }).click()
  await expect(page.getByRole('status')).toHaveText('Timer stopped')
  await page.getByRole('button', { name: 'Restart timer', exact: true }).click()
  await expect(page.getByText('Phase 1', { exact: true })).toBeVisible()
  await expect(page.getByRole('navigation')).toBeVisible()
  await expect(page.getByRole('button', { name: /^Start/i }).first()).toBeVisible()
})

for (const type of ['COUNTDOWN', 'STOPWATCH', 'INTERVAL', 'WORKREST']) {
  test(`${type} Stop ends a paused complex workout`, async ({ page }) => {
    await openComplex(page, type, false)
    await page
      .getByRole('button', { name: /^Pause/i })
      .first()
      .click()
    await page.getByRole('button', { name: /^Stop/i }).first().click()
    await page.getByRole('button', { name: 'End', exact: true }).click()
    await expect(page.getByRole('status')).toHaveText('Timer stopped')
    await expect(page.getByRole('navigation')).toBeVisible()
    await expect(page.locator('html')).not.toHaveAttribute('data-fullscreen', 'true')
  })

  test(`${type} Stop ends a complex workout during pre-start`, async ({ page }) => {
    await openComplex(page, type, true, false, 10)
    await page.getByRole('button', { name: /^Stop/i }).first().click()
    await page.getByRole('button', { name: 'End', exact: true }).click()
    await expect(page.getByRole('status')).toHaveText('Timer stopped')
    await expect(page.getByRole('navigation')).toBeVisible()
  })
}

for (const type of ['COUNTDOWN', 'STOPWATCH', 'INTERVAL', 'WORKREST']) {
  for (const paused of [false, true]) {
    test(`${type} Restart resets first phase while ${paused ? 'paused' : 'running'}`, async ({
      page,
    }) => {
      await openComplex(page, type, true)
      await expect(page.locator('[data-timer-state]')).toHaveAttribute(
        'data-timer-state',
        'running'
      )
      if (paused) {
        await page
          .getByRole('button', { name: /^Pause/i })
          .first()
          .click()
        await expect(page.locator('[data-timer-state]')).toHaveAttribute(
          'data-timer-state',
          'paused'
        )
      }
      const restart = page.getByRole('button', { name: 'Restart from first phase', exact: true })
      await expect(restart).toBeEnabled()
      await restart.click()
      await expect(page.getByText('Phase 1', { exact: true })).toBeVisible()
      await expect(page.locator('[data-timer-state]')).toHaveAttribute('data-timer-state', 'idle')
      await expect(page.getByRole('navigation')).toBeVisible()
      await expect(page.getByText('Timer stopped', { exact: true })).toBeHidden()
      if (type === 'COUNTDOWN') {
        await expect(page.locator('[data-slot="card-content"]')).toHaveText('05:00.00')
      }
      await page
        .getByRole('button', { name: /^Start/i })
        .first()
        .click()
      await expect(page.locator('[data-timer-state]')).toHaveAttribute(
        'data-timer-state',
        'running'
      )
      await expect(page.locator('html')).toHaveAttribute('data-fullscreen', 'true')
    })
  }
}

test.describe('stopped workout on a narrow phone', () => {
  test.use({ viewport: { width: 320, height: 640 }, hasTouch: true, isMobile: true })

  test('long names fit and an edge tap restarts at the first phase', async ({ page }) => {
    const name = 'StrengthAndConditioningWithExtendedRecovery'
    await openComplex(page, 'COUNTDOWN', true, false, 0, name)
    await page.getByRole('button', { name: 'Go to next phase' }).tap()
    await page.getByRole('button', { name: 'Start timer', exact: true }).tap()
    await page.getByRole('button', { name: 'Stop timer', exact: true }).tap()
    await page.getByRole('button', { name: 'End', exact: true }).tap()
    const heading = page.getByRole('heading', { name, exact: true })
    await expect(heading).toBeVisible()
    expect(await heading.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true)
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320)
    const restart = page.getByRole('button', { name: 'Restart timer', exact: true })
    const box = (await restart.boundingBox())!
    expect(box.width).toBe(288)
    expect(box.height).toBeGreaterThanOrEqual(44)
    await restart.tap({ position: { x: box.width - 3, y: box.height / 2 } })
    await expect(page.getByText('Phase 1', { exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Start timer', exact: true })).toBeEnabled()
  })
})

test.describe('phone Stop confirmation', () => {
  test.use({ viewport: { width: 320, height: 640 }, isMobile: true, hasTouch: true })

  test('preserves the clock and its position until End stops the entire timer', async ({ page }) => {
    await page.clock.install({ time: new Date('2026-01-01T12:00:00Z') })
    await page.clock.pauseAt(new Date('2026-01-01T12:01:00Z'))
    await openComplex(page, 'COUNTDOWN', true)
    const button = (name: string) => page.getByRole('button', { name, exact: true })
    const digits = page.locator('[data-slot="card-content"] .font-mono:visible')
    await page.clock.runFor(1000)
    const bounds = await digits.boundingBox()
    const runningTime = await digits.innerText()
    await button('Stop timer').tap()
    expect(await digits.boundingBox()).toEqual(bounds)
    await expect(button('Keep going')).toBeFocused()
    await page.clock.runFor(1000)
    expect(await digits.innerText()).not.toBe(runningTime)
    await button('Keep going').tap()
    await expect(button('Stop timer')).toBeFocused()
    const continuedTime = await digits.innerText()
    await page.clock.runFor(1000)
    expect(await digits.innerText()).not.toBe(continuedTime)
    await button('Pause timer').tap()
    const pausedTime = await digits.innerText()
    await button('Stop timer').tap()
    expect(await digits.boundingBox()).toEqual(bounds)
    await button('Stay paused').tap()
    await page.clock.runFor(5000)
    expect(await digits.innerText()).toBe(pausedTime)
    await expect(button('Resume timer')).toBeVisible()
    await button('Stop timer').tap()
    await button('End').tap()
    await expect(page.getByRole('status')).toHaveText('Timer stopped')
    await expect(page.getByRole('navigation')).toBeVisible()
  })
})
