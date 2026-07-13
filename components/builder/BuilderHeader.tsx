'use client'
import Link from 'next/link'
import { ArrowLeft, Eye, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { OccasionMeta } from '@/lib/types'

interface BuilderHeaderProps {
  meta: OccasionMeta
  title: string
  onOpenPrivacy: () => void
  onPreview: () => void
  onPublish: () => void
  publishing: boolean
}

export function BuilderHeader({ meta, title, onOpenPrivacy, onPreview, onPublish, publishing }: BuilderHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3 border-b border-border bg-bg">
      <div className="flex items-center gap-3 min-w-0">
        <Link href="/dashboard" className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-text-2 hover:bg-surface-2">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <span className="text-xl shrink-0">{meta.emoji}</span>
        <p className="font-display font-semibold text-text truncate">{title || 'What moment are we building?'}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onOpenPrivacy}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-text-2 text-sm font-semibold hover:bg-surface-2"
        >
          <Lock className="w-4 h-4" /> Privacy
        </button>
        <Button variant="secondary" onClick={onPreview}>
          <Eye className="w-4 h-4" /> Preview
        </Button>
        <Button onClick={onPublish} loading={publishing}>
          Publish
        </Button>
      </div>
    </div>
  )
}
