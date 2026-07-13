'use client'
import { useState } from 'react'
import { MoreVertical, Copy, Trash2, Play, ChevronUp, ChevronDown } from 'lucide-react'
import type { Scene } from '@/lib/types'
import { getMomentType, INTERACTION_META } from '@/lib/moment-types'
import { cn } from '@/lib/utils'

interface MomentCardProps {
  scene: Scene
  index: number
  total: number
  selected: boolean
  onSelect: () => void
  onDuplicate: () => void
  onRemove: () => void
  onMove: (direction: -1 | 1) => void
}

export function MomentCard({ scene, index, total, selected, onSelect, onDuplicate, onRemove, onMove }: MomentCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const momentType = getMomentType(scene.layout, scene.interaction)
  const hint = INTERACTION_META[scene.interaction ?? 'auto'].hint
  const Icon = momentType.icon
  const title = scene.heading || scene.body?.slice(0, 40) || 'Untitled moment'
  const thumbSrc = scene.imageUrl ?? scene.imageUrls?.[0]

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'w-full flex items-center gap-3 p-3 rounded-2xl border text-left transition-colors relative',
        selected ? 'border-brand bg-brand/5' : 'border-border hover:border-brand/30 bg-white',
      )}
    >
      <span className="shrink-0 w-6 h-6 rounded-full bg-surface-2 text-text-2 text-xs font-semibold flex items-center justify-center">
        {index + 1}
      </span>

      <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 relative">
        {thumbSrc ? (
          <img src={thumbSrc} alt="" className="w-full h-full object-cover" />
        ) : scene.layout === 'video' ? (
          <div className="w-full h-full flex items-center justify-center" style={{ background: `linear-gradient(160deg, ${scene.background?.from ?? '#888'} 0%, ${scene.background?.to ?? '#444'} 100%)` }}>
            <Play className="w-4 h-4 text-white" />
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: `linear-gradient(160deg, ${scene.background?.from ?? '#888'} 0%, ${scene.background?.to ?? '#444'} 100%)` }}>
            <Icon className="w-4 h-4 text-white/80" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="px-1.5 py-0.5 rounded-md bg-surface-2 text-text-2 text-[10px] font-semibold">{momentType.label}</span>
          <span className="text-[11px] text-text-3">{(scene.durationMs / 1000).toFixed(1)}s</span>
        </div>
        <p className="text-sm font-semibold text-text truncate">{title}</p>
        {hint && <p className="text-xs text-brand">{hint}</p>}
      </div>

      <div className="relative shrink-0" onClick={e => e.stopPropagation()}>
        <button
          type="button"
          onClick={() => setMenuOpen(v => !v)}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-text-2 hover:bg-surface-2"
        >
          <MoreVertical className="w-4 h-4" />
        </button>
        {menuOpen && (
          <div className="absolute right-0 top-8 z-10 w-36 wc-card p-1">
            <button
              type="button"
              disabled={index === 0}
              onClick={() => { onMove(-1); setMenuOpen(false) }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-text-2 hover:bg-surface-2 disabled:opacity-30"
            >
              <ChevronUp className="w-3.5 h-3.5" /> Move up
            </button>
            <button
              type="button"
              disabled={index === total - 1}
              onClick={() => { onMove(1); setMenuOpen(false) }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-text-2 hover:bg-surface-2 disabled:opacity-30"
            >
              <ChevronDown className="w-3.5 h-3.5" /> Move down
            </button>
            <button
              type="button"
              onClick={() => { onDuplicate(); setMenuOpen(false) }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-text-2 hover:bg-surface-2"
            >
              <Copy className="w-3.5 h-3.5" /> Duplicate
            </button>
            <button
              type="button"
              onClick={() => { onRemove(); setMenuOpen(false) }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-danger hover:bg-red-50"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
          </div>
        )}
      </div>
    </button>
  )
}
