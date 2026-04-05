'use client'

import { useState, useTransition } from 'react'
import SkillRadarChart from './SkillRadarChart'
import { cn } from '@/lib/utils/cn'
import { updateSkillScoreAction } from '../actions'
import type { Leader, SkillDimensionKey } from '@/types'

interface SkillScoreRow {
  dimension: string
  skill_name: string
  current_pct: number
  target_pct: number
}

const DIMS: { key: SkillDimensionKey; label: string; bar: string }[] = [
  { key: 'technical',     label: 'Technical',     bar: 'bg-accent' },
  { key: 'communication', label: 'Communication', bar: 'bg-emerald' },
  { key: 'thinking',      label: 'Thinking',      bar: 'bg-violet' },
]

function SkillRow({
  skill,
  bar,
}: {
  skill: SkillScoreRow
  bar: string
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(skill.current_pct)
  const [saved, setSaved] = useState(false)
  const [isPending, startTransition] = useTransition()

  const gap = skill.target_pct - skill.current_pct

  function handleSave() {
    startTransition(async () => {
      await updateSkillScoreAction(skill.skill_name, skill.dimension, draft)
      setSaved(true)
      setEditing(false)
      setTimeout(() => setSaved(false), 2000)
    })
  }

  function handleCancel() {
    setDraft(skill.current_pct)
    setEditing(false)
  }

  return (
    <div className="group">
      <div className="flex items-center justify-between mb-1.5 gap-2">
        <p className="font-body text-sm font-500 text-ink flex-1 min-w-0 truncate">
          {skill.skill_name}
        </p>

        <div className="flex items-center gap-2 shrink-0">
          {saved && (
            <span className="text-xs font-body text-emerald">✓ Saved</span>
          )}

          {!editing && (
            <>
              <span className="font-body text-xs text-ink-mid tabular-nums">
                {skill.current_pct}%
                <span className="text-ink-faint mx-1">/</span>
                <span className="text-ink-faint">{skill.target_pct}%</span>
              </span>
              <button
                onClick={() => { setDraft(skill.current_pct); setEditing(true) }}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-xs font-body text-ink-faint hover:text-accent px-1.5 py-0.5 rounded hover:bg-accent/5"
                title="Edit — override AI score"
              >
                Edit
              </button>
            </>
          )}
        </div>
      </div>

      {/* Progress bar (or slider when editing) */}
      {editing ? (
        <div className="space-y-2 pb-1">
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={draft}
              onChange={e => setDraft(Number(e.target.value))}
              className="flex-1 accent-accent h-1.5"
            />
            <span className="font-body text-sm font-600 text-ink w-10 text-right tabular-nums">
              {draft}%
            </span>
          </div>
          {/* Target line hint */}
          <div className="relative h-1.5 rounded-full bg-mist overflow-visible">
            <div
              className={cn('absolute left-0 top-0 h-full rounded-full transition-all', bar)}
              style={{ width: `${draft}%` }}
            />
            {/* Target marker */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-0.5 h-4 bg-ink/30 rounded-full"
              style={{ left: `${skill.target_pct}%` }}
              title={`Target: ${skill.target_pct}%`}
            />
          </div>
          <div className="flex items-center justify-between">
            <p className="font-body text-xs text-ink-faint">
              Target: <strong>{skill.target_pct}%</strong>
              {draft >= skill.target_pct
                ? <span className="text-emerald ml-1">✓ At or above target</span>
                : <span className="text-ink-mid ml-1">({skill.target_pct - draft}% gap)</span>
              }
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleCancel}
                className="text-xs font-body text-ink-faint hover:text-ink transition-colors px-2 py-1 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isPending}
                className="text-xs font-body font-500 text-white bg-accent hover:bg-accent-mid disabled:opacity-60 px-3 py-1 rounded-lg transition-colors"
              >
                {isPending ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative h-1.5 rounded-full bg-mist overflow-visible">
          <div
            className={cn('absolute left-0 top-0 h-full rounded-full transition-all duration-700', bar)}
            style={{ width: `${skill.current_pct}%` }}
          />
          {/* Target marker */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-0.5 h-3 bg-ink/25 rounded-full"
            style={{ left: `${Math.min(skill.target_pct, 99)}%` }}
            title={`Target: ${skill.target_pct}%`}
          />
        </div>
      )}

      {/* Gap label */}
      {!editing && gap > 0 && (
        <p className="font-body text-xs text-ink-faint mt-1">
          {gap}% gap to target
        </p>
      )}
    </div>
  )
}

export default function SkillsView({
  scores,
  mentor,
  userId,
}: {
  scores: SkillScoreRow[]
  mentor: Leader | null
  userId: string
}) {
  const [activeDim, setActiveDim] = useState<SkillDimensionKey>('technical')
  const activeDimData = DIMS.find(d => d.key === activeDim)!

  const filtered = scores.filter(s => s.dimension === activeDim)
  const hasScores = scores.length > 0

  return (
    <div>
      {/* Header note */}
      {hasScores && (
        <div className="flex items-start gap-2 mb-6 px-4 py-3 bg-accent/4 border border-accent/15 rounded-xl">
          <svg className="w-4 h-4 text-accent shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <p className="font-body text-xs text-ink-mid leading-relaxed">
            Scores set by AI based on your resume.
            Hover any skill and click <strong>Edit</strong> if you disagree — the vertical line marks your leader&apos;s target.
          </p>
        </div>
      )}

      {/* Dimension tabs */}
      <div className="flex gap-2 mb-8">
        {DIMS.map(d => (
          <button
            key={d.key}
            onClick={() => setActiveDim(d.key)}
            className={cn(
              'px-5 py-2 rounded-full text-sm font-body font-500 transition-colors',
              activeDim === d.key
                ? 'bg-ink text-white'
                : 'bg-white border border-ink/15 text-ink-mid hover:border-ink/40'
            )}
          >
            {d.label}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Radar chart */}
        <div className="bg-white rounded-2xl border border-ink/5 shadow-sm p-6">
          <p className="font-body text-xs text-ink-mid uppercase tracking-wider mb-4">
            Your profile — {activeDimData.label}
          </p>
          {filtered.length > 0 ? (
            <SkillRadarChart
              skills={filtered.map(s => ({ name: s.skill_name, value: s.current_pct }))}
              dimension={activeDim}
            />
          ) : (
            <div className="h-64 flex items-center justify-center">
              <div className="text-center">
                <p className="font-body text-sm text-ink-faint mb-3">
                  No skill scores yet.
                </p>
                <a href="/assessment" className="text-sm font-body text-accent hover:underline">
                  Run your assessment →
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Editable skill list */}
        <div className="bg-white rounded-2xl border border-ink/5 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="font-body text-xs text-ink-mid uppercase tracking-wider">
              Skill breakdown
            </p>
            <p className="font-body text-xs text-ink-faint">
              your score / target
            </p>
          </div>
          <div className="space-y-5">
            {filtered.length > 0 ? (
              filtered.map(s => (
                <SkillRow key={s.skill_name} skill={s} bar={activeDimData.bar} />
              ))
            ) : (
              <p className="text-sm font-body text-ink-faint py-8 text-center">
                Complete an assessment to see your skill scores.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
