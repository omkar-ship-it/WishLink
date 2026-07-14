'use client'
import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Eye, Lock, Undo2, Redo2, Cloud, CloudUpload, ChevronDown, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { OccasionMeta } from '@/lib/types'

interface BuilderHeaderProps {
  meta: OccasionMeta
  title: string
  onTitleChange: (v: string) => void
  step: 'create' | 'edit'
  saveStatus: 'idle' | 'saving' | 'saved'
  canUndo: boolean
  canRedo: boolean
  onUndo: () => void
  onRedo: () => void
  onOpenPrivacy: () => void
  onPreview: () => void
  onPublish: () => void
  publishing: boolean
}

const STEPS: { id: 'create' | 'edit' | 'share'; label: string }[] = [
  { id: 'create', label: 'Create' },
  { id: 'edit', label: 'Preview & Edit' },
  { id: 'share', label: 'Share' },
]

export function BuilderHeader({
  meta, title, onTitleChange, step, saveStatus, canUndo, canRedo, onUndo, onRedo, onOpenPrivacy, onPreview, onPublish, publishing,
}: BuilderHeaderProps) {
  const [editingTitle, setEditingTitle] = useState(false)

  return (
    <div className="flex items-center justify-between gap-4 px-4 py-2.5 border-b border-border bg-bg">
      <div className="flex items-center gap-3 min-w-0">
        <Link href="/dashboard" className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-text-2 hover:bg-surface-2">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex items-center gap-1.5 shrink-0">
          <Heart className="w-4 h-4 text-brand fill-brand" />
          <span className="font-display font-semibold text-text hidden sm:inline">WishCards</span>
        </div>

        {step === 'edit' && (
          <>
            <div className="w-px h-5 bg-border hidden md:block" />
            <div className="relative hidden md:block">
              {editingTitle ? (
                <input
                  autoFocus
                  value={title}
                  onChange={e => onTitleChange(e.target.value)}
                  onBlur={() => setEditingTitle(false)}
                  onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur() }}
                  placeholder="Name this moment"
                  className="bg-surface-2 border border-border rounded-lg px-2.5 py-1.5 text-sm font-semibold text-text focus:outline-none focus:border-brand w-48"
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setEditingTitle(true)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-semibold text-text hover:bg-surface-2 max-w-[220px]"
                >
                  <span className="shrink-0">{meta.emoji}</span>
                  <span className="truncate">{title || 'Untitled moment'}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-text-3 shrink-0" />
                </button>
              )}
            </div>

            <SaveIndicator status={saveStatus} />

            <div className="w-px h-5 bg-border hidden lg:block" />
            <div className="hidden lg:flex items-center gap-0.5">
              <button
                type="button"
                onClick={onUndo}
                disabled={!canUndo}
                title="Undo"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-text-2 hover:bg-surface-2 disabled:opacity-30"
              >
                <Undo2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onRedo}
                disabled={!canRedo}
                title="Redo"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-text-2 hover:bg-surface-2 disabled:opacity-30"
              >
                <Redo2 className="w-4 h-4" />
              </button>
            </div>
          </>
        )}
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
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-text-2 text-sm font-semibold hover:bg-surface-2"
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

function SaveIndicator({ status }: { status: 'idle' | 'saving' | 'saved' }) {
  if (status === 'idle') return null
  return (
    <span className="hidden md:flex items-center gap-1.5 text-xs font-medium text-text-3">
      {status === 'saving' ? <CloudUpload className="w-3.5 h-3.5 animate-pulse" /> : <Cloud className="w-3.5 h-3.5 text-success" />}
      {status === 'saving' ? 'Saving…' : 'Saved'}
    </span>
  )
}
