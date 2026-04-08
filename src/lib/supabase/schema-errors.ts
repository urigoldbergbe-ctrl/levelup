/** Detect PostgREST / Postgres errors when tables or views are missing (migration not applied). */
export function isMissingTableError(err: { message?: string; code?: string } | null | undefined): boolean {
  if (!err?.message) return false
  const m = err.message.toLowerCase()
  return (
    m.includes('does not exist') ||
    m.includes('schema cache') ||
    m.includes('could not find the table')
  )
}
