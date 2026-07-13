'use client'
import { Sparkles } from 'lucide-react'
import type { CopilotEntry } from '@/lib/copilot'

export function CopilotPanel({ entries }: { entries: CopilotEntry[] }) {
  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="flex items-center gap-2 mb-1">
        <Sparkles className="w-4 h-4 text-brand" />
        <p className="text-sm font-semibold text-text">Co-pilot</p>
      </div>
      <p className="text-xs text-text-3 mb-4">A few ideas, drawn from what you&apos;ve built so far — nothing leaves your device.</p>

      <div className="space-y-2.5">
        {entries.map(entry => (
          <div key={entry.id} className="wc-card p-3.5">
            <p className="text-sm text-text leading-snug mb-2.5">{entry.text}</p>
            {entry.actions && entry.actions.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {entry.actions.map(action => (
                  <button
                    key={action.id}
                    type="button"
                    onClick={action.run}
                    className="px-2.5 py-1.5 rounded-lg bg-brand/10 text-brand text-xs font-semibold hover:bg-brand/15 transition-colors"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
