'use client'
import { getTemplate } from '@/lib/templates'
import type { OccasionType } from '@/lib/types'
import type { DraftResult } from '@/lib/copilot-draft'
import { TemplateLibrary } from './TemplateLibrary'
import { CopilotChat } from './CopilotChat'

interface CreateStepProps {
  occasion: OccasionType
  onSelectOccasion: (occasion: OccasionType) => void
  onDraft: (result: DraftResult, recipientName: string) => void
}

export function CreateStep({ occasion, onSelectOccasion, onDraft }: CreateStepProps) {
  const template = getTemplate(occasion)

  return (
    <div className="flex-1 grid grid-cols-1 lg:grid-cols-[320px_1fr] min-h-0">
      <div className="border-r border-border overflow-y-auto p-5">
        <p className="text-xs font-semibold tracking-widest uppercase text-text-3 mb-1">Starting point</p>
        <p className="text-sm text-text-2 mb-4">Pick a template for your co-pilot to build from — you can change everything after.</p>
        <TemplateLibrary value={occasion} onSelect={onSelectOccasion} />
      </div>

      <div className="min-h-0">
        <CopilotChat template={template} onDraft={onDraft} />
      </div>
    </div>
  )
}
