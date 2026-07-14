'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Copy } from 'lucide-react'
import { saveCard } from '@/lib/mock-store'
import { getTemplate } from '@/lib/templates'
import { OCCASION_META } from '@/lib/occasions'
import { getCopilotFeed, getCopilotReply } from '@/lib/copilot'
import { MOMENT_TYPES } from '@/lib/moment-types'
import { readDraft, writeDraft, clearDraft } from '@/lib/draft-store'
import type { DraftResult } from '@/lib/copilot-draft'
import type { Scene, OccasionType, PrivacyMode } from '@/lib/types'
import { BuilderHeader } from './BuilderHeader'
import { BuilderCanvas } from './BuilderCanvas'
import { CreateStep } from './CreateStep'
import { PrivacySettingsModal } from './PrivacySettingsModal'
import { RevealPlayer } from '@/components/reveal/RevealPlayer'
import { useHistory } from './canvas/useHistory'

interface BuilderShellProps {
  initialOccasion: OccasionType
}

function newSceneFromMomentType(momentTypeId: string, accentFrom: string, accentTo: string): Scene {
  const momentType = MOMENT_TYPES.find(m => m.id === momentTypeId) ?? MOMENT_TYPES[0]
  return {
    id: crypto.randomUUID(),
    layout: momentType.layout,
    interaction: momentType.interaction,
    transition: 'fade',
    durationMs: 4000,
    heading: '',
    body: '',
    background: { from: accentFrom, to: accentTo },
  }
}

const sceneFingerprint = (scenes: Scene[]) =>
  JSON.stringify(scenes.map(s => ({ layout: s.layout, heading: s.heading, body: s.body, imageUrl: s.imageUrl })))

export function BuilderShell({ initialOccasion }: BuilderShellProps) {
  const router = useRouter()
  const [step, setStep] = useState<'create' | 'edit'>('create')
  const [occasion, setOccasion] = useState<OccasionType>(initialOccasion)
  const meta = OCCASION_META[occasion]
  const template = getTemplate(occasion)

  const [title, setTitle] = useState(template.name)
  const [recipientName, setRecipientName] = useState('')
  const [senderName, setSenderName] = useState('')
  const { state: scenes, set: setScenes, undo, redo, canUndo, canRedo } = useHistory<Scene[]>(
    () => template.scenes.map(s => ({ ...s, id: crypto.randomUUID() })),
  )
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
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const restoredRef = useRef(false)
  const skipNextAutosaveRef = useRef(true)

  const updateScene = (id: string, patch: Partial<Scene>) =>
    setScenes(prev => prev.map(s => (s.id === id ? { ...s, ...patch } : s)))

  const removeScene = (id: string) =>
    setScenes(prev => (prev.length > 1 ? prev.filter(s => s.id !== id) : prev))

  const duplicateScene = (id: string) =>
    setScenes(prev => {
      const idx = prev.findIndex(s => s.id === id)
      if (idx === -1) return prev
      const clone: Scene = { ...prev[idx], id: crypto.randomUUID() }
      const next = [...prev]
      next.splice(idx + 1, 0, clone)
      return next
    })

  const trimStory = () =>
    setScenes(prev => prev.map(s => ({ ...s, durationMs: Math.max(2000, Math.round(s.durationMs * 0.7)) })))

  const addMoment = (momentTypeId: string) =>
    setScenes(prev => [...prev, newSceneFromMomentType(momentTypeId, meta.accentFrom, meta.accentTo)])

  const addMomentWithFile = async (momentTypeId: string, file: File, kind: 'image' | 'video') => {
    const dataUrl = await readAsDataUrl(file)
    const scene: Scene = {
      ...newSceneFromMomentType(momentTypeId, meta.accentFrom, meta.accentTo),
      ...(kind === 'image' ? { imageUrl: dataUrl } : { videoUrl: dataUrl }),
    }
    setScenes(prev => [...prev, scene])
  }

  const handleSelectOccasion = (next: OccasionType) => {
    if (next === occasion) return
    const isTemplateFresh = scenes.every(s => !s.interaction || s.interaction === 'auto') && sceneFingerprint(scenes) === sceneFingerprint(template.scenes)
    if (!isTemplateFresh && step === 'edit') {
      const proceed = window.confirm('Switching templates will replace your drafted moments — continue?')
      if (!proceed) return
    }
    const nextTemplate = getTemplate(next)
    setOccasion(next)
    setScenes(nextTemplate.scenes.map(s => ({ ...s, id: crypto.randomUUID() })))
    setMusicTrackId(nextTemplate.defaultMusicTrackId)
    if (title === template.name) setTitle(nextTemplate.name)
  }

  const readAsDataUrl = (file: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

  const handleImageSelect = async (sceneId: string, file: File) => {
    const dataUrl = await readAsDataUrl(file)
    updateScene(sceneId, { imageUrl: dataUrl })
  }

  const handleMultiImageSelect = async (sceneId: string, files: File[]) => {
    const dataUrls = await Promise.all(files.map(readAsDataUrl))
    setScenes(prev => prev.map(s => (s.id === sceneId ? { ...s, imageUrls: [...(s.imageUrls ?? []), ...dataUrls] } : s)))
  }

  const handleVideoSelect = async (sceneId: string, file: File) => {
    const dataUrl = await readAsDataUrl(file)
    updateScene(sceneId, { videoUrl: dataUrl })
  }

  const handleDraft = (result: DraftResult, draftedRecipientName: string) => {
    setTitle(result.title)
    setScenes(result.scenes)
    setMusicTrackId(result.musicTrackId)
    if (draftedRecipientName) setRecipientName(draftedRecipientName)
    setStep('edit')
  }

  const copilotSnapshot = {
    occasion,
    title,
    templateName: template.name,
    recipientName,
    scenes,
    musicTrackId,
    privacyMode,
    passcode: passcodeEnabled ? passcode : '',
  }

  const copilotEntries = useMemo(() => getCopilotFeed(
    copilotSnapshot,
    {
      setTitle,
      addScene: layout => addMoment(MOMENT_TYPES.find(m => m.layout === layout)?.id ?? MOMENT_TYPES[0].id),
      patchScene: updateScene,
      openMusic: () => setMusicOpen(true),
      openPrivacy: () => setPrivacyOpen(true),
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
  ), [occasion, title, template.name, recipientName, scenes, musicTrackId, privacyMode, passcode, passcodeEnabled])

  const resolveCopilotReply = (message: string) => getCopilotReply(message, copilotSnapshot, {
    addScene: layout => addMoment(MOMENT_TYPES.find(m => m.layout === layout)?.id ?? MOMENT_TYPES[0].id),
    patchScene: updateScene,
    trimStory,
    openMusic: () => setMusicOpen(true),
    openPrivacy: () => setPrivacyOpen(true),
  })

  // Global undo/redo — skipped while typing so it doesn't fight native text-field undo.
  useEffect(() => {
    if (step !== 'edit') return
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      const typing = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable
      if (typing || !(e.metaKey || e.ctrlKey) || e.key.toLowerCase() !== 'z') return
      e.preventDefault()
      if (e.shiftKey) redo()
      else undo()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [step, undo, redo])

  // Restore an in-progress draft on mount (once) — refreshing mid-edit shouldn't lose work.
  useEffect(() => {
    if (restoredRef.current) return
    restoredRef.current = true
    const draft = readDraft()
    if (!draft) return
    setOccasion(draft.occasion)
    setTitle(draft.title)
    setRecipientName(draft.recipientName)
    setSenderName(draft.senderName)
    setScenes(draft.scenes)
    setMusicTrackId(draft.musicTrackId)
    setPrivacyMode(draft.privacyMode)
    setRecipientEmail(draft.recipientEmail)
    setPasscodeEnabled(draft.passcodeEnabled)
    setPasscode(draft.passcode)
    setStep('edit')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Debounced autosave of in-progress edits.
  useEffect(() => {
    if (step !== 'edit' || shareUrl) return
    if (skipNextAutosaveRef.current) { skipNextAutosaveRef.current = false; return }
    setSaveStatus('saving')
    const t = setTimeout(() => {
      writeDraft({ occasion, title, recipientName, senderName, scenes, musicTrackId, privacyMode, recipientEmail, passcodeEnabled, passcode })
      setSaveStatus('saved')
    }, 500)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, occasion, title, recipientName, senderName, scenes, musicTrackId, privacyMode, recipientEmail, passcodeEnabled, passcode])

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
      clearDraft()
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
        onTitleChange={setTitle}
        step={step}
        saveStatus={step === 'edit' ? saveStatus : 'idle'}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={undo}
        onRedo={redo}
        onOpenPrivacy={() => setPrivacyOpen(true)}
        onPreview={() => setPreviewOpen(true)}
        onPublish={handlePublish}
        publishing={saving}
      />

      {error && <p className="text-sm text-danger px-4 pt-3">{error}</p>}

      {step === 'create' ? (
        <CreateStep occasion={occasion} onSelectOccasion={handleSelectOccasion} onDraft={handleDraft} />
      ) : (
        <div className="flex-1 min-h-0">
          <BuilderCanvas
            scenes={scenes}
            onSceneChange={updateScene}
            onSceneRemove={removeScene}
            onSceneDuplicate={duplicateScene}
            onAddMoment={addMoment}
            onAddImageMoment={file => addMomentWithFile('photo-reveal', file, 'image')}
            onAddVideoMoment={file => addMomentWithFile('video-message', file, 'video')}
            onImageSelect={handleImageSelect}
            onMultiImageSelect={handleMultiImageSelect}
            onVideoSelect={handleVideoSelect}
            occasion={occasion}
            onSelectOccasion={handleSelectOccasion}
            musicTrackId={musicTrackId}
            onMusicChange={setMusicTrackId}
            musicOpen={musicOpen}
            onMusicOpenChange={setMusicOpen}
            accentFrom={meta.accentFrom}
            accentTo={meta.accentTo}
            senderName={senderName}
            copilotEntries={copilotEntries}
            getCopilotReply={resolveCopilotReply}
          />
        </div>
      )}
    </div>
  )
}
