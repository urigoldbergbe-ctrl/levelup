import { redirect } from 'next/navigation'

// Canonical URL moved to /progress
export default function ReadinessPage() {
  redirect('/progress')
}
