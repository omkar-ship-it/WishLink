import { redirect, notFound } from 'next/navigation'
import { OCCASIONS } from '@/lib/occasions'
import type { OccasionType } from '@/lib/types'

export function generateStaticParams() {
  return OCCASIONS.map(occasion => ({ occasion }))
}

export default async function CreateOccasionRedirect({
  params,
}: {
  params: Promise<{ occasion: string }>
}) {
  const { occasion } = await params
  if (!OCCASIONS.includes(occasion as OccasionType)) notFound()
  redirect(`/create?template=${occasion}`)
}
