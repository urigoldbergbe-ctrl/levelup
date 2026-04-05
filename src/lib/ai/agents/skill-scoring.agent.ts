import { getAnthropicClient, AI_MODEL } from '../client'
import { buildSkillScoringPrompt, type SkillScoringInput } from '../prompts/skill-scoring.v1'
export type { SkillScoringInput }

export interface ScoredSkill {
  dimension: 'technical' | 'communication' | 'thinking'
  skill_name: string
  current_pct: number
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
    max_tokens: 2048,
    messages: [{ role: 'user', content: prompt }],
  })

  const block = response.content[0]
  if (block.type !== 'text') throw new Error('Unexpected response type from Claude')

  const jsonText = block.text.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim()

  let parsed: SkillScoringOutput
  try {
    parsed = JSON.parse(jsonText) as SkillScoringOutput
  } catch {
    throw new Error(`Failed to parse skill scoring response: ${jsonText.slice(0, 200)}`)
  }

  if (!parsed.scores || parsed.scores.length === 0) {
    throw new Error('Skill scoring returned no scores')
  }

  // Clamp values to valid range
  parsed.scores = parsed.scores.map(s => ({
    ...s,
    current_pct: Math.max(0, Math.min(100, Math.round(s.current_pct))),
    target_pct: Math.max(0, Math.min(100, Math.round(s.target_pct))),
  }))

  return parsed
}
