# WishCards (design prototype)

Create a personal, animated card — to acknowledge kindness, celebrate a moment, or invite someone into yours — and send it as a single link.

This is a **design prototype**: it demonstrates the full designed experience end to end in a real browser, but there's no backend. No accounts, no server, no database. Cards you create are saved to your browser's `localStorage` — good enough to click through the entire create → share → reveal loop yourself, not to actually send a card to someone else's device.

## Stack

Next.js (App Router) + TypeScript + Tailwind v4 + Framer Motion. That's it — no Supabase, no auth, no API routes.

## How the product is built

The core insight driving the architecture: every occasion (goodwill, birthday, anniversary, wedding, house-warming, trip memories) uses **the same engine**. A card is just a sequence of `Scene`s (`lib/types.ts`) — each one a layout (`text-only` / `quote` / `image-text` / `image-only`), a transition, and a duration. "Templates" (`lib/templates/*.ts`) are nothing more than pre-filled scene sequences on top of that same engine — not bespoke code per occasion. That's what makes 6 occasions tractable instead of 6 separate builds.

- `components/reveal/` — the recipient-facing engine: `RevealPlayer` (the Stories-style sequencer), `SceneRenderer` (renders one scene), `transitions.ts` (a deliberately small, curated set of 5 transitions — kept small on purpose so arbitrary user-composed scenes still feel cinematic, not like a generic slideshow), `TapToBegin` (the first-touch gate, required for audio autoplay on iOS and doubles as the "is this actually a gift" trust moment), `PayItForward` (the viral loop — shown right after the reveal finishes), `EmailGate` (the recipient-side privacy gate UI for private cards).
- `components/builder/` — the sender-facing scene editor (`CardBuilder`, `SceneCard`, `MusicPicker`, `OccasionPicker`).
- `lib/templates/` — the 6 occasion presets. Adding a 7th occasion later is a new template file, not new engine code.
- `lib/mock-store.ts` — the prototype's "database": reads/writes cards to `localStorage`, seeded with two example cards on first load.
- `app/c/[slug]/` — the public reveal route, looked up client-side from the mock store.

## Try it

```
npm install
npm run dev
```

- `/` — landing page
- `/create` — pick an occasion, build a card, publish it (generates a `/c/[slug]` link)
- `/dashboard` — "My Cards" — everything you've created in this browser
- `/c/demo-thankyou` — a seeded example (open card, no gate)
- `/c/demo-birthday` — a seeded example with the privacy gate on (any email works as `meera@example.com`, any 6-digit code unlocks it — see below)

Since everything lives in `localStorage`, a card created in one browser won't open in another, and clearing site data wipes it. That's expected for a prototype, not a bug.

## What's mocked vs. what's real design work

The pieces that are genuinely the product's design/UX — the scene engine, the reveal player and its transitions, the tap-to-begin gate, the pay-it-forward loop, the builder, all 6 occasion templates — are real, working code, not static mockups. What's mocked is only the infrastructure a backend would normally provide:

- **No accounts.** There's no sign-in; every card is attributed to a fixed demo sender.
- **No real image hosting.** Uploaded photos are read as data URLs and stored inline in `localStorage`, not uploaded anywhere.
- **No real privacy gate.** `EmailGate` faithfully reproduces the two-step "enter your email → enter the code" interaction, but it's checked client-side against the card's stored recipient email, and any 6-digit code passes the second step — there's no real OTP being emailed.
- **No real background music.** `lib/music.ts` points at `/public/music/*.mp3`, which don't exist in this repo — add real (licensed) files there to hear it play.
- **No Open Graph preview image** for shared links, since that needs server-side rendering of per-card data.

## Turning this into the real product

The natural next step is a real backend (Supabase is a good fit — Postgres + built-in email OTP auth + storage in one place) so that:
- accounts and cards persist server-side instead of per-browser,
- the recipient email gate is backed by a real emailed OTP,
- uploaded images go to real object storage instead of inline data URLs,
- and shared links work across devices and browsers, not just the one that created them.

None of the engine/design work above needs to change for that — `CardBuilder`'s save step and `/c/[slug]`'s lookup are the only two places that would swap a `localStorage` call for a network call.
