import { expect, test } from 'playwright/test'

test.use({ viewport: { width: 320, height: 640 }, isMobile: true, hasTouch: true })

test('select, edit, save, reopen and ungroup a phase range by touch', async ({ page }) => {
  await page.addInitScript(() => {
    const phases = ['Row', 'Rest', 'Bike', 'Rest', 'Cooldown'].map((name, i) => ({
      id: 'p' + i,
      order: i,
      name,
      type: 'COUNTDOWN',
      config: { id: 'c' + i, name, type: 'COUNTDOWN', duration: [45, 15, 45, 15, 60][i] },
    }))
    localStorage.setItem(
      'preset_flat',
      JSON.stringify({
        id: 'flat',
        name: 'Circuit',
        description: '',
        isBuiltIn: false,
        config: { id: 'circuit', name: 'Circuit', type: 'COMPLEX', phases },
      })
    )
  })
  const button = (name: string) => page.getByRole('button', { name, exact: true })
  await page.goto('/configure/complex?preset=flat')
  await button('Repeat').tap()
  await page.getByLabel('Through', { exact: true }).selectOption({ label: '4 · Rest' })
  await page.getByLabel('Times', { exact: true }).fill('101')
  await expect(button('Apply')).toBeDisabled()
  await page.getByLabel('Times', { exact: true }).fill('4')
  await button('Apply').tap()
  await expect(page.getByLabel('Estimated Duration')).toHaveValue('9m')
  await page.getByLabel('Timer Name*', { exact: true }).fill('Repeated circuit')
  await button('Save as Preset').tap()
  await expect(page.getByText('Preset saved.', { exact: true })).toBeVisible()
  await page.goto('/configure?tab=presets')
  await page.reload()
  await page.getByRole('heading', { name: 'Repeated circuit', exact: true }).tap()
  await expect(page.getByLabel('Estimated Duration')).toHaveValue('9m')
  await button('Edit').tap()
  await expect(page.getByLabel('Through', { exact: true })).toHaveValue('3')
  await page.getByLabel('Times', { exact: true }).fill('3')
  await button('Cancel').tap()
  await expect(page.getByLabel('Estimated Duration')).toHaveValue('9m')
  await button('Edit').tap()
  await page.getByLabel('Times', { exact: true }).fill('3')
  await button('Apply').tap()
  await expect(page.getByLabel('Estimated Duration')).toHaveValue('7m')
  await page.getByRole('button', { name: /ungroup/i }).tap()
  await expect(page.getByLabel('Estimated Duration')).toHaveValue('3m')
  await expect(button('Edit phase')).toHaveCount(5)
})
