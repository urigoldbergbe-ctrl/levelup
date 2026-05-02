'use client'

import { useState, useTransition } from 'react'
import { updateEmployeeProgressAction } from '../actions/employeeProgress'

interface ProgressRow {
  id: string
  semester: number
  books_completed: string[]
  course_completed: boolean
  podcast_scheduled: boolean
  milestone_achieved: boolean
  coach_assignment_completed?: boolean
  custom_goal?: string | null
}

interface Props {
  targetUserId: string
  progressRows: ProgressRow[]
  lastSessionTasks: string[]
}

export default function EmployeeProgressEditor({ targetUserId, progressRows, lastSessionTasks }: Props) {
  const [rows, setRows] = useState<ProgressRow[]>(progressRows)
  const [editingGoal, setEditingGoal] = useState<number | null>(null)
  const [goalDraft, setGoalDraft] = useState('')
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)

  function getRow(sem: number) {
    return rows.find(r => r.semester === sem)
  }

  function toggleBool(sem: number, field: 'course_completed' | 'podcast_scheduled' | 'milestone_achieved' | 'coach_assignment_completed') {
    setRows(prev => prev.map(r =>
      r.semester === sem ? { ...r, [field]: !r[field] } : r
    ))
  }

  function saveAll() {
    startTransition(async () => {
      await updateEmployeeProgressAction(targetUserId, rows)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    })
  }

  function saveGoal(sem: number) {
    setRows(prev => prev.map(r => r.semester === sem ? { ...r, custom_goal: goalDraft } : r))
    setEditingGoal(null)
  }

  const semesters = Array.from(new Set([...rows.map(r => r.semester), ...(rows.length === 0 ? [1] : [])])).sort()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-body font-600 text-white/60 uppercase tracking-wide">Journey progress</h2>
        <button
          onClick={saveAll}
          disabled={isPending}
          className="text-xs px-4 py-2 rounded-lg bg-accent text-white font-body hover:bg-accent/80 transition-all disabled:opacity-50"
        >
          {isPending ? 'Saving…' : saved ? '✓ Saved' : 'Save changes'}
        </button>
      </div>

      {semesters.length === 0 && (
        <p className="text-sm text-white/30">No journey data yet.</p>
      )}

      {semesters.map(sem => {
        const row = getRow(sem)
        if (!row) return null
        return (
          <div key={sem} className="p-5 rounded-2xl bg-white/[0.04] border border-white/[0.07] space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-body font-600 text-white">Semester {sem}</span>
              {row.custom_goal && (
                <span className="text-xs text-white/40 italic truncate max-w-[60%]">{row.custom_goal}</span>
              )}
              <button
                onClick={() => { setEditingGoal(sem); setGoalDraft(row.custom_goal ?? '') }}
                className="text-xs text-accent/70 hover:text-accent transition-colors ml-2"
              >
                {row.custom_goal ? 'Edit goal' : '+ Set goal'}
              </button>
            </div>

            {editingGoal === sem && (
              <div className="flex gap-2">
                <textarea
                  value={goalDraft}
                  onChange={e => setGoalDraft(e.target.value)}
                  rows={2}
                  className="flex-1 px-3 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-accent/50 resize-none"
                  placeholder="Custom goal for this employee…"
                />
                <div className="flex flex-col gap-1">
                  <button onClick={() => saveGoal(sem)} className="text-xs px-3 py-1.5 rounded-lg bg-accent/20 text-accent hover:bg-accent/30 transition-all">Save</button>
                  <button onClick={() => setEditingGoal(null)} className="text-xs px-3 py-1.5 rounded-lg bg-white/5 text-white/40 hover:text-white/60 transition-all">Cancel</button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { key: 'course_completed' as const, label: 'Course' },
                { key: 'podcast_scheduled' as const, label: 'Podcast' },
                { key: 'milestone_achieved' as const, label: 'Milestone' },
                { key: 'coach_assignment_completed' as const, label: 'Coach task' },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => toggleBool(sem, key)}
                  className={`flex items-center gap-2 p-3 rounded-xl border text-left transition-all ${
                    row[key]
                      ? 'border-emerald/40 bg-emerald/[0.08] text-emerald'
                      : 'border-white/[0.07] bg-white/[0.02] text-white/40 hover:border-white/15'
                  }`}
                >
                  <span className="text-base leading-none">{row[key] ? '✓' : '○'}</span>
                  <span className="text-xs font-body">{label}</span>
                </button>
              ))}
            </div>

            <div>
              <p className="text-xs text-white/35 mb-1.5">Books read: {(row.books_completed ?? []).length}</p>
            </div>
          </div>
        )
      })}

      {lastSessionTasks.length > 0 && (
        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.05] space-y-2">
          <h3 className="text-xs font-body font-600 text-white/40 uppercase tracking-wide">Last coaching session tasks</h3>
          {lastSessionTasks.map((t, i) => (
            <p key={i} className="text-sm text-white/60">{i + 1}. {t}</p>
          ))}
        </div>
      )}
    </div>
  )
}