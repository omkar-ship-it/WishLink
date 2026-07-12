'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Eye, Lock, Check, Copy } from 'lucide-react'
import { saveCard } from '@/lib/mock-store'
import { getTemplate } from '@/lib/templates'
import { OCCASION_META } from '@/lib/occasions'
import { cn } from '@/lib/utils'
import type { Scene, SceneLayout, OccasionType, PrivacyMode } from '@/lib/types'
import { SceneCard } from './SceneCard'
import { MusicPicker } from './MusicPicker'
import { RevealPlayer } from '@/components/reveal/RevealPlayer'
import { Button } from '@/components/ui/button'

interface CardBuilderProps {
  occasion: OccasionType
}

function newScene(layout: SceneLayout, accentFrom: string, accentTo: string): Scene {
  return {
    id: crypto.randomUUID(),
    layout,
    transition: 'fade',
    durationMs: 4000,
    heading: '',
    body: '',
    background: { from: accentFrom, to: accentTo },
  }
}

export function CardBuilder({ occasion }: CardBuilderProps) {
  const router = useRouter()
  const meta = OCCASION_META[occasion]
  const template = getTemplate(occasion)

  const [title, setTitle] = useState(template.name)
  const [recipientName, setRecipientName] = useState('')
  const [senderName, setSenderName] = useState('')
  const [scenes, setScenes] = useState<Scene[]>(() => template.scenes.map(s => ({ ...s, id: crypto.randomUUID() })))
  const [musicTrackId, setMusicTrackId] = useState<string | null>(template.defaultMusicTrackId)
  const [privacyMode, setPrivacyMode] = useState<PrivacyMode>('open')
  const [recipientEmail, setRecipientEmail] = useState('')
  const [previewOpen, setPreviewOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const updateScene = (id: string, patch: Partial<Scene>) =>
    setScenes(prev => prev.map(s => (s.id === id ? { ...s, ...patch } : s)))

  const removeScene = (id: string) =>
    setScenes(prev => (prev.length > 1 ? prev.filter(s => s.id !== id) : prev))

  const moveScene = (id: string, direction: -1 | 1) =>
    setScenes(prev => {
      const idx = prev.findIndex(s => s.id === id)
      const swapWith = idx + direction
      if (swapWith < 0 || swapWith >= prev.length) return prev
      const next = [...prev]
      ;[next[idx], next[swapWith]] = [next[swapWith], next[idx]]
      return next
    })

  const addScene = (layout: SceneLayout) =>
    setScenes(prev => [...prev, newScene(layout, meta.accentFrom, meta.accentTo)])

  // Design-prototype stand-in for real image hosting: read the file as a data
  // URL so it round-trips through localStorage along with the rest of the card.
  const handleImageSelect = async (sceneId: string, file: File) => {
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
    updateScene(sceneId, { imageUrl: dataUrl })
  }

  const handleSave = () => {
    setError(null)
    if (!title.trim()) return setError('Give your card a title.')
    if (privacyMode === 'email_gated' && !recipientEmail.trim()) return setError('Add the recipient\'s email to keep this card private.')

    setSaving(true)
    try {
      const card = saveCard({
        senderId: 'demo-sender',
        senderName: senderName.trim() || 'A friend',
        occasion,
        title: title.trim(),
        recipientName: recipientName.trim() || undefined,
        scenes,
        musicTrackId,
        privacyMode,
        recipientEmail: privacyMode === 'email_gated' ? recipientEmail.trim() : null,
      })
      setShareUrl(`${window.location.origin}/c/${card.shareSlug}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong — try again.')
    } finally {
      setSaving(false)
    }
  }

  if (shareUrl) {
    return (
      <div className="wc-card p-8 max-w-md text-center mx-auto">
        <p className="text-4xl mb-4">{meta.emoji}</p>
        <p className="font-display text-xl font-semibold text-text mb-2">Your card is ready</p>
        <p className="text-sm text-text-2 mb-6">Share this link — anyone who opens it gets the full experience, no account needed.</p>
        <div className="flex items-center gap-2 bg-surface-2 border border-border rounded-xl px-3 py-2.5 mb-4">
          <p className="text-sm text-text truncate flex-1 text-left">{shareUrl}</p>
          <button
            onClick={() => { navigator.clipboard.writeText(shareUrl); setCopied(true); setTimeout(() => setCopied(false), 1500) }}
            className="shrink-0 text-brand"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
        <div className="flex flex-col gap-2">
          <a
            href={`https://wa.me/?text=${encodeURIComponent(`I made you something 🎁 ${shareUrl}`)}`}
            target="_blank" rel="noreferrer"
            className="w-full py-3 rounded-xl bg-brand text-white font-semibold text-sm"
          >
            Share on WhatsApp
          </a>
          <button onClick={() => router.push('/dashboard')} className="w-full py-2 text-sm text-text-2">
            Go to My Cards
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl">
      {previewOpen && (
        <div className="fixed inset-0 z-50">
          <RevealPlayer
            scenes={scenes}
            accentFrom={meta.accentFrom}
            accentTo={meta.accentTo}
            onComplete={() => setPreviewOpen(false)}
          />
          <button
            onClick={() => setPreviewOpen(false)}
            className="fixed top-4 right-4 z-[60] w-9 h-9 rounded-full bg-white/15 backdrop-blur text-white flex items-center justify-center"
          >
            ✕
          </button>
        </div>
      )}

      <div className="wc-card p-5 mb-4 space-y-3">
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Card title (for you — recipient won't see this)"
          className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2.5 text-sm font-medium text-text placeholder:text-text-3 focus:outline-none focus:border-brand"
        />
        <div className="grid grid-cols-2 gap-3">
          <input
            value={senderName}
            onChange={e => setSenderName(e.target.value)}
            placeholder="Your name (shown to recipient)"
            className="bg-surface-2 border border-border rounded-lg px-3 py-2.5 text-sm text-text placeholder:text-text-3 focus:outline-none focus:border-brand"
          />
          <input
            value={recipientName}
            onChange={e => setRecipientName(e.target.value)}
            placeholder="Recipient's name (optional)"
            className="bg-surface-2 border border-border rounded-lg px-3 py-2.5 text-sm text-text placeholder:text-text-3 focus:outline-none focus:border-brand"
          />
        </div>
      </div>

      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-text-2">Scenes</p>
        <div className="flex gap-1.5">
          {(['text-only', 'quote', 'image-text'] as SceneLayout[]).map(l => (
            <button key={l} onClick={() => addScene(l)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-surface-2 text-text-2 text-xs font-semibold hover:bg-brand/10 hover:text-brand">
              <Plus className="w-3 h-3" /> {l === 'text-only' ? 'Text' : l === 'quote' ? 'Quote' : 'Photo'}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3 mb-6">
        {scenes.map((scene, i) => (
          <SceneCard
            key={scene.id}
            scene={scene}
            index={i}
            total={scenes.length}
            onChange={patch => updateScene(scene.id, patch)}
            onRemove={() => removeScene(scene.id)}
            onMove={dir => moveScene(scene.id, dir)}
            onImageSelect={file => handleImageSelect(scene.id, file)}
          />
        ))}
      </div>

      <div className="wc-card p-5 mb-4">
        <p className="text-sm font-semibold text-text-2 mb-3">Background music</p>
        <MusicPicker occasion={occasion} value={musicTrackId} onChange={setMusicTrackId} />
      </div>

      <div className="wc-card p-5 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Lock className="w-4 h-4 text-text-2" />
          <p className="text-sm font-semibold text-text-2">Privacy</p>
        </div>
        <div className="flex gap-2 mb-3">
          <button onClick={() => setPrivacyMode('open')}
            className={cn('flex-1 py-2 rounded-lg text-sm font-semibold border', privacyMode === 'open' ? 'bg-brand text-white border-brand' : 'border-border text-text-2')}>
            Anyone with the link
          </button>
          <button onClick={() => setPrivacyMode('email_gated')}
            className={cn('flex-1 py-2 rounded-lg text-sm font-semibold border', privacyMode === 'email_gated' ? 'bg-brand text-white border-brand' : 'border-border text-text-2')}>
            Only this email
          </button>
        </div>
        {privacyMode === 'email_gated' && (
          <input
            value={recipientEmail}
            onChange={e => setRecipientEmail(e.target.value)}
            placeholder="recipient@email.com"
            type="email"
            className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2.5 text-sm text-text placeholder:text-text-3 focus:outline-none focus:border-brand"
          />
        )}
      </div>

      {error && <p className="text-sm text-danger mb-4">{error}</p>}

      <div className="flex gap-3">
        <Button variant="secondary" onClick={() => setPreviewOpen(true)}>
          <Eye className="w-4 h-4" /> Preview
        </Button>
        <Button onClick={handleSave} loading={saving} className="flex-1">
          Create card
        </Button>
      </div>
    </div>
  )
}
