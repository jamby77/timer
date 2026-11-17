import { expect, test } from 'playwright/test'

for (const viewport of [
  { width: 390, height: 844 },
  { width: 1280, height: 800 },
]) {
  for (const type of ['COUNTDOWN', 'STOPWATCH', 'WORKREST']) {
    for (const complex of [false, true]) {
      test(`${type} labels survive every state ${complex ? 'inside a complex timer' : 'standalone'} at ${viewport.width}px`, async ({
        page,
      }) => {
        await page.setViewportSize(viewport)
        await page.addInitScript(
          ({ type, complex }) => {
            const config = {
              id: 'labels',
              name: 'Morning session',
              type,
              duration: 2,
              timeLimit: 2,
              maxWorkTime: 2,
              maxRounds: 1,
              restMode: 'ratio',
              ratio: 2,
              countdownBeforeStart: 0,
              sound: { enabled: false, volume: 0 },
            }
            localStorage.setItem(
              'timer_labels',
              JSON.stringify(
                complex
                  ? {
                      id: 'labels',
                      name: 'Daily workout',
                      type: 'COMPLEX',
                      autoAdvance: true,
                      phases: [{ id: 'phase', name: 'Warm-up', order: 0, type, config }],
                    }
                  : config
              )
            )
          },
          { type, complex }
        )
        await page.goto('/?id=labels')
        const card = page.locator('[data-timer-state]')
        const header = page.locator('[data-slot="card-header"]')
        const assertLabels = async () => {
          if (complex) {
            for (const label of ['Daily workout', 'Warm-up', 'Phase 1/1']) {
              await expect(header.getByText(label, { exact: true })).toBeVisible()
            }
          } else {
            await expect(
              header.getByText('Morning session', { exact: type !== 'WORKREST' })
            ).toBeVisible()
          }
          if (type === 'WORKREST') {
            await expect(header).toContainText('WORK/REST (r 2.00x)')
            await expect(header.getByText('Round: 1', { exact: true })).toBeVisible()
          }
          if (type === 'STOPWATCH') await expect(header).toContainText('(Cap: 00:02.00)')
        }
        const suffix = type === 'WORKREST' ? 'work' : 'timer'
        await expect(card).toHaveAttribute('data-timer-state', 'idle')
        await assertLabels()
        await page.getByRole('button', { name: `Start ${suffix}`, exact: true }).click()
        await expect(card).toHaveAttribute('data-timer-state', 'running')
        await assertLabels()
        await page.getByRole('button', { name: `Pause ${suffix}`, exact: true }).click()
        await expect(card).toHaveAttribute('data-timer-state', 'paused')
        await assertLabels()
        await page
          .getByRole('button', {
            name: type === 'WORKREST' ? 'Resume work' : 'Start timer',
            exact: true,
          })
          .click()
        if (type === 'WORKREST') {
          await expect(page.getByRole('button', { name: 'Skip rest', exact: true })).toBeVisible()
          await assertLabels()
        }
        await expect(card).toHaveAttribute('data-timer-state', 'completed', { timeout: 8000 })
        await assertLabels()
      })
    }
  }
}
