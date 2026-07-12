import type { CardTemplate } from '../types'
import { OCCASION_META } from '../occasions'
import { hexMix } from '../utils'

const { accentFrom, accentTo } = OCCASION_META.birthday

export const birthdayTemplate: CardTemplate = {
  id: 'birthday-default',
  occasion: 'birthday',
  name: 'Happy Birthday',
  description: 'Celebrate another trip around the sun with a little fanfare.',
  defaultMusicTrackId: 'upbeat-celebration',
  scenes: [
    {
      id: 'b-1',
      layout: 'text-only',
      transition: 'zoom-reveal',
      durationMs: 3500,
      heading: 'It\'s that day again 🎉',
      background: { from: accentFrom, to: hexMix(accentFrom, '#000000', 0.2) },
    },
    {
      id: 'b-2',
      layout: 'image-text',
      transition: 'iris',
      durationMs: 4500,
      heading: 'Happy Birthday!',
      body: 'Add a photo from a favourite memory together.',
      background: { from: hexMix(accentFrom, accentTo, 0.4), to: accentTo },
    },
    {
      id: 'b-3',
      layout: 'quote',
      transition: 'slide-up',
      durationMs: 4500,
      body: 'Here\'s to another year of being exactly who you are.',
      attribution: 'with love',
      background: { from: accentTo, to: hexMix(accentTo, '#000000', 0.25) },
    },
    {
      id: 'b-4',
      layout: 'text-only',
      transition: 'fade',
      durationMs: 4000,
      heading: 'Hope your day is as wonderful as you are',
      background: { from: accentFrom, to: accentTo },
    },
  ],
}
