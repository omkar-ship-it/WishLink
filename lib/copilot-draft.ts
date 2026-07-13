import type { CardTemplate, Scene } from './types'
import { MUSIC_TRACKS } from './music'
import { OPENING_LINES, TITLE_IDEAS } from './copilot'

export interface ExtractedFields {
  recipientName: string
  memories: string[]
  songQuery: string
  matchedTrackId: string | null
  endingTone: 'emotional' | 'funny' | 'grand' | 'simple' | 'warm'
}

const RELATIONSHIP_WORDS = ['wife', 'husband', 'partner', 'friend', 'mom', 'mother', 'dad', 'father', 'sister', 'brother', 'colleague', 'boss', 'teacher', 'mentor']

const TONE_KEYWORDS: { tone: ExtractedFields['endingTone']; words: string[] }[] = [
  { tone: 'emotional', words: ['emotional', 'tears', 'moving', 'heartfelt', 'meaningful'] },
  { tone: 'funny', words: ['funny', 'laugh', 'silly', 'goofy', 'hilarious'] },
  { tone: 'grand', words: ['grand', 'epic', 'big', 'unforgettable', 'surprise'] },
  { tone: 'simple', words: ['simple', 'quiet', 'small', 'low-key', 'understated'] },
]

const MEMORY_TRIGGERS = ['our ', 'when we ', 'remember ', 'that time ', 'the trip to ']

/** Deterministic, regex/keyword-only extraction — no network call, no real NLU. */
export function extractFieldsFromMessage(message: string): ExtractedFields {
  const text = message.trim()

  let recipientName = ''
  const relationshipMatch = text.match(new RegExp(`\\b(?:${RELATIONSHIP_WORDS.join('|')})\\s+([A-Z][a-zA-Z'-]+)`, 'i'))
  if (relationshipMatch) {
    recipientName = relationshipMatch[1]
  } else {
    const forMatch = text.match(/\bfor\s+(?:my |our )?[a-z]*\s*([A-Z][a-zA-Z'-]+)/)
    if (forMatch) recipientName = forMatch[1]
  }

  const memories: string[] = []
  for (const trigger of MEMORY_TRIGGERS) {
    const idx = text.toLowerCase().indexOf(trigger)
    if (idx === -1) continue
    const clause = text.slice(idx, idx + 120).split(/[.!?]/)[0].trim()
    if (clause && !memories.includes(clause)) memories.push(clause)
    if (memories.length >= 3) break
  }

  let songQuery = ''
  let matchedTrackId: string | null = null
  const songMatch = text.match(/\b(?:song|music|play)\b[^.!?]*/i)
  if (songMatch) {
    songQuery = songMatch[0].trim()
    const found = MUSIC_TRACKS.find(t => text.toLowerCase().includes(t.title.toLowerCase()) || text.toLowerCase().includes(t.artist.toLowerCase()))
    matchedTrackId = found?.id ?? null
  }

  let endingTone: ExtractedFields['endingTone'] = 'warm'
  const lower = text.toLowerCase()
  for (const { tone, words } of TONE_KEYWORDS) {
    if (words.some(w => lower.includes(w))) { endingTone = tone; break }
  }

  return { recipientName, memories, songQuery, matchedTrackId, endingTone }
}

export interface DraftResult {
  title: string
  scenes: Scene[]
  musicTrackId: string | null
}

/** Rotates a curated interaction across a cloned template's scenes for texture — deterministic, not random. */
function assignInteractions(scenes: Scene[], hasMultiplePhotos: boolean): Scene[] {
  return scenes.map((scene, i) => {
    if (i === 0) return { ...scene, interaction: 'tap-open' }
    if (i === scenes.length - 1) return { ...scene, interaction: 'auto' }
    if (i === 1) return { ...scene, interaction: hasMultiplePhotos ? 'swipe-through' : 'scratch-reveal' }
    return { ...scene, interaction: 'flip-card' }
  })
}

/** Drafts a full scene sequence from a template + extracted chat fields — a deterministic clone-and-substitute, not real generation. */
export function draftCardFromChat({
  template,
  fields,
  photos,
}: {
  template: CardTemplate
  fields: ExtractedFields
  photos: string[]
}): DraftResult {
  const occasion = template.occasion
  const openingLines = OPENING_LINES[occasion]
  const clonedScenes: Scene[] = template.scenes.map((scene, i) => {
    const line = openingLines[i % openingLines.length]
    const memory = fields.memories[i]
    return {
      ...scene,
      id: crypto.randomUUID(),
      heading: scene.heading ? (line?.heading ?? scene.heading) : scene.heading,
      body: memory ? `${line?.body ?? scene.body ?? ''} ${memory}.`.trim() : (scene.body ? (line?.body ?? scene.body) : scene.body),
    }
  })

  const withInteractions = assignInteractions(clonedScenes, photos.length > 1)

  if (photos.length > 0) {
    const photoSceneIndex = withInteractions.findIndex(s => s.interaction === 'swipe-through') !== -1
      ? withInteractions.findIndex(s => s.interaction === 'swipe-through')
      : 1
    if (withInteractions[photoSceneIndex]) {
      if (photos.length > 1) {
        withInteractions[photoSceneIndex] = { ...withInteractions[photoSceneIndex], layout: 'image-only', interaction: 'swipe-through', imageUrls: photos }
      } else {
        withInteractions[photoSceneIndex] = { ...withInteractions[photoSceneIndex], imageUrl: photos[0] }
      }
    }
  }

  const title = fields.recipientName
    ? `For ${fields.recipientName}`
    : TITLE_IDEAS[occasion][0]

  return {
    title,
    scenes: withInteractions,
    musicTrackId: fields.matchedTrackId ?? template.defaultMusicTrackId,
  }
}

export function blankDraftFromTemplate(template: CardTemplate): DraftResult {
  return {
    title: template.name,
    scenes: template.scenes.map(s => ({ ...s, id: crypto.randomUUID() })),
    musicTrackId: template.defaultMusicTrackId,
  }
}
