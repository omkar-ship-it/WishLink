'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Lock } from 'lucide-react'

interface EmailGateProps {
  senderName: string
  occasionLabel: string
  occasionEmoji: string
  accentFrom: string
  accentTo: string
  /** The email the card was addressed to — matched client-side since this is a design prototype, not a real security boundary. */
  expectedEmail: string
  onVerified: () => void
}

type Step = 'email' | 'code'

/**
 * Recipient-side privacy gate. In the real product this is backed by a
 * server-verified OTP emailed to the recipient; here (design prototype, no
 * backend) it's a faithful mock of that same two-step interaction — any
 * 6-digit code unlocks once the email matches, so the flow can still be
 * demoed end to end.
 */
export function EmailGate({ senderName, occasionLabel, occasionEmoji, accentFrom, accentTo, expectedEmail, onVerified }: EmailGateProps) {
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)

  const requestCode = () => {
    setError(null)
    if (!email.trim()) return setError('Enter your email to continue.')
    if (email.trim().toLowerCase() !== expectedEmail.toLowerCase()) {
      return setError('That email doesn\'t match this invite.')
    }
    setStep('code')
  }

  const verifyCode = () => {
    setError(null)
    if (!/^\d{6}$/.test(code.trim())) return setError('Enter the 6-digit code.')
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
          <Lock className="w-3 h-3" /> Private {occasionLabel}
        </div>
        <p className="font-display text-xl font-semibold text-white mb-6">
          {senderName} sent this just for you
        </p>

        {step === 'email' ? (
          <div className="space-y-3">
            <input
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && requestCode()}
              type="email"
              placeholder="Enter your email to unlock"
              className="w-full bg-white/95 border border-white/20 rounded-xl px-4 py-3 text-sm text-center text-gray-900 placeholder:text-gray-400 focus:outline-none"
            />
            {error && <p className="text-xs text-white bg-black/20 rounded-lg py-2 px-3">{error}</p>}
            <button
              onClick={requestCode}
              className="w-full py-3.5 rounded-xl bg-white font-semibold text-sm"
              style={{ color: accentFrom }}
            >
              Send me a code
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-white/60 mb-1">Prototype mode — enter any 6-digit code</p>
            <input
              value={code}
              onChange={e => setCode(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && verifyCode()}
              inputMode="numeric"
              placeholder="123456"
              className="w-full bg-white/95 border border-white/20 rounded-xl px-4 py-3 text-center text-lg tracking-[0.3em] font-semibold text-gray-900 focus:outline-none"
            />
            {error && <p className="text-xs text-white bg-black/20 rounded-lg py-2 px-3">{error}</p>}
            <button
              onClick={verifyCode}
              className="w-full py-3.5 rounded-xl bg-white font-semibold text-sm"
              style={{ color: accentFrom }}
            >
              Unlock my card
            </button>
            <button onClick={() => setStep('email')} className="w-full text-center text-xs text-white/50">
              Use a different email
            </button>
          </div>
        )}
      </motion.div>
    </div>
  )
}
