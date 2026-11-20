import { expect, test } from 'playwright/test'

test.use({ viewport: { width: 320, height: 640 }, isMobile: true, hasTouch: true })

for (const type of ['Countdown', 'Complex']) {
  test(`Sounds responds to touch and keyboard in ${type} setup`, async ({ page }) => {
    await page.goto('/configure')
    await page.getByRole('heading', { name: type, exact: true }).tap()
    if (type === 'Complex') {
      await page.getByRole('button', { name: 'Add Phase', exact: true }).tap()
      await page.getByLabel('Phase name').fill('Warmup')
      await page.getByRole('button', { name: 'Add', exact: true }).tap()
    }

    const toggle = page.getByRole('switch', { name: 'Sounds', exact: true })
    const description = page.getByText('Enable audio cues for countdown and transitions')
    await expect(toggle).not.toBeChecked()
    await description.tap()
    await expect(toggle).toBeChecked()
    const row = page.locator('label').filter({ has: toggle })
    const bounds = (await row.boundingBox())!
    expect(bounds.height).toBeGreaterThanOrEqual(44)
    expect(bounds.x + bounds.width).toBeLessThanOrEqual(320)
    await row.tap({ position: { x: bounds.width - 4, y: 4 } })
    await expect(toggle).not.toBeChecked()
    await toggle.press('Space')
    await expect(toggle).toBeChecked()
  })
}

test('enabling Sounds in Complex setup plays the phase start cue', async ({ page }) => {
  await page.addInitScript(() => {
    const start = OscillatorNode.prototype.start
    const audio = { cueStarts: 0 }
    Object.assign(window, { audio })
    OscillatorNode.prototype.start = function (when) {
      audio.cueStarts++
      start.call(this, when)
    }
  })
  await page.goto('/configure')
  await page.getByRole('heading', { name: 'Complex', exact: true }).tap()
  await page.getByRole('button', { name: 'Add Phase', exact: true }).tap()
  await page.getByRole('button', { name: 'Add', exact: true }).tap()
  await page.getByRole('switch', { name: 'Sounds', exact: true }).tap()
  await page.getByRole('button', { name: 'Start Timer', exact: true }).tap()
  await page.getByRole('button', { name: 'Start timer', exact: true }).tap()
  await expect(page.locator('[data-timer-state]')).toHaveAttribute('data-timer-state', 'running')
  await expect
    .poll(() =>
      page.evaluate(() => (window as unknown as { audio: { cueStarts: number } }).audio.cueStarts)
    )
    .toBeGreaterThan(0)
})
