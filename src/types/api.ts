import type { SkillGap } from './mentor'

export interface AssessmentRequest {
  profileText: string
  mentorId: string
}

export interface AssessmentResponse {
  headline: string
  currentLevel: string
  targetLevel: string
  gaps: SkillGap[]
  strengths: string[]
  yearOneAction: string
  mentorParallel: string
}

export interface LinkedInExtractRequest {
  profileText: string
}

export interface LinkedInExtractResponse {
  name: string
  title: string
  company: string
  category: string
  skills: string[]
  summary: string
}

export interface ActionResult<T = void> {
  success: boolean
  data?: T
  error?: string
}
