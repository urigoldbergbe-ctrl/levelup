/**
 * Seeds the static leaders from src/data/leaders.ts into leader_profiles.
 * Also grants super-admin to the first user found (urigoldbergbe@gmail.com).
 *
 * Run after applying migration 00004 in Supabase SQL editor.
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

// Static leaders (mirrors src/data/leaders.ts)
const LEADERS = [
  {
    id: 'bezos',
    name: 'Jeff Bezos',
    title: 'Founder & Executive Chairman',
    company: 'Amazon',
    category: 'Strategy',
    quote: 'We are stubborn on vision. We are flexible on details.',
    photo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Jeff_Bezos_at_Amazon_Spheres_05.jpg/440px-Jeff_Bezos_at_Amazon_Spheres_05.jpg',
    g1: '#1a1a2e',
    g2: '#16213e',
    own_book: { title: 'Invent and Wander', url: 'https://amazon.com/dp/1647820715?tag=levelup-20', why: "Bezos's collected writings — the closest thing to his mental model in one place." },
    skills: ['Long-Term Thinking', 'Customer Obsession', 'Operational Excellence', 'Invention & Innovation', 'Capital Allocation'],
    career_ladder: [
      { title: 'Product Manager II', co: 'Amazon', years: 'Y0–Y2', yoe: '3–5 years exp', description: 'Own end-to-end delivery of a single product area.', qualifications: [] },
      { title: 'Senior Product Manager', co: 'Amazon', years: 'Y2–Y4', yoe: '5–8 years exp', description: 'Lead a product family with multiple workstreams.', qualifications: [] },
      { title: 'Principal Product Manager – Technical', co: 'Amazon', years: 'Y4–Y7', yoe: '8–12 years exp', description: 'Set the three-year vision for a large product domain.', qualifications: [] },
      { title: 'Vice President, Product', co: 'Amazon', years: 'Y7–Y10', yoe: '12+ years exp', description: "Own Amazon's strategy for a multi-billion dollar category.", qualifications: [] },
    ],
    approved: true,
    is_custom: false,
    catalog_books: [
      { id: 'b1', title: 'Invent and Wander', author: 'Jeff Bezos', url: 'https://amazon.com/dp/1647820715?tag=levelup-20', description: "Bezos's collected writings and speeches on business and innovation." },
      { id: 'b2', title: 'The Everything Store', author: 'Brad Stone', url: 'https://amazon.com/dp/0316219266?tag=levelup-20', description: "Definitive account of how Amazon was built." },
      { id: 'b3', title: 'Working Backwards', author: 'Colin Bryar & Bill Carr', url: 'https://amazon.com/dp/1250267595?tag=levelup-20', description: "Inside Amazon's unique approach to strategy, innovation, and hiring." },
    ],
    catalog_podcasts: [
      { id: 'p1', title: 'Lex Fridman Podcast – Jeff Bezos', show: 'Lex Fridman', url: 'https://lexfridman.com/jeff-bezos/', description: "Bezos on space, AI, and long-term thinking." },
      { id: 'p2', title: 'How I Built This', show: 'NPR / Guy Raz', url: 'https://www.npr.org/series/490248027/how-i-built-this', description: "Founders on the stories behind the companies they built." },
      { id: 'p3', title: 'Masters of Scale', show: 'Reid Hoffman', url: 'https://mastersofscale.com/', description: "Counter-intuitive growth strategies from world-class founders." },
    ],
    catalog_courses: [
      { id: 'c1', title: 'Strategic Leadership and Management', platform: 'Coursera (Illinois)', url: 'https://www.coursera.org/specializations/strategic-leadership', description: "Build the skills to think and act strategically as a senior leader." },
      { id: 'c2', title: 'Innovation & Entrepreneurship', platform: 'Harvard Online', url: 'https://online.hbs.edu/courses/disruptive-strategy/', description: "Clayton Christensen's disruptive strategy framework." },
      { id: 'c3', title: 'Product Strategy', platform: 'Reforge', url: 'https://www.reforge.com/product-strategy', description: "Advanced product strategy for senior PMs and founders." },
    ],
    news_alerts: ['Amazon strategy', 'AI and cloud computing', 'space exploration', 'long-term investing', 'customer obsession'],
  },
]

console.log('Seeding static leaders into leader_profiles…\n')
for (const leader of LEADERS) {
  const { error } = await admin.from('leader_profiles').upsert(leader, { onConflict: 'id' })
  if (error) {
    console.log(`  ❌ ${leader.name}: ${error.message}`)
  } else {
    console.log(`  ✅ ${leader.name} (${leader.id})`)
  }
}

// Grant super-admin to first user
const { data: { users } } = await admin.auth.admin.listUsers()
if (users.length > 0) {
  const firstUser = users[0]
  const { error } = await admin.from('profiles').update({ is_admin: true }).eq('id', firstUser.id)
  if (error) {
    console.log(`\n  ❌ Could not set is_admin for ${firstUser.email}: ${error.message}`)
  } else {
    console.log(`\n  ✅ Granted super-admin to ${firstUser.email}`)
  }
}

console.log('\nDone.')
