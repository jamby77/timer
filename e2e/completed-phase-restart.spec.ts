import { expect, test } from 'playwright/test'

for (const type of ['COUNTDOWN', 'STOPWATCH']) {
  for (const countdownBeforeStart of [0, 1]) {
    for (const final of [false, true]) {
      test(`${type} completed restart stays in ${final ? 'final' : 'manual'} phase with pre-start ${countdownBeforeStart}`, async ({
        page,
      }) => {
        const phase = {
          id: '1',
          name: 'Restartable phase',
          type,
          order: 1,
          config: {
            id: '1',
            name: 'Restartable timer',
            type,
            duration: 2,
            timeLimit: 2,
            countdownBeforeStart,
            sound: { enabled: false, volume: 0 },
          },
        }
        await page.addInitScript(
          (config) => localStorage.setItem('timer_restart-check', JSON.stringify(config)),
          {
            id: 'restart-check',
            name: 'Restart verification',
            type: 'COMPLEX',
            autoAdvance: final,
            phases: final ? [phase] : [phase, { ...phase, id: '2', order: 2, name: 'Next phase' }],
          }
        )
        await page.goto('/?id=restart-check')
        const card = page.locator('[data-timer-state]')
        await page.getByRole('button', { name: 'Start timer', exact: true }).click()
        await expect(card).toHaveAttribute('data-timer-state', 'completed', { timeout: 6000 })
        await page.getByRole('button', { name: 'Restart timer', exact: true }).click()
        await expect(page.getByText('Timer stopped', { exact: true })).not.toBeVisible()
        await expect(page.getByText('Restartable phase', { exact: true })).toBeVisible()
        if (countdownBeforeStart) {
          await expect(page.locator('[data-slot="card-content"]')).toHaveText('1')
          await expect(page.locator('[data-slot="card-content"]')).not.toHaveText('1')
        }
        await expect(card).toHaveAttribute('data-timer-state', 'running')
        await page.getByRole('button', { name: 'Pause timer', exact: true }).click()
        await expect(card).toHaveAttribute('data-timer-state', 'paused')
        await page.getByRole('button', { name: 'Start timer', exact: true }).click()
        await expect(card).toHaveAttribute('data-timer-state', 'completed', { timeout: 4000 })
        await expect(page.getByText('Restartable phase', { exact: true })).toBeVisible()
      })
    }
  }
}
