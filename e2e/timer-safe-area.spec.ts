import { expect, test } from 'playwright/test'

for (const [width, height, top, side, bottom] of [
  [375, 812, 44, 0, 34],
  [812, 375, 0, 44, 21],
]) {
  test.describe(`timer safe areas at ${width}px`, () => {
    test.use({ viewport: { width, height }, isMobile: true, hasTouch: true })

    test('the timer paints the edges and keeps controls inside the insets', async ({ page }) => {
      const session = await page.context().newCDPSession(page)
      await session.send('Emulation.setSafeAreaInsetsOverride', {
        insets: { top, bottom, left: side, right: side },
      })
      await page.addInitScript(() => localStorage.setItem('timer_edges', JSON.stringify({
        id: 'edges', name: 'Interval', type: 'INTERVAL', workDuration: 30, restDuration: 15, intervals: 13,
      })))
      await page.goto('/?id=edges')
      await expect(page.locator('meta[name=viewport]')).toHaveAttribute('content', /viewport-fit=cover/)
      const button = (name: string) => page.getByRole('button', { name, exact: true })
      const card = page.locator('[data-timer-state] [data-slot=card]')
      const coversEdges = () => card.evaluate(el =>
        [[0, 0], [innerWidth - 1, 0], [0, innerHeight - 1], [innerWidth - 1, innerHeight - 1]]
          .every(([x, y]) => el.contains(document.elementFromPoint(x, y))))
      const canvas = page.locator('html')
      const idle = await canvas.evaluate(el => getComputedStyle(el).backgroundColor)
      await button('Start intervals').tap()
      const work = await card.evaluate(el => getComputedStyle(el).backgroundColor)
      await expect(canvas).toHaveCSS('background-color', work)
      expect(await coversEdges()).toBe(true)
      expect((await card.locator('[data-slot=card-title]').boundingBox())!.y).toBeGreaterThanOrEqual(top)
      const track = (await page.getByRole('progressbar').boundingBox())!
      expect(track.x).toBeGreaterThanOrEqual(side)
      expect(track.x + track.width).toBeLessThanOrEqual(width - side)
      const stop = (await button('Stop intervals').boundingBox())!
      expect(stop.y + stop.height).toBeLessThanOrEqual(height - bottom - 24)
      await button('Pause intervals').tap()
      await expect(card).toHaveCSS('background-color', work)
      expect(await coversEdges()).toBe(true)
      await button('Resume intervals').tap()
      await button('Skip current interval').tap()
      await expect(card).toContainText('Rest')
      await expect(card).not.toHaveCSS('background-color', work)
      await expect(canvas).toHaveCSS('background-color', await card.evaluate(el => getComputedStyle(el).backgroundColor))
      expect(await coversEdges()).toBe(true)
      await button('Stop intervals').tap()
      await expect(page.getByRole('navigation')).toBeVisible()
      expect(await coversEdges()).toBe(false)
      await expect(canvas).toHaveCSS('background-color', idle)
      const cardBounds = (await card.boundingBox())!
      const start = (await button('Start intervals').boundingBox())!
      expect(start.y + start.height).toBeLessThanOrEqual(cardBounds.y + cardBounds.height)
      expect((await page.getByRole('navigation').boundingBox())!.x).toBeGreaterThanOrEqual(side)
    })
  })
}
