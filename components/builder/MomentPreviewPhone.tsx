'use client'
import type { Scene } from '@/lib/types'
import { InteractionGate } from '@/components/reveal/InteractionGate'

interface MomentPreviewPhoneProps {
  scene: Scene | undefined
  accentFrom: string
  accentTo: string
}

/** Static, non-autoplaying preview of one scene — reflects live edits, no timer, not a second playback engine. */
export function MomentPreviewPhone({ scene, accentFrom, accentTo }: MomentPreviewPhoneProps) {
  return (
    <div className="flex flex-col items-center py-6 px-4">
      <div className="relative w-[220px] h-[460px] rounded-[2rem] border-[6px] border-text bg-black overflow-hidden shadow-lg">
        <div className="absolute top-0 inset-x-0 h-5 flex items-center justify-center z-10">
          <div className="w-16 h-3.5 rounded-full bg-text" />
        </div>
        {scene ? (
          <InteractionGate scene={scene} accentFrom={accentFrom} accentTo={accentTo} revealed onReveal={() => {}} />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-white/50 text-xs">
            Select a moment to preview
          </div>
        )}
      </div>
      <p className="text-xs text-text-3 mt-3 text-center">Live preview — updates as you edit. Full sequence plays in Preview.</p>
    </div>
  )
}
