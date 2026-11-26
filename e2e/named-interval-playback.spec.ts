import { expect, test, type Page } from 'playwright/test'

test.use({ viewport: { width: 320, height: 640 }, isMobile: true, hasTouch: true })

const interval = {
  id: 'named', type: 'INTERVAL', name: 'Circuit', intervals: 3,
  workDuration: 45, restDuration: 15, roundNames: ['Row', 'Bike', 'Run'],
}
const button = (page: Page, name: string) => page.getByRole('button', { name, exact: true })
const subtitle = (page: Page) => page.locator('[data-slot=card-description]')

async function seed(page: Page, config: typeof interval | Record<string, unknown>) {
  await page.clock.install({ time: new Date('2026-01-01T12:00:00Z') })
  await page.clock.pauseAt(new Date('2026-01-01T12:01:00Z'))
  await page.addInitScript(config => {
    localStorage.setItem('theme', 'dark')
    localStorage.setItem('timer_named', JSON.stringify(config))
    localStorage.setItem('preset_named', JSON.stringify({
      id: 'named', name: 'Circuit', description: '', isBuiltIn: false, config,
    }))
  }, config)
}

test('names follow work, rest, pause, resume, reload, completion and restart', async ({ page }) => {
  await seed(page, interval)
  await page.goto('/?id=named')
  const check = async (name: string, round: number, step: string) => {
    await expect(subtitle(page)).toHaveText(`${name} · ${round} of 3 rounds`)
    await expect(page.locator('[data-slot=card-title]')).toHaveText('Circuit · ' + step)
  }
  const skip = () => button(page, 'Skip current interval').tap()
  await button(page, 'Start intervals').tap()
  await check('Row', 1, 'Work')
  await skip()
  await check('Row', 1, 'Rest')
  await skip()
  await check('Bike', 2, 'Work')
  await skip()
  await check('Bike', 2, 'Rest')
  await button(page, 'Pause intervals').tap()
  await check('Bike', 2, 'Rest')
  await button(page, 'Resume intervals').tap()
  await page.reload()
  await button(page, 'Resume').tap()
  await check('Bike', 2, 'Rest')
  await skip()
  await check('Run', 3, 'Work')
  await skip()
  await expect(subtitle(page)).toHaveText('Run · 3 of 3 rounds')
  await button(page, 'Restart intervals').tap()
  await check('Row', 1, 'Work')
})

test('a long round name stays accessible and preserves the count, digits and controls', async ({ page }) => {
  const long = 'AlternatingSingleArmKettlebellSwingsAndOverheadCarries'
  await seed(page, { ...interval, roundNames: ['', long] })
  await page.goto('/?id=named')
  await button(page, 'Start intervals').tap()
  await expect(subtitle(page)).toHaveText('1 of 3 rounds')
  const boxes = () => Promise.all([
    page.locator('[data-slot=card-content] .font-mono').boundingBox(),
    page.locator('[data-slot=card-footer]').boundingBox(),
    button(page, 'Skip current interval').boundingBox(),
  ])
  const before = await boxes()
  await button(page, 'Skip current interval').tap()
  await button(page, 'Skip current interval').tap()
  await expect(subtitle(page)).toMatchAriaSnapshot(`- text: /${long}/`)
  expect(await subtitle(page).getByText(long, { exact: true }).evaluate(el => el.scrollWidth > el.clientWidth)).toBe(true)
  const count = await subtitle(page).getByText(/2 of 3 rounds/).boundingBox()
  expect(count!.x + count!.width).toBeLessThanOrEqual(320)
  expect(await boxes()).toEqual(before)
})

test('EMOM catches up directly to the next named minute on returning to a frozen page', async ({ page, context }) => {
  await seed(page, { ...interval, name: 'EMOM', workDuration: 60, restDuration: 0, skipLastRest: false })
  await page.goto('/?id=named')
  await button(page, 'Start intervals').tap()
  const session = await context.newCDPSession(page)
  const started = await page.evaluate(() => Date.now())
  await session.send('Page.setWebLifecycleState', { state: 'frozen' })
  try {
    await page.clock.setSystemTime(started + 122000)
  } finally {
    await session.send('Page.setWebLifecycleState', { state: 'active' })
  }
  await page.clock.runFor(150)
  await expect(subtitle(page)).toHaveText('Run · 3 of 3 rounds')
  await expect(page.locator('[data-slot=card-title]')).toHaveText('EMOM · Work')
  await expect(page.locator('[data-slot=card-content]')).toContainText('00:57')
})

test('skipping a named EMOM minute starts the next exercise without a rest step', async ({ page }) => {
  await seed(page, { ...interval, name: 'EMOM', workDuration: 60, restDuration: 0, skipLastRest: false })
  await page.goto('/?id=named')
  await button(page, 'Start intervals').tap()
  await button(page, 'Skip current interval').tap()
  await expect(subtitle(page)).toHaveText('Bike · 2 of 3 rounds')
  await expect(page.locator('[data-slot=card-title]')).toHaveText('EMOM · Work')
})

test('EMOM recovery at the minute boundary previews and resumes the next round', async ({ page }) => {
  await seed(page, { ...interval, name: 'EMOM', workDuration: 60, restDuration: 0 })
  await page.goto('/?id=named')
  await button(page, 'Start intervals').tap()
  await page.clock.setSystemTime((await page.evaluate(() => Date.now())) + 60000)
  await page.reload()
  await expect(page.getByRole('region', { name: 'Resume timer?' })).toContainText('Round 2 · 01:00')
  await button(page, 'Resume').tap()
  await page.clock.runFor(50)
  await expect(subtitle(page)).toHaveText('Bike · 2 of 3 rounds')
})

test('Complex repeats retain the parent header and the timeline names individual rounds', async ({ page }) => {
  const config = { ...interval, workLabel: 'Effort', restLabel: 'Recover', roundNames: ['Row', '', 'Run'] }
  await seed(page, {
    id: 'named', name: 'Workout', type: 'COMPLEX',
    phases: [{ id: 'phase', name: 'Conditioning', order: 0, type: 'INTERVAL', config }],
    repeatGroups: [{ id: 'group', phaseIds: ['phase'], count: 2 }],
  })
  await page.goto('/?id=named')
  await button(page, 'Go to next phase').tap()
  await button(page, 'Start intervals').tap()
  await expect(subtitle(page)).toHaveText('Row · 1 of 3 rounds')
  await expect(page.getByText('Rep 2/2', { exact: true })).toBeVisible()
  await expect(page.getByTitle('Conditioning', { exact: true })).toBeVisible()

  await page.goto('/configure/complex?preset=named')
  await page.getByRole('tab', { name: 'Preview' }).tap()
  const panel = page.getByRole('tabpanel', { name: 'Preview' })
  await panel.getByRole('button', { name: /Repeat ×2/ }).tap()
  await panel.getByRole('button', { name: /Pass 1 of 2/ }).tap()
  await panel.getByRole('button', { name: /Conditioning/ }).tap()
  await expect(panel.getByText('Round 1 · Row', { exact: true })).toBeVisible()
  await expect(panel.getByText('Round 2', { exact: true })).toBeVisible()
  await expect(panel.getByText('Round 3 · Run', { exact: true })).toBeVisible()
  await expect(panel.getByText('Effort', { exact: true })).toHaveCount(3)
  await expect(panel.getByText('Recover', { exact: true })).toHaveCount(2)
})
