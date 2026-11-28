import { expect, test } from 'playwright/test'

for (const setting of ['pre-start countdown', 'sound']) {
  test(`changing ${setting} preserves both timers and their history`, async ({ page }) => {
    const ids: string[] = []
    for (const variant of [0, 1]) {
      await page.goto('/configure')
      await page.getByRole('heading', { name: 'Countdown', exact: true }).click()
      await page.getByLabel(/Timer Name/).fill('Identity check')
      await page.locator('input[name=seconds]').fill('30')
      await page.getByRole('switch', { name: 'Sounds' }).setChecked(setting === 'sound' && variant === 1)
      if (setting === 'pre-start countdown') {
        await page.getByLabel('Pre-start countdown', { exact: true }).selectOption(variant === 0 ? '1' : '3')
      }
      await page.getByRole('button', { name: 'Start Timer', exact: true }).click()
      await expect(page).toHaveURL(/\/\?id=/)
      ids.push(new URL(page.url()).searchParams.get('id')!)
    }
    expect(ids[0]).not.toBe(ids[1])
    const configs = await page.evaluate(ids => ids.map(id => JSON.parse(localStorage.getItem(`timer_${id}`)!)), ids)
    if (setting === 'sound') expect(configs.map(config => config.sound?.enabled ?? false)).toEqual([false, true])
    else expect(configs.map(config => config.countdownBeforeStart)).toEqual([1, 3])
    const history = await page.evaluate(() => JSON.parse(localStorage.getItem('recent_timers')!))
    expect(history.map((timer: { config: { id: string } }) => timer.config.id)).toEqual([...ids].reverse())
    for (const id of ids) {
      await page.goto(`/?id=${id}`)
      await page.reload()
      await page.getByRole('button', { name: 'Start timer', exact: true }).click()
      await expect(page.locator('[data-timer-state]')).toHaveAttribute('data-timer-state', 'running')
      await page.getByRole('button', { name: 'Stop timer', exact: true }).click()
      await page.getByRole('button', { name: 'End', exact: true }).click()
    }
    expect(await page.evaluate(ids => ids.map(id => JSON.parse(localStorage.getItem(`timer_${id}`)!)), ids)).toEqual(configs)
  })
}
