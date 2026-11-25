import { expect, test } from 'playwright/test'

const longName = 'Alternating single arm kettlebell swings and overhead carries'

for (const viewport of [{ width: 320, height: 640 }, { width: 667, height: 375 }]) {
  test.describe(`Up Next at ${viewport.width}px`, () => {
    test.use({ viewport, hasTouch: true })

    test('keeps the clock steady and follows phase navigation and recovery', async ({ page }) => {
      await page.addInitScript((name) => {
        localStorage.setItem('theme', 'light')
        const configs = [
          { name: 'Shoulder mobility', type: 'COUNTDOWN', duration: 2 },
          { name, type: 'INTERVAL', intervals: 8, workDuration: 20, restDuration: 10, skipLastRest: true },
          { name: 'Strength', type: 'WORKREST', restMode: 'ratio', ratio: 2, maxRounds: 2 },
          { name: 'Cooldown', type: 'STOPWATCH', timeLimit: 60 },
        ]
        localStorage.setItem('timer_up-next', JSON.stringify({
          id: 'up-next', type: 'COMPLEX', name: 'Circuit', autoAdvance: false, overallTimeLimit: 600,
          phases: configs.map((config, order) => ({
            order, id: String(order), name: config.name, type: config.type, config: { ...config, id: String(order) },
          })).reverse(),
        }))
      }, longName)
      await page.goto('/?id=up-next')
      const button = (name: string) => page.getByRole('button', { name, exact: true })
      const start = () => page.getByRole('button', { name: /^Start (timer|intervals|work)$/ }).tap()
      const hint = page.getByText(/^Next: /)
      const status = page.locator('[data-slot=card-header]').getByRole('status')
      async function checkLayout() {
        const stable = await hint.evaluate((element) => {
          const hintBox = element.parentElement!.parentElement!
          const bounds = () => ['[data-slot=card-content] .font-mono', '[data-slot=card-footer]'].map(selector => {
            const rect = document.querySelector(selector)!.getBoundingClientRect()
            return [rect.x, rect.y, rect.width, rect.height]
          })
          const withHint = bounds()
          hintBox.style.display = 'none'
          const withoutHint = bounds()
          hintBox.style.removeProperty('display')
          return JSON.stringify(withHint) === JSON.stringify(withoutHint)
        })
        expect(stable).toBe(true)
      }
      await start()
      await expect(hint).toHaveText('Next: ' + longName)
      await checkLayout()
      await expect(status).toHaveText('Complete')
      await expect(hint).toBeVisible()
      await button('Go to next phase').tap()
      await start()
      await expect(hint).toHaveText('Next: Strength')
      await checkLayout()
      const digits = page.locator('[data-slot=card-content] .font-mono')
      const bounds = await digits.boundingBox()
      await button('Pause intervals').tap()
      await expect(status).toHaveText('Paused')
      expect(await digits.boundingBox()).toEqual(bounds)
      await button('Resume intervals').tap()
      await page.reload()
      await button('Resume').tap()
      await expect(hint).toHaveText('Next: Strength')
      await button('Go to next phase').tap()
      await start()
      await expect(hint).toHaveText('Next: Cooldown')
      await checkLayout()
      await expect(hint.locator('..')).toHaveText('Next: Cooldown')
      await button('Go to next phase').tap()
      await start()
      await expect(hint).toHaveCount(0)
      await button('Go to previous phase').tap()
      await start()
      await expect(hint).toHaveText('Next: Cooldown')
      await button('Restart from first phase').tap()
      await start()
      await expect(hint).toHaveText('Next: ' + longName)
      await expect(hint.locator('..')).toContainText('3m 50s')
    })
  })
}
