import { expect, test } from 'playwright/test'

for (const [field, duration] of [
  ['seconds', 5],
  ['minutes', 300],
  ['hours', 18000],
] as const) {
  test(`native ${field} input saves and reloads`, async ({ page }) => {
    await page.goto('/configure')
    await page.getByRole('heading', { name: 'Countdown', exact: true }).click()
    await page.getByLabel(/Timer Name/).fill(`Native ${field}`)
    await page.locator(`input[name=${field}]`).fill('05')
    await expect(page.locator(`input[name=${field}]`)).toHaveValue('05')
    await page.getByRole('button', { name: 'Save as Preset' }).click()
    const config = await page.evaluate(() => {
      const key = Object.keys(localStorage).find((key) => key.startsWith('preset_'))!
      return JSON.parse(localStorage.getItem(key)!).config
    })
    expect(config.duration).toBe(duration)
    await page.goto('/configure')
    await page.reload()
    await page.getByRole('heading', { name: `Native ${field}`, exact: true }).click()
    await expect(page.locator(`input[name=${field}]`)).toHaveValue('05')
  })
}

test('pastes clipboard values, clamps them, and resets pending keyboard entry', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.goto('/configure')
  await page.getByRole('heading', { name: 'Countdown', exact: true }).click()
  const seconds = page.locator('input[name=seconds]')
  await seconds.press('4')
  await page.evaluate(() => navigator.clipboard.writeText('05'))
  await seconds.press('ControlOrMeta+a')
  await seconds.press('ControlOrMeta+v')
  await expect(seconds).toHaveValue('05')
  await seconds.press('3')
  await expect(seconds).toHaveValue('03')
  await seconds.fill('99')
  await expect(seconds).toHaveValue('59')
  await seconds.press('ControlOrMeta+a')
  await seconds.press('Backspace')
  await expect(seconds).toHaveValue('01')
})

test('pasting unchanged zero validates the minimum and saves it', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.goto('/configure')
  await page.getByRole('heading', { name: 'Countdown', exact: true }).click()
  await page.getByLabel(/Timer Name/).fill('Pasted minimum')
  const seconds = page.locator('input[name=seconds]')
  await expect(seconds).toHaveValue('00')
  await page.evaluate(() => navigator.clipboard.writeText('00'))
  await seconds.press('ControlOrMeta+a')
  await seconds.press('ControlOrMeta+v')
  await expect(seconds).toHaveValue('01')
  await page.getByRole('button', { name: 'Save as Preset' }).click()
  const config = await page.evaluate(() => {
    const key = Object.keys(localStorage).find((key) => key.startsWith('preset_'))!
    return JSON.parse(localStorage.getItem(key)!).config
  })
  expect(config.duration).toBe(1)
  await page.goto('/configure')
  await page.reload()
  await page.getByRole('heading', { name: 'Pasted minimum', exact: true }).click()
  await expect(seconds).toHaveValue('01')
  await seconds.pressSequentially('05')
  await expect(seconds).toHaveValue('05')
})
