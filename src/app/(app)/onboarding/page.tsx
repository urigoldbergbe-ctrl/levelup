import PageShell from '@/components/layout/PageShell'
import OnboardingFlow from '@/features/onboarding/components/OnboardingFlow'

export default function OnboardingPage() {
  return (
    <PageShell className="max-w-3xl">
      <div className="mb-10 text-center">
        <p className="text-xs font-body font-500 tracking-[0.20em] text-accent uppercase mb-2">
          Getting started
        </p>
        <h1 className="font-display text-display font-300 text-ink">
          Set up your journey
        </h1>
        <p className="font-body text-sm text-ink-mid mt-2">
          Two steps. Five minutes. A personalised 5-year career map.
        </p>
      </div>
      <OnboardingFlow />
    </PageShell>
  )
}
