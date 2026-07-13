'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { listCards } from '@/lib/mock-store'
import { CardListItem } from '@/components/dashboard/CardListItem'
import type { Card } from '@/lib/types'

export default function DashboardPage() {
  const [cards, setCards] = useState<Card[] | null>(null)

  useEffect(() => {
    setCards(listCards())
  }, [])

  return (
    <div className="min-h-screen bg-bg px-6 py-10">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-semibold text-text">Moments I&apos;ve Sent</h1>
          <p className="text-text-2 mt-1">Every act of goodwill you&apos;ve sent, in one place.</p>
        </div>

        <Link
          href="/create"
          className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl border-2 border-dashed border-border text-text-2 font-semibold mb-6 hover:border-brand/40 hover:text-brand transition-colors"
        >
          <Plus className="w-4 h-4" /> Send another moment
        </Link>

        {cards === null ? null : cards.length === 0 ? (
          <p className="text-center text-text-3 py-12">You haven&apos;t sent anything yet.</p>
        ) : (
          <div className="space-y-3">
            {cards.map(card => <CardListItem key={card.id} card={card} />)}
          </div>
        )}
      </div>
    </div>
  )
}
