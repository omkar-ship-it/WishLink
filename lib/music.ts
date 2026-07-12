import type { MusicTrack } from './types'

/**
 * Placeholder music library. `fileUrl` paths point at /public/music/*, which
 * is NOT included in this repo — background music needs licensed tracks
 * (Epidemic Sound, Artlist, or a genuinely royalty-free source), not
 * arbitrary MP3s, since these cards get shared publicly. Drop real files at
 * these paths (or swap in your own URLs) before launch. See README.
 */
export const MUSIC_TRACKS: MusicTrack[] = [
  {
    id: 'gentle-piano',
    title: 'Gentle Piano',
    artist: 'TBD — needs a licensed track',
    fileUrl: '/music/gentle-piano.mp3',
    durationSec: 60,
    licenseNote: 'PLACEHOLDER — replace with a licensed track before launch',
    occasionTags: ['goodwill', 'anniversary', 'housewarming'],
  },
  {
    id: 'warm-strings',
    title: 'Warm Strings',
    artist: 'TBD — needs a licensed track',
    fileUrl: '/music/warm-strings.mp3',
    durationSec: 60,
    licenseNote: 'PLACEHOLDER — replace with a licensed track before launch',
    occasionTags: ['wedding', 'anniversary'],
  },
  {
    id: 'upbeat-celebration',
    title: 'Upbeat Celebration',
    artist: 'TBD — needs a licensed track',
    fileUrl: '/music/upbeat-celebration.mp3',
    durationSec: 60,
    licenseNote: 'PLACEHOLDER — replace with a licensed track before launch',
    occasionTags: ['birthday', 'housewarming'],
  },
  {
    id: 'adventure-acoustic',
    title: 'Adventure Acoustic',
    artist: 'TBD — needs a licensed track',
    fileUrl: '/music/adventure-acoustic.mp3',
    durationSec: 60,
    licenseNote: 'PLACEHOLDER — replace with a licensed track before launch',
    occasionTags: ['trip'],
  },
]

export function getMusicTrack(id: string | null | undefined): MusicTrack | undefined {
  return MUSIC_TRACKS.find(t => t.id === id)
}
