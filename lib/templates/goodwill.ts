import type { CardTemplate } from '../types'
import { OCCASION_META } from '../occasions'
import { hexMix } from '../utils'

const { accentFrom, accentTo } = OCCASION_META.goodwill

export const goodwillTemplate: CardTemplate = {
  id: 'goodwill-default',
  occasion: 'goodwill',
  name: 'Thank You',
  description: 'Acknowledge someone who went out of their way, quietly and without being asked.',
  defaultMusicTrackId: 'gentle-piano',
  scenes: [
    {
      id: 'g-1',
      layout: 'text-only',
      transition: 'fade',
      durationMs: 4000,
      heading: 'Some things deserve to be said out loud',
      background: { from: accentFrom, to: hexMix(accentFrom, '#000000', 0.25) },
    },
    {
      id: 'g-2',
      layout: 'quote',
      transition: 'slide-up',
      durationMs: 5000,
      body: 'What you did mattered more than you know.',
      attribution: 'from someone who noticed',
      background: { from: hexMix(accentFrom, accentTo, 0.4), to: accentTo },
    },
    {
      id: 'g-3',
      layout: 'text-only',
      transition: 'zoom-reveal',
      durationMs: 5000,
      heading: 'Thank you',
      body: 'For the effort no one asked you to make, and the kindness you didn’t have to show.',
      background: { from: accentTo, to: hexMix(accentTo, '#000000', 0.3) },
    },
    {
      id: 'g-4',
      layout: 'image-text',
      transition: 'curtain',
      durationMs: 4500,
      heading: 'Consider this your acknowledgement',
      body: 'Add a photo here — a moment, a memory, or just something that made you smile.',
      background: { from: accentFrom, to: accentTo },
    },
  ],
}
