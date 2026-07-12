'use client'
import { Music, Play, Square } from 'lucide-react'
import { useRef, useState } from 'react'
import { MUSIC_TRACKS } from '@/lib/music'
import type { OccasionType } from '@/lib/types'

interface MusicPickerProps {
  occasion: OccasionType
  value: string | null
  onChange: (trackId: string) => void
}

export function MusicPicker({ occasion, value, onChange }: MusicPickerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [previewing, setPreviewing] = useState<string | null>(null)

  const tracks = [
    ...MUSIC_TRACKS.filter(t => t.occasionTags.includes(occasion)),
    ...MUSIC_TRACKS.filter(t => !t.occasionTags.includes(occasion)),
  ]

  const togglePreview = (trackId: string, fileUrl: string) => {
    if (previewing === trackId) {
      audioRef.current?.pause()
      setPreviewing(null)
      return
    }
    if (audioRef.current) {
      audioRef.current.src = fileUrl
      audioRef.current.play().catch(() => {})
    }
    setPreviewing(trackId)
  }

  return (
    <div className="space-y-2">
      <audio ref={audioRef} onEnded={() => setPreviewing(null)} />
      {tracks.map(track => (
        <button
          key={track.id}
          type="button"
          onClick={() => onChange(track.id)}
          className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-colors text-left ${value === track.id ? 'border-brand bg-brand/5' : 'border-border hover:border-brand/30'}`}
        >
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${value === track.id ? 'bg-brand text-white' : 'bg-surface-2 text-text-3'}`}>
            <Music className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-text truncate">{track.title}</p>
            <p className="text-xs text-text-3 truncate">{track.artist}</p>
          </div>
          <button
            type="button"
            onClick={e => { e.stopPropagation(); togglePreview(track.id, track.fileUrl) }}
            className="w-8 h-8 rounded-full bg-surface-2 flex items-center justify-center text-text-2 shrink-0"
          >
            {previewing === track.id ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
          </button>
        </button>
      ))}
    </div>
  )
}
