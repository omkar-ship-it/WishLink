'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { FlipHorizontal2 } from 'lucide-react'
import type { Scene } from '@/lib/types'
import { SceneRenderer } from '../SceneRenderer'

interface FlipCardProps {
  scene: Scene
  accentFrom: string
  accentTo: string
  onReveal: () => void
}

export function FlipCard({ scene, accentFrom, accentTo, onReveal }: FlipCardProps) {
  const [flipped, setFlipped] = useState(false)
  const from = scene.background?.from ?? accentFrom
  const to = scene.background?.to ?? accentTo

  return (
    <div className="absolute inset-0" style={{ perspective: 1200 }}>
      <motion.div
        className="absolute inset-0"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.7, ease: [0.65, 0, 0.35, 1] }}
        onAnimationComplete={() => { if (flipped) onReveal() }}
      >
        <button
          onClick={() => setFlipped(true)}
          className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-white"
          style={{ background: `linear-gradient(160deg, ${from} 0%, ${to} 100%)`, backfaceVisibility: 'hidden' }}
        >
          <FlipHorizontal2 className="w-8 h-8" />
          <p className="text-sm font-semibold tracking-wide">Tap to flip</p>
        </button>
        <div
          className="absolute inset-0"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <SceneRenderer scene={scene} accentFrom={accentFrom} accentTo={accentTo} />
        </div>
      </motion.div>
    </div>
  )
}
