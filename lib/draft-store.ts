import type { OccasionType, PrivacyMode, Scene } from './types'

const KEY = 'wishcards.draft.v1'

export interface BuilderDraft {
  occasion: OccasionType
  title: string
  recipientName: string
  senderName: string
  scenes: Scene[]
  musicTrackId: string | null
  privacyMode: PrivacyMode
  recipientEmail: string
  passcodeEnabled: boolean
  passcode: string
  savedAt: string
}

/** Autosaves the in-progress builder state so a refresh mid-edit doesn't lose work —
 * single slot, per-browser, matching the rest of the prototype's no-accounts model. */
export function readDraft(): BuilderDraft | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as BuilderDraft) : null
  } catch {
    return null
  }
}

export function writeDraft(draft: Omit<BuilderDraft, 'savedAt'>) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(KEY, JSON.stringify({ ...draft, savedAt: new Date().toISOString() }))
}

export function clearDraft() {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(KEY)
}
