'use client'

import { WorkRestTimer } from '@/components/display/WorkRestTimer'
import { PageContainer } from '@/components/PageContainer'

export default function WorkRestTestPage() {
  return (
    <PageContainer>
      <div className="mx-auto max-w-4xl px-4">
        <h1 className="mb-8 text-center text-3xl font-bold">Work/Rest Timer Test</h1>

        <div className="shadow-card rounded-lg p-6 shadow-lg">
          <WorkRestTimer />
        </div>
      </div>
    </PageContainer>
  )
}
