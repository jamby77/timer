import { expect, test } from 'playwright/test'

import type { Page } from 'playwright/test'

async function openApp(page: Page) {
  await page.addInitScript(() =>
    localStorage.setItem(
      'timer_install-flow',
      JSON.stringify({
        id: 'install-flow',
        type: 'COUNTDOWN',
        name: 'Install verification',
        duration: 60,
      })
    )
  )
  await page.goto('/?id=install-flow')
  await expect(page.getByRole('button', { name: 'Start timer', exact: true })).toBeVisible()
}

async function offerInstallation(page: Page, outcome: 'accepted' | 'dismissed') {
  await page.evaluate((outcome) => {
    let choose: (choice: { outcome: string }) => void
    const userChoice = new Promise((resolve) => {
      choose = resolve
    })
    const event = new Event('beforeinstallprompt', { cancelable: true })
    Object.assign(event, {
      prompt: async () => {
        choose({ outcome })
      },
      userChoice,
    })
    window.dispatchEvent(event)
  }, outcome)
  await expect(page.getByRole('button', { name: 'Install', exact: true })).toBeVisible()
}

for (const outcome of ['accepted', 'dismissed'] as const) {
  test(`browser ${outcome} choice does not mark installation complete before appinstalled`, async ({
    page,
  }) => {
    await openApp(page)
    await offerInstallation(page, outcome)
    await page.getByRole('button', { name: 'Install', exact: true }).click()
    await expect(page.getByRole('heading', { name: 'Install App', exact: true })).toBeHidden()
    expect(await page.evaluate(() => localStorage.getItem('pwa-install-completed'))).toBeNull()
    await page.reload()
    await expect(page.getByRole('button', { name: 'Start timer', exact: true })).toBeVisible()
    await offerInstallation(page, outcome)
    if (outcome === 'accepted') {
      await page.getByRole('button', { name: 'Install', exact: true }).click()
      await page.evaluate(() => window.dispatchEvent(new Event('appinstalled')))
      await page.reload()
      await expect(page.getByRole('button', { name: 'Start timer', exact: true })).toBeVisible()
      await page.evaluate(() => window.dispatchEvent(new Event('beforeinstallprompt')))
      await expect(page.getByRole('heading', { name: 'Install App', exact: true })).toBeHidden()
      expect(await page.evaluate(() => localStorage.getItem('pwa-install-completed'))).toBe('true')
    }
  })
}

test.describe('iOS instruction flow with simulated browser signals', () => {
  test.use({
    userAgent:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1',
    viewport: { width: 390, height: 844 },
  })

  for (const permanent of [false, true]) {
    test(`${permanent ? 'permanent' : 'temporary'} dismissal hides iOS instructions after reload`, async ({
      page,
    }) => {
      await openApp(page)
      if (permanent) {
        await page.evaluate(() => localStorage.setItem('pwa-install-dismiss-count', '3'))
        await page.reload()
      }
      await expect(page.getByRole('heading', { name: 'Install App', exact: true })).toBeVisible()
      await expect(page.getByText(/To install this app on your iOS device/)).toContainText(
        'Add to Home Screen'
      )
      await expect(page.getByRole('img', { name: 'share icon' })).toBeVisible()
      await expect(page.getByRole('img', { name: 'plus icon' })).toBeVisible()
      await expect(page.getByRole('button', { name: 'Install', exact: true })).toBeHidden()
      await page
        .getByRole('button', {
          name: permanent ? 'Never show again' : 'Dismiss install prompt',
          exact: true,
        })
        .click()
      await page.reload()
      await expect(page.getByRole('button', { name: 'Start timer', exact: true })).toBeVisible()
      await expect(page.getByRole('heading', { name: 'Install App', exact: true })).toBeHidden()
      expect(await page.evaluate(() => localStorage.getItem('pwa-install-completed'))).toBeNull()
    })
  }

  test('iOS standalone launch records installation and hides instructions on later browser visits', async ({
    page,
    context,
  }) => {
    await page.addInitScript(() =>
      Object.defineProperty(navigator, 'standalone', { value: true, configurable: true })
    )
    await openApp(page)
    await expect(page.getByRole('heading', { name: 'Install App', exact: true })).toBeHidden()
    expect(await page.evaluate(() => localStorage.getItem('pwa-install-completed'))).toBe('true')
    const browserTab = await context.newPage()
    await browserTab.goto('/?id=install-flow')
    await expect(browserTab.getByRole('button', { name: 'Start timer', exact: true })).toBeVisible()
    expect(await browserTab.evaluate(() => 'standalone' in navigator)).toBe(false)
    await expect(browserTab.getByRole('heading', { name: 'Install App', exact: true })).toBeHidden()
  })
})

for (const failure of ['prompt', 'choice'] as const) {
  test(`${failure} rejection shows an error and permits a fresh installation offer`, async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    await openApp(page)
    await page.evaluate((failure) => {
      let rejectChoice: (reason: Error) => void
      const userChoice = new Promise((_, reject) => { rejectChoice = reject })
      const event = new Event('beforeinstallprompt', { cancelable: true })
      Object.assign(event, {
        prompt: async () => {
          if (failure === 'prompt') throw new Error('Installation unavailable')
          rejectChoice(new Error('Installation choice unavailable'))
        },
        userChoice,
      })
      window.dispatchEvent(event)
    }, failure)
    await page.getByRole('button', { name: 'Install', exact: true }).click()
    await expect(page.getByText('Installation could not be completed. Please try again when prompted.', { exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Install', exact: true })).toBeHidden()
    expect(errors).toEqual([])
    expect(await page.evaluate(() => localStorage.getItem('pwa-install-completed'))).toBeNull()
    expect(await page.evaluate(() => localStorage.getItem('pwa-install-dismissed'))).toBeNull()
    await offerInstallation(page, 'accepted')
    await page.getByRole('button', { name: 'Install', exact: true }).click()
    await page.evaluate(() => window.dispatchEvent(new Event('appinstalled')))
    await page.reload()
    await expect(page.getByRole('button', { name: 'Start timer', exact: true })).toBeVisible()
    expect(await page.evaluate(() => localStorage.getItem('pwa-install-completed'))).toBe('true')
    expect(errors).toEqual([])
  })
}

test.describe('mobile install banner', () => {
  test.use({ viewport: { width: 320, height: 640 }, hasTouch: true, isMobile: true })

  test('the install offer leaves the timer title and Start visible', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('pwa-install-dismiss-count', '3'))
    await openApp(page)
    await offerInstallation(page, 'dismissed')
    const banner = page.locator('[data-install-banner]')
    const bounds = (await banner.boundingBox())!
    const title = await page.getByText('Install verification', { exact: true }).boundingBox()
    expect(title!.y).toBeGreaterThanOrEqual(bounds.y + bounds.height)
    const start = page.getByRole('button', { name: 'Start timer', exact: true })
    const button = (await start.boundingBox())!
    expect(button.y + button.height).toBeLessThanOrEqual(640)
    await start.tap()
    await expect(banner).toBeHidden()
    await page.getByRole('button', { name: 'Pause timer', exact: true }).tap()
    await expect(banner).toBeHidden()
    await page.getByRole('button', { name: 'Stop timer', exact: true }).tap()
    await page.getByRole('button', { name: 'End', exact: true }).tap()
    await expect(banner.getByRole('button', { name: 'Install', exact: true })).toBeVisible()
  })

  test('an install offer arriving during a workout stays hidden until Stop', async ({ page }) => {
    await openApp(page)
    await page.getByRole('button', { name: 'Start timer', exact: true }).tap()
    await page.evaluate(() => window.dispatchEvent(new Event('beforeinstallprompt')))
    const banner = page.locator('[data-install-banner]')
    await expect(banner).toBeAttached()
    await expect(banner).toBeHidden()
    await page.getByRole('button', { name: 'Pause timer', exact: true }).tap()
    await expect(banner).toBeHidden()
    await page.getByRole('button', { name: 'Stop timer', exact: true }).tap()
    await page.getByRole('button', { name: 'End', exact: true }).tap()
    await expect(banner).toBeVisible()
  })

  for (const action of ['Install', 'Dismiss install prompt', 'Never show again']) {
    test(`${action} responds to an edge tap`, async ({ page }) => {
      await page.addInitScript(() => localStorage.setItem('pwa-install-dismiss-count', '3'))
      await openApp(page)
      await offerInstallation(page, 'dismissed')
      const button = page.getByRole('button', { name: action, exact: true })
      const box = (await button.boundingBox())!
      expect(box.width).toBeGreaterThanOrEqual(44)
      expect(box.height).toBeGreaterThanOrEqual(44)
      expect(box.x + box.width).toBeLessThanOrEqual(320)
      await button.tap({ position: { x: box.width - 3, y: box.height / 2 } })
      await expect(page.getByRole('heading', { name: 'Install App' })).toBeHidden()
      if (action === 'Never show again') {
        expect(await page.evaluate(() => localStorage.getItem('pwa-install-permanently-dismissed'))).toBe('true')
      }
    })
  }
})
