'use client'
import {
  createContext, useContext, useRef, useState, useCallback, useImperativeHandle, forwardRef,
  type ReactNode, type PointerEvent as ReactPointerEvent, type WheelEvent as ReactWheelEvent,
} from 'react'
import type { Bounds } from './canvas-layout'

export interface Viewport { x: number; y: number; scale: number }

const ViewportContext = createContext<Viewport>({ x: 0, y: 0, scale: 1 })
export const useCanvasViewport = () => useContext(ViewportContext)

export interface InfiniteCanvasHandle {
  zoomIn: () => void
  zoomOut: () => void
  zoomTo: (scale: number) => void
  fitToContent: (bounds: Bounds) => void
  recenterOn: (point: { x: number; y: number }) => void
}

interface InfiniteCanvasSurfaceProps {
  children: ReactNode
  overlays?: ReactNode
  /** Fired on a plain click (not a drag) on empty canvas background — canvas-space coordinates. */
  onBackgroundClick?: (point: { x: number; y: number }) => void
  className?: string
  style?: React.CSSProperties
  onViewportChange?: (viewport: Viewport) => void
  cursor?: string
}

const MIN_SCALE = 0.35
const MAX_SCALE = 2

export const InfiniteCanvasSurface = forwardRef<InfiniteCanvasHandle, InfiniteCanvasSurfaceProps>(
  function InfiniteCanvasSurface({ children, overlays, onBackgroundClick, className, style, onViewportChange, cursor }, ref) {
    const containerRef = useRef<HTMLDivElement>(null)
    const [viewport, setViewport] = useState<Viewport>({ x: 160, y: 100, scale: 0.85 })
    const panState = useRef<{ startX: number; startY: number; originX: number; originY: number } | null>(null)
    const [panning, setPanning] = useState(false)
    const draggedRef = useRef(false)

    const emit = useCallback((v: Viewport) => { setViewport(v); onViewportChange?.(v) }, [onViewportChange])

    useImperativeHandle(ref, () => ({
      zoomIn: () => emit({ ...viewport, scale: Math.min(MAX_SCALE, viewport.scale * 1.15) }),
      zoomOut: () => emit({ ...viewport, scale: Math.max(MIN_SCALE, viewport.scale / 1.15) }),
      zoomTo: scale => emit({ ...viewport, scale: Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale)) }),
      fitToContent: bounds => {
        const el = containerRef.current
        if (!el) return
        const rect = el.getBoundingClientRect()
        const contentW = Math.max(bounds.maxX - bounds.minX, 1)
        const contentH = Math.max(bounds.maxY - bounds.minY, 1)
        const scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, Math.min(rect.width / (contentW + 220), rect.height / (contentH + 220))))
        const x = rect.width / 2 - (bounds.minX + contentW / 2) * scale
        const y = rect.height / 2 - (bounds.minY + contentH / 2) * scale
        emit({ x, y, scale })
      },
      recenterOn: point => {
        const el = containerRef.current
        if (!el) return
        const rect = el.getBoundingClientRect()
        emit({ x: rect.width / 2 - point.x * viewport.scale, y: rect.height / 2 - point.y * viewport.scale, scale: viewport.scale })
      },
    }), [viewport, emit])

    const handleWheel = (e: ReactWheelEvent) => {
      e.preventDefault()
      const el = containerRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const cx = e.clientX - rect.left
      const cy = e.clientY - rect.top
      const nextScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, viewport.scale * (1 - e.deltaY * 0.001)))
      const worldX = (cx - viewport.x) / viewport.scale
      const worldY = (cy - viewport.y) / viewport.scale
      emit({ x: cx - worldX * nextScale, y: cy - worldY * nextScale, scale: nextScale })
    }

    const handlePointerDown = (e: ReactPointerEvent) => {
      if (e.target !== e.currentTarget) return
      ;(e.target as Element).setPointerCapture(e.pointerId)
      panState.current = { startX: e.clientX, startY: e.clientY, originX: viewport.x, originY: viewport.y }
      draggedRef.current = false
      setPanning(true)
    }
    const handlePointerMove = (e: ReactPointerEvent) => {
      if (!panState.current) return
      const dx = e.clientX - panState.current.startX
      const dy = e.clientY - panState.current.startY
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) draggedRef.current = true
      emit({ ...viewport, x: panState.current.originX + dx, y: panState.current.originY + dy })
    }
    const handlePointerUp = (e: ReactPointerEvent) => {
      if (panState.current && !draggedRef.current && onBackgroundClick) {
        const rect = containerRef.current!.getBoundingClientRect()
        const cx = e.clientX - rect.left
        const cy = e.clientY - rect.top
        onBackgroundClick({ x: (cx - viewport.x) / viewport.scale, y: (cy - viewport.y) / viewport.scale })
      }
      panState.current = null
      setPanning(false)
    }

    return (
      <div
        ref={containerRef}
        className={className}
        style={{ position: 'relative', overflow: 'hidden', touchAction: 'none', cursor: cursor ?? (panning ? 'grabbing' : 'grab'), ...style }}
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <div style={{ position: 'absolute', left: 0, top: 0, transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.scale})`, transformOrigin: '0 0' }}>
          <ViewportContext.Provider value={viewport}>{children}</ViewportContext.Provider>
        </div>
        {overlays}
      </div>
    )
  },
)
