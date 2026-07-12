import type { CardTemplate } from '../types'
import { OCCASION_META } from '../occasions'
import { hexMix } from '../utils'

const { accentFrom, accentTo } = OCCASION_META.wedding

export const weddingTemplate: CardTemplate = {
  id: 'wedding-default',
  occasion: 'wedding',
  name: 'Wedding Invite',
  description: 'Invite someone into your story.',
  defaultMusicTrackId: 'warm-strings',
  scenes: [
    {
      id: 'w-1',
      layout: 'text-only',
      transition: 'fade',
      durationMs: 4000,
      heading: 'We\'re getting married',
      background: { from: accentFrom, to: hexMix(accentFrom, '#000000', 0.2) },
    },
    {
      id: 'w-2',
      layout: 'image-text',
      transition: 'iris',
      durationMs: 5000,
      heading: 'And we\'d love for you to be there',
      body: 'Add a photo of the two of you.',
      background: { from: hexMix(accentFrom, accentTo, 0.4), to: accentTo },
    },
    {
      id: 'w-3',
      layout: 'text-only',
      transition: 'slide-up',
      durationMs: 4500,
      heading: 'Save the date',
      body: 'Add the date, venue, and any details your guest needs.',
      background: { from: accentTo, to: hexMix(accentTo, '#000000', 0.25) },
    },
    {
      id: 'w-4',
      layout: 'quote',
      transition: 'zoom-reveal',
      durationMs: 4000,
      body: 'Come celebrate the beginning of forever with us.',
      background: { from: accentFrom, to: accentTo },
    },
  ],
}
