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

// Check auth users
const { data: users } = await admin.auth.admin.listUsers()
console.log('\n=== Auth users ===')
for (const u of users.users) {
  console.log(`  ${u.id}  ${u.email}  created: ${u.created_at}`)
}

// Check profiles
const { data: profiles } = await admin.from('profiles').select('*')
console.log('\n=== Profile rows ===')
if (!profiles?.length) {
  console.log('  ⚠️  NO PROFILE ROWS FOUND — this is the bug')
} else {
  for (const p of profiles) {
    console.log(`  ${p.id}  mentor_id: ${p.mentor_id ?? 'null'}  name: ${p.name}`)
  }
}

// Find users with no profile
const orphaned = users.users.filter(u => !profiles?.find(p => p.id === u.id))
if (orphaned.length) {
  console.log('\n=== Users with NO profile row ===')
  for (const u of orphaned) {
    console.log(`  ${u.id}  ${u.email}`)
  }
  console.log('\nFixing: inserting missing profile rows...')
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
}
