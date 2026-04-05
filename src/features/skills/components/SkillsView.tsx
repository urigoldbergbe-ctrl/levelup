'use client'

import { useState } from 'react'
import SkillRadarChart from './SkillRadarChart'
import { cn } from '@/lib/utils/cn'
import type { Leader, SkillDimensionKey } from '@/types'

interface SkillScoreRow {
  dimension: string
  skill_name: string
  current_pct: number
  target_pct: number
}

const DIMS: { key: SkillDimensionKey; label: string; color: string }[] = [
  { key: 'technical', label: 'Technical', color: 'text-accent' },
  { key: 'communication', label: 'Communication', color: 'text-emerald' },
  { key: 'thinking', label: 'Thinking', color: 'text-violet' },
]

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

  const filtered = scores.filter(s => s.dimension === activeDim)

  return (
    <div>
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
            Your profile
          </p>
          {filtered.length > 0 ? (
            <SkillRadarChart
              skills={filtered.map(s => ({ name: s.skill_name, value: s.current_pct }))}
              dimension={activeDim}
            />
          ) : (
            <div className="h-64 flex items-center justify-center text-sm text-ink-faint">
              Complete an assessment to see your skill scores.
            </div>
          )}
        </div>

        {/* Skill list */}
        <div className="bg-white rounded-2xl border border-ink/5 shadow-sm p-6">
          <p className="font-body text-xs text-ink-mid uppercase tracking-wider mb-4">
            Skill breakdown
          </p>
          <div className="space-y-4">
            {filtered.map(s => (
              <div key={s.skill_name}>
                <div className="flex justify-between items-center mb-1">
                  <p className="font-body text-xs font-500 text-ink">{s.skill_name}</p>
                  <p className="font-body text-xs text-ink-mid">{s.current_pct}% / {s.target_pct}%</p>
                </div>
                <div className="h-1.5 rounded-full bg-mist overflow-hidden">
                  <div
                    className={cn('h-full rounded-full transition-all duration-700', {
                      'bg-accent': activeDim === 'technical',
                      'bg-emerald': activeDim === 'communication',
                      'bg-violet': activeDim === 'thinking',
                    })}
                    style={{ width: `${s.current_pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
