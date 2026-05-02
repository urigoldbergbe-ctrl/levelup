'use client'

import { useState, useTransition } from 'react'
import { runAssessmentAction } from '../actions'

export default function ProfileUploader({ mentorId }: { mentorId: string | null }) {
  const [profileText, setProfileText] = useState('')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')

  if (!mentorId) {
    return (
      <div className="bg-amber/10 border border-amber/30 rounded-2xl p-6 text-center">
        <p className="font-body text-sm text-ink-mid mb-3">Choose a mentor first before running your assessment.</p>
        <a href="/onboarding" className="text-sm font-body text-accent hover:underline">
          Go to onboarding →
        </a>
      </div>
    )
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!profileText.trim()) { setError('Please paste your profile text'); return }
    setError('')
    const fd = new FormData()
    fd.append('profileText', profileText)
    startTransition(async () => {
      try {
        await runAssessmentAction(fd)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong')
      }
    })
  }

  return (
    <div className="max-w-2xl">
      <div className="bg-white rounded-2xl border border-ink/5 shadow-sm p-8">
        <h2 className="font-body font-600 text-ink text-lg mb-2">Upload your profile</h2>
        <p className="font-body text-sm text-ink-mid mb-6">
          Paste your LinkedIn About section and experience, or the text from your CV. Claude will analyse the gap between where you are and where your chosen mentor started.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            value={profileText}
            onChange={e => setProfileText(e.target.value)}
            rows={12}
            className="w-full px-4 py-3 rounded-xl border border-ink/15 text-sm font-body text-ink placeholder:text-ink-faint focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-colors resize-none"
            placeholder="Paste your LinkedIn profile text or CV content here…"
          />
          {error && (
            <p className="text-xs font-body text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}
          <button
            type="submit"
            disabled={isPending || !profileText.trim()}
            className="w-full py-3 bg-accent text-white text-sm font-body font-500 rounded-xl hover:bg-accent-mid transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-accent"
          >
            {isPending ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Analysing your profile…
              </span>
            ) : (
              'Analyse my profile →'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
