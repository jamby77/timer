import { sleep } from '@/testing/utils'
import { describe, expect, it, vi } from 'vitest'

import { TimerState } from '@/lib/enums'

import { Stopwatch } from './Stopwatch'

describe('Stopwatch', () => {
  // --- Initialization ---

  it('should create with correct initial state', () => {
    const sw = new Stopwatch()

    expect(sw.getElapsedTime()).toBe(0)
    expect(sw.getState()).toBe(TimerState.Idle)
    expect(sw.isRunning).toBe(false)
    expect(sw.formatTime()).toBe('00:00.00')
  })

  it('should auto-start when autoStart is true', async () => {
    const sw = new Stopwatch({ autoStart: true })

    expect(sw.isRunning).toBe(true)
    expect(sw.getState()).toBe(TimerState.Running)

    await sleep(150)
    expect(sw.getElapsedTime()).toBeGreaterThan(0)

    sw.destroy()
  })

  // --- Start / Pause ---

  it('should start and track elapsed time', async () => {
    const sw = new Stopwatch()
    sw.start()

    expect(sw.isRunning).toBe(true)

    await sleep(200)

    const elapsed = sw.getElapsedTime()
    expect(elapsed).toBeGreaterThan(100)
    expect(elapsed).toBeLessThan(400)

    sw.destroy()
  })

  it('should ignore start when already running', async () => {
    const sw = new Stopwatch()
    sw.start()
    await sleep(50)

    const elapsedBefore = sw.getElapsedTime()
    sw.start() // should be a no-op
    const elapsedAfter = sw.getElapsedTime()

    // Elapsed should not reset
    expect(elapsedAfter).toBeGreaterThanOrEqual(elapsedBefore)

    sw.destroy()
  })

  it('should pause and preserve elapsed time', async () => {
    const sw = new Stopwatch()
    sw.start()
    await sleep(150)

    sw.pause()
    expect(sw.isRunning).toBe(false)
    expect(sw.getState()).toBe(TimerState.Paused)

    const elapsedAtPause = sw.getElapsedTime()
    expect(elapsedAtPause).toBeGreaterThan(0)

    // Wait and verify time doesn't increase while paused
    await sleep(100)
    expect(sw.getElapsedTime()).toBe(elapsedAtPause)

    sw.destroy()
  })

  it('should resume after pause', async () => {
    const sw = new Stopwatch()
    sw.start()
    await sleep(100)

    sw.pause()
    const elapsedAtPause = sw.getElapsedTime()

    sw.start() // resume
    await sleep(100)

    expect(sw.isRunning).toBe(true)
    expect(sw.getElapsedTime()).toBeGreaterThan(elapsedAtPause)

    sw.destroy()
  })

  // --- Reset ---

  it('should reset to zero', async () => {
    const sw = new Stopwatch()
    sw.start()
    await sleep(150)

    sw.reset()

    expect(sw.getElapsedTime()).toBe(0)
    expect(sw.getState()).toBe(TimerState.Idle)
    expect(sw.isRunning).toBe(false)

    sw.destroy()
  })

  it('should allow restart after reset', async () => {
    const sw = new Stopwatch()
    sw.start()
    await sleep(100)
    sw.reset()

    sw.start()
    expect(sw.isRunning).toBe(true)
    await sleep(150)

    expect(sw.getElapsedTime()).toBeGreaterThan(0)
    expect(sw.getElapsedTime()).toBeLessThan(300)

    sw.destroy()
  })

  // --- Stop ---

  it('should stop and invoke onStop callback', async () => {
    const onStop = vi.fn()
    const sw = new Stopwatch({ onStop })

    sw.start()
    await sleep(150)
    sw.stop()

    expect(sw.isRunning).toBe(false)
    expect(onStop).toHaveBeenCalledTimes(1)
    expect(onStop.mock.calls[0][0]).toBeGreaterThan(0)

    sw.destroy()
  })

  it('should ignore stop when not running', () => {
    const onStop = vi.fn()
    const sw = new Stopwatch({ onStop })

    sw.stop()
    expect(onStop).not.toHaveBeenCalled()
  })

  // --- Time limit ---

  it('should auto-complete when reaching time limit', async () => {
    const onStop = vi.fn()
    const sw = new Stopwatch({
      timeLimitMs: 200,
      onStop,
    })

    sw.start()
    await sleep(350)

    expect(sw.isRunning).toBe(false)
    // onStop is called via the Timer's onComplete
    expect(onStop).toHaveBeenCalledTimes(1)

    sw.destroy()
  })

  it('should clamp elapsed time to time limit', async () => {
    const sw = new Stopwatch({ timeLimitMs: 200 })

    sw.start()
    await sleep(350)

    expect(sw.getElapsedTime()).toBeLessThanOrEqual(200)

    sw.destroy()
  })

  it('should ignore stop near time limit (100ms threshold)', async () => {
    const onStop = vi.fn()
    const sw = new Stopwatch({
      timeLimitMs: 250,
      onStop,
    })

    sw.start()
    // Wait until we're within 100ms of the limit
    await sleep(200)
    sw.stop()

    // stop() should be ignored because we're within the threshold
    // (the Timer's onComplete will handle the callback instead)
    expect(onStop).not.toHaveBeenCalled()

    sw.destroy()
  })

  // --- Callbacks ---

  it('should call onTick with elapsed time', async () => {
    const onTick = vi.fn()
    const sw = new Stopwatch({ onTick })

    sw.start()
    await sleep(200)
    sw.pause()

    expect(onTick).toHaveBeenCalled()
    // onTick receives elapsed time (increasing)
    const firstCall = onTick.mock.calls[0][0]
    expect(firstCall).toBeGreaterThan(0)

    sw.destroy()
  })

  it('should call onStateChange callback', async () => {
    const onStateChange = vi.fn()
    const sw = new Stopwatch({ onStateChange })

    sw.start()
    expect(onStateChange).toHaveBeenCalledWith(TimerState.Running)

    sw.pause()
    expect(onStateChange).toHaveBeenCalledWith(TimerState.Paused)

    sw.destroy()
  })

  // --- formatTime ---

  it('should format elapsed time correctly', async () => {
    const sw = new Stopwatch()
    expect(sw.formatTime()).toBe('00:00.00')

    sw.start()
    await sleep(1100)
    sw.pause()

    const formatted = sw.formatTime()
    // Should be around 00:01.XX
    expect(formatted).toMatch(/^00:01\.\d{2}$/)

    sw.destroy()
  })

  // --- Destroy ---

  it('should clean up on destroy', async () => {
    const sw = new Stopwatch()
    sw.start()
    await sleep(50)

    // Should not throw
    expect(() => sw.destroy()).not.toThrow()
  })
})
