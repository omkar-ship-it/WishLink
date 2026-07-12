import type { OccasionMeta, OccasionType } from './types'

export const OCCASIONS: OccasionType[] = [
  'goodwill',
  'birthday',
  'anniversary',
  'wedding',
  'housewarming',
  'trip',
]

export const OCCASION_META: Record<OccasionType, OccasionMeta> = {
  goodwill: {
    type: 'goodwill',
    label: 'Goodwill & Thanks',
    tagline: 'Acknowledge a selfless act or extraordinary kindness',
    emoji: '💛',
    accentFrom: '#E8557A',
    accentTo: '#B33355',
  },
  birthday: {
    type: 'birthday',
    label: 'Birthday',
    tagline: 'Celebrate another trip around the sun',
    emoji: '🎂',
    accentFrom: '#F5A623',
    accentTo: '#E07A1F',
  },
  anniversary: {
    type: 'anniversary',
    label: 'Anniversary',
    tagline: 'Celebrate love that keeps growing',
    emoji: '💍',
    accentFrom: '#9D2F52',
    accentTo: '#6B1D38',
  },
  wedding: {
    type: 'wedding',
    label: 'Wedding & Engagement',
    tagline: 'Invite them into your story',
    emoji: '💐',
    accentFrom: '#C9A05C',
    accentTo: '#8C6F32',
  },
  housewarming: {
    type: 'housewarming',
    label: 'House-warming',
    tagline: 'Welcome them to your new home',
    emoji: '🏡',
    accentFrom: '#C97C5D',
    accentTo: '#8A5A3D',
  },
  trip: {
    type: 'trip',
    label: 'Group Trip Memories',
    tagline: 'Relive the trip, together',
    emoji: '🧭',
    accentFrom: '#2E8F8F',
    accentTo: '#1D6363',
  },
}
