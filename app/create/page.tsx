'use client'
import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { OCCASIONS } from '@/lib/occasions'
import type { OccasionType } from '@/lib/types'
import { BuilderShell } from '@/components/builder/BuilderShell'

function CreatePageInner() {
  const searchParams = useSearchParams()
  const requested = searchParams.get('template') as OccasionType | null
  const initialOccasion: OccasionType = requested && OCCASIONS.includes(requested) ? requested : 'goodwill'

  return <BuilderShell initialOccasion={initialOccasion} />
}

export default function CreatePage() {
  return (
    <Suspense fallback={null}>
      <CreatePageInner />
    </Suspense>
  )
}
