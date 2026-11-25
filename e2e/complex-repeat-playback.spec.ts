import { expect, test, type Page } from 'playwright/test'

const countdown = { id: 'row', name: 'Row', type: 'COUNTDOWN', duration: 2 }
const rest = { id: 'rest', name: 'Rest', type: 'COUNTDOWN', duration: 1 }
const cooldown = { id: 'cooldown', name: 'Cooldown', type: 'COUNTDOWN', duration: 60 }
const tabata = { id: 'tabata', name: 'Tabata', type: 'INTERVAL', workDuration: 20, restDuration: 10, intervals: 8 }

async function openWorkout(page: Page, members: (typeof countdown | typeof tabata)[], autoAdvance: boolean) {
  const timer = {
    id: 'repeat', name: 'Circuit', type: 'COMPLEX', autoAdvance,
    phases: [...members, cooldown].map((config, order) => ({ ...config, order, config })),
    repeatGroups: [{ id: 'set', phaseIds: members.map(member => member.id), count: 4 }],
  }
  await page.clock.install({ time: new Date('2026-01-01T12:00:00Z') })
  await page.clock.pauseAt(new Date('2026-01-01T12:01:00Z'))
  await page.addInitScript(timer => localStorage.setItem('timer_repeat', JSON.stringify(timer)), timer)
  await page.goto('/?id=repeat')
}

const button = (page: Page, name: string) => page.getByRole('button', { name, exact: true })

test('manual completion, previous, next and restart respect the current pass', async ({ page }) => {
  await openWorkout(page, [countdown, rest], false)
  await expect(page.getByText('Rep 1/4', { exact: true })).toBeVisible()
  await button(page, 'Go to next phase').click()
  await button(page, 'Start timer').click()
  await page.clock.runFor(1100)
  await expect(page.getByText('Complete', { exact: true })).toBeVisible()
  await expect(page.getByText('Next: Row')).toBeVisible()
  await button(page, 'Go to next phase').click()
  await expect(page.getByText('Rep 2/4', { exact: true })).toBeVisible()
  await expect(page.locator('[data-slot=card-header]')).toMatchAriaSnapshot(`
    - text: /Phase 3.9/
  `)
  await button(page, 'Start timer').click()
  await page.clock.runFor(2100)
  await button(page, 'Restart timer').click()
  await expect(page.getByText('Rep 2/4', { exact: true })).toBeVisible()
  await expect(button(page, 'Pause timer')).toBeVisible()
  await button(page, 'Go to previous phase').click()
  await expect(page.getByText('Rep 1/4', { exact: true })).toBeVisible()
  await expect(page.getByTitle('Rest', { exact: true })).toBeVisible()
  await button(page, 'Restart from first phase').click()
  await expect(page.getByTitle('Row', { exact: true })).toBeVisible()
  await expect(button(page, 'Go to previous phase')).toBeDisabled()
})

test('background catch-up crosses single-phase passes and starts the following phase once', async ({ page, context }) => {
  await openWorkout(page, [countdown], true)
  await button(page, 'Start timer').click()
  await page.clock.runFor(2100)
  await expect(page.getByText('Rep 2/4', { exact: true })).toBeVisible()
  const cdp = await context.newCDPSession(page)
  const left = await page.evaluate(() => Date.now())
  await cdp.send('Page.setWebLifecycleState', { state: 'frozen' })
  try {
    await page.clock.setSystemTime(left + 9000)
  } finally {
    await cdp.send('Page.setWebLifecycleState', { state: 'active' })
  }
  await page.clock.runFor(400)
  await expect(page.getByText('Phase 5/5', { exact: true })).toBeVisible()
  await expect(page.locator('[data-slot=card-content]')).toContainText('00:56')
  await expect(button(page, 'Go to next phase')).toBeDisabled()
})

test('reload restores the third Tabata pass and its internal interval round', async ({ page }) => {
  await openWorkout(page, [tabata], false)
  await button(page, 'Go to next phase').click()
  await button(page, 'Go to next phase').click()
  await button(page, 'Start intervals').click()
  await page.clock.fastForward(30500)
  await page.clock.runFor(100)
  await expect(page.getByText('Rep 3/4', { exact: true })).toBeVisible()
  await expect(page.locator('[data-slot=card-header]')).toContainText('2 of 8 rounds')
  await page.reload()
  await expect(page.getByRole('region', { name: 'Resume timer?' })).toContainText('Tabata · Rep 3/4 · Round 2')
  await button(page, 'Resume').click()
  await expect(page.getByText('Rep 3/4', { exact: true })).toBeVisible()
  await expect(page.locator('[data-slot=card-header]')).toContainText('2 of 8 rounds')
  await expect(page.locator('[data-slot=card-content]')).toContainText('00:19')
})

for (const viewport of [{ width: 320, height: 640 }, { width: 667, height: 375 }]) {
  test(`repeat counter preserves digit and control positions at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport)
    const bike = { ...countdown, id: 'bike', name: 'Bike' }
    await openWorkout(page, [countdown, rest, bike, { ...rest, id: 'rest-2' }], true)
    for (let i = 0; i < 4; i++) await button(page, 'Go to next phase').click()
    await button(page, 'Start timer').click()
    await expect(page.getByText('Rep 2/4', { exact: true })).toBeVisible()
    const counter = page.getByText('Rep 2/4', { exact: true })
    const positions = () => Promise.all([
      page.locator('[data-slot=card-content] .font-mono').boundingBox(),
      page.locator('[data-slot=card-footer]').boundingBox(),
    ])
    const repeated = await positions()
    await counter.evaluate(element => { element.parentElement!.textContent = 'Phase 5/17' })
    expect(await positions()).toEqual(repeated)
  })
}
