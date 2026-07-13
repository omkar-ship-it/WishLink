'use client'
import { useEffect, useRef, useState } from 'react'
import { Sparkles } from 'lucide-react'
import type { Scene } from '@/lib/types'
import { SceneRenderer } from '../SceneRenderer'

interface ScratchRevealProps {
  scene: Scene
  accentFrom: string
  accentTo: string
  onReveal: () => void
}

const REVEAL_DISTANCE = 700

export function ScratchReveal({ scene, accentFrom, accentTo, onReveal }: ScratchRevealProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const distanceRef = useRef(0)
  const lastPoint = useRef<{ x: number; y: number } | null>(null)
  const [done, setDone] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = container.clientWidth
      canvas.height = container.clientHeight
      ctx.fillStyle = '#c9c9d1'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])

  const erase = (x: number, y: number) => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    ctx.globalCompositeOperation = 'destination-out'
    ctx.beginPath()
    ctx.arc(x, y, 34, 0, Math.PI * 2)
    ctx.fill()
  }

  const handleMove = (clientX: number, clientY: number) => {
    if (done) return
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = clientX - rect.left
    const y = clientY - rect.top
    erase(x, y)

    if (lastPoint.current) {
      distanceRef.current += Math.hypot(x - lastPoint.current.x, y - lastPoint.current.y)
      if (distanceRef.current > REVEAL_DISTANCE) {
        setDone(true)
        onReveal()
      }
    }
    lastPoint.current = { x, y }
  }

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden">
      <SceneRenderer scene={scene} accentFrom={accentFrom} accentTo={accentTo} />
      {!done && (
        <>
          <canvas
            ref={canvasRef}
            className="absolute inset-0 touch-none cursor-grab active:cursor-grabbing"
            onPointerDown={e => handleMove(e.clientX, e.clientY)}
            onPointerMove={e => { if (e.buttons > 0) handleMove(e.clientX, e.clientY) }}
            onPointerUp={() => { lastPoint.current = null }}
          />
          <div className="absolute inset-x-0 top-10 flex flex-col items-center gap-2 text-white pointer-events-none">
            <Sparkles className="w-5 h-5" />
            <p className="text-sm font-semibold tracking-wide">Scratch to reveal</p>
          </div>
        </>
      )}
    </div>
  )
}
