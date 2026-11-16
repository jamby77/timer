import { expect, test } from 'playwright/test'

for (const restMode of ['ratio', 'fixed']) {
  for (const paused of [false, true]) {
    test(`Finish ${paused ? 'paused' : 'running'} work starts ${restMode} rest inside the current complex phase`, async ({
      page,
    }) => {
      await page.addInitScript((restMode) => {
        localStorage.setItem(
          'timer_work-controls',
          JSON.stringify({
            id: 'work-controls',
            name: 'Workout',
            type: 'COMPLEX',
            autoAdvance: true,
            phases: [
              {
                id: 'work',
                name: 'Work/rest',
                order: 0,
                type: 'WORKREST',
                config: {
                  type: 'WORKREST',
                  ratio: 2,
                  restMode,
                  fixedRestDuration: 20,
                  maxRounds: 5,
                  maxWorkTime: 60,
                  countdownBeforeStart: 0,
                  sound: { enabled: false, volume: 0 },
                },
              },
              {
                id: 'after',
                name: 'After work',
                order: 1,
                type: 'COUNTDOWN',
                config: { type: 'COUNTDOWN', duration: 60 },
              },
            ],
          })
        )
      }, restMode)
      await page.goto('/?id=work-controls')
      await page.getByRole('button', { name: 'Start work', exact: true }).click()
      const digits = page.locator('[data-slot="card-content"]')
      await expect(digits).toContainText('00:02')
      if (paused) await page.getByRole('button', { name: 'Pause work', exact: true }).click()
      const header = page.locator('[data-slot="card-header"]')
      const finish = header.getByRole('button', { name: 'Finish work / Start rest', exact: true })
      await expect(finish).toBeEnabled()
      await finish.click()
      await expect(header.getByRole('button', { name: 'Skip rest', exact: true })).toBeVisible()
      await expect(digits).toContainText(restMode === 'fixed' ? '00:19' : '00:03')
      await expect(header.getByText('Phase 1/2', { exact: true })).toBeVisible()
      await expect(page.getByText('Workout stopped', { exact: true })).toBeHidden()
      await header.getByRole('button', { name: 'Skip rest', exact: true }).click()
      await expect(header.getByText('Round: 2', { exact: true })).toBeVisible()
      await expect(page.getByRole('button', { name: 'Pause work', exact: true })).toBeVisible()
      await header.getByRole('button', { name: 'Restart', exact: true }).click()
      await expect(header.getByText('Round: 1', { exact: true })).toBeVisible()
      await expect(digits).toContainText('00:01')
      await finish.click()
      await page.getByRole('button', { name: 'Stop rest', exact: true }).click()
      await expect(page.getByRole('status')).toHaveText('Workout stopped')
      await expect(page.getByRole('navigation')).toBeVisible()
    })
  }
}
