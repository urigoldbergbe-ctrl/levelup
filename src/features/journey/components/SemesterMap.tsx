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
}

interface Props {
  mentor: Leader | null
  /** Built on the server from `leader_curriculum` when available, else `buildSemesters`. */
  semesters: Semester[]
  currentSemester: number
  progress: ProgressRow[]
  gaps: { skill: string; category: string }[]
  coach: SemesterCoachSummary | null
}

function gapLayoutKey(gaps: { skill: string; category: string }[]) {
  if (!gaps.length) return 'default'
  return gaps
    .map(g => `${g.skill}:${g.category}`)
    .sort()
    .join('|')
}

export default function SemesterMap({ mentor, semesters, currentSemester, progress, gaps, coach }: Props) {
  const layoutKey = gapLayoutKey(gaps)

  if (!mentor) {
    return (
      <div className="glass-card rounded-2xl p-10 text-center border border-amber/20">
        <p className="font-body text-sm text-white/50 mb-4">Choose a leader to unlock your learning journey.</p>
        <a
          href="/mentors"
          className="inline-flex px-6 py-3 bg-accent text-white text-sm font-body font-600 rounded-xl hover:shadow-accent transition-all"
        >
          Browse leaders →
        </a>
      </div>
    )
  }

  return (
    <div className="space-y-2 pb-8">
      <p className="font-body text-xs text-white/35 mb-6 max-w-xl">
        Scroll each row sideways — same idea as streaming apps: explore books, shows, and your course like curated rails.
      </p>
      {semesters.map(sem => {
        const prog = progress.find(p => p.semester === sem.sem)
        return (
          <SemesterCard
            key={`${mentor.id}-${sem.sem}-${layoutKey}`}
            semester={sem}
            progress={prog}
            isActive={sem.sem === currentSemester}
            coach={coach}
          />
        )
      })}
    </div>
  )
}
