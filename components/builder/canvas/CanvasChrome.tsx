'use client'
import { useEffect, useRef, useState } from 'react'
import {
  Minus, Plus, Maximize, Sparkles, Hand, Moon, Sun, Keyboard, X,
  Sparkle, Type, Image as ImageIcon, Video as VideoIcon, Music, Wand2, MoreHorizontal,
} from 'lucide-react'
import { MOMENT_TYPES, MOMENT_CATEGORIES } from '@/lib/moment-types'
import { NODE_W, NODE_H, type NodePosition, type Bounds } from './canvas-layout'
import type { Viewport } from './InfiniteCanvasSurface'
import { cn } from '@/lib/utils'

const SHORTCUTS: { keys: string; label: string }[] = [
  { keys: '⌘K', label: 'Ask AI' },
  { keys: 'Delete', label: 'Delete selected moment' },
  { keys: '⌘D', label: 'Duplicate selected moment' },
  { keys: '⌘Z', label: 'Undo' },
  { keys: '⌘⇧Z', label: 'Redo' },
  { keys: '+ / -', label: 'Zoom in / out' },
  { keys: '0', label: 'Zoom to fit' },
]

interface CanvasChromeProps {
  zoomPct: number
  onZoomIn: () => void
  onZoomOut: () => void
  onFit: () => void
  aiOpen: boolean
  onToggleAI: () => void
  dark: boolean
  onToggleDark: () => void
  nodes: NodePosition[]
  bounds: Bounds
  viewport: Viewport
  onRecenter: (point: { x: number; y: number }) => void
  onAddMoment: (id: string) => void
  onAddImage: (file: File) => void
  onAddVideo: (file: File) => void
  onOpenMusic: () => void
}

export function CanvasChrome({
  zoomPct, onZoomIn, onZoomOut, onFit, aiOpen, onToggleAI, dark, onToggleDark,
  nodes, bounds, viewport, onRecenter, onAddMoment, onAddImage, onAddVideo, onOpenMusic,
}: CanvasChromeProps) {
  return (
    <div className="absolute inset-0 pointer-events-none">
      <ZoomCluster zoomPct={zoomPct} onZoomIn={onZoomIn} onZoomOut={onZoomOut} onFit={onFit} aiOpen={aiOpen} onToggleAI={onToggleAI} />
      <BottomRightCluster onFit={onFit} dark={dark} onToggleDark={onToggleDark} />
      <Minimap nodes={nodes} bounds={bounds} viewport={viewport} onRecenter={onRecenter} />
      <BottomBar onAddMoment={onAddMoment} onAddImage={onAddImage} onAddVideo={onAddVideo} onOpenMusic={onOpenMusic} onToggleAI={onToggleAI} />
    </div>
  )
}

function ZoomCluster({ zoomPct, onZoomIn, onZoomOut, onFit, aiOpen, onToggleAI }: Pick<CanvasChromeProps, 'zoomPct' | 'onZoomIn' | 'onZoomOut' | 'onFit' | 'aiOpen' | 'onToggleAI'>) {
  return (
    <div className="absolute top-4 right-4 flex items-center gap-2 pointer-events-auto">
      <div className="flex items-center gap-0.5 bg-white border border-border rounded-xl shadow-sm p-1">
        <IconBtn label="Zoom out" icon={Minus} onClick={onZoomOut} />
        <span className="w-11 text-center text-xs font-semibold text-text-2">{zoomPct}%</span>
        <IconBtn label="Zoom in" icon={Plus} onClick={onZoomIn} />
        <IconBtn label="Fit to screen" icon={Maximize} onClick={onFit} />
      </div>
      <button
        type="button"
        onClick={onToggleAI}
        title="AI Assistant"
        className={cn('w-9 h-9 rounded-xl flex items-center justify-center border transition-colors', aiOpen ? 'bg-brand text-white border-brand' : 'bg-white text-brand border-border hover:border-brand/40')}
      >
        <Sparkles className="w-4 h-4" />
      </button>
    </div>
  )
}

function BottomRightCluster({ onFit, dark, onToggleDark }: Pick<CanvasChromeProps, 'onFit' | 'dark' | 'onToggleDark'>) {
  const [shortcutsOpen, setShortcutsOpen] = useState(false)
  return (
    <div className="absolute bottom-4 right-4 flex items-end gap-2 pointer-events-auto">
      {shortcutsOpen && (
        <div className="mb-1 w-56 bg-white border border-border rounded-2xl shadow-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-text">Keyboard Shortcuts</p>
            <button onClick={() => setShortcutsOpen(false)} className="text-text-3"><X className="w-3.5 h-3.5" /></button>
          </div>
          <div className="space-y-1.5">
            {SHORTCUTS.map(s => (
              <div key={s.label} className="flex items-center justify-between text-xs">
                <span className="text-text-2">{s.label}</span>
                <kbd className="px-1.5 py-0.5 rounded-md bg-surface-2 text-text-3 text-[10px] font-mono">{s.keys}</kbd>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="flex items-center gap-0.5 bg-white border border-border rounded-xl shadow-sm p-1">
        <IconBtn label="Keyboard shortcuts" icon={Keyboard} onClick={() => setShortcutsOpen(v => !v)} active={shortcutsOpen} />
        <IconBtn label="Fit to screen" icon={Hand} onClick={onFit} />
        <IconBtn label={dark ? 'Light canvas' : 'Dark canvas'} icon={dark ? Sun : Moon} onClick={onToggleDark} />
      </div>
    </div>
  )
}

function Minimap({ nodes, bounds, viewport, onRecenter }: Pick<CanvasChromeProps, 'nodes' | 'bounds' | 'viewport' | 'onRecenter'>) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ w: 0, h: 0 })
  const MM_W = 160
  const MM_H = 104

  useEffect(() => {
    const el = wrapRef.current?.parentElement
    if (!el) return
    const ro = new ResizeObserver(entries => {
      const r = entries[0].contentRect
      setSize({ w: r.width, h: r.height })
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const boundsW = Math.max(bounds.maxX - bounds.minX, 1)
  const boundsH = Math.max(bounds.maxY - bounds.minY, 1)
  const mmScale = Math.min((MM_W - 16) / boundsW, (MM_H - 16) / boundsH)
  const toMini = (x: number, y: number) => ({ x: 8 + (x - bounds.minX) * mmScale, y: 8 + (y - bounds.minY) * mmScale })

  const viewMinX = -viewport.x / viewport.scale
  const viewMinY = -viewport.y / viewport.scale
  const viewW = (size.w || 800) / viewport.scale
  const viewH = (size.h || 500) / viewport.scale
  const viewTL = toMini(viewMinX, viewMinY)

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const mx = e.clientX - rect.left
    const my = e.clientY - rect.top
    onRecenter({ x: bounds.minX + (mx - 8) / mmScale, y: bounds.minY + (my - 8) / mmScale })
  }

  return (
    <div ref={wrapRef} className="absolute bottom-4 left-4 pointer-events-auto">
      <div
        onClick={handleClick}
        style={{ width: MM_W, height: MM_H }}
        className="relative bg-white border border-border rounded-xl shadow-sm overflow-hidden cursor-pointer"
      >
        {nodes.map((n, i) => {
          const p = toMini(n.x + NODE_W / 2, n.y + NODE_H / 2)
          return <div key={n.id} style={{ left: p.x - 2, top: p.y - 2 }} className="absolute w-1.5 h-1.5 rounded-full bg-brand" title={`Moment ${i + 1}`} />
        })}
        <div
          style={{ left: viewTL.x, top: viewTL.y, width: Math.max(viewW * mmScale, 8), height: Math.max(viewH * mmScale, 8) }}
          className="absolute border-2 border-brand/70 rounded-sm bg-brand/5"
        />
      </div>
    </div>
  )
}

function BottomBar({ onAddMoment, onAddImage, onAddVideo, onOpenMusic, onToggleAI }: Pick<CanvasChromeProps, 'onAddMoment' | 'onAddImage' | 'onAddVideo' | 'onOpenMusic' | 'onToggleAI'>) {
  const [open, setOpen] = useState<'moment' | null>(null)
  const imageRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLInputElement>(null)

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-auto">
      {open === 'moment' && (
        <div className="mb-2 w-80 max-h-72 overflow-y-auto bg-white border border-border rounded-2xl shadow-lg p-3">
          {MOMENT_CATEGORIES.map(category => (
            <div key={category} className="mb-3 last:mb-0">
              <p className="text-[10px] font-semibold text-text-3 uppercase tracking-wide mb-1.5 px-1">{category}</p>
              <div className="grid grid-cols-4 gap-2">
                {MOMENT_TYPES.filter(m => m.category === category).map(({ id, label, icon: Icon }) => (
                  <button key={id} type="button" onClick={() => { onAddMoment(id); setOpen(null) }}
                    className="flex flex-col items-center gap-1 py-2.5 rounded-xl bg-surface-2 text-text-2 text-[10px] font-semibold hover:bg-brand/10 hover:text-brand transition-colors text-center">
                    <Icon className="w-4 h-4" />
                    <span className="leading-tight">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      <input ref={imageRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) onAddImage(f); e.target.value = '' }} />
      <input ref={videoRef} type="file" accept="video/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) onAddVideo(f); e.target.value = '' }} />

      <div className="flex items-center gap-1 bg-white border border-border rounded-2xl shadow-lg p-1.5">
        <BarButton label="Moment" icon={Sparkle} activeStyle onClick={() => setOpen(o => (o === 'moment' ? null : 'moment'))} />
        <BarButton label="Text" icon={Type} onClick={() => onAddMoment('text')} />
        <BarButton label="Image" icon={ImageIcon} onClick={() => imageRef.current?.click()} />
        <BarButton label="Video" icon={VideoIcon} onClick={() => videoRef.current?.click()} />
        <BarButton label="Audio" icon={Music} onClick={onOpenMusic} />
        <BarButton label="AI Generate" icon={Wand2} onClick={onToggleAI} />
        <BarButton label="More" icon={MoreHorizontal} onClick={() => setOpen(o => (o === 'moment' ? null : 'moment'))} />
      </div>
    </div>
  )
}

function BarButton({ label, icon: Icon, onClick, activeStyle }: { label: string; icon: typeof Sparkle; onClick: () => void; activeStyle?: boolean }) {
  return (
    <button type="button" onClick={onClick} className={cn('flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors', activeStyle ? 'bg-brand text-white' : 'text-text-2 hover:bg-surface-2')}>
      <Icon className="w-4 h-4" />
      <span className="text-[9px] font-semibold leading-none">{label}</span>
    </button>
  )
}

function IconBtn({ label, icon: Icon, onClick, active }: { label: string; icon: typeof Minus; onClick: () => void; active?: boolean }) {
  return (
    <button type="button" title={label} onClick={onClick} className={cn('w-8 h-8 rounded-lg flex items-center justify-center transition-colors', active ? 'bg-brand/10 text-brand' : 'text-text-2 hover:bg-surface-2')}>
      <Icon className="w-4 h-4" />
    </button>
  )
}
