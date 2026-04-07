'use client'

import { useState } from 'react'
import MentorGrid from '@/features/mentors/components/MentorGrid'
import ProfileUploadStep from './ProfileUploadStep'
import type { Leader } from '@/types'

interface Props {
  initialStep: number
  mentorId: string | null
  globalLeaders: Leader[]
  orgLeaders?: Leader[]
}

export default function OnboardingFlow({
  initialStep,
  mentorId,
  globalLeaders,
  orgLeaders = [],
}: Props) {
  const [step, setStep] = useState(initialStep)

  const mentor = mentorId
    ? (globalLeaders.find(l => l.id === mentorId) ?? orgLeaders.find(l => l.id === mentorId))
    : null

  const STEPS = [
    { n: 1, label: 'Choose leader' },
    { n: 2, label: 'Upload profile' },
  ]

  return (
    <div>
      <div className="flex items-center gap-3 mb-10">
        {STEPS.map((s, i) => (
          <div key={s.n} className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-body font-500 transition-colors ${
              step > s.n
                ? 'bg-emerald text-white'
                : step === s.n
                ? 'bg-accent text-white'
                : 'bg-white/[0.06] text-white/40'
            }`}>
              {step > s.n ? '✓' : s.n}
            </div>
            <span className={`text-sm font-body ${step >= s.n ? 'text-white/80' : 'text-white/30'}`}>
              {s.label}
            </span>
            {i < STEPS.length - 1 && (
              <span className="text-white/20 mx-1">→</span>
            )}
          </div>
        ))}
      </div>

      {step === 1 && (
        <MentorGrid leaders={globalLeaders} orgLeaders={orgLeaders} />
      )}

      {step === 2 && (
        <ProfileUploadStep mentorName={mentor?.name ?? 'your chosen leader'} />
      )}
    </div>
  )
}
