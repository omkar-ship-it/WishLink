'use client'
import { motion } from 'framer-motion'
import { OCCASIONS, OCCASION_META } from '@/lib/occasions'
import { OccasionBadge } from '@/components/art/OccasionBadge'
import type { OccasionType } from '@/lib/types'

interface TemplateLibraryProps {
  value: OccasionType
  onSelect: (occasion: OccasionType) => void
}

export function TemplateLibrary({ value, onSelect }: TemplateLibraryProps) {
  return (
    <div className="grid grid-cols-2 gap-2.5">
      {OCCASIONS.map((occasion, i) => {
        const meta = OCCASION_META[occasion]
        const active = occasion === value
        return (
          <motion.button
            key={occasion}
            type="button"
            onClick={() => onSelect(occasion)}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-colors ${
              active ? 'border-brand bg-brand/5' : 'border-border hover:border-brand/30'
            }`}
          >
            <OccasionBadge meta={meta} size="sm" />
            <p className="text-xs font-semibold text-text leading-tight">{meta.label}</p>
          </motion.button>
        )
      })}
    </div>
  )
}
