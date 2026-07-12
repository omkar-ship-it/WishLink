import Link from 'next/link'
import { OCCASIONS, OCCASION_META } from '@/lib/occasions'
import { OccasionBadge } from '@/components/art/OccasionBadge'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-3xl mx-auto px-6 pt-20 pb-16 text-center">
        <p className="text-xs font-semibold tracking-widest uppercase text-brand mb-4">WishCards</p>
        <h1 className="font-display text-4xl sm:text-5xl font-semibold text-text leading-tight mb-5">
          Some things deserve<br />more than a text message
        </h1>
        <p className="text-text-2 text-lg max-w-xl mx-auto mb-10">
          Create a personal, animated card — to say thank you, celebrate a moment, or invite someone into yours —
          and send it as a single link. No app to install, nothing for them to sign up for.
        </p>
        <Link
          href="/create"
          className="inline-flex items-center justify-center px-8 py-4 rounded-2xl bg-brand text-white font-semibold text-base shadow-sm shadow-brand/20 hover:bg-brand-l transition-colors"
        >
          Create your first WishCard →
        </Link>
      </div>

      <div className="max-w-3xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {OCCASIONS.map(occasion => {
            const meta = OCCASION_META[occasion]
            return (
              <div key={occasion} className="wc-card p-4 flex flex-col items-center text-center gap-2">
                <OccasionBadge meta={meta} size="md" />
                <p className="text-sm font-semibold text-text">{meta.label}</p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
