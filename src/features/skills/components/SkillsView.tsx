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
  next_role_pct?: number
  target_pct: number
}

const DIMS: { key: SkillDimensionKey; label: string; bar: string; nextBar: string }[] = [
  { key: 'technical',     label: 'Technical',     bar: 'bg-accent',        nextBar: 'border-accent' },
  { key: 'communication', label: 'Communication', bar: 'bg-emerald-500',   nextBar: 'border-emerald-500' },
  { key: 'thinking',      label: 'Thinking',      bar: 'bg-violet-500',    nextBar: 'border-violet-500' },
]

function SkillRow({
  skill,
  bar,
  nextBar,
}: {
  skill: SkillScoreRow
  bar: string
  nextBar: string
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(skill.current_pct)
  const [saved, setSaved] = useState(false)
  const [isPending, startTransition] = useTransition()

  // next_role_pct from DB, or derive as 45% of the way to target if missing
  const nextRolePct = skill.next_role_pct
    ?? Math.round(skill.current_pct + (skill.target_pct - skill.current_pct) * 0.45)

  const gap = skill.target_pct - skill.current_pct
  const nextGap = Math.max(0, nextRolePct - skill.current_pct)
  const atNextRole = skill.current_pct >= nextRolePct

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
      {/* Skill name + scores */}
      <div className="flex items-center justify-between mb-2 gap-2">
        <p className="font-body text-sm font-500 text-ink flex-1 min-w-0 truncate">
          {skill.skill_name}
        </p>

        <div className="flex items-center gap-2 shrink-0">
          {saved && (
            <span className="text-xs font-body text-emerald-600">✓ Saved</span>
          )}

          {!editing && (
            <>
              <div className="flex items-center gap-1 text-xs font-body tabular-nums">
                <span className="font-600 text-ink">{skill.current_pct}%</span>
                <span className="text-ink-faint">→</span>
                <span className={cn('font-500', atNextRole ? 'text-emerald-600' : 'text-amber-600')}>
                  {nextRolePct}%
                </span>
                <span className="text-ink-faint">→</span>
                <span className="text-ink-faint">{skill.target_pct}%</span>
              </div>
              <button
                onClick={() => { setDraft(skill.current_pct); setEditing(true) }}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-xs font-body text-ink-faint hover:text-accent px-1.5 py-0.5 rounded hover:bg-accent/5"
                title="Override AI score"
              >
                Edit
              </button>
            </>
          )}
        </div>
      </div>

      {/* Progress bar */}
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
          <div className="relative h-2 rounded-full bg-mist overflow-visible">
            <div
              className={cn('absolute left-0 top-0 h-full rounded-full transition-all', bar)}
              style={{ width: `${draft}%` }}
            />
            {/* Next role marker */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-0.5 h-4 bg-amber-400 rounded-full"
              style={{ left: `${Math.min(nextRolePct, 98)}%` }}
              title={`Next role needs: ${nextRolePct}%`}
            />
            {/* Target marker */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-0.5 h-4 bg-ink/25 rounded-full"
              style={{ left: `${Math.min(skill.target_pct, 99)}%` }}
              title={`Leader target: ${skill.target_pct}%`}
            />
          </div>
          <div className="flex items-center justify-between text-xs font-body text-ink-faint">
            <span>
              Next role: <strong className="text-amber-600">{nextRolePct}%</strong>
              &nbsp;·&nbsp;
              Leader target: <strong className="text-ink-mid">{skill.target_pct}%</strong>
            </span>
            <div className="flex gap-2">
              <button
                onClick={handleCancel}
                className="text-ink-faint hover:text-ink transition-colors px-2 py-1 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isPending}
                className="font-500 text-white bg-accent hover:bg-accent-mid disabled:opacity-60 px-3 py-1 rounded-lg transition-colors"
              >
                {isPending ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="relative h-2 rounded-full bg-mist overflow-visible">
            {/* Current level fill */}
            <div
              className={cn('absolute left-0 top-0 h-full rounded-full transition-all duration-700', bar)}
              style={{ width: `${skill.current_pct}%` }}
            />
            {/* Next role marker — amber vertical line */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-0.5 h-4 bg-amber-400 rounded-full shadow-sm"
              style={{ left: `${Math.min(nextRolePct, 98)}%` }}
              title={`Next role needs: ${nextRolePct}%`}
            />
            {/* Leader target marker — grey vertical line */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-0.5 h-4 bg-ink/20 rounded-full"
              style={{ left: `${Math.min(skill.target_pct, 99)}%` }}
              title={`Leader target: ${skill.target_pct}%`}
            />
          </div>

          {/* Gap line below bar */}
          <div className="flex items-center justify-between mt-1.5 text-xs font-body">
            {atNextRole ? (
              <span className="text-emerald-600 font-500">✓ Ready for next role</span>
            ) : (
              <span className="text-amber-600">
                +{nextGap}% to next role
              </span>
            )}
            {gap > 0 && (
              <span className="text-ink-faint">{gap}% to leader target</span>
            )}
          </div>
        </>
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
      {/* Legend + info banner */}
      {hasScores && (
        <div className="flex flex-col gap-3 mb-6">
          <div className="flex items-start gap-2 px-4 py-3 bg-accent/4 border border-accent/15 rounded-xl">
            <svg className="w-4 h-4 text-accent shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <p className="font-body text-xs text-ink-mid leading-relaxed">
              Scores are AI-assessed from your resume. Hover a skill and click <strong>Edit</strong> to override.
            </p>
          </div>

          {/* Bar legend */}
          <div className="flex items-center gap-5 px-1 text-xs font-body text-ink-faint">
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-8 h-1.5 rounded-full bg-accent opacity-70" />
              You now
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-0.5 h-4 rounded-full bg-amber-400" />
              Next role needed
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-0.5 h-4 rounded-full bg-ink/25" />
              Leader target
            </span>
          </div>
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
                <p className="font-body text-sm text-ink-faint mb-3">No skill scores yet.</p>
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
              now → next role → target
            </p>
          </div>
          <div className="space-y-6">
            {filtered.length > 0 ? (
              filtered.map(s => (
                <SkillRow
                  key={s.skill_name}
                  skill={s}
                  bar={activeDimData.bar}
                  nextBar={activeDimData.nextBar}
                />
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
