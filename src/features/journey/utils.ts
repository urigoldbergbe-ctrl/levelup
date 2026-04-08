import type { Leader, Semester, SemesterBook, SemesterPodcast, SemesterCourse } from '@/types'

const THEMES = [
  'Foundation', 'Execution', 'Influence', 'Systems', 'Leadership', 'Strategy', 'Mastery',
] as const

const PERIODS = [
  'Months 1–6', 'Months 7–12', 'Months 13–18', 'Months 19–24',
  'Months 25–36', 'Months 37–48', 'Months 49–60',
]

const FOCUS = [
  'Build the fundamental knowledge your chosen leader used at the start of their career.',
  'Move from knowing to doing — apply your learning to real deliverables.',
  'Develop your voice and ability to influence people above and around you.',
  'Understand the systems your organisation runs on and how to improve them.',
  'Step into formal leadership — develop others while executing at a higher level.',
  'Think and operate at a strategic level. Shape direction, not just execution.',
  'Integrate everything. Operate as a fully autonomous senior leader.',
]

const BOOKS_BY_THEME: Record<string, SemesterBook[]> = {
  Foundation: [
    { title: 'The Hard Thing About Hard Things', author: 'Ben Horowitz', url: 'https://www.amazon.com/dp/0062273205', why: 'Real lessons from building a company through genuine struggle — no platitudes.' },
    { title: 'High Output Management', author: 'Andy Grove', url: 'https://www.amazon.com/dp/0679762884', why: 'The operational bible every ambitious manager needs before managing their first team.' },
    { title: 'Zero to One', author: 'Peter Thiel', url: 'https://www.amazon.com/dp/0804139296', why: 'How to think about creating unique value — essential framing for your entire journey.' },
  ],
  Execution: [
    { title: 'Measure What Matters', author: 'John Doerr', url: 'https://www.amazon.com/dp/0525536221', why: 'OKRs as a tool to align your execution with strategy at every level.' },
    { title: 'The Lean Startup', author: 'Eric Ries', url: 'https://www.amazon.com/dp/0307887898', why: 'Build-measure-learn loops that eliminate waste and dramatically accelerate delivery.' },
    { title: 'Essentialism', author: 'Greg McKeown', url: 'https://www.amazon.com/dp/0804137382', why: 'The disciplined pursuit of less — do fewer things but do them far better.' },
  ],
  Influence: [
    { title: 'Influence: The Psychology of Persuasion', author: 'Robert Cialdini', url: 'https://www.amazon.com/dp/006124189X', why: 'The science behind how people are convinced — essential for every aspiring leader.' },
    { title: 'Never Split the Difference', author: 'Chris Voss', url: 'https://www.amazon.com/dp/0062407805', why: 'Tactical empathy from a hostage negotiator — works in boardrooms too.' },
    { title: 'How to Win Friends and Influence People', author: 'Dale Carnegie', url: 'https://www.amazon.com/dp/0671027034', why: 'Timeless principles for building the relationships that move your career forward.' },
  ],
  Systems: [
    { title: 'Thinking in Systems', author: 'Donella Meadows', url: 'https://www.amazon.com/dp/1603580557', why: 'See organisations as interconnected systems and learn to change them deliberately.' },
    { title: 'The Goal', author: 'Eliyahu Goldratt', url: 'https://www.amazon.com/dp/0884271951', why: 'Theory of constraints: find the bottleneck in any system and fix the whole thing.' },
    { title: 'An Elegant Puzzle', author: 'Will Larson', url: 'https://www.amazon.com/dp/1732265186', why: 'Systems for scaling complex organisations — applies far beyond engineering.' },
  ],
  Leadership: [
    { title: 'Radical Candor', author: 'Kim Scott', url: 'https://www.amazon.com/dp/1250103509', why: 'Care personally and challenge directly — the only leadership style that truly scales.' },
    { title: 'Team of Teams', author: 'Stanley McChrystal', url: 'https://www.amazon.com/dp/1591847486', why: 'Adapt large organisations to move at startup speed without losing coordination.' },
    { title: 'The Five Dysfunctions of a Team', author: 'Patrick Lencioni', url: 'https://www.amazon.com/dp/0787960756', why: 'A field guide for diagnosing and fixing the broken team dynamics that stall careers.' },
  ],
  Strategy: [
    { title: 'Good Strategy Bad Strategy', author: 'Richard Rumelt', url: 'https://www.amazon.com/dp/0307886239', why: 'Learn to distinguish real strategy from wishful thinking dressed up in buzzwords.' },
    { title: 'Playing to Win', author: 'A.G. Lafley & Roger Martin', url: 'https://www.amazon.com/dp/142214697X', why: 'Strategy as integrated choices — where to play, how to win, what capabilities you need.' },
    { title: 'Blue Ocean Strategy', author: 'W. Chan Kim', url: 'https://www.amazon.com/dp/1625274491', why: 'Create uncontested market space rather than competing in shrinking pools.' },
  ],
  Mastery: [
    { title: 'Deep Work', author: 'Cal Newport', url: 'https://www.amazon.com/dp/1455586692', why: 'The ability to focus without distraction is the superpower of the next decade.' },
    { title: 'Range', author: 'David Epstein', url: 'https://www.amazon.com/dp/0735214484', why: 'Why generalists often beat specialists and how to develop range deliberately.' },
    { title: 'Outliers', author: 'Malcolm Gladwell', url: 'https://www.amazon.com/dp/0316017930', why: 'Understand the real factors behind exceptional success — and replicate them.' },
  ],
}

const PODCASTS_BY_THEME: Record<string, [SemesterPodcast, SemesterPodcast]> = {
  Foundation: [
    { title: 'How I Built This', by: 'Guy Raz / NPR', url: 'https://podcasts.apple.com/podcast/id1150510297', cal: 'LevelUp — How I Built This' },
    { title: 'Acquired', by: 'Ben Gilbert & David Rosenthal', url: 'https://podcasts.apple.com/podcast/id1050462261', cal: 'LevelUp — Acquired' },
  ],
  Execution: [
    { title: 'Masters of Scale', by: 'Reid Hoffman', url: 'https://podcasts.apple.com/podcast/id1227971746', cal: 'LevelUp — Masters of Scale' },
    { title: 'The Tim Ferriss Show', by: 'Tim Ferriss', url: 'https://podcasts.apple.com/podcast/id863897795', cal: 'LevelUp — Tim Ferriss Show' },
  ],
  Influence: [
    { title: 'WorkLife with Adam Grant', by: 'Adam Grant / TED', url: 'https://podcasts.apple.com/podcast/id1346314086', cal: 'LevelUp — WorkLife with Adam Grant' },
    { title: 'Hidden Brain', by: 'Shankar Vedantam / NPR', url: 'https://podcasts.apple.com/podcast/id1028908750', cal: 'LevelUp — Hidden Brain' },
  ],
  Systems: [
    { title: 'EconTalk', by: 'Russ Roberts', url: 'https://podcasts.apple.com/podcast/id135066958', cal: 'LevelUp — EconTalk' },
    { title: 'Lex Fridman Podcast', by: 'Lex Fridman', url: 'https://podcasts.apple.com/podcast/id1434243584', cal: 'LevelUp — Lex Fridman' },
  ],
  Leadership: [
    { title: 'HBR IdeaCast', by: 'Harvard Business Review', url: 'https://podcasts.apple.com/podcast/id152022135', cal: 'LevelUp — HBR IdeaCast' },
    { title: 'Dare to Lead', by: 'Brené Brown', url: 'https://podcasts.apple.com/podcast/id1462440728', cal: 'LevelUp — Dare to Lead' },
  ],
  Strategy: [
    { title: 'The Knowledge Project', by: 'Shane Parrish / Farnam Street', url: 'https://podcasts.apple.com/podcast/id990149481', cal: 'LevelUp — The Knowledge Project' },
    { title: 'In Good Company', by: 'Nicolai Tangen / Norges Bank', url: 'https://podcasts.apple.com/podcast/id1546327004', cal: 'LevelUp — In Good Company' },
  ],
  Mastery: [
    { title: 'Deep Questions', by: 'Cal Newport', url: 'https://podcasts.apple.com/podcast/id1515786216', cal: 'LevelUp — Deep Questions' },
    { title: 'Revisionist History', by: 'Malcolm Gladwell', url: 'https://podcasts.apple.com/podcast/id1119389968', cal: 'LevelUp — Revisionist History' },
  ],
}

/** Aligns each theme with its copy (needed when theme order is rotated per leader). */
const FOCUS_BY_THEME: Record<(typeof THEMES)[number], string> = Object.fromEntries(
  THEMES.map((t, i) => [t, FOCUS[i]]),
) as Record<(typeof THEMES)[number], string>

/** Order themes so semesters that address the user's assessment gaps come first. */
const GAP_CATEGORY_TO_THEMES: Record<string, (typeof THEMES)[number][]> = {
  Technical: ['Systems', 'Execution', 'Foundation'],
  Communication: ['Influence', 'Leadership'],
  Thinking: ['Strategy', 'Mastery', 'Foundation'],
}

function themeOrderFromGaps(gaps: { category: string }[]): (typeof THEMES)[number][] {
  if (!gaps.length) return [...THEMES]

  const counts = new Map<string, number>()
  for (const g of gaps) {
    const c = g.category?.trim() || 'Thinking'
    counts.set(c, (counts.get(c) ?? 0) + 1)
  }

  const sortedCats = [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([k]) => k)
  const ordered: (typeof THEMES)[number][] = []
  const seen = new Set<string>()

  for (const cat of sortedCats) {
    const mapped = GAP_CATEGORY_TO_THEMES[cat] ?? GAP_CATEGORY_TO_THEMES['Thinking']
    for (const t of mapped) {
      if (!seen.has(t)) {
        ordered.push(t)
        seen.add(t)
      }
    }
  }
  for (const t of THEMES) {
    if (!seen.has(t)) {
      ordered.push(t)
      seen.add(t)
    }
  }
  return ordered
}

const COURSES_BY_THEME: Record<string, [SemesterCourse, SemesterCourse, SemesterCourse]> = {
  Foundation: [
    { title: 'Foundations of Management', platform: 'Coursera (HEC Paris)', url: 'https://coursera.org/learn/foundations-management' },
    { title: 'Introduction to Corporate Finance', platform: 'Coursera (Wharton)', url: 'https://coursera.org/learn/wharton-finance' },
    { title: 'Business Foundations Specialization', platform: 'Coursera (Wharton)', url: 'https://coursera.org/specializations/wharton-business-foundations' },
  ],
  Execution: [
    { title: 'Project Management Principles', platform: 'Coursera (UCI)', url: 'https://coursera.org/learn/project-management-basics' },
    { title: 'Agile with Atlassian Jira', platform: 'Coursera (Atlassian)', url: 'https://coursera.org/learn/agile-atlassian-jira' },
    { title: 'Work Smarter, Not Harder', platform: 'Coursera (UC Irvine)', url: 'https://coursera.org/learn/work-smarter-not-harder' },
  ],
  Influence: [
    { title: 'Inspiring and Motivating Individuals', platform: 'Coursera (Michigan)', url: 'https://coursera.org/learn/motivate-people-teams' },
    { title: 'Successful Negotiation', platform: 'Coursera (Michigan)', url: 'https://coursera.org/learn/negotiation-skills' },
    { title: 'Communication in the 21st Century', platform: 'Coursera (Georgia Tech)', url: 'https://coursera.org/learn/communicate' },
  ],
  Systems: [
    { title: 'Systems Thinking In Public Health', platform: 'Coursera (Johns Hopkins)', url: 'https://coursera.org/learn/systems-thinking' },
    { title: 'Model Thinking', platform: 'Coursera (Michigan)', url: 'https://coursera.org/learn/model-thinking' },
    { title: 'Design Thinking for Innovation', platform: 'Coursera (Virginia)', url: 'https://coursera.org/learn/uva-darden-design-thinking-innovation' },
  ],
  Leadership: [
    { title: 'Organisational Leadership', platform: 'Coursera (Northwestern)', url: 'https://coursera.org/learn/org-leadership' },
    { title: 'Become a High-Impact Leader', platform: 'Harvard Online', url: 'https://online.hbs.edu/subjects/leadership' },
    { title: 'Leading Teams', platform: 'Coursera (Michigan)', url: 'https://coursera.org/learn/leading-teams' },
  ],
  Strategy: [
    { title: 'Business Strategy', platform: 'Coursera (Virginia)', url: 'https://coursera.org/learn/uva-darden-foundations-business-strategy' },
    { title: 'Corporate Strategy', platform: 'Coursera (Copenhagen)', url: 'https://coursera.org/learn/corporate-strategy' },
    { title: 'Strategic Leadership and Management', platform: 'Coursera (Illinois)', url: 'https://coursera.org/learn/strategic-leadership' },
  ],
  Mastery: [
    { title: 'Learning How to Learn', platform: 'Coursera (UC San Diego)', url: 'https://coursera.org/learn/learning-how-to-learn' },
    { title: 'The Science of Well-Being', platform: 'Coursera (Yale)', url: 'https://coursera.org/learn/the-science-of-well-being' },
    { title: 'Executive Leadership', platform: 'Coursera (UCI)', url: 'https://coursera.org/learn/executive-leadership' },
  ],
}

/** Builds a 7-semester learning plan based on the mentor and gap context. */
export function buildSemesters(
  mentor: Leader | null,
  gaps: { skill: string; category: string }[]
): Semester[] {
  const themeOrder = themeOrderFromGaps(gaps)
  return Array.from({ length: 7 }, (_, i) => {
    const sem = i + 1
    const year = sem <= 2 ? 1 : sem <= 4 ? 2 : sem <= 5 ? 3 : sem <= 6 ? 4 : 5
    const theme = themeOrder[i]

    // 3 books: mentor's own book as first entry in semester 1, then theme books
    const themeBooks = BOOKS_BY_THEME[theme] ?? BOOKS_BY_THEME['Foundation']
    let books: typeof themeBooks
    if (sem === 1 && mentor?.own_book?.title) {
      books = [
        { title: mentor.own_book.title, author: mentor.name, url: mentor.own_book.url, why: mentor.own_book.why, start_here: true },
        themeBooks[0],
        themeBooks[1],
      ]
    } else {
      books = [...themeBooks]
    }

    const podcastPair = PODCASTS_BY_THEME[theme] ?? PODCASTS_BY_THEME['Foundation']
    const [course, ...altCourses] = COURSES_BY_THEME[theme] ?? COURSES_BY_THEME['Foundation']

    return {
      sem,
      label: `Semester ${sem}`,
      period: PERIODS[i],
      year,
      theme,
      focus: FOCUS_BY_THEME[theme] ?? FOCUS[i],
      books,
      podcasts: podcastPair,
      podcast: podcastPair[0],
      course,
      altCourses,
      skill: mentor?.skills[Math.min(i, 4)] ?? 'Strategic thinking',
      milestone: `Complete a real work deliverable demonstrating ${theme.toLowerCase()} skills`,
    }
  })
}
