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

  const grouped: Record<string, ChecklistRow[]> = {}
  for (const item of items) {
    if (!grouped[item.dimension]) grouped[item.dimension] = []
    grouped[item.dimension].push(item)
  }

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Progress bar (no score number) */}
      {items.length > 0 && (
        <div className="bg-white rounded-2xl border border-ink/5 shadow-sm p-6">
          <div className="flex items-center justify-between mb-3">
            <p className="font-body text-sm font-500 text-ink">
              {nextRole ? `Progress toward ${nextRole.title}` : 'Your milestones'}
            </p>
            <p className="font-body text-xs text-ink-faint">
              {items.filter(i => i.completed).length} of {items.length} done
            </p>
          </div>
          <div className="h-2 rounded-full bg-mist overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all duration-700', {
                'bg-emerald-500': readinessPct >= 80,
                'bg-amber-400': readinessPct >= 50 && readinessPct < 80,
                'bg-accent': readinessPct < 50,
              })}
              style={{ width: `${readinessPct}%` }}
            />
          </div>
          {readinessPct === 100 && (
            <div className="mt-4 flex flex-col sm:flex-row gap-3">
              <Link
                href="/mentors"
                className="px-5 py-2.5 bg-accent text-white text-sm font-body font-500 rounded-xl hover:bg-accent-mid transition-colors text-center"
              >
                Choose your next leader →
              </Link>
              <Link
                href="/journey"
                className="px-5 py-2.5 bg-mist text-ink text-sm font-body font-500 rounded-xl hover:bg-ink/8 transition-colors text-center"
              >
                Review your journey
              </Link>
            </div>
          )}
        </div>
      )}

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
