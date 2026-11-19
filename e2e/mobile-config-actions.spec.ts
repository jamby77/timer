import { expect, test } from 'playwright/test'

test.use({ viewport: { width: 320, height: 640 }, isMobile: true, hasTouch: true })

for (const type of ['Countdown', 'Complex']) {
  test(`configure actions fit and respond to edge taps in ${type} setup`, async ({ page }) => {
    await page.goto('/configure')
    const timerType = page.getByRole('heading', { name: type, exact: true })
    await timerType.tap()
    if (type === 'Complex') {
      await page.getByRole('button', { name: 'Add Phase', exact: true }).tap()
      await page.getByLabel('Phase name').fill('Warmup')
      await page.getByRole('button', { name: 'Add', exact: true }).tap()
    } else {
      const cancel = page.getByRole('button', { name: 'Cancel', exact: true })
      expect((await cancel.boundingBox())!.height).toBeGreaterThanOrEqual(44)
      await cancel.tap({ position: { x: 4, y: 4 } })
      await timerType.tap()
      await page.getByLabel('Minutes', { exact: true }).pressSequentially('01')
    }
    await page.getByLabel(/Timer Name/).fill('Morning workout')
    for (const name of ['Save as Preset', 'Start Timer']) {
      const button = page.getByRole('button', { name, exact: true })
      const box = (await button.boundingBox())!
      expect(box.height).toBeGreaterThanOrEqual(44)
      expect(box.x).toBeGreaterThanOrEqual(0)
      expect(box.x + box.width).toBeLessThanOrEqual(320)
      await button.tap({ position: { x: box.width - 4, y: 4 } })
      if (name === 'Save as Preset') {
        await expect(page.getByText('Preset saved.', { exact: true })).toBeVisible()
      }
    }
    await expect(page).toHaveURL(/\/\?id=/)
  })
}
