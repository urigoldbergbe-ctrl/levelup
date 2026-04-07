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

const GAP_ACCENT: Record<string, string> = {
  Technical: 'border-l-accent',
  Communication: 'border-l-emerald',
  Thinking: 'border-l-violet',
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
      <div className="relative rounded-2xl p-8 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, rgba(79,130,255,0.15) 0%, rgba(14,20,31,0.95) 100%)', border: '1px solid rgba(79,130,255,0.2)' }}>
        <div
          className="absolute top-0 right-0 w-48 h-48 opacity-20 pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(79,130,255,0.8) 0%, transparent 70%)' }}
        />
        <p className="text-xs font-body font-500 tracking-[0.12em] text-accent/60 uppercase mb-3">
          Your situation
        </p>
        <p className="font-display text-2xl font-300 italic text-white leading-snug">
          {assessment.headline}
        </p>
        <div className="flex gap-6 mt-6">
          <div>
            <p className="text-xs font-body text-white/30 uppercase tracking-wider mb-1">Where you are</p>
            <p className="font-body text-sm text-white/80">{assessment.current_level}</p>
          </div>
          <div className="text-white/20 self-center text-lg">→</div>
          <div>
            <p className="text-xs font-body text-white/30 uppercase tracking-wider mb-1">Your goal</p>
            <p className="font-body text-sm text-white/80">{assessment.target_level}</p>
          </div>
        </div>
      </div>

      {/* Gaps */}
      <div>
        <h2 className="font-body font-600 text-white text-base mb-3">Gaps to close</h2>
        <div className="space-y-3">
          {assessment.gaps.map((gap) => (
            <div
              key={gap.skill}
              className={`glass-card rounded-xl border-l-4 p-5 ${GAP_ACCENT[gap.category] ?? 'border-l-accent'}`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <p className="font-body font-600 text-sm text-white">{gap.skill}</p>
                <Badge color={GAP_COLORS[gap.category]}>{gap.category}</Badge>
              </div>
              <p className="font-body text-xs text-white/50 leading-relaxed">{gap.why}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Strengths */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="font-body font-600 text-white text-base mb-3">Your strengths</h2>
        <div className="flex flex-wrap gap-2">
          {assessment.strengths.map(s => (
            <Badge key={s} color="emerald">{s}</Badge>
          ))}
        </div>
      </div>

      {/* Immediate focus */}
      <div className="rounded-2xl p-6"
        style={{ background: 'linear-gradient(135deg, rgba(79,130,255,0.25) 0%, rgba(139,92,246,0.25) 100%)', border: '1px solid rgba(79,130,255,0.25)' }}>
        <p className="text-xs font-body font-500 tracking-[0.12em] text-white/50 uppercase mb-2">
          Your immediate focus
        </p>
        <p className="font-body text-sm text-white leading-relaxed">{assessment.year_one_action}</p>
      </div>

      {/* Mentor parallel */}
      {mentor && assessment.mentor_parallel && (
        <div className="glass-card rounded-2xl p-6">
          <p className="text-xs font-body font-500 tracking-[0.12em] text-white/40 uppercase mb-2">
            {mentor.name}&apos;s journey
          </p>
          <p className="font-body text-sm text-white/70 leading-relaxed">
            {assessment.mentor_parallel}
          </p>
        </div>
      )}

      {/* Next steps */}
      <div className="pt-4">
        <p className="font-body text-xs font-500 tracking-[0.20em] text-white/30 uppercase mb-4">
          What to do next
        </p>
        <div className="grid sm:grid-cols-3 gap-3">
          <NextStepCard href="/journey"  title="Learning journey" description="7 semesters of books, courses, and milestones." color="accent" />
          <NextStepCard href="/skills"   title="Skills radar"     description="Current vs. target skill levels across all dimensions." color="violet" />
          <NextStepCard href="/readiness" title="Progress tracker" description="Concrete milestones you need to hit for your next role." color="emerald" />
        </div>
      </div>
    </div>
  )
}

function NextStepCard({ href, title, description, color }: {
  href: string; title: string; description: string; color: 'accent' | 'violet' | 'emerald'
}) {
  const accentColor = color === 'accent' ? '#4F82FF' : color === 'violet' ? '#8B5CF6' : '#10B981'
  return (
    <Link href={href} className="glass-card-hover rounded-2xl p-5 flex flex-col">
      <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-3"
        style={{ background: `${accentColor}20`, color: accentColor }}>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      </div>
      <p className="font-body font-600 text-sm text-white mb-1">{title}</p>
      <p className="font-body text-xs text-white/40 leading-relaxed flex-1">{description}</p>
      <p className="font-body text-xs font-500 mt-3" style={{ color: accentColor }}>Go →</p>
    </Link>
  )
}
