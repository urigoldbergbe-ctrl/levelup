export interface OwnBook {
  title: string
  url: string
  why: string
}

export interface CareerRole {
  title: string
  co: string
  years: string       // e.g. 'Y0–Y2'
  yoe: string         // e.g. '3–5 years exp'
  description: string
  qualifications: string[]
}

export interface Leader {
  id: string          // slug e.g. 'bezos'
  name: string
  title: string
  company: string
  category: LeaderCategory
  /** Optional secondary and tertiary categories */
  category2?: LeaderCategory | null
  category3?: LeaderCategory | null
  quote: string
  /** Short biography shown on hover in the leader card */
  bio?: string
  photo_url?: string
  g1: string          // fallback gradient start
  g2: string          // fallback gradient end
  own_book: OwnBook
  skills: string[]
  career_ladder: CareerRole[]
  isOrgLeader?: boolean
  spotify_url?: string
  goodreads_url?: string
}

export type LeaderCategory =
  | 'Strategy'
  | 'Marketing'
  | 'Sales'
  | 'Product'
  | 'Data'
  | 'HR'
  | 'Operations'
  | 'Engineering'

export interface SkillGap {
  skill: string
  why: string
  category: 'Technical' | 'Communication' | 'Thinking'
}

export interface Assessment {
  id: string
  user_id: string
  mentor_id: string
  profile_text?: string
  headline: string
  current_level: string
  target_level: string
  gaps: SkillGap[]
  strengths: string[]
  year_one_action: string
  mentor_parallel: string
  created_at: string
}

export interface SemesterBook {
  title: string
  author: string
  url: string          // Amazon Associates link
  why: string
  start_here?: boolean // true for own_book in Semester 1
}

export interface SemesterPodcast {
  title: string
  by: string
  url?: string
  cal: string          // Google Calendar event label
}

export interface SemesterCourse {
  title: string
  platform: string     // 'Udemy' | 'Coursera' | 'Harvard Online'
  url: string
}

export type SemesterTheme =
  | 'Foundation'
  | 'Execution'
  | 'Influence'
  | 'Systems'
  | 'Leadership'
  | 'Strategy'
  | 'Mastery'

export interface Semester {
  sem: number          // 1–7
  label: string        // 'Semester 1'
  period: string       // 'Months 1–6'
  year: number         // 1–5
  theme: SemesterTheme
  focus: string
  books: SemesterBook[]
  podcasts: SemesterPodcast[]
  podcast: SemesterPodcast  // kept for backward compat — same as podcasts[0]
  course: SemesterCourse
  altCourses: SemesterCourse[]   // 2 alternatives shown in pick-3 picker
  skill: string        // skill development task
  milestone: string    // deliverable
}

export interface SkillScore {
  skill_name: string
  current_pct: number
  target_pct: number
}

export interface SkillDimension {
  dimension: 'technical' | 'communication' | 'thinking'
  scores: SkillScore[]
}

export type SkillDimensionKey = 'technical' | 'communication' | 'thinking'

export const SKILL_CATALOG: Record<SkillDimensionKey, string[]> = {
  technical: [
    'P&L Ownership',
    'Data Analysis',
    'Technical Depth',
    'Market Research',
    'Product Strategy',
    'Financial Modelling',
    'Risk Frameworks',
    'Systems Design',
    'Regulatory & Compliance',
    'Project Delivery',
  ],
  communication: [
    'Executive Storytelling',
    'Stakeholder Influence',
    'Public Speaking',
    'Negotiation',
    'Written Clarity',
    'Board Presentations',
    'Feedback Delivery',
    'Media & PR',
    'Cross-cultural Collaboration',
    'Active Listening',
  ],
  thinking: [
    'Strategic Vision',
    'Systems Thinking',
    'First Principles',
    'Decision Frameworks',
    'Long-Term Planning',
    'Scenario Analysis',
    'Creative Problem Solving',
    'Mental Models',
    'Ethical Reasoning',
    'Organisational Design',
  ],
}

export interface ChecklistItem {
  id: string
  requirement_id: string
  dimension: SkillDimensionKey
  label: string
  completed: boolean
  completed_at?: string
}
