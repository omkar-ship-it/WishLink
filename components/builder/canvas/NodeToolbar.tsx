'use client'
import { useRef, useState } from 'react'
import { RefreshCw, Wand2, Timer, Copy, Trash2, MoreHorizontal, Check } from 'lucide-react'
import type { Scene, InteractionType } from '@/lib/types'
import { INTERACTION_META } from '@/lib/moment-types'
import { SCENE_TRANSITIONS } from '@/components/reveal/transitions'
import { cn } from '@/lib/utils'
import { NODE_W } from './canvas-layout'
import { useCanvasViewport } from './InfiniteCanvasSurface'

interface NodeToolbarProps {
  scene: Scene
  x: number
  y: number
  onChange: (patch: Partial<Scene>) => void
  onReplaceImage: (file: File) => void
  onReplaceVideo: (file: File) => void
  onDuplicate: () => void
  onDelete: () => void
  onOpenDetails: () => void
}

const INTERACTIONS = Object.entries(INTERACTION_META) as [InteractionType, typeof INTERACTION_META[InteractionType]][]

export function NodeToolbar({ scene, x, y, onChange, onReplaceImage, onReplaceVideo, onDuplicate, onDelete, onOpenDetails }: NodeToolbarProps) {
  const { scale } = useCanvasViewport()
  const [open, setOpen] = useState<'interaction' | 'timing' | null>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const isVideo = scene.layout === 'video'

  return (
    <div
      onClick={e => e.stopPropagation()}
      style={{
        position: 'absolute',
        left: x + NODE_W / 2,
        top: y - 14,
        transform: `translate(-50%, -100%) scale(${1 / scale})`,
        transformOrigin: 'bottom center',
      }}
      className="z-20 flex items-center gap-0.5 bg-white border border-border rounded-2xl shadow-lg p-1"
    >
      <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) onReplaceImage(f) }} />
      <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) onReplaceVideo(f) }} />

      <ToolbarButton label="Replace" icon={RefreshCw} onClick={() => (isVideo ? videoInputRef : imageInputRef).current?.click()} />

      <div className="relative">
        <ToolbarButton label="Interaction" icon={Wand2} active={open === 'interaction'} onClick={() => setOpen(o => (o === 'interaction' ? null : 'interaction'))} />
        {open === 'interaction' && (
          <div className="absolute top-11 left-1/2 -translate-x-1/2 w-52 bg-white border border-border rounded-xl shadow-lg p-1.5 z-30">
            {INTERACTIONS.map(([key, meta]) => (
              <button
                key={key}
                type="button"
                onClick={() => { onChange({ interaction: key }); setOpen(null) }}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-text-2 hover:bg-surface-2"
              >
                {meta.label}
                {(scene.interaction ?? 'auto') === key && <Check className="w-3.5 h-3.5 text-brand" />}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="relative">
        <ToolbarButton label="Timing" icon={Timer} active={open === 'timing'} onClick={() => setOpen(o => (o === 'timing' ? null : 'timing'))} />
        {open === 'timing' && (
          <div className="absolute top-11 left-1/2 -translate-x-1/2 w-56 bg-white border border-border rounded-xl shadow-lg p-3 z-30 space-y-2.5">
            <label className="flex items-center gap-1.5 text-xs text-text-3">
              Duration
              <input
                type="number" min={2} max={12} step={0.5}
                value={scene.durationMs / 1000}
                onChange={e => onChange({ durationMs: Math.round(Number(e.target.value) * 1000) })}
                className="w-16 bg-surface-2 border border-border rounded-md px-2 py-1 text-xs text-text focus:outline-none focus:border-brand"
              /> sec
            </label>
            <div className="flex flex-wrap gap-1.5">
              {SCENE_TRANSITIONS.map(t => (
                <button key={t} type="button" onClick={() => onChange({ transition: t })}
                  className={cn('px-2 py-1 rounded-md text-[11px] font-medium capitalize', scene.transition === t ? 'bg-text text-white' : 'bg-surface-2 text-text-3')}>
                  {t.replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <ToolbarButton label="Duplicate" icon={Copy} onClick={onDuplicate} />
      <ToolbarButton label="Delete" icon={Trash2} danger onClick={onDelete} />
      <div className="w-px h-5 bg-border mx-0.5" />
      <ToolbarButton label="More" icon={MoreHorizontal} onClick={onOpenDetails} />
    </div>
  )
}

function ToolbarButton({ label, icon: Icon, onClick, active, danger }: { label: string; icon: typeof RefreshCw; onClick: () => void; active?: boolean; danger?: boolean }) {
  return (
    <button
      type="button"
      title={label}
      onClick={onClick}
      className={cn(
        'w-8 h-8 rounded-xl flex items-center justify-center transition-colors',
        active ? 'bg-brand/10 text-brand' : danger ? 'text-danger hover:bg-red-50' : 'text-text-2 hover:bg-surface-2',
      )}
    >
      <Icon className="w-4 h-4" />
    </button>
  )
}
