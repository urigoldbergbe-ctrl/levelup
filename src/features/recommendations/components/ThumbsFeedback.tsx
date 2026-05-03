'use client'

import { useState, useTransition } from 'react'
import { saveRecommendationFeedbackAction, type FeedbackValue } from '../actions'

interface Props {
  resourceType: 'book' | 'podcast' | 'course'
  resourceTitle: string
  initialFeedback?: FeedbackValue | null
}

export default function ThumbsFeedback({ resourceType, resourceTitle, initialFeedback = null }: Props) {
  const [vote, setVote] = useState<FeedbackValue | null>(initialFeedback)
  const [isPending, startTransition] = useTransition()

  function handleVote(value: FeedbackValue) {
    const next = vote === value ? null : value
    setVote(next)
    startTransition(() =>
      saveRecommendationFeedbackAction(resourceType, resourceTitle, value)
    )
  }

  return (
    <div className="flex items-center gap-1" title="Was this recommendation useful?">
      <button
        type="button"
        disabled={isPending}
        onClick={() => handleVote('up')}
        className={`flex items-center justify-center w-7 h-7 rounded-full border transition-all duration-150 text-sm ${
          vote === 'up'
            ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm'
            : 'border-black/[0.12] text-ink-faint hover:border-emerald-400 hover:text-emerald-600 hover:bg-emerald-50'
        } disabled:opacity-50`}
        aria-label="Helpful"
      >
        👍
      </button>
      <button
        type="button"
        disabled={isPending}
        onClick={() => handleVote('down')}
        className={`flex items-center justify-center w-7 h-7 rounded-full border transition-all duration-150 text-sm ${
          vote === 'down'
            ? 'bg-red-400 border-red-400 text-white shadow-sm'
            : 'border-black/[0.12] text-ink-faint hover:border-red-400 hover:text-red-500 hover:bg-red-50'
        } disabled:opacity-50`}
        aria-label="Not helpful"
      >
        👎
      </button>
    </div>
  )
}
