import { expect, test } from 'playwright/test'

for (const complex of [false, true]) {
  for (const paused of [false, true]) {
    test(`Work/Rest restart preserves settings when ${paused ? 'paused' : 'running'} ${complex ? 'inside a complex workout' : 'standalone'}`, async ({
      page,
    }) => {
      await page.addInitScript((complex) => {
        const config = {
          id: 'restart',
          name: 'Configured work/rest',
          type: 'WORKREST',
          maxRounds: 3,
          maxWorkTime: 30,
          restMode: 'fixed',
          fixedRestDuration: 20,
          countdownBeforeStart: 0,
          sound: { enabled: false, volume: 0 },
        }
        localStorage.setItem(
          'timer_restart',
          JSON.stringify(
            complex
              ? {
                  id: 'restart',
                  name: 'Workout',
                  type: 'COMPLEX',
                  autoAdvance: true,
                  phases: [
                    { id: 'work', name: 'Work/rest phase', type: 'WORKREST', order: 0, config },
                  ],
                }
              : config
          )
        )
      }, complex)
      await page.goto('/?id=restart')
      await page.getByRole('button', { name: 'Start work', exact: true }).click()
      await expect(page.locator('[data-timer-state]')).toHaveAttribute(
        'data-timer-state',
        'running'
      )
      if (paused) await page.getByRole('button', { name: 'Pause work', exact: true }).click()
      await page.getByRole('button', { name: 'Restart', exact: true }).click()
      await expect(page.getByRole('button', { name: 'Pause work', exact: true })).toBeVisible()
      await expect(page.locator('[data-slot="card-title"]')).toContainText('WORK/REST (20s fixed rest)')
      await expect(page.getByText('Round: 1', { exact: true })).toBeVisible()
      await expect(page.getByText('Timer stopped', { exact: true })).toBeHidden()
      await expect(page.locator('[data-slot="card-content"]')).not.toHaveText('00:00.00')
      if (!complex) {
        await page.getByRole('button', { name: 'Finish work / Start rest', exact: true }).click()
        await expect(page.getByRole('button', { name: 'Stop rest', exact: true })).toBeVisible()
        await expect(page.locator('[data-slot="card-content"]')).toContainText('00:19')
        await page.getByRole('button', { name: 'Restart', exact: true }).click()
        await expect(page.getByRole('button', { name: 'Pause work', exact: true })).toBeVisible()
        await expect(page.getByText('Round: 1', { exact: true })).toBeVisible()
      }
    })
  }
}
