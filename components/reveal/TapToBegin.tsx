'use client'
import { motion } from 'framer-motion'
import { Volume2 } from 'lucide-react'

interface TapToBeginProps {
  senderName: string
  occasionLabel: string
  occasionEmoji: string
  accentFrom: string
  accentTo: string
  /** Called synchronously on tap — the caller should start audio playback in this same handler (autoplay policies require it). */
  onBegin: () => void
}

/**
 * The first screen a recipient sees. Two jobs: (1) satisfy iOS/Safari's rule
 * that audio can only start from a direct user gesture, and (2) answer "is
 * this actually a gift and not spam" before they commit to tapping anything.
 */
export function TapToBegin({ senderName, occasionLabel, occasionEmoji, accentFrom, accentTo, onBegin }: TapToBeginProps) {
  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center px-8 text-center"
      style={{ background: `linear-gradient(160deg, ${accentFrom} 0%, ${accentTo} 100%)` }}
    >
      <motion.div
        initial={{ scale: 0, rotate: -12 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 16 }}
        className="text-7xl mb-6 select-none"
      >
        {occasionEmoji}
      </motion.div>

      <p className="text-xs font-semibold tracking-widest uppercase text-white/70 mb-2">{occasionLabel}</p>
      <p className="font-display text-2xl font-semibold text-white leading-snug mb-10 max-w-xs">
        {senderName} sent you something
      </p>

      <motion.button
        onClick={onBegin}
        whileTap={{ scale: 0.95 }}
        animate={{ boxShadow: ['0 0 0 0 rgba(255,255,255,0.35)', '0 0 0 14px rgba(255,255,255,0)'] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
        className="flex items-center gap-2.5 px-7 py-4 rounded-full bg-white font-semibold text-base"
        style={{ color: accentFrom }}
      >
        <Volume2 className="w-4 h-4" />
        Tap to begin
      </motion.button>

      <p className="text-xs text-white/50 mt-5">Best with sound on</p>
    </div>
  )
}
