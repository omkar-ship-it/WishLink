'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { KeyRound } from 'lucide-react'

interface PasscodeGateProps {
  senderName: string
  occasionLabel: string
  occasionEmoji: string
  accentFrom: string
  accentTo: string
  expectedPasscode: string
  onVerified: () => void
}

/** Recipient-side passcode gate — one shared secret, one step, no OTP round-trip needed. */
export function PasscodeGate({ senderName, occasionLabel, occasionEmoji, accentFrom, accentTo, expectedPasscode, onVerified }: PasscodeGateProps) {
  const [value, setValue] = useState('')
  const [error, setError] = useState<string | null>(null)

  const submit = () => {
    setError(null)
    if (!value.trim()) return setError('Enter the passcode to continue.')
    if (value.trim().toLowerCase() !== expectedPasscode.trim().toLowerCase()) {
      return setError("That passcode doesn't match.")
    }
    onVerified()
  }

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center px-8 text-center"
      style={{ background: `linear-gradient(160deg, ${accentFrom} 0%, ${accentTo} 100%)` }}
    >
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-xs">
        <p className="text-5xl mb-4 select-none">{occasionEmoji}</p>
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-widest uppercase text-white/70 mb-2">
          <KeyRound className="w-3 h-3" /> Private {occasionLabel}
        </div>
        <p className="font-display text-xl font-semibold text-white mb-6">
          {senderName} locked this with a passcode
        </p>

        <div className="space-y-3">
          <input
            value={value}
            onChange={e => setValue(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && submit()}
            placeholder="Enter the passcode"
            className="w-full bg-white/95 border border-white/20 rounded-xl px-4 py-3 text-sm text-center text-gray-900 placeholder:text-gray-400 focus:outline-none"
          />
          {error && <p className="text-xs text-white bg-black/20 rounded-lg py-2 px-3">{error}</p>}
          <button
            onClick={submit}
            className="w-full py-3.5 rounded-xl bg-white font-semibold text-sm"
            style={{ color: accentFrom }}
          >
            Unlock
          </button>
        </div>
      </motion.div>
    </div>
  )
}
