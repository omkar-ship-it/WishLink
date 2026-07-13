'use client'
import { motion, useAnimation } from 'framer-motion'
import { Gift, ChevronUp } from 'lucide-react'
import type { Scene } from '@/lib/types'

interface DragToOpenProps {
  scene: Scene
  accentFrom: string
  accentTo: string
  onReveal: () => void
}

const REVEAL_OFFSET = -90

export function DragToOpen({ scene, accentFrom, accentTo, onReveal }: DragToOpenProps) {
  const controls = useAnimation()
  const from = scene.background?.from ?? accentFrom
  const to = scene.background?.to ?? accentTo

  const handleDragEnd = async (_: unknown, info: { offset: { y: number }; velocity: { y: number } }) => {
    if (info.offset.y < REVEAL_OFFSET || info.velocity.y < -500) {
      await controls.start({ y: -400, opacity: 0, transition: { duration: 0.35, ease: 'easeIn' } })
      onReveal()
    } else {
      controls.start({ y: 0, transition: { type: 'spring', stiffness: 400, damping: 30 } })
    }
  }

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 text-white overflow-hidden"
      style={{ background: `linear-gradient(160deg, ${from} 0%, ${to} 100%)` }}>
      <motion.div
        drag="y"
        dragConstraints={{ top: -120, bottom: 0 }}
        dragElastic={0.3}
        animate={controls}
        onDragEnd={handleDragEnd}
        whileTap={{ scale: 0.97 }}
        className="w-20 h-20 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center cursor-grab active:cursor-grabbing"
      >
        <Gift className="w-9 h-9" />
      </motion.div>
      <div className="flex flex-col items-center gap-1">
        <ChevronUp className="w-4 h-4 animate-bounce" />
        <p className="text-sm font-semibold tracking-wide">Drag to open</p>
      </div>
    </div>
  )
}
