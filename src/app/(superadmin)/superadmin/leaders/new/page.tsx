import GlobalLeaderForm from '@/features/superadmin/components/GlobalLeaderForm'
import { createGlobalLeaderAction, type GlobalLeaderPayload } from '@/features/superadmin/actions'

async function handleSave(data: GlobalLeaderPayload) {
  'use server'
  await createGlobalLeaderAction(data)
}

export default function NewGlobalLeaderPage() {
  return (
    <div className="p-8 max-w-2xl mx-auto">
      <a
        href="/superadmin/leaders"
        className="text-xs font-body text-white/40 hover:text-white/70 transition-colors flex items-center gap-1.5 mb-6"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to leaders
      </a>

      <h1 className="font-display text-3xl font-300 text-white mb-1">Add a global leader</h1>
      <p className="font-body text-sm text-white/40 mb-8">
        Visible to all users. Books, podcasts, and courses are managed in the{' '}
        <a href="/superadmin/library" className="text-accent/70 hover:text-accent underline">global library</a>.
      </p>

      <div className="bg-white rounded-2xl p-8">
        <GlobalLeaderForm onSave={handleSave} submitLabel="Add leader" />
      </div>
    </div>
  )
}
