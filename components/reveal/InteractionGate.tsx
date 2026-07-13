'use client'
import type { Scene } from '@/lib/types'
import { SceneRenderer } from './SceneRenderer'
import { TapToOpen } from './interactions/TapToOpen'
import { ScratchReveal } from './interactions/ScratchReveal'
import { DragToOpen } from './interactions/DragToOpen'
import { HoldToReveal } from './interactions/HoldToReveal'
import { FlipCard } from './interactions/FlipCard'
import { Countdown } from './interactions/Countdown'
import { SwipeThroughRenderer } from './interactions/SwipeThroughRenderer'

interface InteractionGateProps {
  scene: Scene
  accentFrom: string
  accentTo: string
  /** Whether this scene's gesture (if any) has already been satisfied. Ignored for 'swipe-through', which never gates. */
  revealed: boolean
  onReveal: () => void
}

/** Dispatches a scene to its gesture treatment (if any) or straight to SceneRenderer. */
export function InteractionGate({ scene, accentFrom, accentTo, revealed, onReveal }: InteractionGateProps) {
  if (scene.interaction === 'swipe-through') {
    return <SwipeThroughRenderer scene={scene} accentFrom={accentFrom} accentTo={accentTo} />
  }

  if (!revealed) {
    switch (scene.interaction) {
      case 'tap-open':
        return <TapToOpen scene={scene} accentFrom={accentFrom} accentTo={accentTo} onReveal={onReveal} />
      case 'scratch-reveal':
        return <ScratchReveal scene={scene} accentFrom={accentFrom} accentTo={accentTo} onReveal={onReveal} />
      case 'drag-open':
        return <DragToOpen scene={scene} accentFrom={accentFrom} accentTo={accentTo} onReveal={onReveal} />
      case 'hold-reveal':
        return <HoldToReveal scene={scene} accentFrom={accentFrom} accentTo={accentTo} onReveal={onReveal} />
      case 'flip-card':
        return <FlipCard scene={scene} accentFrom={accentFrom} accentTo={accentTo} onReveal={onReveal} />
      case 'countdown':
        return <Countdown scene={scene} accentFrom={accentFrom} accentTo={accentTo} onReveal={onReveal} />
    }
  }

  return <SceneRenderer scene={scene} accentFrom={accentFrom} accentTo={accentTo} />
}
