import { createClient } from '@supabase/supabase-js'

function requiredEnv(name) {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required env var: ${name}`)
  }
  return value
}

const supabase = createClient(
  requiredEnv('NEXT_PUBLIC_SUPABASE_URL'),
  requiredEnv('SUPABASE_SERVICE_ROLE_KEY')
)

const tables = ['profiles', 'leader_profiles', 'assessments', 'progress', 'skill_scores', 'checklist_items', 'mentor_sessions', 'organizations', 'org_memberships', 'leader_curriculum']

for (const table of tables) {
  const { error, count } = await supabase.from(table).select('*', { count: 'exact', head: true })
  if (error) {
    console.log(`❌ ${table}: ${error.message}`)
  } else {
    console.log(`✅ ${table}: ${count ?? 0} rows`)
  }
}
