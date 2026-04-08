import { redirect } from 'next/navigation'

/** Legacy route: main app entry is now `/home`. */
export default function DashboardRedirectPage() {
  redirect('/home')
}
