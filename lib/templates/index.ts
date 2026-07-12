import type { CardTemplate, OccasionType } from '../types'
import { goodwillTemplate } from './goodwill'
import { birthdayTemplate } from './birthday'
import { anniversaryTemplate } from './anniversary'
import { weddingTemplate } from './wedding'
import { housewarmingTemplate } from './housewarming'
import { tripTemplate } from './trip'

export const TEMPLATES: Record<OccasionType, CardTemplate> = {
  goodwill: goodwillTemplate,
  birthday: birthdayTemplate,
  anniversary: anniversaryTemplate,
  wedding: weddingTemplate,
  housewarming: housewarmingTemplate,
  trip: tripTemplate,
}

export function getTemplate(occasion: OccasionType): CardTemplate {
  return TEMPLATES[occasion]
}
