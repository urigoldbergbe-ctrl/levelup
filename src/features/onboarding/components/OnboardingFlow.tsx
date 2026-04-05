'use client'

import { useState } from 'react'
import { LEADERS } from '@/data/leaders'
import MentorGrid from '@/features/mentors/components/MentorGrid'

export default function OnboardingFlow() {
  const [step, setStep] = useState(1)

  return (
    <div>
      {/* Step indicator */}
      <div className="flex items-center gap-3 mb-10">
        {[1, 2].map(s => (
          <div key={s} className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-body font-500 ${step >= s ? 'bg-accent text-white' : 'bg-mist text-ink-mid'}`}>
              {s}
            </div>
            <span className={`text-sm font-body ${step >= s ? 'text-ink' : 'text-ink-faint'}`}>
              {s === 1 ? 'Choose leader' : 'Run analysis'}
            </span>
            {s < 2 && <span className="text-ink-faint">→</span>}
          </div>
        ))}
      </div>

      {step === 1 && (
        <MentorGrid leaders={LEADERS} />
      )}
    </div>
  )
}
