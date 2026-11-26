import { expect, test } from 'playwright/test'

for (const [field, duration] of [
  ['seconds', 5],
  ['minutes', 300],
  ['hours', 18000],
] as const) {
  test(`leading-zero ${field} entry saves and reopens the intended duration`, async ({ page }) => {
    await page.goto('/configure')
    await page.getByRole('heading', { name: 'Countdown', exact: true }).click()
    await page.getByLabel(/Timer Name/).fill(`Five ${field}`)
    await page.locator(`input[name=${field}]`).pressSequentially('05')
    for (const name of ['hours', 'minutes', 'seconds']) {
      await expect(page.locator(`input[name=${name}]`)).toHaveValue(name === field ? '05' : '00')
    }
    await page.getByRole('button', { name: 'Save as Preset' }).click()
    const config = await page.evaluate(() => {
      const key = Object.keys(localStorage).find((key) => key.startsWith('preset_'))!
      return JSON.parse(localStorage.getItem(key)!).config
    })
    expect(config.duration).toBe(duration)
    await page.goto('/configure?tab=presets')
    await page.reload()
    await page.getByRole('heading', { name: `Five ${field}`, exact: true }).click()
    for (const name of ['hours', 'minutes', 'seconds']) {
      await expect(page.locator(`input[name=${name}]`)).toHaveValue(name === field ? '05' : '00')
    }
  })
}

test('Work/Rest fixed rest accepts 05 as five seconds', async ({ page }) => {
  await page.goto('/configure')
  await page.getByRole('heading', { name: 'Work/Rest Ratio', exact: true }).click()
  await page.getByRole('radio', { name: 'Fixed rest' }).click()
  await page.locator('input[name=seconds]').first().pressSequentially('05')
  await expect(page.locator('input[name=seconds]').first()).toHaveValue('05')
  await page.getByLabel('Max rounds').selectOption('2')
  await page.getByRole('button', { name: 'Save as Preset' }).click()
  const config = await page.evaluate(() => {
    const key = Object.keys(localStorage).find((key) => key.startsWith('preset_'))!
    return JSON.parse(localStorage.getItem(key)!).config
  })
  expect(config.fixedRestDuration).toBe(5)
})
