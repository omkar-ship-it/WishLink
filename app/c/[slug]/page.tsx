import type { Metadata } from 'next'
import { CardPageClient } from './CardPageClient'

// Cards live in the recipient's browser localStorage in this prototype, so
// there's no server-side data to build per-card Open Graph tags from —
// that needs a real backend (see README).
export const metadata: Metadata = {
  title: 'WishCards',
  description: 'Someone sent you something.',
}

export default async function CardPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  return <CardPageClient slug={slug} />
}
