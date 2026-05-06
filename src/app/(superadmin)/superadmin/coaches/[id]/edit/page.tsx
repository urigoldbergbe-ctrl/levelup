import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'
import { updateCoachAction } from '@/features/superadmin/coachActions'

export default async function EditCoachPage({ params }: { params: { id: string } }) {
  const admin = getSupabaseAdminClient()
  const { data: c } = await admin.from('coaches').select('*').eq('id', params.id).maybeSingle()
  if (!c) notFound()

  return (
    <div className="p-8 max-w-xl mx-auto">
      <Link href="/superadmin/coaches" className="font-body text-xs text-ink-faint hover:text-mckinsey-blue mb-6 inline-block">
        ← Back to coaches
      </Link>
      <h1 className="font-display text-2xl font-500 text-ink mb-8">Edit {c.name}</h1>

      <form action={updateCoachAction.bind(null, c.id)} className="space-y-5 glass-card p-6">
        <div>
          <label className="block text-xs font-body text-ink-faint uppercase tracking-wider mb-2">Name</label>
          <input
            name="name"
            required
            defaultValue={c.name}
            className="w-full px-4 py-3 rounded-xl bg-white border border-black/[0.1] text-sm text-ink focus:outline-none focus:border-mckinsey-blue/40"
          />
        </div>
        <div>
          <label className="block text-xs font-body text-ink-faint uppercase tracking-wider mb-2">Email</label>
          <input
            name="email"
            type="email"
            required
            defaultValue={c.email}
            className="w-full px-4 py-3 rounded-xl bg-white border border-black/[0.1] text-sm text-ink focus:outline-none focus:border-mckinsey-blue/40"
          />
        </div>
        <div>
          <label className="block text-xs font-body text-ink-faint uppercase tracking-wider mb-2">Phone</label>
          <input
            name="phone"
            defaultValue={c.phone ?? ''}
            className="w-full px-4 py-3 rounded-xl bg-white border border-black/[0.1] text-sm text-ink focus:outline-none focus:border-mckinsey-blue/40"
          />
        </div>
        <div>
          <label className="block text-xs font-body text-ink-faint uppercase tracking-wider mb-2">Short bio</label>
          <textarea
            name="bio"
            rows={4}
            defaultValue={c.bio ?? ''}
            className="w-full px-4 py-3 rounded-xl bg-white border border-black/[0.1] text-sm text-ink focus:outline-none focus:border-mckinsey-blue/40 resize-y min-h-[100px]"
          />
        </div>
        <div>
          <label className="block text-xs font-body text-ink-faint uppercase tracking-wider mb-2">Calendly URL</label>
          <input
            name="calendly_url"
            required
            defaultValue={c.calendly_url}
            className="w-full px-4 py-3 rounded-xl bg-white border border-black/[0.1] text-sm text-ink focus:outline-none focus:border-mckinsey-blue/40"
          />
        </div>
        <div>
          <label className="block text-xs font-body text-ink-faint uppercase tracking-wider mb-2">Photo URL</label>
          <input
            name="photo_url"
            defaultValue={c.photo_url ?? ''}
            className="w-full px-4 py-3 rounded-xl bg-white border border-black/[0.1] text-sm text-ink focus:outline-none focus:border-mckinsey-blue/40"
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            name="active"
            defaultValue={c.active ? 'true' : 'false'}
            className="bg-white border border-black/[0.1] rounded-lg px-3 py-2 text-sm text-ink"
          >
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
        <button
          type="submit"
          className="w-full py-3 btn-brand text-white text-sm font-body font-600 rounded-xl transition-colors"
        >
          Save changes
        </button>
      </form>
    </div>
  )
}
