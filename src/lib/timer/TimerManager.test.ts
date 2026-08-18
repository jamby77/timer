import { sleep } from '@/testing/utils'
import { describe, expect, it, vi } from 'vitest'

import { StepState, TimerState } from '@/lib/enums'

import {
  type StepStateChangeCallback,
  TimerManager,
  type TimerStep,
} from './TimerManager'

function createStep(overrides: Partial<TimerStep> = {}): TimerStep {
  return {
    duration: 200,
    label: 'Step',
    id: 'step-1',
    isWork: true,
    ...overrides,
  }
}

describe('TimerManager', () => {
  // --- Initialization ---

  it('should create with correct initial state', () => {
    const step = createStep()
    const manager = new TimerManager({ steps: [step] })

    expect(manager.getCurrentStep()).toEqual(step)
    expect(manager.getCurrentStepIndex()).toBe(0)
    expect(manager.getCurrentRepeat()).toBe(0)
    expect(manager.getTotalSteps()).toBe(1)
    expect(manager.isRunning()).toBe(false)
  })

  it('should return null for current step when no steps provided', () => {
    const manager = new TimerManager({ steps: [] })
    expect(manager.getCurrentStep()).toBeNull()
    expect(manager.getTotalSteps()).toBe(0)
  })

  it('should store a copy of steps', () => {
    const steps = [createStep()]
    const manager = new TimerManager({ steps })
    const returned = manager.getSteps()
    expect(returned).toEqual(steps)
    expect(returned).not.toBe(steps) // should be a copy
  })

  // --- Start / Pause ---

  it('should start and be running', () => {
    const manager = new TimerManager({ steps: [createStep()] })
    manager.start()
    expect(manager.isRunning()).toBe(true)
  })

  it('should ignore duplicate start calls', () => {
    const onStepChange = vi.fn()
    const manager = new TimerManager({
      steps: [createStep()],
      onStepChange,
    })
    manager.start()
    manager.start()
    // onStepChange should only be called once (on first start)
    expect(onStepChange).toHaveBeenCalledTimes(1)
  })

  it('should pause and stop running', () => {
    const manager = new TimerManager({ steps: [createStep()] })
    manager.start()
    manager.pause()
    expect(manager.isRunning()).toBe(false)
  })

  it('should resume after pause', async () => {
    const manager = new TimerManager({
      steps: [createStep({ duration: 1000 })],
    })

    manager.start()
    await sleep(50)
    manager.pause()
    expect(manager.isRunning()).toBe(false)

    manager.start() // resume
    expect(manager.isRunning()).toBe(true)
    manager.pause()
    expect(manager.isRunning()).toBe(false)
  })

  // --- Step progression ---

  it('should call onStepChange when starting', () => {
    const onStepChange = vi.fn()
    const step = createStep()
    const manager = new TimerManager({ steps: [step], onStepChange })

    manager.start()
    expect(onStepChange).toHaveBeenCalledWith(step, 0)
  })

  it('should advance to next step after completion', async () => {
    const onStepChange = vi.fn()
    const step1 = createStep({ id: 'step-1', label: 'Step 1', duration: 100 })
    const step2 = createStep({ id: 'step-2', label: 'Step 2', duration: 100 })

    const manager = new TimerManager({
      steps: [step1, step2],
      repeat: 1,
      onStepChange,
    })

    manager.start()
    // Wait for step 1 to complete and step 2 to start
    await sleep(200)

    expect(onStepChange).toHaveBeenCalledWith(step1, 0)
    expect(onStepChange).toHaveBeenCalledWith(step2, 1)
    expect(manager.getCurrentStepIndex()).toBe(1)
  })

  it('should call step onStart callback', () => {
    const onStart = vi.fn()
    const step = createStep({ onStart })
    const manager = new TimerManager({ steps: [step] })

    manager.start()
    expect(onStart).toHaveBeenCalledTimes(1)
  })

  it('should call step onComplete callback when step finishes', async () => {
    const onComplete = vi.fn()
    const step = createStep({ duration: 100, onComplete })

    const manager = new TimerManager({ steps: [step], repeat: 1 })
    manager.start()
    await sleep(200)

    expect(onComplete).toHaveBeenCalledTimes(1)
  })

  // --- onStepStateChange ---

  it('should fire StepState.Start when step begins', () => {
    const onStepStateChange = vi.fn<StepStateChangeCallback>()
    const step = createStep({ onStepStateChange })
    const manager = new TimerManager({ steps: [step] })

    manager.start()
    expect(onStepStateChange).toHaveBeenCalledWith(
      StepState.Start,
      expect.objectContaining({ index: 0, elapsed: 0 })
    )
  })

  it('should fire StepState.Pause with elapsed time', async () => {
    const onStepStateChange = vi.fn<StepStateChangeCallback>()
    const step = createStep({ duration: 500, onStepStateChange })
    const manager = new TimerManager({ steps: [step] })

    manager.start()
    await sleep(100)
    manager.pause()

    const pauseCall = onStepStateChange.mock.calls.find(
      ([state]) => state === StepState.Pause
    )
    expect(pauseCall).toBeDefined()
    expect(pauseCall![1].elapsed).toBeGreaterThan(0)
  })

  it('should fire StepState.Resume when resuming', async () => {
    const onStepStateChange = vi.fn<StepStateChangeCallback>()
    const step = createStep({ duration: 500, onStepStateChange })
    const manager = new TimerManager({ steps: [step] })

    manager.start()
    await sleep(50)
    manager.pause()
    manager.start() // resume

    const resumeCall = onStepStateChange.mock.calls.find(
      ([state]) => state === StepState.Resume
    )
    expect(resumeCall).toBeDefined()
  })

  it('should fire StepState.Complete when step finishes naturally', async () => {
    const onStepStateChange = vi.fn<StepStateChangeCallback>()
    const step = createStep({ duration: 100, onStepStateChange })

    const manager = new TimerManager({ steps: [step], repeat: 1 })
    manager.start()
    await sleep(200)

    const completeCall = onStepStateChange.mock.calls.find(
      ([state]) => state === StepState.Complete
    )
    expect(completeCall).toBeDefined()
  })

  // --- Skip ---

  it('should skip current step and advance to next', async () => {
    const onStepChange = vi.fn()
    const onStepStateChange = vi.fn<StepStateChangeCallback>()
    const step1 = createStep({
      id: 'step-1',
      label: 'Step 1',
      duration: 1000,
      onStepStateChange,
    })
    const step2 = createStep({ id: 'step-2', label: 'Step 2', duration: 1000 })

    const manager = new TimerManager({
      steps: [step1, step2],
      repeat: 1,
      onStepChange,
    })

    manager.start()
    await sleep(50)
    manager.skipCurrentStep()

    // Should fire Skip state change with elapsed time
    const skipCall = onStepStateChange.mock.calls.find(
      ([state]) => state === StepState.Skip
    )
    expect(skipCall).toBeDefined()
    expect(skipCall![1].elapsed).toBeGreaterThan(0)

    // Should advance to step 2
    expect(manager.getCurrentStepIndex()).toBe(1)
    expect(onStepChange).toHaveBeenCalledWith(step2, 1)
  })

  it('should ignore skip when not running', () => {
    const step = createStep()
    const manager = new TimerManager({ steps: [step] })

    // Not started, skip should be a no-op
    manager.skipCurrentStep()
    expect(manager.getCurrentStepIndex()).toBe(0)
  })

  // --- Sequence completion ---

  it('should call onSequenceComplete after all steps finish (repeat=1)', async () => {
    const onSequenceComplete = vi.fn()
    const step = createStep({ duration: 100 })

    const manager = new TimerManager({
      steps: [step],
      repeat: 1,
      onSequenceComplete,
    })

    manager.start()
    await sleep(200)

    expect(onSequenceComplete).toHaveBeenCalledTimes(1)
    expect(manager.isRunning()).toBe(false)
  })

  it('should repeat sequence when repeat > 1', async () => {
    const onStepChange = vi.fn()
    const onSequenceComplete = vi.fn()
    const step = createStep({ duration: 100 })

    const manager = new TimerManager({
      steps: [step],
      repeat: 2,
      onStepChange,
      onSequenceComplete,
    })

    manager.start()
    // Wait for 2 repeats to complete
    await sleep(350)

    // Step should have been started twice (once per repeat)
    expect(onStepChange).toHaveBeenCalledTimes(2)
    expect(onSequenceComplete).toHaveBeenCalledTimes(1)
  })

  it('should repeat infinitely when repeat=0', async () => {
    const onStepChange = vi.fn()
    const onSequenceComplete = vi.fn()
    const step = createStep({ duration: 100 })

    const manager = new TimerManager({
      steps: [step],
      repeat: 0, // infinite
      onStepChange,
      onSequenceComplete,
    })

    manager.start()
    await sleep(350)
    manager.pause()

    // Should have looped multiple times
    expect(onStepChange.mock.calls.length).toBeGreaterThanOrEqual(2)
    // Should NOT have called onSequenceComplete
    expect(onSequenceComplete).not.toHaveBeenCalled()
  })

  // --- Reset ---

  it('should reset to initial state', async () => {
    const step1 = createStep({ id: 'step-1', duration: 500 })
    const step2 = createStep({ id: 'step-2', duration: 500 })

    const manager = new TimerManager({
      steps: [step1, step2],
      repeat: 1,
    })

    manager.start()
    await sleep(50)

    manager.reset()

    expect(manager.isRunning()).toBe(false)
    expect(manager.getCurrentStepIndex()).toBe(0)
    expect(manager.getCurrentRepeat()).toBe(0)
  })

  // --- onTick ---

  it('should call onTick with current step info', async () => {
    const onTick = vi.fn()
    const step = createStep({ duration: 500 })

    const manager = new TimerManager({
      steps: [step],
      onTick,
    })

    manager.start()
    await sleep(200)
    manager.pause()

    expect(onTick).toHaveBeenCalled()
    const [time, totalElapsed, tickStep] = onTick.mock.calls[0]
    expect(time).toBeLessThan(500)
    expect(totalElapsed).toBeGreaterThan(0)
    expect(tickStep).toEqual(step)
  })

  // --- Multi-step sequence ---

  it('should run a full work/rest sequence', async () => {
    const onStepChange = vi.fn()
    const onSequenceComplete = vi.fn()

    const workStep = createStep({
      id: 'work',
      label: 'Work',
      duration: 100,
      isWork: true,
    })
    const restStep = createStep({
      id: 'rest',
      label: 'Rest',
      duration: 100,
      isWork: false,
    })

    const manager = new TimerManager({
      steps: [workStep, restStep],
      repeat: 1,
      onStepChange,
      onSequenceComplete,
    })

    manager.start()
    await sleep(350)

    expect(onStepChange).toHaveBeenCalledWith(workStep, 0)
    expect(onStepChange).toHaveBeenCalledWith(restStep, 1)
    expect(onSequenceComplete).toHaveBeenCalledTimes(1)
    expect(manager.isRunning()).toBe(false)
  })
})
