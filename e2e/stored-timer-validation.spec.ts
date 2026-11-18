import { expect, test } from 'playwright/test'

for (const [name, config] of [
  ['missing countdown duration', { id: 'bad', name: 'Bad', type: 'COUNTDOWN' }],
  ['incomplete interval', { id: 'bad', name: 'Bad', type: 'INTERVAL', workDuration: 20 }],
  ['missing complex phases', { id: 'bad', name: 'Bad', type: 'COMPLEX' }],
  ['malformed complex phase', { id: 'bad', name: 'Bad', type: 'COMPLEX', phases: [null] }],
  ['unknown type', { id: 'bad', name: 'Bad', type: 'UNKNOWN' }],
] as const) {
  test(`${name} returns to Configure without crashing`, async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    await page.goto('/configure')
    await page.evaluate(config => localStorage.setItem('timer_bad', JSON.stringify(config)), config)
    await page.goto('/?id=bad')
    await expect(page).toHaveURL(/\/configure$/)
    await expect(page.getByRole('heading', { name: 'Countdown', exact: true })).toBeVisible()
    expect(errors).toEqual([])
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('timer_bad')!))).toEqual(config)
  })
}

for (const type of ['Countdown', 'Stopwatch', 'Interval', 'Work/Rest Ratio']) {
  test(`valid saved ${type} starts after reloading its direct link`, async ({ page }) => {
    await page.goto('/configure')
    await page.getByRole('heading', { name: type, exact: true }).click()
    if (type === 'Work/Rest Ratio') await page.getByRole('radio', { name: 'Fixed rest' }).click()
    if (type === 'Interval') {
      await page.getByLabel('Number of Intervals').fill('2')
      await page.locator('input[name=seconds]').nth(1).fill('10')
    }
    if (type !== 'Stopwatch') await page.locator('input[name=seconds]').first().fill('30')
    if (type === 'Work/Rest Ratio') await page.getByLabel('Max rounds').selectOption('2')
    await page.getByLabel(/Timer Name/).fill(`Saved ${type}`)
    await page.getByRole('button', { name: 'Start Timer', exact: true }).click()
    await expect(page).toHaveURL(/\/\?id=/)
    await page.reload()
    await expect(page).toHaveURL(/\/\?id=/)
    await page.getByRole('button', { name: type === 'Work/Rest Ratio' ? 'Start work' : type === 'Interval' ? 'Start intervals' : 'Start timer', exact: true }).click()
    await expect(page.locator('[data-timer-state]')).toHaveAttribute('data-timer-state', 'running')
  })
}

test('valid complex timer reloads nested settings and starts', async ({ page }) => {
  await page.goto('/configure/complex')
  await page.getByRole('button', { name: 'Add Phase', exact: true }).click()
  await page.getByLabel('Phase name').fill('Saved warmup')
  await page.getByRole('button', { name: 'Add', exact: true }).click()
  await page.getByLabel('Timer Name*', { exact: true }).fill('Saved workout')
  await page.getByRole('button', { name: 'Start Timer', exact: true }).click()
  await expect(page).toHaveURL(/\/\?id=/)
  await page.reload()
  await expect(page).toHaveURL(/\/\?id=/)
  await page.getByRole('button', { name: 'Start timer', exact: true }).click()
  await expect(page.locator('[data-timer-state]')).toHaveAttribute('data-timer-state', 'running')
})
