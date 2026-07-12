import type { CardTemplate } from '../types'
import { OCCASION_META } from '../occasions'
import { hexMix } from '../utils'

const { accentFrom, accentTo } = OCCASION_META.housewarming

export const housewarmingTemplate: CardTemplate = {
  id: 'housewarming-default',
  occasion: 'housewarming',
  name: 'House-warming',
  description: 'Welcome someone into your new home.',
  defaultMusicTrackId: 'gentle-piano',
  scenes: [
    {
      id: 'h-1',
      layout: 'text-only',
      transition: 'fade',
      durationMs: 3800,
      heading: 'We have a new home 🏡',
      background: { from: accentFrom, to: hexMix(accentFrom, '#000000', 0.2) },
    },
    {
      id: 'h-2',
      layout: 'image-text',
      transition: 'curtain',
      durationMs: 5000,
      heading: 'Come warm it with us',
      body: 'Add a photo of your new place.',
      background: { from: hexMix(accentFrom, accentTo, 0.4), to: accentTo },
    },
    {
      id: 'h-3',
      layout: 'text-only',
      transition: 'slide-up',
      durationMs: 4200,
      heading: 'Details',
      body: 'Add the date, address, and anything your guests should know.',
      background: { from: accentTo, to: hexMix(accentTo, '#000000', 0.25) },
    },
    {
      id: 'h-4',
      layout: 'quote',
      transition: 'zoom-reveal',
      durationMs: 4000,
      body: 'A house needs people in it to really become a home.',
      background: { from: accentFrom, to: accentTo },
    },
  ],
}
