'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updateOrganizationNameAction } from '../actions'

export default function OrgNameForm({ orgId, initialName }: { orgId: string; initialName: string }) {
  const router = useRouter()
  const [name, setName] = useState(initialName)
  const [error, setError] = useState('')
  const [ok, setOk] = useState(false)
  const [isPending, startTransition] = useTransition()

  function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setOk(false)
    startTransition(async () => {
      try {
        await updateOrganizationNameAction(orgId, name)
        setOk(true)
        router.refresh()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not update name.')
      }
    })
  }

  return (
    <form onSubmit={submit} className="flex flex-wrap items-end gap-3">
      <div className="min-w-[200px] flex-1">
        <label htmlFor="org-name" className="block font-body text-xs text-ink-faint uppercase tracking-wider mb-1.5">
          Organisation name
        </label>
        <input
          id="org-name"
          type="text"
          value={name}
          onChange={e => { setName(e.target.value); setOk(false) }}
          className="w-full bg-white border border-black/[0.1] rounded-lg px-3 py-2 text-sm text-ink focus:outline-none focus:border-mckinsey-blue/50"
        />
      </div>
      <button
        type="submit"
        disabled={isPending || !name.trim() || name.trim() === initialName}
        className="px-4 py-2 btn-brand disabled:opacity-50 text-white text-sm font-body rounded-lg transition-colors shrink-0"
      >
        {isPending ? 'Saving…' : 'Save name'}
      </button>
      {error && <p className="w-full text-xs font-body text-red-600">{error}</p>}
      {ok && <p className="w-full text-xs font-body text-emerald-700">Organisation name updated.</p>}
    </form>
  )
}
