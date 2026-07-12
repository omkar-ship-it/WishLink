'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getCard, incrementViewCount } from '@/lib/mock-store'
import { OCCASION_META } from '@/lib/occasions'
import { EmailGate } from '@/components/reveal/EmailGate'
import { CardExperience } from './CardExperience'
import type { Card } from '@/lib/types'

type Stage = 'loading' | 'not-found' | 'gated' | 'ready'

export function CardPageClient({ slug }: { slug: string }) {
  const [card, setCard] = useState<Card | null>(null)
  const [stage, setStage] = useState<Stage>('loading')

  useEffect(() => {
    const found = getCard(slug)
    if (!found) {
      setStage('not-found')
      return
    }
    setCard(found)
    if (found.privacyMode === 'open') {
      incrementViewCount(slug)
      setStage('ready')
    } else {
      setStage('gated')
    }
  }, [slug])

  if (stage === 'loading') return null

  if (stage === 'not-found' || !card) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-8 text-center bg-bg">
        <p className="text-4xl mb-4">🔍</p>
        <p className="font-display text-xl font-semibold text-text mb-2">This card doesn't exist</p>
        <p className="text-sm text-text-2 mb-6">The link might be mistyped, or the card was created in a different browser (this prototype stores cards locally).</p>
        <Link href="/create" className="text-brand font-semibold text-sm">Create your own WishCard →</Link>
      </div>
    )
  }

  if (stage === 'gated') {
    const meta = OCCASION_META[card.occasion]
    return (
      <EmailGate
        senderName={card.senderName}
        occasionLabel={meta.label}
        occasionEmoji={meta.emoji}
        accentFrom={meta.accentFrom}
        accentTo={meta.accentTo}
        expectedEmail={card.recipientEmail ?? ''}
        onVerified={() => { incrementViewCount(slug); setStage('ready') }}
      />
    )
  }

  return (
    <CardExperience
      senderName={card.senderName}
      occasion={card.occasion}
      scenes={card.scenes}
      musicTrackId={card.musicTrackId}
    />
  )
}
