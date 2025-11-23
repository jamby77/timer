import { ReactNode } from 'react'

export const TimerContainer = ({ children }: { children: ReactNode }) => {
  return (
    <div className="my-8 flex max-h-screen flex-col items-center gap-8 overflow-y-auto">
      {children}
    </div>
  )
}
