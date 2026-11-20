import { expect, test } from 'playwright/test'

test.use({ viewport: { width: 320, height: 640 }, isMobile: true, hasTouch: true })

for (const complex of [false, true]) {
  test(`Stop ends a ${complex ? 'complex' : 'standalone'} timer between rounds by touch`, async ({
    page,
  }) => {
    await page.addInitScript((complex) => {
      const work = {
        id: 'work',
        name: 'Mobility',
        type: 'WORKREST',
        restMode: 'fixed',
        fixedRestDuration: 1,
        maxRounds: 3,
        maxWorkTime: 60,
      }
      const config = complex
        ? {
            id: 'session',
            name: 'Morning timer',
            type: 'COMPLEX',
            phases: [{ id: 'one', order: 0, name: 'Mobility', type: 'WORKREST', config: work }],
          }
        : work
      localStorage.setItem('timer_' + config.id, JSON.stringify(config))
    }, complex)
    await page.goto('/?id=' + (complex ? 'session' : 'work'))
    const stop = page.getByRole('button', { name: 'Stop work', exact: true })
    await expect(stop).toBeDisabled()
    await page.getByRole('button', { name: 'Start work', exact: true }).tap()
    await page.getByRole('button', { name: 'Finish work / Start rest', exact: true }).tap()
    await expect(page.getByText('Round 2 of 3', { exact: true })).toBeVisible()
    await expect(stop).toBeEnabled()
    await stop.tap()
    if (complex) {
      await expect(page.getByRole('status')).toHaveText('Timer stopped')
    } else {
      await expect(page.getByText('Round 1 of 3', { exact: true })).toBeVisible()
      await expect(stop).toBeDisabled()
      await expect(page.getByRole('button', { name: 'Start work', exact: true })).toBeEnabled()
    }
  })
}
