'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { markResourceCompleteAction } from '../actions'
import SemesterCoachRail, { type SemesterCoachSummary } from './SemesterCoachRail'
import type { Semester } from '@/types'

interface ProgressRow {
  semester: number
  books_completed: string[]
  course_completed: boolean
  podcast_scheduled: boolean
  milestone_achieved: boolean
}

interface Props {
  semester: Semester
  progress?: ProgressRow
  isActive: boolean
  coach: SemesterCoachSummary | null
}

export default function SemesterCard({ semester, progress, isActive, coach }: Props) {
  const [showCourseAlts, setShowCourseAlts] = useState(false)
  const [selectedCourseIdx, setSelectedCourseIdx] = useState(0)
  const [refreshKey, setRefreshKey] = useState(0)

  const allCourses = [semester.course, ...(semester.altCourses ?? [])]
  const activeCourse = allCourses[selectedCourseIdx] ?? semester.course
  const podcasts = semester.podcasts ?? [semester.podcast]

  const booksCompleted = progress?.books_completed?.length ?? 0
  const totalItems = semester.books.length + podcasts.length + 1
  const completedItems =
    booksCompleted + (progress?.podcast_scheduled ? 1 : 0) + (progress?.course_completed ? 1 : 0)
  const pct = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0

  return (
    <section
      className={`mb-14 rounded-3xl overflow-hidden border transition-all duration-500 ${
        isActive
          ? 'border-accent/35 shadow-[0_0_40px_rgba(79,130,255,0.12)]'
          : 'border-white/[0.08]'
      }`}
    >
      {/* Cinematic hero strip */}
      <div className="relative min-h-[160px] sm:min-h-[180px]">
        <div
          className="absolute inset-0 opacity-90"
          style={{
            background: `linear-gradient(135deg, rgba(79,130,255,0.25) 0%, rgba(14,20,31,0.95) 45%, rgba(139,92,246,0.12) 100%)`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-cinema-bg via-transparent to-transparent" />
        <div className="relative z-10 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-body font-600 tracking-[0.25em] text-accent uppercase mb-2">
              Semester {semester.sem} · {semester.period}
            </p>
            <h2 className="font-display text-2xl sm:text-4xl font-300 text-white leading-tight">
              {semester.theme}
            </h2>
            <p className="font-body text-sm text-white/50 mt-3 max-w-2xl leading-relaxed">
              {semester.focus}
            </p>
          </div>
          <div className="flex flex-col items-start sm:items-end gap-2 shrink-0">
            {isActive && (
              <span className="text-[10px] font-body font-600 uppercase tracking-wider text-accent px-3 py-1 rounded-full border border-accent/30 bg-accent/10">
                Your focus now
              </span>
            )}
            <div className="flex items-center gap-3 w-full sm:w-40">
              <div className="flex-1 h-1.5 rounded-full bg-white/[0.08] overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-accent to-violet transition-all duration-700"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-xs font-body text-white/40 tabular-nums w-8">{pct}%</span>
            </div>
            <button
              type="button"
              onClick={() => setRefreshKey(k => k + 1)}
              className="text-xs font-body text-white/35 hover:text-accent transition-colors flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh picks
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-8 pb-8 pt-6 space-y-10 bg-cinema-bg/80">
        <SemesterCoachRail coach={coach} />

        {/* Books carousel */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-body font-600 tracking-[0.2em] text-white/35 uppercase">
              Books
            </h3>
            <span className="text-[10px] text-white/25">{semester.books.length} titles</span>
          </div>
          <div className="flex gap-4 overflow-x-auto scroll-x pb-2 snap-x snap-mandatory -mx-1 px-1">
            {semester.books.map(book => (
              <div
                key={`${book.title}-${refreshKey}`}
                className="snap-start shrink-0 w-[132px] sm:w-[152px] poster-lift"
              >
                <div className="relative aspect-[2/3] rounded-xl overflow-hidden border border-white/10 bg-gradient-to-br from-cinema-card to-cinema-bg shadow-poster">
                  <div className="absolute top-2 left-2 z-20">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded accent-accent cursor-pointer"
                      checked={progress?.books_completed?.includes(book.title)}
                      onChange={() => markResourceCompleteAction(semester.sem, 'book', book.title)}
                    />
                  </div>
                  {book.start_here && (
                    <span className="absolute top-2 right-2 z-20 text-[9px] font-body font-600 uppercase bg-amber/90 text-cinema-bg px-1.5 py-0.5 rounded">
                      Start
                    </span>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
                    <a
                      href={book.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-body text-xs font-600 text-white leading-snug line-clamp-3 hover:text-accent transition-colors"
                    >
                      {book.title}
                    </a>
                    <p className="text-[10px] text-white/45 mt-1.5 line-clamp-1">{book.author}</p>
                  </div>
                </div>
                <p className="text-[10px] text-white/30 mt-2 line-clamp-2 leading-snug px-0.5">{book.why}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Podcasts carousel */}
        <div>
          <h3 className="text-xs font-body font-600 tracking-[0.2em] text-white/35 uppercase mb-4">
            Podcasts
          </h3>
          <div className="flex gap-4 overflow-x-auto scroll-x pb-2 snap-x snap-mandatory -mx-1 px-1">
            {podcasts.map((pod, idx) => (
              <div
                key={`${pod.title}-${refreshKey}-${idx}`}
                className="snap-start shrink-0 w-[240px] sm:w-[280px] poster-lift"
              >
                <div className="relative aspect-video rounded-xl overflow-hidden border border-white/10 bg-gradient-to-br from-violet-900/40 to-cinema-bg">
                  <div className="absolute top-2 left-2 z-20 flex items-center gap-2">
                    {idx === 0 && (
                      <input
                        type="checkbox"
                        className="w-4 h-4 accent-accent cursor-pointer"
                        checked={progress?.podcast_scheduled}
                        onChange={() => markResourceCompleteAction(semester.sem, 'podcast', !progress?.podcast_scheduled)}
                      />
                    )}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-20">
                    <span className="text-4xl">▶</span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
                    <a
                      href={pod.url ?? '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-body text-sm font-600 text-white line-clamp-2 hover:text-accent transition-colors"
                    >
                      {pod.title}
                    </a>
                    <p className="text-xs text-white/40 mt-1">with {pod.by}</p>
                  </div>
                </div>
                <a
                  href={`https://calendar.google.com/calendar/r/eventedit?text=${encodeURIComponent('🎧 ' + pod.cal)}&recur=RRULE:FREQ=WEEKLY`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-2 text-[10px] font-body text-accent hover:underline"
                >
                  + Add to calendar
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Course row */}
        <div>
          <h3 className="text-xs font-body font-600 tracking-[0.2em] text-white/35 uppercase mb-4">
            Course
          </h3>
          <AnimatePresence mode="wait">
            {!showCourseAlts ? (
              <motion.div
                key={`course-${selectedCourseIdx}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex gap-4 overflow-x-auto scroll-x snap-x -mx-1 px-1"
              >
                <div className="snap-start shrink-0 w-[min(100%,320px)] poster-lift">
                  <div className="relative aspect-video rounded-xl overflow-hidden border border-accent/20 bg-gradient-to-br from-accent/20 to-cinema-bg">
                    <div className="absolute top-3 left-3 z-20">
                      <input
                        type="checkbox"
                        className="w-4 h-4 accent-accent cursor-pointer"
                        checked={progress?.course_completed}
                        onChange={() => markResourceCompleteAction(semester.sem, 'course', !progress?.course_completed)}
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
                      <a
                        href={activeCourse.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-body text-sm font-600 text-white hover:text-accent transition-colors"
                      >
                        {activeCourse.title}
                      </a>
                      <p className="text-xs text-white/40 mt-1">{activeCourse.platform}</p>
                    </div>
                  </div>
                  {allCourses.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setShowCourseAlts(true)}
                      className="mt-3 text-xs font-body text-white/40 hover:text-accent transition-colors"
                    >
                      Not for me? Pick another →
                    </button>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="alts"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3"
              >
                {allCourses.map((c, idx) => (
                  <button
                    key={c.title}
                    type="button"
                    onClick={() => {
                      setSelectedCourseIdx(idx)
                      setShowCourseAlts(false)
                    }}
                    className={`text-left p-4 rounded-xl border transition-all ${
                      idx === selectedCourseIdx
                        ? 'border-accent/50 bg-accent/10'
                        : 'border-white/10 bg-white/[0.03] hover:border-accent/25'
                    }`}
                  >
                    <p className="font-body text-sm font-600 text-white">{c.title}</p>
                    <p className="text-xs text-white/35 mt-1">{c.platform}</p>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setShowCourseAlts(false)}
                  className="text-xs text-white/30 hover:text-white/50 self-center px-4"
                >
                  Cancel
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5">
          <p className="text-[10px] font-body font-600 tracking-[0.2em] text-white/30 uppercase mb-2">
            Milestone
          </p>
          <p className="font-body text-sm text-white/70">{semester.milestone}</p>
        </div>
      </div>
    </section>
  )
}
