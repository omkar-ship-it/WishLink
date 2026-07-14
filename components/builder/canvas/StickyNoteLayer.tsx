'use client'
import { useState } from 'react'
import { X } from 'lucide-react'
import { STICKY_COLORS, type StickyNote } from './sticky-note'
import { useCanvasViewport } from './InfiniteCanvasSurface'

interface StickyNoteLayerProps {
  notes: StickyNote[]
  onChange: (id: string, text: string) => void
  onRemove: (id: string) => void
}

export function StickyNoteLayer({ notes, onChange, onRemove }: StickyNoteLayerProps) {
  return (
    <>
      {notes.map(note => (
        <StickyNoteCard key={note.id} note={note} onChange={onChange} onRemove={onRemove} />
      ))}
    </>
  )
}

function StickyNoteCard({ note, onChange, onRemove }: { note: StickyNote; onChange: (id: string, text: string) => void; onRemove: (id: string) => void }) {
  const { scale } = useCanvasViewport()
  const [editing, setEditing] = useState(!note.text)
  const colors = STICKY_COLORS[note.color]

  return (
    <div
      onClick={e => e.stopPropagation()}
      style={{ position: 'absolute', left: note.x, top: note.y, width: 168, background: colors.bg, border: `1px solid ${colors.border}` }}
      className="rounded-lg shadow-sm p-3 -rotate-2 group"
    >
      <button
        type="button"
        onClick={() => onRemove(note.id)}
        style={{ transform: `scale(${1 / scale})`, transformOrigin: 'top right' }}
        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/10 text-text-2 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <X className="w-3 h-3" />
      </button>
      {editing ? (
        <textarea
          autoFocus
          defaultValue={note.text}
          placeholder="Write a note…"
          rows={3}
          onBlur={e => { onChange(note.id, e.target.value); setEditing(false) }}
          className="w-full bg-transparent text-xs text-text leading-snug resize-none focus:outline-none placeholder:text-text-3"
        />
      ) : (
        <p onClick={() => setEditing(true)} className="text-xs text-text leading-snug whitespace-pre-wrap cursor-text min-h-8">
          {note.text}
        </p>
      )}
      <p className="text-[10px] text-text-3 mt-2 flex items-center justify-between">
        <span>{note.author}</span>
        <span>Today</span>
      </p>
    </div>
  )
}
