import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://zmqphvwivmdqfsmhdqhm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InptcXBodndpdm1kcWZzbWhkcWhtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTM4MDY0NiwiZXhwIjoyMDkwOTU2NjQ2fQ.wNVEKEGbbUd5dqooZB6P-D2drFkSfcWgyd5wTvOb40Q'
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
