'use client'

import type { Leader, Semester } from '@/types'
import type { SemesterCoachSummary } from './SemesterCoachRail'
import SemesterCard from './SemesterCard'

interface ProgressRow {
  semester: number
  books_completed: string[]
  course_completed: boolean
  podcast_scheduled: boolean
  milestone_achieved: boolean
  coach_assignment_completed?: boolean
  custom_goal?: string | null
}

interface Props {
  mentor: Leader | null
  /** Built on the server from `leader_curriculum` when available, else `buildSemesters`. */
  semesters: Semester[]
  currentSemester: number
  progress: ProgressRow[]
  gaps: { skill: string; category: string }[]
  coach: SemesterCoachSummary | null
  /** Map of "type::title" → 'up'|'down' from recommendation_feedback */
  feedback?: Record<string, 'up' | 'down'>
}

function gapLayoutKey(gaps: { skill: string; category: string }[]) {
  if (!gaps.length) return 'default'
  return gaps
    .map(g => `${g.skill}:${g.category}`)
    .sort()
    .join('|')
}

export default function SemesterMap({ mentor, semesters, currentSemester, progress, gaps, coach, feedback = {} }: Props) {
  const layoutKey = gapLayoutKey(gaps)
  const mentorId = mentor?.id ?? 'fallback'

  return (
    <div className="space-y-2 pb-8">
      {!mentor && (
        <div className="rounded-sm border border-amber/30 bg-amber/[0.04] px-4 py-3 mb-4">
          <p className="font-body text-sm text-ink-mid">
            Your mentor profile is still syncing, so we are showing a fallback journey meanwhile.
          </p>
        </div>
      )}
      <p className="font-body text-xs text-ink-faint mb-6 max-w-xl">
        Scroll each row sideways — same idea as streaming apps: explore books, shows, and your course like curated rails.
      </p>
      {semesters.map(sem => {
        const prog = progress.find(p => p.semester === sem.sem)
        return (
          <SemesterCard
            key={`${mentorId}-${sem.sem}-${layoutKey}`}
            semester={sem}
            progress={prog}
            isActive={sem.sem === currentSemester}
            coach={coach}
            feedback={feedback}
          />
        )
      })}
    </div>
  )
}
