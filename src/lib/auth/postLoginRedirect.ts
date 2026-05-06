const GATE_ROLES = ['manager', 'hr_admin', 'owner'] as const
type GateRole = (typeof GATE_ROLES)[number]

function normaliseRoles(rows: { role: string }[] | null | undefined): GateRole[] {
  const set = new Set<string>()
  for (const r of rows ?? []) {
    if ((GATE_ROLES as readonly string[]).includes(r.role)) set.add(r.role)
  }
  return [...set] as GateRole[]
}

function isManagerOnlyConsoleUser(roles: GateRole[]): boolean {
  const canFullAdmin = roles.some(r => r === 'hr_admin' || r === 'owner')
  const isManager = roles.includes('manager')
  return isManager && !canFullAdmin
}

/**
 * Where to send the user after sign-in. Line managers without HR/owner anywhere
 * go to the team console instead of home or generic /admin.
 */
export function resolvePostLoginPath(requested: string, membershipRows: { role: string }[] | null | undefined): string {
  const roles = normaliseRoles(membershipRows)
  if (!isManagerOnlyConsoleUser(roles)) return requested

  if (requested === '/home' || requested === '/') return '/admin/team'

  if (requested === '/admin' || (requested.startsWith('/admin/') && !requested.startsWith('/admin/team'))) {
    return '/admin/team'
  }

  return requested
}
