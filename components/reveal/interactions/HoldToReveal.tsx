'use client'
import { useRef, useState } from 'react'
import { motion, useAnimation } from 'framer-motion'
import { Fingerprint } from 'lucide-react'
import type { Scene } from '@/lib/types'

interface HoldToRevealProps {
  scene: Scene
  accentFrom: string
  accentTo: string
  onReveal: () => void
}

const CIRCUMFERENCE = 2 * Math.PI * 34
const HOLD_MS = 1200

export function HoldToReveal({ scene, accentFrom, accentTo, onReveal }: HoldToRevealProps) {
  const controls = useAnimation()
  const [holding, setHolding] = useState(false)
  const doneRef = useRef(false)
  const from = scene.background?.from ?? accentFrom
  const to = scene.background?.to ?? accentTo

  const start = () => {
    if (doneRef.current) return
    setHolding(true)
    controls.start({
      strokeDashoffset: 0,
      transition: { duration: HOLD_MS / 1000, ease: 'linear' },
    }).then(() => {
      if (!doneRef.current) {
        doneRef.current = true
        onReveal()
      }
    })
  }

  const cancel = () => {
    if (doneRef.current) return
    setHolding(false)
    controls.start({ strokeDashoffset: CIRCUMFERENCE, transition: { duration: 0.3 } })
  }

  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-white select-none"
      style={{ background: `linear-gradient(160deg, ${from} 0%, ${to} 100%)` }}
      onPointerDown={start}
      onPointerUp={cancel}
      onPointerLeave={cancel}
    >
      <div className="relative w-20 h-20 flex items-center justify-center">
        <svg width="80" height="80" className="absolute inset-0 -rotate-90">
          <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="4" />
          <motion.circle
            cx="40" cy="40" r="34" fill="none" stroke="white" strokeWidth="4"
            strokeDasharray={CIRCUMFERENCE}
            initial={{ strokeDashoffset: CIRCUMFERENCE }}
            animate={controls}
            strokeLinecap="round"
          />
        </svg>
        <Fingerprint className={`w-7 h-7 transition-transform ${holding ? 'scale-110' : ''}`} />
      </div>
      <p className="text-sm font-semibold tracking-wide">Hold to reveal</p>
    </div>
  )
}
