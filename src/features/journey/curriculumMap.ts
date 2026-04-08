import type { CurriculumOutput } from '@/lib/ai/agents/curriculum.agent'
import type { Semester, SemesterTheme } from '@/types'

const PERIODS = [
  'Months 1–6',
  'Months 7–12',
  'Months 13–18',
  'Months 19–24',
  'Months 25–36',
  'Months 37–48',
  'Months 49–60',
] as const

const VALID_THEMES = new Set<string>([
  'Foundation',
  'Execution',
  'Influence',
  'Systems',
  'Leadership',
  'Strategy',
  'Mastery',
])

function coerceTheme(raw: string): SemesterTheme {
  const t = raw?.trim() ?? ''
  return (VALID_THEMES.has(t) ? t : 'Foundation') as SemesterTheme
}

function yearForSemester(sem: number): number {
  if (sem <= 2) return 1
  if (sem <= 4) return 2
  if (sem <= 5) return 3
  if (sem <= 6) return 4
  return 5
}

/**
 * Maps AI-persisted `leader_curriculum.content` into journey `Semester` rows.
 * Returns null if payload is missing or invalid so callers can fall back to `buildSemesters`.
 */
export function mapStoredCurriculumToSemesters(content: unknown): Semester[] | null {
  if (!content || typeof content !== 'object') return null
  const raw = content as Partial<CurriculumOutput>
  const list = raw.semesters
  if (!Array.isArray(list) || list.length < 7) return null

  const sorted = [...list].sort((a, b) => (a.sem ?? 0) - (b.sem ?? 0))
  if (sorted.length < 7) return null

  try {
    return sorted.slice(0, 7).map((row, i) => {
      const sem = typeof row.sem === 'number' ? row.sem : i + 1
      const theme = coerceTheme(String(row.theme ?? ''))
      const books = (row.books ?? []).map(b => ({
        title: String(b.title ?? '').trim() || 'Untitled',
        author: String(b.author ?? '').trim() || '—',
        url: String(b.url ?? '').trim(),
        why: String(b.why ?? '').trim() || 'Recommended for this stage of your journey.',
      }))

      const podcastRows = row.podcasts ?? []
      const podcasts = podcastRows.map(p => {
        const title = String(p.title ?? '').trim() || 'Podcast'
        return {
          title,
          by: String(p.by ?? '').trim() || '—',
          url: p.url?.trim() || undefined,
          cal: `LevelUp — ${title}`,
        }
      })
      const podcast = podcasts[0] ?? {
        title: 'Podcast',
        by: '—',
        cal: 'LevelUp — Podcast',
      }

      const courseRows = row.courses ?? []
      const courses = courseRows.map(c => ({
        title: String(c.title ?? '').trim() || 'Course',
        platform: String(c.platform ?? '').trim() || 'Online',
        url: String(c.url ?? '').trim() || 'https://coursera.org',
      }))
      const course = courses[0] ?? {
        title: 'Course',
        platform: 'Online',
        url: 'https://coursera.org',
      }
      const altCourses = courses.slice(1)

      const skills = Array.isArray(row.skills) ? row.skills.map(s => String(s).trim()).filter(Boolean) : []
      const skill = skills[0] ?? 'Strategic thinking'

      return {
        sem,
        label: `Semester ${sem}`,
        period: PERIODS[i] ?? PERIODS[PERIODS.length - 1],
        year: yearForSemester(sem),
        theme,
        focus: String(row.focus ?? '').trim() || `Develop ${theme.toLowerCase()} capabilities this semester.`,
        books: books.length ? books : [
          {
            title: 'Pick from catalog',
            author: '—',
            url: '',
            why: 'Add books in the admin catalog for this leader.',
          },
        ],
        podcasts: podcasts.length ? podcasts : [podcast],
        podcast,
        course,
        altCourses,
        skill,
        milestone: String(row.milestone ?? '').trim() || `Complete a deliverable demonstrating ${theme.toLowerCase()} skills.`,
      }
    })
  } catch {
    return null
  }
}
