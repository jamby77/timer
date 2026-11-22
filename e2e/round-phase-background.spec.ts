import { expect, test } from 'playwright/test'

test.use({ viewport: { width: 320, height: 640 }, isMobile: true, hasTouch: true })

const workRest = {
  type: 'WORKREST',
  maxRounds: 3,
  maxWorkTime: 3,
  restMode: 'fixed',
  fixedRestDuration: 2,
  autoContinue: true,
}
const steps = [
  { type: 'COUNTDOWN', duration: 2 },
  { ...workRest, maxRounds: 1 },
  { type: 'INTERVAL', workDuration: 2, restDuration: 1, intervals: 2, skipLastRest: true },
  { type: 'STOPWATCH', timeLimit: 5, countdownBeforeStart: 3 },
]
const complex = {
  type: 'COMPLEX',
  overallTimeLimit: 120,
  autoAdvance: true,
  phases: steps.map((config, order) => ({
    config: { ...config, id: String(order), name: config.type },
    type: config.type,
    order,
    name: 'Stage ' + (order + 1),
    id: 'stage-' + order,
  })),
}

for (const [title, config, gap, status, digits] of [
  ['fixed rest', workRest, 9000, 'Rest · Round 2 of 3', '00:00'],
  [
    'ratio work',
    { ...workRest, restMode: 'ratio', fixedRestDuration: undefined, ratio: 2 },
    10000,
    'Work · Round 2 of 3',
    '00:01',
  ],
  ['completed rounds', workRest, 20000, 'Complete', '00:00'],
  ['manual round', { ...workRest, autoContinue: false }, 20000, 'Ready for next round', '00:00'],
  ['nested interval', complex, 8000, 'Phase 3/4', '00:00'],
  ['final stopwatch', complex, 16000, 'Phase 4/4', '00:01'],
  ['completed phases', complex, 25000, 'Complete', '00:05'],
  ['paused work', workRest, 25000, 'Paused', '00:00'],
  ['paused phase', complex, 25000, 'Paused', '00:01'],
  ['manual phase', { ...complex, autoAdvance: false }, 25000, 'Phase 1/4', '00:00'],
] as const) {
  test('background catch-up: ' + title, async ({ page, context }) => {
    await page.clock.install({ time: new Date('2026-01-01T12:00:00Z') })
    await page.clock.pauseAt(new Date('2026-01-01T12:01:00Z'))
    await page.addInitScript(
      (config) =>
        localStorage.setItem(
          'timer_gap',
          JSON.stringify({
            ...config,
            id: 'gap',
            name: 'Background',
            sound: { enabled: false, volume: 0 },
          })
        ),
      config
    )
    await page.goto('/?id=gap')
    await page
      .getByRole('button', {
        name: config.type === 'COMPLEX' ? 'Start timer' : 'Start work',
        exact: true,
      })
      .tap()
    await page.clock.runFor(200)
    if (title.startsWith('paused')) {
      await page
        .getByRole('button', {
          name: config.type === 'COMPLEX' ? 'Pause timer' : 'Pause work',
          exact: true,
        })
        .tap()
    }
    const session = await context.newCDPSession(page)
    const leftAt = await page.evaluate(() => Date.now())
    await session.send('Page.setWebLifecycleState', { state: 'frozen' })
    try {
      await page.clock.setSystemTime(leftAt + gap)
    } finally {
      await session.send('Page.setWebLifecycleState', { state: 'active' })
    }
    await page.clock.runFor(400)
    await expect(page.locator('[data-slot="card-header"]')).toContainText(status, { timeout: 1500 })
    await expect(page.locator('[data-slot="card-content"]')).toContainText(digits)
    if (title === 'completed phases')
      await expect(page.getByLabel('Overall timer time')).toContainText('00:17 /')
    if (title === 'final stopwatch')
      await expect(page.getByLabel('Overall timer time')).toContainText('00:13 /')
  })
}
