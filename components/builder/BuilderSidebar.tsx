'use client'
import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import type { MusicTrack, OccasionType } from '@/lib/types'
import { MOMENT_TYPES, MOMENT_CATEGORIES } from '@/lib/moment-types'
import { TemplateLibrary } from './TemplateLibrary'
import { MusicPicker } from './MusicPicker'
import { NEW_MOMENT_PREFIX } from './BuilderCanvas'
import { cn } from '@/lib/utils'

interface BuilderSidebarProps {
  occasion: OccasionType
  onSelectOccasion: (o: OccasionType) => void
  onAddMoment: (momentTypeId: string) => void
  musicTrackId: string | null
  onMusicChange: (trackId: string) => void
  musicOpen: boolean
  onMusicOpenChange: (open: boolean) => void
}

type Section = 'templates' | 'moments' | 'music'

function SidebarSection({
  id, title, open, onToggle, children,
}: { id: Section; title: string; open: boolean; onToggle: (id: Section) => void; children: React.ReactNode }) {
  return (
    <div className="wc-card overflow-hidden">
      <button
        type="button"
        onClick={() => onToggle(id)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-text-2"
      >
        {title}
        <ChevronDown className={cn('w-4 h-4 transition-transform', open && 'rotate-180')} />
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  )
}

export function BuilderSidebar({
  occasion, onSelectOccasion, onAddMoment, musicTrackId, onMusicChange, musicOpen, onMusicOpenChange,
}: BuilderSidebarProps) {
  const [open, setOpen] = useState<Section | null>('moments')

  const toggle = (id: Section) => {
    if (id === 'music') { onMusicOpenChange(!musicOpen); return }
    setOpen(prev => (prev === id ? null : id))
  }

  return (
    <div className="h-full overflow-y-auto p-4 space-y-3">
      <div>
        <p className="text-xs font-semibold tracking-widest uppercase text-text-3 mb-2 px-1">Templates</p>
        <SidebarSection id="templates" title="Starting points" open={open === 'templates'} onToggle={toggle}>
          <TemplateLibrary value={occasion} onSelect={onSelectOccasion} />
        </SidebarSection>
      </div>

      <div>
        <p className="text-xs font-semibold tracking-widest uppercase text-text-3 mb-2 px-1">Add a moment</p>
        <SidebarSection id="moments" title="Moment library" open={open === 'moments'} onToggle={toggle}>
          <p className="text-xs text-text-3 mb-2.5">Drag onto the canvas, or tap to append.</p>
          {MOMENT_CATEGORIES.map(category => (
            <div key={category} className="mb-3 last:mb-0">
              <p className="text-[10px] font-semibold text-text-3 uppercase tracking-wide mb-1.5">{category}</p>
              <div className="grid grid-cols-3 gap-2">
                {MOMENT_TYPES.filter(m => m.category === category).map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    draggable
                    onDragStart={e => e.dataTransfer.setData('text/plain', `${NEW_MOMENT_PREFIX}${id}`)}
                    onClick={() => onAddMoment(id)}
                    className="flex flex-col items-center gap-1 py-3 rounded-xl bg-surface-2 text-text-2 text-xs font-semibold hover:bg-brand/10 hover:text-brand cursor-grab active:cursor-grabbing transition-colors text-center"
                  >
                    <Icon className="w-4 h-4" />
                    <span className="leading-tight">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </SidebarSection>
      </div>

      <div>
        <p className="text-xs font-semibold tracking-widest uppercase text-text-3 mb-2 px-1">Sound</p>
        <SidebarSection id="music" title="Background music" open={musicOpen} onToggle={toggle}>
          <MusicPicker occasion={occasion} value={musicTrackId} onChange={onMusicChange} />
        </SidebarSection>
      </div>
    </div>
  )
}

export type { MusicTrack }
