import type { GapAnalysisOutput } from '../types'
import type { Leader } from '@/types'
import { SKILL_CATALOG } from '@/types'
import type { LeaderSkillScore } from '@/features/admin/types'

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

  const ladder = mentor.career_ladder ?? []
  const currentRung = ladder[0]
  const nextRung = ladder[1]
  const peakRung = ladder[ladder.length - 1]

  const ladderStr = ladder
    .map((r, i) => `  Step ${i + 1}: ${r.title} at ${r.co} (${r.yoe}) — ${r.years}`)
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

  return `You are an expert executive career coach performing a rigorous, evidence-based skill assessment.

═══════════════════════════════════════════
LEADER BEING EMULATED: ${mentor.name}
Current title: ${mentor.title} at ${mentor.company}
Leader's core skills: ${mentor.skills.join(', ')}

CAREER LADDER (the path the user wants to follow):
${ladderStr}
${nextRung ? `\nNEXT ROLE the user is targeting: ${nextRung.title} at ${nextRung.co}` : ''}
${peakRung ? `PEAK ROLE (5-year goal): ${peakRung.title} at ${peakRung.co}` : ''}
═══════════════════════════════════════════

GAP ANALYSIS ALREADY COMPLETED:
  Current level: ${assessment.currentLevel}
  5-year target: ${assessment.targetLevel}
  Identified GAPS (skills the user is WEAK in — score these LOWER in current_pct):
${gapsStr}
  Identified STRENGTHS (skills the user is STRONG in — score these HIGHER in current_pct):
${strengthsStr}

USER PROFILE TEXT (the ONLY source for current_pct scoring):
───────────────────────────────────────────
${profileText}
───────────────────────────────────────────

SKILL CATALOG TO SCORE:
${catalogStr}

═══════════════════════════════════════════
SCORING INSTRUCTIONS
═══════════════════════════════════════════

For EACH skill, return THREE values:

1. current_pct (0–100) — WHERE THE USER IS NOW:
   Read the profile text carefully. Score based ONLY on explicit evidence:
   • 75–100 = Profile has SPECIFIC examples: named projects, metrics, team sizes, revenue figures, clear ownership of this skill
   • 50–74  = Profile mentions this skill or role implies it, but lacks specific proof
   • 25–49  = Tangential or indirect evidence only — the role might require it but it is not evidenced
   • 0–24   = No evidence at all, OR this skill is listed as a GAP in the analysis above
   
   CRITICAL: Skills listed in GAPS above MUST score below 45. Skills listed as STRENGTHS MUST score above 55.
   CRITICAL: Do NOT give similar scores to all skills. The spread across all 30 skills MUST be at least 40 points (e.g., some at 15, some at 70).

2. next_role_pct (0–100) — MINIMUM NEEDED FOR THE NEXT ROLE (${nextRung?.title ?? 'next step'}):
   What is the MINIMUM level this skill must reach for the user to be hired/promoted to ${nextRung?.title ?? 'the next role'}?
   • Core skills for that role: 60–75%
   • Important but secondary skills: 45–60%
   • Nice-to-have skills: 30–45%
   This must ALWAYS be higher than current_pct if there is a gap, and lower than target_pct.

3. target_pct (0–100) — WHAT ${mentor.name.toUpperCase()} REQUIRES AT THE PEAK:
   • If the skill has [LEADER TARGET: X%] above → use EXACTLY that value
   • Core skills that define ${mentor.name}'s career: 80–95%
   • Important supporting skills: 65–80%
   • Peripheral skills: 45–65%

RULES — non-negotiable:
• current_pct must be based SOLELY on explicit profile text evidence
• next_role_pct must be BETWEEN current_pct and target_pct (or equal if already at/above target)
• target_pct must reflect ${mentor.name}'s SPECIFIC path, not a generic bar
• NEVER use 20% or 80% as defaults — every score must be individually justified
• The spread of current_pct scores MUST be wide — avoid bunching all skills around the same number
• Return ONLY valid JSON — no markdown, no explanation

Return this EXACT JSON shape:
{
  "scores": [
    {
      "dimension": "technical" | "communication" | "thinking",
      "skill_name": "<exact skill name from catalog>",
      "current_pct": <number 0–100>,
      "next_role_pct": <number 0–100>,
      "target_pct": <number 0–100>,
      "evidence": "<one specific sentence quoting or referencing what in the profile justifies current_pct — or 'No evidence found in profile'>"
    }
  ]
}

The scores array MUST contain exactly ${Object.values(SKILL_CATALOG).flat().length} items — one per skill.`
}
