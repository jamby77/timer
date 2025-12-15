import { SoundDurationMs, SoundFrequencyHz, SoundGain, SoundWaveform } from './enums'
import { SoundEngine } from './SoundEngine'

export const playCountdownBeep = (secondsLeft: number): void => {
  if (!Number.isInteger(secondsLeft) || secondsLeft <= 0) {
    return
  }

  const engine = SoundEngine.getInstance()

  engine.playTone({
    frequencyHz: SoundFrequencyHz.CountdownBeep,
    durationMs: SoundDurationMs.CountdownBeep,
    type: SoundWaveform.Square,
    gain: SoundGain.CountdownBeep,
  })
}

export const playStartBeep = (): void => {
  const engine = SoundEngine.getInstance()
  engine.playAirHorn({
    durationMs: Math.round(SoundDurationMs.FinishBeep / 4),
    gain: SoundGain.StartBeep,
  })
}

export const playFinishBeep = (): void => {
  const engine = SoundEngine.getInstance()

  engine.playAirHorn({
    durationMs: SoundDurationMs.FinishBeep,
    gain: SoundGain.FinishBeep,
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
  SoundEngine.getInstance().playClick({
    durationMs: SoundDurationMs.TickClick,
    gain: SoundGain.TickClick,
  })
}
