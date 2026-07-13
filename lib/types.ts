export type OccasionType =
  | 'goodwill'
  | 'birthday'
  | 'anniversary'
  | 'wedding'
  | 'housewarming'
  | 'trip'

/** Curated transition library — deliberately small so every combination still feels cinematic, not generic. */
export type SceneTransition = 'fade' | 'slide-up' | 'zoom-reveal' | 'curtain' | 'iris'

export type SceneLayout = 'text-only' | 'image-only' | 'image-text' | 'quote' | 'video'

/**
 * The gesture a recipient performs before a scene's content is revealed.
 * Absent/'auto' is the original behavior — the scene's duration timer starts
 * immediately on mount, exactly as it always has. Every other value gates
 * that timer behind the matching interaction in components/reveal/interactions/.
 * 'swipe-through' is the one exception: it's a content-presentation variant
 * (a mini gallery playing out during the beat), not a reveal gate, so its
 * timer still starts immediately like 'auto'.
 */
export type InteractionType =
  | 'auto'
  | 'tap-open'
  | 'scratch-reveal'
  | 'drag-open'
  | 'swipe-through'
  | 'hold-reveal'
  | 'flip-card'
  | 'countdown'

/**
 * The one primitive every card is built from, regardless of occasion.
 * A "template" is just a pre-filled sequence of these — same engine, no bespoke code per occasion.
 */
export interface Scene {
  id: string
  layout: SceneLayout
  transition: SceneTransition
  /** How long this scene holds before auto-advancing (ms), counted from the moment it's revealed. Recipient can also tap to advance early. */
  durationMs: number
  /** Reveal gesture gating this scene's content. Absent means 'auto' — no gate, matches every scene created before this field existed. */
  interaction?: InteractionType
  heading?: string
  body?: string
  /** Small attribution line under a quote — e.g. "— Maya Angelou" or the sender's name */
  attribution?: string
  imageUrl?: string
  /** Multiple photos to swipe through — only used when interaction is 'swipe-through'. */
  imageUrls?: string[]
  /** Only used when layout is 'video'. */
  videoUrl?: string
  /** Only used when interaction is 'countdown'. Defaults to 3 if absent. */
  countdownFrom?: number
  /** Background treatment when there's no image — a gradient pair tinted to the occasion's accent */
  background?: { from: string; to: string }
}

export interface MusicTrack {
  id: string
  title: string
  artist: string
  fileUrl: string
  durationSec: number
  licenseNote: string
  occasionTags: OccasionType[]
}

export interface OccasionMeta {
  type: OccasionType
  label: string
  tagline: string
  emoji: string
  accentFrom: string
  accentTo: string
}

export interface CardTemplate {
  id: string
  occasion: OccasionType
  name: string
  description: string
  defaultMusicTrackId: string
  scenes: Scene[]
}

export type PrivacyMode = 'open' | 'email_gated'

export interface Card {
  id: string
  senderId: string
  senderName: string
  occasion: OccasionType
  title: string
  recipientName?: string
  scenes: Scene[]
  musicTrackId: string | null
  privacyMode: PrivacyMode
  recipientEmail?: string | null
  /** Independent lock, combinable with either privacyMode — set to require a shared passcode before reveal. */
  passcode?: string
  shareSlug: string
  viewCount: number
  createdAt: string
}
