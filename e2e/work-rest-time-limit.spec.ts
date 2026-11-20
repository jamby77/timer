import { expect, test } from 'playwright/test'

for (const complex of [false, true]) {
  for (const restMode of ['ratio', 'fixed']) {
    test(`${complex ? 'Complex' : 'Standalone'} work limit automatically starts ${restMode} rest`, async ({
      page,
    }) => {
      await page.addInitScript(
        ({ complex, restMode }) => {
          const config = {
            id: 'limit',
            type: 'WORKREST',
            name: 'Limited work',
            maxWorkTime: 1,
            maxRounds: 1,
            ratio: restMode === 'ratio' ? 2 : undefined,
            restMode,
            fixedRestDuration: restMode === 'fixed' ? 3 : undefined,
            countdownBeforeStart: 0,
            sound: { enabled: false, volume: 0 },
          }
          localStorage.setItem(
            'timer_limit',
            JSON.stringify(
              complex
                ? {
                    id: 'limit',
                    name: 'Workout',
                    type: 'COMPLEX',
                    autoAdvance: true,
                    phases: [
                      { id: 'work', name: 'Limited work', type: 'WORKREST', order: 0, config },
                      {
                        id: 'after',
                        name: 'After work',
                        type: 'COUNTDOWN',
                        order: 1,
                        config: { id: 'after', name: 'After work', type: 'COUNTDOWN', duration: 60 },
                      },
                    ],
                  }
                : config
            )
          )
        },
        { complex, restMode }
      )
      await page.goto('/?id=limit')
      await page.getByRole('button', { name: 'Start work', exact: true }).click()
      await expect(page.getByRole('button', { name: 'Skip rest', exact: true })).toBeVisible()
      await expect(page.locator('[data-slot="card-content"]')).toContainText(
        restMode === 'fixed' ? '00:02' : '00:01'
      )
      await expect(page.locator('html')).toHaveAttribute('data-fullscreen', 'true')
      if (complex) {
        await expect(page.getByText('Phase 1/2', { exact: true })).toBeVisible()
        await expect(page.getByText('Phase 2/2', { exact: true })).toBeVisible()
        await expect(page.getByRole('button', { name: 'Pause timer', exact: true })).toBeVisible()
      } else {
        await expect(page.locator('[data-timer-state]')).toHaveAttribute(
          'data-timer-state',
          'completed'
        )
        await expect(page.getByRole('navigation')).toBeVisible()
      }
    })
  }
}

test('pause freezes the work limit and restart begins a fresh timed work period', async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem(
      'timer_pause-limit',
      JSON.stringify({
        id: 'pause-limit',
        type: 'WORKREST',
        name: 'Paused limit',
        maxWorkTime: 2,
        maxRounds: 1,
        restMode: 'fixed',
        fixedRestDuration: 20,
        countdownBeforeStart: 0,
        sound: { enabled: false, volume: 0 },
      })
    )
  )
  await page.goto('/?id=pause-limit')
  await page.getByRole('button', { name: 'Start work', exact: true }).click()
  await page.getByRole('button', { name: 'Pause work', exact: true }).click()
  await page.waitForTimeout(2200)
  await expect(page.locator('[data-timer-state]')).toHaveAttribute('data-timer-state', 'paused')
  await expect(page.getByRole('button', { name: 'Skip rest', exact: true })).toBeHidden()
  await page.getByRole('button', { name: 'Resume work', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Skip rest', exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Restart', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Pause work', exact: true })).toBeVisible()
  await expect(page.locator('[data-slot="card-content"]')).toContainText('00:00')
  await expect(page.getByRole('button', { name: 'Skip rest', exact: true })).toBeVisible()
  await expect(page.getByText('Round 1 of 1', { exact: true })).toBeVisible()
})
