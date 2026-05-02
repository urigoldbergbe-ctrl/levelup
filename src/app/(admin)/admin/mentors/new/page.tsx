import LeaderForm from '@/features/admin/components/LeaderForm'

export default function NewLeaderPage() {
  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <a href="/admin/mentors" className="text-xs font-body text-ink-mid hover:text-ink transition-colors flex items-center gap-1.5 mb-4">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to mentors
        </a>
        <h1 className="font-display text-4xl font-300 text-ink">Add a mentor</h1>
        <p className="font-body text-sm text-ink-mid mt-1">
          Fill in the details below. Once saved, the AI will automatically generate a 7-semester curriculum
          based on their books, skills, and areas of focus.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-ink/5 shadow-sm p-8">
        <LeaderForm />
      </div>
    </div>
  )
}
