'use client'
import { useState } from 'react'
import { Copy, Check, Eye, Lock, Globe, KeyRound } from 'lucide-react'
import { OCCASION_META } from '@/lib/occasions'
import { OccasionBadge } from '@/components/art/OccasionBadge'
import { formatDate } from '@/lib/utils'
import type { Card } from '@/lib/types'

export function CardListItem({ card }: { card: Card }) {
  const [copied, setCopied] = useState(false)
  const meta = OCCASION_META[card.occasion]
  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/c/${card.shareSlug}` : `/c/${card.shareSlug}`

  const copy = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="wc-card p-4 flex items-center gap-4">
      <OccasionBadge meta={meta} size="md" />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-text truncate">{card.title}</p>
        <div className="flex items-center gap-2 text-xs text-text-3 mt-0.5">
          <span>{formatDate(card.createdAt)}</span>
          <span>·</span>
          <span className="inline-flex items-center gap-1">
            <Eye className="w-3 h-3" /> {card.viewCount}
          </span>
          <span>·</span>
          <span className="inline-flex items-center gap-1">
            {card.privacyMode === 'email_gated' ? <Lock className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
            {card.privacyMode === 'email_gated' ? 'Private' : 'Anyone with link'}
          </span>
          {card.passcode && (
            <>
              <span>·</span>
              <span className="inline-flex items-center gap-1">
                <KeyRound className="w-3 h-3" /> Passcode
              </span>
            </>
          )}
        </div>
      </div>
      <button
        onClick={copy}
        className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-2 text-text-2 text-xs font-semibold hover:bg-brand/10 hover:text-brand"
      >
        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
        {copied ? 'Copied' : 'Copy link'}
      </button>
    </div>
  )
}
