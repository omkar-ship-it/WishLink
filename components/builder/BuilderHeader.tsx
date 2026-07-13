'use client'
import Link from 'next/link'
import { ArrowLeft, Eye, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { OccasionMeta } from '@/lib/types'

interface BuilderHeaderProps {
  meta: OccasionMeta
  title: string
  step: 'create' | 'edit'
  onOpenPrivacy: () => void
  onPreview: () => void
  onPublish: () => void
  publishing: boolean
}

const STEPS: { id: 'create' | 'edit' | 'share'; label: string }[] = [
  { id: 'create', label: 'Create' },
  { id: 'edit', label: 'Personalize' },
  { id: 'share', label: 'Share' },
]

export function BuilderHeader({ meta, title, step, onOpenPrivacy, onPreview, onPublish, publishing }: BuilderHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3 border-b border-border bg-bg">
      <div className="flex items-center gap-3 min-w-0">
        <Link href="/dashboard" className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-text-2 hover:bg-surface-2">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <span className="text-xl shrink-0 hidden sm:inline">{meta.emoji}</span>
        <p className="font-display font-semibold text-text truncate hidden sm:block">{title || 'What moment are we building?'}</p>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center gap-1.5">
            <span className={cn(
              'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold',
              s.id === step ? 'bg-brand text-white' : 'text-text-3',
            )}>
              <span className={cn(
                'w-4 h-4 rounded-full flex items-center justify-center text-[10px]',
                s.id === step ? 'bg-white/25' : 'bg-surface-2',
              )}>{i + 1}</span>
              {s.label}
            </span>
            {i < STEPS.length - 1 && <span className="w-4 h-px bg-border" />}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {step === 'edit' && (
          <>
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
          </>
        )}
      </div>
    </div>
  )
}
