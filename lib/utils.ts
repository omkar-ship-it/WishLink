import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const SLUG_ALPHABET = 'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789'

/** Short, URL-safe, non-sequential id for shareable card links — avoids 0/O/1/I/l ambiguity. */
export function generateSlug(length = 9): string {
  let slug = ''
  for (let i = 0; i < length; i++) {
    slug += SLUG_ALPHABET[Math.floor(Math.random() * SLUG_ALPHABET.length)]
  }
  return slug
}

// Blends two hex colors — used to derive tints/shades from an occasion's brand color
export function hexMix(hex1: string, hex2: string, t: number) {
  const p1 = parseInt(hex1.slice(1), 16), p2 = parseInt(hex2.slice(1), 16)
  const r = Math.round(((p1 >> 16) & 255) * (1 - t) + ((p2 >> 16) & 255) * t)
  const g = Math.round(((p1 >> 8) & 255) * (1 - t) + ((p2 >> 8) & 255) * t)
  const b = Math.round((p1 & 255) * (1 - t) + (p2 & 255) * t)
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
}

export function formatDate(d: string | Date) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}
