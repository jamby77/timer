import { expect, test } from 'playwright/test'

test.use({ viewport: { width: 320, height: 640 }, isMobile: true, hasTouch: true })

for (const type of ['Countdown', 'Complex']) {
  test(`${type} can be named at the top of setup before configuring the workout`, async ({ page }) => {
    await page.goto('/configure')
    await page.getByRole('heading', { name: type, exact: true }).tap()
    const name = page.getByLabel('Timer Name*', { exact: true })
    await expect(name).toBeInViewport({ ratio: 1 })
    const box = (await name.boundingBox())!
    expect(box.height).toBeGreaterThanOrEqual(44)
    await name.tap({ position: { x: box.width - 4, y: 4 } })
    await expect(name).toBeFocused()
    const title = `Morning ${type}`
    await name.fill(title)
    if (type === 'Complex') {
      const addPhase = page.getByRole('button', { name: 'Add Phase', exact: true })
      expect((await addPhase.boundingBox())!.y).toBeGreaterThan(box.y + box.height)
      await addPhase.tap()
      await page.getByLabel('Phase name').fill('Warmup')
      await page.getByRole('button', { name: 'Add', exact: true }).tap()
    } else {
      await page.getByLabel('Minutes', { exact: true }).pressSequentially('01')
    }
    await expect(name).toHaveValue(title)
    await page.getByRole('button', { name: 'Save as Preset' }).tap()
    await expect(page.getByText('Preset saved.', { exact: true })).toBeVisible()
    await page.goto('/configure?tab=presets')
    await page.reload()
    await page.getByRole('heading', { name: title, exact: true }).tap()
    await expect(name).toHaveValue(title)
  })
}
