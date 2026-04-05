'use client'

import Badge from '@/components/ui/Badge'
import type { Leader } from '@/types'

interface AssessmentRow {
  headline: string
  current_level: string
  target_level: string
  gaps: { skill: string; why: string; category: 'Technical' | 'Communication' | 'Thinking' }[]
  strengths: string[]
  year_one_action: string
  mentor_parallel: string
}

const GAP_COLORS: Record<string, 'indigo' | 'emerald' | 'violet'> = {
  Technical: 'indigo',
  Communication: 'emerald',
  Thinking: 'violet',
}

export default function AssessmentReport({
  assessment,
  mentor,
}: {
  assessment: AssessmentRow
  mentor: Leader | null
}) {
  return (
    <div className="space-y-6 max-w-3xl">
      {/* Headline card */}
      <div className="bg-ink rounded-2xl p-8">
        <p className="text-xs font-body font-500 tracking-[0.12em] text-white/40 uppercase mb-3">
          Your situation
        </p>
        <p className="font-display text-2xl font-300 italic text-white leading-snug">
          {assessment.headline}
        </p>
        <div className="flex gap-4 mt-6">
          <div>
            <p className="text-xs font-body text-white/40 uppercase tracking-wider mb-1">Now</p>
            <p className="font-body text-sm text-white">{assessment.current_level}</p>
          </div>
          <div className="text-white/20 self-center">→</div>
          <div>
            <p className="text-xs font-body text-white/40 uppercase tracking-wider mb-1">5-year target</p>
            <p className="font-body text-sm text-white">{assessment.target_level}</p>
          </div>
        </div>
      </div>

      {/* Gaps */}
      <div>
        <h2 className="font-body font-600 text-ink text-base mb-3">3 gaps to close</h2>
        <div className="space-y-3">
          {assessment.gaps.map((gap) => (
            <div
              key={gap.skill}
              className={`bg-white rounded-xl border-l-4 border shadow-sm p-5 ${
                gap.category === 'Technical'
                  ? 'border-l-accent'
                  : gap.category === 'Communication'
                  ? 'border-l-emerald'
                  : 'border-l-violet'
              } border-ink/5`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <p className="font-body font-600 text-sm text-ink">{gap.skill}</p>
                <Badge color={GAP_COLORS[gap.category]}>{gap.category}</Badge>
              </div>
              <p className="font-body text-xs text-ink-mid leading-relaxed">{gap.why}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Strengths */}
      <div className="bg-white rounded-2xl border border-ink/5 shadow-sm p-6">
        <h2 className="font-body font-600 text-ink text-base mb-3">Your strengths</h2>
        <div className="flex flex-wrap gap-2">
          {assessment.strengths.map(s => (
            <Badge key={s} color="emerald">{s}</Badge>
          ))}
        </div>
      </div>

      {/* Year 1 focus */}
      <div className="bg-gradient-to-br from-accent to-violet rounded-2xl p-6 text-white">
        <p className="text-xs font-body font-500 tracking-[0.12em] uppercase mb-2 opacity-70">
          Year 1 focus
        </p>
        <p className="font-body text-sm leading-relaxed">{assessment.year_one_action}</p>
      </div>

      {/* Mentor parallel */}
      {mentor && (
        <div className="bg-white rounded-2xl border border-ink/5 shadow-sm p-6">
          <p className="text-xs font-body font-500 tracking-[0.12em] text-ink-mid uppercase mb-2">
            {mentor.name}&apos;s path
          </p>
          <p className="font-body text-sm text-ink leading-relaxed italic">
            &ldquo;{assessment.mentor_parallel}&rdquo;
          </p>
        </div>
      )}
    </div>
  )
}
