export enum AudioContextState {
  Suspended = 'suspended',
  Running = 'running',
  Closed = 'closed',
}

export enum SoundWaveform {
  Sine = 'sine',
  Triangle = 'triangle',
  Square = 'square',
  Sawtooth = 'sawtooth',
}

export enum SoundFrequencyHz {
  CountdownBeep = 660,
  StartBeep = 880,
  FinishBeep = 432,
  IntervalStartBeep = 784,
  IntervalEndBeep = 523,
  Click = 1200,
}

export enum SoundDurationMs {
  CountdownBeep = 160,
  StartBeep = 140,
  FinishBeep = 1850,
  FinishSecondToneDelay = 130,
  IntervalStartBeep = 110,
  IntervalEndBeep = 130,
  TickClick = 18,
}

export enum SoundGain {
  CountdownBeep = 1,
  StartBeep = 0.7,
  FinishBeep = 0.95,
  IntervalBeep = 0.5,
  TickClick = 0.25,
}
