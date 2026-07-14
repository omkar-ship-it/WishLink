'use client'
import { Play } from 'lucide-react'
import type { Scene } from '@/lib/types'
import { getMomentType, INTERACTION_META } from '@/lib/moment-types'
import { cn } from '@/lib/utils'
import { NODE_W, NODE_H } from './canvas-layout'

interface MomentNodeProps {
  scene: Scene
  index: number
  x: number
  y: number
  selected: boolean
  onSelect: () => void
}

export function MomentNode({ scene, index, x, y, selected, onSelect }: MomentNodeProps) {
  const momentType = getMomentType(scene.layout, scene.interaction)
  const hint = INTERACTION_META[scene.interaction ?? 'auto'].hint
  const Icon = momentType.icon
  const title = scene.heading || scene.body?.slice(0, 40) || 'Untitled moment'
  const thumbSrc = scene.imageUrl ?? scene.imageUrls?.[0]

  return (
    <button
      type="button"
      onClick={e => { e.stopPropagation(); onSelect() }}
      style={{ position: 'absolute', left: x, top: y, width: NODE_W, height: NODE_H }}
      className={cn(
        'text-left rounded-2xl bg-white border transition-shadow overflow-visible',
        selected ? 'border-brand shadow-[0_0_0_3px_rgba(209,77,114,0.18)]' : 'border-border hover:border-brand/40 shadow-[0_2px_10px_rgba(43,33,64,0.06)]',
      )}
    >
      <span
        className={cn(
          'absolute -left-2.5 -top-2.5 z-10 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 border-white',
          selected ? 'bg-brand text-white' : 'bg-text text-white',
        )}
      >
        {index + 1}
      </span>

      <div className="w-full h-[128px] rounded-t-2xl overflow-hidden relative">
        {thumbSrc ? (
          <img src={thumbSrc} alt="" className="w-full h-full object-cover" draggable={false} />
        ) : scene.layout === 'video' ? (
          <div className="w-full h-full flex items-center justify-center" style={{ background: `linear-gradient(160deg, ${scene.background?.from ?? '#888'} 0%, ${scene.background?.to ?? '#444'} 100%)` }}>
            <Play className="w-6 h-6 text-white" />
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: `linear-gradient(160deg, ${scene.background?.from ?? '#888'} 0%, ${scene.background?.to ?? '#444'} 100%)` }}>
            <Icon className="w-6 h-6 text-white/80" />
          </div>
        )}
      </div>

      <div className="px-3.5 py-3">
        <p className="text-sm font-semibold text-text truncate">{title}</p>
        {hint ? (
          <p className="flex items-center gap-1 text-xs text-brand font-medium mt-0.5">
            <Icon className="w-3 h-3" /> {hint}
          </p>
        ) : (
          <p className="text-xs text-text-3 mt-0.5">{momentType.label}</p>
        )}
      </div>
    </button>
  )
}
