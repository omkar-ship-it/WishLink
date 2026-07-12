'use client'
import { useRef, useState } from 'react'
import { TapToBegin } from '@/components/reveal/TapToBegin'
import { RevealPlayer } from '@/components/reveal/RevealPlayer'
import { PayItForward } from '@/components/reveal/PayItForward'
import { getMusicTrack } from '@/lib/music'
import { OCCASION_META } from '@/lib/occasions'
import type { Scene, OccasionType } from '@/lib/types'

interface CardExperienceProps {
  senderName: string
  occasion: OccasionType
  scenes: Scene[]
  musicTrackId: string | null
}

type Stage = 'gate' | 'playing' | 'done'

/** Orchestrates the recipient's full journey once the card data is available (open, or unlocked via the email gate). */
export function CardExperience({ senderName, occasion, scenes, musicTrackId }: CardExperienceProps) {
  const [stage, setStage] = useState<Stage>('gate')
  const audioRef = useRef<HTMLAudioElement>(null)
  const meta = OCCASION_META[occasion]
  const track = getMusicTrack(musicTrackId)

  const begin = () => {
    audioRef.current?.play().catch(() => {}) // must be called synchronously from the tap handler for iOS
    setStage('playing')
  }

  return (
    <>
      {track && <audio ref={audioRef} src={track.fileUrl} loop preload="auto" />}

      {stage === 'gate' && (
        <TapToBegin
          senderName={senderName}
          occasionLabel={meta.label}
          occasionEmoji={meta.emoji}
          accentFrom={meta.accentFrom}
          accentTo={meta.accentTo}
          onBegin={begin}
        />
      )}

      {stage === 'playing' && (
        <RevealPlayer
          scenes={scenes}
          accentFrom={meta.accentFrom}
          accentTo={meta.accentTo}
          onComplete={() => { audioRef.current?.pause(); setStage('done') }}
        />
      )}

      {stage === 'done' && (
        <PayItForward accentFrom={meta.accentFrom} accentTo={meta.accentTo} />
      )}
    </>
  )
}
