'use client'
import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Copy } from 'lucide-react'
import { saveCard } from '@/lib/mock-store'
import { getTemplate } from '@/lib/templates'
import { OCCASION_META } from '@/lib/occasions'
import { getCopilotFeed } from '@/lib/copilot'
import type { Scene, SceneLayout, OccasionType, PrivacyMode } from '@/lib/types'
import { BuilderHeader } from './BuilderHeader'
import { BuilderSidebar } from './BuilderSidebar'
import { BuilderCanvas } from './BuilderCanvas'
import { CopilotPanel } from './CopilotPanel'
import { PrivacySettingsModal } from './PrivacySettingsModal'
import { RevealPlayer } from '@/components/reveal/RevealPlayer'

interface BuilderShellProps {
  initialOccasion: OccasionType
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

export function BuilderShell({ initialOccasion }: BuilderShellProps) {
  const router = useRouter()
  const [occasion, setOccasion] = useState<OccasionType>(initialOccasion)
  const meta = OCCASION_META[occasion]
  const template = getTemplate(occasion)

  const [title, setTitle] = useState(template.name)
  const [recipientName, setRecipientName] = useState('')
  const [senderName, setSenderName] = useState('')
  const [scenes, setScenes] = useState<Scene[]>(() => template.scenes.map(s => ({ ...s, id: crypto.randomUUID() })))
  const [musicTrackId, setMusicTrackId] = useState<string | null>(template.defaultMusicTrackId)
  const [musicOpen, setMusicOpen] = useState(false)
  const [privacyMode, setPrivacyMode] = useState<PrivacyMode>('open')
  const [recipientEmail, setRecipientEmail] = useState('')
  const [passcodeEnabled, setPasscodeEnabled] = useState(false)
  const [passcode, setPasscode] = useState('')
  const [privacyOpen, setPrivacyOpen] = useState(false)
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

  const reorderScenes = (draggedId: string, targetId: string) =>
    setScenes(prev => {
      const from = prev.findIndex(s => s.id === draggedId)
      const to = prev.findIndex(s => s.id === targetId)
      if (from === -1 || to === -1) return prev
      const next = [...prev]
      const [moved] = next.splice(from, 1)
      next.splice(to, 0, moved)
      return next
    })

  const addScene = (layout: SceneLayout) =>
    setScenes(prev => [...prev, newScene(layout, meta.accentFrom, meta.accentTo)])

  const dropNewScene = (layout: SceneLayout, beforeId?: string) =>
    setScenes(prev => {
      const scene = newScene(layout, meta.accentFrom, meta.accentTo)
      if (!beforeId) return [...prev, scene]
      const idx = prev.findIndex(s => s.id === beforeId)
      if (idx === -1) return [...prev, scene]
      const next = [...prev]
      next.splice(idx, 0, scene)
      return next
    })

  const handleSelectOccasion = (next: OccasionType) => {
    if (next === occasion) return
    const nextTemplate = getTemplate(next)
    setOccasion(next)
    setScenes(nextTemplate.scenes.map(s => ({ ...s, id: crypto.randomUUID() })))
    setMusicTrackId(nextTemplate.defaultMusicTrackId)
    if (title === template.name) setTitle(nextTemplate.name)
  }

  const handleImageSelect = async (sceneId: string, file: File) => {
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
    updateScene(sceneId, { imageUrl: dataUrl })
  }

  const copilotEntries = useMemo(() => getCopilotFeed(
    {
      occasion,
      title,
      templateName: template.name,
      recipientName,
      scenes,
      musicTrackId,
      privacyMode,
      passcode: passcodeEnabled ? passcode : '',
    },
    {
      setTitle,
      addScene,
      patchScene: updateScene,
      openMusic: () => setMusicOpen(true),
      openPrivacy: () => setPrivacyOpen(true),
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
  ), [occasion, title, template.name, recipientName, scenes, musicTrackId, privacyMode, passcode, passcodeEnabled])

  const handlePublish = () => {
    setError(null)
    if (!title.trim()) return setError('Give this moment a name.')
    if (privacyMode === 'email_gated' && !recipientEmail.trim()) return setError("Add the recipient's email to keep this private.")
    if (passcodeEnabled && !passcode.trim()) return setError('Set a passcode, or turn it off.')

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
        passcode: passcodeEnabled ? passcode.trim() : undefined,
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
      <div className="min-h-screen flex items-center justify-center px-6 bg-bg">
        <div className="wc-card p-8 max-w-md text-center">
          <p className="text-4xl mb-4">{meta.emoji}</p>
          <p className="font-display text-xl font-semibold text-text mb-2">It&apos;s ready to send</p>
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
              Go to My Moments
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-bg">
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

      {privacyOpen && (
        <PrivacySettingsModal
          privacyMode={privacyMode}
          onPrivacyModeChange={setPrivacyMode}
          recipientEmail={recipientEmail}
          onRecipientEmailChange={setRecipientEmail}
          passcodeEnabled={passcodeEnabled}
          onPasscodeEnabledChange={setPasscodeEnabled}
          passcode={passcode}
          onPasscodeChange={setPasscode}
          onClose={() => setPrivacyOpen(false)}
        />
      )}

      <BuilderHeader
        meta={meta}
        title={title}
        onOpenPrivacy={() => setPrivacyOpen(true)}
        onPreview={() => setPreviewOpen(true)}
        onPublish={handlePublish}
        publishing={saving}
      />

      {error && <p className="text-sm text-danger px-4 pt-3">{error}</p>}

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[280px_1fr_300px] min-h-0">
        <div className="hidden lg:block border-r border-border min-h-0">
          <BuilderSidebar
            occasion={occasion}
            onSelectOccasion={handleSelectOccasion}
            onAddScene={addScene}
            musicTrackId={musicTrackId}
            onMusicChange={setMusicTrackId}
            musicOpen={musicOpen}
            onMusicOpenChange={setMusicOpen}
          />
        </div>

        <div className="min-h-0 overflow-y-auto">
          <BuilderCanvas
            title={title}
            onTitleChange={setTitle}
            senderName={senderName}
            onSenderNameChange={setSenderName}
            recipientName={recipientName}
            onRecipientNameChange={setRecipientName}
            scenes={scenes}
            onSceneChange={updateScene}
            onSceneRemove={removeScene}
            onSceneMove={moveScene}
            onSceneReorder={reorderScenes}
            onImageSelect={handleImageSelect}
            onDropNewScene={dropNewScene}
          />
        </div>

        <div className="hidden lg:block border-l border-border min-h-0">
          <CopilotPanel entries={copilotEntries} />
        </div>
      </div>
    </div>
  )
}
