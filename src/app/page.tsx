import { Suspense } from 'react'

import { Body } from '@/components/page/home/components/body'

export default function Home() {
  return (
    <Suspense fallback={null}>
      <Body />
    </Suspense>
  )
}
