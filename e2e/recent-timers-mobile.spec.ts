import { expect, test } from 'playwright/test'

test.use({ viewport: { width: 320, height: 640 }, isMobile: true, hasTouch: true })

test('recent timers can be browsed, removed and started by touch on a narrow phone', async ({ page }) => {
  await page.goto('/configure')
  const morning = 'Morning endurance and strength · SingleLegRomanianDeadliftWithContralateralReach'
  await page.evaluate(name => {
    const history = [name, 'Evening', 'Cooldown'].map(name => ({
      id: name,
      startedAt: new Date(),
      config: { id: name, name, type: 'COUNTDOWN', duration: 30 },
    }))
    localStorage.setItem('recent_timers', JSON.stringify(history))
  }, morning)
  await page.reload()
  const card = (name: string) => page.locator('[data-slot="card"]').filter({
    has: page.getByRole('heading', { name, exact: true }),
  })
  const carousel = page.locator('[data-slot="carousel"]').filter({ has: card(morning) })
  const previous = carousel.getByRole('button', { name: 'Previous slide' })
  const next = carousel.getByRole('button', { name: 'Next slide' })
  const start = card(morning).getByRole('button', { name: 'Start ' + morning, exact: true })
  const remove = card(morning).getByRole('button', { name: 'Remove timer' })
  const title = card(morning).getByRole('heading', { name: morning })
  expect(await title.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true)
  const titleBox = (await title.boundingBox())!
  const removeBox = (await remove.boundingBox())!
  expect(titleBox.x + titleBox.width).toBeLessThanOrEqual(removeBox.x)
  const second = (await card('Evening').boundingBox())!
  const first = (await card(morning).boundingBox())!
  expect(second.y).toBe(first.y)
  expect(second.x).toBeGreaterThan(first.x + first.width)
  expect(second.x + second.width).toBeLessThanOrEqual(320)
  await expect(remove).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
  await expect(next).toBeEnabled()
  for (const control of [previous, next, start, remove]) {
    const box = (await control.boundingBox())!
    expect(box.width).toBeGreaterThanOrEqual(44)
    expect(box.height).toBeGreaterThanOrEqual(44)
    expect(box.x).toBeGreaterThanOrEqual(0)
    expect(box.x + box.width).toBeLessThanOrEqual(320)
  }
  await next.tap()
  await expect(previous).toBeEnabled()
  await previous.tap()
  await expect(previous).toBeDisabled()
  await next.tap()
  await card('Evening').getByRole('button', { name: 'Remove timer' }).tap()
  await expect(card('Evening')).toHaveCount(0)
  await expect(next).toBeHidden()
  await card('Cooldown').getByRole('button', { name: 'Remove timer' }).tap()
  expect((await card(morning).boundingBox())!.width).toBeGreaterThan(second.width * 2)
  const bounds = (await start.boundingBox())!
  const details = (await card(morning).locator('[data-slot=card-description]').boundingBox())!
  expect(bounds.width).toBeCloseTo(details.width)
  await start.tap({ position: { x: bounds.width - 2, y: bounds.height / 2 } })
  await expect(page).toHaveURL(/\/\?id=/)
  await expect(page.locator('[data-slot="card-header"]')).toContainText(morning)
  await page.getByRole('button', { name: 'Start timer', exact: true }).tap()
  await expect(page.locator('[data-timer-state]')).toHaveAttribute('data-timer-state', 'running')
})
