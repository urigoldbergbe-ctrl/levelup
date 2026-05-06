/**
 * Run this AFTER the SQL migrations have been executed in Supabase.
 * It creates missing profile rows for any auth users that signed up
 * before the migrations ran.
 */
import { createClient } from '@supabase/supabase-js'

function requiredEnv(name) {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required env var: ${name}`)
  }
  return value
}

const admin = createClient(
  requiredEnv('NEXT_PUBLIC_SUPABASE_URL'),
  requiredEnv('SUPABASE_SERVICE_ROLE_KEY')
)

const { data: { users } } = await admin.auth.admin.listUsers()
const { data: profiles } = await admin.from('profiles').select('id')

const existingIds = new Set((profiles ?? []).map(p => p.id))
const orphaned = users.filter(u => !existingIds.has(u.id))

if (!orphaned.length) {
  console.log('✅ All users have profile rows — nothing to fix.')
  process.exit(0)
}

console.log(`Found ${orphaned.length} user(s) with no profile row. Fixing…\n`)
for (const u of orphaned) {
  const { error } = await admin.from('profiles').insert({
    id: u.id,
    name: u.user_metadata?.name ?? u.email?.split('@')[0] ?? null,
  })
  if (error) {
    console.log(`  ❌ ${u.email}: ${error.message}`)
  } else {
    console.log(`  ✅ Created profile for ${u.email}`)
  }
}

console.log('\nDone. You can now log in and select a leader normally.')
