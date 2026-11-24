import { expect, test } from 'playwright/test'

for (const complex of [false, true]) {
  test(`Work/Rest completion horn only plays after the final round ${complex ? 'inside complex' : 'standalone'}`, async ({
    page,
  }) => {
    await page.addInitScript((complex) => {
      const horns: { duration: number; state: string }[] = []
      Object.assign(window, { workRestHorns: horns })
      const startSample = AudioBufferSourceNode.prototype.start
      AudioBufferSourceNode.prototype.start = function (...args) {
        if (this.buffer && this.buffer.duration > 1) {
          horns.push({ duration: this.buffer.duration, state: this.context.state })
        }
        return startSample.apply(this, args)
      }
      const config = {
        id: 'sound-rounds',
        name: 'Two audible rounds',
        type: 'WORKREST',
        maxRounds: 2,
        maxWorkTime: 3,
        restMode: 'fixed',
        fixedRestDuration: 3,
        countdownBeforeStart: 0,
        sound: { enabled: true, volume: 0.3, countdownBeeps: 1 },
      }
      localStorage.setItem(
        'timer_sound-rounds',
        JSON.stringify(
          complex
            ? {
                id: 'sound-rounds',
                name: 'Sound workout',
                type: 'COMPLEX',
                autoAdvance: true,
                phases: [{ id: 'work', name: 'Two rounds', type: 'WORKREST', order: 0, config }],
              }
            : config
        )
      )
    }, complex)
    await page.goto('/?id=sound-rounds')
    const horns = () =>
      page.evaluate(
        () =>
          (
            window as unknown as {
              workRestHorns: { duration: number; state: string }[]
            }
          ).workRestHorns
      )
    await page.getByRole('button', { name: 'Start work', exact: true }).click()
    await expect.poll(async () => (await horns()).length).toBe(1)
    await expect(page.getByText('Round 2 of 2', { exact: true })).toBeVisible({ timeout: 8000 })
    await expect(page.locator('[data-timer-state]')).toHaveAttribute('data-timer-state', 'idle')
    await page.waitForTimeout(100)
    expect(await horns()).toHaveLength(1)
    await page.getByRole('button', { name: 'Start work', exact: true }).click()
    await expect.poll(async () => (await horns()).length).toBe(2)
    await expect(page.locator('[data-timer-state]')).toHaveAttribute(
      'data-timer-state',
      'completed',
      { timeout: 8000 }
    )
    await expect.poll(async () => (await horns()).length).toBe(3)
    const emitted = await horns()
    expect(emitted.every((horn) => horn.state === 'running')).toBe(true)
    expect(emitted[0].duration).toBeCloseTo(1.027, 2)
    expect(emitted[1].duration).toBeCloseTo(1.027, 2)
    expect(emitted[2].duration).toBeCloseTo(1.61, 2)
    await page.waitForTimeout(200)
    expect(await horns()).toHaveLength(3)
  })
}
