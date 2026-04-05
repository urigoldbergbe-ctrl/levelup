import type { GapAnalysisOutput } from '../types'
import type { Leader } from '@/types'
import { SKILL_CATALOG } from '@/types'
import type { LeaderSkillScore } from '@/features/admin/actions'

export interface SkillScoringInput {
  profileText: string
  assessment: GapAnalysisOutput
  mentor: Pick<Leader, 'name' | 'title' | 'company' | 'skills' | 'career_ladder'>
  /** Pre-set by admin in the leader profile. When present, used directly as target_pct. */
  leaderSkillScores?: LeaderSkillScore[]
}

/** Maps a 1-5 star leader rating to a target percentage */
const STAR_TO_PCT: Record<number, number> = { 1: 20, 2: 40, 3: 60, 4: 80, 5: 95 }

export function buildSkillScoringPrompt(input: SkillScoringInput): string {
  const { profileText, assessment, mentor, leaderSkillScores } = input

  // Pre-compute target_pct from admin-set scores (if available)
  const adminTargetMap: Record<string, number> = {}
  for (const entry of leaderSkillScores ?? []) {
    adminTargetMap[entry.skill_name] = STAR_TO_PCT[entry.stars] ?? 60
  }

  const ladderStr = mentor.career_ladder
    .map(r => `  ${r.years}: ${r.title} at ${r.co} (${r.yoe})`)
    .join('\n')

  const catalogStr = Object.entries(SKILL_CATALOG)
    .map(([dim, skills]) =>
      `${dim.toUpperCase()}:\n${skills.map(s => {
        const preset = adminTargetMap[s]
        return `  - ${s}${preset !== undefined ? ` [LEADER TARGET: ${preset}%]` : ''}`
      }).join('\n')}`
    )
    .join('\n\n')

  const gapsStr = assessment.gaps
    .map(g => `  - ${g.skill} [${g.category}]: ${g.why}`)
    .join('\n')

  const strengthsStr = assessment.strengths.map(s => `  - ${s}`).join('\n')

  return `You are an expert career coach scoring a professional's skills.

CONTEXT — CHOSEN LEADER: ${mentor.name} (${mentor.title} at ${mentor.company})
Leader's core skills: ${mentor.skills.join(', ')}
Leader's career ladder:
${ladderStr}

AI GAP ANALYSIS ALREADY RUN:
Current level: ${assessment.currentLevel}
Target level (5-year): ${assessment.targetLevel}
Identified gaps:
${gapsStr}
Identified strengths:
${strengthsStr}

USER PROFILE TEXT:
${profileText}

SKILL CATALOG TO SCORE:
${catalogStr}

TASK:
Score every skill in the catalog. For each skill provide:
- current_pct (0–100): Evidence-based score from the user's profile text only.
  * 70–100: Profile clearly demonstrates this skill (specific roles, achievements, responsibilities)
  * 40–69: Profile mentions it or implies it through related experience
  * 10–39: Little or no direct evidence in the profile
  * Use the gap analysis gaps to further lower scores on gap skills
  * Use the strengths to further raise scores on strength-aligned skills

- target_pct (0–100): The benchmark this user must reach to follow ${mentor.name}'s path.
  * If the skill has a [LEADER TARGET: X%] annotation above, use EXACTLY that value — the admin set it explicitly.
  * For skills without an annotation, infer the target from ${mentor.name}'s known strengths: central skills 80–90, secondary 60–75, peripheral 45–60.

RULES:
- Only use evidence explicitly present in the profile text for current_pct
- Do NOT average everyone to the same scores — differentiate based on what is actually written
- target_pct must reflect ${mentor.name}'s specific career requirements, not a generic leader bar
- Return ONLY valid JSON, no markdown, no explanation

Return this exact JSON shape:
{
  "scores": [
    {
      "dimension": "technical" | "communication" | "thinking",
      "skill_name": "<exact skill name from catalog>",
      "current_pct": <number 0–100>,
      "target_pct": <number 0–100>,
      "evidence": "<one sentence: what in the profile justifies current_pct, or 'No evidence found'>"
    }
  ]
}

The scores array must contain exactly ${Object.values(SKILL_CATALOG).flat().length} items — one per skill in the catalog.`
}
