'use client'
import { motion } from 'framer-motion'
import { Mail } from 'lucide-react'
import type { Scene } from '@/lib/types'

interface TapToOpenProps {
  scene: Scene
  accentFrom: string
  accentTo: string
  onReveal: () => void
}

export function TapToOpen({ scene, accentFrom, accentTo, onReveal }: TapToOpenProps) {
  const from = scene.background?.from ?? accentFrom
  const to = scene.background?.to ?? accentTo

  return (
    <button
      onClick={onReveal}
      className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-white"
      style={{ background: `linear-gradient(160deg, ${from} 0%, ${to} 100%)` }}
    >
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center"
      >
        <Mail className="w-7 h-7" />
      </motion.div>
      <p className="text-sm font-semibold tracking-wide">Tap to open</p>
    </button>
  )
}
