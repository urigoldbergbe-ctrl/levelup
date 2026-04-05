import type { GapAnalysisInput } from '../types'

export function buildGapAnalysisPrompt(input: GapAnalysisInput): string {
  const { profileText, mentor } = input
  const ladderTop = mentor.career_ladder[mentor.career_ladder.length - 1]

  return `You are a world-class executive career coach with deep knowledge of the career trajectories of global leaders. Analyse the user's profile against the mentor's trajectory and return a structured JSON gap analysis. Be specific, direct, and actionable. Never fabricate qualifications or achievements. Return ONLY valid JSON — no markdown fences.

MENTOR: ${mentor.name} — ${mentor.title} at ${mentor.company}
MENTOR CORE SKILLS: ${mentor.skills.join(', ')}
MENTOR PEAK ROLE: ${ladderTop.title} at ${ladderTop.co}

USER PROFILE:
${profileText}

Return this exact JSON shape:
{
  "headline": "<one sharp sentence summarising the user's situation, max 18 words>",
  "currentLevel": "<career stage in 2–4 words>",
  "targetLevel": "<realistic 5-year destination in 3–5 words>",
  "gaps": [
    { "skill": "<skill name>", "why": "<specific reason this gap matters>", "category": "Technical" | "Communication" | "Thinking" }
  ],
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "yearOneAction": "<single most important year-1 focus>",
  "mentorParallel": "<one sentence connecting ${mentor.name}'s path to the user's situation>"
}

Rules:
- gaps must contain exactly 3 items
- strengths must contain exactly 3 items
- category must be one of: Technical, Communication, Thinking
- Never invent qualifications or credentials the user didn't mention`
}
