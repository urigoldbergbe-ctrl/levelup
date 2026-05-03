'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { markResourceCompleteAction, updateSemesterGoalAction } from '../actions'
import SemesterCoachRail, { type SemesterCoachSummary } from './SemesterCoachRail'
import { applePodcastCoverUrl, courseThumbUrl, openLibraryCoverUrl } from '../resourceMedia'
import ThumbsFeedback from '@/features/recommendations/components/ThumbsFeedback'
import type { Semester } from '@/types'

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
  semester: Semester
  progress?: ProgressRow
  isActive: boolean
  coach: SemesterCoachSummary | null
  /** Map of "type::title" → 'up'|'down' */
  feedback?: Record<string, 'up' | 'down'>
}

export default function SemesterCard({ semester, progress, isActive, coach, feedback = {} }: Props) {
  const [showCourseAlts, setShowCourseAlts] = useState(false)
  const [selectedCourseIdx, setSelectedCourseIdx] = useState(0)
  const [refreshKey, setRefreshKey] = useState(0)
  const [editingGoal, setEditingGoal] = useState(false)
  const [goalDraft, setGoalDraft] = useState(progress?.custom_goal ?? semester.focus)

  const allCourses = [semester.course, ...(semester.altCourses ?? [])]
  const activeCourse = allCourses[selectedCourseIdx] ?? semester.course
  const podcasts = semester.podcasts ?? [semester.podcast]

  const booksCompleted = progress?.books_completed?.length ?? 0
  const totalItems = semester.books.length + podcasts.length + 2
  const completedItems =
    booksCompleted +
    (progress?.podcast_scheduled ? 1 : 0) +
    (progress?.course_completed ? 1 : 0) +
    (progress?.coach_assignment_completed ? 1 : 0)
  const pct = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0

  return (
    <section
      className={`mb-10 rounded-2xl overflow-hidden border transition-all duration-500 bg-white ${
        isActive
          ? 'border-brand-purple/25 shadow-[0_4px_24px_rgba(123,47,255,0.08)]'
          : 'border-black/[0.07] shadow-sm'
      }`}
    >
      {/* Hero strip */}
      <div
        className="relative min-h-[140px] sm:min-h-[160px]"
        style={{
          background: isActive
            ? 'linear-gradient(135deg, #7B2FFF 0%, #3b0784 100%)'
            : 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        <div className="relative z-10 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-body font-600 tracking-[0.25em] text-white/60 uppercase mb-2">
              Semester {semester.sem} · {semester.period}
            </p>
            <h2 className="font-display text-2xl sm:text-3xl italic font-400 text-white leading-tight">
              {semester.theme}
            </h2>
            <p className="font-body text-sm text-white/65 mt-2 max-w-2xl leading-relaxed">
              {semester.focus}
            </p>
          </div>
          <div className="flex flex-col items-start sm:items-end gap-2 shrink-0">
            {isActive && (
              <span className="text-[10px] font-body font-600 uppercase tracking-wider text-white/80 px-3 py-1 rounded-full border border-white/30 bg-white/10">
                Your focus now
              </span>
            )}
            <div className="flex items-center gap-3 w-full sm:w-40">
              <div className="flex-1 h-1.5 rounded-full bg-white/20 overflow-hidden">
                <div
                  className="h-full rounded-full bg-white transition-all duration-700"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-xs font-body text-white/60 tabular-nums w-8">{pct}%</span>
            </div>
            <div className="flex items-center gap-3">
              {isActive && (
                <button
                  type="button"
                  onClick={() => setEditingGoal(true)}
                  className="text-xs font-body text-white/50 hover:text-white transition-colors flex items-center gap-1"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit goal
                </button>
              )}
              <button
                type="button"
                onClick={() => setRefreshKey(k => k + 1)}
                className="text-xs font-body text-white/50 hover:text-white transition-colors flex items-center gap-1"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-8 pb-8 pt-6 space-y-10 bg-white">
        <SemesterCoachRail coach={coach} />

        {/* Goal editor */}
        {editingGoal && isActive && (
          <div className="rounded-xl border border-brand-purple/20 bg-brand-purple/[0.03] p-5 space-y-3">
            <p className="text-xs font-body font-600 tracking-[0.2em] text-brand-purple uppercase">Edit your focus goal</p>
            <textarea
              value={goalDraft}
              onChange={e => setGoalDraft(e.target.value)}
              rows={3}
              autoFocus
              className="w-full px-4 py-3 rounded-xl bg-mist border border-black/[0.08] text-sm font-body text-ink placeholder:text-ink-faint focus:outline-none focus:border-brand-purple/40 transition-all resize-none"
            />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={async () => {
                  await updateSemesterGoalAction(semester.sem, goalDraft)
                  setEditingGoal(false)
                }}
                className="px-4 py-2 rounded-xl btn-brand text-white text-xs font-body transition-all"
              >
                Save goal
              </button>
              <button
                type="button"
                onClick={() => { setGoalDraft(progress?.custom_goal ?? semester.focus); setEditingGoal(false) }}
                className="px-4 py-2 rounded-xl text-ink-mid text-xs font-body hover:text-ink transition-all border border-black/[0.08]"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Progress checklist */}
        {isActive && (
          <div className="rounded-xl border border-black/[0.07] bg-mist/50 p-5">
            <p className="text-xs font-body font-600 tracking-[0.2em] text-ink-mid uppercase mb-4">Your progress</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-black/[0.06]">
                <span className={`text-xl leading-none ${booksCompleted > 0 ? 'text-emerald-500' : 'text-black/20'}`}>
                  {booksCompleted === semester.books.length && booksCompleted > 0 ? '✓' : '○'}
                </span>
                <div>
                  <p className="text-xs font-body font-600 text-ink">Books read</p>
                  <p className="text-[10px] text-ink-faint">{booksCompleted} / {semester.books.length}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => markResourceCompleteAction(semester.sem, 'course', !progress?.course_completed)}
                className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${progress?.course_completed ? 'border-emerald-400/40 bg-emerald-50' : 'border-black/[0.06] bg-white hover:border-brand-purple/20'}`}
              >
                <span className={`text-xl leading-none ${progress?.course_completed ? 'text-emerald-500' : 'text-black/20'}`}>
                  {progress?.course_completed ? '✓' : '○'}
                </span>
                <p className="text-xs font-body font-600 text-ink">Course done</p>
              </button>
              <button
                type="button"
                onClick={() => markResourceCompleteAction(semester.sem, 'podcast', !progress?.podcast_scheduled)}
                className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${progress?.podcast_scheduled ? 'border-emerald-400/40 bg-emerald-50' : 'border-black/[0.06] bg-white hover:border-brand-purple/20'}`}
              >
                <span className={`text-xl leading-none ${progress?.podcast_scheduled ? 'text-emerald-500' : 'text-black/20'}`}>
                  {progress?.podcast_scheduled ? '✓' : '○'}
                </span>
                <p className="text-xs font-body font-600 text-ink">Podcast listened</p>
              </button>
              <button
                type="button"
                onClick={() => markResourceCompleteAction(semester.sem, 'coach_assignment', !progress?.coach_assignment_completed)}
                className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${progress?.coach_assignment_completed ? 'border-emerald-400/40 bg-emerald-50' : 'border-black/[0.06] bg-white hover:border-brand-purple/20'}`}
              >
                <span className={`text-xl leading-none ${progress?.coach_assignment_completed ? 'text-emerald-500' : 'text-black/20'}`}>
                  {progress?.coach_assignment_completed ? '✓' : '○'}
                </span>
                <p className="text-xs font-body font-600 text-ink">Coach task</p>
              </button>
            </div>
          </div>
        )}

        {/* Books */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-body font-600 tracking-[0.2em] text-ink-mid uppercase">Books</h3>
            <span className="text-[10px] text-ink-faint">{semester.books.length} titles</span>
          </div>
          <div className="flex gap-4 overflow-x-auto scroll-x pb-2 snap-x snap-mandatory -mx-1 px-1">
            {semester.books.map(book => (
              <div
                key={`${book.title}-${refreshKey}`}
                className="snap-start shrink-0 w-[132px] sm:w-[152px]"
              >
                <div className="relative aspect-[2/3] rounded-xl overflow-hidden border border-black/[0.08] bg-gradient-to-br from-slate-100 to-slate-200 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200">
                  {book.url ? (
                    <a href={book.url} target="_blank" rel="noopener noreferrer"
                      className="absolute inset-0 z-0" aria-label={`Open ${book.title}`} />
                  ) : null}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={openLibraryCoverUrl(book)}
                    alt=""
                    className="absolute inset-0 z-[1] w-full h-full object-cover pointer-events-none"
                    referrerPolicy="no-referrer"
                    onError={e => { e.currentTarget.style.visibility = 'hidden' }}
                  />
                  <div className="absolute top-2 left-2 z-20 pointer-events-auto">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded accent-[#7B2FFF] cursor-pointer"
                      checked={progress?.books_completed?.includes(book.title)}
                      onChange={e => {
                        e.stopPropagation()
                        markResourceCompleteAction(semester.sem, 'book', book.title)
                      }}
                    />
                  </div>
                  {book.start_here && (
                    <span className="absolute top-2 right-2 z-20 pointer-events-none text-[9px] font-body font-600 uppercase bg-amber-400 text-white px-1.5 py-0.5 rounded">
                      Start
                    </span>
                  )}
                  <div className="absolute inset-0 z-[2] bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />
                  <div className="absolute bottom-0 left-0 right-0 z-[3] p-3 pointer-events-none">
                    <p className="font-body text-xs font-600 text-white leading-snug line-clamp-3">{book.title}</p>
                    <p className="text-[10px] text-white/60 mt-1 line-clamp-1">{book.author}</p>
                  </div>
                </div>
                <p className="text-[10px] text-ink-faint mt-1.5 line-clamp-2 leading-snug px-0.5">{book.why}</p>
                <div className="mt-1.5 px-0.5">
                  <ThumbsFeedback
                    resourceType="book"
                    resourceTitle={book.title}
                    initialFeedback={feedback[`book::${book.title}`] ?? null}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Podcasts */}
        <div>
          <h3 className="text-xs font-body font-600 tracking-[0.2em] text-ink-mid uppercase mb-4">Podcasts</h3>
          <div className="flex gap-4 overflow-x-auto scroll-x pb-2 snap-x snap-mandatory -mx-1 px-1">
            {podcasts.map((pod, idx) => {
              const podCover = applePodcastCoverUrl(pod.url)
              const podHref = pod.url?.trim()
              return (
                <div
                  key={`${pod.title}-${refreshKey}-${idx}`}
                  className="snap-start shrink-0 w-[240px] sm:w-[280px]"
                >
                  <div className="relative aspect-video rounded-xl overflow-hidden border border-black/[0.08] bg-gradient-to-br from-violet-100 to-slate-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200">
                    {podHref ? (
                      <a href={podHref} target="_blank" rel="noopener noreferrer"
                        className="absolute inset-0 z-0" aria-label={`Open podcast: ${pod.title}`} />
                    ) : null}
                    {podCover ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={podCover}
                        alt=""
                        className="absolute inset-0 z-[1] w-full h-full object-cover pointer-events-none"
                        referrerPolicy="no-referrer"
                        onError={e => { e.currentTarget.style.visibility = 'hidden' }}
                      />
                    ) : null}
                    <div className="absolute top-2 left-2 z-20 pointer-events-auto">
                      {idx === 0 && (
                        <input
                          type="checkbox"
                          className="w-4 h-4 accent-[#7B2FFF] cursor-pointer"
                          checked={progress?.podcast_scheduled}
                          onChange={e => {
                            e.stopPropagation()
                            markResourceCompleteAction(semester.sem, 'podcast', !progress?.podcast_scheduled)
                          }}
                        />
                      )}
                    </div>
                    <div className="absolute inset-0 z-[2] flex items-center justify-center opacity-30 pointer-events-none">
                      <span className="text-4xl text-white">▶</span>
                    </div>
                    <div className="absolute inset-0 z-[3] bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />
                    <div className="absolute bottom-0 left-0 right-0 z-[4] p-4 pointer-events-none">
                      <p className="font-body text-sm font-600 text-white line-clamp-2">{pod.title}</p>
                      <p className="text-xs text-white/50 mt-1">with {pod.by}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                  <a
                    href={`https://calendar.google.com/calendar/r/eventedit?text=${encodeURIComponent('🎧 ' + ((pod as any).cal || pod.title))}&recur=RRULE:FREQ=WEEKLY`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] font-body text-brand-purple hover:underline"
                  >
                    + Add to calendar
                  </a>
                    <ThumbsFeedback
                      resourceType="podcast"
                      resourceTitle={pod.title}
                      initialFeedback={feedback[`podcast::${pod.title}`] ?? null}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Course */}
        <div>
          <h3 className="text-xs font-body font-600 tracking-[0.2em] text-ink-mid uppercase mb-4">Course</h3>
          <AnimatePresence mode="wait">
            {!showCourseAlts ? (
              <motion.div
                key={`course-${selectedCourseIdx}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex gap-4 overflow-x-auto scroll-x snap-x -mx-1 px-1"
              >
                <div className="snap-start shrink-0 w-[min(100%,320px)]">
                  <div className="relative aspect-video rounded-xl overflow-hidden border border-black/[0.08] bg-gradient-to-br from-brand-purple/10 to-slate-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200">
                    {activeCourse.url ? (
                      <a href={activeCourse.url} target="_blank" rel="noopener noreferrer"
                        className="absolute inset-0 z-0" aria-label={`Open course: ${activeCourse.title}`} />
                    ) : null}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={courseThumbUrl(activeCourse)}
                      alt=""
                      className="absolute inset-0 z-[1] w-full h-full object-cover object-center pointer-events-none"
                      referrerPolicy="no-referrer"
                      onError={e => { e.currentTarget.style.visibility = 'hidden' }}
                    />
                    <div className="absolute top-3 left-3 z-20 pointer-events-auto">
                      <input
                        type="checkbox"
                        className="w-4 h-4 accent-[#7B2FFF] cursor-pointer"
                        checked={progress?.course_completed}
                        onChange={e => {
                          e.stopPropagation()
                          markResourceCompleteAction(semester.sem, 'course', !progress?.course_completed)
                        }}
                      />
                    </div>
                    <div className="absolute inset-0 z-[2] bg-gradient-to-t from-black/85 to-transparent pointer-events-none" />
                    <div className="absolute bottom-0 left-0 right-0 z-[3] p-4 pointer-events-none">
                      <p className="font-body text-sm font-600 text-white">{activeCourse.title}</p>
                      <p className="text-xs text-white/50 mt-1">{activeCourse.platform}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    {allCourses.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setShowCourseAlts(true)}
                        className="text-xs font-body text-ink-mid hover:text-brand-purple transition-colors"
                      >
                        Not for me? Pick another →
                      </button>
                    )}
                    <ThumbsFeedback
                      resourceType="course"
                      resourceTitle={activeCourse.title}
                      initialFeedback={feedback[`course::${activeCourse.title}`] ?? null}
                    />
                  </div>
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
                        ? 'border-brand-purple/40 bg-brand-purple/[0.04]'
                        : 'border-black/[0.08] bg-white hover:border-brand-purple/20'
                    }`}
                  >
                    <p className="font-body text-sm font-600 text-ink">{c.title}</p>
                    <p className="text-xs text-ink-mid mt-1">{c.platform}</p>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setShowCourseAlts(false)}
                  className="text-xs text-ink-faint hover:text-ink-mid self-center px-4"
                >
                  Cancel
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Milestone */}
        <div className="rounded-xl border border-black/[0.07] bg-mist/50 p-5">
          <p className="text-[10px] font-body font-600 tracking-[0.2em] text-ink-faint uppercase mb-2">Milestone</p>
          <p className="font-body text-sm text-ink">{semester.milestone}</p>
        </div>

        {/* Coach assignment */}
        <div className="flex items-center justify-between p-4 rounded-xl border border-black/[0.07] bg-mist/50">
          <div>
            <p className="text-[10px] font-body font-600 tracking-[0.2em] text-ink-faint uppercase mb-1">Coach assignment</p>
            <p className="font-body text-xs text-ink-mid">Mark complete when you&apos;ve finished your coach&apos;s task</p>
          </div>
          <input
            type="checkbox"
            className="w-5 h-5 rounded accent-[#7B2FFF] cursor-pointer"
            checked={!!progress?.coach_assignment_completed}
            onChange={() => markResourceCompleteAction(semester.sem, 'coach_assignment', !progress?.coach_assignment_completed)}
          />
        </div>
      </div>
    </section>
  )
}
