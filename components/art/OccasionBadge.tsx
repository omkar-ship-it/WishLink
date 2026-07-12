import type { OccasionMeta } from '@/lib/types'

interface OccasionBadgeProps {
  meta: OccasionMeta
  size?: 'sm' | 'md' | 'lg'
}

const SIZES = {
  sm: { box: 'w-10 h-10', text: 'text-lg' },
  md: { box: 'w-14 h-14', text: 'text-2xl' },
  lg: { box: 'w-20 h-20', text: 'text-4xl' },
}

/** Reusable decorative badge for an occasion — used in the picker, dashboard list, and card previews. */
export function OccasionBadge({ meta, size = 'md' }: OccasionBadgeProps) {
  const s = SIZES[size]
  return (
    <div
      className={`${s.box} rounded-2xl flex items-center justify-center shrink-0`}
      style={{ background: `linear-gradient(160deg, ${meta.accentFrom} 0%, ${meta.accentTo} 100%)` }}
    >
      <span className={`${s.text} select-none`}>{meta.emoji}</span>
    </div>
  )
}
