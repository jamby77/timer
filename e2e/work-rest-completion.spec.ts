import { expect, test } from 'playwright/test'

for (const mode of ['standalone', 'complex', 'final', 'manual']) {
  const complex = mode !== 'standalone'
  for (const skip of [false, true]) {
    test(`${mode} Work/Rest completes after two ${skip ? 'skipped' : 'natural'} rests`, async ({
      page,
    }) => {
      await page.addInitScript(
        ({ complex, skip, mode }) => {
          const config = {
            id: 'rounds',
            name: 'Two rounds',
            type: 'WORKREST',
            maxRounds: 2,
            restMode: 'fixed',
            fixedRestDuration: skip ? 20 : 1,
            maxWorkTime: 60,
            countdownBeforeStart: 0,
            sound: { enabled: false, volume: 0 },
          }
          localStorage.setItem(
            'timer_rounds',
            JSON.stringify(
              complex
                ? {
                    id: 'rounds',
                    name: 'Workout',
                    type: 'COMPLEX',
                    autoAdvance: mode !== 'manual',
                    phases: [
                      { id: 'work', name: 'Two rounds', type: 'WORKREST', order: 0, config },
                      {
                        id: 'after',
                        name: 'After work',
                        type: 'COUNTDOWN',
                        order: 1,
                        config: { id: 'after', name: 'After work', type: 'COUNTDOWN', duration: 60 },
                      },
                    ].slice(0, mode === 'final' ? 1 : 2),
                  }
                : config
            )
          )
        },
        { complex, skip, mode }
      )
      await page.goto('/?id=rounds')
      await page.getByRole('button', { name: 'Start work', exact: true }).click()
      for (let round = 1; round <= 2; round++) {
        await expect(page.getByText(`Round: ${round}`, { exact: true })).toBeVisible()
        await expect(page.locator('[data-slot="card-content"]')).toContainText('00:01')
        await page.getByRole('button', { name: 'Finish work / Start rest', exact: true }).click()
        await expect(page.getByRole('button', { name: 'Skip rest', exact: true })).toBeVisible()
        if (skip) await page.getByRole('button', { name: 'Skip rest', exact: true }).click()
        if (round === 1) {
          await expect(page.getByText('Round: 2', { exact: true })).toBeVisible()
          if (complex)
            await expect(
              page.getByText(mode === 'final' ? 'Phase 1/1' : 'Phase 1/2', { exact: true })
            ).toBeVisible()
          if (!skip) await page.getByRole('button', { name: 'Start work', exact: true }).click()
        }
      }
      if (mode === 'complex') {
        await expect(page.getByText('Phase 2/2', { exact: true })).toBeVisible()
        await expect(page.getByRole('button', { name: 'Pause timer', exact: true })).toBeVisible()
      } else {
        await expect(page.locator('[data-timer-state]')).toHaveAttribute(
          'data-timer-state',
          'completed'
        )
        await expect(page.getByRole('navigation')).toBeVisible()
        await expect(page.getByText('Round: 2', { exact: true })).toBeVisible()
        await page.getByRole('button', { name: 'Start work', exact: true }).click()
        await expect(page.getByText('Round: 1', { exact: true })).toBeVisible()
        await expect(page.getByRole('button', { name: 'Pause work', exact: true })).toBeVisible()
      }
    })
  }
}
