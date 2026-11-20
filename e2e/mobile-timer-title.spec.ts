import { expect, test } from 'playwright/test'

test.use({ viewport: { width: 320, height: 640 }, hasTouch: true, isMobile: true })

test('a long timer title fits on two lines in portrait while running and paused', async ({
  page,
}) => {
  const name = 'Morning mobility and stretching before breakfast'
  await page.addInitScript((name) => {
    localStorage.setItem(
      'timer_title',
      JSON.stringify({
        id: 'title',
        name,
        type: 'COUNTDOWN',
        duration: 60,
      })
    )
  }, name)
  await page.goto('/?id=title')
  await page.getByRole('button', { name: 'Start timer', exact: true }).tap()
  const title = page.locator('[data-slot="card-header"]').getByText(name, { exact: true })
  for (const action of ['Pause timer', 'Resume timer']) {
    const layout = await title.evaluate((element) => {
      const range = document.createRange()
      range.selectNodeContents(element)
      const lines = Array.from(range.getClientRects())
      const box = element.getBoundingClientRect()
      return {
        count: lines.length,
        fits: lines.every(
          (line) =>
            line.left >= box.left - 1 &&
            line.right <= box.right + 1 &&
            line.bottom <= box.bottom + 2
        ),
      }
    })
    expect(layout).toEqual({ count: 2, fits: true })
    const digits = page.locator('[data-slot="card-content"] span')
    await expect(digits).toHaveCount(2)
    for (const part of await digits.all()) {
      await expect(part).toBeInViewport({ ratio: 1 })
    }
    await expect(page.getByRole('button', { name: 'Stop timer', exact: true })).toBeInViewport({
      ratio: 1,
    })
    const button = page.getByRole('button', { name: action, exact: true })
    await expect(button).toBeInViewport({ ratio: 1 })
    await button.tap()
  }
})
