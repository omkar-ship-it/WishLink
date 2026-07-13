'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getCard, incrementViewCount } from '@/lib/mock-store'
import { OCCASION_META } from '@/lib/occasions'
import { EmailGate } from '@/components/reveal/EmailGate'
import { PasscodeGate } from '@/components/reveal/PasscodeGate'
import { CardExperience } from './CardExperience'
import type { Card } from '@/lib/types'

type Stage = 'loading' | 'not-found' | 'email-gate' | 'passcode-gate' | 'ready'

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
    if (found.privacyMode === 'email_gated') {
      setStage('email-gate')
    } else if (found.passcode) {
      setStage('passcode-gate')
    } else {
      incrementViewCount(slug)
      setStage('ready')
    }
  }, [slug])

  if (stage === 'loading') return null

  if (stage === 'not-found' || !card) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-8 text-center bg-bg">
        <p className="text-4xl mb-4">🔍</p>
        <p className="font-display text-xl font-semibold text-text mb-2">This link doesn&apos;t lead anywhere</p>
        <p className="text-sm text-text-2 mb-6">It might be mistyped, or this was created in a different browser (this prototype stores everything locally).</p>
        <Link href="/create" className="text-brand font-semibold text-sm">Start one of your own →</Link>
      </div>
    )
  }

  if (stage === 'email-gate') {
    const meta = OCCASION_META[card.occasion]
    return (
      <EmailGate
        senderName={card.senderName}
        occasionLabel={meta.label}
        occasionEmoji={meta.emoji}
        accentFrom={meta.accentFrom}
        accentTo={meta.accentTo}
        expectedEmail={card.recipientEmail ?? ''}
        onVerified={() => {
          if (card.passcode) setStage('passcode-gate')
          else { incrementViewCount(slug); setStage('ready') }
        }}
      />
    )
  }

  if (stage === 'passcode-gate') {
    const meta = OCCASION_META[card.occasion]
    return (
      <PasscodeGate
        senderName={card.senderName}
        occasionLabel={meta.label}
        occasionEmoji={meta.emoji}
        accentFrom={meta.accentFrom}
        accentTo={meta.accentTo}
        expectedPasscode={card.passcode ?? ''}
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
