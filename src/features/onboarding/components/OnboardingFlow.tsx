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
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-body font-600 transition-all ${
                step > s.n
                  ? 'bg-emerald text-white'
                  : step === s.n
                  ? 'bg-accent text-white shadow-[0_0_16px_rgba(79,130,255,0.4)]'
                  : 'bg-white/[0.06] text-white/30'
              }`}>
                {step > s.n ? '✓' : s.n}
              </div>
              <span className={`text-sm font-body transition-all ${step >= s.n ? 'text-white/80' : 'text-white/25'}`}>
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`h-px w-8 mx-1 transition-all ${step > s.n ? 'bg-emerald/50' : 'bg-white/10'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1 — Choose role model */}
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-display font-300 text-white">Who do you want to build your career like?</h2>
            <p className="text-sm text-white/40 mt-1">Pick the leader whose path inspires you most. Your entire journey will be tailored to close the gap between you and them.</p>
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
                className="w-14 h-14 rounded-2xl object-cover border border-white/10"
              />
            )}
            <div>
              <h2 className="text-xl font-display font-300 text-white">Why {mentor.name}?</h2>
              <p className="text-sm text-white/40 mt-0.5">{mentor.title} · {mentor.company}</p>
            </div>
          </div>

          <p className="text-sm text-white/50">
            Tell us what draws you to {mentor.name}. This helps us personalise your journey and coaching — your answer won&apos;t be shared.
          </p>

          <textarea
            value={reason}
            onChange={e => setReason(e.target.value)}
            rows={5}
            autoFocus
            className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/10 text-sm font-body text-white placeholder:text-white/20 focus:outline-none focus:border-accent/50 focus:bg-white/[0.07] transition-all resize-none"
            placeholder={`What inspires you about ${mentor.name}? What do you hope to learn from their journey?`}
          />

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-4 py-2.5 rounded-xl text-sm font-body text-white/40 hover:text-white/70 transition-colors border border-white/[0.07] hover:border-white/15"
            >
              ← Back
            </button>
            <button
              type="button"
              onClick={handleWhyContinue}
              disabled={savingReason}
              className="flex-1 px-6 py-2.5 rounded-xl bg-accent text-white text-sm font-body font-500 hover:bg-accent/90 disabled:opacity-50 transition-all"
            >
              {savingReason ? 'Saving…' : 'Continue →'}
            </button>
          </div>
          <p className="text-xs text-white/25">You can skip this — just click Continue</p>
        </div>
      )}

      {/* Step 3 — Upload profile */}
      {step === 3 && (
        <ProfileUploadStep mentorName={mentor?.name ?? 'your chosen leader'} />
      )}
    </div>
  )
}
