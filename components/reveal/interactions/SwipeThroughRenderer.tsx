'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Scene } from '@/lib/types'
import { SceneCaption } from '../SceneCaption'

interface SwipeThroughRendererProps {
  scene: Scene
  accentFrom: string
  accentTo: string
}

const SWIPE_THRESHOLD = 60

export function SwipeThroughRenderer({ scene, accentFrom, accentTo }: SwipeThroughRendererProps) {
  const photos = scene.imageUrls && scene.imageUrls.length > 0 ? scene.imageUrls : (scene.imageUrl ? [scene.imageUrl] : [])
  const [index, setIndex] = useState(0)
  const bgFrom = scene.background?.from ?? accentFrom
  const bgTo = scene.background?.to ?? accentTo

  if (photos.length === 0) {
    return (
      <div className="absolute inset-0" style={{ background: `linear-gradient(160deg, ${bgFrom} 0%, ${bgTo} 100%)` }}>
        <SceneCaption heading={scene.heading} body={scene.body} />
      </div>
    )
  }

  const go = (dir: 1 | -1) => setIndex(i => Math.min(photos.length - 1, Math.max(0, i + dir)))

  return (
    <div className="absolute inset-0 overflow-hidden bg-black">
      <AnimatePresence initial={false}>
        <motion.img
          key={index}
          src={photos[index]}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.6}
          onDragEnd={(_, info) => {
            if (info.offset.x < -SWIPE_THRESHOLD) go(1)
            else if (info.offset.x > SWIPE_THRESHOLD) go(-1)
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        />
      </AnimatePresence>

      <div className="absolute top-4 inset-x-0 flex items-center justify-center gap-1.5 z-10">
        {photos.map((_, i) => (
          <span key={i} className={`h-1.5 rounded-full transition-all ${i === index ? 'w-5 bg-white' : 'w-1.5 bg-white/40'}`} />
        ))}
      </div>

      <SceneCaption heading={scene.heading} body={scene.body} />
    </div>
  )
}
