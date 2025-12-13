import { SoundEngine } from './SoundEngine'
import { SoundDurationMs, SoundFrequencyHz, SoundGain, SoundWaveform } from './enums'

export const playCountdownBeep = (secondsLeft: number): void => {
  if (!Number.isInteger(secondsLeft) || secondsLeft <= 0) {
    return
  }

  const engine = SoundEngine.getInstance()

  engine.playTone({
    frequencyHz: SoundFrequencyHz.CountdownBeep,
    durationMs: SoundDurationMs.CountdownBeep,
    type: SoundWaveform.Sine,
    gain: SoundGain.CountdownBeep,
  })
}

export const playStartBeep = (): void => {
  SoundEngine.getInstance().playTone({
    frequencyHz: SoundFrequencyHz.StartBeep,
    durationMs: SoundDurationMs.StartBeep,
    type: SoundWaveform.Triangle,
    gain: SoundGain.StartBeep,
  })
}

export const playFinishBeep = (): void => {
  const engine = SoundEngine.getInstance()
  engine.playTone({
    frequencyHz: SoundFrequencyHz.FinishBeepLow,
    durationMs: SoundDurationMs.FinishBeepLow,
    type: SoundWaveform.Triangle,
    gain: SoundGain.FinishBeep,
  })
  engine.playTone({
    frequencyHz: SoundFrequencyHz.FinishBeepHigh,
    durationMs: SoundDurationMs.FinishBeepHigh,
    type: SoundWaveform.Triangle,
    gain: SoundGain.FinishBeep,
    whenMs: SoundDurationMs.FinishSecondToneDelay,
  })
}

export const playIntervalStartBeep = (): void => {
  SoundEngine.getInstance().playTone({
    frequencyHz: SoundFrequencyHz.IntervalStartBeep,
    durationMs: SoundDurationMs.IntervalStartBeep,
    type: SoundWaveform.Square,
    gain: SoundGain.IntervalBeep,
  })
}

export const playIntervalEndBeep = (): void => {
  SoundEngine.getInstance().playTone({
    frequencyHz: SoundFrequencyHz.IntervalEndBeep,
    durationMs: SoundDurationMs.IntervalEndBeep,
    type: SoundWaveform.Square,
    gain: SoundGain.IntervalBeep,
  })
}

export const playTick = (): void => {
  SoundEngine.getInstance().playClick({ durationMs: SoundDurationMs.TickClick, gain: SoundGain.TickClick })
}
