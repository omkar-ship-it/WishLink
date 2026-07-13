'use client'
import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { InteractionType, Scene } from '@/lib/types'
import { getSceneMotion } from './transitions'
import { InteractionGate } from './InteractionGate'

interface RevealPlayerProps {
  scenes: Scene[]
  accentFrom: string
  accentTo: string
  /** Fires once the recipient has moved past the last scene. */
  onComplete: () => void
}

/** Interactions that must be satisfied before a scene's duration timer starts. 'swipe-through' is deliberately excluded — it's a content variant, not a reveal gate. */
const GATING_INTERACTIONS: InteractionType[] = ['tap-open', 'scratch-reveal', 'drag-open', 'hold-reveal', 'flip-card', 'countdown']

function needsGate(interaction: InteractionType | undefined): boolean {
  return !!interaction && GATING_INTERACTIONS.includes(interaction)
}

/**
 * The scene sequencer — Instagram-Stories-style progress bars up top, tap
 * left/right half to go back/forward, auto-advances per scene.durationMs
 * once the scene is "revealed" (immediately, for scenes with no gesture gate).
 * This is the one engine every occasion template plays through.
 */
export function RevealPlayer({ scenes, accentFrom, accentTo, onComplete }: RevealPlayerProps) {
  const [index, setIndex] = useState(0)
  const scene = scenes[index]
  const [revealed, setRevealed] = useState(() => !needsGate(scene?.interaction))
  const [revealedForIndex, setRevealedForIndex] = useState(index)

  // Reset the reveal gate when the scene changes — adjusting state during
  // render (not in an effect) avoids an extra cascading render on every advance.
  if (index !== revealedForIndex) {
    setRevealedForIndex(index)
    setRevealed(!needsGate(scenes[index]?.interaction))
  }

  const advance = () => {
    if (index >= scenes.length - 1) {
      onComplete()
    } else {
      setIndex(i => i + 1)
    }
  }

  const back = () => {
    setIndex(i => Math.max(0, i - 1))
  }

  useEffect(() => {
    if (!scene || !revealed) return
    const timer = setTimeout(advance, scene.durationMs)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, revealed])

  if (!scene) return null

  const motionConfig = getSceneMotion(scene.transition)

  return (
    <div className="fixed inset-0 bg-black overflow-hidden select-none">
      {/* Progress bars */}
      <div className="absolute top-3 left-3 right-3 z-30 flex gap-1.5">
        {scenes.map((s, i) => (
          <div key={s.id} className="h-1 flex-1 rounded-full bg-white/25 overflow-hidden">
            {i < index && <div className="h-full w-full bg-white" />}
            {i === index && revealed && (
              <motion.div
                key={index}
                className="h-full bg-white"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: scene.durationMs / 1000, ease: 'linear' }}
              />
            )}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={scene.id}
          className="absolute inset-0"
          initial={motionConfig.variants.initial}
          animate={motionConfig.variants.animate}
          exit={motionConfig.variants.exit}
          transition={motionConfig.transition}
        >
          <InteractionGate
            scene={scene}
            accentFrom={accentFrom}
            accentTo={accentTo}
            revealed={revealed}
            onReveal={() => setRevealed(true)}
          />
        </motion.div>
      </AnimatePresence>

      {/* Tap zones — left third rewinds, right two-thirds advances (Stories convention).
          While a gesture is unsatisfied, the "advance" zone steps aside so the gesture underneath gets the pointer events. */}
      <div className="absolute inset-0 z-20 flex">
        <button aria-label="Previous scene" className="w-1/3 h-full" onClick={back} />
        <button
          aria-label="Next scene"
          className="w-2/3 h-full"
          onClick={revealed ? advance : undefined}
          style={revealed ? undefined : { pointerEvents: 'none' }}
        />
      </div>
    </div>
  )
}
