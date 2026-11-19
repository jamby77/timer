import { expect, test } from 'playwright/test'

test.use({ viewport: { width: 320, height: 640 }, isMobile: true, hasTouch: true })

test('interval labels have full-width touch targets and reopen independently', async ({ page }) => {
  await page.goto('/configure')
  await page.getByRole('heading', { name: 'Interval', exact: true }).tap()
  const seconds = page.locator('input[name=seconds]')
  await seconds.first().pressSequentially('45')
  await seconds.last().pressSequentially('15')
  await page.getByLabel('Number of Intervals').fill('4')
  await page.getByLabel(/Timer Name/).fill('Hill repeats')

  const work = page.getByLabel('Work Label', { exact: true })
  const rest = page.getByLabel('Rest Label', { exact: true })
  const workBox = (await work.boundingBox())!
  const restBox = (await rest.boundingBox())!
  expect(restBox.y).toBeGreaterThan(workBox.y + workBox.height)
  for (const input of [work, rest]) {
    const box = (await input.boundingBox())!
    expect(box.width).toBeGreaterThan(240)
    expect(box.x + box.width).toBeLessThanOrEqual(320)
    expect(box.height).toBeGreaterThanOrEqual(44)
    await input.tap({ position: { x: box.width - 4, y: 4 } })
    await expect(input).toBeFocused()
  }
  await work.fill('Run uphill at a steady pace')
  await rest.fill('Walk back to the start')
  await page.getByRole('button', { name: 'Save as Preset' }).tap()
  await expect(page.getByText('Preset saved.', { exact: true })).toBeVisible()
  await page.reload()
  await page.getByRole('heading', { name: 'Hill repeats', exact: true }).tap()
  await expect(work).toHaveValue('Run uphill at a steady pace')
  await expect(rest).toHaveValue('Walk back to the start')
})
