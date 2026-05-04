'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import type { Leader } from '@/types'
import {
  toggleChecklistItemAction,
  updateChecklistLabelAction,
  editAssessmentGapAction,
  addCustomGoalAction,
  rerunCurriculumFromProgressAction,
} from '@/features/assessment/actions'

interface Gap {
  skill: string
  why: string
  category: string
}

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
  Technical:     'technical',
  Communication: 'communication',
  Thinking:      'thinking',
}

const DIM_COLOR: Record<string, { border: string; badge: string; dot: string }> = {
  technical:     { border: 'border-l-[#002F6C]', badge: 'bg-blue-50 text-blue-800', dot: '#002F6C' },
  communication: { border: 'border-l-emerald-500', badge: 'bg-emerald-50 text-emerald-800', dot: '#10B981' },
  thinking:      { border: 'border-l-violet-500', badge: 'bg-violet-50 text-violet-800', dot: '#6366F1' },
}

export default function ProgressAssessmentView({ assessment, checklistItems, mentor }: Props) {
  const [editingGapIdx, setEditingGapIdx] = useState<number | null>(null)
  const [gapDraft, setGapDraft] = useState('')
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [itemDraft, setItemDraft] = useState('')
  const [addingDim, setAddingDim] = useState<string | null>(null)
  const [newGoalDraft, setNewGoalDraft] = useState('')
  const [regenState, setRegenState] = useState<'idle' | 'running' | 'done' | 'error'>('idle')
  const [regenMsg, setRegenMsg] = useState('')
  const [isPending, startTransition] = useTransition()

  // Group checklist by dimension key
  const byDim: Record<string, ChecklistItem[]> = {}
  for (const item of checklistItems) {
    if (!byDim[item.dimension]) byDim[item.dimension] = []
    byDim[item.dimension].push(item)
  }

  // Map gap category → dimension key
  function dimKey(category: string) {
    return DIM_MAP[category] ?? category.toLowerCase()
  }

  async function triggerRegen() {
    setRegenState('running')
    const result = await rerunCurriculumFromProgressAction()
    if (result.ok) {
      setRegenState('done')
      setRegenMsg('Journey updated with your latest progress.')
    } else {
      setRegenState('error')
      setRegenMsg(result.error ?? 'Could not update journey.')
    }
  }

  function saveGap(index: number) {
    startTransition(async () => {
      await editAssessmentGapAction(index, gapDraft)
      setEditingGapIdx(null)
      triggerRegen()
    })
  }

  function saveItemLabel(id: string) {
    startTransition(async () => {
      await updateChecklistLabelAction(id, itemDraft)
      setEditingItemId(null)
    })
  }

  function toggleItem(id: string, current: boolean) {
    startTransition(async () => {
      await toggleChecklistItemAction(id, !current)
      triggerRegen()
    })
  }

  function addGoal(dim: string) {
    if (!newGoalDraft.trim()) return
    startTransition(async () => {
      await addCustomGoalAction(dim, newGoalDraft)
      setNewGoalDraft('')
      setAddingDim(null)
      triggerRegen()
    })
  }

  const completedCount = checklistItems.filter(i => i.completed).length
  const totalCount = checklistItems.length
  const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

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

      {/* Regen notice */}
      {regenState === 'running' && (
        <div className="flex items-center gap-3 text-sm text-ink-mid">
          <span className="w-4 h-4 border-2 border-mckinsey-blue/30 border-t-mckinsey-blue rounded-full animate-spin" />
          Updating your journey recommendations… (~30s)
        </div>
      )}
      {regenState === 'done' && (
        <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 px-4 py-2.5 rounded-lg flex items-center gap-2">
          ✓ {regenMsg}
          <Link href="/journey" className="ml-auto underline font-600">View journey →</Link>
        </p>
      )}
      {regenState === 'error' && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-2.5 rounded-lg">{regenMsg}</p>
      )}

      {/* Two-column: Gaps left / Goals right */}
      <div className="grid lg:grid-cols-2 gap-6 items-start">

        {/* LEFT — Gaps */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-body font-700 text-sm uppercase tracking-widest text-ink-mid">Skill gaps to close</h2>
          </div>

          {assessment.gaps.map((gap, idx) => {
            const dk = dimKey(gap.category)
            const colors = DIM_COLOR[dk]
            return (
              <div
                key={gap.skill}
                className={`bg-white border border-black/[0.07] border-l-4 ${colors?.border ?? 'border-l-mckinsey-blue'} px-5 py-4 rounded-r-lg`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <p className="font-body font-700 text-sm text-ink">{gap.skill}</p>
                    <span className={`text-[10px] font-body font-600 uppercase px-2 py-0.5 rounded-full ${colors?.badge ?? 'bg-blue-50 text-blue-800'}`}>
                      {gap.category}
                    </span>
                  </div>
                  {editingGapIdx !== idx && (
                    <button
                      onClick={() => { setEditingGapIdx(idx); setGapDraft(gap.why) }}
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

                {editingGapIdx === idx ? (
                  <div className="space-y-2 mt-2">
                    <textarea
                      autoFocus
                      value={gapDraft}
                      onChange={e => setGapDraft(e.target.value)}
                      rows={3}
                      className="w-full text-sm font-body text-ink px-3 py-2 border border-black/[0.08] bg-mist rounded-lg focus:outline-none focus:border-mckinsey-blue/40 resize-none"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => saveGap(idx)}
                        disabled={isPending}
                        className="px-3 py-1.5 btn-brand text-white text-xs rounded-lg disabled:opacity-60"
                      >Save</button>
                      <button
                        onClick={() => setEditingGapIdx(null)}
                        className="px-3 py-1.5 text-xs text-ink-mid border border-black/[0.08] rounded-lg hover:text-ink"
                      >Cancel</button>
                    </div>
                  </div>
                ) : (
                  <p className="font-body text-xs text-ink-mid leading-relaxed">{gap.why}</p>
                )}
              </div>
            )
          })}

          {/* Year-one action */}
          <div className="bg-mckinsey-light border border-mckinsey-blue/20 px-5 py-4 rounded-lg mt-2">
            <p className="text-[10px] font-body font-600 uppercase tracking-widest text-mckinsey-blue mb-1.5">Immediate focus</p>
            <p className="font-body text-sm text-ink leading-relaxed">{assessment.year_one_action}</p>
          </div>

          {/* Strengths */}
          <div className="bg-white border border-black/[0.07] px-5 py-4 rounded-lg">
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

        {/* RIGHT — Goals / Checklist */}
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="font-body font-700 text-sm uppercase tracking-widest text-ink-mid">Milestones &amp; goals</h2>
            <button
              onClick={triggerRegen}
              disabled={regenState === 'running' || isPending}
              className="text-xs text-mckinsey-blue hover:underline disabled:opacity-50 flex items-center gap-1"
            >
              ↺ Update journey
            </button>
          </div>

          {/* Group goals by dimension — matching gaps above */}
          {assessment.gaps.map(gap => {
            const dk = dimKey(gap.category)
            const colors = DIM_COLOR[dk]
            const items = byDim[dk] ?? []
            return (
              <div key={dk} className="bg-white border border-black/[0.07] rounded-lg overflow-hidden">
                {/* Dimension header */}
                <div className={`flex items-center justify-between px-4 py-2.5 border-l-4 ${colors?.border ?? 'border-l-mckinsey-blue'} bg-mist/60`}>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-body font-600 uppercase px-2 py-0.5 rounded-full ${colors?.badge ?? ''}`}>
                      {gap.category}
                    </span>
                    <span className="text-xs text-ink-mid font-body">{gap.skill}</span>
                  </div>
                  <button
                    onClick={() => { setAddingDim(dk); setNewGoalDraft('') }}
                    className="text-xs text-mckinsey-blue hover:underline flex items-center gap-0.5"
                  >
                    + Add goal
                  </button>
                </div>

                {/* Goal items */}
                <div className="divide-y divide-black/[0.04]">
                  {items.length === 0 && addingDim !== dk && (
                    <p className="px-4 py-3 text-xs text-ink-faint italic">No milestones yet — add one above.</p>
                  )}
                  {items.map(item => (
                    <div key={item.id} className="flex items-start gap-3 px-4 py-3">
                      <button
                        onClick={() => toggleItem(item.id, item.completed)}
                        disabled={isPending}
                        className={`mt-0.5 w-4.5 h-4.5 shrink-0 rounded-full border-2 flex items-center justify-center text-[9px] transition-all
                          ${item.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-black/20 hover:border-mckinsey-blue/50'}`}
                        style={{ width: '18px', height: '18px' }}
                      >
                        {item.completed ? '✓' : ''}
                      </button>
                      <div className="flex-1 min-w-0">
                        {editingItemId === item.id ? (
                          <div className="flex gap-2">
                            <input
                              autoFocus
                              value={itemDraft}
                              onChange={e => setItemDraft(e.target.value)}
                              onKeyDown={e => { if (e.key === 'Enter') saveItemLabel(item.id); if (e.key === 'Escape') setEditingItemId(null) }}
                              className="flex-1 text-sm text-ink px-2 py-1 border border-black/[0.08] bg-mist rounded focus:outline-none focus:border-mckinsey-blue/40"
                            />
                            <button onClick={() => saveItemLabel(item.id)} className="text-xs px-2.5 py-1 btn-brand text-white rounded">Save</button>
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
                        >
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}

                  {/* Add goal inline */}
                  {addingDim === dk && (
                    <div className="flex items-center gap-2 px-4 py-3 bg-mist/40">
                      <input
                        autoFocus
                        value={newGoalDraft}
                        onChange={e => setNewGoalDraft(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') addGoal(dk); if (e.key === 'Escape') setAddingDim(null) }}
                        placeholder="Type a new goal and press Enter…"
                        className="flex-1 text-sm text-ink px-3 py-1.5 border border-black/[0.08] bg-white rounded focus:outline-none focus:border-mckinsey-blue/40"
                      />
                      <button onClick={() => addGoal(dk)} disabled={isPending}
                        className="text-xs px-3 py-1.5 btn-brand text-white rounded disabled:opacity-50">
                        Add
                      </button>
                      <button onClick={() => setAddingDim(null)} className="text-xs text-ink-faint hover:text-ink">✕</button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}

          {/* Mentor parallel */}
          {mentor && assessment.mentor_parallel && (
            <div className="border-l-4 border-mckinsey-teal pl-4 py-1">
              <p className="text-[10px] font-body font-600 uppercase tracking-widest text-mckinsey-teal mb-1">{mentor.name}&apos;s path</p>
              <p className="font-body text-xs text-ink-mid leading-relaxed">{assessment.mentor_parallel}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
