import { AnyTimerConfig } from '@/types/configure'
import { TimerType } from '@/lib/enums'

import {
  CountdownFields,
  IntervalFields,
  StopwatchFields,
  WorkRestFields,
} from '@/components/configure/components'

type ComplexFieldsProps = {
  type: TimerType
  config: AnyTimerConfig
  onChange: (updates: Partial<AnyTimerConfig>) => void
}
export const ComplexFields = ({ type, config, onChange }: ComplexFieldsProps) => {
  switch (type) {
    case TimerType.COUNTDOWN:
      return <CountdownFields config={config as any} onChange={onChange} />
    case TimerType.STOPWATCH:
      return <StopwatchFields config={config as any} onChange={onChange} />
    case TimerType.INTERVAL:
      return <IntervalFields config={config as any} onChange={onChange} />
    case TimerType.WORKREST:
      return <WorkRestFields config={config as any} onChange={onChange} />
    default:
      return null
  }
}

export default ComplexFields
