import { OccasionPicker } from '@/components/builder/OccasionPicker'

export default function CreatePage() {
  return (
    <div className="min-h-screen bg-bg px-6 py-12">
      <div className="max-w-2xl mx-auto">
        <p className="text-xs font-semibold tracking-widest uppercase text-brand mb-2">New card</p>
        <h1 className="font-display text-3xl font-semibold text-text mb-2">What's the occasion?</h1>
        <p className="text-text-2 mb-8">Pick a starting point — you can add, remove, or rewrite every scene after.</p>
        <OccasionPicker />
      </div>
    </div>
  )
}
