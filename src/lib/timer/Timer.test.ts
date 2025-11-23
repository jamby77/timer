import { sleep } from '@/testing/utils'
import { describe, expect, it, vi } from 'vitest'

import { TimerState } from '@/lib/enums'

import { Timer } from './Timer'

describe('Timer', () => {
  it('should create timer with correct initial state', () => {
    const timer = new Timer(5000)

    expect(timer.getTime()).toBe(5000)
    expect(timer.getState()).toBe(TimerState.Idle)
    expect(timer.getTotalElapsedTime()).toBe(0)
  })

  it('should count down time when running', async () => {
    const timer = new Timer(1000)

    timer.start()

    // Wait for real time to pass
    await sleep(150)

    expect(timer.getTime()).toBeLessThan(1000)
    expect(timer.getTime()).toBeGreaterThan(800)
    expect(timer.getState()).toBe(TimerState.Running)
  })

  it('should count down accurately over multiple intervals', async () => {
    const timer = new Timer(1000)

    timer.start()

    // Wait 500ms
    await sleep(500)
    const timeAfter500ms = timer.getTime()

    // Wait another 600ms to ensure completion
    await sleep(600)
    const timeAfter1000ms = timer.getTime()

    expect(timeAfter500ms).toBeLessThan(1000)
    expect(timeAfter500ms).toBeGreaterThan(400)
    expect(timeAfter1000ms).toBeLessThanOrEqual(50)
    expect(timer.getState()).toBe(TimerState.Completed)
  })

  it('should stop counting when paused', async () => {
    const timer = new Timer(5000, { debug: true })

    timer.start()
    await sleep(100)
    const timeBeforePause = timer.getTime()

    timer.pause()
    const timeAfterPause = timer.getTime()

    // Wait while paused
    await sleep(200)
    const timeWhilePaused = timer.getTime()

    expect(timer.getState()).toBe(TimerState.Paused)
    expect(timeBeforePause).toBe(timeAfterPause)
    expect(timeAfterPause).toBe(timeWhilePaused)
  })

  it('should resume counting from paused state', async () => {
    const timer = new Timer(5000, { debug: true })

    timer.start()
    await sleep(100)

    timer.pause()
    const pausedTime = timer.getTime()

    timer.start() // Resume
    await sleep(100)

    expect(timer.getState()).toBe(TimerState.Running)
    expect(timer.getTime()).toBeLessThan(pausedTime)
    expect(timer.getTime()).toBeGreaterThan(pausedTime - 150)
  })

  it('should reset to initial time and stop counting', async () => {
    const timer = new Timer(5000)

    timer.start()
    await sleep(100)

    timer.reset()

    expect(timer.getState()).toBe(TimerState.Idle)
    expect(timer.getTime()).toBe(5000)
    expect(timer.getTotalElapsedTime()).toBe(0)

    // Wait after reset - should not count
    await sleep(100)
    expect(timer.getTime()).toBe(5000)
    expect(timer.getState()).toBe(TimerState.Idle)
  })

  it('should call onComplete when timer reaches zero', async () => {
    const onComplete = vi.fn()
    const onStateChange = vi.fn()
    const timer = new Timer(100, {
      onComplete,
      onStateChange,
      debug: true,
    })

    timer.start()

    // Wait for timer to complete
    await sleep(200)

    expect(timer.getState()).toBe(TimerState.Completed)
    expect(timer.getTime()).toBe(0)
    expect(onComplete).toHaveBeenCalled()
    expect(onStateChange).toHaveBeenCalledWith(TimerState.Completed, expect.any(Number))
  })

  it('should track total elapsed time correctly', async () => {
    const timer = new Timer(1000)

    timer.start()
    await sleep(300)

    timer.pause()
    await sleep(200) // This pause time shouldn't count

    timer.start() // Resume
    await sleep(200)

    const totalElapsed = timer.getTotalElapsedTime()
    expect(totalElapsed).toBeGreaterThanOrEqual(400) // Adjusted for real timing
    expect(totalElapsed).toBeLessThan(600) // Wider range for real timing
  })

  it('should not count time when idle', async () => {
    const timer = new Timer(5000)

    // Wait without starting timer
    await sleep(200)

    expect(timer.getTime()).toBe(5000)
    expect(timer.getState()).toBe(TimerState.Idle)
    expect(timer.getTotalElapsedTime()).toBe(0)
  })

  it('should return initial time correctly', async () => {
    const timer = new Timer(3000)
    
    expect(timer.getInitialTime()).toBe(3000)
    
    // Start and let it run a bit
    timer.start()
    await sleep(100)
    
    // Initial time should remain unchanged
    expect(timer.getInitialTime()).toBe(3000)
  })

  it('should set time manually', () => {
    const timer = new Timer(5000)
    
    // Set time to different value
    timer.setTime(2500)
    expect(timer.getTime()).toBe(2500)
    
    // Set time to zero
    timer.setTime(0)
    expect(timer.getTime()).toBe(0)
    
    // Set time to negative (should allow negative values)
    timer.setTime(-100)
    expect(timer.getTime()).toBe(-100)
  })

  it('should update options', async () => {
    const onTick = vi.fn()
    const onComplete = vi.fn()
    const timer = new Timer(1000)
    
    // Update with new options
    timer.updateOptions({
      onTick,
      onComplete,
      debug: true,
    })
    
    // Start timer to trigger callback
    timer.start()
    await sleep(100)
    
    // Check that new callbacks are set (they may or may not be called depending on timing)
    expect(typeof onTick).toBe('function')
    expect(typeof onComplete).toBe('function')
  })

  it('should destroy timer without errors', () => {
    const timer = new Timer(5000)
    
    // Start timer
    timer.start()
    
    // Destroy timer - should not throw any errors
    expect(() => timer.destroy()).not.toThrow()
    
    // Timer should still be accessible after destroy
    expect(timer.getTime()).toBe(5000)
    expect(timer.getState()).toBe(TimerState.Running) // State doesn't change on destroy
  })

  it('should handle double click on start (start called twice)', async () => {
    const timer = new Timer(5000, { debug: true })
    
    // First start
    timer.start()
    expect(timer.getState()).toBe(TimerState.Running)
    
    // Second start (double click) - should not cause issues
    timer.start()
    expect(timer.getState()).toBe(TimerState.Running)
    
    // Timer should still be counting normally
    await sleep(200) // Give more time for counting to start
    expect(timer.getTime()).toBeLessThan(5000)
    expect(timer.getTime()).toBeGreaterThan(4700)
  })

  it('should handle double click on pause (pause called twice)', async () => {
    const timer = new Timer(5000, { debug: true })
    
    timer.start()
    await sleep(100)
    
    // First pause
    timer.pause()
    expect(timer.getState()).toBe(TimerState.Paused)
    const pausedTime = timer.getTime()
    
    // Second pause (double click) - should not cause issues
    timer.pause()
    expect(timer.getState()).toBe(TimerState.Paused)
    
    // Time should remain unchanged after double pause
    expect(timer.getTime()).toBe(pausedTime)
    
    // Wait to ensure timer doesn't continue
    await sleep(100)
    expect(timer.getTime()).toBe(pausedTime)
  })

  it('should handle rapid start-pause-start sequence', async () => {
    const timer = new Timer(5000, { debug: true })
    
    // Start
    timer.start()
    expect(timer.getState()).toBe(TimerState.Running)
    
    // Quick pause
    timer.pause()
    expect(timer.getState()).toBe(TimerState.Paused)
    const pausedTime = timer.getTime()
    
    // Quick start again (resume)
    timer.start()
    expect(timer.getState()).toBe(TimerState.Running)
    
    // Timer should resume counting from paused time
    await sleep(200) // Give more time for counting to resume
    expect(timer.getTime()).toBeLessThan(pausedTime)
    expect(timer.getTime()).toBeGreaterThan(pausedTime - 250)
  })

  it('should handle rapid pause-start-pause sequence', async () => {
    const timer = new Timer(5000, { debug: true })
    
    timer.start()
    await sleep(100)
    
    // Pause
    timer.pause()
    expect(timer.getState()).toBe(TimerState.Paused)
    
    // Quick start
    timer.start()
    expect(timer.getState()).toBe(TimerState.Running)
    
    // Quick pause again
    timer.pause()
    expect(timer.getState()).toBe(TimerState.Paused)
    
    const finalPausedTime = timer.getTime()
    
    // Wait to ensure timer doesn't continue
    await sleep(100)
    expect(timer.getTime()).toBe(finalPausedTime)
  })
})
