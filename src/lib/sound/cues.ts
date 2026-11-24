import { SoundDurationMs, SoundFrequencyHz, SoundGain, SoundWaveform } from './enums'
import { SoundEngine } from './SoundEngine'

export const playCountdownBeep = (secondsLeft: number): void => {
  if (!Number.isInteger(secondsLeft) || secondsLeft <= 0) {
    return
  }

  SoundEngine.getInstance().playSampleCue('countdown', SoundGain.CountdownBeep)
}

export const playStartBeep = (): void => {
  SoundEngine.getInstance().playSampleCue('start', SoundGain.StartBeep)
}

export const playFinishBeep = (): void => {
  SoundEngine.getInstance().playSampleCue('finish', SoundGain.FinishBeep)
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
