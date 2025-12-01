import { ReactNode } from 'react'

export const TimerContainer = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex max-h-screen flex-col items-center gap-6 overflow-y-auto pb-8">
      {children}
    </div>
  )
}
