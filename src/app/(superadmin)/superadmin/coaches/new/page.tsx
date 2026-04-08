import Link from 'next/link'
import { createCoachAction } from '@/features/superadmin/coachActions'

export default function NewCoachPage() {
  return (
    <div className="p-8 max-w-xl mx-auto">
      <Link href="/superadmin/coaches" className="font-body text-xs text-white/40 hover:text-white/70 mb-6 inline-block">
        ← Back to coaches
      </Link>
      <h1 className="font-display text-2xl font-500 text-white mb-2">Add coach</h1>
      <p className="font-body text-sm text-white/40 mb-8">
        Photo URL is used as the thumbnail on Journey and Coaching. Calendly link should be the scheduling page members
        will book.
      </p>

      <form action={createCoachAction} className="space-y-5">
        <div>
          <label className="block text-xs font-body text-white/40 uppercase tracking-wider mb-2">Name</label>
          <input
            name="name"
            required
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-accent/40"
            placeholder="Jane Coach"
          />
        </div>
        <div>
          <label className="block text-xs font-body text-white/40 uppercase tracking-wider mb-2">Email</label>
          <input
            name="email"
            type="email"
            required
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-accent/40"
            placeholder="jane@example.com"
          />
        </div>
        <div>
          <label className="block text-xs font-body text-white/40 uppercase tracking-wider mb-2">Phone</label>
          <input
            name="phone"
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-accent/40"
            placeholder="+44 …"
          />
        </div>
        <div>
          <label className="block text-xs font-body text-white/40 uppercase tracking-wider mb-2">Short bio</label>
          <textarea
            name="bio"
            rows={4}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-accent/40 resize-y min-h-[100px]"
            placeholder="Shown on the Coaching tab…"
          />
        </div>
        <div>
          <label className="block text-xs font-body text-white/40 uppercase tracking-wider mb-2">Calendly URL</label>
          <input
            name="calendly_url"
            required
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-accent/40"
            placeholder="https://calendly.com/your-handle/session"
          />
        </div>
        <div>
          <label className="block text-xs font-body text-white/40 uppercase tracking-wider mb-2">Photo URL</label>
          <input
            name="photo_url"
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-accent/40"
            placeholder="https://…"
          />
        </div>
        <div>
          <label className="block text-xs font-body text-white/40 uppercase tracking-wider mb-2">Status</label>
          <select
            name="active"
            defaultValue="true"
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
          >
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
          <p className="text-xs text-white/30 mt-1">Inactive coaches are hidden from members.</p>
        </div>
        <button
          type="submit"
          className="w-full py-3 bg-accent text-white text-sm font-body font-600 rounded-xl hover:bg-accent-mid transition-colors"
        >
          Create coach
        </button>
      </form>
    </div>
  )
}
