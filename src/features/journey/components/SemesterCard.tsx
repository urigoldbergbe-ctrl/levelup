'use client'

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
  const booksCompleted = progress?.books_completed?.length ?? 0
  const totalItems = semester.books.length + 2 // + course + podcast
  const completedItems = booksCompleted + (progress?.course_completed ? 1 : 0) + (progress?.podcast_scheduled ? 1 : 0)
  const pct = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0

  return (
    <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${isActive ? 'border-accent/30' : 'border-ink/5'}`}>
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-6 text-left"
      >
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-body font-600 ${isActive ? 'bg-accent text-white' : 'bg-mist text-ink-mid'}`}>
            {semester.sem}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-body font-600 text-ink text-sm">{semester.label}</p>
              <span className="text-xs font-body text-ink-faint">{semester.period}</span>
              {isActive && <span className="text-[10px] font-body font-500 bg-accent/10 text-accent px-2 py-0.5 rounded-full">Active</span>}
            </div>
            <p className="font-body text-xs text-ink-mid mt-0.5">{semester.theme} · {semester.focus.slice(0, 60)}…</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
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
            <div className="px-6 pb-6 pt-0 border-t border-ink/5 space-y-5">
              {/* Books */}
              {semester.books.length > 0 && (
                <div>
                  <p className="text-xs font-body font-500 tracking-[0.12em] text-ink-mid uppercase mb-3 mt-4">Books</p>
                  {semester.books.map(book => (
                    <div key={book.title} className="flex items-start gap-3 mb-3">
                      <input
                        type="checkbox"
                        className="mt-0.5 accent-accent"
                        checked={progress?.books_completed?.includes(book.title)}
                        onChange={() => markResourceCompleteAction(semester.sem, 'book', book.title)}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <a href={book.url} target="_blank" rel="noopener noreferrer" className="font-body text-sm font-500 text-ink hover:text-accent transition-colors">
                            {book.title}
                          </a>
                          {book.start_here && (
                            <span className="text-[10px] font-body font-500 bg-amber/20 text-amber px-2 py-0.5 rounded-full">Start here</span>
                          )}
                        </div>
                        <p className="font-body text-xs text-ink-mid">{book.why}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Podcast */}
              <div>
                <p className="text-xs font-body font-500 tracking-[0.12em] text-ink-mid uppercase mb-2">Podcast</p>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    className="accent-accent"
                    checked={progress?.podcast_scheduled}
                    onChange={() => markResourceCompleteAction(semester.sem, 'podcast', !progress?.podcast_scheduled)}
                  />
                  <div>
                    <p className="font-body text-sm text-ink">{semester.podcast.title}</p>
                    <p className="font-body text-xs text-ink-mid">by {semester.podcast.by}</p>
                  </div>
                  <a
                    href={`https://calendar.google.com/calendar/r/eventedit?text=${encodeURIComponent('🎧 ' + semester.podcast.cal)}&recur=RRULE:FREQ=WEEKLY`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-auto text-xs font-body text-accent hover:underline"
                  >
                    + Calendar
                  </a>
                </div>
              </div>

              {/* Course */}
              <div>
                <p className="text-xs font-body font-500 tracking-[0.12em] text-ink-mid uppercase mb-2">Course</p>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    className="accent-accent"
                    checked={progress?.course_completed}
                    onChange={() => markResourceCompleteAction(semester.sem, 'course', !progress?.course_completed)}
                  />
                  <div>
                    <a href={semester.course.url} target="_blank" rel="noopener noreferrer" className="font-body text-sm text-ink hover:text-accent transition-colors">
                      {semester.course.title}
                    </a>
                    <p className="font-body text-xs text-ink-mid">{semester.course.platform}</p>
                  </div>
                </div>
              </div>

              {/* Milestone */}
              <div className="bg-mist rounded-xl p-4">
                <p className="text-xs font-body font-500 tracking-[0.12em] text-ink-mid uppercase mb-1">Semester milestone</p>
                <p className="font-body text-sm text-ink">{semester.milestone}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
