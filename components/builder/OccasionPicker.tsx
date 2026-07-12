'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { OCCASIONS, OCCASION_META } from '@/lib/occasions'
import { OccasionBadge } from '@/components/art/OccasionBadge'

export function OccasionPicker() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
      {OCCASIONS.map((occasion, i) => {
        const meta = OCCASION_META[occasion]
        return (
          <motion.div
            key={occasion}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Link
              href={`/create/${occasion}`}
              className="wc-card wc-card-hover flex items-center gap-4 p-5 transition-all"
            >
              <OccasionBadge meta={meta} size="md" />
              <div>
                <p className="font-display font-semibold text-text text-lg leading-tight">{meta.label}</p>
                <p className="text-sm text-text-2 mt-0.5">{meta.tagline}</p>
              </div>
            </Link>
          </motion.div>
        )
      })}
    </div>
  )
}
