import type { Leader, SkillGap } from '@/types'

// ── Gap Analysis ─────────────────────────────────────────────────────────────

export interface GapAnalysisInput {
  profileText: string
  mentor: Pick<Leader, 'id' | 'name' | 'title' | 'company' | 'skills' | 'career_ladder'>
  /** Leader's own CV / bio text — when provided, comparison is user-CV vs leader-CV */
  leaderCvText?: string
}

export interface GapAnalysisOutput {
  headline: string
  currentLevel: string
  targetLevel: string
  gaps: SkillGap[]
  strengths: string[]
  yearOneAction: string
  mentorParallel: string
}

// ── LinkedIn Extraction ───────────────────────────────────────────────────────

export interface LinkedInExtractInput {
  profileText: string
}

export interface LinkedInExtractOutput {
  name: string
  title: string
  company: string
  category: string
  skills: string[]
  summary: string
}

// ── Mentor Q&A ────────────────────────────────────────────────────────────────

export interface MentorQAInput {
  question: string
  mentor: Pick<Leader, 'name' | 'title' | 'company'>
  mentorQuote: string
}

export interface MentorQAOutput {
  answer: string
  disclaimer: string
}
