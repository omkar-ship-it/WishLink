'use client'
import { useRef, useState } from 'react'
import { ChevronUp, ChevronDown, Trash2, ImagePlus, Loader2 } from 'lucide-react'
import type { Scene, SceneLayout, SceneTransition } from '@/lib/types'
import { SCENE_TRANSITIONS } from '@/components/reveal/transitions'

const LAYOUTS: { value: SceneLayout; label: string }[] = [
  { value: 'text-only', label: 'Text' },
  { value: 'quote', label: 'Quote' },
  { value: 'image-text', label: 'Photo + text' },
  { value: 'image-only', label: 'Photo only' },
]

interface SceneCardProps {
  scene: Scene
  index: number
  total: number
  onChange: (patch: Partial<Scene>) => void
  onRemove: () => void
  onMove: (direction: -1 | 1) => void
  onImageSelect: (file: File) => Promise<void>
}

export function SceneCard({ scene, index, total, onChange, onRemove, onMove, onImageSelect }: SceneCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const needsImage = scene.layout === 'image-only' || scene.layout === 'image-text'

  const handleFile = async (file: File | undefined) => {
    if (!file) return
    setUploading(true)
    try {
      await onImageSelect(file)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="wc-card p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-text-3 uppercase tracking-wide">Scene {index + 1}</p>
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => onMove(-1)} disabled={index === 0}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-text-2 hover:bg-surface-2 disabled:opacity-30">
            <ChevronUp className="w-4 h-4" />
          </button>
          <button type="button" onClick={() => onMove(1)} disabled={index === total - 1}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-text-2 hover:bg-surface-2 disabled:opacity-30">
            <ChevronDown className="w-4 h-4" />
          </button>
          <button type="button" onClick={onRemove}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-danger hover:bg-red-50">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Layout picker */}
      <div className="flex gap-1.5 mb-3 flex-wrap">
        {LAYOUTS.map(l => (
          <button key={l.value} type="button" onClick={() => onChange({ layout: l.value })}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${scene.layout === l.value ? 'bg-brand text-white' : 'bg-surface-2 text-text-2'}`}>
            {l.label}
          </button>
        ))}
      </div>

      {needsImage && (
        <div className="mb-3">
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
            onChange={e => handleFile(e.target.files?.[0])} />
          {scene.imageUrl ? (
            <div className="relative w-full h-32 rounded-xl overflow-hidden">
              <img src={scene.imageUrl} alt="" className="w-full h-full object-cover" />
              <button type="button" onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-2 right-2 px-2.5 py-1 rounded-lg bg-black/50 text-white text-xs font-semibold">
                Change
              </button>
            </div>
          ) : (
            <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading}
              className="w-full h-32 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-1.5 text-text-3 hover:border-brand/40 hover:text-brand transition-colors">
              {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImagePlus className="w-5 h-5" />}
              <span className="text-xs font-medium">{uploading ? 'Uploading…' : 'Add a photo'}</span>
            </button>
          )}
        </div>
      )}

      {scene.layout !== 'image-only' && (
        <div className="space-y-2 mb-3">
          {scene.layout !== 'quote' && (
            <input
              value={scene.heading ?? ''}
              onChange={e => onChange({ heading: e.target.value })}
              placeholder="Heading"
              className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-text placeholder:text-text-3 focus:outline-none focus:border-brand"
            />
          )}
          <textarea
            value={scene.body ?? ''}
            onChange={e => onChange({ body: e.target.value })}
            placeholder={scene.layout === 'quote' ? 'The quote' : 'Body text (optional)'}
            rows={2}
            className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-text placeholder:text-text-3 focus:outline-none focus:border-brand resize-none"
          />
          {scene.layout === 'quote' && (
            <input
              value={scene.attribution ?? ''}
              onChange={e => onChange({ attribution: e.target.value })}
              placeholder="Attribution (optional) — e.g. your name"
              className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-text placeholder:text-text-3 focus:outline-none focus:border-brand"
            />
          )}
        </div>
      )}

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          {SCENE_TRANSITIONS.map(t => (
            <button key={t} type="button" onClick={() => onChange({ transition: t })}
              className={`px-2 py-1 rounded-md text-[11px] font-medium capitalize transition-colors ${scene.transition === t ? 'bg-text text-white' : 'bg-surface-2 text-text-3'}`}>
              {t.replace('-', ' ')}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-1.5 text-xs text-text-3 shrink-0">
          <input
            type="number"
            min={2}
            max={12}
            step={0.5}
            value={scene.durationMs / 1000}
            onChange={e => onChange({ durationMs: Math.round(Number(e.target.value) * 1000) })}
            className="w-14 bg-surface-2 border border-border rounded-md px-2 py-1 text-xs text-text focus:outline-none focus:border-brand"
          />
          sec
        </label>
      </div>
    </div>
  )
}
