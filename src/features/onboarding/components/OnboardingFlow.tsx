'use client'

import { useState } from 'react'
import MentorGrid from '@/features/mentors/components/MentorGrid'
import ProfileUploadStep from './ProfileUploadStep'
import type { Leader } from '@/types'
import { saveLeaderChoiceReasonAction } from '../actions'

interface Props {
  initialStep: number
  mentorId: string | null
  globalLeaders: Leader[]
  orgLeaders?: Leader[]
}

const STEPS = [
  { n: 1, label: 'Role model' },
  { n: 2, label: 'Your why' },
  { n: 3, label: 'Your profile' },
]

export default function OnboardingFlow({
  initialStep,
  mentorId,
  globalLeaders,
  orgLeaders = [],
}: Props) {
  const [step, setStep] = useState(initialStep)
  const [chosenMentorId, setChosenMentorId] = useState<string | null>(mentorId)
  const [reason, setReason] = useState('')
  const [savingReason, setSavingReason] = useState(false)

  const mentor = chosenMentorId
    ? (globalLeaders.find(l => l.id === chosenMentorId) ?? orgLeaders.find(l => l.id === chosenMentorId))
    : null

  async function handleWhyContinue() {
    setSavingReason(true)
    try {
      if (reason.trim()) await saveLeaderChoiceReasonAction(reason.trim())
    } catch {
      // non-critical
    }
    setSavingReason(false)
    setStep(3)
  }

  return (
    <div className="space-y-10">
      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div key={s.n} className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 flex items-center justify-center text-sm font-body font-600 transition-all ${
                step > s.n
                  ? 'bg-emerald text-white'
                  : step === s.n
                  ? 'bg-mckinsey-blue text-white'
                  : 'bg-mist text-ink-faint border border-black/[0.08]'
              }`} style={{ borderRadius: '2px' }}>
                {step > s.n ? '✓' : s.n}
              </div>
              <span className={`text-sm font-body transition-all ${step >= s.n ? 'text-ink' : 'text-ink-faint'}`}>
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`h-px w-8 mx-1 transition-all ${step > s.n ? 'bg-emerald/40' : 'bg-black/[0.08]'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1 — Choose role model */}
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <h2 className="font-display italic text-xl text-ink">Who do you want to build your career like?</h2>
            <p className="text-sm text-ink-mid mt-1">Pick the leader whose path inspires you most. Your entire journey will be tailored to close the gap between you and them.</p>
          </div>
          <MentorGrid
            leaders={globalLeaders}
            orgLeaders={orgLeaders}
            onSelect={(id: string) => {
              setChosenMentorId(id)
              setStep(2)
            }}
          />
        </div>
      )}

      {/* Step 2 — Why this leader? */}
      {step === 2 && mentor && (
        <div className="max-w-xl space-y-6">
          <div className="flex items-center gap-4">
            {mentor.photo_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={mentor.photo_url}
                alt={mentor.name}
                className="w-14 h-14 object-cover border border-black/[0.08]"
                style={{ borderRadius: '2px' }}
              />
            )}
            <div>
              <h2 className="font-display italic text-xl text-ink">Why {mentor.name}?</h2>
              <p className="text-sm text-ink-mid mt-0.5">{mentor.title} · {mentor.company}</p>
            </div>
          </div>

          <p className="text-sm text-ink-mid">
            Tell us what draws you to {mentor.name}. This helps us personalise your journey and coaching — your answer won&apos;t be shared.
          </p>

          <textarea
            value={reason}
            onChange={e => setReason(e.target.value)}
            rows={5}
            autoFocus
            className="w-full px-4 py-3 bg-mist border border-black/[0.08] text-sm font-body text-ink placeholder:text-ink-faint focus:outline-none focus:border-mckinsey-blue/40 transition-all resize-none"
            style={{ borderRadius: '2px' }}
            placeholder={`What inspires you about ${mentor.name}? What do you hope to learn from their journey?`}
          />

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-4 py-2.5 text-sm font-body text-ink-mid border border-black/[0.10] hover:border-black/20 hover:text-ink transition-colors"
              style={{ borderRadius: '2px' }}
            >
              ← Back
            </button>
            <button
              type="button"
              onClick={handleWhyContinue}
              disabled={savingReason}
              className="flex-1 px-6 py-2.5 btn-brand text-white text-sm font-body font-600 disabled:opacity-50"
              style={{ borderRadius: '2px' }}
            >
              {savingReason ? 'Saving…' : 'Continue →'}
            </button>
          </div>
          <p className="text-xs text-ink-faint">You can skip this — just click Continue</p>
        </div>
      )}

      {/* Step 3 — Upload profile */}
      {step === 3 && (
        <ProfileUploadStep mentorName={mentor?.name ?? 'your chosen leader'} />
      )}
    </div>
  )
}
