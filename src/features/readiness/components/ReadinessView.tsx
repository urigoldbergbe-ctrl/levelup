'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import {
  toggleChecklistItemAction,
  updateChecklistLabelAction,
  rerunCurriculumFromProgressAction,
} from '@/features/assessment/actions'
import { cn } from '@/lib/utils/cn'
import type { CareerRole } from '@/types'

interface ChecklistRow {
  id: string
  dimension: string
  label: string
  custom_label?: string | null
  completed: boolean
}

interface Props {
  items: ChecklistRow[]
  readinessPct: number
  nextRole: CareerRole | null
  userId: string
}

const DIM_COLORS: Record<string, { border: string; badge: string; hex: string }> = {
  technical:     { border: 'border-l-[#4F82FF]', badge: 'bg-[#4F82FF]/10 text-[#4F82FF]', hex: '#4F82FF' },
  communication: { border: 'border-l-emerald-500', badge: 'bg-emerald-50 text-emerald-700', hex: '#10B981' },
  thinking:      { border: 'border-l-violet-500', badge: 'bg-violet-50 text-violet-700', hex: '#8B5CF6' },
}

export default function ReadinessView({ items, readinessPct, nextRole }: Props) {
  const [isPending, startTransition] = useTransition()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editDraft, setEditDraft] = useState('')
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [regenMessage, setRegenMessage] = useState<string | null>(null)

  function toggle(id: string, current: boolean) {
    startTransition(() => toggleChecklistItemAction(id, !current))
  }

  function startEdit(item: ChecklistRow) {
    setEditingId(item.id)
    setEditDraft(item.custom_label || item.label)
  }

  function saveEdit(id: string) {
    startTransition(() => updateChecklistLabelAction(id, editDraft))
    setEditingId(null)
  }

  async function handleRegenerate() {
    setIsRegenerating(true)
    setRegenMessage(null)
    const result = await rerunCurriculumFromProgressAction()
    setIsRegenerating(false)
    if (result.ok) {
      setRegenMessage('Journey updated! Head to your Journey page to see the new recommendations.')
    } else {
      setRegenMessage(`Could not update: ${result.error}`)
    }
  }

  const grouped: Record<string, ChecklistRow[]> = {}
  for (const item of items) {
    if (!grouped[item.dimension]) grouped[item.dimension] = []
    grouped[item.dimension].push(item)
  }

  const progressColor = readinessPct >= 80 ? '#10B981' : readinessPct >= 50 ? '#F59E0B' : '#7B2FFF'

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Overall progress bar */}
      {items.length > 0 && (
        <div className="rounded-2xl border border-black/[0.07] bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <p className="font-body text-sm font-600 text-ink">
              {nextRole ? `Progress toward ${nextRole.title}` : 'Your milestones'}
            </p>
            <p className="font-body text-xs text-ink-faint">
              {items.filter(i => i.completed).length} of {items.length} done
            </p>
          </div>
          <div className="h-2 rounded-full bg-black/[0.06] overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${readinessPct}%`, background: progressColor }}
            />
          </div>
          {readinessPct === 100 && (
            <div className="mt-5 flex flex-col sm:flex-row gap-3">
              <Link href="/mentors" className="px-5 py-2.5 btn-brand text-white text-sm font-body font-600 rounded-xl transition-all text-center">
                Choose your next leader →
              </Link>
              <Link href="/journey" className="px-5 py-2.5 border border-black/[0.10] text-ink-mid text-sm font-body font-500 rounded-xl hover:border-brand-purple/40 hover:text-brand-purple transition-colors text-center">
                Review your journey
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Update journey CTA */}
      {items.length > 0 && (
        <div className="rounded-xl border border-brand-purple/20 bg-brand-purple/[0.03] p-5 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <p className="font-body text-sm font-600 text-ink">Update your recommendations</p>
            <p className="font-body text-xs text-ink-mid mt-1">
              After marking milestones or editing goals, regenerate your journey so books, courses, and podcasts reflect your current progress.
            </p>
          </div>
          <button
            type="button"
            onClick={handleRegenerate}
            disabled={isRegenerating}
            className="shrink-0 px-5 py-2.5 btn-brand text-white text-sm font-body font-600 rounded-xl disabled:opacity-60 transition-all"
          >
            {isRegenerating ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Updating… (~30s)
              </span>
            ) : '↺ Update journey'}
          </button>
        </div>
      )}

      {regenMessage && (
        <p className={cn(
          'text-sm font-body px-4 py-3 rounded-xl border',
          regenMessage.startsWith('Journey updated')
            ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
            : 'text-red-600 bg-red-50 border-red-200'
        )}>
          {regenMessage}
          {regenMessage.startsWith('Journey updated') && (
            <Link href="/journey" className="ml-2 underline font-600">Go to Journey →</Link>
          )}
        </p>
      )}

      {/* Checklist by dimension */}
      {Object.entries(grouped).map(([dim, dimItems]) => {
        const colors = DIM_COLORS[dim]
        return (
          <div key={dim}>
            <div className="flex items-center gap-2 mb-3">
              <span className={cn('text-[10px] font-body font-600 px-2 py-0.5 rounded-full uppercase tracking-wide', colors?.badge ?? 'bg-mist text-ink-mid')}>
                {dim}
              </span>
            </div>
            <div className="space-y-2">
              {dimItems.map(item => (
                <div
                  key={item.id}
                  className={cn(
                    'rounded-xl border-l-4 bg-white border border-black/[0.07] px-5 py-4 flex items-start gap-3 transition-all duration-200',
                    colors?.border ?? 'border-l-black/20',
                    item.completed && 'opacity-60',
                  )}
                >
                  {/* Checkbox */}
                  <button
                    type="button"
                    onClick={() => toggle(item.id, item.completed)}
                    disabled={isPending}
                    className={cn(
                      'mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center text-xs transition-all',
                      item.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-black/20 hover:border-brand-purple/50'
                    )}
                  >
                    {item.completed ? '✓' : ''}
                  </button>

                  {/* Label / edit mode */}
                  <div className="flex-1 min-w-0">
                    {editingId === item.id ? (
                      <div className="flex gap-2 items-center">
                        <input
                          autoFocus
                          value={editDraft}
                          onChange={e => setEditDraft(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') saveEdit(item.id); if (e.key === 'Escape') setEditingId(null) }}
                          className="flex-1 px-3 py-1.5 rounded-lg bg-mist border border-black/[0.08] text-sm font-body text-ink focus:outline-none focus:border-brand-purple/40 transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => saveEdit(item.id)}
                          className="text-xs px-3 py-1.5 btn-brand text-white rounded-lg"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="text-xs px-3 py-1.5 border border-black/[0.08] text-ink-mid rounded-lg hover:text-ink"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <p className={cn('font-body text-sm', item.completed ? 'text-ink-faint line-through' : 'text-ink')}>
                        {item.custom_label || item.label}
                      </p>
                    )}
                  </div>

                  {/* Edit pencil */}
                  {editingId !== item.id && (
                    <button
                      type="button"
                      onClick={() => startEdit(item)}
                      className="flex-shrink-0 text-ink-faint hover:text-brand-purple transition-colors mt-0.5"
                      title="Edit label"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )
      })}

      {items.length === 0 && (
        <div className="rounded-2xl border border-amber/30 bg-amber/[0.04] p-8 text-center">
          <p className="font-body text-sm text-ink-mid mb-3">
            Choose a leader and complete your assessment to see your readiness milestones.
          </p>
          <a href="/onboarding" className="text-sm font-body text-brand-purple hover:underline font-600">
            Get started →
          </a>
        </div>
      )}
    </div>
  )
}
