import type { CardTemplate } from '../types'
import { OCCASION_META } from '../occasions'
import { hexMix } from '../utils'

const { accentFrom, accentTo } = OCCASION_META.anniversary

export const anniversaryTemplate: CardTemplate = {
  id: 'anniversary-default',
  occasion: 'anniversary',
  name: 'Anniversary',
  description: 'Celebrate love that keeps choosing itself, year after year.',
  defaultMusicTrackId: 'warm-strings',
  scenes: [
    {
      id: 'a-1',
      layout: 'text-only',
      transition: 'fade',
      durationMs: 4000,
      heading: 'Another year, still choosing each other',
      background: { from: accentFrom, to: hexMix(accentFrom, '#000000', 0.25) },
    },
    {
      id: 'a-2',
      layout: 'image-text',
      transition: 'curtain',
      durationMs: 5000,
      heading: 'Happy Anniversary',
      body: 'Add a photo from the day it all began.',
      background: { from: hexMix(accentFrom, accentTo, 0.4), to: accentTo },
    },
    {
      id: 'a-3',
      layout: 'quote',
      transition: 'slide-up',
      durationMs: 5000,
      body: 'Every love story is beautiful, but ours is my favourite.',
      background: { from: accentTo, to: hexMix(accentTo, '#000000', 0.3) },
    },
    {
      id: 'a-4',
      layout: 'text-only',
      transition: 'zoom-reveal',
      durationMs: 4000,
      heading: 'Here\'s to many more',
      background: { from: accentFrom, to: accentTo },
    },
  ],
}
