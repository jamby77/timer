import { expect, test } from 'playwright/test'

import type { Page } from 'playwright/test'

test.use({ viewport: { width: 320, height: 640 }, isMobile: true, hasTouch: true })

const button = (page: Page, name: string) => page.getByRole('button', { name, exact: true })
const heading = (page: Page, name: string) => page.getByRole('heading', { name, exact: true })
const minutes = (page: Page) => page.getByLabel('Minutes', { exact: true })

test('general settings survive reload, Back discards edits, and saved presets retain their values', async ({
  page,
}) => {
  await page.goto('/configure')
  await heading(page, 'Countdown').tap()
  await page.getByLabel('Seconds', { exact: true }).pressSequentially('30')
  await page.getByLabel(/Timer Name/).fill('Before settings')
  await button(page, 'Save as Preset').tap()
  await expect(page.getByText('Preset saved.', { exact: true })).toBeVisible()

  await page.getByRole('link', { name: 'Settings', exact: true }).press('Enter')
  const general = button(page, 'General')
  await expect(general).toBeVisible()
  const bounds = await general.boundingBox()
  expect(bounds!.height).toBeGreaterThanOrEqual(44)
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320)
  await general.press('Enter')
  const preStart = page.getByLabel('Pre-start countdown', { exact: true })
  const completion = page.getByLabel(/^Completion message$/i)
  await preStart.selectOption('5')
  await completion.fill('Great session!')
  await button(page, 'Save').tap()
  await page.reload()
  await general.tap()
  await expect(preStart).toHaveValue('5')
  await expect(completion).toHaveValue('Great session!')
  await completion.fill('Discard this')
  await button(page, 'Back to Settings').tap()
  await general.tap()
  await expect(completion).toHaveValue('Great session!')

  await page.getByRole('link', { name: 'New', exact: true }).tap()
  await heading(page, 'Countdown').tap()
  await expect(preStart).toHaveValue('5')
  await expect(completion).toHaveValue('Great session!')
  await completion.fill('Just this timer')
  await button(page, 'Cancel').tap()
  await heading(page, 'Before settings').tap()
  await expect(preStart).toHaveValue('0')
  await expect(completion).toHaveValue('Time is up!')
  await button(page, 'Cancel').tap()
  await heading(page, 'Countdown').tap()
  await expect(completion).toHaveValue('Great session!')
})

test('new complex phases pick up phase settings while an open phase draft retains its duration', async ({
  page,
  context,
}) => {
  await page.goto('/configure/complex')
  await button(page, 'Add Phase').tap()
  await expect(minutes(page)).toHaveValue('01')
  const settings = await context.newPage()
  await settings.goto('/settings')
  await button(settings, 'Countdown phase').tap()
  await minutes(settings).pressSequentially('04')
  await button(settings, 'Save').tap()
  await expect(button(settings, 'General')).toBeVisible()
  await expect(minutes(page)).toHaveValue('01')
  await button(page, 'Add').tap()
  await button(page, 'Add Phase').tap()
  await expect(minutes(page)).toHaveValue('04')
  await button(page, 'Add at the end').tap()
  await page.getByRole('button', { name: 'Edit phase' }).first().tap()
  await expect(minutes(page)).toHaveValue('01')
})

test('Tabata settings apply to the built-in starter and preserve a previously saved copy', async ({
  page,
}) => {
  await page.goto('/configure')
  await heading(page, 'Tabata').tap()
  const count = page.getByLabel('Number of Intervals', { exact: true })
  await expect(count).toHaveValue('8')
  await page.getByLabel(/Timer Name/).fill('Original Tabata')
  await button(page, 'Save as Preset').tap()
  await expect(page.getByText('Preset saved.', { exact: true })).toBeVisible()
  await button(page, 'Cancel').tap()
  const settings = await page.context().newPage()
  await settings.goto('/settings')
  await button(settings, 'Tabata').tap()
  await settings.getByLabel('Number of Intervals', { exact: true }).fill('6')
  await button(settings, 'Save').tap()
  await expect(button(settings, 'General')).toBeVisible()
  await heading(page, 'Tabata').tap()
  await expect(count).toHaveValue('6')
  await button(page, 'Cancel').tap()
  await heading(page, 'Original Tabata').tap()
  await expect(count).toHaveValue('8')
})

test('a failed settings save preserves the edit for retry and leaves the last saved value intact', async ({
  page,
}) => {
  await page.goto('/settings')
  await button(page, 'Sound cues').tap()
  const volume = page.getByLabel('Volume (%)', { exact: true })
  await volume.fill('37')
  await button(page, 'Save').tap()
  await button(page, 'Sound cues').tap()
  await volume.fill('46')
  await page.evaluate(() => {
    const setItem = Storage.prototype.setItem
    Storage.prototype.setItem = function (key, value) {
      if (key.startsWith('personal_defaults_')) {
        Storage.prototype.setItem = setItem
        throw new DOMException('Storage is full', 'QuotaExceededError')
      }
      return setItem.call(this, key, value)
    }
  })
  await button(page, 'Save').tap()
  await expect(page.getByRole('main').getByRole('alert')).toContainText('Could not save')
  await expect(volume).toHaveValue('46')
  const other = await page.context().newPage()
  await other.goto('/settings')
  await button(other, 'Sound cues').tap()
  await expect(other.getByLabel('Volume (%)', { exact: true })).toHaveValue('37')
  await button(page, 'Save').tap()
  await page.reload()
  await button(page, 'Sound cues').tap()
  await expect(volume).toHaveValue('46')
})
