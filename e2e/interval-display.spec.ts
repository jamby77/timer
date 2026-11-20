import { expect, test } from 'playwright/test'

for (const skipLastRest of [false, true]) {
  for (const skip of [false, true]) {
    test(`interval round count remains visible through ${skip ? 'skipped' : 'natural'} completion with final rest ${!skipLastRest}`, async ({
      page,
    }) => {
      await page.addInitScript(
        ({ skipLastRest, skip }) =>
          localStorage.setItem(
            'timer_display',
            JSON.stringify({
              id: 'display',
              name: 'Display verification',
              type: 'INTERVAL',
              workDuration: skip ? 30 : 1,
              restDuration: skip ? 20 : 1,
              intervals: 2,
              skipLastRest,
              countdownBeforeStart: 0,
              sound: { enabled: false, volume: 0 },
            })
          ),
        { skipLastRest, skip }
      )
      await page.goto('/?id=display')
      const progress = page.getByRole('progressbar', { name: 'Timer progress', exact: true })
      await expect(progress).toHaveAttribute('aria-valuenow', '0')
      const header = page.locator('[data-slot="card-header"]')
      await expect(header.getByText('1 of 2 rounds', { exact: true })).toBeVisible()
      await expect(header).toContainText('Display verification')
      await page.getByRole('button', { name: 'Start intervals', exact: true }).click()
      await page.getByRole('button', { name: 'Pause intervals', exact: true }).click()
      await expect(header.getByText('1 of 2 rounds', { exact: true })).toBeVisible()
      await expect(header).toContainText('Work')
      await page.getByRole('button', { name: 'Resume intervals', exact: true }).click()
      if (skip) {
        await page.getByRole('button', { name: 'Skip current interval', exact: true }).click()
        await expect(header).toContainText('Rest')
        await expect(header.getByText('1 of 2 rounds', { exact: true })).toBeVisible()
        await page.getByRole('button', { name: 'Skip current interval', exact: true }).click()
        await expect(header.getByText('2 of 2 rounds', { exact: true })).toBeVisible()
        await page.getByRole('button', { name: 'Skip current interval', exact: true }).click()
        if (!skipLastRest)
          await page.getByRole('button', { name: 'Skip current interval', exact: true }).click()
      }
      await expect(page.locator('[data-timer-state]')).toHaveAttribute(
        'data-timer-state',
        'completed'
      )
      await expect(header.getByText('2 of 2 rounds', { exact: true })).toBeVisible()
      await expect(header).toContainText('Display verification')
      await expect(page.locator('[data-slot="card-content"]')).toHaveText('00:00.00')
      await expect(progress).toHaveAttribute('aria-valuenow', '100')
      const finalDuration = skip ? (skipLastRest ? '00:30.00' : '00:20.00') : '00:01.00'
      await expect(page.locator('[data-slot="card-footer"]').getByText(finalDuration, { exact: true })).toBeVisible()
      await page.getByRole('button', { name: 'Start intervals', exact: true }).click()
      await expect(header.getByText('1 of 2 rounds', { exact: true })).toBeVisible()
    })
  }
}

test('stopping intervals restores the configured first duration and round', async ({ page }) => {
  await page.addInitScript(() =>
    localStorage.setItem(
      'timer_idle-display',
      JSON.stringify({
        id: 'idle-display',
        name: 'Idle verification',
        type: 'INTERVAL',
        workDuration: 30,
        restDuration: 10,
        intervals: 3,
        countdownBeforeStart: 0,
        sound: { enabled: false, volume: 0 },
      })
    )
  )
  await page.goto('/?id=idle-display')
  await page.getByRole('button', { name: 'Start intervals', exact: true }).click()
  await page.getByRole('button', { name: 'Skip current interval', exact: true }).click()
  await page.getByRole('button', { name: 'Skip current interval', exact: true }).click()
  await expect(page.getByText('2 of 3 rounds', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Stop intervals', exact: true }).click()
  await expect(page.locator('[data-timer-state]')).toHaveAttribute('data-timer-state', 'idle')
  await expect(page.getByText('1 of 3 rounds', { exact: true })).toBeVisible()
  await expect(page.locator('[data-slot="card-content"]')).toHaveText('00:30.00')
  await expect(page.getByRole('progressbar', { name: 'Timer progress' })).toHaveAttribute('aria-valuenow', '0')
})
test.describe('mobile interval transitions', () => {
  test.use({ viewport: { width: 320, height: 640 }, hasTouch: true, isMobile: true })

  test('tapping Skip resets the digits and progress together on the first rest frame', async ({ page }) => {
    await page.addInitScript(() =>
      localStorage.setItem('timer_skip', JSON.stringify({
        id: 'skip', name: 'Mobile intervals', type: 'INTERVAL',
        workDuration: 10, restDuration: 10, intervals: 2,
      }))
    )
    await page.goto('/?id=skip')
    await page.getByRole('button', { name: 'Start intervals', exact: true }).tap()
    const progress = page.getByRole('progressbar', { name: 'Timer progress' })
    await expect.poll(async () => Number(await progress.getAttribute('aria-valuenow'))).toBeGreaterThan(10)
    const firstRestFrame = page.evaluate(() => new Promise(resolve => {
      const header = document.querySelector('[data-slot="card-header"]')!
      const observer = new MutationObserver(() => {
        if (!header.textContent?.includes('Rest')) return
        observer.disconnect()
        const bar = document.querySelector('[role="progressbar"]')!
        const fill = bar.querySelector('[data-slot="progress-indicator"]')!
        resolve({
          time: document.querySelector('[data-slot="card-content"]')?.textContent,
          progress: bar.getAttribute('aria-valuenow'),
          fillMatchesBorder: getComputedStyle(fill).backgroundColor === getComputedStyle(bar).borderTopColor,
          visibleWidth: Math.round(fill.getBoundingClientRect().right - bar.getBoundingClientRect().left - bar.clientLeft),
        })
      })
      observer.observe(header, { subtree: true, characterData: true, childList: true })
    }))
    await page.getByRole('button', { name: 'Skip current interval' }).tap()
    expect(await firstRestFrame).toEqual({
      time: '00:10.00', progress: '0', fillMatchesBorder: true, visibleWidth: 0,
    })
  })
})
