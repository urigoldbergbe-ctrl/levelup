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
      <Link href="/superadmin/coaches" className="font-body text-xs text-white/40 hover:text-white/70 mb-6 inline-block">
        ← Back to coaches
      </Link>
      <h1 className="font-display text-2xl font-500 text-white mb-8">Edit {c.name}</h1>

      <form action={updateCoachAction.bind(null, c.id)} className="space-y-5">
        <div>
          <label className="block text-xs font-body text-white/40 uppercase tracking-wider mb-2">Name</label>
          <input
            name="name"
            required
            defaultValue={c.name}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-accent/40"
          />
        </div>
        <div>
          <label className="block text-xs font-body text-white/40 uppercase tracking-wider mb-2">Email</label>
          <input
            name="email"
            type="email"
            required
            defaultValue={c.email}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-accent/40"
          />
        </div>
        <div>
          <label className="block text-xs font-body text-white/40 uppercase tracking-wider mb-2">Phone</label>
          <input
            name="phone"
            defaultValue={c.phone ?? ''}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-accent/40"
          />
        </div>
        <div>
          <label className="block text-xs font-body text-white/40 uppercase tracking-wider mb-2">Short bio</label>
          <textarea
            name="bio"
            rows={4}
            defaultValue={c.bio ?? ''}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-accent/40 resize-y min-h-[100px]"
          />
        </div>
        <div>
          <label className="block text-xs font-body text-white/40 uppercase tracking-wider mb-2">Calendly URL</label>
          <input
            name="calendly_url"
            required
            defaultValue={c.calendly_url}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-accent/40"
          />
        </div>
        <div>
          <label className="block text-xs font-body text-white/40 uppercase tracking-wider mb-2">Photo URL</label>
          <input
            name="photo_url"
            defaultValue={c.photo_url ?? ''}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-accent/40"
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            name="active"
            defaultValue={c.active ? 'true' : 'false'}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
          >
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
        <button
          type="submit"
          className="w-full py-3 bg-accent text-white text-sm font-body font-600 rounded-xl hover:bg-accent-mid transition-colors"
        >
          Save changes
        </button>
      </form>
    </div>
  )
}
