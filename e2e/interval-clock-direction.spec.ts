import { expect, test } from 'playwright/test'

test.use({ viewport: { width: 320, height: 640 }, isMobile: true, hasTouch: true })

test('work and rest clocks can be configured independently and saved', async ({ page }) => {
  await page.goto('/configure')
  await page.getByRole('heading', { name: 'Interval', exact: true }).tap()
  await page.locator('#workDuration').pressSequentially('30')
  await page.getByLabel('Number of Intervals').fill('3')
  const group = (step: string) =>
    page.getByRole('group', { name: step + ' clock direction', exact: true })
  const work = group('Work')
  const rest = group('Rest')
  await page.locator('#restDuration').pressSequentially('15')
  await expect(work.getByLabel('Count down')).toBeChecked()
  await expect(rest.getByLabel('Count down')).toBeChecked()
  await work.getByText('Count up').tap()
  await rest.getByLabel('Count down').focus()
  await page.keyboard.press('ArrowLeft')
  await expect(rest.getByLabel('Count up')).toBeChecked()
  await page.locator('#restDuration').pressSequentially('00')
  await expect(rest).toBeHidden()
  await page.locator('#restDuration').pressSequentially('15')
  await expect(rest.getByLabel('Count up')).toBeChecked()
  await rest.getByText('Count down').tap()
  await page.getByLabel(/Timer Name/).fill('Clock directions')
  await page.getByRole('button', { name: 'Save as Preset' }).tap()
  await expect(page.getByText('Preset saved.', { exact: true })).toBeVisible()
  await page.reload()
  await page.getByRole('tab', { name: 'Presets', exact: true }).click()
  await page.getByRole('heading', { name: 'Clock directions', exact: true }).tap()
  await expect(work.getByLabel('Count up')).toBeChecked()
  await expect(rest.getByLabel('Count down')).toBeChecked()
})

for (const workUp of [true, false]) {
  test(
    'mixed directions during playback, recovery and completion, work up ' + workUp,
    async ({ page }) => {
      await page.clock.install({ time: new Date('2026-01-01T12:00:00Z') })
      await page.clock.pauseAt(new Date('2026-01-01T12:01:00Z'))
      await page.addInitScript((workUp) => {
        localStorage.setItem(
          'timer_direction',
          JSON.stringify({
            id: 'direction',
            type: 'INTERVAL',
            name: 'Circuit',
            intervals: 1,
            workDuration: 30,
            restDuration: 15,
            skipLastRest: false,
            workDirection: workUp ? 'up' : 'down',
            restDirection: workUp ? 'down' : 'up',
          })
        )
      }, workUp)
      await page.goto('/?id=direction')
      const digits = page.locator('[data-slot=card-content] .font-mono')
      const button = (name: string) => page.getByRole('button', { name, exact: true })
      await expect(digits).toHaveText(workUp ? '00:00.00' : '00:30.00')
      await button('Start intervals').tap()
      await page.clock.runFor(8100)
      await button('Pause intervals').tap()
      await expect(digits).toHaveText(workUp ? /^00:08/ : /^00:21/)
      const paused = await digits.textContent()
      await page.clock.runFor(2000)
      await expect(digits).toHaveText(paused!)
      await button('Resume intervals').tap()
      await page.reload()
      await expect(
        page.getByText(new RegExp('Round 1.*' + (workUp ? '00:08' : '00:21')))
      ).toBeVisible()
      await button('Resume').tap()
      await button('Skip current interval').tap()
      await expect(digits).toHaveText(workUp ? '00:15.00' : '00:00.00')
      await page.clock.fastForward(16000)
      await expect(page.getByText('Complete', { exact: true })).toBeVisible()
      await expect(digits).toHaveText(workUp ? '00:00.00' : '00:15.00')
      await button('Restart intervals').tap()
      await expect(digits).toHaveText(workUp ? '00:00.00' : '00:30.00')
    }
  )
}

test('a saved Complex phase reopens with its own clock directions', async ({ page }) => {
  await page.goto('/configure/complex')
  await page.getByRole('button', { name: 'Add Phase', exact: true }).tap()
  await page.getByLabel('Phase type').tap()
  await page.getByRole('option', { name: /Interval/ }).tap()
  const rest = page.getByRole('group', { name: 'Rest clock direction', exact: true })
  await page.locator('#restDuration').pressSequentially('15')
  await rest.getByText('Count up').tap()
  await page.getByRole('button', { name: 'Add', exact: true }).tap()
  await page.getByLabel(/Timer Name/).fill('Reverse rest')
  await page.getByRole('button', { name: 'Save as Preset' }).tap()
  await expect(page.getByText('Preset saved.', { exact: true })).toBeVisible()
  await page.goto('/configure?tab=presets')
  await page.getByRole('heading', { name: 'Reverse rest', exact: true }).tap()
  await page.getByRole('button', { name: 'Edit phase' }).tap()
  await expect(rest.getByLabel('Count up')).toBeChecked()
  await expect(
    page.getByRole('group', { name: 'Work clock direction' }).getByLabel('Count down')
  ).toBeChecked()
})
