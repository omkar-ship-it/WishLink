'use client'
import { useRef, useState } from 'react'
import { X, ImagePlus, Loader2, Video as VideoIcon } from 'lucide-react'
import type { Scene } from '@/lib/types'
import { MOMENT_TYPES, MOMENT_CATEGORIES, getMomentType } from '@/lib/moment-types'
import { SCENE_TRANSITIONS } from '@/components/reveal/transitions'
import { hexMix } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface MomentDetailsProps {
  scene: Scene
  accentFrom: string
  accentTo: string
  onChange: (patch: Partial<Scene>) => void
  onClose: () => void
  onImageSelect: (file: File) => Promise<void>
  onMultiImageSelect: (files: File[]) => Promise<void>
  onVideoSelect: (file: File) => Promise<void>
}

function backgroundPresets(accentFrom: string, accentTo: string) {
  return [
    { from: accentFrom, to: accentTo },
    { from: accentTo, to: accentFrom },
    { from: accentFrom, to: hexMix(accentFrom, '#000000', 0.35) },
    { from: hexMix(accentFrom, '#ffffff', 0.25), to: accentTo },
    { from: hexMix(accentFrom, accentTo, 0.5), to: hexMix(accentTo, '#000000', 0.3) },
  ]
}

export function MomentDetails({ scene, accentFrom, accentTo, onChange, onClose, onImageSelect, onMultiImageSelect, onVideoSelect }: MomentDetailsProps) {
  const imageInputRef = useRef<HTMLInputElement>(null)
  const multiInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const momentType = getMomentType(scene.layout, scene.interaction)

  const handleImage = async (file: File | undefined) => {
    if (!file) return
    setUploading(true)
    try { await onImageSelect(file) } finally { setUploading(false) }
  }

  const handleMultiImages = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setUploading(true)
    try { await onMultiImageSelect(Array.from(files)) } finally { setUploading(false) }
  }

  const handleVideo = async (file: File | undefined) => {
    if (!file) return
    setUploading(true)
    try { await onVideoSelect(file) } finally { setUploading(false) }
  }

  const needsSingleImage = scene.interaction !== 'swipe-through' && (scene.layout === 'image-only' || scene.layout === 'image-text')
  const needsMultiImage = scene.interaction === 'swipe-through'
  const needsVideo = scene.layout === 'video'
  const needsText = scene.layout !== 'image-only' && !needsVideo

  return (
    <div className="wc-card p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-text">Moment details</p>
        <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-text-2 hover:bg-surface-2">
          <X className="w-4 h-4" />
        </button>
      </div>

      <label className="block text-xs font-semibold text-text-3 uppercase tracking-wide mb-1.5">Moment type</label>
      <select
        value={momentType.id}
        onChange={e => {
          const next = MOMENT_TYPES.find(m => m.id === e.target.value)
          if (next) onChange({ layout: next.layout, interaction: next.interaction })
        }}
        className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-text mb-3 focus:outline-none focus:border-brand"
      >
        {MOMENT_CATEGORIES.map(category => (
          <optgroup key={category} label={category}>
            {MOMENT_TYPES.filter(m => m.category === category).map(m => (
              <option key={m.id} value={m.id}>{m.label}</option>
            ))}
          </optgroup>
        ))}
      </select>

      {needsSingleImage && (
        <div className="mb-3">
          <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={e => handleImage(e.target.files?.[0])} />
          {scene.imageUrl ? (
            <div className="relative w-full h-32 rounded-xl overflow-hidden">
              <img src={scene.imageUrl} alt="" className="w-full h-full object-cover" />
              <button type="button" onClick={() => imageInputRef.current?.click()}
                className="absolute bottom-2 right-2 px-2.5 py-1 rounded-lg bg-black/50 text-white text-xs font-semibold">
                Change
              </button>
            </div>
          ) : (
            <button type="button" onClick={() => imageInputRef.current?.click()} disabled={uploading}
              className="w-full h-32 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-1.5 text-text-3 hover:border-brand/40 hover:text-brand transition-colors">
              {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImagePlus className="w-5 h-5" />}
              <span className="text-xs font-medium">{uploading ? 'Uploading…' : 'Add a photo'}</span>
            </button>
          )}
        </div>
      )}

      {needsMultiImage && (
        <div className="mb-3">
          <input ref={multiInputRef} type="file" accept="image/*" multiple className="hidden" onChange={e => handleMultiImages(e.target.files)} />
          <div className="flex flex-wrap gap-2 mb-2">
            {(scene.imageUrls ?? []).map((src, i) => (
              <img key={i} src={src} alt="" className="w-14 h-14 rounded-lg object-cover" />
            ))}
          </div>
          <button type="button" onClick={() => multiInputRef.current?.click()} disabled={uploading}
            className="w-full py-2.5 rounded-xl border-2 border-dashed border-border flex items-center justify-center gap-1.5 text-text-3 hover:border-brand/40 hover:text-brand text-xs font-medium transition-colors">
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />}
            Add photos to swipe through
          </button>
        </div>
      )}

      {needsVideo && (
        <div className="mb-3">
          <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={e => handleVideo(e.target.files?.[0])} />
          {scene.videoUrl ? (
            <div className="relative w-full h-32 rounded-xl overflow-hidden bg-black">
              <video src={scene.videoUrl} className="w-full h-full object-cover" muted />
              <button type="button" onClick={() => videoInputRef.current?.click()}
                className="absolute bottom-2 right-2 px-2.5 py-1 rounded-lg bg-black/50 text-white text-xs font-semibold">
                Change
              </button>
            </div>
          ) : (
            <button type="button" onClick={() => videoInputRef.current?.click()} disabled={uploading}
              className="w-full h-32 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-1.5 text-text-3 hover:border-brand/40 hover:text-brand transition-colors">
              {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <VideoIcon className="w-5 h-5" />}
              <span className="text-xs font-medium">{uploading ? 'Uploading…' : 'Add a video'}</span>
            </button>
          )}
        </div>
      )}

      {needsText && (
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

      <p className="text-xs font-semibold text-text-3 uppercase tracking-wide mb-1.5">Background</p>
      <div className="flex gap-1.5 mb-3">
        {backgroundPresets(accentFrom, accentTo).map((preset, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onChange({ background: preset })}
            className={cn(
              'w-7 h-7 rounded-full border-2',
              scene.background?.from === preset.from && scene.background?.to === preset.to ? 'border-text' : 'border-transparent',
            )}
            style={{ background: `linear-gradient(160deg, ${preset.from} 0%, ${preset.to} 100%)` }}
          />
        ))}
      </div>

      <p className="text-xs font-semibold text-text-3 uppercase tracking-wide mb-1.5">Transition</p>
      <div className="flex items-center gap-1.5 flex-wrap mb-3">
        {SCENE_TRANSITIONS.map(t => (
          <button key={t} type="button" onClick={() => onChange({ transition: t })}
            className={`px-2 py-1 rounded-md text-[11px] font-medium capitalize transition-colors ${scene.transition === t ? 'bg-text text-white' : 'bg-surface-2 text-text-3'}`}>
            {t.replace('-', ' ')}
          </button>
        ))}
      </div>

      <label className="flex items-center gap-1.5 text-xs text-text-3">
        Duration
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
  )
}
