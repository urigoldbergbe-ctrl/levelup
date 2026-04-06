'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { markResourceCompleteAction } from '../actions'
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
  isExpanded: boolean
  onToggle: () => void
}

export default function SemesterCard({ semester, progress, isActive, isExpanded, onToggle }: Props) {
  const [showCourseAlts, setShowCourseAlts] = useState(false)
  const [selectedCourseIdx, setSelectedCourseIdx] = useState(0)
  const [refreshKey, setRefreshKey] = useState(0)

  const allCourses = [semester.course, ...(semester.altCourses ?? [])]
  const activeCourse = allCourses[selectedCourseIdx] ?? semester.course

  const podcasts = semester.podcasts ?? [semester.podcast]

  const booksCompleted = progress?.books_completed?.length ?? 0
  const totalItems = semester.books.length + podcasts.length + 1 // books + podcasts + course
  const completedItems =
    booksCompleted +
    (progress?.podcast_scheduled ? 1 : 0) +
    (progress?.course_completed ? 1 : 0)
  const pct = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0

  return (
    <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${isActive ? 'border-accent/30' : 'border-ink/5'}`}>
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-6 text-left"
      >
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-body font-600 shrink-0 ${isActive ? 'bg-accent text-white' : 'bg-mist text-ink-mid'}`}>
            {semester.sem}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-body font-600 text-ink text-sm">{semester.label}</p>
              <span className="text-xs font-body text-ink-faint">{semester.period}</span>
              {isActive && (
                <span className="text-[10px] font-body font-500 bg-accent/10 text-accent px-2 py-0.5 rounded-full">
                  Active
                </span>
              )}
            </div>
            <p className="font-body text-xs text-ink-mid mt-0.5">
              {semester.theme} · {semester.focus.slice(0, 55)}…
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-body text-ink-faint">{pct}% done</p>
          </div>
          <span className="text-ink-faint text-sm">{isExpanded ? '▲' : '▼'}</span>
        </div>
      </button>

      {/* Expanded content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 pt-0 border-t border-ink/5 space-y-6">
              {/* Refresh hint */}
              <div className="flex items-center justify-between pt-4">
                <p className="font-body text-xs text-ink-faint">
                  {semester.books.length} books · {podcasts.length} podcasts · 1 course
                </p>
                <button
                  onClick={() => setRefreshKey(k => k + 1)}
                  className="flex items-center gap-1.5 text-xs font-body text-ink-faint hover:text-accent transition-colors"
                  title="Refresh to see alternative picks"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh picks
                </button>
              </div>

              {/* Books */}
              <div>
                <p className="text-xs font-body font-500 tracking-[0.12em] text-ink-mid uppercase mb-3">
                  Books ({semester.books.length})
                </p>
                <div className="space-y-4">
                  {semester.books.map((book, idx) => (
                    <div key={`${book.title}-${refreshKey}`} className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        className="mt-0.5 accent-accent shrink-0"
                        checked={progress?.books_completed?.includes(book.title)}
                        onChange={() => markResourceCompleteAction(semester.sem, 'book', book.title)}
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <a
                            href={book.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-body text-sm font-500 text-ink hover:text-accent transition-colors"
                          >
                            {book.title}
                          </a>
                          {book.start_here && (
                            <span className="text-[10px] font-body font-500 bg-amber/20 text-amber px-2 py-0.5 rounded-full shrink-0">
                              Start here
                            </span>
                          )}
                        </div>
                        <p className="font-body text-xs text-ink-mid">
                          {book.author} · {book.why}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Podcasts */}
              <div>
                <p className="text-xs font-body font-500 tracking-[0.12em] text-ink-mid uppercase mb-3">
                  Podcasts ({podcasts.length})
                </p>
                <div className="space-y-3">
                  {podcasts.map((pod, idx) => (
                    <div key={`${pod.title}-${refreshKey}-${idx}`} className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        className="accent-accent shrink-0"
                        checked={idx === 0 ? progress?.podcast_scheduled : false}
                        onChange={() => idx === 0 && markResourceCompleteAction(semester.sem, 'podcast', !progress?.podcast_scheduled)}
                      />
                      <div className="flex-1 min-w-0">
                        <a
                          href={pod.url ?? '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-body text-sm text-ink hover:text-accent transition-colors block truncate"
                        >
                          {pod.title}
                        </a>
                        <p className="font-body text-xs text-ink-faint">by {pod.by}</p>
                      </div>
                      <a
                        href={`https://calendar.google.com/calendar/r/eventedit?text=${encodeURIComponent('🎧 ' + pod.cal)}&recur=RRULE:FREQ=WEEKLY`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-body text-accent hover:underline shrink-0"
                      >
                        + Calendar
                      </a>
                    </div>
                  ))}
                </div>
              </div>

              {/* Course */}
              <div>
                <p className="text-xs font-body font-500 tracking-[0.12em] text-ink-mid uppercase mb-3">
                  Course
                </p>
                <AnimatePresence mode="wait">
                  {!showCourseAlts ? (
                    <motion.div
                      key={`course-${selectedCourseIdx}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-3"
                    >
                      <input
                        type="checkbox"
                        className="accent-accent shrink-0"
                        checked={progress?.course_completed}
                        onChange={() => markResourceCompleteAction(semester.sem, 'course', !progress?.course_completed)}
                      />
                      <div className="flex-1 min-w-0">
                        <a
                          href={activeCourse.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-body text-sm text-ink hover:text-accent transition-colors block truncate"
                        >
                          {activeCourse.title}
                        </a>
                        <p className="font-body text-xs text-ink-faint">{activeCourse.platform}</p>
                      </div>
                      {allCourses.length > 1 && (
                        <button
                          onClick={() => setShowCourseAlts(true)}
                          className="text-xs font-body text-ink-faint hover:text-accent transition-colors shrink-0 whitespace-nowrap"
                        >
                          Not for me →
                        </button>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="course-picker"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="bg-mist rounded-xl p-4 space-y-3"
                    >
                      <p className="font-body text-xs font-500 text-ink-mid mb-1">
                        Pick a course that works better for you:
                      </p>
                      {allCourses.map((c, idx) => (
                        <button
                          key={c.title}
                          onClick={() => { setSelectedCourseIdx(idx); setShowCourseAlts(false) }}
                          className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                            idx === selectedCourseIdx
                              ? 'border-accent/40 bg-accent/5'
                              : 'border-ink/10 bg-white hover:border-accent/30'
                          }`}
                        >
                          <p className="font-body text-sm font-500 text-ink">{c.title}</p>
                          <p className="font-body text-xs text-ink-faint mt-0.5">{c.platform}</p>
                        </button>
                      ))}
                      <button
                        onClick={() => setShowCourseAlts(false)}
                        className="text-xs font-body text-ink-faint hover:text-ink transition-colors"
                      >
                        Cancel
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Milestone */}
              <div className="bg-mist rounded-xl p-4">
                <p className="text-xs font-body font-500 tracking-[0.12em] text-ink-mid uppercase mb-1">
                  Semester milestone
                </p>
                <p className="font-body text-sm text-ink">{semester.milestone}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
