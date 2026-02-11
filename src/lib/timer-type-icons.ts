import { ComponentType } from 'react'
import { ClockAlert, ClockArrowDown, ClockPlus, Timer, TimerReset } from 'lucide-react'

import { TimerType } from '@/lib/enums'

// Timer type icons for UI display
export const TIMER_TYPE_ICONS: Record<TimerType, ComponentType<any>> = {
  [TimerType.COUNTDOWN]: ClockArrowDown,
  [TimerType.STOPWATCH]: Timer,
  [TimerType.INTERVAL]: TimerReset,
  [TimerType.WORKREST]: ClockPlus,
  [TimerType.COMPLEX]: ClockAlert,
}
