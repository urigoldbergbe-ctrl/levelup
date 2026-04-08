import Link from 'next/link'

export interface SemesterCoachSummary {
  name: string
  photo_url: string | null
}

export default function SemesterCoachRail({ coach }: { coach: SemesterCoachSummary | null }) {
  return (
    <div className="mb-8">
      <h3 className="text-xs font-body font-600 tracking-[0.2em] text-white/35 uppercase mb-3">
        Your coach
      </h3>
      <Link
        href="/coaching"
        aria-label={
          coach
            ? `Coaching: ${coach.name}. Open sessions and booking.`
            : 'Coaching: no coach assigned yet. Open the Coaching tab.'
        }
        className="flex items-center gap-4 p-4 rounded-2xl border border-white/[0.08] bg-white/[0.03] hover:border-accent/25 hover:bg-white/[0.05] transition-all group"
      >
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-gradient-to-br from-accent/20 to-violet/20 shrink-0 border border-white/10">
          {coach?.photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={coach.photo_url}
              alt=""
              className="w-full h-full object-cover brightness-90 group-hover:brightness-100 transition-all"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center font-display text-lg text-white/35"
              aria-hidden="true"
            >
              {coach ? coach.name.charAt(0) : '?'}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          {coach ? (
            <>
              <p className="font-body text-sm font-600 text-white truncate">{coach.name}</p>
              <p className="text-xs font-body text-white/35 mt-0.5">Sessions &amp; goals on Coaching →</p>
            </>
          ) : (
            <p className="font-body text-sm text-white/45">Haven&apos;t been assigned yet.</p>
          )}
        </div>
        <span className="text-white/25 group-hover:text-accent text-lg transition-colors shrink-0" aria-hidden="true">
          →
        </span>
      </Link>
    </div>
  )
}
