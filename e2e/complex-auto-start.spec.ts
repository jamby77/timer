import { expect, test } from 'playwright/test'

for (const nextType of ['COUNTDOWN', 'STOPWATCH', 'INTERVAL', 'WORKREST']) {
  test(`natural completion starts the next ${nextType} phase`, async ({ page }) => {
    await page.addInitScript(
      (type) =>
        localStorage.setItem(
          'timer_auto-start',
          JSON.stringify({
            id: 'auto-start',
            name: 'Automatic transitions',
            type: 'COMPLEX',
            autoAdvance: true,
            phases: [
              {
                id: 'first',
                order: 0,
                name: 'First',
                type: 'COUNTDOWN',
                config: { id: 'first', name: 'First timer', type: 'COUNTDOWN', duration: 1 },
              },
              {
                id: 'second',
                order: 1,
                name: 'Second',
                type,
                config: {
                  id: 'second',
                  name: 'Second timer',
                  type,
                  duration: 60,
                  timeLimit: 60,
                  workDuration: 20,
                  restDuration: 10,
                  intervals: 8,
                  maxWorkTime: 60,
                  maxRounds: 2,
                  restMode: 'ratio',
                  ratio: 2,
                },
              },
            ],
          })
        ),
      nextType
    )
    await page.goto('/?id=auto-start')
    await page.getByRole('button', { name: 'Start timer', exact: true }).click()
    await expect(page.getByText('Phase 2/2', { exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: /^Pause/i })).toBeVisible()
    await expect(page.getByRole('navigation')).toBeHidden()
    await page.getByRole('button', { name: /^Pause/i }).click()
    await expect(page.getByRole('button', { name: /^Pause/i })).toBeHidden()
  })
}
