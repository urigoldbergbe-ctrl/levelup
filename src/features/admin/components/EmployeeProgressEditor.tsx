'use client'

import { useState, useTransition } from 'react'
import { updateEmployeeProgressAction } from '../actions/managerAssignments'

interface ProgressRow {
  semester: number
  course_completed: boolean
  podcast_scheduled: boolean
  milestone_achieved: boolean
  coach_assignment_completed?: boolean
  custom_goal?: string | null
}

interface Props {
  employeeId: string
  progressRows: ProgressRow[]
}

const SEMESTERS = [1, 2, 3, 4, 5, 6, 7]

export default function EmployeeProgressEditor({ employeeId, progressRows }: Props) {
  const progMap = Object.fromEntries(progressRows.map(r => [r.semester, r]))
  const [edits, setEdits] = useState<Record<number, Partial<ProgressRow>>>({})
  const [savingFor, setSavingFor] = useState<number | null>(null)
  const [savedFor, setSavedFor] = useState<number[]>([])
  const [isPending, startTransition] = useTransition()

  function get(sem: number, key: keyof ProgressRow) {
    return edits[sem]?.[key] ?? progMap[sem]?.[key] ?? (key === 'custom_goal' ? '' : false)
  }

  function set(sem: number, key: keyof ProgressRow, value: boolean | string) {
    setEdits(prev => ({ ...prev, [sem]: { ...prev[sem], [key]: value } }))
  }

  function save(sem: number) {
    setSavingFor(sem)
    startTransition(async () => {
      await updateEmployeeProgressAction(employeeId, sem, {
        course_completed: get(sem, 'course_completed') as boolean,
        podcast_scheduled: get(sem, 'podcast_scheduled') as boolean,
        milestone_achieved: get(sem, 'milestone_achieved') as boolean,
        coach_assignment_completed: get(sem, 'coach_assignment_completed') as boolean,
        custom_goal: (get(sem, 'custom_goal') as string) || undefined,
      })
      setSavingFor(null)
      setSavedFor(prev => [...prev, sem])
      setTimeout(() => setSavedFor(prev => prev.filter(s => s !== sem)), 3000)
    })
  }

  return (
    <div className="space-y-3">
      <p className="text-xs font-body font-600 uppercase tracking-widest text-ink-mid mb-3">Edit progress by semester</p>
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {SEMESTERS.map(sem => (
          <div key={sem} className="bg-mist/50 border border-black/[0.07] rounded-sm p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="font-body text-xs font-700 uppercase tracking-wider text-ink">Semester {sem}</p>
              {savedFor.includes(sem) && (
                <span className="text-[10px] font-body text-emerald-600">✓ Saved</span>
              )}
            </div>

            {/* Custom goal */}
            <div>
              <label className="text-[10px] font-body font-600 uppercase text-ink-faint tracking-wide">Goal note</label>
              <input
                value={(get(sem, 'custom_goal') as string) ?? ''}
                onChange={e => set(sem, 'custom_goal', e.target.value)}
                placeholder="Optional focus note…"
                className="mt-1 w-full text-xs font-body text-ink px-2.5 py-1.5 border border-black/[0.07] bg-white rounded focus:outline-none focus:border-mckinsey-blue/40"
              />
            </div>

            {/* Checkboxes */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: 'course_completed' as const,          label: 'Course' },
                { key: 'podcast_scheduled' as const,         label: 'Podcast' },
                { key: 'milestone_achieved' as const,        label: 'Milestone' },
                { key: 'coach_assignment_completed' as const, label: 'Coach task' },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-3.5 h-3.5 accent-[#002F6C]"
                    checked={get(sem, key) as boolean}
                    onChange={e => set(sem, key, e.target.checked)}
                  />
                  <span className="text-xs font-body text-ink-mid">{label}</span>
                </label>
              ))}
            </div>

            <button
              onClick={() => save(sem)}
              disabled={isPending && savingFor === sem}
              className="w-full py-1.5 text-xs font-body font-600 btn-brand text-white rounded disabled:opacity-60"
            >
              {isPending && savingFor === sem ? 'Saving…' : 'Save & update journey'}
            </button>
          </div>
        ))}
      </div>
      <p className="text-[10px] font-body text-ink-faint mt-2">
        Saving triggers an AI journey update for this employee — they will see updated recommendations on their next visit.
      </p>
    </div>
  )
}
