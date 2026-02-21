import { expect, test } from 'playwright/test'

test('create 3s countdown and verify idle → running → completed', async ({ page }) => {
  await page.goto('/configure')
  await expect(page.getByRole('heading', { name: 'Configure Timer' })).toBeVisible()

  // Select Countdown timer type
  await page.getByText('Countdown', { exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Configure Countdown Timer' })).toBeVisible()

  // Set duration to 00:00:03
  // Note: TimePickerInput is keyboard-driven (onKeyDown), so we use key presses instead of fill().
  await page.locator('#seconds').click()
  await page.keyboard.press('3')

  // Create timer and navigate to run page
  await page.getByRole('button', { name: 'Start Timer' }).click()
  await page.waitForURL(/\/\?id=/)

  // Idle stage: Start button is visible
  await expect(page.getByRole('button', { name: 'Start timer' })).toBeVisible()

  // Running stage: after starting, Pause button should appear
  await page.getByRole('button', { name: 'Start timer' }).click()
  await expect(page.getByRole('button', { name: 'Pause timer' })).toBeVisible()

  // Completed stage: after ~3 seconds, Restart button should appear
  await expect(page.getByRole('button', { name: 'Restart timer' })).toBeVisible({ timeout: 10_000 })
})
