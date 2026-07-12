import type { Card } from './types'
import { generateSlug } from './utils'
import { getTemplate } from './templates'

const STORAGE_KEY = 'wishcards.mock-cards.v1'

/**
 * Design-prototype "database" — cards live in the browser's localStorage,
 * nothing is sent to a server. Good enough to demo the full create -> share
 * -> reveal loop end to end without any backend to stand up.
 */
function seedCards(): Card[] {
  const now = new Date().toISOString()
  return [
    {
      id: 'seed-1',
      senderId: 'demo-sender',
      senderName: 'Aditi',
      occasion: 'goodwill',
      title: 'Thank you, Rohan',
      recipientName: 'Rohan',
      scenes: getTemplate('goodwill').scenes,
      musicTrackId: getTemplate('goodwill').defaultMusicTrackId,
      privacyMode: 'open',
      recipientEmail: null,
      shareSlug: 'demo-thankyou',
      viewCount: 12,
      createdAt: now,
    },
    {
      id: 'seed-2',
      senderId: 'demo-sender',
      senderName: 'Priya',
      occasion: 'birthday',
      title: "Happy Birthday, Meera!",
      recipientName: 'Meera',
      scenes: getTemplate('birthday').scenes,
      musicTrackId: getTemplate('birthday').defaultMusicTrackId,
      privacyMode: 'email_gated',
      recipientEmail: 'meera@example.com',
      shareSlug: 'demo-birthday',
      viewCount: 3,
      createdAt: now,
    },
  ]
}

function readAll(): Card[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    // fall through to reseed
  }
  const seeded = seedCards()
  writeAll(seeded)
  return seeded
}

function writeAll(cards: Card[]) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cards))
}

export function listCards(): Card[] {
  return [...readAll()].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
}

export function getCard(slug: string): Card | undefined {
  return readAll().find(c => c.shareSlug === slug)
}

export function saveCard(input: Omit<Card, 'id' | 'shareSlug' | 'viewCount' | 'createdAt'>): Card {
  const all = readAll()
  let slug = generateSlug()
  while (all.some(c => c.shareSlug === slug)) slug = generateSlug()

  const card: Card = {
    ...input,
    id: crypto.randomUUID(),
    shareSlug: slug,
    viewCount: 0,
    createdAt: new Date().toISOString(),
  }
  writeAll([card, ...all])
  return card
}

export function incrementViewCount(slug: string) {
  const all = readAll()
  const idx = all.findIndex(c => c.shareSlug === slug)
  if (idx === -1) return
  all[idx] = { ...all[idx], viewCount: all[idx].viewCount + 1 }
  writeAll(all)
}
