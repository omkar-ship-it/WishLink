'use client'
import { useState } from 'react'
import { Sparkles, X, Send } from 'lucide-react'
import type { CopilotEntry, CopilotAction } from '@/lib/copilot'

interface Message {
  id: string
  role: 'assistant' | 'user'
  text: string
  actions?: CopilotAction[]
}

interface AIAssistantPanelProps {
  senderName: string
  suggestions: CopilotEntry[]
  getReply: (message: string) => CopilotEntry
  onClose: () => void
}

export function AIAssistantPanel({ senderName, suggestions, getReply, onClose }: AIAssistantPanelProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')

  interface Chip { action: CopilotAction; context: string | null }

  const chips: Chip[] = suggestions.flatMap((entry): Chip[] =>
    entry.actions && entry.actions.length > 0
      ? entry.actions.map(action => ({ action, context: entry.text }))
      : [{ action: { id: entry.id, label: entry.text, run: () => {} }, context: null }],
  ).slice(0, 5)

  const runChip = (chip: Chip) => {
    if (chip.context) {
      setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'assistant', text: chip.context! }])
      chip.action.run()
    } else {
      setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'assistant', text: chip.action.label }])
    }
  }

  const send = () => {
    const text = input.trim()
    if (!text) return
    const reply = getReply(text)
    setMessages(prev => [
      ...prev,
      { id: crypto.randomUUID(), role: 'user', text },
      { id: crypto.randomUUID(), role: 'assistant', text: reply.text, actions: reply.actions },
    ])
    setInput('')
  }

  return (
    <div className="absolute top-4 right-4 bottom-4 w-[340px] bg-white border border-border rounded-2xl shadow-xl flex flex-col z-40 pointer-events-auto">
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-brand" />
          <p className="text-sm font-semibold text-text">AI Assistant</p>
        </div>
        <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-text-2 hover:bg-surface-2">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2.5">
        <div className="bg-surface-2 rounded-2xl px-4 py-3 text-sm text-text leading-relaxed">
          Hi {senderName || 'there'}! 👋 How can I help you build the perfect experience?
        </div>

        {chips.map(chip => (
          <button
            key={chip.action.id}
            type="button"
            onClick={() => runChip(chip)}
            className="w-full text-left px-3.5 py-2 rounded-xl bg-brand/5 text-brand text-xs font-semibold hover:bg-brand/10 transition-colors"
          >
            {chip.action.label}
          </button>
        ))}

        {messages.map(m => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className="max-w-[85%]">
              <div className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${m.role === 'user' ? 'bg-brand text-white' : 'bg-surface-2 text-text'}`}>
                {m.text}
              </div>
              {m.actions && m.actions.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {m.actions.map(a => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={a.run}
                      className="px-2.5 py-1.5 rounded-lg bg-brand/10 text-brand text-xs font-semibold hover:bg-brand/15 transition-colors"
                    >
                      {a.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="p-3 border-t border-border shrink-0">
        <div className="flex items-center gap-2 bg-surface-2 border border-border rounded-xl px-3 py-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
            placeholder="Ask or describe anything…"
            className="flex-1 bg-transparent text-sm text-text placeholder:text-text-3 focus:outline-none"
          />
          <button type="button" onClick={send} className="w-7 h-7 rounded-lg bg-brand text-white flex items-center justify-center shrink-0">
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
