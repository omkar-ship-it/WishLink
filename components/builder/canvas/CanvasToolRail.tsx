'use client'
import { useRef, useState } from 'react'
import { MousePointer2, StickyNote as StickyNoteIcon, Sparkle, Image as ImageIcon, Video as VideoIcon, Type, Upload as UploadIcon, MoreHorizontal, Music } from 'lucide-react'
import type { OccasionType } from '@/lib/types'
import { MOMENT_TYPES, MOMENT_CATEGORIES } from '@/lib/moment-types'
import { TemplateLibrary } from '../TemplateLibrary'
import { cn } from '@/lib/utils'

export type CanvasMode = 'select' | 'note'

interface CanvasToolRailProps {
  mode: CanvasMode
  onModeChange: (mode: CanvasMode) => void
  onAddMoment: (momentTypeId: string) => void
  onAddImage: (file: File) => void
  onAddVideo: (file: File) => void
  occasion: OccasionType
  onSelectOccasion: (o: OccasionType) => void
  onOpenMusic: () => void
}

type Popover = 'moment' | 'more' | null

export function CanvasToolRail({ mode, onModeChange, onAddMoment, onAddImage, onAddVideo, occasion, onSelectOccasion, onOpenMusic }: CanvasToolRailProps) {
  const [popover, setPopover] = useState<Popover>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const uploadInputRef = useRef<HTMLInputElement>(null)

  const toggle = (p: Popover) => setPopover(cur => (cur === p ? null : p))

  return (
    <div className="relative h-full w-16 shrink-0 border-r border-border bg-white flex flex-col items-center py-3 gap-1">
      <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) onAddImage(f); e.target.value = '' }} />
      <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) onAddVideo(f); e.target.value = '' }} />
      <input
        ref={uploadInputRef} type="file" accept="image/*,video/*" className="hidden"
        onChange={e => {
          const f = e.target.files?.[0]
          if (f) { if (f.type.startsWith('video')) onAddVideo(f); else onAddImage(f) }
          e.target.value = ''
        }}
      />

      <RailButton label="Select" icon={MousePointer2} active={mode === 'select'} onClick={() => onModeChange('select')} />
      <RailButton label="Note" icon={StickyNoteIcon} active={mode === 'note'} onClick={() => onModeChange('note')} />

      <div className="w-8 h-px bg-border my-1" />

      <div className="relative">
        <RailButton label="Moment" icon={Sparkle} active={popover === 'moment'} onClick={() => toggle('moment')} />
        {popover === 'moment' && (
          <div className="absolute left-full top-0 ml-2 w-72 max-h-[70vh] overflow-y-auto bg-white border border-border rounded-2xl shadow-lg p-3 z-30">
            <p className="text-xs font-semibold text-text-3 uppercase tracking-wide mb-2 px-1">Add a moment</p>
            {MOMENT_CATEGORIES.map(category => (
              <div key={category} className="mb-3 last:mb-0">
                <p className="text-[10px] font-semibold text-text-3 uppercase tracking-wide mb-1.5 px-1">{category}</p>
                <div className="grid grid-cols-3 gap-2">
                  {MOMENT_TYPES.filter(m => m.category === category).map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => { onAddMoment(id); setPopover(null) }}
                      className="flex flex-col items-center gap-1 py-3 rounded-xl bg-surface-2 text-text-2 text-xs font-semibold hover:bg-brand/10 hover:text-brand transition-colors text-center"
                    >
                      <Icon className="w-4 h-4" />
                      <span className="leading-tight">{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <RailButton label="Image" icon={ImageIcon} onClick={() => imageInputRef.current?.click()} />
      <RailButton label="Video" icon={VideoIcon} onClick={() => videoInputRef.current?.click()} />
      <RailButton label="Text" icon={Type} onClick={() => onAddMoment('text')} />
      <RailButton label="Upload" icon={UploadIcon} onClick={() => uploadInputRef.current?.click()} />

      <div className="flex-1" />

      <div className="relative">
        <RailButton label="More" icon={MoreHorizontal} active={popover === 'more'} onClick={() => toggle('more')} />
        {popover === 'more' && (
          <div className="absolute left-full bottom-0 ml-2 w-80 max-h-[70vh] overflow-y-auto bg-white border border-border rounded-2xl shadow-lg p-4 z-30 space-y-4">
            <div>
              <p className="text-xs font-semibold text-text-3 uppercase tracking-wide mb-2">Starting points</p>
              <TemplateLibrary value={occasion} onSelect={o => { onSelectOccasion(o); setPopover(null) }} />
            </div>
            <button
              type="button"
              onClick={() => { onOpenMusic(); setPopover(null) }}
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl bg-surface-2 text-text-2 text-sm font-semibold hover:bg-brand/10 hover:text-brand transition-colors"
            >
              <Music className="w-4 h-4" /> Background music
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function RailButton({ label, icon: Icon, onClick, active }: { label: string; icon: typeof MousePointer2; onClick: () => void; active?: boolean }) {
  return (
    <button
      type="button"
      title={label}
      onClick={onClick}
      className={cn(
        'w-12 h-12 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-colors',
        active ? 'bg-brand/10 text-brand' : 'text-text-2 hover:bg-surface-2',
      )}
    >
      <Icon className="w-[18px] h-[18px]" />
      <span className="text-[9px] font-semibold leading-none">{label}</span>
    </button>
  )
}
