import { expect, test } from 'playwright/test'

for (const preference of ['dismissal', 'permanent dismissal', 'installation']) {
  test(`${preference} hides the install prompt in another open tab and after reload`, async ({
    context,
    page,
  }) => {
    await context.addInitScript(() =>
      localStorage.setItem(
        'timer_pwa-check',
        JSON.stringify({ id: 'pwa-check', type: 'COUNTDOWN', name: 'PWA check', duration: 60 })
      )
    )
    await page.goto('/?id=pwa-check')
    if (preference === 'permanent dismissal') {
      await page.evaluate(() => localStorage.setItem('pwa-install-dismiss-count', '3'))
      await page.reload()
    }
    const other = await context.newPage()
    await other.goto('/?id=pwa-check')
    for (const tab of [page, other]) {
      await expect(tab.getByRole('button', { name: 'Start timer', exact: true })).toBeVisible()
      await tab.evaluate(() => window.dispatchEvent(new Event('beforeinstallprompt')))
      await expect(tab.getByRole('heading', { name: 'Install App', exact: true })).toBeVisible()
    }
    if (preference === 'installation') {
      await page.evaluate(() => window.dispatchEvent(new Event('appinstalled')))
    } else {
      await page
        .getByRole('button', {
          name: preference === 'dismissal' ? 'Dismiss install prompt' : 'Never show again',
          exact: true,
        })
        .click()
    }
    await expect(page.getByRole('heading', { name: 'Install App', exact: true })).toBeHidden()
    await expect(other.getByRole('heading', { name: 'Install App', exact: true })).toBeHidden()
    await other.reload()
    await expect(other.getByRole('button', { name: 'Start timer', exact: true })).toBeVisible()
    await other.evaluate(() => window.dispatchEvent(new Event('beforeinstallprompt')))
    await expect(other.getByRole('heading', { name: 'Install App', exact: true })).toBeHidden()
  })
}

test('open tabs refresh dismissal count and reset preferences without reacting to session storage', async ({
  context,
  page,
}) => {
  await context.addInitScript(() =>
    localStorage.setItem(
      'timer_pwa-check',
      JSON.stringify({ id: 'pwa-check', type: 'COUNTDOWN', name: 'PWA check', duration: 60 })
    )
  )
  await page.goto('/?id=pwa-check')
  await expect(page.getByRole('button', { name: 'Start timer', exact: true })).toBeVisible()
  await page.evaluate(() => window.dispatchEvent(new Event('beforeinstallprompt')))
  const other = await context.newPage()
  await other.goto('/?id=pwa-check')
  await expect(other.getByRole('button', { name: 'Start timer', exact: true })).toBeVisible()
  await other.evaluate(() => {
    sessionStorage.setItem('pwa-install-completed', 'true')
    localStorage.setItem('unrelated-preference', 'true')
    localStorage.setItem('pwa-install-dismiss-count', '3')
  })
  await expect(page.getByRole('button', { name: 'Never show again', exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Dismiss install prompt', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Install App', exact: true })).toBeHidden()
  await other.evaluate(() => localStorage.clear())
  await expect(page.getByRole('heading', { name: 'Install App', exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Never show again', exact: true })).toBeHidden()
})
