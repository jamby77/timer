import type { WorkRestTimerState } from './types'

import { TimerPhase } from './types'
import { formatTime } from './utils'

export interface DisplayData {
  time: string
  label: string
  isWork: boolean
}

export const getDisplayData = (state: WorkRestTimerState): DisplayData => {
  switch (state.phase) {
    case TimerPhase.Work:
      return {
        time: formatTime(state.currentTime),
        label: 'WORK',
        isWork: true,
      }
    case TimerPhase.Rest:
      return {
        time: formatTime(state.currentTime),
        label: 'REST',
        isWork: false,
      }
    default:
      return {
        time: '00:00.00',
        label: 'READY',
        isWork: false,
      }
  }
}
