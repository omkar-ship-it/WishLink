'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'

interface PayItForwardProps {
  accentFrom: string
  accentTo: string
}

/**
 * Shown immediately after the reveal finishes, while the recipient is still
 * emotionally warm. This is the entire viral loop: recipient -> sender.
 */
export function PayItForward({ accentFrom, accentTo }: PayItForwardProps) {
  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center px-8 text-center"
      style={{ background: `linear-gradient(160deg, ${accentTo} 0%, ${accentFrom} 100%)` }}
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <p className="text-4xl mb-5">✨</p>
        <p className="font-display text-2xl font-semibold text-white leading-snug mb-2 max-w-xs mx-auto">
          Someone else deserves a moment like this too
        </p>
        <p className="text-sm text-white/70 mb-10 max-w-xs mx-auto">
          Pass it on — thank someone, celebrate someone, or just let them know you're thinking of them.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="w-full max-w-xs space-y-3"
      >
        <Link
          href="/create"
          className="block w-full py-4 rounded-2xl font-semibold text-base text-center bg-white"
          style={{ color: accentFrom }}
        >
          Create your own WishCard →
        </Link>
        <Link
          href="/"
          className="block w-full py-2 text-sm text-white/60 text-center"
        >
          Maybe later
        </Link>
      </motion.div>
    </div>
  )
}
