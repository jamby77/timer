import { expect, test } from 'playwright/test'

import type { Page } from 'playwright/test'

async function saved(page: Page, name: string) {
  return page.evaluate(
    (name) =>
      Object.keys(localStorage)
        .filter((key) => key.startsWith('preset_'))
        .map((key) => JSON.parse(localStorage.getItem(key)!))
        .find((preset) => preset.name === name),
    name
  )
}
for (const [type, field] of [
  ['Stopwatch', 'timeLimit'],
  ['Work/Rest Ratio', 'maxWorkTime'],
]) {
  test(`${type} clears its limit and preserves that through save and reload`, async ({ page }) => {
    await page.goto('/configure')
    await page.getByRole('heading', { name: type, exact: true }).click()
    const workRest = type === 'Work/Rest Ratio'
    if (workRest) {
      await page.getByRole('radio', { name: 'Fixed rest' }).click()
      await page.locator('input[name=seconds]').first().pressSequentially('05')
      await page.getByLabel('Max rounds').selectOption('2')
    }
    const limit = page.locator('input[name=seconds]').nth(workRest ? 1 : 0)
    await limit.press('ArrowUp')
    await expect(limit).toHaveValue('01')
    await page.getByLabel(/Timer Name/).fill(`Limited ${type}`)
    await page.getByRole('button', { name: 'Save as Preset' }).click()
    expect((await saved(page, `Limited ${type}`)).config[field]).toBe(1)
    await page.getByLabel(/Timer Name/).fill(`Cleared ${type}`)
    await limit.press('ArrowDown')
    await expect(limit).toHaveValue('00')
    await page.getByRole('button', { name: 'Save as Preset' }).click()
    const cleared = await saved(page, `Cleared ${type}`)
    expect(cleared).toBeDefined()
    expect(cleared.config).not.toHaveProperty(field)
    await page.goto('/configure?tab=presets')
    await page.reload()
    await page.getByRole('heading', { name: `Cleared ${type}`, exact: true }).click()
    await expect(page.locator('input[name=seconds]').nth(workRest ? 1 : 0)).toHaveValue('00')
    expect((await saved(page, `Cleared ${type}`)).config).not.toHaveProperty(field)
    expect((await saved(page, `Limited ${type}`)).config[field]).toBe(1)
    await page.getByRole('button', { name: 'Start Timer', exact: true }).click()
    await page
      .getByRole('button', { name: workRest ? 'Start work' : 'Start timer', exact: true })
      .click()
    await page.waitForTimeout(1300)
    await expect(page.locator('[data-timer-state]')).toHaveAttribute('data-timer-state', 'running')
    if (workRest)
      await expect(
        page.getByRole('button', { name: 'Finish work / Start rest', exact: true })
      ).toBeEnabled()
  })
}
for (const type of ['Countdown', 'Stopwatch']) {
  test(`${type} saves and reloads the bound displayed by the picker`, async ({ page }) => {
    await page.goto('/configure')
    await page.getByRole('heading', { name: type, exact: true }).click()
    const name = `Bounded ${type}`
    await page.getByLabel(/Timer Name/).fill(name)
    if (type === 'Countdown') {
      const seconds = page.locator('input[name=seconds]')
      await seconds.press('ArrowUp')
      await seconds.press('ArrowDown')
      await expect(seconds).toHaveValue('01')
    } else {
      await page.locator('input[name=hours]').pressSequentially('99')
      await expect(page.locator('input[name=hours]')).toHaveValue('24')
      await expect(page.locator('input[name=minutes]')).toHaveValue('00')
      await expect(page.locator('input[name=seconds]')).toHaveValue('00')
    }
    await page.getByRole('button', { name: 'Save as Preset' }).click()
    expect((await saved(page, name)).config[type === 'Countdown' ? 'duration' : 'timeLimit']).toBe(
      type === 'Countdown' ? 1 : 86400
    )
    await page.goto('/configure?tab=presets')
    await page.reload()
    await page.getByRole('heading', { name, exact: true }).click()
    await expect(
      page.locator(type === 'Countdown' ? 'input[name=seconds]' : 'input[name=hours]')
    ).toHaveValue(type === 'Countdown' ? '01' : '24')
  })
}
