import { expect, test } from 'playwright/test'

for (const mode of ['audible', 'muted', 'disabled']) {
  test(`Countdown audio output is ${mode}`, async ({ page }) => {
    await page.addInitScript((mode) => {
      const outputState = { contexts: 0 }
      Object.assign(window, { outputState })
      const NativeAudioContext = window.AudioContext
      window.AudioContext = class extends NativeAudioContext {
        constructor(options?: AudioContextOptions) {
          super(options)
          outputState.contexts++
        }
      }
      const samples: { time: number; peak: number }[] = []
      Object.assign(window, { outputSamples: samples })
      const connect = AudioNode.prototype.connect
      AudioNode.prototype.connect = function (this: AudioNode, ...args: unknown[]) {
        const result = Reflect.apply(connect, this, args)
        if (args[0] instanceof AudioDestinationNode) {
          const analyser = this.context.createAnalyser()
          analyser.fftSize = 2048
          Reflect.apply(connect, this, [analyser])
          const data = new Float32Array(analyser.fftSize)
          const context = this.context
          const sample = () => {
            analyser.getFloatTimeDomainData(data)
            let peak = 0
            for (const value of data) peak = Math.max(peak, Math.abs(value))
            samples.push({ time: context.currentTime, peak })
            requestAnimationFrame(sample)
          }
          sample()
        }
        return result
      } as typeof AudioNode.prototype.connect
      localStorage.setItem(
        'timer_audio-output',
        JSON.stringify({
          id: 'audio-output',
          name: 'Audio output verification',
          type: 'COUNTDOWN',
          duration: 4,
          countdownBeforeStart: 0,
          sound: {
            enabled: mode !== 'disabled',
            volume: mode === 'muted' ? 0 : 0.5,
            countdownBeeps: 1,
          },
        })
      )
    }, mode)
    await page.goto('/?id=audio-output')
    await page.getByRole('button', { name: 'Start timer', exact: true }).click()
    await expect(page.locator('[data-timer-state]')).toHaveAttribute('data-timer-state', 'running')
    await expect(page.locator('[data-timer-state]')).toHaveAttribute(
      'data-timer-state',
      'completed',
      { timeout: 6000 }
    )
    await page.waitForTimeout(1700)
    const samples = await page.evaluate(
      () => (window as unknown as { outputSamples: { time: number; peak: number }[] }).outputSamples
    )
    const contexts = await page.evaluate(
      () => (window as unknown as { outputState: { contexts: number } }).outputState.contexts
    )
    expect(contexts).toBe(mode === 'disabled' ? 0 : 1)
    if (mode === 'disabled') {
      expect(samples).toEqual([])
      return
    }
    expect(samples.length).toBeGreaterThan(50)
    if (mode === 'muted') {
      expect(samples.every((sample) => sample.peak === 0)).toBe(true)
      return
    }
    for (const [from, to] of [
      [0, 0.8],
      [2.9, 3.6],
      [4, 5.7],
    ]) {
      expect(
        samples.some((sample) => sample.time >= from && sample.time <= to && sample.peak > 0.01)
      ).toBe(true)
    }
    expect(
      samples
        .filter((sample) => sample.time > 1 && sample.time < 2.5)
        .every((sample) => sample.peak < 0.0001)
    ).toBe(true)
  })
}
