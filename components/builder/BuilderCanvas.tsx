'use client'
import { useState } from 'react'
import { GripVertical } from 'lucide-react'
import type { Scene, SceneLayout } from '@/lib/types'
import { SceneCard } from './SceneCard'

interface BuilderCanvasProps {
  title: string
  onTitleChange: (v: string) => void
  senderName: string
  onSenderNameChange: (v: string) => void
  recipientName: string
  onRecipientNameChange: (v: string) => void
  scenes: Scene[]
  onSceneChange: (id: string, patch: Partial<Scene>) => void
  onSceneRemove: (id: string) => void
  onSceneMove: (id: string, direction: -1 | 1) => void
  onSceneReorder: (draggedId: string, targetId: string) => void
  onImageSelect: (id: string, file: File) => Promise<void>
  onDropNewScene: (layout: SceneLayout, beforeId?: string) => void
}

const NEW_SCENE_PREFIX = 'new-scene:'
const REORDER_PREFIX = 'scene-reorder:'

export function BuilderCanvas({
  title, onTitleChange,
  senderName, onSenderNameChange,
  recipientName, onRecipientNameChange,
  scenes, onSceneChange, onSceneRemove, onSceneMove, onSceneReorder, onImageSelect, onDropNewScene,
}: BuilderCanvasProps) {
  const [dragOverId, setDragOverId] = useState<string | null>(null)

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault()
    setDragOverId(null)
    const payload = e.dataTransfer.getData('text/plain')
    if (payload.startsWith(NEW_SCENE_PREFIX)) {
      onDropNewScene(payload.slice(NEW_SCENE_PREFIX.length) as SceneLayout, targetId)
    } else if (payload.startsWith(REORDER_PREFIX)) {
      const draggedId = payload.slice(REORDER_PREFIX.length)
      if (draggedId !== targetId) onSceneReorder(draggedId, targetId)
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      <div className="wc-card p-5 mb-4 space-y-3">
        <input
          value={title}
          onChange={e => onTitleChange(e.target.value)}
          placeholder="Name this moment (just for you)"
          className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2.5 text-sm font-medium text-text placeholder:text-text-3 focus:outline-none focus:border-brand"
        />
        <div className="grid grid-cols-2 gap-3">
          <input
            value={senderName}
            onChange={e => onSenderNameChange(e.target.value)}
            placeholder="Your name (shown to recipient)"
            className="bg-surface-2 border border-border rounded-lg px-3 py-2.5 text-sm text-text placeholder:text-text-3 focus:outline-none focus:border-brand"
          />
          <input
            value={recipientName}
            onChange={e => onRecipientNameChange(e.target.value)}
            placeholder="Recipient's name (optional)"
            className="bg-surface-2 border border-border rounded-lg px-3 py-2.5 text-sm text-text placeholder:text-text-3 focus:outline-none focus:border-brand"
          />
        </div>
      </div>

      <div className="space-y-2">
        {scenes.map((scene, i) => (
          <div
            key={scene.id}
            onDragOver={e => { e.preventDefault(); setDragOverId(scene.id) }}
            onDragLeave={() => setDragOverId(prev => (prev === scene.id ? null : prev))}
            onDrop={e => handleDrop(e, scene.id)}
            className={`rounded-2xl transition-shadow ${dragOverId === scene.id ? 'ring-2 ring-brand ring-offset-2' : ''}`}
          >
            <div className="flex gap-1.5 items-start">
              <button
                type="button"
                draggable
                onDragStart={e => e.dataTransfer.setData('text/plain', `${REORDER_PREFIX}${scene.id}`)}
                className="hidden sm:flex mt-4 shrink-0 w-6 h-8 rounded-md items-center justify-center text-text-3 hover:text-text-2 cursor-grab active:cursor-grabbing"
                aria-label="Drag to reorder"
              >
                <GripVertical className="w-4 h-4" />
              </button>
              <div className="flex-1 min-w-0">
                <SceneCard
                  scene={scene}
                  index={i}
                  total={scenes.length}
                  onChange={patch => onSceneChange(scene.id, patch)}
                  onRemove={() => onSceneRemove(scene.id)}
                  onMove={dir => onSceneMove(scene.id, dir)}
                  onImageSelect={file => onImageSelect(scene.id, file)}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div
        onDragOver={e => { e.preventDefault(); setDragOverId('__end__') }}
        onDragLeave={() => setDragOverId(prev => (prev === '__end__' ? null : prev))}
        onDrop={e => {
          e.preventDefault()
          setDragOverId(null)
          const payload = e.dataTransfer.getData('text/plain')
          if (payload.startsWith(NEW_SCENE_PREFIX)) onDropNewScene(payload.slice(NEW_SCENE_PREFIX.length) as SceneLayout)
        }}
        className={`h-16 rounded-2xl border-2 border-dashed flex items-center justify-center text-xs font-medium mt-2 transition-colors ${
          dragOverId === '__end__' ? 'border-brand text-brand bg-brand/5' : 'border-border/60 text-text-3'
        }`}
      >
        Drag a scene here, or use the palette on the left
      </div>
    </div>
  )
}
