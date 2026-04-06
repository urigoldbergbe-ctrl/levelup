import type { GapAnalysisInput } from '../types'

export function buildGapAnalysisPrompt(input: GapAnalysisInput): string {
  const { profileText, mentor, leaderCvText } = input
  const ladderTop = mentor.career_ladder?.at(-1)

  const leaderContext = leaderCvText
    ? `LEADER PROFILE (actual CV / bio):
${leaderCvText.slice(0, 4000)}

Use this leader profile as the direct benchmark — compare the user's experience, skills, and trajectory against the leader's actual documented career path.`
    : `MENTOR KNOWN SKILLS: ${mentor.skills.join(', ')}
${ladderTop ? `MENTOR PEAK ROLE: ${ladderTop.title} at ${ladderTop.co}` : ''}

No leader CV is available. Base the benchmark on the leader's publicly known career and the skill list above.`

  return `You are a world-class executive career coach. Analyse the user's profile against the chosen leader's career and return a structured JSON gap analysis.

LEADER: ${mentor.name} — ${mentor.title} at ${mentor.company}

${leaderContext}

USER PROFILE:
${profileText}

Return this exact JSON shape:
{
  "headline": "<one sharp sentence summarising the user's situation, max 18 words>",
  "currentLevel": "<career stage in 2–4 words>",
  "targetLevel": "<realistic long-term destination in 3–5 words>",
  "gaps": [
    { "skill": "<skill name>", "why": "<specific reason this gap matters — written conversationally using 'your' not 'the profile', e.g. 'Your background in X shows strong Y, but your experience with Z is limited'>", "category": "Technical" | "Communication" | "Thinking" }
  ],
  "strengths": ["<strength 1 — use 'your' voice, e.g. 'Your ability to...'>", "<strength 2>", "<strength 3>"],
  "yearOneAction": "<single most important immediate focus for THIS user — conversational, use 'your' or 'you'>",
  "mentorParallel": "<one sentence connecting ${mentor.name}'s path to the user's actual situation — factual, no quote marks>"
}

STRICT RULES — violation will break the application:
- gaps must contain exactly 3 items
- strengths must contain exactly 3 items
- category must be one of: Technical, Communication, Thinking
- Return ONLY valid JSON — no markdown fences, no explanation outside the JSON

HONESTY RULES — these are non-negotiable:
- Only reference roles, skills, companies, and achievements that are explicitly stated in the USER PROFILE above
- Do NOT guess, infer, or invent anything about the user's background
- Do NOT assume their job title, industry, or experience level if it is not written in the profile
- If the profile is too vague to identify specific strengths, list only what can be reasonably inferred from what IS written
- Every gap and strength must be directly grounded in the provided text — no generic advice`
}
