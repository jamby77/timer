import { expect, test } from 'playwright/test'

test.use({ viewport: { width: 320, height: 640 }, isMobile: true, hasTouch: true })

test('the completion message can be cleared and replaced on a phone', async ({ page }) => {
  await page.goto('/configure')
  await page.getByRole('heading', { name: 'Countdown', exact: true }).tap()
  await page.getByLabel(/Timer Name/).fill('Hill repeats')
  await page.getByLabel('Seconds', { exact: true }).pressSequentially('45')

  const message = page.getByLabel('Completion Message')
  await expect(message).toHaveValue('Time is up!')
  await message.fill('')
  await expect(message).toHaveValue('')
  const bounds = (await message.boundingBox())!
  expect(bounds.height).toBeGreaterThanOrEqual(44)
  expect(bounds.x + bounds.width).toBeLessThanOrEqual(320)
  await message.blur()
  await message.tap({ position: { x: bounds.width - 2, y: bounds.height / 2 } })
  await expect(message).toBeFocused()
  await message.pressSequentially('Time to recover')
  await page.getByRole('button', { name: 'Save as Preset' }).tap()
  await expect(page.getByText('Preset saved.', { exact: true })).toBeVisible()
  await page.reload()
  await page.getByRole('heading', { name: 'Hill repeats', exact: true }).tap()
  await expect(message).toHaveValue('Time to recover')
})
