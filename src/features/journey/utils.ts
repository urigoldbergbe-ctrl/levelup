import type { Leader, Semester } from '@/types'

const THEMES = [
  'Foundation', 'Execution', 'Influence', 'Systems', 'Leadership', 'Strategy', 'Mastery',
] as const

const PERIODS = [
  'Months 1–6', 'Months 7–12', 'Months 13–18', 'Months 19–24',
  'Months 25–36', 'Months 37–48', 'Months 49–60',
]

const FOCUS = [
  'Build the fundamental knowledge your chosen leader used at the start of their career.',
  'Move from knowing to doing — apply your learning to real work deliverables.',
  'Develop your voice and ability to influence people above and around you.',
  'Understand the systems your organisation runs on and how to improve them.',
  'Step into formal leadership — develop others while executing at a higher level.',
  'Think and operate at a strategic level. Shape direction, not just execution.',
  'Integrate everything. Operate as a fully autonomous senior leader.',
]

/** Builds a 7-semester plan based on the mentor and gap context. */
export function buildSemesters(
  mentor: Leader | null,
  _gaps: { skill: string; category: string }[]
): Semester[] {
  return Array.from({ length: 7 }, (_, i) => {
    const sem = i + 1
    const year = sem <= 2 ? 1 : sem <= 4 ? 2 : sem <= 5 ? 3 : sem <= 6 ? 4 : 5

    const books = sem === 1 && mentor
      ? [
          {
            title: mentor.own_book.title,
            author: mentor.name,
            url: mentor.own_book.url,
            why: mentor.own_book.why,
            start_here: true,
          },
        ]
      : []

    return {
      sem,
      label: `Semester ${sem}`,
      period: PERIODS[i],
      year,
      theme: THEMES[i],
      focus: FOCUS[i],
      books,
      podcast: {
        title: 'How I Built This',
        by: 'Guy Raz / NPR',
        cal: `LevelUp S${sem} — How I Built This`,
      },
      course: {
        title: 'Strategic Leadership and Management',
        platform: 'Coursera',
        url: `https://coursera.org/learn/strategic-leadership?utm_source=levelup&utm_medium=affiliate&utm_campaign=career`,
      },
      skill: mentor?.skills[Math.min(i, 4)] ?? 'Strategic thinking',
      milestone: `Complete a real work deliverable demonstrating ${THEMES[i].toLowerCase()} skills`,
    }
  })
}
