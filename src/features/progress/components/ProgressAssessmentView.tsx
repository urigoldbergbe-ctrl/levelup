'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { Leader } from '@/types'
import {
  toggleChecklistItemAction,
  updateChecklistLabelAction,
  editAssessmentGapAction,
  addCustomGoalAction,
} from '@/features/assessment/actions'

interface Gap { skill: string; why: string; category: string }

interface ChecklistItem {
  id: string
  dimension: string
  label: string
  custom_label: string | null
  completed: boolean
}

interface Assessment {
  id: string
  headline: string
  current_level: string
  target_level: string
  gaps: Gap[]
  strengths: string[]
  year_one_action: string
  mentor_parallel: string | null
}

interface Props {
  assessment: Assessment
  checklistItems: ChecklistItem[]
  mentor: Leader | null
  progressRows: unknown[]
}

const DIM_MAP: Record<string, string> = {
  Technical: 'technical',
  Communication: 'communication',
  Thinking: 'thinking',
}

const DIM_COLOR: Record<string, { border: string; badge: string }> = {
  technical:     { border: 'border-l-[#002F6C]',   badge: 'bg-blue-50 text-blue-800' },
  communication: { border: 'border-l-emerald-500', badge: 'bg-emerald-50 text-emerald-800' },
  thinking:      { border: 'border-l-violet-500',  badge: 'bg-violet-50 text-violet-800' },
}

function normalizeDimension(category: string) {
  const mapped = DIM_MAP[category] ?? category
  const raw = mapped.toLowerCase()
  if (raw.includes('tech')) return 'technical'
  if (raw.includes('commun')) return 'communication'
  if (raw.includes('think') || raw.includes('strategy') || raw.includes('system')) return 'thinking'
  return 'technical'
}

export default function ProgressAssessmentView({ assessment, checklistItems: initialItems, mentor }: Props) {
  const router = useRouter()

  // ── Gap editing ─────────────────────────────────────
  const [gaps, setGaps] = useState<Gap[]>(assessment.gaps)
  const [editingGapIdx, setEditingGapIdx] = useState<number | null>(null)
  const [gapDraft, setGapDraft] = useState('')
  const [gapError, setGapError] = useState('')
  const [savingGap, setSavingGap] = useState(false)

  // ── Checklist items ──────────────────────────────────
  const [items, setItems] = useState<ChecklistItem[]>(initialItems)
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [itemDraft, setItemDraft] = useState('')
  const [savingItemId, setSavingItemId] = useState<string | null>(null)

  // ── Add goal ─────────────────────────────────────────
  const [addingDim, setAddingDim] = useState<string | null>(null)
  const [newGoalDraft, setNewGoalDraft] = useState('')
  const [addingError, setAddingError] = useState('')
  const [addingLoading, setAddingLoading] = useState(false)

  const [isPending, startTransition] = useTransition()

  // Group items by dimension
  const byDim: Record<string, ChecklistItem[]> = {}
  for (const item of items) {
    if (!byDim[item.dimension]) byDim[item.dimension] = []
    byDim[item.dimension].push(item)
  }

  const completedCount = items.filter(i => i.completed).length
  const totalCount = items.length
  const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  // ── Actions ──────────────────────────────────────────

  async function saveGap(index: number) {
    if (!gapDraft.trim()) return
    setSavingGap(true)
    setGapError('')
    const result = await editAssessmentGapAction(index, gapDraft)
    setSavingGap(false)
    if (!result.ok) {
      setGapError(result.error ?? 'Failed to save — please try again.')
      return
    }
    // Optimistically update local state
    setGaps(prev => prev.map((g, i) => i === index ? { ...g, why: gapDraft } : g))
    setEditingGapIdx(null)
    router.refresh()
  }

  async function saveItemLabel(id: string) {
    setSavingItemId(id)
    const result = await updateChecklistLabelAction(id, itemDraft)
    if (!result.ok) {
      setAddingError(result.error ?? 'Failed to update goal label.')
      setSavingItemId(null)
      return
    }
    // Optimistic update
    setItems(prev => prev.map(it => it.id === id ? { ...it, custom_label: itemDraft || null } : it))
    setEditingItemId(null)
    setSavingItemId(null)
    router.refresh()
  }

  function toggleItem(id: string, current: boolean) {
    // Optimistic toggle
    setItems(prev => prev.map(it => it.id === id ? { ...it, completed: !current } : it))
    startTransition(async () => {
      const result = await toggleChecklistItemAction(id, !current)
      if (!result.ok) {
        setItems(prev => prev.map(it => it.id === id ? { ...it, completed: current } : it))
      }
      router.refresh()
    })
  }

  async function addGoal(dim: string) {
    if (!newGoalDraft.trim()) return
    setAddingLoading(true)
    setAddingError('')
    const result = await addCustomGoalAction(dim, newGoalDraft.trim())
    setAddingLoading(false)
    if (!result.ok) {
      setAddingError(result.error ?? 'Failed to add goal — please try again.')
      return
    }
    // Optimistic: add placeholder item to local state (will be replaced on refresh)
    const tempItem: ChecklistItem = {
      id: `temp_${Date.now()}`,
      dimension: dim,
      label: newGoalDraft.trim(),
      custom_label: null,
      completed: false,
    }
    setItems(prev => [...prev, tempItem])
    setNewGoalDraft('')
    setAddingDim(null)
    router.refresh()
  }

  return (
    <div className="space-y-8">
      {/* Overall progress bar */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="font-body text-sm font-600 text-ink">Overall readiness</p>
            <p className="font-body text-xs text-ink-mid mt-0.5">{completedCount} of {totalCount} milestones complete</p>
          </div>
          <span className="font-display text-2xl italic text-mckinsey-blue">{pct}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-black/[0.06] overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${pct}%`, background: '#002F6C' }}
          />
        </div>
      </div>

      {/* Headline + current/target */}
      <div className="border-l-4 border-mckinsey-blue pl-5">
        <p className="font-body text-xs text-ink-faint uppercase tracking-widest mb-1">AI Assessment</p>
        <p className="font-display text-xl italic text-ink leading-snug">{assessment.headline}</p>
        <div className="flex flex-wrap gap-6 mt-3">
          <div>
            <p className="text-[10px] font-body font-600 uppercase tracking-widest text-ink-faint mb-0.5">Where you are</p>
            <p className="font-body text-sm text-ink-mid">{assessment.current_level}</p>
          </div>
          <div className="text-ink-faint self-center">→</div>
          <div>
            <p className="text-[10px] font-body font-600 uppercase tracking-widest text-ink-faint mb-0.5">Target</p>
            <p className="font-body text-sm text-ink-mid">{assessment.target_level}</p>
          </div>
        </div>
      </div>

      {/* Gaps + progress */}
      <div className="space-y-4">
        <h2 className="font-body font-700 text-xs uppercase tracking-widest text-ink-mid">Gaps &amp; progress</h2>

        {gaps.map((gap, idx) => {
          const dk = normalizeDimension(gap.category)
          const colors = DIM_COLOR[dk]
          const isEditing = editingGapIdx === idx
          const dimItems = byDim[dk] ?? []

          return (
            <div
              key={`${gap.skill}-${idx}`}
              className={`bg-white border border-black/[0.07] border-l-4 ${colors?.border ?? 'border-l-mckinsey-blue'} px-5 py-4 rounded-r-sm`}
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-body font-700 text-sm text-ink">{gap.skill}</p>
                  <span className={`text-[10px] font-body font-600 uppercase px-2 py-0.5 rounded-full ${colors?.badge ?? 'bg-blue-50 text-blue-800'}`}>
                    {gap.category}
                  </span>
                </div>
                {!isEditing && (
                  <button
                    onClick={() => { setEditingGapIdx(idx); setGapDraft(gap.why); setGapError('') }}
                    className="shrink-0 text-ink-faint hover:text-mckinsey-blue transition-colors"
                    title="Edit gap description"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-2 mt-2">
                  <textarea
                    autoFocus
                    value={gapDraft}
                    onChange={e => setGapDraft(e.target.value)}
                    rows={3}
                    className="w-full text-sm font-body text-ink px-3 py-2 border border-black/[0.08] bg-mist focus:outline-none focus:border-mckinsey-blue/40 resize-none"
                    style={{ borderRadius: '2px' }}
                  />
                  {gapError && <p className="text-xs text-red-600">{gapError}</p>}
                  <div className="flex gap-2">
                    <button
                      onClick={() => saveGap(idx)}
                      disabled={savingGap}
                      className="px-3 py-1.5 btn-brand text-white text-xs disabled:opacity-60"
                      style={{ borderRadius: '2px' }}
                    >
                      {savingGap ? 'Saving…' : 'Save'}
                    </button>
                    <button
                      onClick={() => { setEditingGapIdx(null); setGapError('') }}
                      className="px-3 py-1.5 text-xs text-ink-mid border border-black/[0.08] hover:text-ink"
                      style={{ borderRadius: '2px' }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="font-body text-xs text-ink-mid leading-relaxed">{gap.why}</p>
              )}

              <div className="mt-4 pt-3 border-t border-black/[0.06]">
                <div className="flex items-center justify-between mb-2.5">
                  <p className="font-body text-[11px] font-700 uppercase tracking-wider text-ink-mid">Goals</p>
                  <button
                    onClick={() => { setAddingDim(dk); setNewGoalDraft(''); setAddingError('') }}
                    className="text-xs font-body font-600 text-mckinsey-blue hover:underline"
                  >
                    + Add goal
                  </button>
                </div>

                <div className="space-y-2">
                  {dimItems.map(item => (
                    <div key={item.id} className="flex items-start gap-3">
                      <button
                        onClick={() => toggleItem(item.id, item.completed)}
                        disabled={isPending}
                        className={`mt-0.5 shrink-0 flex items-center justify-center text-[10px] transition-all border-2
                          ${item.completed
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : 'border-black/20 hover:border-mckinsey-blue/50 bg-white'}`}
                        style={{ width: '18px', height: '18px', borderRadius: '50%', minWidth: '18px' }}
                      >
                        {item.completed ? '✓' : ''}
                      </button>

                      <div className="flex-1 min-w-0">
                        {editingItemId === item.id ? (
                          <div className="flex gap-2 items-center">
                            <input
                              autoFocus
                              value={itemDraft}
                              onChange={e => setItemDraft(e.target.value)}
                              onKeyDown={e => {
                                if (e.key === 'Enter') saveItemLabel(item.id)
                                if (e.key === 'Escape') setEditingItemId(null)
                              }}
                              className="flex-1 text-sm text-ink px-2 py-1 border border-black/[0.08] bg-mist focus:outline-none focus:border-mckinsey-blue/40"
                              style={{ borderRadius: '2px' }}
                            />
                            <button
                              onClick={() => saveItemLabel(item.id)}
                              disabled={savingItemId === item.id}
                              className="text-xs px-2.5 py-1 btn-brand text-white disabled:opacity-50"
                              style={{ borderRadius: '2px' }}
                            >
                              {savingItemId === item.id ? '…' : 'Save'}
                            </button>
                            <button onClick={() => setEditingItemId(null)} className="text-xs text-ink-faint hover:text-ink">✕</button>
                          </div>
                        ) : (
                          <p className={`font-body text-sm ${item.completed ? 'text-ink-faint line-through' : 'text-ink'}`}>
                            {item.custom_label || item.label}
                          </p>
                        )}
                      </div>

                      {editingItemId !== item.id && (
                        <button
                          onClick={() => { setEditingItemId(item.id); setItemDraft(item.custom_label || item.label) }}
                          className="shrink-0 text-ink-faint hover:text-mckinsey-blue transition-colors mt-0.5"
                          title="Edit label"
                        >
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}

                  {dimItems.length === 0 && addingDim !== dk && (
                    <p className="text-xs text-ink-faint italic">No goals yet for this gap.</p>
                  )}
                </div>

                {addingDim === dk && (
                  <div className="mt-2.5 pt-2.5 border-t border-black/[0.05]">
                    <div className="flex items-center gap-2">
                      <input
                        autoFocus
                        value={newGoalDraft}
                        onChange={e => setNewGoalDraft(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') addGoal(dk)
                          if (e.key === 'Escape') { setAddingDim(null); setAddingError('') }
                        }}
                        placeholder="Type a new goal and press Enter…"
                        className="flex-1 text-sm text-ink px-3 py-1.5 border border-black/[0.08] bg-white focus:outline-none focus:border-mckinsey-blue/40"
                        style={{ borderRadius: '2px' }}
                      />
                      <button
                        onClick={() => addGoal(dk)}
                        disabled={addingLoading || !newGoalDraft.trim()}
                        className="text-xs px-3 py-1.5 btn-brand text-white disabled:opacity-50 shrink-0"
                        style={{ borderRadius: '2px' }}
                      >
                        {addingLoading ? 'Adding…' : 'Add'}
                      </button>
                      <button
                        onClick={() => { setAddingDim(null); setAddingError('') }}
                        className="text-xs text-ink-faint hover:text-ink shrink-0"
                      >✕</button>
                    </div>
                    {addingError && <p className="text-xs text-red-600 mt-1.5">{addingError}</p>}
                  </div>
                )}
              </div>
            </div>
          )
        })}

        {mentor && assessment.mentor_parallel && (
          <div className="border-l-4 border-mckinsey-teal pl-4 py-1">
            <p className="text-[10px] font-body font-600 uppercase tracking-widest text-mckinsey-teal mb-1">{mentor.name}&apos;s path</p>
            <p className="font-body text-xs text-ink-mid leading-relaxed">{assessment.mentor_parallel}</p>
          </div>
        )}

        {/* Year-one action */}
        <div className="bg-mckinsey-light border border-mckinsey-blue/20 px-5 py-4 rounded-sm">
          <p className="text-[10px] font-body font-600 uppercase tracking-widest text-mckinsey-blue mb-1.5">Immediate focus</p>
          <p className="font-body text-sm text-ink leading-relaxed">{assessment.year_one_action}</p>
        </div>

        {/* Strengths */}
        <div className="bg-white border border-black/[0.07] px-5 py-4 rounded-sm">
          <p className="text-[10px] font-body font-600 uppercase tracking-widest text-ink-faint mb-3">Your strengths</p>
          <div className="flex flex-wrap gap-1.5">
            {assessment.strengths.map(s => (
              <span key={s} className="text-xs font-body font-500 px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-full border border-emerald-200">
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
