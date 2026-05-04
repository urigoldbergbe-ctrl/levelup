'use client'

import { useTransition } from 'react'
import { resetAssessmentForReuploadAction } from '@/features/assessment/actions'

export default function AssessmentReuploadButton() {
  const [pending, startTransition] = useTransition()

  function onClick() {
    if (
      !confirm(
        'Replace your CV? Your current assessment will be removed so you can upload or paste a new profile and run the analysis again.',
      )
    ) {
      return
    }
    startTransition(() => {
      void resetAssessmentForReuploadAction()
    })
  }

  return (
    <button
      type="button"
      disabled={pending}
      onClick={onClick}
      className="shrink-0 inline-flex items-center gap-2 border border-black/[0.12] bg-white px-4 py-2.5 text-xs font-body font-500 text-ink-mid transition-colors hover:border-mckinsey-blue/30 hover:bg-mckinsey-light hover:text-mckinsey-blue disabled:opacity-50 disabled:pointer-events-none"
      style={{ borderRadius: '2px' }}
    >
      {pending ? (
        <>
          <span className="h-3.5 w-3.5 border-2 border-ink-faint border-t-mckinsey-blue rounded-full animate-spin" aria-hidden />
          <span>Opening…</span>
        </>
      ) : (
        <>
          <svg className="h-4 w-4 text-mckinsey-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
            />
          </svg>
          <span>Replace CV</span>
        </>
      )}
    </button>
  )
}
