'use client'
import { useState } from 'react'
import { Sparkles, Pencil, Plus, ImagePlus, X } from 'lucide-react'
import type { CardTemplate } from '@/lib/types'
import { extractFieldsFromMessage, draftCardFromChat, blankDraftFromTemplate, type ExtractedFields, type DraftResult } from '@/lib/copilot-draft'

interface CopilotChatProps {
  template: CardTemplate
  onDraft: (result: DraftResult, recipientName: string) => void
}

interface Message {
  id: string
  role: 'assistant' | 'user'
  text: string
}

const TONE_LABEL: Record<ExtractedFields['endingTone'], string> = {
  emotional: 'Emotional and heartfelt',
  funny: 'Light and funny',
  grand: 'Big surprise',
  simple: 'Simple and quiet',
  warm: 'Warm and sweet',
}

const CHECKLIST_FIELDS: { key: 'recipientName' | 'memories' | 'songQuery' | 'endingTone'; label: string }[] = [
  { key: 'recipientName', label: "Recipient's full name" },
  { key: 'memories', label: 'Any special memories to include' },
  { key: 'songQuery', label: 'A favorite song' },
  { key: 'endingTone', label: 'How should the ending feel' },
]

export function CopilotChat({ template, onDraft }: CopilotChatProps) {
  const [messages, setMessages] = useState<Message[]>([{
    id: 'intro',
    role: 'assistant',
    text: "Let's create something amazing. Tell me who this is for, what happened, and what you want them to feel.",
  }])
  const [input, setInput] = useState('')
  const [fields, setFields] = useState<ExtractedFields | null>(null)
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [photos, setPhotos] = useState<string[]>([])
  const [creating, setCreating] = useState(false)

  const send = () => {
    const text = input.trim()
    if (!text) return
    const extracted = extractFieldsFromMessage(text)
    setMessages(prev => [
      ...prev,
      { id: crypto.randomUUID(), role: 'user', text },
      {
        id: crypto.randomUUID(),
        role: 'assistant',
        text: "That's a beautiful story 💜 I'll craft a heartfelt, interactive experience they won't forget. To make it perfect, can you help me fill in a few details?",
      },
    ])
    setFields(extracted)
    setInput('')
  }

  const patchField = (key: keyof ExtractedFields, value: string) => {
    setFields(prev => {
      if (!prev) return prev
      if (key === 'memories') return { ...prev, memories: value ? [value] : [] }
      return { ...prev, [key]: value }
    })
    setEditingKey(null)
  }

  const handlePhotos = (files: FileList | null) => {
    if (!files) return
    Array.from(files).forEach(file => {
      const reader = new FileReader()
      reader.onload = () => setPhotos(prev => [...prev, reader.result as string])
      reader.readAsDataURL(file)
    })
  }

  const create = () => {
    if (!fields) return
    setCreating(true)
    const result = draftCardFromChat({ template, fields, photos })
    onDraft(result, fields.recipientName)
  }

  const startBlank = () => onDraft(blankDraftFromTemplate(template), '')

  const fieldDisplay = (key: (typeof CHECKLIST_FIELDS)[number]['key']): string => {
    if (!fields) return ''
    if (key === 'memories') return fields.memories[0] ?? ''
    if (key === 'endingTone') return TONE_LABEL[fields.endingTone]
    return fields[key] ?? ''
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
        <Sparkles className="w-4 h-4 text-brand" />
        <p className="text-sm font-semibold text-text">Let&apos;s create something amazing</p>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        {messages.map(m => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
              m.role === 'user' ? 'bg-brand text-white' : 'bg-surface-2 text-text'
            }`}>
              {m.text}
            </div>
          </div>
        ))}

        {fields && (
          <div className="wc-card p-4 space-y-2.5">
            <p className="text-xs font-semibold text-text-3 uppercase tracking-wide mb-1">A few details</p>
            {CHECKLIST_FIELDS.map(({ key, label }) => (
              <div key={key} className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs text-text-3">{label}</p>
                  {editingKey === key ? (
                    <input
                      autoFocus
                      defaultValue={fieldDisplay(key)}
                      onBlur={e => patchField(key, e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur() }}
                      className="mt-1 w-full bg-surface-2 border border-border rounded-lg px-2 py-1 text-sm text-text focus:outline-none focus:border-brand"
                    />
                  ) : (
                    <p className="text-sm text-text truncate">{fieldDisplay(key) || '—'}</p>
                  )}
                </div>
                <button onClick={() => setEditingKey(key)} className="shrink-0 text-brand text-xs font-semibold flex items-center gap-1">
                  <Pencil className="w-3 h-3" /> Edit
                </button>
              </div>
            ))}
          </div>
        )}

        {fields && (
          <div>
            <p className="text-xs text-text-3 mb-2">Add photos you&apos;d like included</p>
            <div className="flex flex-wrap gap-2">
              {photos.map((src, i) => (
                <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden">
                  <img src={src} alt="" className="w-full h-full object-cover" />
                  <button
                    onClick={() => setPhotos(prev => prev.filter((_, idx) => idx !== i))}
                    className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black/60 text-white flex items-center justify-center"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </div>
              ))}
              <label className="w-16 h-16 rounded-xl border-2 border-dashed border-border flex items-center justify-center text-text-3 hover:border-brand/40 hover:text-brand cursor-pointer">
                <input type="file" accept="image/*" multiple className="hidden" onChange={e => handlePhotos(e.target.files)} />
                <ImagePlus className="w-4 h-4" />
              </label>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-border space-y-2">
        {!fields ? (
          <div className="flex items-center gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="I want to thank my friend Priya for..."
              className="flex-1 bg-surface-2 border border-border rounded-xl px-3 py-2.5 text-sm text-text placeholder:text-text-3 focus:outline-none focus:border-brand"
            />
            <button onClick={send} className="w-10 h-10 rounded-xl bg-brand text-white flex items-center justify-center shrink-0">
              <Plus className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={create}
            disabled={creating}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-brand text-white font-semibold text-sm disabled:opacity-60"
          >
            <Sparkles className="w-4 h-4" /> Create My Experience
          </button>
        )}
        <button onClick={startBlank} className="w-full text-center text-xs text-text-3 py-1">
          Start from a blank canvas instead
        </button>
      </div>
    </div>
  )
}
