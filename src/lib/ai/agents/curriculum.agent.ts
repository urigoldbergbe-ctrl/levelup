import { getAnthropicClient, AI_MODEL } from '../client'
import type { LeaderFormData } from '@/features/admin/types'

export interface CurriculumOutput {
  semesters: CurriculumSemester[]
}

export interface CurriculumSemester {
  sem: number
  theme: string
  focus: string
  books: Array<{ title: string; author: string; url?: string; why: string }>
  podcasts: Array<{ title: string; by: string; url?: string; why: string }>
  courses: Array<{ title: string; platform: string; url?: string; why: string }>
  skills: string[]
  newsTopics: string[]
  milestone: string
}

export interface GlobalLibraryItem {
  id: string
  type: 'book' | 'podcast' | 'course'
  title: string
  author?: string | null
  url?: string | null
  description?: string | null
  platform?: string | null
  gap_tags: string[]
}

export interface CurriculumInput {
  leader: LeaderFormData
  skillGaps?: Array<{ skill: string; category: string; why: string }>
  globalLibrary?: GlobalLibraryItem[]
  /** A short excerpt from the user's CV/profile to personalise content to their industry */
  profileContext?: string
  /** Resources with positive user feedback across the platform — prioritise these */
  wellRatedItems?: Array<{ resource_type: string; resource_title: string }>
  /** Resources with negative user feedback — avoid recommending these */
  poorlyRatedItems?: Array<{ resource_type: string; resource_title: string }>
}

export async function runCurriculumGeneration(input: CurriculumInput): Promise<CurriculumOutput> {
  const client = getAnthropicClient()
  const { leader, skillGaps, globalLibrary, profileContext, wellRatedItems, poorlyRatedItems } = input

  const prompt = buildCurriculumPrompt(leader, skillGaps, globalLibrary, profileContext, wellRatedItems, poorlyRatedItems)

  const response = await client.messages.create({
    model: AI_MODEL,
    max_tokens: 4096,
    messages: [{ role: 'user', content: prompt }],
  })

  const block = response.content[0]
  if (block.type !== 'text') throw new Error('Unexpected response type from Claude')

  const jsonText = block.text.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim()

  let parsed: CurriculumOutput
  try {
    parsed = JSON.parse(jsonText) as CurriculumOutput
  } catch {
    throw new Error(`Failed to parse Claude curriculum response: ${jsonText.slice(0, 200)}`)
  }

  if (!parsed.semesters || parsed.semesters.length < 7) {
    throw new Error('Curriculum must have at least 7 semesters')
  }

  return parsed
}

function buildCurriculumPrompt(
  leader: LeaderFormData,
  skillGaps?: CurriculumInput['skillGaps'],
  globalLibrary?: GlobalLibraryItem[],
  profileContext?: string,
  wellRatedItems?: Array<{ resource_type: string; resource_title: string }>,
  poorlyRatedItems?: Array<{ resource_type: string; resource_title: string }>,
): string {
  const skillList = leader.skills.filter(Boolean).map(s => `  - ${s}`).join('\n')

  const gapList = skillGaps && skillGaps.length > 0
    ? skillGaps.map(g => `  - [${g.category}] ${g.skill}: ${g.why}`).join('\n')
    : '  (not available — use leader skills as proxy)'

  // Separate library by type
  const books   = (globalLibrary ?? []).filter(i => i.type === 'book')
  const podcasts = (globalLibrary ?? []).filter(i => i.type === 'podcast')
  const courses  = (globalLibrary ?? []).filter(i => i.type === 'course')

  const formatBook = (b: GlobalLibraryItem, i: number) =>
    `  ${i + 1}. "${b.title}" by ${b.author ?? 'unknown'}\n     ${b.description ?? ''}\n     URL: ${b.url ?? 'N/A'}\n     Gap tags: ${b.gap_tags.join(', ')}`

  const formatPodcast = (p: GlobalLibraryItem, i: number) =>
    `  ${i + 1}. "${p.title}"${p.author ? ` — ${p.author}` : ''}\n     ${p.description ?? ''}\n     URL: ${p.url ?? 'N/A'}\n     Gap tags: ${p.gap_tags.join(', ')}`

  const formatCourse = (c: GlobalLibraryItem, i: number) =>
    `  ${i + 1}. "${c.title}"${c.platform ? ` (${c.platform})` : ''}\n     ${c.description ?? ''}\n     URL: ${c.url ?? 'N/A'}\n     Gap tags: ${c.gap_tags.join(', ')}`

  const bookCatalog   = books.length   > 0 ? books.map(formatBook).join('\n\n')     : '  (none available)'
  const podcastCatalog = podcasts.length > 0 ? podcasts.map(formatPodcast).join('\n\n') : '  (none available)'
  const courseCatalog  = courses.length  > 0 ? courses.map(formatCourse).join('\n\n')  : '  (none available)'

  const hasLibrary = books.length > 0 || podcasts.length > 0 || courses.length > 0

  // Community feedback signals
  const wellRatedList = (wellRatedItems ?? []).map(i => `  - ${i.resource_title} (${i.resource_type})`).join('\n')
  const poorlyRatedList = (poorlyRatedItems ?? []).map(i => `  - ${i.resource_title} (${i.resource_type})`).join('\n')
  const feedbackSection = (wellRatedList || poorlyRatedList) ? `
═══════════════════════════════════════════
COMMUNITY FEEDBACK (learn from past users)
═══════════════════════════════════════════
These resources scored well with previous learners — prioritise them when relevant:
${wellRatedList || '  (none yet)'}

These resources were rated negatively — avoid recommending them:
${poorlyRatedList || '  (none yet)'}
` : ''

  // User background context
  const profileSection = profileContext ? `
═══════════════════════════════════════════
USER BACKGROUND (CRITICAL — read carefully)
═══════════════════════════════════════════
${profileContext.slice(0, 800)}

IMPORTANT: Use this background to filter out irrelevant content. For example, do NOT recommend 
"public health" courses to a software engineer, or "coding bootcamp" courses to a doctor. Every 
recommendation must be directly applicable to THIS user's actual industry and career context.
` : ''

  const selectionInstruction = hasLibrary ? `
SELECTION LOGIC — apply BOTH criteria when choosing books, podcasts, and courses:

1. GAP RELEVANCE: Match the item's "Gap tags" to the user's identified skill gaps above.
   Items tagged for a gap the user needs to close should be prioritised.

2. LEADER FIT: Consider what ${leader.name} (${leader.title} at ${leader.company}) 
   would realistically read, listen to, or recommend. A data-focused leader reads 
   technical books; a sales leader reads persuasion and psychology books; a strategy 
   leader reads business history and competitive analysis. Match the leader's profile.

RULE: You MUST select ALL books, podcasts, and courses EXCLUSIVELY from the catalogs 
provided above. Do NOT invent or reference any resource not listed. Always include the 
exact URL from the catalog.` : `
Select high-quality, real books, podcasts, and courses that align with the theme and 
the leader's background. Consider both what is most relevant to closing the user's gaps 
AND what ${leader.name} would realistically recommend given their career in ${leader.category}.`

  return `You are an expert career curriculum designer. Create a 7-semester learning journey for a user who wants to follow the career path of ${leader.name}.
${profileSection}
${feedbackSection}
═══════════════════════════════════════════
LEADER PROFILE
═══════════════════════════════════════════
Name: ${leader.name}
Role: ${leader.title} at ${leader.company}
Category: ${leader.category}

Skills they believe define their success:
${skillList || '  (none provided)'}

═══════════════════════════════════════════
USER'S SKILL GAPS (what needs to be closed)
═══════════════════════════════════════════
${gapList}

═══════════════════════════════════════════
AVAILABLE BOOKS
═══════════════════════════════════════════
${bookCatalog}

═══════════════════════════════════════════
AVAILABLE PODCASTS
═══════════════════════════════════════════
${podcastCatalog}

═══════════════════════════════════════════
AVAILABLE COURSES
═══════════════════════════════════════════
${courseCatalog}

═══════════════════════════════════════════
HOW TO SELECT CONTENT
═══════════════════════════════════════════
${selectionInstruction}

═══════════════════════════════════════════
TASK
═══════════════════════════════════════════
Design a 7-semester curriculum (each semester ≈ 8 months) that progressively builds the skills and mindset needed to emulate ${leader.name}'s career path, closing the user's specific gaps along the way.

For each semester provide:
1. theme — one word (e.g. Foundation, Execution, Influence, Systems, Leadership, Strategy, Mastery)
2. focus — 1-sentence focus statement for this semester
3. books — 3 books from the catalog that best close this semester's gaps AND fit ${leader.name}'s reading style
4. podcasts — 2 podcasts from the catalog relevant to this semester's theme
5. courses — 1 course from the catalog most relevant to closing the key gap this semester
6. skills — 3 specific skills to develop
7. newsTopics — 2–3 news topics / industry areas to follow closely
8. milestone — a concrete, measurable deliverable the learner should complete

Return ONLY valid JSON (no markdown, no explanation) in this exact schema:
{
  "semesters": [
    {
      "sem": 1,
      "theme": "Foundation",
      "focus": "...",
      "books": [
        { "title": "...", "author": "...", "url": "...", "why": "one sentence on why this book is right for this user at this stage" }
      ],
      "podcasts": [
        { "title": "...", "by": "...", "url": "...", "why": "..." }
      ],
      "courses": [
        { "title": "...", "platform": "...", "url": "...", "why": "..." }
      ],
      "skills": ["...", "...", "..."],
      "newsTopics": ["...", "..."],
      "milestone": "..."
    }
  ]
}`
}
