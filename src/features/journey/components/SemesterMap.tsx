'use client'

import { useState } from 'react'
import SemesterCard from './SemesterCard'
import type { Leader } from '@/types'
import { buildSemesters } from '../utils'

interface ProgressRow {
  semester: number
  books_completed: string[]
  course_completed: boolean
  podcast_scheduled: boolean
  milestone_achieved: boolean
}

interface Props {
  mentor: Leader | null
  currentSemester: number
  progress: ProgressRow[]
  gaps: { skill: string; category: string }[]
}

export default function SemesterMap({ mentor, currentSemester, progress, gaps }: Props) {
  const [expanded, setExpanded] = useState<number>(currentSemester)
  const semesters = buildSemesters(mentor, gaps)

  if (!mentor) {
    return (
      <div className="bg-amber/10 border border-amber/30 rounded-2xl p-8 text-center">
        <p className="font-body text-sm text-ink-mid mb-3">Choose a leader to see your learning journey.</p>
        <a href="/onboarding" className="text-sm font-body text-accent hover:underline">
          Choose a leader →
        </a>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {semesters.map(sem => {
        const prog = progress.find(p => p.semester === sem.sem)
        return (
          <SemesterCard
            key={sem.sem}
            semester={sem}
            progress={prog}
            isActive={sem.sem === currentSemester}
            isExpanded={expanded === sem.sem}
            onToggle={() => setExpanded(prev => (prev === sem.sem ? -1 : sem.sem))}
          />
        )
      })}
    </div>
  )
}
