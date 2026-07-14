'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { Scene, OccasionType } from '@/lib/types'
import type { CopilotEntry } from '@/lib/copilot'
import { layoutScenes, boundsOf } from './canvas/canvas-layout'
import { InfiniteCanvasSurface, type InfiniteCanvasHandle, type Viewport } from './canvas/InfiniteCanvasSurface'
import { ConnectorLayer } from './canvas/ConnectorLayer'
import { MomentNode } from './canvas/MomentNode'
import { NodeToolbar } from './canvas/NodeToolbar'
import { StickyNoteLayer } from './canvas/StickyNoteLayer'
import { CanvasToolRail, type CanvasMode } from './canvas/CanvasToolRail'
import { CanvasChrome } from './canvas/CanvasChrome'
import { AIAssistantPanel } from './canvas/AIAssistantPanel'
import type { StickyNote } from './canvas/sticky-note'
import { MomentDetails } from './MomentDetails'
import { MomentPreviewPhone } from './MomentPreviewPhone'
import { MusicPicker } from './MusicPicker'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'

interface BuilderCanvasProps {
  scenes: Scene[]
  onSceneChange: (id: string, patch: Partial<Scene>) => void
  onSceneRemove: (id: string) => void
  onSceneDuplicate: (id: string) => void
  onAddMoment: (momentTypeId: string) => void
  onAddImageMoment: (file: File) => void
  onAddVideoMoment: (file: File) => void
  onImageSelect: (sceneId: string, file: File) => Promise<void>
  onMultiImageSelect: (sceneId: string, files: File[]) => Promise<void>
  onVideoSelect: (sceneId: string, file: File) => Promise<void>
  occasion: OccasionType
  onSelectOccasion: (o: OccasionType) => void
  musicTrackId: string | null
  onMusicChange: (id: string) => void
  musicOpen: boolean
  onMusicOpenChange: (open: boolean) => void
  accentFrom: string
  accentTo: string
  senderName: string
  copilotEntries: CopilotEntry[]
  getCopilotReply: (message: string) => CopilotEntry
}

let noteSeq = 0

export function BuilderCanvas({
  scenes, onSceneChange, onSceneRemove, onSceneDuplicate, onAddMoment, onAddImageMoment, onAddVideoMoment,
  onImageSelect, onMultiImageSelect, onVideoSelect,
  occasion, onSelectOccasion, musicTrackId, onMusicChange, musicOpen, onMusicOpenChange,
  accentFrom, accentTo, senderName, copilotEntries, getCopilotReply,
}: BuilderCanvasProps) {
  const canvasRef = useRef<InfiniteCanvasHandle>(null)
  const [viewport, setViewport] = useState<Viewport>({ x: 160, y: 100, scale: 0.85 })
  const [mode, setMode] = useState<CanvasMode>('select')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [detailsTab, setDetailsTab] = useState<'details' | 'preview'>('details')
  const [aiOpen, setAiOpen] = useState(true)
  const [dark, setDark] = useState(false)
  const [notes, setNotes] = useState<StickyNote[]>([])
  const [detailsOpenFor, setDetailsOpenFor] = useState<string | null>(null)

  const positions = useMemo(() => layoutScenes(scenes), [scenes])
  const bounds = useMemo(() => boundsOf(positions), [positions])
  const positionOf = useMemo(() => new Map(positions.map(p => [p.id, p])), [positions])
  const selectedScene = scenes.find(s => s.id === selectedId)

  const handleBackgroundClick = (point: { x: number; y: number }) => {
    if (mode !== 'note') { setSelectedId(null); return }
    noteSeq += 1
    setNotes(prev => [...prev, { id: `note-${Date.now()}-${noteSeq}`, x: point.x, y: point.y, text: '', color: (['pink', 'yellow', 'blue'] as const)[noteSeq % 3], author: senderName || 'You' }])
    setMode('select')
  }

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      const typing = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setAiOpen(true); return }
      if (typing) return
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) { e.preventDefault(); onSceneRemove(selectedId); setSelectedId(null); return }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'd' && selectedId) { e.preventDefault(); onSceneDuplicate(selectedId); return }
      if (e.key === '+' || e.key === '=') { e.preventDefault(); canvasRef.current?.zoomIn(); return }
      if (e.key === '-') { e.preventDefault(); canvasRef.current?.zoomOut(); return }
      if (e.key === '0') { e.preventDefault(); canvasRef.current?.fitToContent(bounds); return }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [selectedId, bounds, onSceneRemove, onSceneDuplicate])

  return (
    <div className="h-full w-full flex min-h-0">
      <CanvasToolRail
        mode={mode}
        onModeChange={setMode}
        onAddMoment={id => { onAddMoment(id) }}
        onAddImage={onAddImageMoment}
        onAddVideo={onAddVideoMoment}
        occasion={occasion}
        onSelectOccasion={onSelectOccasion}
        onOpenMusic={() => onMusicOpenChange(true)}
      />

      <div className="relative flex-1 min-w-0">
        <InfiniteCanvasSurface
          ref={canvasRef}
          onViewportChange={setViewport}
          onBackgroundClick={handleBackgroundClick}
          cursor={mode === 'note' ? 'crosshair' : undefined}
          style={{ background: dark ? '#211A2E' : '#FBF3EC' }}
          className={cn(
            'h-full w-full',
            !dark && 'bg-[radial-gradient(circle,#E9DACB_1px,transparent_1px)] [background-size:22px_22px]',
          )}
          overlays={
            <>
              <CanvasChrome
                zoomPct={Math.round(viewport.scale * 100)}
                onZoomIn={() => canvasRef.current?.zoomIn()}
                onZoomOut={() => canvasRef.current?.zoomOut()}
                onFit={() => canvasRef.current?.fitToContent(bounds)}
                aiOpen={aiOpen}
                onToggleAI={() => setAiOpen(v => !v)}
                dark={dark}
                onToggleDark={() => setDark(v => !v)}
                nodes={positions}
                bounds={bounds}
                viewport={viewport}
                onRecenter={p => canvasRef.current?.recenterOn(p)}
                onAddMoment={onAddMoment}
                onAddImage={onAddImageMoment}
                onAddVideo={onAddVideoMoment}
                onOpenMusic={() => onMusicOpenChange(true)}
              />
              {musicOpen && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-80 max-h-[calc(100%-2rem)] overflow-y-auto bg-white border border-border rounded-2xl shadow-xl z-50 pointer-events-auto p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-semibold text-text">Background music</p>
                    <button type="button" onClick={() => onMusicOpenChange(false)} className="w-7 h-7 rounded-lg flex items-center justify-center text-text-2 hover:bg-surface-2">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <MusicPicker occasion={occasion} value={musicTrackId} onChange={id => { onMusicChange(id); onMusicOpenChange(false) }} />
                </div>
              )}
              {aiOpen && (
                <AIAssistantPanel
                  senderName={senderName}
                  suggestions={copilotEntries}
                  getReply={getCopilotReply}
                  onClose={() => setAiOpen(false)}
                />
              )}
              {selectedScene && detailsTab && (
                <DetailsDrawer
                  scene={selectedScene}
                  tab={detailsTab}
                  onTabChange={setDetailsTab}
                  accentFrom={accentFrom}
                  accentTo={accentTo}
                  onChange={patch => onSceneChange(selectedScene.id, patch)}
                  onClose={() => setSelectedId(null)}
                  onImageSelect={file => onImageSelect(selectedScene.id, file)}
                  onMultiImageSelect={files => onMultiImageSelect(selectedScene.id, files)}
                  onVideoSelect={file => onVideoSelect(selectedScene.id, file)}
                  open={detailsOpenFor === selectedScene.id}
                />
              )}
            </>
          }
        >
          <ConnectorLayer nodes={positions} />
          {scenes.map((scene, i) => {
            const pos = positionOf.get(scene.id)
            if (!pos) return null
            return (
              <MomentNode
                key={scene.id}
                scene={scene}
                index={i}
                x={pos.x}
                y={pos.y}
                selected={scene.id === selectedId}
                onSelect={() => setSelectedId(scene.id)}
              />
            )
          })}
          {selectedScene && positionOf.get(selectedScene.id) && (
            <NodeToolbar
              scene={selectedScene}
              x={positionOf.get(selectedScene.id)!.x}
              y={positionOf.get(selectedScene.id)!.y}
              onChange={patch => onSceneChange(selectedScene.id, patch)}
              onReplaceImage={file => onImageSelect(selectedScene.id, file)}
              onReplaceVideo={file => onVideoSelect(selectedScene.id, file)}
              onDuplicate={() => onSceneDuplicate(selectedScene.id)}
              onDelete={() => { onSceneRemove(selectedScene.id); setSelectedId(null) }}
              onOpenDetails={() => setDetailsOpenFor(selectedScene.id)}
            />
          )}
          <StickyNoteLayer
            notes={notes}
            onChange={(id, text) => setNotes(prev => prev.map(n => (n.id === id ? { ...n, text } : n)))}
            onRemove={id => setNotes(prev => prev.filter(n => n.id !== id))}
          />
        </InfiniteCanvasSurface>
      </div>
    </div>
  )
}

function DetailsDrawer({
  scene, tab, onTabChange, accentFrom, accentTo, onChange, onClose, onImageSelect, onMultiImageSelect, onVideoSelect, open,
}: {
  scene: Scene
  tab: 'details' | 'preview'
  onTabChange: (t: 'details' | 'preview') => void
  accentFrom: string
  accentTo: string
  onChange: (patch: Partial<Scene>) => void
  onClose: () => void
  onImageSelect: (file: File) => Promise<void>
  onMultiImageSelect: (files: File[]) => Promise<void>
  onVideoSelect: (file: File) => Promise<void>
  open: boolean
}) {
  if (!open) return null
  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[380px] max-h-[calc(100%-2rem)] overflow-y-auto bg-white border border-border rounded-2xl shadow-xl z-50 pointer-events-auto">
      <div className="flex items-center justify-between px-4 pt-3">
        <div className="flex border-b border-border flex-1 -mb-px">
          {(['details', 'preview'] as const).map(t => (
            <button
              key={t}
              type="button"
              onClick={() => onTabChange(t)}
              className={cn('flex-1 py-2 text-xs font-semibold capitalize', tab === t ? 'text-brand border-b-2 border-brand' : 'text-text-3')}
            >
              {t}
            </button>
          ))}
        </div>
        <button type="button" onClick={onClose} className="ml-2 w-7 h-7 rounded-lg flex items-center justify-center text-text-2 hover:bg-surface-2">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="p-4 pt-3">
        {tab === 'preview' ? (
          <MomentPreviewPhone scene={scene} accentFrom={accentFrom} accentTo={accentTo} />
        ) : (
          <MomentDetails
            scene={scene}
            accentFrom={accentFrom}
            accentTo={accentTo}
            onChange={onChange}
            onClose={onClose}
            onImageSelect={onImageSelect}
            onMultiImageSelect={onMultiImageSelect}
            onVideoSelect={onVideoSelect}
          />
        )}
      </div>
    </div>
  )
}
