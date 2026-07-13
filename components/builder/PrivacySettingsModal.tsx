'use client'
import { Lock, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { PrivacyMode } from '@/lib/types'

interface PrivacySettingsModalProps {
  privacyMode: PrivacyMode
  onPrivacyModeChange: (mode: PrivacyMode) => void
  recipientEmail: string
  onRecipientEmailChange: (v: string) => void
  passcodeEnabled: boolean
  onPasscodeEnabledChange: (v: boolean) => void
  passcode: string
  onPasscodeChange: (v: string) => void
  onClose: () => void
}

export function PrivacySettingsModal({
  privacyMode, onPrivacyModeChange,
  recipientEmail, onRecipientEmailChange,
  passcodeEnabled, onPasscodeEnabledChange,
  passcode, onPasscodeChange,
  onClose,
}: PrivacySettingsModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="wc-card w-full max-w-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-text-2" />
            <p className="text-sm font-semibold text-text">Privacy & sharing</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-text-2 hover:bg-surface-2">
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs font-semibold text-text-3 uppercase tracking-wide mb-2">Who can open this</p>
        <div className="flex gap-2 mb-3">
          <button onClick={() => onPrivacyModeChange('open')}
            className={cn('flex-1 py-2 rounded-lg text-sm font-semibold border', privacyMode === 'open' ? 'bg-brand text-white border-brand' : 'border-border text-text-2')}>
            Anyone with the link
          </button>
          <button onClick={() => onPrivacyModeChange('email_gated')}
            className={cn('flex-1 py-2 rounded-lg text-sm font-semibold border', privacyMode === 'email_gated' ? 'bg-brand text-white border-brand' : 'border-border text-text-2')}>
            Only this email
          </button>
        </div>
        {privacyMode === 'email_gated' && (
          <input
            value={recipientEmail}
            onChange={e => onRecipientEmailChange(e.target.value)}
            placeholder="recipient@email.com"
            type="email"
            className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2.5 text-sm text-text placeholder:text-text-3 focus:outline-none focus:border-brand mb-4"
          />
        )}

        <div className={privacyMode === 'email_gated' ? '' : 'mt-4'}>
          <button
            type="button"
            onClick={() => onPasscodeEnabledChange(!passcodeEnabled)}
            className="w-full flex items-center justify-between py-2"
          >
            <span className="text-xs font-semibold text-text-3 uppercase tracking-wide">Also lock with a passcode</span>
            <span className={cn('w-9 h-5 rounded-full relative transition-colors', passcodeEnabled ? 'bg-brand' : 'bg-surface-2 border border-border')}>
              <span className={cn('absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform', passcodeEnabled ? 'translate-x-4' : 'translate-x-0.5')} />
            </span>
          </button>
          {passcodeEnabled && (
            <input
              value={passcode}
              onChange={e => onPasscodeChange(e.target.value)}
              placeholder="Choose a passcode (any word or number)"
              className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2.5 text-sm text-text placeholder:text-text-3 focus:outline-none focus:border-brand mt-1"
            />
          )}
        </div>

        <button onClick={onClose} className="w-full mt-5 py-2.5 rounded-xl bg-surface-2 text-text text-sm font-semibold">
          Done
        </button>
      </div>
    </div>
  )
}
