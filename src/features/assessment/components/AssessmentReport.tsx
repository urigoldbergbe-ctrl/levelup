'use client'

import Link from 'next/link'
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
            <p className="text-xs font-body text-white/40 uppercase tracking-wider mb-1">Where you are</p>
            <p className="font-body text-sm text-white">{assessment.current_level}</p>
          </div>
          <div className="text-white/20 self-center">→</div>
          <div>
            <p className="text-xs font-body text-white/40 uppercase tracking-wider mb-1">Your goal</p>
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

      {/* Immediate focus */}
      <div className="bg-gradient-to-br from-accent to-violet rounded-2xl p-6 text-white">
        <p className="text-xs font-body font-500 tracking-[0.12em] uppercase mb-2 opacity-70">
          Your immediate focus
        </p>
        <p className="font-body text-sm leading-relaxed">{assessment.year_one_action}</p>
      </div>

      {/* Mentor parallel — plain statement, no quote */}
      {mentor && assessment.mentor_parallel && (
        <div className="bg-white rounded-2xl border border-ink/5 shadow-sm p-6">
          <p className="text-xs font-body font-500 tracking-[0.12em] text-ink-mid uppercase mb-2">
            {mentor.name}&apos;s journey
          </p>
          <p className="font-body text-sm text-ink leading-relaxed">
            {assessment.mentor_parallel}
          </p>
        </div>
      )}

      {/* Next steps */}
      <div className="border-t border-ink/8 pt-6">
        <p className="font-body text-xs font-500 tracking-[0.20em] text-ink-mid uppercase mb-4">
          What to do next
        </p>
        <div className="grid sm:grid-cols-3 gap-3">
          <NextStepCard
            href="/journey"
            title="Your learning journey"
            description="7 semesters of books, courses, and milestones tailored to your leader."
            color="accent"
          />
          <NextStepCard
            href="/skills"
            title="Skills radar"
            description="See your current vs. target skill levels across all three dimensions."
            color="violet"
          />
          <NextStepCard
            href="/readiness"
            title="Readiness checklist"
            description="Track the concrete milestones you need to hit for your next role."
            color="emerald"
          />
        </div>
      </div>
    </div>
  )
}

function NextStepCard({
  href, title, description, color,
}: {
  href: string
  title: string
  description: string
  color: 'accent' | 'violet' | 'emerald'
}) {
  const colorMap = {
    accent: 'bg-accent/8 text-accent group-hover:bg-accent/15',
    violet: 'bg-violet/8 text-violet group-hover:bg-violet/15',
    emerald: 'bg-emerald/8 text-emerald group-hover:bg-emerald/15',
  }
  const arrowMap = {
    accent: 'text-accent',
    violet: 'text-violet',
    emerald: 'text-emerald',
  }
  return (
    <Link
      href={href}
      className="group flex flex-col p-5 bg-white rounded-2xl border border-ink/5 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 transition-colors ${colorMap[color]}`}>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      </div>
      <p className="font-body font-600 text-sm text-ink mb-1">{title}</p>
      <p className="font-body text-xs text-ink-mid leading-relaxed flex-1">{description}</p>
      <p className={`font-body text-xs font-500 mt-3 ${arrowMap[color]}`}>Go →</p>
    </Link>
  )
}
