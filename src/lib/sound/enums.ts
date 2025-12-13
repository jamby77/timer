export enum AudioContextState {
  Suspended = 'suspended',
  Running = 'running',
  Closed = 'closed',
}

export enum SoundWaveform {
  Sine = 'sine',
  Triangle = 'triangle',
  Square = 'square',
}

export enum SoundFrequencyHz {
  CountdownBeep = 660,
  StartBeep = 880,
  FinishBeepLow = 660,
  FinishBeepHigh = 990,
  IntervalStartBeep = 784,
  IntervalEndBeep = 523,
  Click = 1200,
}

export enum SoundDurationMs {
  CountdownBeep = 90,
  StartBeep = 140,
  FinishBeepLow = 120,
  FinishBeepHigh = 160,
  FinishSecondToneDelay = 130,
  IntervalStartBeep = 110,
  IntervalEndBeep = 130,
  TickClick = 18,
}

export enum SoundGain {
  CountdownBeep = 0.7,
  StartBeep = 0.7,
  FinishBeep = 0.7,
  IntervalBeep = 0.5,
  TickClick = 0.25,
}
