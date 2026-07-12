import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { OCCASIONS, OCCASION_META } from '@/lib/occasions'
import type { OccasionType } from '@/lib/types'
import { CardBuilder } from '@/components/builder/CardBuilder'

export function generateStaticParams() {
  return OCCASIONS.map(occasion => ({ occasion }))
}

export default async function CreateOccasionPage({
  params,
}: {
  params: Promise<{ occasion: string }>
}) {
  const { occasion } = await params
  if (!OCCASIONS.includes(occasion as OccasionType)) notFound()

  const meta = OCCASION_META[occasion as OccasionType]

  return (
    <div className="min-h-screen bg-bg px-6 py-10">
      <div className="max-w-2xl mx-auto mb-6">
        <Link href="/create" className="inline-flex items-center gap-1.5 text-sm text-text-2 hover:text-text mb-4">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-2xl">{meta.emoji}</span>
          <h1 className="font-display text-2xl font-semibold text-text">{meta.label}</h1>
        </div>
      </div>
      <div className="max-w-2xl mx-auto">
        <CardBuilder occasion={occasion as OccasionType} />
      </div>
    </div>
  )
}
