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

const DIMS: { key: SkillDimensionKey; label: string; bar: string; color: string }[] = [
  { key: 'technical',     label: 'Technical',     bar: 'bg-accent',       color: '#4F82FF' },
  { key: 'communication', label: 'Communication', bar: 'bg-emerald',      color: '#10B981' },
  { key: 'thinking',      label: 'Thinking',      bar: 'bg-violet',       color: '#8B5CF6' },
]

function SkillRow({ skill, bar, color }: { skill: SkillScoreRow; bar: string; color: string }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(skill.current_pct)
  const [saved, setSaved] = useState(false)
  const [isPending, startTransition] = useTransition()

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
      <div className="flex items-center justify-between mb-2 gap-2">
        <p className="font-body text-sm font-500 text-white flex-1 min-w-0 truncate">
          {skill.skill_name}
        </p>

        <div className="flex items-center gap-2 shrink-0">
          {saved && <span className="text-xs font-body text-emerald">✓ Saved</span>}

          {!editing && (
            <>
              <div className="flex items-center gap-1 text-xs font-body tabular-nums">
                <span className="font-600 text-white">{skill.current_pct}%</span>
                <span className="text-white/25">→</span>
                <span className={cn('font-500', atNextRole ? 'text-emerald' : 'text-amber')}>
                  {nextRolePct}%
                </span>
                <span className="text-white/25">→</span>
                <span className="text-white/35">{skill.target_pct}%</span>
              </div>
              <button
                onClick={() => { setDraft(skill.current_pct); setEditing(true) }}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-xs font-body text-white/30 hover:text-accent px-1.5 py-0.5 rounded hover:bg-accent/10"
                title="Override AI score"
              >
                Edit
              </button>
            </>
          )}
        </div>
      </div>

      {editing ? (
        <div className="space-y-2 pb-1">
          <div className="flex items-center gap-3">
            <input
              type="range" min={0} max={100} step={5}
              value={draft}
              onChange={e => setDraft(Number(e.target.value))}
              className="flex-1 accent-accent h-1.5"
            />
            <span className="font-body text-sm font-600 text-white w-10 text-right tabular-nums">
              {draft}%
            </span>
          </div>
          <div className="relative h-2 rounded-full bg-white/[0.06] overflow-visible">
            <div className={cn('absolute left-0 top-0 h-full rounded-full transition-all', bar)}
              style={{ width: `${draft}%` }} />
            <div className="absolute top-1/2 -translate-y-1/2 w-0.5 h-4 bg-amber rounded-full"
              style={{ left: `${Math.min(nextRolePct, 98)}%` }} />
            <div className="absolute top-1/2 -translate-y-1/2 w-0.5 h-4 bg-white/20 rounded-full"
              style={{ left: `${Math.min(skill.target_pct, 99)}%` }} />
          </div>
          <div className="flex items-center justify-between text-xs font-body text-white/30">
            <span>
              Next role: <strong className="text-amber">{nextRolePct}%</strong>
              &nbsp;·&nbsp;
              Leader target: <strong className="text-white/50">{skill.target_pct}%</strong>
            </span>
            <div className="flex gap-2">
              <button onClick={handleCancel} className="text-white/30 hover:text-white/60 transition-colors px-2 py-1 rounded">
                Cancel
              </button>
              <button onClick={handleSave} disabled={isPending}
                className="font-500 text-white bg-accent hover:bg-accent-mid disabled:opacity-60 px-3 py-1 rounded-lg transition-colors">
                {isPending ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="relative h-1.5 rounded-full bg-white/[0.06] overflow-visible">
            <div className={cn('absolute left-0 top-0 h-full rounded-full transition-all duration-700', bar)}
              style={{ width: `${skill.current_pct}%` }} />
            <div className="absolute top-1/2 -translate-y-1/2 w-0.5 h-4 bg-amber rounded-full"
              style={{ left: `${Math.min(nextRolePct, 98)}%` }}
              title={`Next role: ${nextRolePct}%`} />
            <div className="absolute top-1/2 -translate-y-1/2 w-0.5 h-4 bg-white/20 rounded-full"
              style={{ left: `${Math.min(skill.target_pct, 99)}%` }}
              title={`Leader target: ${skill.target_pct}%`} />
          </div>

          <div className="flex items-center justify-between mt-1.5 text-xs font-body">
            {atNextRole ? (
              <span className="text-emerald font-500">✓ Ready for next role</span>
            ) : (
              <span className="text-amber">+{nextGap}% to next role</span>
            )}
            {gap > 0 && (
              <span className="text-white/25">{gap}% to leader target</span>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default function SkillsView({ scores, mentor, userId }: {
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
      {/* Legend banner */}
      {hasScores && (
        <div className="flex flex-col gap-3 mb-6">
          <div className="flex items-start gap-2 px-4 py-3 bg-accent/[0.08] border border-accent/15 rounded-xl">
            <svg className="w-4 h-4 text-accent shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <p className="font-body text-xs text-white/50 leading-relaxed">
              Scores are AI-assessed from your resume. Hover a skill and click <strong className="text-white/70">Edit</strong> to override.
            </p>
          </div>

          <div className="flex items-center gap-5 px-1 text-xs font-body text-white/30">
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-8 h-1.5 rounded-full bg-accent opacity-70" />
              You now
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-0.5 h-4 rounded-full bg-amber" />
              Next role
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-0.5 h-4 rounded-full bg-white/20" />
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
              'px-5 py-2 rounded-full text-sm font-body font-500 transition-all duration-200',
              activeDim === d.key
                ? 'bg-white/90 text-cinema-bg'
                : 'glass-card text-white/50 hover:text-white hover:bg-white/[0.06]'
            )}
          >
            {d.label}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Radar chart */}
        <div className="glass-card rounded-2xl p-6">
          <p className="font-body text-xs text-white/30 uppercase tracking-wider mb-4">
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
                <p className="font-body text-sm text-white/25 mb-3">No skill scores yet.</p>
                <a href="/assessment" className="text-sm font-body text-accent hover:underline">
                  Run your assessment →
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Skill list */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="font-body text-xs text-white/30 uppercase tracking-wider">
              Skill breakdown
            </p>
            <p className="font-body text-xs text-white/20">
              now → next role → target
            </p>
          </div>
          <div className="space-y-6">
            {filtered.length > 0 ? (
              filtered.map(s => (
                <SkillRow key={s.skill_name} skill={s} bar={activeDimData.bar} color={activeDimData.color} />
              ))
            ) : (
              <p className="text-sm font-body text-white/25 py-8 text-center">
                Complete an assessment to see your skill scores.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
