'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createOrgAction } from '@/features/superadmin/actions'

export default function NewOrgPage() {
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      try {
        await createOrgAction(formData)
        router.push('/superadmin/orgs')
        router.refresh()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create organization. Please try again.')
      }
    })
  }

  return (
    <div className="p-8 max-w-xl mx-auto">
      <h1 className="font-display text-2xl font-500 text-ink mb-1">New organization</h1>
      <p className="font-body text-sm text-ink-mid mb-8">Create a new organization on the platform.</p>

      <form onSubmit={handleSubmit} className="space-y-5 glass-card p-6">
        <div>
          <label className="block font-body text-xs text-ink-faint uppercase tracking-wider mb-1.5">
            Organization name
          </label>
          <input
            name="name"
            required
            placeholder="Acme Corp"
            className="w-full bg-white border border-black/[0.1] rounded-xl px-4 py-3 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-mckinsey-blue/50"
          />
        </div>

        {error && (
          <p className="text-xs font-body text-red-400 bg-red-400/10 rounded-xl px-4 py-3">{error}</p>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={isPending}
            className="px-5 py-2.5 btn-brand disabled:opacity-50 text-white text-sm font-body rounded-xl transition-colors"
          >
            {isPending ? 'Creating…' : 'Create organization'}
          </button>
          <a
            href="/superadmin/orgs"
            className="px-5 py-2.5 text-ink-faint hover:text-mckinsey-blue text-sm font-body transition-colors"
          >
            Cancel
          </a>
        </div>
      </form>
    </div>
  )
}
