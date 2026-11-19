import { expect, test, type Locator } from 'playwright/test'

test.use({ viewport: { width: 320, height: 640 }, isMobile: true, hasTouch: true })

async function tapBack(button: Locator) {
  await expect(button).toBeVisible()
  const box = (await button.boundingBox())!
  expect(box.width).toBeGreaterThanOrEqual(44)
  expect(box.height).toBeGreaterThanOrEqual(44)
  await button.tap({ position: { x: 4, y: 4 } })
}

test('setup back buttons return to selection or discard just the phase draft', async ({ page }) => {
  await page.goto('/configure')
  const countdown = page.getByRole('heading', { name: 'Countdown', exact: true })
  const back = page.getByRole('button', { name: 'Go back', exact: true })
  await countdown.tap()
  await tapBack(back)
  await expect(countdown).toBeVisible()

  await page.getByRole('heading', { name: 'Complex', exact: true }).tap()
  const addPhase = page.getByRole('button', { name: 'Add Phase', exact: true })
  const backToPhases = page.getByRole('button', { name: 'Back to phases' })
  await addPhase.tap()
  await page.getByLabel('Phase name').fill('Discard me')
  await tapBack(backToPhases)
  await expect(page.getByRole('button', { name: 'Edit phase' })).toHaveCount(0)
  await addPhase.tap()
  await page.getByLabel('Phase name').fill('Warmup')
  await page.getByRole('button', { name: 'Add', exact: true }).tap()
  const edit = page.getByRole('button', { name: 'Edit phase' })
  await edit.tap()
  await page.getByLabel('Phase name').fill('Discard edit')
  await tapBack(backToPhases)
  await edit.tap()
  await expect(page.getByLabel('Phase name')).toHaveValue('Warmup')
  await tapBack(backToPhases)
  await tapBack(back)
  await expect(countdown).toBeVisible()
})
