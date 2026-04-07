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

const DIM_LEFT: Record<string, string> = {
  technical:     'border-l-accent',
  communication: 'border-l-emerald',
  thinking:      'border-l-violet',
}

const DIM_COLOR: Record<string, string> = {
  technical:     '#4F82FF',
  communication: '#10B981',
  thinking:      '#8B5CF6',
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

  const progressColor = readinessPct >= 80 ? '#10B981' : readinessPct >= 50 ? '#F59E0B' : '#4F82FF'

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Progress bar */}
      {items.length > 0 && (
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="font-body text-sm font-500 text-white">
              {nextRole ? `Progress toward ${nextRole.title}` : 'Your milestones'}
            </p>
            <p className="font-body text-xs text-white/30">
              {items.filter(i => i.completed).length} of {items.length} done
            </p>
          </div>
          <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${readinessPct}%`, background: progressColor }}
            />
          </div>
          {readinessPct === 100 && (
            <div className="mt-5 flex flex-col sm:flex-row gap-3">
              <Link
                href="/mentors"
                className="px-5 py-2.5 bg-accent text-white text-sm font-body font-600 rounded-xl hover:shadow-accent hover:scale-105 transition-all duration-300 text-center"
              >
                Choose your next leader →
              </Link>
              <Link
                href="/journey"
                className="px-5 py-2.5 glass-card text-white/60 text-sm font-body font-500 rounded-xl hover:text-white transition-colors text-center"
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
          <p className="text-xs font-body font-500 tracking-[0.20em] text-white/30 uppercase mb-3 capitalize"
            style={{ color: DIM_COLOR[dim] ? `${DIM_COLOR[dim]}80` : undefined }}>
            {dim}
          </p>
          <div className="space-y-2">
            {dimItems.map(item => (
              <button
                key={item.id}
                onClick={() => toggle(item.id, item.completed)}
                disabled={isPending}
                className={cn(
                  'w-full text-left glass-card rounded-xl border-l-4 px-5 py-4 flex items-start gap-3 transition-all duration-200 hover:bg-white/[0.07]',
                  DIM_LEFT[item.dimension] ?? 'border-l-white/20'
                )}
              >
                <span className={cn(
                  'mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center text-xs transition-all',
                  item.completed ? 'bg-emerald border-emerald text-white' : 'border-white/20'
                )}>
                  {item.completed ? '✓' : ''}
                </span>
                <p className={cn(
                  'font-body text-sm',
                  item.completed ? 'text-white/25 line-through' : 'text-white/70'
                )}>
                  {item.label}
                </p>
              </button>
            ))}
          </div>
        </div>
      ))}

      {items.length === 0 && (
        <div className="glass-card rounded-2xl p-8 text-center border-amber/20">
          <p className="font-body text-sm text-white/40 mb-3">
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
