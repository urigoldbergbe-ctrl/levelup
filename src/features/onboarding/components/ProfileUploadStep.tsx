'use client'

import { useState, useTransition, useRef, useCallback } from 'react'
import { runAssessmentAction } from '@/features/assessment/actions'

type Tab = 'cv' | 'paste'

export default function ProfileUploadStep({ mentorName }: { mentorName: string }) {
  const [tab, setTab] = useState<Tab>('cv')

  // CV state
  const [file, setFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  // Paste state
  const [pasteText, setPasteText] = useState('')

  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')

  // ── File helpers ──────────────────────────────────────────────
  function acceptFile(f: File) {
    if (!f.name.endsWith('.pdf') && f.type !== 'application/pdf') {
      setError('Please upload a PDF file.')
      return
    }
    if (f.size > 10 * 1024 * 1024) {
      setError('File must be under 10 MB.')
      return
    }
    setFile(f)
    setError('')
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (f) acceptFile(f)
  }

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragging(true)
  }, [])

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragging(false)
  }, [])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragging(false)
    const f = e.dataTransfer.files?.[0]
    if (f) acceptFile(f)
  }, [])

  // ── Submit ────────────────────────────────────────────────────
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const fd = new FormData()

    if (tab === 'cv') {
      if (!file) { setError('Please select or drop a PDF file.'); return }
      fd.append('profilePdf', file)
    } else {
      if (!pasteText.trim()) {
        setError('Please paste your profile text.')
        return
      }
      if (pasteText.trim().split(/\s+/).length < 30) {
        setError('Please paste more of your profile — at least a few sentences of experience for an accurate analysis.')
        return
      }
      fd.append('profileText', pasteText.trim())
    }

    startTransition(async () => {
      try {
        await runAssessmentAction(fd)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      }
    })
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-6">
        <h2 className="font-body font-600 text-ink text-lg">Share your professional profile</h2>
        <p className="font-body text-sm text-ink-mid mt-1">
          Claude will map the gap between where you are today and where{' '}
          <span className="font-500 text-ink">{mentorName}</span> started their career.
        </p>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 bg-mist rounded-xl p-1 mb-6 w-fit">
        {([
          { id: 'cv',    label: '📄 Upload CV (PDF)' },
          { id: 'paste', label: '📋 Paste profile' },
        ] as { id: Tab; label: string }[]).map(t => (
          <button
            key={t.id}
            type="button"
            onClick={() => { setTab(t.id as Tab); setError('') }}
            className={`px-5 py-2 rounded-lg text-sm font-body font-500 transition-colors ${
              tab === t.id ? 'bg-white text-ink shadow-sm' : 'text-ink-mid hover:text-ink'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* ── CV Tab ─────────────────────────────────── */}
        {tab === 'cv' && (
          <div
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => fileRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all select-none ${
              dragging
                ? 'border-accent bg-accent/5 scale-[1.01]'
                : file
                ? 'border-emerald/40 bg-emerald/4'
                : 'border-ink/15 hover:border-accent/40 hover:bg-accent/2'
            }`}
          >
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,application/pdf"
              className="sr-only"
              onChange={onFileChange}
            />

            {file ? (
              <>
                <div className="w-12 h-12 bg-emerald/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-emerald" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="font-body font-600 text-ink text-sm">{file.name}</p>
                <p className="font-body text-xs text-ink-mid mt-1">
                  {(file.size / 1024 / 1024).toFixed(1)} MB · click to replace
                </p>
              </>
            ) : (
              <>
                <div className="w-12 h-12 bg-mist rounded-xl flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-ink-faint" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                </div>
                <p className="font-body font-500 text-ink text-sm">
                  {dragging ? 'Drop your CV here' : 'Drag & drop your CV or click to browse'}
                </p>
                <p className="font-body text-xs text-ink-mid mt-1">PDF only · max 10 MB</p>
              </>
            )}
          </div>
        )}

        {/* ── Paste Tab ───────────────────────────────── */}
        {tab === 'paste' && (
          <div>
            <textarea
              value={pasteText}
              onChange={e => setPasteText(e.target.value)}
              rows={10}
              className="w-full px-4 py-3 rounded-xl border border-ink/15 text-sm font-body text-ink placeholder:text-ink-faint focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-colors resize-none"
              placeholder="Paste your CV text, LinkedIn About section, or a summary of your experience and roles…"
            />
            <p className="text-xs font-body text-ink-faint mt-2">
              On LinkedIn: open your profile → <strong>More</strong> → <strong>Save to PDF</strong>, then copy-paste the text here.
            </p>
          </div>
        )}

        {error && (
          <p className="text-xs font-body text-red-500 bg-red-50 rounded-xl px-4 py-3">{error}</p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full py-3.5 bg-accent text-white text-sm font-body font-500 rounded-xl hover:bg-accent-mid transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-accent"
        >
          {isPending ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Analysing your profile… (~30 seconds)
            </span>
          ) : (
            'Analyse my profile →'
          )}
        </button>
      </form>
    </div>
  )
}
