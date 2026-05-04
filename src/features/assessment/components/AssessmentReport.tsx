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
  Technical:     'indigo',
  Communication: 'emerald',
  Thinking:      'violet',
}

const GAP_BORDER: Record<string, string> = {
  Technical:     'border-l-[#002F6C]',
  Communication: 'border-l-emerald-500',
  Thinking:      'border-l-violet-500',
}

export default function AssessmentReport({
  assessment,
  mentor,
}: {
  assessment: AssessmentRow
  mentor: Leader | null
}) {
  return (
    <div className="space-y-5 max-w-3xl">
      {/* Headline card */}
      <div className="glass-card p-8">
        <p className="text-[10px] font-body font-600 tracking-[0.20em] text-mckinsey-blue uppercase mb-3">
          Your situation
        </p>
        <p className="font-display text-2xl italic text-ink leading-snug">
          {assessment.headline}
        </p>
        <div className="flex flex-wrap gap-8 mt-6">
          <div>
            <p className="text-[10px] font-body font-600 uppercase tracking-widest text-ink-faint mb-1">Where you are</p>
            <p className="font-body text-sm text-ink-mid">{assessment.current_level}</p>
          </div>
          <div className="text-ink-faint self-center">→</div>
          <div>
            <p className="text-[10px] font-body font-600 uppercase tracking-widest text-ink-faint mb-1">Your goal</p>
            <p className="font-body text-sm text-ink-mid">{assessment.target_level}</p>
          </div>
        </div>
      </div>

      {/* Gaps */}
      <div>
        <h2 className="font-body font-700 text-xs uppercase tracking-widest text-ink-mid mb-3">Gaps to close</h2>
        <div className="space-y-3">
          {assessment.gaps.map((gap) => (
            <div
              key={gap.skill}
              className={`bg-white border border-black/[0.07] border-l-4 ${GAP_BORDER[gap.category] ?? 'border-l-[#002F6C]'} px-5 py-4 rounded-r-sm`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <p className="font-body font-700 text-sm text-ink">{gap.skill}</p>
                <Badge color={GAP_COLORS[gap.category]}>{gap.category}</Badge>
              </div>
              <p className="font-body text-xs text-ink-mid leading-relaxed">{gap.why}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Strengths */}
      <div className="glass-card p-6">
        <h2 className="font-body font-700 text-xs uppercase tracking-widest text-ink-mid mb-3">Your strengths</h2>
        <div className="flex flex-wrap gap-2">
          {assessment.strengths.map(s => (
            <Badge key={s} color="emerald">{s}</Badge>
          ))}
        </div>
      </div>

      {/* Immediate focus */}
      <div className="bg-mckinsey-light border border-mckinsey-blue/20 px-6 py-5 rounded-sm">
        <p className="text-[10px] font-body font-600 tracking-[0.20em] text-mckinsey-blue uppercase mb-2">
          Your immediate focus
        </p>
        <p className="font-body text-sm text-ink leading-relaxed">{assessment.year_one_action}</p>
      </div>

      {/* Mentor parallel */}
      {mentor && assessment.mentor_parallel && (
        <div className="glass-card p-6">
          <p className="text-[10px] font-body font-600 tracking-[0.20em] text-mckinsey-teal uppercase mb-2">
            {mentor.name}&apos;s journey
          </p>
          <p className="font-body text-sm text-ink-mid leading-relaxed">
            {assessment.mentor_parallel}
          </p>
        </div>
      )}

      {/* Next steps */}
      <div className="pt-4">
        <p className="font-body text-xs font-600 tracking-[0.20em] text-ink-faint uppercase mb-4">What to do next</p>
        <div className="grid sm:grid-cols-2 gap-3">
          <NextStepCard href="/journey"  title="Learning journey" description="Seven semesters of books, podcasts, and courses — curated for your gaps." color="blue" />
          <NextStepCard href="/progress" title="Progress tracker"  description="Milestones and assessment goals side by side."                          color="teal" />
        </div>
      </div>
    </div>
  )
}

function NextStepCard({ href, title, description, color }: {
  href: string; title: string; description: string; color: 'blue' | 'teal'
}) {
  const c = color === 'blue' ? '#002F6C' : '#2D7D9A'
  return (
    <Link href={href}
      className="glass-card-hover p-5 flex flex-col"
      style={{ textDecoration: 'none' }}
    >
      <div className="w-8 h-8 flex items-center justify-center mb-3"
        style={{ background: `${c}12`, color: c, borderRadius: '2px' }}>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      </div>
      <p className="font-body font-700 text-sm text-ink mb-1">{title}</p>
      <p className="font-body text-xs text-ink-mid leading-relaxed flex-1">{description}</p>
      <p className="font-body text-xs font-600 mt-3" style={{ color: c }}>Go →</p>
    </Link>
  )
}
