'use client'
import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { Scene } from '@/lib/types'

interface CountdownProps {
  scene: Scene
  accentFrom: string
  accentTo: string
  onReveal: () => void
}

const BEAT_MS = 650

export function Countdown({ scene, accentFrom, accentTo, onReveal }: CountdownProps) {
  const startFrom = scene.countdownFrom ?? 3
  const [count, setCount] = useState(startFrom)
  const from = scene.background?.from ?? accentFrom
  const to = scene.background?.to ?? accentTo

  useEffect(() => {
    if (count <= 0) {
      onReveal()
      return
    }
    const timer = setTimeout(() => setCount(c => c - 1), BEAT_MS)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count])

  return (
    <div className="absolute inset-0 flex items-center justify-center"
      style={{ background: `linear-gradient(160deg, ${from} 0%, ${to} 100%)` }}>
      <AnimatePresence mode="wait">
        <motion.p
          key={count}
          initial={{ opacity: 0, scale: 1.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.6 }}
          transition={{ duration: 0.35 }}
          className="font-display text-8xl font-bold text-white select-none"
        >
          {count > 0 ? count : ''}
        </motion.p>
      </AnimatePresence>
    </div>
  )
}
