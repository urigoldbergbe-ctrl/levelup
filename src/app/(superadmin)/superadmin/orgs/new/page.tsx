import { createOrgAction } from '@/features/superadmin/actions'

export default function NewOrgPage() {
  return (
    <div className="p-8 max-w-xl mx-auto">
      <h1 className="font-display text-2xl font-500 text-white mb-1">New organization</h1>
      <p className="font-body text-sm text-white/40 mb-8">Create a new organization on the platform.</p>

      <form action={createOrgAction} className="space-y-5">
        <div>
          <label className="block font-body text-xs text-white/40 uppercase tracking-wider mb-1.5">
            Organization name
          </label>
          <input
            name="name"
            required
            placeholder="Acme Corp"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-violet-500/50"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-sm font-body rounded-xl transition-colors"
          >
            Create organization
          </button>
          <a
            href="/superadmin/orgs"
            className="px-5 py-2.5 text-white/40 hover:text-white/70 text-sm font-body transition-colors"
          >
            Cancel
          </a>
        </div>
      </form>
    </div>
  )
}
