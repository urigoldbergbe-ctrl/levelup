import Link from 'next/link'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'
import { isMissingTableError } from '@/lib/supabase/schema-errors'
import { ConfirmSubmitButton } from '@/components/ui/ConfirmSubmitButton'
import { deleteCoachAction } from '@/features/superadmin/coachActions'

export default async function CoachesPage() {
  const admin = getSupabaseAdminClient()
  const { data: coaches, error: coachesError } = await admin.from('coaches').select('*').order('name')
  const schemaMissing = isMissingTableError(coachesError)

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {schemaMissing && (
        <div className="mb-6 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 font-body text-sm text-amber-800">
          The <code className="text-xs bg-black/20 px-1.5 py-0.5 rounded">coaches</code> table was not found. Run{' '}
          <code className="text-xs bg-black/20 px-1.5 py-0.5 rounded">00012_coaching.sql</code> in the Supabase SQL
          editor, then reload.
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-500 text-ink mb-1">Coaches</h1>
          <p className="font-body text-sm text-ink-mid">
            Add coaches, link their Calendly, then assign them to users on the Users page.
          </p>
        </div>
        <Link
          href="/superadmin/coaches/new"
          className="px-4 py-2.5 btn-brand text-white text-sm font-body rounded-xl transition-colors"
        >
          + Add coach
        </Link>
      </div>

      <div className="glass-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-black/[0.07] bg-mckinsey-light">
              <th className="text-left font-body text-xs text-ink-faint px-5 py-3 uppercase tracking-wider">Coach</th>
              <th className="text-left font-body text-xs text-ink-faint px-5 py-3 uppercase tracking-wider">Email</th>
              <th className="text-left font-body text-xs text-ink-faint px-5 py-3 uppercase tracking-wider">Calendly</th>
              <th className="text-left font-body text-xs text-ink-faint px-5 py-3 uppercase tracking-wider">Status</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {(coaches ?? []).map(c => (
              <tr key={c.id} className="border-b border-black/[0.05] hover:bg-mckinsey-light transition-colors">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-black/[0.06] shrink-0">
                      {c.photo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={c.photo_url}
                          alt=""
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-ink-faint text-sm font-display">
                          {c.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <span className="font-body text-ink">{c.name}</span>
                  </div>
                </td>
                <td className="font-body text-ink-mid px-5 py-3">{c.email}</td>
                <td className="px-5 py-3 max-w-[200px] truncate">
                  <a
                    href={c.calendly_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-body text-xs text-mckinsey-blue hover:underline truncate block"
                  >
                    {c.calendly_url}
                  </a>
                </td>
                <td className="px-5 py-3">
                  {c.active ? (
                    <span className="text-xs text-emerald-700 font-body">Active</span>
                  ) : (
                    <span className="text-xs text-ink-faint font-body">Inactive</span>
                  )}
                </td>
                <td className="px-5 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/superadmin/coaches/${c.id}/edit`}
                      className="text-xs font-body text-ink-faint hover:text-mckinsey-blue transition-colors"
                    >
                      Edit
                    </Link>
                    <form action={deleteCoachAction.bind(null, c.id)}>
                      <ConfirmSubmitButton
                        confirmMessage={`Remove coach ${c.name}? Users will be unlinked if this is their only assignment path.`}
                        className="text-xs font-body text-red-400/80 hover:text-red-300 transition-colors px-2 py-1"
                      >
                        Delete
                      </ConfirmSubmitButton>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {(!coaches || coaches.length === 0) && (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center font-body text-sm text-ink-faint">
                  No coaches yet. Add one to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
