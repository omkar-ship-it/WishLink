'use client'
import { motion } from 'framer-motion'
import type { Scene } from '@/lib/types'
import { SceneCaption } from './SceneCaption'

interface SceneRendererProps {
  scene: Scene
  accentFrom: string
  accentTo: string
}

/** Renders the content of a single scene — the transition wrapper lives in RevealPlayer. */
export function SceneRenderer({ scene, accentFrom, accentTo }: SceneRendererProps) {
  const bgFrom = scene.background?.from ?? accentFrom
  const bgTo   = scene.background?.to   ?? accentTo

  if (scene.layout === 'video') {
    return (
      <div className="absolute inset-0 overflow-hidden bg-black">
        {scene.videoUrl ? (
          <video
            src={scene.videoUrl}
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0" style={{ background: `linear-gradient(160deg, ${bgFrom} 0%, ${bgTo} 100%)` }} />
        )}
        <SceneCaption heading={scene.heading} body={scene.body} />
      </div>
    )
  }

  if (scene.layout === 'image-only' || scene.layout === 'image-text') {
    return (
      <div className="absolute inset-0 overflow-hidden">
        {scene.imageUrl ? (
          <motion.img
            src={scene.imageUrl}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            initial={{ scale: 1 }}
            animate={{ scale: 1.08 }}
            transition={{ duration: Math.max(scene.durationMs / 1000, 3), ease: 'linear' }}
          />
        ) : (
          <div className="absolute inset-0" style={{ background: `linear-gradient(160deg, ${bgFrom} 0%, ${bgTo} 100%)` }} />
        )}
        <SceneCaption heading={scene.heading} body={scene.body} />
      </div>
    )
  }

  if (scene.layout === 'quote') {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center px-10 text-center"
        style={{ background: `linear-gradient(160deg, ${bgFrom} 0%, ${bgTo} 100%)` }}>
        <span className="font-display text-6xl text-white/40 leading-none mb-2 select-none">&ldquo;</span>
        <p className="font-display text-2xl font-medium text-white leading-snug max-w-sm">
          {scene.body}
        </p>
        {scene.attribution && (
          <p className="text-sm text-white/60 mt-5 tracking-wide">— {scene.attribution}</p>
        )}
      </div>
    )
  }

  // text-only
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center px-10 text-center"
      style={{ background: `linear-gradient(160deg, ${bgFrom} 0%, ${bgTo} 100%)` }}>
      {scene.heading && (
        <p className="font-display text-3xl font-semibold text-white leading-snug mb-3 max-w-sm">{scene.heading}</p>
      )}
      {scene.body && (
        <p className="text-base text-white/80 leading-relaxed max-w-xs">{scene.body}</p>
      )}
    </div>
  )
}
