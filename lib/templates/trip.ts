import type { CardTemplate } from '../types'
import { OCCASION_META } from '../occasions'
import { hexMix } from '../utils'

const { accentFrom, accentTo } = OCCASION_META.trip

export const tripTemplate: CardTemplate = {
  id: 'trip-default',
  occasion: 'trip',
  name: 'Trip Memories',
  description: 'Relive a group trip through its best moments.',
  defaultMusicTrackId: 'adventure-acoustic',
  scenes: [
    {
      id: 't-1',
      layout: 'text-only',
      transition: 'fade',
      durationMs: 3800,
      heading: 'Remember when we...',
      background: { from: accentFrom, to: hexMix(accentFrom, '#000000', 0.2) },
    },
    {
      id: 't-2',
      layout: 'image-only',
      transition: 'zoom-reveal',
      durationMs: 4500,
      background: { from: hexMix(accentFrom, accentTo, 0.4), to: accentTo },
    },
    {
      id: 't-3',
      layout: 'image-text',
      transition: 'iris',
      durationMs: 5000,
      heading: 'That one moment none of us will forget',
      body: 'Add your favourite photo from the trip.',
      background: { from: accentTo, to: hexMix(accentTo, '#000000', 0.25) },
    },
    {
      id: 't-4',
      layout: 'quote',
      transition: 'slide-up',
      durationMs: 4200,
      body: 'The best trips aren\'t about the places — they\'re about who you\'re with.',
      background: { from: accentFrom, to: accentTo },
    },
  ],
}
