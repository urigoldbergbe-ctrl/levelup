import { getAnthropicClient, AI_MODEL } from '../client'
import { buildSkillScoringPrompt, type SkillScoringInput } from '../prompts/skill-scoring.v1'
export type { SkillScoringInput }

export interface ScoredSkill {
  dimension: 'technical' | 'communication' | 'thinking'
  skill_name: string
  current_pct: number
  next_role_pct: number
  target_pct: number
  evidence: string
}

export interface SkillScoringOutput {
  scores: ScoredSkill[]
}

export async function runSkillScoring(input: SkillScoringInput): Promise<SkillScoringOutput> {
  const client = getAnthropicClient()
  const prompt = buildSkillScoringPrompt(input)

  const response = await client.messages.create({
    model: AI_MODEL,
    max_tokens: 4096,
    messages: [{ role: 'user', content: prompt }],
  })

  const block = response.content[0]
  if (block.type !== 'text') throw new Error('Unexpected response type from Claude')

  // Strip any markdown code fences Claude may add
  const raw = block.text.trim()
  const jsonText = raw
    .replace(/^```(?:json)?\s*/m, '')
    .replace(/\s*```\s*$/m, '')
    .trim()

  let parsed: SkillScoringOutput
  try {
    parsed = JSON.parse(jsonText) as SkillScoringOutput
  } catch {
    // Try to extract JSON object from within surrounding prose
    const match = jsonText.match(/\{[\s\S]*\}/)
    if (!match) throw new Error(`Failed to parse skill scoring response: ${jsonText.slice(0, 300)}`)
    try {
      parsed = JSON.parse(match[0]) as SkillScoringOutput
    } catch {
      throw new Error(`Failed to parse extracted JSON: ${match[0].slice(0, 300)}`)
    }
  }

  if (!parsed.scores || parsed.scores.length === 0) {
    throw new Error('Skill scoring returned no scores')
  }

  // Clamp all values to valid range and fill missing fields
  parsed.scores = parsed.scores.map(s => {
    const current = Math.max(0, Math.min(100, Math.round(Number(s.current_pct) || 20)))
    const target  = Math.max(0, Math.min(100, Math.round(Number(s.target_pct)  || 70)))
    // next_role_pct: clamp between current and target (or derive if missing)
    const nextRaw = Number(s.next_role_pct)
    const next = nextRaw > 0
      ? Math.max(current, Math.min(target, Math.round(nextRaw)))
      : Math.round(current + (target - current) * 0.45)

    return {
      ...s,
      dimension: (s.dimension ?? 'technical') as ScoredSkill['dimension'],
      skill_name: s.skill_name ?? 'Unknown',
      current_pct: current,
      next_role_pct: next,
      target_pct: target,
      evidence: s.evidence ?? '',
    }
  })

  return parsed
}
