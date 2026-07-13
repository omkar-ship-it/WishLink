import type { OccasionType, PrivacyMode, Scene, SceneLayout } from './types'

export interface BuilderSnapshot {
  occasion: OccasionType
  title: string
  templateName: string
  recipientName: string
  scenes: Scene[]
  musicTrackId: string | null
  privacyMode: PrivacyMode
  passcode: string
}

export interface CopilotAction {
  id: string
  label: string
  run: () => void
}

export interface CopilotEntry {
  id: string
  text: string
  actions?: CopilotAction[]
}

const TITLE_IDEAS: Record<OccasionType, string[]> = {
  goodwill: ['A thank-you that matters', 'For the kindness you showed', 'You made a difference'],
  birthday: ['Another trip around the sun', 'Happy birthday, truly', "Here's to you today"],
  anniversary: ['Still choosing you', 'To many more years', 'The story keeps growing'],
  wedding: ['Welcome to the story', 'Come celebrate with us', "We'd love you there"],
  housewarming: ['Welcome to our home', 'A new chapter, come see it', 'Our door is open'],
  trip: ['Remember when we...', 'Our trip, together', 'The memories we made'],
}

const OPENING_LINES: Record<OccasionType, { heading: string; body: string }[]> = {
  goodwill: [
    { heading: 'What you did mattered', body: 'It would have been easy to look away. You didn’t.' },
    { heading: 'Thank you, truly', body: 'Some acts of kindness stay with people. This is one of them.' },
  ],
  birthday: [
    { heading: 'Happy birthday', body: 'Another year of being exactly who you are — and that’s worth celebrating.' },
    { heading: 'Today is yours', body: 'Hope it’s full of everything you love.' },
  ],
  anniversary: [
    { heading: 'To us', body: 'Every year adds another reason I’d choose this again.' },
    { heading: 'Still here, still us', body: 'Grateful for every ordinary day that became extraordinary with you.' },
  ],
  wedding: [
    { heading: 'We’re getting married', body: 'And we want you there when we do.' },
    { heading: 'Join our story', body: 'It wouldn’t feel complete without you in it.' },
  ],
  housewarming: [
    { heading: 'Come see our new home', body: 'The walls are still bare, but the welcome is real.' },
    { heading: 'New address, same open door', body: 'We’d love to have you over.' },
  ],
  trip: [
    { heading: 'Remember this?', body: 'Somewhere between the wrong turns and the good views, this became one for the books.' },
    { heading: 'That trip', body: 'Every memory worth keeping, in one place.' },
  ],
}

const nextSceneLayout = (scenes: Scene[]): SceneLayout => (scenes.some(s => s.layout === 'quote') ? 'text-only' : 'quote')

export function getCopilotFeed(
  snapshot: BuilderSnapshot,
  handlers: {
    setTitle: (v: string) => void
    addScene: (layout: SceneLayout) => void
    patchScene: (id: string, patch: Partial<Scene>) => void
    openMusic: () => void
    openPrivacy: () => void
  },
): CopilotEntry[] {
  const entries: CopilotEntry[] = []

  if (!snapshot.title.trim() || snapshot.title === snapshot.templateName) {
    entries.push({
      id: 'title',
      text: 'Still deciding on a title? Here are a few ways to open this moment.',
      actions: TITLE_IDEAS[snapshot.occasion].map(idea => ({
        id: idea,
        label: `"${idea}"`,
        run: () => handlers.setTitle(idea),
      })),
    })
  }

  if (snapshot.scenes.length <= 2) {
    entries.push({
      id: 'scene-count',
      text: 'Most moments land best with 3–5 scenes — enough to build up to something, not so many it drags.',
      actions: [{ id: 'add-scene', label: 'Add another scene', run: () => handlers.addScene(nextSceneLayout(snapshot.scenes)) }],
    })
  }

  const emptyScene = snapshot.scenes.find(s => s.layout !== 'image-only' && !s.heading?.trim() && !s.body?.trim())
  if (emptyScene) {
    const line = OPENING_LINES[snapshot.occasion][0]
    entries.push({
      id: `line-${emptyScene.id}`,
      text: 'One of your scenes is still blank — want a starting line to build from?',
      actions: [{
        id: 'use-line',
        label: `Use "${line.heading}"`,
        run: () => handlers.patchScene(emptyScene.id, { heading: line.heading, body: line.body }),
      }],
    })
  }

  if (!snapshot.musicTrackId) {
    entries.push({
      id: 'music',
      text: 'A little music underneath tends to make the reveal feel more personal.',
      actions: [{ id: 'open-music', label: 'Pick a track', run: handlers.openMusic }],
    })
  }

  if (snapshot.recipientName.trim() && snapshot.privacyMode === 'open' && !snapshot.passcode.trim()) {
    entries.push({
      id: 'privacy',
      text: `Want this just for ${snapshot.recipientName.trim()}? You can lock it to their email, a passcode, or both.`,
      actions: [{ id: 'open-privacy', label: 'Set up privacy', run: handlers.openPrivacy }],
    })
  }

  if (entries.length === 0) {
    entries.push({
      id: 'ready',
      text: 'This is ready to make someone’s day — give it a preview before you send it on.',
    })
  }

  return entries
}
