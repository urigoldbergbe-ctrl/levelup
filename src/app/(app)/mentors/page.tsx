import PageShell from '@/components/layout/PageShell'
import MentorGrid from '@/features/mentors/components/MentorGrid'
import { LEADERS } from '@/data/leaders'

export default function MentorsPage() {
  return (
    <PageShell>
      <div className="mb-10">
        <p className="text-xs font-body font-500 tracking-[0.20em] text-accent uppercase mb-2">
          Leader catalog
        </p>
        <h1 className="font-display text-display font-300 text-ink">
          Choose your leader
        </h1>
        <p className="font-body text-sm text-ink-mid mt-2 max-w-xl">
          Pick one real leader whose career path you want to follow. Your entire learning journey — books, skills, milestones — will be built around them.
        </p>
      </div>
      <MentorGrid leaders={LEADERS} />
    </PageShell>
  )
}
