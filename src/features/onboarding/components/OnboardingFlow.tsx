'use client'

import { useState } from 'react'
import { LEADERS } from '@/data/leaders'
import MentorGrid from '@/features/mentors/components/MentorGrid'
import ProfileUploadStep from './ProfileUploadStep'
import type { Leader } from '@/types'

interface Props {
  initialStep: number
  mentorId: string | null
  orgLeaders?: Leader[]
}

export default function OnboardingFlow({ initialStep, mentorId, orgLeaders = [] }: Props) {
  const [step, setStep] = useState(initialStep)

  const mentor = mentorId
    ? (LEADERS.find(l => l.id === mentorId) ?? orgLeaders.find(l => l.id === mentorId))
    : null

  const STEPS = [
    { n: 1, label: 'Choose leader' },
    { n: 2, label: 'Upload profile' },
  ]

  return (
    <div>
      {/* Step indicator */}
      <div className="flex items-center gap-3 mb-10">
        {STEPS.map((s, i) => (
          <div key={s.n} className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-body font-500 transition-colors ${
              step > s.n
                ? 'bg-emerald text-white'
                : step === s.n
                ? 'bg-accent text-white'
                : 'bg-mist text-ink-mid'
            }`}>
              {step > s.n ? '✓' : s.n}
            </div>
            <span className={`text-sm font-body ${step >= s.n ? 'text-ink' : 'text-ink-faint'}`}>
              {s.label}
            </span>
            {i < STEPS.length - 1 && (
              <span className="text-ink-faint mx-1">→</span>
            )}
          </div>
        ))}
      </div>

      {step === 1 && (
        <MentorGrid leaders={LEADERS} orgLeaders={orgLeaders} />
      )}

      {step === 2 && (
        <ProfileUploadStep mentorName={mentor?.name ?? 'your chosen leader'} />
      )}
    </div>
  )
}
