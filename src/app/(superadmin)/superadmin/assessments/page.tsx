import { getSupabaseAdminClient } from '@/lib/supabase/admin'

export default async function SuperAdminAssessmentsPage() {
  const admin = getSupabaseAdminClient()

  const { data: assessments } = await admin
    .from('assessments')
    .select('id, headline, mentor_id, overall_score, created_at, user_id')
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="font-display text-2xl font-500 text-white mb-1">Assessments</h1>
      <p className="font-body text-sm text-white/40 mb-8">Last {assessments?.length ?? 0} assessments run on the platform.</p>

      <div className="border border-white/8 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/8 bg-white/2">
              <th className="text-left font-body text-xs text-white/40 px-5 py-3 font-400 uppercase tracking-wider">Headline</th>
              <th className="text-left font-body text-xs text-white/40 px-5 py-3 font-400 uppercase tracking-wider">Leader</th>
              <th className="text-left font-body text-xs text-white/40 px-5 py-3 font-400 uppercase tracking-wider">Score</th>
              <th className="text-left font-body text-xs text-white/40 px-5 py-3 font-400 uppercase tracking-wider">Date</th>
            </tr>
          </thead>
          <tbody>
            {(assessments ?? []).map(a => (
              <tr key={a.id} className="border-b border-white/4 hover:bg-white/2 transition-colors">
                <td className="font-body text-white/70 px-5 py-3 max-w-xs line-clamp-1">{a.headline ?? '—'}</td>
                <td className="font-body text-white/50 px-5 py-3 capitalize">{a.mentor_id ?? '—'}</td>
                <td className="px-5 py-3">
                  {a.overall_score != null ? (
                    <span className="inline-block px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 text-xs font-body">
                      {a.overall_score}%
                    </span>
                  ) : '—'}
                </td>
                <td className="font-body text-white/40 px-5 py-3 text-xs">
                  {new Date(a.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {(!assessments || assessments.length === 0) && (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center font-body text-sm text-white/30">
                  No assessments run yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
