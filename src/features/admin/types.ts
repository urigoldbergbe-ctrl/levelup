/** Shared types and constants for admin features. NOT a server action file. */

export interface LeaderSkillScore {
  skill_name: string
  dimension: 'technical' | 'communication' | 'thinking'
  /** 1–5 stars. Maps to 20/40/60/80/95% */
  stars: number
}

/** Maps a 1–5 star rating to a target percentage */
export const STAR_TO_PCT: Record<number, number> = { 1: 20, 2: 40, 3: 60, 4: 80, 5: 95 }

export interface LeaderFormData {
  name: string
  title: string
  company: string
  category: string
  /** Optional extra filter tags on the mentor grid */
  category2?: string | null
  category3?: string | null
  /** Short bio (mentor card hover / catalog) */
  bio?: string
  quote: string
  photoUrl: string
  spotifyUrl: string
  /** CV / bio text — stored for gap analysis and AI skill suggestions */
  cvText?: string
  /** Free-text list kept for backward compat / AI curriculum context */
  skills: string[]
  /** Structured skill ratings — one entry per rated skill */
  skillScores: LeaderSkillScore[]
  books: Array<{ title: string; author: string; url: string; why: string }>
  newsAlerts: string[]
}

export interface CatalogBook {
  id: string
  title: string
  author: string
  url: string
  description: string
}

export interface CatalogPodcast {
  id: string
  title: string
  show: string
  url: string
  description: string
}

export interface CatalogCourse {
  id: string
  title: string
  platform: string
  url: string
  description: string
  level: 'beginner' | 'intermediate' | 'advanced'
}

export interface LeaderCatalog {
  books: CatalogBook[]
  podcasts: CatalogPodcast[]
  courses: CatalogCourse[]
  newsAlerts: string[]
}
