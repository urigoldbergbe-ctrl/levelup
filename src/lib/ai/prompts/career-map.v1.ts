import type { GapAnalysisOutput } from '../types'
import type { Leader } from '@/types'

export interface CareerMapRole {
  id: string
  title: string
  companies: string[]
  yearsToReach: string
  skills: Array<{ name: string; requiredPct: number }>
  requirements: string[]
}

export interface CareerMapPath {
  id: string
  name: string
  description: string
  roles: CareerMapRole[]
}

export interface CareerMapOutput {
  currentRole: string
  goalRole: string
  paths: CareerMapPath[]
}

export interface CareerMapInput {
  profileText: string
  assessment: GapAnalysisOutput
  mentor: Pick<Leader, 'name' | 'title' | 'company' | 'career_ladder'>
  skillScores?: Array<{ skill_name: string; current_pct: number; target_pct: number; dimension: string }>
}

export function buildCareerMapPrompt(input: CareerMapInput): string {
  const { profileText, assessment, mentor, skillScores } = input

  const ladderStr = (mentor.career_ladder ?? [])
    .map(r => `  ${r.years}: ${r.title} at ${r.co} (${r.yoe})`)
    .join('\n')

  const topGaps = assessment.gaps
    .slice(0, 5)
    .map(g => `  - ${g.skill}: ${g.why}`)
    .join('\n')

  const topStrengths = assessment.strengths.slice(0, 4).join(', ')

  const skillSummary = skillScores
    ? skillScores
        .sort((a, b) => (b.current_pct - b.target_pct) - (a.current_pct - a.target_pct))
        .slice(0, 8)
        .map(s => `  ${s.skill_name}: ${s.current_pct}% (target: ${s.target_pct}%)`)
        .join('\n')
    : 'Not available'

  return `You are an expert executive career coach creating a personalised career map for a professional.

ABOUT THE USER:
Current level: ${assessment.currentLevel}
Target (5-year goal): ${assessment.targetLevel}
Top strengths: ${topStrengths}
Key gaps:
${topGaps}

Top skill scores:
${skillSummary}

USER PROFILE TEXT:
${profileText.slice(0, 1500)}

ROLE MODEL THEY ASPIRE TO FOLLOW:
${mentor.name} — ${mentor.title} at ${mentor.company}
Career ladder example:
${ladderStr}

TASK:
Create 2 distinct career paths this person can take to reach their goal.
Each path should reflect a genuinely different strategic direction (e.g., "Build → Lead" vs "Influence → Scale", or "Technical depth" vs "P&L ownership").

Rules:
- Each path must have exactly 4 named roles in ascending seniority
- Role titles must be REAL, specific job titles found on LinkedIn/job boards (not generic)
- Each role must list 2–4 real companies where this role commonly exists (tech, consulting, fintech, etc.)
- Each role must list 3–4 concrete requirements: specific deliverables, team sizes, metrics, or outcomes the person must demonstrate
- Each role must list 3–5 skills from this catalog: P&L Ownership, Data Analysis, Technical Depth, Market Research, Product Strategy, Financial Modelling, Risk Frameworks, Systems Design, Regulatory & Compliance, Project Delivery, Executive Storytelling, Stakeholder Influence, Public Speaking, Negotiation, Written Clarity, Board Presentations, Feedback Delivery, Media & PR, Cross-cultural Collaboration, Active Listening, Strategic Vision, Systems Thinking, First Principles, Decision Frameworks, Long-Term Planning, Scenario Analysis, Creative Problem Solving, Mental Models, Ethical Reasoning, Organisational Design
- requiredPct for each skill should be the MINIMUM % needed to qualify for that role (0–100)
- yearsToReach is from TODAY (e.g., "12–18 months", "2–3 years")
- The LAST role in every path converges on the same goal role (the user's 5-year target)
- Generate unique, specific content based on this person's actual profile — NOT generic advice

Return ONLY valid JSON, no markdown, no explanation:
{
  "currentRole": "<specific current role title inferred from profile>",
  "goalRole": "<specific 5-year target role title>",
  "paths": [
    {
      "id": "path-1",
      "name": "<2-3 word path name, e.g. 'Strategic Operator'>",
      "description": "<one sentence describing this path's distinctive angle>",
      "roles": [
        {
          "id": "p1-r1",
          "title": "<exact job title>",
          "companies": ["Company A", "Company B", "Company C"],
          "yearsToReach": "<e.g. '12–18 months'>",
          "skills": [
            { "name": "<skill from catalog>", "requiredPct": <number 40-90> }
          ],
          "requirements": [
            "<specific, measurable requirement 1>",
            "<specific, measurable requirement 2>",
            "<specific, measurable requirement 3>"
          ]
        }
      ]
    }
  ]
}`
}
