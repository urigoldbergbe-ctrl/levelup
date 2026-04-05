import { getAnthropicClient, AI_MODEL } from '../client'
import type { LeaderFormData, CatalogBook, CatalogPodcast, CatalogCourse } from '@/features/admin/actions'

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

export interface CurriculumInput {
  leader: LeaderFormData
  catalog?: {
    books: CatalogBook[]
    podcasts: CatalogPodcast[]
    courses: CatalogCourse[]
    newsAlerts: string[]
  }
}

export async function runCurriculumGeneration(input: CurriculumInput): Promise<CurriculumOutput> {
  const client = getAnthropicClient()
  const { leader, catalog } = input

  const prompt = buildCurriculumPrompt(leader, catalog)

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
  catalog?: CurriculumInput['catalog'],
): string {
  const skillList = leader.skills.filter(Boolean).map(s => `  - ${s}`).join('\n')
  const alertList = (catalog?.newsAlerts ?? leader.newsAlerts).filter(Boolean).map(a => `  - ${a}`).join('\n')

  const hasCatalog = catalog && (
    catalog.books.length > 0 || catalog.podcasts.length > 0 || catalog.courses.length > 0
  )

  const bookSection = hasCatalog && catalog.books.length > 0
    ? catalog.books.map((b, i) =>
        `  ${i + 1}. "${b.title}" by ${b.author} — ${b.description}\n     URL: ${b.url || 'N/A'}`
      ).join('\n')
    : leader.books.filter(b => b.title)
        .map((b, i) => `  ${i + 1}. "${b.title}" by ${b.author || 'unknown'} — ${b.why || ''}`)
        .join('\n') || '  (none provided)'

  const podcastSection = hasCatalog && catalog.podcasts.length > 0
    ? catalog.podcasts.map((p, i) =>
        `  ${i + 1}. "${p.title}" (${p.show}) — ${p.description}\n     URL: ${p.url || 'N/A'}`
      ).join('\n')
    : '  (none provided)'

  const courseSection = hasCatalog && catalog.courses.length > 0
    ? catalog.courses.map((c, i) =>
        `  ${i + 1}. "${c.title}" on ${c.platform} [${c.level}] — ${c.description}\n     URL: ${c.url || 'N/A'}`
      ).join('\n')
    : '  (none provided)'

  const catalogInstruction = hasCatalog
    ? `IMPORTANT: You MUST select books, podcasts, and courses EXCLUSIVELY from the curated catalogs above.
Do not invent or reference any resource not listed in the catalog.
If the catalog has fewer than 3 books, it is OK to assign the same book to multiple semesters.
Always include the URL from the catalog in your response.`
    : `Select high-quality, real books, podcasts, and courses that align with the theme.`

  return `You are an expert career curriculum designer. Create a 7-semester (5-year) career development curriculum inspired by the following leader.

LEADER PROFILE:
Name: ${leader.name}
Role: ${leader.title} at ${leader.company}
Category: ${leader.category}
Quote: "${leader.quote}"

SKILLS THEY BELIEVE DEFINE THEIR SUCCESS:
${skillList || '  (none provided)'}

${leader.spotifyUrl ? `SPOTIFY PROFILE: ${leader.spotifyUrl}` : ''}

CURATED BOOK CATALOG (choose from this list):
${bookSection}

CURATED PODCAST CATALOG (choose from this list):
${podcastSection}

CURATED COURSE CATALOG (choose from this list):
${courseSection}

NEWS / TOPICS TO FOLLOW:
${alertList || '  (none provided)'}

${catalogInstruction}

TASK: Design a 7-semester curriculum (each semester ≈ 8 months) that progressively builds the skills and mindset needed to emulate this leader's career path.

For each semester provide:
1. theme (e.g. Foundation, Execution, Influence, Systems, Leadership, Strategy, Mastery)
2. 1-sentence focus statement
3. 2–3 books from the catalog that fit that semester's theme
4. 1–2 podcasts from the catalog relevant to the theme
5. 1 course from the catalog
6. 3 key skills to develop
7. 2–3 news topics to follow closely
8. A concrete milestone the learner should achieve

Return ONLY valid JSON (no markdown, no explanation) in this exact schema:
{
  "semesters": [
    {
      "sem": 1,
      "theme": "Foundation",
      "focus": "...",
      "books": [
        { "title": "...", "author": "...", "url": "", "why": "..." }
      ],
      "podcasts": [
        { "title": "...", "by": "...", "url": "", "why": "..." }
      ],
      "courses": [
        { "title": "...", "platform": "...", "url": "", "why": "..." }
      ],
      "skills": ["...", "...", "..."],
      "newsTopics": ["...", "..."],
      "milestone": "..."
    }
  ]
}`
}
