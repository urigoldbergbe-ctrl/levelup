'use client'

import Link from 'next/link'
import { useTransition } from 'react'
import { toggleChecklistItemAction } from '@/features/assessment/actions'
import { cn } from '@/lib/utils/cn'
import type { CareerRole } from '@/types'

interface ChecklistRow {
  id: string
  dimension: string
  label: string
  completed: boolean
}

interface Props {
  items: ChecklistRow[]
  readinessPct: number
  nextRole: CareerRole | null
  userId: string
}

const DIM_COLORS: Record<string, string> = {
  technical: 'border-l-accent',
  communication: 'border-l-emerald',
  thinking: 'border-l-violet',
}

export default function ReadinessView({ items, readinessPct, nextRole }: Props) {
  const [isPending, startTransition] = useTransition()

  function toggle(id: string, current: boolean) {
    startTransition(() => toggleChecklistItemAction(id, !current))
  }

  const color =
    readinessPct >= 80 ? 'text-emerald' : readinessPct >= 50 ? 'text-amber' : 'text-accent'

  const grouped: Record<string, ChecklistRow[]> = {}
  for (const item of items) {
    if (!grouped[item.dimension]) grouped[item.dimension] = []
    grouped[item.dimension].push(item)
  }

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Score */}
      <div className="bg-ink rounded-2xl p-8 text-center">
        <p className="text-xs font-body font-500 tracking-[0.20em] text-white/40 uppercase mb-4">
          Readiness score
        </p>
        <p className={`font-display font-300 ${color}`} style={{ fontSize: 80 }}>
          {readinessPct}%
        </p>
        {nextRole && (
          <p className="font-body text-sm text-white/50 mt-2">
            toward {nextRole.title} at {nextRole.co}
          </p>
        )}
        {/* Progress bar */}
        <div className="mt-6 h-2 rounded-full bg-white/10 overflow-hidden">
          <div
            className={cn('h-full rounded-full transition-all duration-700', {
              'bg-emerald': readinessPct >= 80,
              'bg-amber': readinessPct >= 50 && readinessPct < 80,
              'bg-accent': readinessPct < 50,
            })}
            style={{ width: `${readinessPct}%` }}
          />
        </div>

        {readinessPct === 100 && (
          <div className="mt-6">
            <p className="font-display text-lg italic text-white mb-3">🎉 You&apos;re ready!</p>
            <p className="font-body text-sm text-white/60 mb-4">
              You&apos;ve completed all milestones. Time to have the promotion conversation.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-3 justify-center">
              <Link
                href="/mentors"
                className="px-6 py-2.5 bg-accent text-white text-sm font-body font-500 rounded-xl hover:bg-accent-mid transition-colors"
              >
                Choose your next leader →
              </Link>
              <Link
                href="/journey"
                className="px-6 py-2.5 bg-white/10 text-white text-sm font-body font-500 rounded-xl border border-white/20 hover:bg-white/15 transition-colors"
              >
                Review your journey
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Checklist by dimension */}
      {Object.entries(grouped).map(([dim, dimItems]) => (
        <div key={dim}>
          <p className="text-xs font-body font-500 tracking-[0.20em] text-ink-mid uppercase mb-3 capitalize">
            {dim}
          </p>
          <div className="space-y-2">
            {dimItems.map(item => (
              <button
                key={item.id}
                onClick={() => toggle(item.id, item.completed)}
                disabled={isPending}
                className={cn(
                  'w-full text-left bg-white rounded-xl border-l-4 border border-ink/5 px-5 py-4 flex items-start gap-3 hover:shadow-sm transition-shadow',
                  DIM_COLORS[item.dimension] ?? 'border-l-ink/20'
                )}
              >
                <span className={cn(
                  'mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center text-xs',
                  item.completed ? 'bg-emerald border-emerald text-white' : 'border-ink/30'
                )}>
                  {item.completed ? '✓' : ''}
                </span>
                <p className={cn(
                  'font-body text-sm',
                  item.completed ? 'text-ink-mid line-through' : 'text-ink'
                )}>
                  {item.label}
                </p>
              </button>
            ))}
          </div>
        </div>
      ))}

      {items.length === 0 && (
        <div className="bg-amber/10 border border-amber/30 rounded-2xl p-8 text-center">
          <p className="font-body text-sm text-ink-mid mb-3">
            Choose a leader and complete your assessment to see your readiness milestones.
          </p>
          <a href="/onboarding" className="text-sm font-body text-accent hover:underline">
            Get started →
          </a>
        </div>
      )}
    </div>
  )
}
