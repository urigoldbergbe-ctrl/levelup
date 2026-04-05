import LeaderForm from '@/features/admin/components/LeaderForm'
import { createGlobalLeaderAction, suggestGlobalLeaderSkillsAction } from '@/features/superadmin/actions'
import type { LeaderFormData } from '@/features/admin/actions'

async function handleSave(data: LeaderFormData) {
  'use server'
  await createGlobalLeaderAction({
    name: data.name,
    title: data.title,
    company: data.company,
    category: data.category,
    quote: data.quote,
    photoUrl: data.photoUrl,
    spotifyUrl: data.spotifyUrl,
    skills: data.skills,
    skillScores: data.skillScores,
    cvText: data.cvText,
    books: data.books,
    newsAlerts: data.newsAlerts,
  })
}

export default function NewGlobalLeaderPage() {
  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <a href="/superadmin/leaders" className="text-xs font-body text-white/40 hover:text-white/70 transition-colors flex items-center gap-1.5 mb-4">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to leaders
        </a>
        <h1 className="font-display text-3xl font-300 text-white">Add a global leader</h1>
        <p className="font-body text-sm text-white/40 mt-1">
          Visible to all users on the platform. Paste a Wikipedia bio or CV to auto-populate skill ratings.
        </p>
      </div>

      <div className="bg-white rounded-2xl p-8">
        <LeaderForm
          isGlobal
          onSave={handleSave}
          onSuggestSkills={suggestGlobalLeaderSkillsAction}
        />
      </div>
    </div>
  )
}
