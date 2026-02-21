import { expect, test } from 'playwright/test'

test('redirects to /configure when no timer id is provided', async ({ page }) => {
  await page.goto('/')
  await page.waitForURL(/\/configure(\?.*)?$/)

  await expect(page.getByRole('heading', { name: 'Configure Timer' })).toBeVisible()
})
