import { Mail, ScrollText, Gift, Images, Fingerprint, FlipHorizontal2, Timer, Video, Type, Quote as QuoteIcon, type LucideIcon } from 'lucide-react'
import type { InteractionType, SceneLayout } from './types'

export const INTERACTION_META: Record<InteractionType, { label: string; hint: string | null }> = {
  auto: { label: 'Auto-play', hint: null },
  'tap-open': { label: 'Tap to Open', hint: 'Tap to open' },
  'scratch-reveal': { label: 'Scratch to Reveal', hint: 'Scratch to reveal' },
  'drag-open': { label: 'Drag to Open', hint: 'Drag to open' },
  'swipe-through': { label: 'Swipe Through', hint: 'Swipe to explore' },
  'hold-reveal': { label: 'Hold to Reveal', hint: 'Hold to reveal' },
  'flip-card': { label: 'Flip Card', hint: 'Tap to flip' },
  countdown: { label: 'Countdown', hint: 'Watch it count down' },
}

export type MomentCategory = 'Reveal & Discover' | 'Story & Memory' | 'Auto-Play'

export interface MomentTypeDef {
  id: string
  label: string
  icon: LucideIcon
  layout: SceneLayout
  interaction: InteractionType
  category: MomentCategory
  blurb: string
}

export const MOMENT_TYPES: MomentTypeDef[] = [
  { id: 'text', label: 'Text Moment', icon: Type, layout: 'text-only', interaction: 'auto', category: 'Auto-Play', blurb: 'A simple heartfelt message' },
  { id: 'quote', label: 'Quote', icon: QuoteIcon, layout: 'quote', interaction: 'auto', category: 'Auto-Play', blurb: 'Words worth pausing on' },
  { id: 'letter', label: 'Letter', icon: Mail, layout: 'text-only', interaction: 'tap-open', category: 'Reveal & Discover', blurb: 'Tap to open, like an envelope' },
  { id: 'photo-reveal', label: 'Photo Reveal', icon: Mail, layout: 'image-text', interaction: 'tap-open', category: 'Reveal & Discover', blurb: 'A photo that unveils on tap' },
  { id: 'scratch-card', label: 'Scratch Card', icon: ScrollText, layout: 'image-only', interaction: 'scratch-reveal', category: 'Reveal & Discover', blurb: 'Scratch away the surface' },
  { id: 'gift-reveal', label: 'Gift Reveal', icon: Gift, layout: 'image-only', interaction: 'drag-open', category: 'Reveal & Discover', blurb: 'Drag to unwrap' },
  { id: 'photo-gallery', label: 'Photo Gallery', icon: Images, layout: 'image-only', interaction: 'swipe-through', category: 'Story & Memory', blurb: 'A handful of photos to swipe through' },
  { id: 'hold-reveal', label: 'Hold to Reveal', icon: Fingerprint, layout: 'quote', interaction: 'hold-reveal', category: 'Reveal & Discover', blurb: 'Press and hold to bring it into view' },
  { id: 'flip-card', label: 'Flip Card', icon: FlipHorizontal2, layout: 'text-only', interaction: 'flip-card', category: 'Reveal & Discover', blurb: 'Tap to flip it over' },
  { id: 'countdown', label: 'Countdown', icon: Timer, layout: 'text-only', interaction: 'countdown', category: 'Reveal & Discover', blurb: 'Builds anticipation before the reveal' },
  { id: 'video-message', label: 'Video Message', icon: Video, layout: 'video', interaction: 'auto', category: 'Story & Memory', blurb: 'A short video, straight from you' },
]

export const MOMENT_CATEGORIES: MomentCategory[] = ['Reveal & Discover', 'Story & Memory', 'Auto-Play']

const FALLBACK_MOMENT_TYPE = MOMENT_TYPES[0]

export function getMomentType(layout: SceneLayout, interaction: InteractionType | undefined): MomentTypeDef {
  const resolved = interaction ?? 'auto'
  return MOMENT_TYPES.find(m => m.layout === layout && m.interaction === resolved)
    ?? MOMENT_TYPES.find(m => m.interaction === resolved)
    ?? FALLBACK_MOMENT_TYPE
}
